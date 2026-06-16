package com.deliveryflow.task.controller;

import com.deliveryflow.common.enums.DependencyType;
import com.deliveryflow.task.dto.CreateDependencyRequest;
import com.deliveryflow.task.dto.CriticalPathResponse;
import com.deliveryflow.task.dto.ProjectGraphResponse;
import com.deliveryflow.task.entity.TaskDependency;
import com.deliveryflow.task.service.CriticalPathService;
import com.deliveryflow.task.service.TaskDependencyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class TaskDependencyController {

    private final TaskDependencyService taskDependencyService;
    private final CriticalPathService criticalPathService;

    @Autowired
    public TaskDependencyController(TaskDependencyService taskDependencyService, CriticalPathService criticalPathService) {
        this.taskDependencyService = taskDependencyService;
        this.criticalPathService = criticalPathService;
    }

    @PostMapping("/tasks/{id}/dependencies")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'PMO', 'ADMIN')")
    public TaskDependency addDependency(
            @PathVariable("id") String sourceTaskId,
            @Valid @RequestBody CreateDependencyRequest request) {
        DependencyType depType = DependencyType.BLOCKS;
        if (request.getType() != null) {
            try {
                depType = DependencyType.valueOf(request.getType().toUpperCase());
            } catch (IllegalArgumentException e) {
                // fall back to BLOCKS
            }
        }
        return taskDependencyService.addDependency(sourceTaskId, request.getTargetTaskId(), depType);
    }

    @DeleteMapping("/tasks/{id}/dependencies/{targetTaskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'PMO', 'ADMIN')")
    public void deleteDependency(
            @PathVariable("id") String sourceTaskId,
            @PathVariable("targetTaskId") String targetTaskId) {
        taskDependencyService.removeDependency(sourceTaskId, targetTaskId);
    }

    @GetMapping("/projects/{projectId}/graph")
    public ProjectGraphResponse getProjectGraph(@PathVariable("projectId") String projectId) {
        return taskDependencyService.getProjectGraph(projectId);
    }

    @GetMapping("/projects/{projectId}/critical-path")
    public CriticalPathResponse getCriticalPath(@PathVariable("projectId") String projectId) {
        return criticalPathService.calculateCriticalPath(projectId);
    }
}
