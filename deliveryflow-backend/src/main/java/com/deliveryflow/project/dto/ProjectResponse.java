package com.deliveryflow.project.dto;

import com.deliveryflow.common.enums.ProjectStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProjectResponse {
    private String id;
    private String name;
    private String projectCode;
    private String managerId;
    private Integer health;
    private String risk;
    private ProjectStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
