package com.hoanhao.authservice.service;

import com.hoanhao.authservice.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.logging.Logger;

@Component
public class SessionCleanupTask {

    private static final Logger logger = Logger.getLogger(SessionCleanupTask.class.getName());

    @Autowired
    private SessionRepository sessionRepository;

    // Chạy mỗi ngày lúc 1:00 AM
    @Scheduled(cron = "0 0 1 * * *")
    public void cleanupOldSessions() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(30); // Xóa token cũ hơn 30 ngày
        int deletedCount = sessionRepository.deleteByRevokedAtBeforeOrExpiresAtBefore(threshold, threshold);
        logger.info("Cleaned up " + deletedCount + " old sessions");
    }
}