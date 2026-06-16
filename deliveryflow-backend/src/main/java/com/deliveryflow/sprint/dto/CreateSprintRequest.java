package com.deliveryflow.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSprintRequest {
    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Sprint name is required")
    private String name;

    private String startDate;
    private String endDate;
}
