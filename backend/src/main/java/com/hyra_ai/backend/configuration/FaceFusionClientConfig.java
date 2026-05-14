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

@Configuration
public class FaceFusionClientConfig {
    @Bean
    public WebClient faceFusionWebClient(@Value("${facefusion.base-url}") String baseUrl){

        ConnectionProvider provider = ConnectionProvider.builder("facefusion-pool")
                            .maxConnections(50)
                .pendingAcquireTimeout(Duration.ofSeconds(60))
                .evictInBackground(Duration.ofSeconds(30))
                .build();

        HttpClient httpClient = HttpClient.create(provider)
                .responseTimeout(Duration.ofMinutes(20)) // Tăng lên 20 phút
                .option(ChannelOption.SO_KEEPALIVE, true) // Giữ kết nối luôn sống
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(500)) // Chờ đọc dữ liệu 5 phút
                        .addHandlerLast(new WriteTimeoutHandler(500)));

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(500 * 1024 * 1024))
                .build();
    }

}
