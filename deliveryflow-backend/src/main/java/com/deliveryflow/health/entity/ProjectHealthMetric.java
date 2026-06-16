package com.deliveryflow.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_health_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectHealthMetric {

    @Id
    @UuidGenerator
    private String id;

    @Column(name = "project_id", nullable = false, unique = true)
    private String projectId;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "velocity_score", nullable = false)
    private Integer velocityScore;

    @Column(name = "blocker_score", nullable = false)
    private Integer blockerScore;

    @Column(name = "defect_score", nullable = false)
    private Integer defectScore;

    @Column(name = "dependency_score", nullable = false)
    private Integer dependencyScore;

    @Column(name = "utilization_score", nullable = false)
    private Integer utilizationScore;

    @Column(name = "stability_score", nullable = false)
    private Integer stabilityScore;

    @Column(name = "scope_creep_score", nullable = false)
    private Integer scopeCreepScore;

    @Column(name = "release_confidence_score", nullable = false)
    private Integer releaseConfidenceScore;

    @Column(name = "contributing_factors", columnDefinition = "TEXT")
    private String contributingFactors;

    @Column(name = "last_calculated_at")
    private LocalDateTime lastCalculatedAt;

    @PrePersist
    @PreUpdate
    protected void onCalculate() {
        this.lastCalculatedAt = LocalDateTime.now();
    }
}
