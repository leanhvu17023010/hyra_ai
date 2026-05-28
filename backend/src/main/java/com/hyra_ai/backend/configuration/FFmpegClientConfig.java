package com.hyra_ai.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class FFmpegClientConfig {
    @Value("${ffmpeg.api.url:http://localhost:5003}")
    private String ffmpegApiUrl;

    @Bean
    public WebClient ffmpegWebClient() {
        return WebClient.builder()
                .baseUrl(ffmpegApiUrl)
                .build();
    }
}
