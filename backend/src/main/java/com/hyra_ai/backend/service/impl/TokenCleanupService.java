package com.hyra_ai.backend.service.impl;

import java.util.Date;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hyra_ai.backend.repository.InvalidatedTokenRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TokenCleanupService {

    InvalidatedTokenRepository invalidatedTokenRepository;

    // Run at 01:00 AM every day
    @Scheduled(cron = "0 0 0 * * ?")
//    @Scheduled(fixedRate = 10000)
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Bắt đầu xóa các token hết hạn ");
        try {
            invalidatedTokenRepository.deleteExpiredTokens(new Date());
            log.info(" Xóa các token hết hạn thành công .");
        } catch (Exception e) {
            log.error("Đã xảy ra lỗi trong trình xóa token hết hạn", e);
        }
    }
}
