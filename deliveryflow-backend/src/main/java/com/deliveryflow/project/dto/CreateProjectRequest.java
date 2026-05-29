package com.deliveryflow.project.dto;

import lombok.Data;

@Data
public class CreateProjectRequest {
    private String name;
    private String managerId;
}
