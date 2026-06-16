package com.deliveryflow.health.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthConfigResponse {
    private String id;
    private String projectId;
    private BigDecimal velocityWeight;
    private BigDecimal blockerWeight;
    private BigDecimal defectWeight;
    private BigDecimal dependencyWeight;
    private BigDecimal utilizationWeight;
    private BigDecimal stabilityWeight;
    private BigDecimal scopeCreepWeight;
    private BigDecimal releaseConfidenceWeight;
}
