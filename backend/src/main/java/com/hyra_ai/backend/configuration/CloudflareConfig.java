package com.hyra_ai.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class CloudflareConfig {

    @Value("${cloudflare.r2.access-key}")
    private String accessKey;

    @Value("${cloudflare.r2.secret-key}")
    private String secretKey;

    @Value("${cloudflare.r2.endpoint}")
    private String endpoint;

    @Bean
    public S3Client s3Client() {
        // Nếu thiếu config thì trả về null hoặc throw exception tuỳ ý.
        // Tạm thời trả về null nếu chưa cấu hình để không cản trở spring boot khởi động
        if (accessKey == null || accessKey.isEmpty() ||
            secretKey == null || secretKey.isEmpty() ||
            endpoint == null || endpoint.isEmpty()) {
            return null;
        }
        
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        return S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of("auto")) // Cloudflare R2 yêu cầu "auto" hoặc tương tự
                .endpointOverride(URI.create(endpoint))
                .build();
    }
}
