package com.deliveryflow.analytics.dto;

import lombok.Data;

@Data
public class SprintMetricsDTO {
    private String sprintId;
    private int velocity;
    private int completedStoryPoints;
    private int remainingStoryPoints;
}
