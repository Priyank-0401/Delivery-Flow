package com.deliveryflow.analytics.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_events")
@Data
public class ActivityEvent {
    @Id
    @UuidGenerator
    private String id;
    private String eventType;
    private String entityType;
    private String entityId;
    private String userId;
    private String message;
    private LocalDateTime createdAt = LocalDateTime.now();
}
