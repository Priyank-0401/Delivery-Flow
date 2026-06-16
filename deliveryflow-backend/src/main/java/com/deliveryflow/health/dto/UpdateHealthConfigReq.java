package com.deliveryflow.health.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHealthConfigReq {
    @NotNull private BigDecimal velocityWeight;
    @NotNull private BigDecimal blockerWeight;
    @NotNull private BigDecimal defectWeight;
    @NotNull private BigDecimal dependencyWeight;
    @NotNull private BigDecimal utilizationWeight;
    @NotNull private BigDecimal stabilityWeight;
    @NotNull private BigDecimal scopeCreepWeight;
    @NotNull private BigDecimal releaseConfidenceWeight;
}
