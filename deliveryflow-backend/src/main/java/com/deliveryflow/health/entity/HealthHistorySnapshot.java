package com.deliveryflow.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_history_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthHistorySnapshot {

    @Id
    @UuidGenerator
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "health_delta", nullable = false)
    private Integer healthDelta = 0;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
