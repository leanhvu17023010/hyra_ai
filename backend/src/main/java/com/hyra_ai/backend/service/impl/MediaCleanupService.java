package com.hyra_ai.backend.service.impl;

import com.hyra_ai.backend.entity.SwapTask;
import com.hyra_ai.backend.repository.MediaRepository;
import com.hyra_ai.backend.repository.SwapTaskRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MediaCleanupService {

    SwapTaskRepository swapTaskRepository;
    com.hyra_ai.backend.repository.XttsTaskRepository xttsTaskRepository;
    com.hyra_ai.backend.repository.WhisperTaskRepository whisperTaskRepository;
    com.hyra_ai.backend.repository.MegaTaskRepository megaTaskRepository;
    MediaRepository mediaRepository;
    com.hyra_ai.backend.service.impl.CloudflareStorageService cloudflareStorageService;

    // Chạy lúc 00:00 mỗi ngày
    @Scheduled(cron = "0 0 0 * * ?")
//    @Scheduled(fixedRate = 10000)
    public void cleanupExpiredTasks() {
        log.info("Bắt đầu job dọn dẹp các task quá hạn...");

        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
        // Lấy tất cả task cũ hơn 3 ngày (tạm bỏ qua vụ filter status ở SQL để debug)
        cleanupSwapTasks(threeDaysAgo);
        cleanupXttsTasks(threeDaysAgo);
        cleanupWhisperTasks(threeDaysAgo);
        cleanupMegaTasks(threeDaysAgo);

        log.info("Job dọn dẹp hoàn tất.");
    }

    private void cleanupSwapTasks(LocalDateTime threshold) {
        List<SwapTask> oldTasks = swapTaskRepository.findByCreateAtBefore(threshold);
        int deletedCount = 0;
        for (SwapTask task : oldTasks) {
            Integer progress = task.getProgress();
            boolean isFailedTask = (progress == null || progress == 0 || "Failed".equalsIgnoreCase(task.getStatus()));

            if ("EXPIRED".equals(task.getStatus()) && !isFailedTask) {
                continue;
            }

            try {
                if (task.getUser() != null) {
                    String prefix = task.getUser().getId() + "/SwapTask/" + task.getId() + "/";
                    cloudflareStorageService.deletePrefix(prefix);
                }

                var sourceImage = task.getSourceImage();
                var targetMedia = task.getTargetMedia();
                var audioMedia = task.getAudioMedia();

                if (isFailedTask) {
                    swapTaskRepository.delete(task);
                } else {
                    task.setSourceImage(null);
                    task.setTargetMedia(null);
                    task.setAudioMedia(null);
                    task.setResultUrl(null);
                    task.setStatus("EXPIRED");
                    swapTaskRepository.save(task);
                }

                if (sourceImage != null) mediaRepository.delete(sourceImage);
                if (targetMedia != null) mediaRepository.delete(targetMedia);
                if (audioMedia != null) mediaRepository.delete(audioMedia);

                deletedCount++;
            } catch (Exception e) {
                log.error("Lỗi khi dọn dẹp SwapTask: {}", task.getId(), e);
            }
        }
        log.info("Đã xử lý {} SwapTasks.", deletedCount);
    }

    private void cleanupXttsTasks(LocalDateTime threshold) {
        List<com.hyra_ai.backend.entity.XttsTask> oldTasks = xttsTaskRepository.findByCreateAtBefore(threshold);
        int deletedCount = 0;
        for (com.hyra_ai.backend.entity.XttsTask task : oldTasks) {
            Integer progress = task.getProgress();
            boolean isFailedTask = (progress == null || progress == 0 || "Failed".equalsIgnoreCase(task.getStatus()));

            if ("EXPIRED".equals(task.getStatus()) && !isFailedTask) {
                continue;
            }

            try {
                if (task.getUser() != null) {
                    String prefix = task.getUser().getId() + "/XttsTask/" + task.getId() + "/";
                    cloudflareStorageService.deletePrefix(prefix);
                }

                var speakerWav = task.getSpeakerWav();

                if (isFailedTask) {
                    xttsTaskRepository.delete(task);
                } else {
                    task.setSpeakerWav(null);
                    task.setResultUrl(null);
                    task.setStatus("EXPIRED");
                    xttsTaskRepository.save(task);
                }

                if (speakerWav != null) mediaRepository.delete(speakerWav);

                deletedCount++;
            } catch (Exception e) {
                log.error("Lỗi khi dọn dẹp XttsTask: {}", task.getId(), e);
            }
        }
        log.info("Đã xử lý {} XttsTasks.", deletedCount);
    }

    private void cleanupWhisperTasks(LocalDateTime threshold) {
        List<com.hyra_ai.backend.entity.WhisperTask> oldTasks = whisperTaskRepository.findByCreateAtBefore(threshold);
        int deletedCount = 0;
        for (com.hyra_ai.backend.entity.WhisperTask task : oldTasks) {
            Integer progress = task.getProgress();
            boolean isFailedTask = (progress == null || progress == 0 || "Failed".equalsIgnoreCase(task.getStatus()));

            if ("EXPIRED".equals(task.getStatus()) && !isFailedTask) {
                continue;
            }

            try {
                if (task.getUser() != null) {
                    String prefix = task.getUser().getId() + "/WhisperTask/" + task.getId() + "/";
                    cloudflareStorageService.deletePrefix(prefix);
                }

                var audioMedia = task.getAudioMedia();

                if (isFailedTask) {
                    whisperTaskRepository.delete(task);
                } else {
                    task.setAudioMedia(null);
                    task.setResultSrtUrl(null);
                    task.setResultTxtUrl(null);
                    task.setStatus("EXPIRED");
                    whisperTaskRepository.save(task);
                }

                if (audioMedia != null) mediaRepository.delete(audioMedia);

                deletedCount++;
            } catch (Exception e) {
                log.error("Lỗi khi dọn dẹp WhisperTask: {}", task.getId(), e);
            }
        }
        log.info("Đã xử lý {} WhisperTasks.", deletedCount);
    }

    private void cleanupMegaTasks(LocalDateTime threshold) {
        List<com.hyra_ai.backend.entity.MegaTask> oldTasks = megaTaskRepository.findByCreatedAtBefore(threshold);
        int deletedCount = 0;
        for (com.hyra_ai.backend.entity.MegaTask task : oldTasks) {
            Integer progress = task.getProgress();
            boolean isFailedTask = (progress == null || progress == 0 || "FAILED".equalsIgnoreCase(task.getStatus()));

            if ("EXPIRED".equals(task.getStatus()) && !isFailedTask) {
                continue;
            }

            try {
                if (task.getUser() != null) {
                    String prefix = task.getUser().getId() + "/MegaTask/" + task.getId() + "/";
                    cloudflareStorageService.deletePrefix(prefix);
                }

                var sourceFace = task.getSourceFace();
                var targetVideo = task.getTargetVideo();
                var voiceSample = task.getVoiceSample();

                if (isFailedTask) {
                    megaTaskRepository.delete(task);
                } else {
                    task.setSourceFace(null);
                    task.setTargetVideo(null);
                    task.setVoiceSample(null);
                    task.setSwapResultUrl(null);
                    task.setXttsResultUrl(null);
                    task.setSrtResultUrl(null);
                    task.setFinalResultUrl(null);
                    task.setStatus("EXPIRED");
                    megaTaskRepository.save(task);
                }

                if (sourceFace != null) mediaRepository.delete(sourceFace);
                if (targetVideo != null) mediaRepository.delete(targetVideo);
                if (voiceSample != null) mediaRepository.delete(voiceSample);

                deletedCount++;
            } catch (Exception e) {
                log.error("Lỗi khi dọn dẹp MegaTask: {}", task.getId(), e);
            }
        }
        log.info("Đã xử lý {} MegaTasks.", deletedCount);
    }
}
