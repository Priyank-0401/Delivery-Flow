package com.deliveryflow.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "Project ID is required")
    private String projectId;
    
    private String sprintId;
    private String assigneeId;
    
    @NotBlank(message = "Task title is required")
    private String title;
    
    private String description;
    private String priority;
    private String type;
    private Integer storyPoints;
    private String estimatedHours;
    private String dueDate;
}
