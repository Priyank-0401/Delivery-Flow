package com.deliveryflow.sprint.dto;

import com.deliveryflow.common.enums.SprintStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SprintResponse {
    private String id;
    private String projectId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
