package com.deliveryflow.analytics.service;

import com.deliveryflow.analytics.dto.ActivityEventDTO;
import com.deliveryflow.analytics.entity.ActivityEvent;
import com.deliveryflow.analytics.repository.ActivityEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityEventRepository activityEventRepository;

    public List<ActivityEventDTO> getRecentActivity() {
        return activityEventRepository.findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void logActivity(String eventType, String entityType, String entityId, String projectId, String userId, String message) {
        ActivityEvent event = new ActivityEvent();
        event.setEventType(eventType);
        event.setEntityType(entityType);
        event.setEntityId(entityId);
        event.setProjectId(projectId);
        event.setUserId(userId);
        event.setMessage(message);
        event.setCreatedAt(LocalDateTime.now());
        activityEventRepository.save(event);
    }

    @Transactional
    public void logActivity(String eventType, String entityType, String entityId, String userId, String message) {
        logActivity(eventType, entityType, entityId, null, userId, message);
    }

    private ActivityEventDTO toDTO(ActivityEvent entity) {
        ActivityEventDTO dto = new ActivityEventDTO();
        dto.setId(entity.getId());
        dto.setEventType(entity.getEventType());
        dto.setEntityType(entity.getEntityType());
        dto.setEntityId(entity.getEntityId());
        dto.setMessage(entity.getMessage());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
