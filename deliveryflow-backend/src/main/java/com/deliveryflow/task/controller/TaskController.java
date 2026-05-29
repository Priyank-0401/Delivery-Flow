package com.deliveryflow.task.controller;

import com.deliveryflow.task.dto.CreateTaskRequest;
import com.deliveryflow.task.dto.TaskResponse;
import com.deliveryflow.task.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
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
    public TaskResponse createTask(@RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }
}
