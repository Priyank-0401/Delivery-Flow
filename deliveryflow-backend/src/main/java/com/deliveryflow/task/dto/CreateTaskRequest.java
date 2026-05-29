package com.deliveryflow.task.dto;

import lombok.Data;

@Data
public class CreateTaskRequest {
    private String projectId;
    private String sprintId;
    private String assigneeId;
    private String title;
    private String description;
    private String priority;
    private String type;
    private Integer storyPoints;
    private String estimatedHours;
    private String dueDate;
}
