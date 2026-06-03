package com.hyra_ai.backend.service;

import com.hyra_ai.backend.dto.response.ProcessResponse;
import com.hyra_ai.backend.dto.response.TaskStatusResponse;
import com.hyra_ai.backend.entity.SwapTask;
import com.hyra_ai.backend.repository.SwapTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.ssl.SslProperties;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
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
    private final com.hyra_ai.backend.service.impl.CloudflareStorageService cloudflareStorageService;

    @Async
    public void sendtoFaceFusion(SwapTask swapTask) {
        try {
            log.info("==> Bắt đầu quy trình FaceFusion cho Task: {}", swapTask.getId());

            // 1. Lấy đường dẫn file vật lý (Ưu tiên Audio nếu có, nếu không thì lấy Ảnh)
            String sourceUrl;
            String processorType;

            if (swapTask.getAudioMedia() != null) {
                sourceUrl = swapTask.getAudioMedia().getUrl();
                processorType = "lip_syncer";
                log.info("Chế độ: Lip Sync (Audio)");
            } else {
                sourceUrl = swapTask.getSourceImage().getUrl();
                processorType = "face_swapper";
                log.info("Chế độ: Face Swap (Image)");
            }
            
            String targetUrl = swapTask.getTargetMedia().getUrl();

            Path sourceFile = cloudflareStorageService.downloadToTempFile(sourceUrl);
            Path targetFile = cloudflareStorageService.downloadToTempFile(targetUrl);

            // 2. Gửi task sang máy FaceFusion
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("source_file", new FileSystemResource(sourceFile))
                   .filename(sourceFile.getFileName().toString());
            builder.part("target_file", new FileSystemResource(targetFile))
                   .filename(targetFile.getFileName().toString());
            // Truyền đúng processor
            builder.part("processors", processorType);

            ProcessResponse response = faceFusionWebClient.post()
                    .uri("/api/process")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(ProcessResponse.class)
                    .block(Duration.ofMinutes(2));
            
            // Xóa file tạm sau khi đã gửi đi
            Files.deleteIfExists(sourceFile);
            Files.deleteIfExists(targetFile);

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

            String remoteStatus = statusResponse.getStatus();
            if ("complete".equalsIgnoreCase(remoteStatus) || "completed".equalsIgnoreCase(remoteStatus)) {
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
        Integer fromRoot = normalizeProgressValue(statusResponse.getProgress());
        if (fromRoot != null) {
            return fromRoot;
        }
        if (statusResponse.getExtra() == null) {
            return null;
        }
        Map<String, Object> extra = statusResponse.getExtra();
        Integer v = normalizeProgressValue(extra.get("percentage"));
        if (v != null) {
            return v;
        }
        v = normalizeProgressValue(extra.get("progress"));
        if (v != null) {
            return v;
        }
        return normalizeProgressValue(extra.get("percent"));
    }

    /**
     * Chuẩn hoá tiến độ về 0–100: hỗ trợ phân số 0–1, số thực, chuỗi có %, hoặc map current/total.
     */
    private static Integer normalizeProgressValue(Object pct) {
        if (pct == null) {
            return null;
        }
        if (pct instanceof Number n) {
            // JSON số nguyên: coi là phần trăm 0–100. JSON số thực: thường là phân số 0–1.
            if (pct instanceof Double || pct instanceof Float) {
                double v = n.doubleValue();
                if (v >= 0 && v <= 1.0) {
                    v *= 100.0;
                }
                if (Double.isNaN(v) || v < 0) {
                    return null;
                }
                return Math.max(0, Math.min(100, (int) Math.round(v)));
            }
            long v = n.longValue();
            if (v < 0) {
                return null;
            }
            return Math.max(0, Math.min(100, (int) v));
        }
        if (pct instanceof String s && !s.isBlank()) {
            String t = s.trim().replace("%", "");
            try {
                boolean likelyFraction = t.contains(".") || t.contains(",");
                double v = Double.parseDouble(t.replace(',', '.'));
                if (likelyFraction && v >= 0 && v <= 1.0) {
                    v *= 100.0;
                }
                return Math.max(0, Math.min(100, (int) Math.round(v)));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        if (pct instanceof Map<?, ?> m) {
            Object cur = m.get("current");
            Object tot = m.get("total");
            if (cur instanceof Number c && tot instanceof Number totN && totN.doubleValue() > 0) {
                double v = 100.0 * c.doubleValue() / totN.doubleValue();
                return Math.max(0, Math.min(100, (int) Math.round(v)));
            }
            Integer nested = normalizeProgressValue(m.get("value"));
            if (nested != null) {
                return nested;
            }
        }
        return null;
    }

    private static boolean isTransientClientFailure(Throwable e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            String name = t.getClass().getName();
            if (name.contains("PrematureCloseException")
                    || name.contains("NativeIoException")
                    || name.contains("AbortedException")) {
                return true;
            }
            String msg = t.getMessage();
            if (msg != null) {
                String m = msg.toLowerCase();
                if (m.contains("connection reset by peer")
                        || m.contains("connection reset")
                        || m.contains("broken pipe")
                        || m.contains("recvaddress")
                        || m.contains("connection timed out")) {
                    return true;
                }
            }
            String asString = t.toString().toLowerCase();
            if (asString.contains("connection reset") || asString.contains("recvaddress")) {
                return true;
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

        String userId = swapTask.getUser().getId();
        String taskId = swapTask.getId();

        String extension = swapTask.getTargetMedia().getFileType().equalsIgnoreCase("IMAGE") ? ".jpg" : ".mp4";
        String resultFileName = "final_result_" + taskId + extension;
        
        // Tải kết quả lên Cloudflare R2
        String r2Url = cloudflareStorageService.uploadBytes(bytes, userId + "/SwapTask/" + taskId, resultFileName);

        // Cập nhật thông tin đường dẫn mới vào DB
        swapTask.setResultUrl(r2Url);
        swapTask.setStatus("Complete");
        swapTaskRepository.save(swapTask);

        log.info("==> FaceFusion hoàn tất, kết quả lưu tại: {}", swapTask.getResultUrl());
    }
}
