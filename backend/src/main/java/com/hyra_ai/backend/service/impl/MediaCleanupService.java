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
    MediaRepository mediaRepository;

    // Chạy lúc 00:00 mỗi ngày
    @Scheduled(cron = "0 0 0 * * ?")
//    @Scheduled(fixedRate = 10000)
    public void cleanupExpiredTasks() {
        log.info("Bắt đầu job dọn dẹp các task quá hạn...");

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        // Lấy tất cả task cũ hơn 7 ngày (tạm bỏ qua vụ filter status ở SQL để debug)
        List<SwapTask> oldTasks = swapTaskRepository.findByCreateAtBefore(sevenDaysAgo);
        
//        log.info("Tìm thấy {} tasks cũ hơn 7 ngày trong Database.", oldTasks.size());

        int deletedCount = 0;

        for (SwapTask task : oldTasks) {
            Integer progress = task.getProgress();
            boolean isFailedTask = (progress == null || progress == 0);

            // Chỉ bỏ qua (continue) nếu task ĐÃ EXPIRED VÀ ĐỒNG THỜI KHÔNG PHẢI task lỗi.
            // Nếu là task lỗi thì vẫn đi tiếp xuống dưới để Hard Delete.
            if ("EXPIRED".equals(task.getStatus()) && !isFailedTask) {
                continue;
            }

            try {
                // 1. Xoá file vật lý
                if (task.getUser() != null) {
                    Path taskFolder = Paths.get("uploads", task.getUser().getId(), task.getId());
                    File folder = taskFolder.toFile();
                    if (folder.exists()) {
                        FileSystemUtils.deleteRecursively(folder);
                        log.info("Đã xoá thư mục vật lý của task: {}", task.getId());
                    }
                }

                // 2. Quyết định Xoá cứng (Hard Delete) hay Xoá mềm (Soft Delete)
                var sourceImage = task.getSourceImage();
                var targetMedia = task.getTargetMedia();
                var audioMedia = task.getAudioMedia();

                if (isFailedTask) {
                    // Task bị lỗi từ đầu -> Xoá hẳn khỏi bảng SwapTask
                    swapTaskRepository.delete(task);
                    log.info("Đã xoá vĩnh viễn (Hard Delete) task lỗi khỏi DB: {}", task.getId());
                } else {
                    // Task đã từng chạy thành công -> Giữ lại lịch sử (Soft Delete)
                    task.setSourceImage(null);
                    task.setTargetMedia(null);
                    task.setAudioMedia(null);
                    task.setResultUrl(null);
                    task.setStatus("EXPIRED");
                    
                    swapTaskRepository.save(task);
                }

                // 3. Xoá các Media records khỏi database
                if (sourceImage != null) mediaRepository.delete(sourceImage);
                if (targetMedia != null) mediaRepository.delete(targetMedia);
                if (audioMedia != null) mediaRepository.delete(audioMedia);

                deletedCount++;
            } catch (Exception e) {
                log.error("Lỗi khi dọn dẹp task: {}", task.getId(), e);
            }
        }

        log.info("Job dọn dẹp hoàn tất. Đã xử lý {} tasks.", deletedCount);
    }
}
