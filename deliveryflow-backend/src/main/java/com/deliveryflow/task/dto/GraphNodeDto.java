package com.deliveryflow.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GraphNodeDto {
    private String id;
    private String label;
    private String status;
    private String taskKey;
    private Integer storyPoints;
    private BigDecimal estimatedHours;
}
