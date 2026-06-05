package com.deliveryflow.analytics.dto;

import lombok.Data;

@Data
public class ProjectMetricsDTO {
    private String projectId;
    private int totalTasks;
    private int completedTasks;
    private int blockedTasks;
    private int overdueTasks;
    private double completionRate;
}
