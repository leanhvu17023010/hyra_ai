package com.hyra_ai.backend.service;

import com.hyra_ai.backend.entity.MegaTask;
import com.hyra_ai.backend.repository.MegaTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.io.ByteArrayInputStream;

import com.hyra_ai.backend.entity.Media;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.entity.WhisperTask;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.repository.UserRepository;
import com.hyra_ai.backend.repository.WhisperTaskRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhisperXService {
    private final WebClient whisperXWebClient;
    private final MegaTaskRepository megaTaskRepository;
    private final WhisperTaskRepository whisperTaskRepository;
    private final UserRepository userRepository;
    private final com.hyra_ai.backend.service.impl.CloudflareStorageService cloudflareStorageService;

    public WhisperTask createTask() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        WhisperTask task = WhisperTask.builder()
                .user(user)
                .status("Pending")
                .createAt(LocalDateTime.now())
                .build();
        return whisperTaskRepository.save(task);
    }

    public void addMediaToTask(String taskId, Media media, String role) {
        WhisperTask task = whisperTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy WhisperTask với ID: " + taskId));
        task.setAudioMedia(media);
        whisperTaskRepository.save(task);
    }

    public void attachAndProcess(String taskId, Media audioMedia) {
        WhisperTask task = whisperTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task Whisper với ID: " + taskId));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (task.getUser() == null || !task.getUser().getEmail().equals(email)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        task.setAudioMedia(audioMedia);
        task.setStatus("Processing");
        WhisperTask savedTask = whisperTaskRepository.save(task);

        java.util.concurrent.CompletableFuture.runAsync(() -> processWhisperAsync(savedTask));
    }

    public WhisperTask startWhisper(String taskId) {
        WhisperTask task = whisperTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task Whisper với ID: " + taskId));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (task.getUser() == null || !task.getUser().getEmail().equals(email)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        task.setStatus("Processing");
        WhisperTask savedTask = whisperTaskRepository.save(task);
        java.util.concurrent.CompletableFuture.runAsync(() -> processWhisperAsync(savedTask));

        return savedTask;
    }

    @Async
    public void processWhisperAsync(WhisperTask task) {
        try {
            log.info("==> Bắt đầu quy trình WhisperX cho Task: {}", task.getId());
            task.setStatus("Processing");
            task.setProgress(10);
            whisperTaskRepository.save(task);

            if (task.getAudioMedia() == null) {
                throw new IllegalStateException("Không tìm thấy file audio mẫu cho task");
            }

            String audioUrl = task.getAudioMedia().getUrl();
            Path audioFile = cloudflareStorageService.downloadToTempFile(audioUrl);

            String userId = task.getUser().getId();
            String taskId = task.getId();

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new FileSystemResource(audioFile))
                   .filename(audioFile.getFileName().toString());

            byte[] zipBytes = whisperXWebClient.post()
                    .uri("/transcribe")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block(Duration.ofMinutes(10));

            // Dọn dẹp temp file
            Files.deleteIfExists(audioFile);

            if (zipBytes == null || zipBytes.length == 0) {
                throw new IllegalStateException("Dữ liệu trả về từ WhisperX bị trống");
            }

            // Xử lý giải nén file ZIP và ném lên R2
            try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (!entry.isDirectory()) {
                        String fileName = Paths.get(entry.getName()).getFileName().toString();
                        byte[] fileData = zis.readAllBytes();
                        
                        String r2Url = cloudflareStorageService.uploadBytes(fileData, userId + "/WhisperTask/" + taskId, fileName);
                        
                        if (fileName.endsWith(".srt")) {
                            task.setResultSrtUrl(r2Url);
                        } else if (fileName.endsWith(".txt")) {
                            task.setResultTxtUrl(r2Url);
                        }
                    }
                }
            }
            
            
            task.setStatus("Complete");
            task.setProgress(100);
            whisperTaskRepository.save(task);
            log.info("==> WhisperX hoàn tất, kết quả lưu tại: {} và {}", task.getResultSrtUrl(), task.getResultTxtUrl());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý WhisperX cho task: " + task.getId(), e);
            task.setStatus("Failed");
            whisperTaskRepository.save(task);
        }
    }

    public void processAudioToSrt(MegaTask megaTask) {
        try {
            log.info("==> Bắt đầu quy trình WhisperX cho MegaTask: {}", megaTask.getId());
            megaTask.setStatus("TRANSCRIBING");
            megaTask.setProgress(30); // Giả lập tiến độ
            megaTaskRepository.save(megaTask);

            Path wavFile = cloudflareStorageService.downloadToTempFile(megaTask.getXttsResultUrl());

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new FileSystemResource(wavFile))
                   .filename(wavFile.getFileName().toString());

            if (megaTask.getInputText() != null && !megaTask.getInputText().trim().isEmpty()) {
                builder.part("text", megaTask.getInputText());
            }

            byte[] zipBytes = whisperXWebClient.post()
                    .uri("/transcribe")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block(Duration.ofMinutes(5));

            Files.deleteIfExists(wavFile);

            if (zipBytes == null || zipBytes.length == 0) {
                throw new IllegalStateException("Dữ liệu trả về từ WhisperX bị trống");
            }

            String userId = megaTask.getUser().getId();
            String taskId = megaTask.getId();
            
            // Xử lý giải nén file ZIP và đẩy lên R2
            try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (!entry.isDirectory()) {
                        String fileName = Paths.get(entry.getName()).getFileName().toString();
                        byte[] fileData = zis.readAllBytes();
                        String r2Url = cloudflareStorageService.uploadBytes(fileData, userId + "/MegaTask/" + taskId, fileName);
                        
                        if (fileName.endsWith(".srt")) {
                            megaTask.setSrtResultUrl(r2Url);
                        }
                    }
                }
            }
            
            megaTaskRepository.save(megaTask);
            log.info("==> WhisperX hoàn tất, kết quả lưu tại: {}", megaTask.getSrtResultUrl());

        } catch (Exception e) {
            log.error("Lỗi trong quá trình xử lý WhisperX: ", e);
            megaTask.setStatus("FAILED");
            megaTaskRepository.save(megaTask);
            throw new RuntimeException("WhisperX processing failed", e);
        }
    }
}
