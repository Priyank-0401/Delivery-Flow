package com.deliveryflow.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDependencyRequest {
    @NotBlank(message = "Target task ID is required")
    private String targetTaskId;

    private String type; // e.g. BLOCKS, RELATES_TO (default to BLOCKS if null)
}
