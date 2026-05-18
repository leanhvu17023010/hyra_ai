package com.hyra_ai.backend.controller;


import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.dto.response.SwapHistoryItemResponse;
import com.hyra_ai.backend.dto.response.SwapStatsResponse;
import com.hyra_ai.backend.dto.response.SwapTaskResponse;
import com.hyra_ai.backend.entity.SwapTask;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.repository.SwapTaskRepository;
import com.hyra_ai.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/swap")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SwapController {

    private static final Pattern VIDEO_RESULT_URL =
            Pattern.compile(".*\\.(mp4|webm|mov)(\\?.*)?$", Pattern.CASE_INSENSITIVE);

    SwapTaskRepository swapTaskRepository;
    UserRepository userRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

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
    @GetMapping("/tasks/history")
    public ApiResponse<List<SwapHistoryItemResponse>> getMySwapHistory() {
        User user = currentUser();
        List<SwapTask> tasks =
                swapTaskRepository.findWithResultByUserId(user.getId(), PageRequest.of(0, 50));
        List<SwapHistoryItemResponse> items = tasks.stream().map(this::toHistoryItem).toList();
        return ApiResponse.<List<SwapHistoryItemResponse>>builder()
                .code(200)
                .message("OK")
                .result(items)
                .build();
    }

    @GetMapping("/tasks/stats")
    public ApiResponse<SwapStatsResponse> getMySwapStats() {
        User user = currentUser();
        List<SwapTask> tasks =
                swapTaskRepository.findWithResultByUserId(user.getId(), PageRequest.of(0, 10_000));
        long video = tasks.stream()
                .map(SwapTask::getResultUrl)
                .filter(SwapController::isVideoResultUrl)
                .count();
        long image = tasks.size() - video;
        return ApiResponse.<SwapStatsResponse>builder()
                .code(200)
                .message("OK")
                .result(SwapStatsResponse.builder()
                        .imageSwapCount(image)
                        .videoSwapCount(video)
                        .build())
                .build();
    }

    @GetMapping("/tasks/{taskId}/status")
    public ApiResponse<SwapTaskResponse> getTaskStatus(@PathVariable("taskId") String taskId) {

        User user = currentUser();

        SwapTask swapTask = swapTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên làm việc với ID: " + taskId));

        if (swapTask.getUser() == null || !swapTask.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        SwapTaskResponse response = SwapTaskResponse.builder()
                .id(swapTask.getId())
                .status(swapTask.getStatus())
                .progress(swapTask.getProgress() != null ? swapTask.getProgress() : 0)
                .resultUrl(swapTask.getResultUrl())
                .build();

        return ApiResponse.<SwapTaskResponse>builder()
                .code(200)
                .message("Lấy trạng thái thành công")
                .result(response)
                .build();
    }

    private SwapHistoryItemResponse toHistoryItem(SwapTask t) {
        String url = t.getResultUrl();
        return SwapHistoryItemResponse.builder()
                .id(t.getId())
                .resultUrl(url)
                .mediaType(isVideoResultUrl(url) ? "video" : "image")
                .status(t.getStatus())
                .createdAt(t.getCreateAt() != null ? t.getCreateAt().toString() : null)
                .build();
    }

    private static boolean isVideoResultUrl(String url) {
        return url != null && VIDEO_RESULT_URL.matcher(url).matches();
    }

}
