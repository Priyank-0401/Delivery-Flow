package com.deliveryflow.task.dto;

import com.deliveryflow.common.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {
    @NotNull(message = "Status cannot be null")
    private TaskStatus status;
}
