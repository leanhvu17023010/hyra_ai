package com.hyra_ai.backend.controller;

import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.dto.response.WhisperTaskResponse;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.entity.WhisperTask;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.repository.UserRepository;
import com.hyra_ai.backend.repository.WhisperTaskRepository;
import com.hyra_ai.backend.service.WhisperXService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.hyra_ai.backend.entity.Media;
import com.hyra_ai.backend.repository.MediaRepository;
import com.hyra_ai.backend.service.StorageService;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/whisper")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WhisperController {

    WhisperTaskRepository whisperTaskRepository;
    UserRepository userRepository;
    MediaRepository mediaRepository;
    StorageService storageService;
    WhisperXService whisperXService;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

    @PostMapping("/tasks")
    public ApiResponse<String> createTask() {
        WhisperTask task = whisperXService.createTask();
        return ApiResponse.<String>builder()
                .code(200)
                .message("Tạo session Whisper thành công")
                .result(task.getId())
                .build();
    }

    @PostMapping("/tasks/{taskId}/process")
    public ApiResponse<String> processTask(@PathVariable("taskId") String taskId) {
        whisperXService.startWhisper(taskId);
        return ApiResponse.<String>builder()
                .code(200)
                .message("Bắt đầu xử lý Whisper thành công")
                .result(taskId)
                .build();
    }

    @PostMapping("/upload-and-start")
    public ApiResponse<String> uploadAndStart(@RequestParam("file") MultipartFile file) {
        User user = currentUser();
        String folder = user.getId() + "/library";

        try {
            // 1. Tạo task mới
            WhisperTask task = whisperXService.createTask();

            // 2. Lưu file upload
            String filePath = storageService.store(file, folder);
            Media audioMedia = mediaRepository.save(Media.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType("AUDIO")
                    .url("/uploads/" + filePath)
                    .build());

            // 3. Gắn Media vào Task và bắt đầu xử lý ngầm
            whisperXService.attachAndProcess(task.getId(), audioMedia);

            return ApiResponse.<String>builder()
                    .code(200)
                    .message("Upload và khởi tạo Whisper thành công")
                    .result(task.getId())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi upload và xử lý Whisper: " + e.getMessage(), e);
        }
    }

    @GetMapping("/tasks/{taskId}/status")
    public ApiResponse<WhisperTaskResponse> getTaskStatus(@PathVariable("taskId") String taskId) {
        User user = currentUser();
        WhisperTask task = whisperTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task Whisper với ID: " + taskId));
        if (task.getUser() == null || !task.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return ApiResponse.<WhisperTaskResponse>builder()
                .code(200)
                .message("Lấy trạng thái thành công")
                .result(toResponse(task))
                .build();
    }

    @GetMapping("/tasks/history")
    public ApiResponse<List<WhisperTaskResponse>> getHistory() {
        User user = currentUser();
        List<WhisperTask> tasks = whisperTaskRepository.findWithResultByUserId(user.getId(), PageRequest.of(0, 50));
        List<WhisperTaskResponse> items = tasks.stream().map(this::toResponse).toList();
        return ApiResponse.<List<WhisperTaskResponse>>builder()
                .code(200)
                .message("Lấy lịch sử thành công")
                .result(items)
                .build();
    }

    private WhisperTaskResponse toResponse(WhisperTask t) {
        return WhisperTaskResponse.builder()
                .id(t.getId())
                .audioUrl(t.getAudioMedia() != null ? t.getAudioMedia().getUrl() : null)
                .status(t.getStatus())
                .progress(t.getProgress())
                .resultTxtUrl(t.getResultTxtUrl())
                .resultSrtUrl(t.getResultSrtUrl())
                .createdAt(t.getCreateAt() != null ? t.getCreateAt().toString() : null)
                .build();
    }
}
