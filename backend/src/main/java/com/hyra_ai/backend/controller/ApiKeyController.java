package com.hyra_ai.backend.controller;

import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.service.ApiKeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api-keys")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @PostMapping("/generate")
    public ApiResponse<String> generateApiKey() {
        String apiKey = apiKeyService.generateApiKey();
        return ApiResponse.<String>builder()
                .code(200)
                .message("API Key generated successfully")
                .result(apiKey)
                .build();
    }
}
