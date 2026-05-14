package com.hyra_ai.backend.configuration;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class FaceFusionClientConfig {
    @Bean
    public WebClient faceFusionWebClient(@Value("${facefusion.base-url}") String baseUrl){
        HttpClient httpClient = HttpClient.create(). responseTimeout(Duration.ofMinutes(15));
        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(500 * 1024 * 1024)
                )
                .build();
    }
}
