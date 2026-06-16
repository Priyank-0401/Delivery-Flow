package com.deliveryflow.task.service;

import com.deliveryflow.common.exception.ResourceNotFoundException;
import com.deliveryflow.task.dto.CreateTaskRequest;
import com.deliveryflow.task.dto.TaskResponse;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.event.TaskCreatedEvent;
import com.deliveryflow.task.event.TaskDeletedEvent;
import com.deliveryflow.project.repository.ProjectRepository;
import com.deliveryflow.task.mapper.TaskMapper;
import com.deliveryflow.task.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       ApplicationEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.eventPublisher = eventPublisher;
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
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        return TaskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        Task task = TaskMapper.toEntity(request);
        if (task.getTaskKey() == null) {
            String projectCode = "TASK";
            if (task.getProjectId() != null) {
                projectCode = projectRepository.findById(task.getProjectId())
                        .map(com.deliveryflow.project.entity.Project::getProjectCode)
                        .orElse("TASK");
            }
            long count = taskRepository.count();
            task.setTaskKey(projectCode + "-" + (count + 1));
        }
        System.out.println("DEBUG: taskKey=" + task.getTaskKey() + ", projectId=" + task.getProjectId() + ", title=" + task.getTitle());
        Task savedTask = taskRepository.save(task);
        eventPublisher.publishEvent(new TaskCreatedEvent(this, savedTask));
        return TaskMapper.toResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTaskStatus(String id, com.deliveryflow.common.enums.TaskStatus newStatus) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        task.setStatus(newStatus);
        Task savedTask = taskRepository.save(task);
        eventPublisher.publishEvent(new com.deliveryflow.task.event.TaskUpdatedEvent(this, savedTask));
        return TaskMapper.toResponse(savedTask);
    }

    @Transactional
    public void deleteTask(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        taskRepository.delete(task);
        eventPublisher.publishEvent(new TaskDeletedEvent(this, id));
    }
}
