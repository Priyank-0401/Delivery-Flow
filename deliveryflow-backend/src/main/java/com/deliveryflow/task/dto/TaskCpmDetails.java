package com.deliveryflow.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TaskCpmDetails {
    private String taskId;
    private String taskKey;
    private String title;
    private double earliestStart;
    private double earliestFinish;
    private double latestStart;
    private double latestFinish;
    private double slack;
    private boolean isCritical;
}
