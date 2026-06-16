package com.deliveryflow.health.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthHistoryResponse {
    private String projectId;
    private Integer score;
    private Integer healthDelta;
    private LocalDate snapshotDate;
}
