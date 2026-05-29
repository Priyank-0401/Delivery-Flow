package com.deliveryflow.task.service;

import com.deliveryflow.task.dto.CreateTaskRequest;
import com.deliveryflow.task.dto.TaskResponse;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.mapper.TaskMapper;
import com.deliveryflow.task.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(TaskMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksByProject(String projectId) {
        return taskRepository.findByProjectId(projectId)
                .stream()
                .map(TaskMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksBySprint(String sprintId) {
        return taskRepository.findBySprintId(sprintId)
                .stream()
                .map(TaskMapper::toResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        return TaskMapper.toResponse(task);
    }

    public TaskResponse createTask(CreateTaskRequest request) {
        Task task = TaskMapper.toEntity(request);
        return TaskMapper.toResponse(taskRepository.save(task));
    }
}
