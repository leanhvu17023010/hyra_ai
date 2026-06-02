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

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class XttsService {

    XttsTaskRepository xttsTaskRepository;
    UserRepository userRepository;
    WebClient xttsWebClient;

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
        try {
            log.info("==> Bắt đầu quy trình XTTS cho Task: {}", task.getId());
            task.setStatus("Processing");
            xttsTaskRepository.save(task);

            if (task.getSpeakerWav() == null) {
                throw new IllegalStateException("Không tìm thấy file giọng nói mẫu cho task");
            }

            // 1. Lấy đường dẫn file vật lý của speaker_wav
            String speakerWavUrl = task.getSpeakerWav().getUrl();
            String relativePath = speakerWavUrl.substring(9); // Cắt bỏ "/uploads/"
            Path voiceFile = Paths.get("uploads", relativePath);

            // 2. Tạo thư mục tạm thời cho task nếu chưa có
            String userId = task.getUser().getId();
            String taskId = task.getId();
            Path taskDir = Paths.get("uploads", userId, "XttsTask", taskId);
            if (!Files.exists(taskDir)) {
                Files.createDirectories(taskDir);
            }

            // 3. Tạo file text.txt từ chuỗi văn bản
            Path textFile = taskDir.resolve("text.txt");
            String textContent = task.getText() != null ? task.getText() : "";
            if (textContent.trim().isEmpty()) {
                throw new IllegalStateException("Nội dung văn bản (text) không được để trống");
            }
            Files.writeString(textFile, textContent);

            // 4. Chuẩn bị MultipartBody gửi sang XTTS
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("text_file", new FileSystemResource(textFile));
            builder.part("speaker_wav", new FileSystemResource(voiceFile));
            builder.part("language", task.getLanguage());

            // 5. Gọi sang API XTTS
            byte[] bytes = xttsWebClient.post()
                    .uri("/tts_to_audio/") // Thêm dấu gạch chéo cuối để tránh lỗi 307 Redirect của FastAPI
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block(Duration.ofMinutes(10));

            if (bytes == null || bytes.length == 0) {
                throw new IllegalStateException("Dữ liệu âm thanh từ XTTS bị trống");
            }

            // 6. Ghi file kết quả vật lý
            Path resultPath = taskDir.resolve("result.wav");
            Files.write(resultPath, bytes);

            // 7. Cập nhật kết quả vào DB
            task.setResultUrl("/uploads/" + userId + "/XttsTask/" + taskId + "/result.wav");
            task.setStatus("Complete");
            task.setProgress(100);
            xttsTaskRepository.save(task);
            log.info("==> XTTS hoàn tất, file âm thanh được lưu tại: {}", task.getResultUrl());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý XTTS cho task: " + task.getId(), e);
            task.setStatus("Failed");
            xttsTaskRepository.save(task);
        }
    }
}
