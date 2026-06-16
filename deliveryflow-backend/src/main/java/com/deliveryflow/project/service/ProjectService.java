package com.deliveryflow.project.service;

import com.deliveryflow.common.exception.ResourceNotFoundException;
import com.deliveryflow.project.dto.CreateProjectRequest;
import com.deliveryflow.project.dto.ProjectResponse;
import com.deliveryflow.project.entity.Project;
import com.deliveryflow.project.entity.ProjectTeam;
import com.deliveryflow.project.mapper.ProjectMapper;
import com.deliveryflow.project.repository.ProjectRepository;
import com.deliveryflow.project.repository.ProjectTeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTeamRepository projectTeamRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository, ProjectTeamRepository projectTeamRepository) {
        this.projectRepository = projectRepository;
        this.projectTeamRepository = projectTeamRepository;
    }

    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        return ProjectMapper.toResponse(project);
    }

    public ProjectResponse createProject(CreateProjectRequest request) {
        Project project = ProjectMapper.toEntity(request);
        if (project.getManagerId() == null) {
            project.setManagerId("USR-1");
        }
        return ProjectMapper.toResponse(projectRepository.save(project));
    }

    public ProjectTeam assignTeam(String projectId, String teamId) {
        // Verify project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        ProjectTeam projectTeam = new ProjectTeam();
        projectTeam.setProjectId(projectId);
        projectTeam.setTeamId(teamId);
        return projectTeamRepository.save(projectTeam);
    }

    public List<ProjectTeam> getProjectTeams(String projectId) {
        return projectTeamRepository.findByProjectId(projectId);
    }
}
