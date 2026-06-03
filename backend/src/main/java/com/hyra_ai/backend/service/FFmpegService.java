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
    private final com.hyra_ai.backend.service.impl.CloudflareStorageService cloudflareStorageService;

    public void mergeMediaFiles(MegaTask megaTask) {
        try {
            log.info("==> Bắt đầu quy trình FFmpeg cho MegaTask: {}", megaTask.getId());
            megaTask.setStatus("MERGING");
            megaTask.setProgress(70);
            megaTaskRepository.save(megaTask);

            Path videoFile = cloudflareStorageService.downloadToTempFile(megaTask.getSwapResultUrl());
            Path audioFile = cloudflareStorageService.downloadToTempFile(megaTask.getXttsResultUrl());
            Path srtFile = cloudflareStorageService.downloadToTempFile(megaTask.getSrtResultUrl());

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("video_file", new FileSystemResource(videoFile))
                   .filename(videoFile.getFileName().toString());
            builder.part("audio_file", new FileSystemResource(audioFile))
                   .filename(audioFile.getFileName().toString());
            builder.part("subtitle_file", new FileSystemResource(srtFile))
                   .filename(srtFile.getFileName().toString());

            byte[] videoBytes = ffmpegWebClient.post()
                    .uri("/api/v1/process-mobile")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block(Duration.ofMinutes(10));
                    
            Files.deleteIfExists(videoFile);
            Files.deleteIfExists(audioFile);
            Files.deleteIfExists(srtFile);

            if (videoBytes == null || videoBytes.length == 0) {
                throw new IllegalStateException("Dữ liệu video trả về từ FFmpeg bị trống");
            }

            String userId = megaTask.getUser().getId();
            String taskId = megaTask.getId();
            String finalFileName = "final_mega_" + taskId + ".mp4";
            
            String r2Url = cloudflareStorageService.uploadBytes(videoBytes, userId + "/MegaTask/" + taskId, finalFileName);

            megaTask.setFinalResultUrl(r2Url);
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
