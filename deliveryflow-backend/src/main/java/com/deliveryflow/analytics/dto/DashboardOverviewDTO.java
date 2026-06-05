package com.deliveryflow.analytics.dto;

import lombok.Data;

@Data
public class DashboardOverviewDTO {
    private int totalProjects;
    private int blockedTasks;
    private int activeSprints;
    private double overallCompletionRate;
}
