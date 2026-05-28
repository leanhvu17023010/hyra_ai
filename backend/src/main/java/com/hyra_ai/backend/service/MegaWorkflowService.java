package com.hyra_ai.backend.service;

import com.hyra_ai.backend.entity.MegaTask;
import com.hyra_ai.backend.entity.SwapTask;
import com.hyra_ai.backend.entity.XttsTask;
import com.hyra_ai.backend.repository.MegaTaskRepository;
import com.hyra_ai.backend.repository.SwapTaskRepository;
import com.hyra_ai.backend.repository.XttsTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MegaWorkflowService {

    private final MegaTaskRepository megaTaskRepository;
    private final SwapTaskRepository swapTaskRepository;
    private final XttsTaskRepository xttsTaskRepository;
    private final FaceFusionService faceFusionService;
    private final XttsService xttsService;
    private final WhisperXService whisperXService;
    private final FFmpegService ffmpegService;

    @Async
    public void executeMegaWorkflow(MegaTask megaTask) {
        try {
            megaTask.setStatus("PROCESSING_STEP_1"); // Swap + XTTS
            megaTask.setProgress(10);
            megaTaskRepository.save(megaTask);
            log.info("==> MegaWorkflow Started cho MegaTask: {}", megaTask.getId());

            // 1. Tạo và chạy SwapTask
            SwapTask swapTask = SwapTask.builder()
                    .user(megaTask.getUser())
                    .sourceImage(megaTask.getSourceFace())
                    .targetMedia(megaTask.getTargetVideo())
                    .status("Pending")
                    .createAt(LocalDateTime.now())
                    .build();
            swapTask = swapTaskRepository.save(swapTask);
            faceFusionService.sendtoFaceFusion(swapTask); // Phương thức này hiện tại là @Async

            // 2. Tạo và chạy XttsTask
            XttsTask xttsTask = XttsTask.builder()
                    .user(megaTask.getUser())
                    .speakerWav(megaTask.getVoiceSample())
                    .text(megaTask.getInputText())
                    .language("vi")
                    .status("Pending")
                    .createAt(LocalDateTime.now())
                    .build();
            xttsTask = xttsTaskRepository.save(xttsTask);
            xttsService.processTts(xttsTask); // Phương thức này hiện tại cũng là @Async

            // 3. Đợi cả hai máy 1 (Swap & XTTS) hoàn thành
            waitForSwapTask(swapTask.getId());
            waitForXttsTask(xttsTask.getId());

            // Lấy URL kết quả từ DB
            swapTask = swapTaskRepository.findById(swapTask.getId()).orElseThrow();
            xttsTask = xttsTaskRepository.findById(xttsTask.getId()).orElseThrow();

            if (!"Complete".equalsIgnoreCase(swapTask.getStatus()) || !"Complete".equalsIgnoreCase(xttsTask.getStatus())) {
                throw new RuntimeException("Một trong các tiến trình ở Bước 1 thất bại");
            }

            megaTask.setSwapResultUrl(swapTask.getResultUrl());
            megaTask.setXttsResultUrl(xttsTask.getResultUrl());
            megaTaskRepository.save(megaTask);

            // 4. Máy 2: WhisperX
            log.info("==> MegaWorkflow Step 2: WhisperX");
            whisperXService.processAudioToSrt(megaTask); 
            // Nếu whisperXService.processAudioToSrt là đồng bộ, nó sẽ ném exception nếu lỗi
            
            // 5. Máy 3: FFmpeg
            log.info("==> MegaWorkflow Step 3: FFmpeg");
            ffmpegService.mergeMediaFiles(megaTask);

            log.info("==> MegaWorkflow Hoàn tất thành công cho MegaTask: {}", megaTask.getId());

        } catch (Exception e) {
            log.error("Lỗi trong MegaWorkflow: ", e);
            megaTask.setStatus("FAILED");
            megaTaskRepository.save(megaTask);
        }
    }

    private void waitForSwapTask(String swapTaskId) throws InterruptedException {
        int maxRetries = 600; // 20 mins
        for (int i = 0; i < maxRetries; i++) {
            SwapTask task = swapTaskRepository.findById(swapTaskId).orElse(null);
            if (task != null) {
                if ("Complete".equalsIgnoreCase(task.getStatus()) || "Failed".equalsIgnoreCase(task.getStatus())) {
                    return;
                }
            }
            Thread.sleep(2000);
        }
        throw new RuntimeException("Timeout waiting for SwapTask");
    }

    private void waitForXttsTask(String xttsTaskId) throws InterruptedException {
        int maxRetries = 600; // 20 mins
        for (int i = 0; i < maxRetries; i++) {
            XttsTask task = xttsTaskRepository.findById(xttsTaskId).orElse(null);
            if (task != null) {
                if ("Complete".equalsIgnoreCase(task.getStatus()) || "Failed".equalsIgnoreCase(task.getStatus())) {
                    return;
                }
            }
            Thread.sleep(2000);
        }
        throw new RuntimeException("Timeout waiting for XttsTask");
    }
}
