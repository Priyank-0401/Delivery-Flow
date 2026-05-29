package com.deliveryflow.task.dto;

import com.deliveryflow.common.enums.TaskPriority;
import com.deliveryflow.common.enums.TaskStatus;
import com.deliveryflow.common.enums.TaskType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private String id;
    private String projectId;
    private String sprintId;
    private String assigneeId;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private TaskType type;
    private Integer storyPoints;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private String externalId;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
