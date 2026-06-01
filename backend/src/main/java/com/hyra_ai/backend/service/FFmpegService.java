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

@Service
@RequiredArgsConstructor
@Slf4j
public class FFmpegService {
    private final WebClient ffmpegWebClient;
    private final MegaTaskRepository megaTaskRepository;

    public void mergeMediaFiles(MegaTask megaTask) {
        try {
            log.info("==> Bắt đầu quy trình FFmpeg cho MegaTask: {}", megaTask.getId());
            megaTask.setStatus("MERGING");
            megaTask.setProgress(70);
            megaTaskRepository.save(megaTask);

            Path videoFile = Paths.get("uploads", megaTask.getSwapResultUrl().substring(9));
            Path audioFile = Paths.get("uploads", megaTask.getXttsResultUrl().substring(9));
            Path srtFile = Paths.get("uploads", megaTask.getSrtResultUrl().substring(9));

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("video_file", new FileSystemResource(videoFile));
            builder.part("audio_file", new FileSystemResource(audioFile));
            builder.part("subtitle_file", new FileSystemResource(srtFile));

            byte[] videoBytes = ffmpegWebClient.post()
                    .uri("/api/v1/process-mobile")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block(Duration.ofMinutes(10));

            if (videoBytes == null || videoBytes.length == 0) {
                throw new IllegalStateException("Dữ liệu video trả về từ FFmpeg bị trống");
            }

            String userId = megaTask.getUser().getId();
            String taskId = megaTask.getId();
            Path resultsDir = Paths.get("uploads", userId, "MegaTask", taskId);
            if (!Files.exists(resultsDir)) {
                Files.createDirectories(resultsDir);
            }
            String finalFileName = "final_mega_" + taskId + ".mp4";
            Path resultPath = resultsDir.resolve(finalFileName);
            
            Files.write(resultPath, videoBytes);

            megaTask.setFinalResultUrl("/uploads/" + userId + "/MegaTask/" + taskId + "/" + finalFileName);
            megaTask.setProgress(100);
            megaTask.setStatus("COMPLETED");
            megaTaskRepository.save(megaTask);
            log.info("==> FFmpeg hoàn tất, kết quả cuối cùng lưu tại: {}", megaTask.getFinalResultUrl());

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException wce) {
            log.error("Lỗi HTTP từ máy FFmpeg ({}): {}", wce.getStatusCode(), wce.getResponseBodyAsString());
            megaTask.setStatus("FAILED");
            megaTaskRepository.save(megaTask);
            throw new RuntimeException("FFmpeg processing failed: " + wce.getResponseBodyAsString(), wce);
        } catch (Exception e) {
            log.error("Lỗi trong quá trình xử lý FFmpeg: ", e);
            megaTask.setStatus("FAILED");
            megaTaskRepository.save(megaTask);
            throw new RuntimeException("FFmpeg processing failed", e);
        }
    }
}
