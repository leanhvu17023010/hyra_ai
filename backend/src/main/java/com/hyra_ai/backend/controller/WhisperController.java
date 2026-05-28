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

import java.util.List;

@RestController
@RequestMapping("/whisper")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WhisperController {

    WhisperTaskRepository whisperTaskRepository;
    UserRepository userRepository;
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
