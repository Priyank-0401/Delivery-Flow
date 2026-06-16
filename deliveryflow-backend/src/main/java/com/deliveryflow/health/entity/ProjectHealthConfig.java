package com.deliveryflow.health.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_health_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectHealthConfig {

    @Id
    @UuidGenerator
    private String id;

    @Column(name = "project_id", nullable = false, unique = true)
    private String projectId;

    @Column(name = "velocity_weight", nullable = false, precision = 3, scale = 2)
    private BigDecimal velocityWeight = new BigDecimal("0.15");

    @Column(name = "blocker_weight", nullable = false, precision = 3, scale = 2)
    private BigDecimal blockerWeight = new BigDecimal("0.15");

    @Column(name = "defect_weight", nullable = false, precision = 3, scale = 2)
    private BigDecimal defectWeight = new BigDecimal("0.10");

    @Column(name = "dependency_weight", nullable = false, precision = 3, scale = 2)
    private BigDecimal dependencyWeight = new BigDecimal("0.20");

    @Column(name = "utilization_weight", nullable = false, precision = 3, scale = 2)
    private BigDecimal utilizationWeight = new BigDecimal("0.10");

    @Column(name = "stability_weight", nullable = false, precision = 3, scale = 2)
    private BigDecimal stabilityWeight = new BigDecimal("0.10");

    @Column(name = "scope_creep_weight", nullable = false, precision = 3, scale = 2)
    private BigDecimal scopeCreepWeight = new BigDecimal("0.10");

    @Column(name = "release_confidence_weight", nullable = false, precision = 3, scale = 2)
    private BigDecimal releaseConfidenceWeight = new BigDecimal("0.10");

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @AssertTrue(message = "The sum of all health weights must equal exactly 1.00")
    public boolean isSumOfWeightsValid() {
        double sum = getSumOfWeights();
        return Math.abs(sum - 1.0) < 0.001;
    }

    public double getSumOfWeights() {
        return (velocityWeight != null ? velocityWeight.doubleValue() : 0.0)
                + (blockerWeight != null ? blockerWeight.doubleValue() : 0.0)
                + (defectWeight != null ? defectWeight.doubleValue() : 0.0)
                + (dependencyWeight != null ? dependencyWeight.doubleValue() : 0.0)
                + (utilizationWeight != null ? utilizationWeight.doubleValue() : 0.0)
                + (stabilityWeight != null ? stabilityWeight.doubleValue() : 0.0)
                + (scopeCreepWeight != null ? scopeCreepWeight.doubleValue() : 0.0)
                + (releaseConfidenceWeight != null ? releaseConfidenceWeight.doubleValue() : 0.0);
    }
}
