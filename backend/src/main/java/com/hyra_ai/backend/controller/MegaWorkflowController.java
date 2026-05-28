package com.hyra_ai.backend.controller;

import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.dto.request.MegaWorkflowRequest;
import com.hyra_ai.backend.dto.response.MegaWorkflowStatusResponse;
import com.hyra_ai.backend.entity.Media;
import com.hyra_ai.backend.entity.MegaTask;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.repository.MediaRepository;
import com.hyra_ai.backend.repository.MegaTaskRepository;
import com.hyra_ai.backend.repository.UserRepository;
import com.hyra_ai.backend.service.MegaWorkflowService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/mega-workflow")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MegaWorkflowController {

    UserRepository userRepository;
    MediaRepository mediaRepository;
    MegaTaskRepository megaTaskRepository;
    MegaWorkflowService megaWorkflowService;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

    @PostMapping("/start")
    public ApiResponse<String> startMegaWorkflow(@RequestBody MegaWorkflowRequest request) {
        User user = currentUser();

        Media sourceFace = mediaRepository.findById(request.getSourceFaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Source Face"));
        Media targetVideo = mediaRepository.findById(request.getTargetVideoId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Target Video"));
        Media voiceSample = mediaRepository.findById(request.getVoiceSampleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Voice Sample"));

        if (request.getInputText() == null || request.getInputText().trim().isEmpty()) {
            throw new RuntimeException("Input text không được để trống");
        }

        MegaTask megaTask = MegaTask.builder()
                .user(user)
                .sourceFace(sourceFace)
                .targetVideo(targetVideo)
                .voiceSample(voiceSample)
                .inputText(request.getInputText())
                .status("PENDING")
                .progress(0)
                .createdAt(LocalDateTime.now())
                .build();

        megaTask = megaTaskRepository.save(megaTask);

        // Kích hoạt luồng chạy ngầm
        megaWorkflowService.executeMegaWorkflow(megaTask);

        return ApiResponse.<String>builder()
                .code(200)
                .message("Đã khởi tạo Mega Workflow")
                .result(megaTask.getId())
                .build();
    }

    @GetMapping("/tasks/{taskId}/status")
    public ApiResponse<MegaWorkflowStatusResponse> getTaskStatus(@PathVariable("taskId") String taskId) {
        User user = currentUser();

        MegaTask megaTask = megaTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy MegaTask với ID: " + taskId));

        if (megaTask.getUser() == null || !megaTask.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        MegaWorkflowStatusResponse response = MegaWorkflowStatusResponse.builder()
                .id(megaTask.getId())
                .status(megaTask.getStatus())
                .progress(megaTask.getProgress() != null ? megaTask.getProgress() : 0)
                .swapResultUrl(megaTask.getSwapResultUrl())
                .xttsResultUrl(megaTask.getXttsResultUrl())
                .srtResultUrl(megaTask.getSrtResultUrl())
                .finalResultUrl(megaTask.getFinalResultUrl())
                .build();

        return ApiResponse.<MegaWorkflowStatusResponse>builder()
                .code(200)
                .message("Lấy trạng thái thành công")
                .result(response)
                .build();
    }
}
