package com.deliveryflow.analytics.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "project_metrics")
@Data
public class ProjectMetrics {
    @Id
    private String projectId;
    private BigDecimal completionRate = BigDecimal.ZERO;
    private Integer blockedTasks = 0;
    private Integer totalTasks = 0;
    private Integer completedTasks = 0;
    private LocalDateTime updatedAt = LocalDateTime.now();
}
