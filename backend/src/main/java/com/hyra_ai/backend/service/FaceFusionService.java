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
import java.util.Map;

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
            waitUntilCompleted(remoteTaskId, swapTask);

            // 4. Tải và lưu kết quả vào thư mục "results" riêng biệt
            saveResult(remoteTaskId, swapTask);

        } catch (Exception e) {
            log.error("Lỗi trong quá trình xử lý FaceFusion: ", e);
            swapTask.setStatus("FAILED");
            swapTaskRepository.save(swapTask);
        }
    }

    private void waitUntilCompleted(String remoteTaskId, SwapTask swapTask) throws InterruptedException {
        final int maxAttempts = 600; // ~20 phút @ 2s
        int lastLoggedProgress = -1;

        for (int i = 0; i < maxAttempts; i++) {
            Thread.sleep(2000);

            TaskStatusResponse statusResponse = pollStatusWithRetry(remoteTaskId);
            if (statusResponse == null) {
                log.debug("Chưa lấy được /api/status (lỗi mạng tạm thời), sẽ poll tiếp.");
                continue;
            }

            Integer currentProgress = extractProgressPercent(statusResponse);
            if (currentProgress != null && !currentProgress.equals(lastLoggedProgress)) {
                lastLoggedProgress = currentProgress;
                swapTask.setProgress(currentProgress);
                swapTaskRepository.save(swapTask);
                log.info("Tiến độ FaceFusion: {}%", currentProgress);
            }

            if ("complete".equalsIgnoreCase(statusResponse.getStatus())) {
                return;
            }
            if ("failed".equalsIgnoreCase(statusResponse.getStatus())
                    || "error".equalsIgnoreCase(statusResponse.getStatus())) {
                throw new IllegalStateException("FaceFusion báo lỗi: " + statusResponse.getStatus());
            }
        }
        throw new IllegalStateException("Hết thời gian chờ xử lý từ máy AI");
    }

    /**
     * Gọi /api/status có retry nhẹ — lỗi "Connection reset by peer" thường gặp khi pool tái dùng socket đã đóng.
     */
    private TaskStatusResponse pollStatusWithRetry(String remoteTaskId) {
        final int maxRetries = 4;
        for (int r = 0; r < maxRetries; r++) {
            try {
                return faceFusionWebClient
                        .get()
                        .uri("/api/status/{taskId}", remoteTaskId)
                        .retrieve()
                        .bodyToMono(TaskStatusResponse.class)
                        .block(Duration.ofSeconds(45));
            } catch (Exception e) {
                if (!isTransientClientFailure(e)) {
                    log.error("Lỗi không phục hồi được khi gọi FaceFusion /api/status: {}", rootMessage(e));
                    throw new IllegalStateException("Không đọc được trạng thái từ FaceFusion", e);
                }
                if (r == maxRetries - 1) {
                    log.debug(
                            "FaceFusion /api/status lỗi mạng tạm thời sau {} lần ({}), sẽ thử lại ở vòng poll sau.",
                            maxRetries,
                            rootMessage(e));
                    return null;
                }
                try {
                    Thread.sleep(150L * (r + 1));
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return null;
                }
            }
        }
        return null;
    }

    private static Integer extractProgressPercent(TaskStatusResponse statusResponse) {
        if (statusResponse == null) {
            return null;
        }
        if (statusResponse.getProgress() != null) {
            return Math.max(0, Math.min(100, statusResponse.getProgress()));
        }
        if (statusResponse.getExtra() == null) {
            return null;
        }
        Map<String, Object> extra = statusResponse.getExtra();
        Object pct = extra.get("percentage");
        if (pct == null) {
            pct = extra.get("progress");
        }
        if (pct instanceof Number n) {
            return Math.max(0, Math.min(100, n.intValue()));
        }
        if (pct instanceof String s && !s.isBlank()) {
            try {
                return Math.max(0, Math.min(100, Integer.parseInt(s.trim())));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private static boolean isTransientClientFailure(Throwable e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            String name = t.getClass().getName();
            if (name.contains("PrematureCloseException")) {
                return true;
            }
            String msg = t.getMessage();
            if (msg != null) {
                String m = msg.toLowerCase();
                if (m.contains("connection reset by peer")
                        || m.contains("connection reset")
                        || m.contains("broken pipe")
                        || m.contains("recvaddress")) {
                    return true;
                }
            }
        }
        return false;
    }

    private static String rootMessage(Throwable e) {
        Throwable t = e;
        while (t.getCause() != null) {
            t = t.getCause();
        }
        return t.getClass().getSimpleName() + ": " + t.getMessage();
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
