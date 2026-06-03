package com.hyra_ai.backend.controller;

import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.dto.response.XttsTaskResponse;
import com.hyra_ai.backend.entity.Media;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.entity.XttsTask;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.repository.MediaRepository;
import com.hyra_ai.backend.repository.UserRepository;
import com.hyra_ai.backend.repository.XttsTaskRepository;
import com.hyra_ai.backend.service.StorageService;
import com.hyra_ai.backend.service.XttsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/xtts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class XttsController {

    XttsTaskRepository xttsTaskRepository;
    UserRepository userRepository;
    MediaRepository mediaRepository;
    StorageService storageService;
    XttsService xttsService;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }


    @PostMapping("/tasks")
    public ApiResponse<String> createTtsTask() {
        XttsTask task = xttsService.createTask();
        return ApiResponse.<String>builder()
                .code(200)
                .message("Session ok")
                .result(task.getId())
                .build();
    }

    @PostMapping("/tasks/{taskId}/process")
    public ApiResponse<String> processTtsTask(@PathVariable("taskId") String taskId,
                                              @ModelAttribute com.hyra_ai.backend.dto.request.TtsRequest request) {
        xttsService.startTts(taskId, request);
        return ApiResponse.<String>builder()
                .code(200)
                .message("Bắt đầu xử lý XTTS thành công")
                .result(taskId)
                .build();
    }

    @PostMapping("/upload-and-start")
    public ApiResponse<String> uploadAndStart(
            @RequestParam("file") MultipartFile file,
            @RequestParam("text") String text,
            @RequestParam(value = "language", defaultValue = "vi") String language) {
        
        User user = currentUser();
        String folder = user.getId() + "/library";
        
        try {
            // 1. Tạo task mới
            XttsTask task = xttsService.createTask();
            
            // 2. Lưu file upload
            String filePath = storageService.store(file, folder);
            Media voiceMedia = mediaRepository.save(Media.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType("AUDIO")
                    .url("/uploads/" + filePath)
                    .build());
                    
            // 3. Gắn Media vào Task và bắt đầu xử lý ngầm
            xttsService.attachAndProcess(task.getId(), text, language, voiceMedia);
            
            return ApiResponse.<String>builder()
                    .code(200)
                    .message("Upload và khởi tạo XTTS thành công")
                    .result(task.getId())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi upload và xử lý XTTS: " + e.getMessage(), e);
        }
    }

    @GetMapping("/tasks/{taskId}/status")
    public ApiResponse<XttsTaskResponse> getTaskStatus(@PathVariable("taskId") String taskId) {
        User user = currentUser();
        XttsTask task = xttsTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task XTTS với ID: " + taskId));
        if (task.getUser() == null || !task.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        XttsTaskResponse response = toResponse(task);
        return ApiResponse.<XttsTaskResponse>builder()
                .code(200)
                .message("Lấy trạng thái thành công")
                .result(response)
                .build();
    }

    @GetMapping("/tasks/history")
    public ApiResponse<List<XttsTaskResponse>> getMyTtsHistory() {
        User user = currentUser();
        List<XttsTask> tasks = xttsTaskRepository.findWithResultByUserId(user.getId(), PageRequest.of(0, 50));
        List<XttsTaskResponse> items = tasks.stream().map(this::toResponse).toList();
        return ApiResponse.<List<XttsTaskResponse>>builder()
                .code(200)
                .message("Lấy lịch sử thành công")
                .result(items)
                .build();
    }

    private XttsTaskResponse toResponse(XttsTask t) {
        return XttsTaskResponse.builder()
                .id(t.getId())
                .text(t.getText())
                .speakerWavUrl(t.getSpeakerWav() != null ? t.getSpeakerWav().getUrl() : null)
                .language(t.getLanguage())
                .status(t.getStatus())
                .progress(t.getProgress() != null ? t.getProgress() : 0)
                .resultUrl(t.getResultUrl())
                .createdAt(t.getCreateAt() != null ? t.getCreateAt().toString() : null)
                .build();
    }
}
