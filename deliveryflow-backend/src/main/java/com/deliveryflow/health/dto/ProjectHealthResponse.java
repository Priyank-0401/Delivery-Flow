package com.deliveryflow.health.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectHealthResponse {
    private String projectId;
    private Integer overallScore;
    private String status;        // "Healthy", "At Risk", "Critical", "Failing"
    private String statusColor;   // "GREEN", "YELLOW", "ORANGE", "RED"
    private Integer velocityScore;
    private Integer blockerScore;
    private Integer defectScore;
    private Integer dependencyScore;
    private Integer utilizationScore;
    private Integer stabilityScore;
    private Integer scopeCreepScore;
    private Integer releaseConfidenceScore;
    private List<String> contributingFactors;
    private LocalDateTime lastCalculatedAt;
}
