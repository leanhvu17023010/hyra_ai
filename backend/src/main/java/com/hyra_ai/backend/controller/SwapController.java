package com.hyra_ai.backend.controller;


import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.entity.SwapTask;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.repository.SwapTaskRepository;
import com.hyra_ai.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/swap")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SwapController {

    SwapTaskRepository swapTaskRepository;
    private final UserRepository userRepository;

    @PostMapping("/tasks")
    public ApiResponse<String> createSession(){

        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();

        User user = userRepository.findByEmail(email).orElseThrow();



        SwapTask swapTask = SwapTask.builder()
                .user(user)
                .status("Pending")
                .createAt(LocalDateTime.now())
                .build();
        SwapTask savedTask = swapTaskRepository.save(swapTask);


        return ApiResponse.<String>builder()
                .code(200)
                .message("Session ok ")
                .result(savedTask.getId())
                .build();
    }
    @GetMapping("/tasks/{taskId}/status")
    public ApiResponse<com.hyra_ai.backend.dto.response.SwapTaskResponse> getTaskStatus(
            @org.springframework.web.bind.annotation.PathVariable("taskId") String taskId) {

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new com.hyra_ai.backend.exception.AppException(com.hyra_ai.backend.exception.ErrorCode.UNAUTHENTICATED));

        SwapTask swapTask = swapTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên làm việc với ID: " + taskId));

        if (swapTask.getUser() == null || !swapTask.getUser().getId().equals(user.getId())) {
            throw new com.hyra_ai.backend.exception.AppException(com.hyra_ai.backend.exception.ErrorCode.UNAUTHENTICATED);
        }

        com.hyra_ai.backend.dto.response.SwapTaskResponse response = com.hyra_ai.backend.dto.response.SwapTaskResponse.builder()
                .id(swapTask.getId())
                .status(swapTask.getStatus())
                .progress(swapTask.getProgress() != null ? swapTask.getProgress() : 0)
                .resultUrl(swapTask.getResultUrl())
                .build();

        return ApiResponse.<com.hyra_ai.backend.dto.response.SwapTaskResponse>builder()
                .code(200)
                .message("Lấy trạng thái thành công")
                .result(response)
                .build();
    }

}
