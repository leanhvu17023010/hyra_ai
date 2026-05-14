package com.hyra_ai.backend.configuration;


import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class FaceFusionClientConfig {
    @Bean
    public WebClient faceFusionWebClient(@Value("${facefusion.base-url}") String baseUrl){

        ConnectionProvider provider = ConnectionProvider.builder("facefusion-pool")
                .maxConnections(50)
                .pendingAcquireTimeout(Duration.ofSeconds(60))
                // Tránh tái sử dụng socket đã bị FaceFusion / proxy đóng (Connection reset by peer).
                .maxIdleTime(Duration.ofSeconds(15))
                .maxLifeTime(Duration.ofMinutes(3))
                .evictInBackground(Duration.ofSeconds(30))
                .build();

        HttpClient httpClient = HttpClient.create(provider)
                .responseTimeout(Duration.ofMinutes(20))
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 15_000)
                .option(ChannelOption.SO_KEEPALIVE, true)
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(120, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(120, TimeUnit.SECONDS)));

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(500 * 1024 * 1024))
                .build();
    }

}
