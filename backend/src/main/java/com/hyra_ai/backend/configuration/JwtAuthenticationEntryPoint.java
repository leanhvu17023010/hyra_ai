package com.hyra_ai.backend.configuration;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
        @Override
        public void commence(
                        HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
                        throws IOException, ServletException {
                String requestURI = request.getRequestURI();
                log.warn("JWT Authentication failed: method={}, uri={}, error={}",
                                request.getMethod(), requestURI, authException.getMessage());
                ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

                response.setStatus(errorCode.getStatusCode().value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                ApiResponse<?> apiResponse = ApiResponse.builder()
                                .code(errorCode.getCode())
                                .message(errorCode.getMessage())
                                .build();

                ObjectMapper objectMapper = new ObjectMapper();

                response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                response.flushBuffer();
        }
}
