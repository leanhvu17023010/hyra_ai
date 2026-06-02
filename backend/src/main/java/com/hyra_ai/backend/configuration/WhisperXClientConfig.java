package com.hyra_ai.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WhisperXClientConfig {
    @Value("${whisperx.api.url:http://localhost:5002}")
    private String whisperxApiUrl;

    @Bean
    public WebClient whisperXWebClient() {
        return WebClient.builder()
                .baseUrl(whisperxApiUrl)
                .build();
    }
}
