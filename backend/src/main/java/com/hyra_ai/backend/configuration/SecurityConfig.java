package com.hyra_ai.backend.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    // API không cần xác thực (ai cũng có thể gọi được).
    private static final String[] PUBLIC_POST_ENDPOINTS = {
        "/users",
        "/auth/token",
        "/auth/google",
        "/auth/introspect",
        "/auth/logout",
        "/auth/refresh",
        "/auth/send-otp",
        "/auth/verify-otp",
        "/auth/reset-password",
        "/auth/set-password-google",
    };

    private static final String[] PUBLIC_GET_ENDPOINTS = {
        "/auth/check-google-user",
        "/error",
    };

    private final CustomJwtDecoder customJwtDecoder;

    public SecurityConfig(CustomJwtDecoder customJwtDecoder) {
        this.customJwtDecoder = customJwtDecoder;
    }

    // Cấu hình security: Quản lý quyền truy cập endpoint
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request -> request
                .requestMatchers(HttpMethod.GET,PUBLIC_GET_ENDPOINTS).permitAll()
                .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()
                .anyRequest()
                .authenticated()); // Tất cả request khác đều buộc phải có JWT hợp lệ

        httpSecurity.oauth2ResourceServer(
                oauth2 -> oauth2.jwt(jwtConfigurer -> jwtConfigurer
                                .decoder(customJwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(
                                new JwtAuthenticationEntryPoint())
                );

        httpSecurity.csrf(
                AbstractHttpConfigurer
                        ::disable); // Tắt CSRF, thường làm với REST API vì không cần bảo vệ form như web app

        return httpSecurity.build();
    }

    // Cấu hình CORS cho API
    @Bean
    public CorsFilter corsFilter() { 
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        // Cấu hình core
        corsConfiguration.addAllowedOrigin(frontendBaseUrl); // Cho phép FE local gọi API
        corsConfiguration.addAllowedMethod("*"); // Cho phép method nào được gọi từ origin này
        corsConfiguration.addAllowedHeader("*"); // Cho phép tất cả header được truy cập
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(urlBasedCorsConfigurationSource);
    }

    // Customize authority mapper cho converter
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_"); // Thêm prefix "ROLE_" để hasRole() hoạt động
        // Extract authorities từ claim "scope" thay vì "scp"
        jwtGrantedAuthoritiesConverter.setAuthoritiesClaimName("scope");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    // Mã hóa mật khẩu
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
