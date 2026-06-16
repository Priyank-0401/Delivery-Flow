package com.deliveryflow.project.controller;

import com.deliveryflow.project.dto.CreateProjectRequest;
import com.deliveryflow.project.dto.ProjectResponse;
import com.deliveryflow.project.entity.ProjectTeam;
import com.deliveryflow.project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectResponse> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ProjectResponse getProjectById(@PathVariable String id) {
        return projectService.getProjectById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'PMO', 'MANAGER')")
    public ProjectResponse createProject(@Valid @RequestBody CreateProjectRequest request) {
        return projectService.createProject(request);
    }

    @PostMapping("/{projectId}/teams")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'PMO', 'MANAGER')")
    public ProjectTeam assignTeam(@PathVariable String projectId, @RequestBody Map<String, String> body) {
        return projectService.assignTeam(projectId, body.get("teamId"));
    }

    @GetMapping("/{projectId}/teams")
    public List<ProjectTeam> getProjectTeams(@PathVariable String projectId) {
        return projectService.getProjectTeams(projectId);
    }
}
