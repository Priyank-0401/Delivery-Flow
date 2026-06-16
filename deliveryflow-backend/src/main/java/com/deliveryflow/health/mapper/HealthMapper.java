package com.deliveryflow.health.mapper;

import com.deliveryflow.health.dto.HealthConfigResponse;
import com.deliveryflow.health.dto.HealthHistoryResponse;
import com.deliveryflow.health.dto.ProjectHealthResponse;
import com.deliveryflow.health.entity.HealthHistorySnapshot;
import com.deliveryflow.health.entity.ProjectHealthConfig;
import com.deliveryflow.health.entity.ProjectHealthMetric;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class HealthMapper {

    private HealthMapper() {}

    public static ProjectHealthResponse toHealthResponse(ProjectHealthMetric metric) {
        String status;
        String statusColor;
        int score = metric.getOverallScore();

        if (score >= 85) {
            status = "Healthy";
            statusColor = "GREEN";
        } else if (score >= 70) {
            status = "At Risk";
            statusColor = "YELLOW";
        } else if (score >= 50) {
            status = "Critical";
            statusColor = "ORANGE";
        } else {
            status = "Failing";
            statusColor = "RED";
        }

        List<String> factors;
        if (metric.getContributingFactors() != null && !metric.getContributingFactors().isBlank()) {
            factors = Arrays.asList(metric.getContributingFactors().split("; "));
        } else {
            factors = Collections.emptyList();
        }

        return ProjectHealthResponse.builder()
                .projectId(metric.getProjectId())
                .overallScore(score)
                .status(status)
                .statusColor(statusColor)
                .velocityScore(metric.getVelocityScore())
                .blockerScore(metric.getBlockerScore())
                .defectScore(metric.getDefectScore())
                .dependencyScore(metric.getDependencyScore())
                .utilizationScore(metric.getUtilizationScore())
                .stabilityScore(metric.getStabilityScore())
                .scopeCreepScore(metric.getScopeCreepScore())
                .releaseConfidenceScore(metric.getReleaseConfidenceScore())
                .contributingFactors(factors)
                .lastCalculatedAt(metric.getLastCalculatedAt())
                .build();
    }

    public static HealthConfigResponse toConfigResponse(ProjectHealthConfig config) {
        return HealthConfigResponse.builder()
                .id(config.getId())
                .projectId(config.getProjectId())
                .velocityWeight(config.getVelocityWeight())
                .blockerWeight(config.getBlockerWeight())
                .defectWeight(config.getDefectWeight())
                .dependencyWeight(config.getDependencyWeight())
                .utilizationWeight(config.getUtilizationWeight())
                .stabilityWeight(config.getStabilityWeight())
                .scopeCreepWeight(config.getScopeCreepWeight())
                .releaseConfidenceWeight(config.getReleaseConfidenceWeight())
                .build();
    }

    public static HealthHistoryResponse toHistoryResponse(HealthHistorySnapshot snapshot) {
        return HealthHistoryResponse.builder()
                .projectId(snapshot.getProjectId())
                .score(snapshot.getScore())
                .healthDelta(snapshot.getHealthDelta())
                .snapshotDate(snapshot.getSnapshotDate())
                .build();
    }
}
