package com.deliveryflow.task.controller;

import com.deliveryflow.task.dto.CreateTaskRequest;
import com.deliveryflow.task.dto.TaskResponse;
import com.deliveryflow.task.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> getAllTasks(@RequestParam(required = false) String projectId,
                                          @RequestParam(required = false) String sprintId) {
        if (projectId != null) {
            return taskService.getTasksByProject(projectId);
        }
        if (sprintId != null) {
            return taskService.getTasksBySprint(sprintId);
        }
        return taskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public TaskResponse getTaskById(@PathVariable String id) {
        return taskService.getTaskById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'PMO', 'MANAGER', 'MEMBER')")
    public TaskResponse createTask(@Valid @RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PMO', 'MANAGER', 'MEMBER')")
    public TaskResponse updateTaskStatus(@PathVariable String id, @Valid @RequestBody com.deliveryflow.task.dto.UpdateTaskStatusRequest request) {
        return taskService.updateTaskStatus(id, request.getStatus());
    }
}
