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


}
