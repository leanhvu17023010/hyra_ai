package com.hyra_ai.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import org.springframework.web.reactive.function.client.ExchangeStrategies;

@Configuration
public class FFmpegClientConfig {
    @Value("${ffmpeg.api.url:http://localhost:5003}")
    private String ffmpegApiUrl;

    @Bean
    public WebClient ffmpegWebClient() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(500 * 1024 * 1024)) // Tăng lên 100MB
                .build();

        return WebClient.builder()
                .exchangeStrategies(strategies)
                .baseUrl(ffmpegApiUrl)
                .build();
    }
}
