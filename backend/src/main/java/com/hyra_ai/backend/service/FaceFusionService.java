package com.hyra_ai.backend.service;

import com.hyra_ai.backend.dto.response.ProcessResponse;
import com.hyra_ai.backend.dto.response.TaskStatusResponse;
import com.hyra_ai.backend.entity.SwapTask;
import com.hyra_ai.backend.repository.SwapTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class FaceFusionService {
    private final WebClient faceFusionWebClient;
    private final SwapTaskRepository swapTaskRepository;

    @Async
    public void sendtoFaceFusion(SwapTask swapTask) {
        try {
            log.info("==> Bắt đầu quy trình FaceFusion cho Task: {}", swapTask.getId());

            // 1. Lấy đường dẫn file vật lý
            String sourceRelativePath = swapTask.getSourceImage().getUrl().substring(9);
            String targetRelativePath = swapTask.getSourceVideo().getUrl().substring(9);

            Path sourceFile = Paths.get("uploads", sourceRelativePath);
            Path targetFile = Paths.get("uploads", targetRelativePath);

            // 2. Gửi task sang máy FaceFusion
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("source_file", new FileSystemResource(sourceFile));
            builder.part("target_file", new FileSystemResource(targetFile));
            builder.part("processors", "face_swapper");

            ProcessResponse response = faceFusionWebClient.post()
                    .uri("/api/process")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(ProcessResponse.class)
                    .block(Duration.ofMinutes(2));

            if (response == null || !StringUtils.hasText(response.getTaskId())) {
                throw new IllegalStateException("Không nhận được phản hồi hợp lệ từ máy FaceFusion");
            }

            String remoteTaskId = response.getTaskId();
            log.info("Máy FaceFusion đã nhận task, ID: {}", remoteTaskId);

            // Cập nhật trạng thái
            swapTask.setStatus("PROCESSING");
            swapTaskRepository.save(swapTask);

            // 3. Đợi cho đến khi hoàn thành (Polling)
            waitUntilCompleted(remoteTaskId);

            // 4. Tải và lưu kết quả vào thư mục "results" riêng biệt
            saveResult(remoteTaskId, swapTask);

        } catch (Exception e) {
            log.error("Lỗi trong quá trình xử lý FaceFusion: ", e);
            swapTask.setStatus("FAILED");
            swapTaskRepository.save(swapTask);
        }
    }

    private void waitUntilCompleted(String remoteTaskId) throws InterruptedException {
        int maxAttempts = 120; // 10 phút (5s * 120)
        for (int i = 0; i < maxAttempts; i++) {
            Thread.sleep(5000);
            
            TaskStatusResponse status = faceFusionWebClient.get()
                    .uri("/api/status/{taskId}", remoteTaskId)
                    .retrieve()
                    .bodyToMono(TaskStatusResponse.class)
                    .block(Duration.ofSeconds(30));

            String s = (status != null) ? status.getStatus() : "unknown";
            log.info("Trạng thái Task bên máy AI: {}", s);

            if ("completed".equalsIgnoreCase(s)) return;
            if (s.startsWith("failed") || s.startsWith("error")) {
                throw new IllegalStateException("Máy AI báo lỗi xử lý: " + s);
            }
        }
        throw new IllegalStateException("Hết thời gian chờ xử lý từ máy AI");
    }

    private void saveResult(String remoteTaskId, SwapTask swapTask) throws Exception {
        byte[] bytes = faceFusionWebClient.get()
                .uri("/api/download/{taskId}", remoteTaskId)
                .retrieve()
                .bodyToMono(byte[].class)
                .block(Duration.ofMinutes(10));

        if (bytes == null || bytes.length == 0) {
            throw new IllegalStateException("Dữ liệu video tải về bị trống");
        }

        // Tạo thư mục "results" chuyên biệt
        Path resultsDir = Paths.get("uploads", "results");
        if (!Files.exists(resultsDir)) {
            Files.createDirectories(resultsDir);
        }

        // Lưu file kết quả
        String resultFileName = "final_result_" + swapTask.getId() + ".mp4";
        Path resultPath = resultsDir.resolve(resultFileName);
        Files.write(resultPath, bytes);

        // Cập nhật thông tin vào DB
        swapTask.setResultUrl("/uploads/results/" + resultFileName);
        swapTask.setStatus("COMPLETED");
        swapTaskRepository.save(swapTask);

        log.info("==> TẤT CẢ HOÀN TẤT! Kết quả lưu tại: {}", swapTask.getResultUrl());
    }
}
