package com.deliveryflow.analytics.dto;

import lombok.Data;

@Data
public class TeamMetricsDTO {
    private String teamId;
    private double utilization;
    private int assignedHours;
    private int availableHours;
}
