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
        
        String code = request.getProjectCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateProjectCode(request.getName());
        }
        project.setProjectCode(code.toUpperCase());
        
        return project;
    }

    private static String generateProjectCode(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "PROJ";
        }
        String clean = name.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        if (clean.length() >= 3) {
            return clean.substring(0, 3);
        }
        return clean.isEmpty() ? "PROJ" : clean;
    }
}
