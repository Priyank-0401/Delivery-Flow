package com.deliveryflow.common.audit.service;

import com.deliveryflow.common.audit.entity.AuditLog;
import com.deliveryflow.common.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logEvent(
            String userId,
            String action,
            String resourceType,
            String resourceId,
            String ipAddress,
            String userAgent,
            String details
    ) {
        log.info("Audit Event - User: {}, Action: {}, ResourceType: {}, ResourceId: {}, Details: {}", 
                userId, action, resourceType, resourceId, details);
        
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .details(details)
                .build();
        
        auditLogRepository.save(auditLog);
    }
}
