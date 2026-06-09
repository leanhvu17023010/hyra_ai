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
import com.hyra_ai.backend.service.StorageService;
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
    StorageService storageService;

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

    @PostMapping("/upload-and-start")
    public ApiResponse<String> uploadAndStart(
            @RequestParam("targetVideo") org.springframework.web.multipart.MultipartFile targetVideoFile,
            @RequestParam("voiceSample") org.springframework.web.multipart.MultipartFile voiceSampleFile,
            @RequestParam(value = "sourceFace", required = false) org.springframework.web.multipart.MultipartFile sourceFaceFile,
            @RequestParam("inputText") String inputText) {
        
        User user = currentUser();
        String folder = user.getId() + "/library";

        try {
            if (inputText == null || inputText.trim().isEmpty()) {
                throw new RuntimeException("Input text không được để trống");
            }

            // Lưu Target Video
            String videoPath = storageService.store(targetVideoFile, folder);
            String videoUrl = videoPath.startsWith("http") ? videoPath : "/uploads/" + videoPath;
            Media targetVideo = mediaRepository.save(Media.builder()
                    .fileName(targetVideoFile.getOriginalFilename())
                    .fileType("VIDEO")
                    .url(videoUrl)
                    .build());

            // Lưu Voice Sample
            String voicePath = storageService.store(voiceSampleFile, folder);
            String voiceUrl = voicePath.startsWith("http") ? voicePath : "/uploads/" + voicePath;
            Media voiceSample = mediaRepository.save(Media.builder()
                    .fileName(voiceSampleFile.getOriginalFilename())
                    .fileType("AUDIO")
                    .url(voiceUrl)
                    .build());

            // Lưu Source Face (nếu có)
            Media sourceFace = null;
            if (sourceFaceFile != null && !sourceFaceFile.isEmpty()) {
                String facePath = storageService.store(sourceFaceFile, folder);
                String faceUrl = facePath.startsWith("http") ? facePath : "/uploads/" + facePath;
                sourceFace = mediaRepository.save(Media.builder()
                        .fileName(sourceFaceFile.getOriginalFilename())
                        .fileType("IMAGE")
                        .url(faceUrl)
                        .build());
            }

            MegaTask megaTask = MegaTask.builder()
                    .user(user)
                    .sourceFace(sourceFace)
                    .targetVideo(targetVideo)
                    .voiceSample(voiceSample)
                    .inputText(inputText)
                    .status("PENDING")
                    .progress(0)
                    .createdAt(LocalDateTime.now())
                    .build();

            megaTask = megaTaskRepository.save(megaTask);

            // Kích hoạt luồng chạy ngầm
            megaWorkflowService.executeMegaWorkflow(megaTask);

            return ApiResponse.<String>builder()
                    .code(200)
                    .message("Upload và khởi tạo Mega Workflow thành công")
                    .result(megaTask.getId())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi upload file: " + e.getMessage(), e);
        }
    }
}
