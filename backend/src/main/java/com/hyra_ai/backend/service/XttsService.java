package com.hyra_ai.backend.service;

import com.hyra_ai.backend.dto.request.TtsRequest;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.entity.XttsTask;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.repository.UserRepository;
import com.hyra_ai.backend.repository.XttsTaskRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.codec.ServerSentEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.web.reactive.function.client.ExchangeStrategies;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class XttsService {

    XttsTaskRepository xttsTaskRepository;
    UserRepository userRepository;
    WebClient xttsWebClient;
    com.hyra_ai.backend.service.impl.CloudflareStorageService cloudflareStorageService;

    public XttsTask createTask() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        XttsTask task = XttsTask.builder()
                .user(user)
                .status("Pending")
                .createAt(LocalDateTime.now())
                .build();
        return xttsTaskRepository.save(task);
    }

    public void addMediaToTask(String taskId, com.hyra_ai.backend.entity.Media media, String role) {
        XttsTask task = xttsTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy XttsTask với ID: " + taskId));

        task.setSpeakerWav(media);
        xttsTaskRepository.save(task);
    }

    public void attachAndProcess(String taskId, String text, String language,
                                 com.hyra_ai.backend.entity.Media voiceMedia) {
        XttsTask task = xttsTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task XTTS với ID: " + taskId));



        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (task.getUser() == null || !task.getUser().getEmail().equals(email)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        task.setText(text);
        task.setLanguage(language != null ? language : "vi");
        task.setSpeakerWav(voiceMedia);
        task.setStatus("Processing");
        XttsTask savedTask = xttsTaskRepository.save(task);

        java.util.concurrent.CompletableFuture.runAsync(() -> processTts(savedTask));
    }

    public XttsTask startTts(String taskId, TtsRequest request) {
        XttsTask task = xttsTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task XTTS với ID: " + taskId));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (task.getUser() == null || !task.getUser().getEmail().equals(email)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        task.setText(request.getText());
        task.setLanguage(request.getLanguage() != null ? request.getLanguage() : "vi");
        task.setStatus("Processing");

        XttsTask savedTask = xttsTaskRepository.save(task);
        java.util.concurrent.CompletableFuture.runAsync(() -> processTts(savedTask));

        return savedTask;
    }



    @Async
    public void processTts(XttsTask task) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            log.info("==> Bắt đầu quy trình XTTS (SSE Polling) cho Task: {}", task.getId());
            task.setStatus("Processing");
            task.setProgress(0);
            xttsTaskRepository.save(task);

            Path voiceFile = null;
            Path tempFileToDelete = null;

            if (task.getSpeakerWav() == null) {
                log.info("Task {}: Không có file giọng mẫu, tự động sử dụng file mặc định cục bộ", task.getId());
                // Sử dụng file tĩnh lưu cục bộ trên máy chủ Backend
                voiceFile = Paths.get("uploads", "defaults", "default_voice.wav");
                
                if (!Files.exists(voiceFile)) {
                    throw new IllegalStateException("Không tìm thấy file default_voice.wav tại " + voiceFile.toAbsolutePath());
                }
                // File mặc định KHÔNG được phép xóa
                tempFileToDelete = null;
            } else {
                // 1. Tải file từ Cloudflare về máy chủ Java (Temp file)
                String speakerWavUrl = task.getSpeakerWav().getUrl();
                voiceFile = cloudflareStorageService.downloadToTempFile(speakerWavUrl);
                // File tạm từ Cloudflare CẦN phải được xóa sau khi xử lý xong
                tempFileToDelete = voiceFile;
            }

            // (Không cần tạo thư mục uploads cục bộ nữa)
            String userId = task.getUser().getId();
            String taskId = task.getId();

            // 3. Lấy text
            String textContent = task.getText() != null ? task.getText() : "";
            if (textContent.trim().isEmpty()) {
                throw new IllegalStateException("Nội dung văn bản (text) không được để trống");
            }

            // 4. Chuẩn bị MultipartBody gửi sang XTTS theo đúng tài liệu
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("text", textContent);
            builder.part("speaker_file", new FileSystemResource(voiceFile))
                   .filename(voiceFile.getFileName().toString());
            builder.part("language", task.getLanguage());

            // 5. Gọi sang API XTTS (endpoint tts_with_progress không có gạch chéo)
            xttsWebClient.post()
                    .uri("/tts_with_progress")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                    .subscribe(
                            event -> {
                                try {
                                    String jsonData = event.data();
                                    if (jsonData != null) {
                                        JsonNode jsonNode = objectMapper.readTree(jsonData);
                                        if (jsonNode.has("progress")) {
                                            int currentProgress = jsonNode.get("progress").asInt();
                                            log.info("Task {}: Progress {}%", taskId, currentProgress);
                                            
                                            // Cập nhật DB cho Frontend lấy qua API Polling
                                            task.setProgress(currentProgress);
                                            xttsTaskRepository.save(task);

                                            // Nếu xong 100%, kéo file về
                                            if (currentProgress == 100 && jsonNode.has("audio_url")) {
                                                log.info("Task {}: Đã 100%, tiến hành tải file âm thanh từ Python...", taskId);
                                                String audioPath = jsonNode.get("audio_url").asText();
                                                String fullUrl = "http://172.16.1.75:8020" + audioPath;

                                                // Dùng WebClient cấu hình bộ đệm 100MB để lấy file lớn
                                                WebClient fileWebClient = WebClient.builder()
                                                        .exchangeStrategies(ExchangeStrategies.builder()
                                                                .codecs(configurer -> configurer
                                                                        .defaultCodecs()
                                                                        .maxInMemorySize( 100 * 1024 * 1024))
                                                                .build())
                                                        .build();

                                                fileWebClient.get()
                                                        .uri(fullUrl)
                                                        .retrieve()
                                                        .bodyToMono(byte[].class)
                                                        .subscribe(
                                                            audioBytes -> {
                                                                try {
                                                                    if (audioBytes != null && audioBytes.length > 0) {
                                                                        // Tải thẳng lên Cloudflare R2
                                                                        String r2ResultUrl = cloudflareStorageService.uploadBytes(audioBytes, userId + "/XttsTask/" + taskId, "result.wav");

                                                                        task.setResultUrl(r2ResultUrl);
                                                                        task.setStatus("Complete");
                                                                        xttsTaskRepository.save(task);
                                                                        log.info("==> XTTS hoàn tất, file âm thanh được lưu tại: {}", task.getResultUrl());
                                                                    } else {
                                                                        log.error("Không thể tải byte[] từ Python (file trống)");
                                                                    }
                                                                } catch (Exception ex) {
                                                                    log.error("Lỗi khi ghi kết quả XTTS lên R2: ", ex);
                                                                }
                                                            },
                                                            err -> {
                                                                log.error("Lỗi khi tải file âm thanh từ Python: ", err);
                                                            }
                                                        );
                                            }
                                        }
                                    }
                                } catch (Exception e) {
                                    log.error("Lỗi khi xử lý event SSE hoặc tải file cho task: " + taskId, e);
                                    task.setStatus("Failed");
                                    xttsTaskRepository.save(task);
                                }
                            },
                            error -> {
                                log.error("Lỗi gọi luồng SSE XTTS cho task: " + taskId, error);
                                task.setStatus("Failed");
                                xttsTaskRepository.save(task);
                            },
                            () -> {
                                log.info("Task {}: Đóng luồng kết nối SSE.", taskId);
                            }
                    );

            // Dọn dẹp file tạm sau khi đã ném request vào luồng Async
            final Path fileToDelete = tempFileToDelete;
            if (fileToDelete != null) {
                java.util.concurrent.CompletableFuture.runAsync(() -> {
                    try {
                        // Delay 1 chút để WebClient kịp đọc file gửi đi trước khi xoá
                        Thread.sleep(5000);
                        Files.deleteIfExists(fileToDelete);
                    } catch (Exception ignored) {}
                });
            }

        } catch (Exception e) {
            log.error("Lỗi khởi tạo gọi XTTS cho task: " + task.getId(), e);
            task.setStatus("Failed");
            xttsTaskRepository.save(task);
        }
    }
}
