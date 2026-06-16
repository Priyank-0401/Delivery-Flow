package com.deliveryflow.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CriticalPathResponse {
    private List<String> criticalPathTaskIds;
    private double projectDuration;
    private List<TaskCpmDetails> tasks;
}
