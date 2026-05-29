package com.deliveryflow.sprint.dto;

import lombok.Data;

@Data
public class CreateSprintRequest {
    private String projectId;
    private String name;
    private String startDate;
    private String endDate;
}
