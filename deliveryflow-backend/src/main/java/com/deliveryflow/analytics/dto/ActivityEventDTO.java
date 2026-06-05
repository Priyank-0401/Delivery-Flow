package com.deliveryflow.analytics.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActivityEventDTO {
    private String id;
    private String eventType;
    private String entityType;
    private String entityId;
    private String message;
    private LocalDateTime createdAt;
}
