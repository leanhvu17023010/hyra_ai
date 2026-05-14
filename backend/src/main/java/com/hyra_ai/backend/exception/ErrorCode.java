package com.hyra_ai.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid request", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1003, "Mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1004, "User không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1005, "Sao ", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED(1006, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    EMAIL_SEND_FAILED(1008, "Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_OTP(1009, "Mã OTP không đúng, yêu cầu nhập lại", HttpStatus.BAD_REQUEST),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
