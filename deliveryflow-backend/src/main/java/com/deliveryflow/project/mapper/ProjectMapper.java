package com.deliveryflow.project.mapper;

import com.deliveryflow.project.dto.CreateProjectRequest;
import com.deliveryflow.project.dto.ProjectResponse;
import com.deliveryflow.project.entity.Project;

public class ProjectMapper {

    public static ProjectResponse toResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setProjectCode(project.getProjectCode());
        response.setManagerId(project.getManagerId());
        response.setHealth(project.getHealth());
        response.setRisk(project.getRisk());
        response.setStatus(project.getStatus());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        return response;
    }

    public static Project toEntity(CreateProjectRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setManagerId(request.getManagerId());
        return project;
    }
}
