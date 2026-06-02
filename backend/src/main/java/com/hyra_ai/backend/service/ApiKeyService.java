package com.hyra_ai.backend.service;

import com.hyra_ai.backend.entity.ApiKey;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.repository.ApiKeyRepository;
import com.hyra_ai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final UserRepository userRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

    public String generateApiKey() {
        User user = currentUser();

        String rawKey = "hyra_" + UUID.randomUUID().toString().replace("-", "") + "_" + UUID.randomUUID().toString().replace("-", "");

        ApiKey apiKey = ApiKey.builder()
                .keyValue(rawKey)
                .user(user)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .expiresAt(null) // Tạm thời không hết hạn
                .build();

        apiKeyRepository.save(apiKey);

        return rawKey;
    }
}
