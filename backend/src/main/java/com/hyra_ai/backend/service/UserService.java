package com.hyra_ai.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hyra_ai.backend.dto.request.UserCreationRequest;
import com.hyra_ai.backend.dto.request.UserUpdateRequest;
import com.hyra_ai.backend.dto.response.UserResponse;
import com.hyra_ai.backend.entity.Role;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.mapper.UserMapper;
import com.hyra_ai.backend.repository.RoleRepository;
import com.hyra_ai.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    BrevoEmailService brevoEmailService;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setCreateAt(LocalDate.now());

        Role role = roleRepository
                .findById(request.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setActive(role.getName().equals("USER"));
        user.setRole(role);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo() {
        // Khi request được xác định thành công -> thông tin lưu trữ của user được lưu trong Security context holder
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByEmail(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var context = SecurityContextHolder.getContext();
        String currentEmail = context.getAuthentication().getName();

        var authorities = context.getAuthentication().getAuthorities();
        boolean isAdminFromAuthorities = authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        User currentUser = userRepository
                .findByEmail(currentEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean isAdminFromRole = currentUser.getRole() != null
                && currentUser.getRole().getName().equals("ADMIN");

        boolean isAdmin = isAdminFromAuthorities || isAdminFromRole;
        boolean isUpdatingOtherUser = isAdmin && !user.getEmail().equals(currentEmail);

        if (!isAdmin && !user.getEmail().equals(currentEmail)) {
            log.warn("Access denied: User {} attempted to update user {}", currentEmail, userId);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        userMapper.updateUser(user, request);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            String roleName = currentUser.getRole().getName();
            if ("USER".equals(roleName)) {
                user.setActive(true);
            }
        }

        // change Email
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (isAdmin) {
                user.setEmail(request.getEmail());
            }
        }


        // fullName
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        // role
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            if (isAdmin) {
                Role newRole = roleRepository
                        .findById(request.getRole())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                user.setRole(newRole);
            } else {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        if (request.getIsActive() != null) {
            if (isAdmin) {
                boolean oldIsActiveValue = user.isActive();
                boolean newIsActiveValue = request.getIsActive();

                if (oldIsActiveValue && !newIsActiveValue) {
                    String userRoleName = user.getRole() != null ? user.getRole().getName() : null;

                    if ("USER".equals(userRoleName)) {
                        try {
                            brevoEmailService.sendAccountLockedEmail(
                                    user.getEmail(), user.getFullName(), userRoleName);
                            log.info(
                                    "Account locked notification email sent to: {} (Role: {})",
                                    user.getEmail(),
                                    userRoleName);
                        } catch (Exception e) {
                            log.error(
                                    "Failed to send account locked email to: {} - Error: {}",
                                    user.getEmail(),
                                    e.getMessage(),
                                    e);
                        }
                    }
                }

                user.setActive(newIsActiveValue);
            } else {
                log.warn("Non-admin user {} attempted to change isActive for user {}", currentEmail, userId);
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        User savedUser = userRepository.save(user);

        if (isUpdatingOtherUser && savedUser.getRole() != null) {
            String targetRole = savedUser.getRole().getName();
            if ("USER".equalsIgnoreCase(targetRole)) {
                try {
                    brevoEmailService.sendProfileUpdatedEmail(
                            savedUser.getEmail(), savedUser.getFullName(), targetRole);
                } catch (Exception e) {
                    log.error(
                            "Failed to send profile updated email to {} - Error: {}",
                            savedUser.getEmail(),
                            e.getMessage());
                }
            }
        }

        return userMapper.toUserResponse(savedUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    // @EnableMethodSecurity trong SecurityConfig
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        //        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }
}
