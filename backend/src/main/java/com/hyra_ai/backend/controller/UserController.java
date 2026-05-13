package com.hyra_ai.backend.controller;

import java.util.Comparator;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.dto.request.UserCreationRequest;
import com.hyra_ai.backend.dto.request.UserUpdateRequest;
import com.hyra_ai.backend.dto.response.UserResponse;
import com.hyra_ai.backend.entity.Role;
import com.hyra_ai.backend.repository.RoleRepository;
import com.hyra_ai.backend.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
class UserController {
    private static final List<String> APP_ROLE_ORDER = List.of("ADMIN", "USER");

    UserService userService;
    RoleRepository roleRepository;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        log.info("Controller: create User");
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<UserResponse>> getUsers() {

        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @DeleteMapping("{userId}")
    ApiResponse<String> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ApiResponse.<String>builder().result("User has been deleted").build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @PutMapping("{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request) {
        try {
            UserResponse result = userService.updateUser(userId, request);
            return ApiResponse.<UserResponse>builder()
                    .result(result)
                    .build();
        } catch (Exception e) {
            log.error("Controller: updateUser failed - userId: {}, error: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/roles")
    ApiResponse<List<Role>> getRoles() {
        log.info("Controller: get application roles (ADMIN, USER)");
        List<Role> roles = roleRepository.findAll().stream()
                .filter(r -> APP_ROLE_ORDER.contains(r.getName()))
                .sorted(Comparator.comparingInt(r -> APP_ROLE_ORDER.indexOf(r.getName())))
                .toList();
        return ApiResponse.<List<Role>>builder().result(roles).build();
    }
}
