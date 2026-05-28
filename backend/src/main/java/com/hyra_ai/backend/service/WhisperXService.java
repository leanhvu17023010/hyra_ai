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
import java.time.Duration;

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

    public WhisperTask startWhisper(String taskId) {
        WhisperTask task = whisperTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task Whisper với ID: " + taskId));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (task.getUser() == null || !task.getUser().getEmail().equals(email)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        task.setStatus("Processing");
        WhisperTask savedTask = whisperTaskRepository.save(task);
        processWhisperAsync(savedTask);

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
            String relativePath = audioUrl.substring(9); // Cắt bỏ "/uploads/"
            Path audioFile = Paths.get("uploads", relativePath);

            String userId = task.getUser().getId();
            String taskId = task.getId();
            Path taskDir = Paths.get("uploads", userId, "WhisperTask", taskId);
            if (!Files.exists(taskDir)) {
                Files.createDirectories(taskDir);
            }

            // TODO: Mở comment phần gọi WebClient thực tế khi có backend AI sẵn sàng
            /*
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("audio_file", new FileSystemResource(audioFile));

            byte[] srtBytes = whisperXWebClient.post()
                    .uri("/api/transcribe")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block(Duration.ofMinutes(10));
            */

            // TẠM THỜI GIẢ LẬP KẾT QUẢ SRT VÀ TXT
            String srtFileName = "result.srt";
            Path srtResultPath = taskDir.resolve(srtFileName);
            String dummySrtContent = "1\n00:00:00,000 --> 00:00:05,000\n[Nhạc nền]\n\n2\n00:00:05,000 --> 00:00:10,000\nNội dung transcribe giả lập từ audio.\n";
            Files.writeString(srtResultPath, dummySrtContent);

            String txtFileName = "result.txt";
            Path txtResultPath = taskDir.resolve(txtFileName);
            String dummyTxtContent = "Nội dung transcribe giả lập từ audio.";
            Files.writeString(txtResultPath, dummyTxtContent);

            task.setResultSrtUrl("/uploads/" + userId + "/WhisperTask/" + taskId + "/" + srtFileName);
            task.setResultTxtUrl("/uploads/" + userId + "/WhisperTask/" + taskId + "/" + txtFileName);
            
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

            String wavRelativePath = megaTask.getXttsResultUrl().substring(9); // Cắt bỏ "/uploads/"
            Path wavFile = Paths.get("uploads", wavRelativePath);

            // Gửi sang WhisperX (Giả lập request)
            /*
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("audio_file", new FileSystemResource(wavFile));

            byte[] srtBytes = whisperXWebClient.post()
                    .uri("/api/transcribe")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block(Duration.ofMinutes(5));
            */
            
            // TẠM THỜI GIẢ LẬP: Tạo file srt giả để tiếp tục luồng
            String userId = megaTask.getUser().getId();
            String taskId = megaTask.getId();
            Path resultsDir = Paths.get("uploads", userId, "MegaTask", taskId);
            if (!Files.exists(resultsDir)) {
                Files.createDirectories(resultsDir);
            }
            String srtFileName = "subtitle_" + taskId + ".srt";
            Path resultPath = resultsDir.resolve(srtFileName);
            
            String dummySrtContent = "1\n00:00:00,000 --> 00:00:05,000\n[Nhạc nền]\n\n2\n00:00:05,000 --> 00:00:10,000\n" + megaTask.getInputText() + "\n";
            Files.writeString(resultPath, dummySrtContent);
            
            megaTask.setSrtResultUrl("/uploads/" + userId + "/MegaTask/" + taskId + "/" + srtFileName);
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
