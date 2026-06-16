package com.deliveryflow.task.service;

import com.deliveryflow.common.enums.DependencyType;
import com.deliveryflow.common.exception.InvalidDependencyException;
import com.deliveryflow.common.exception.ResourceNotFoundException;
import com.deliveryflow.task.dto.GraphEdgeDto;
import com.deliveryflow.task.dto.GraphNodeDto;
import com.deliveryflow.task.dto.ProjectGraphResponse;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.entity.TaskDependency;
import com.deliveryflow.task.event.DependencyCreatedEvent;
import com.deliveryflow.task.event.DependencyDeletedEvent;
import com.deliveryflow.task.repository.TaskDependencyRepository;
import com.deliveryflow.task.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskDependencyService {

    private final TaskRepository taskRepository;
    private final TaskDependencyRepository taskDependencyRepository;
    private final GraphValidationService graphValidationService;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public TaskDependencyService(TaskRepository taskRepository,
                                 TaskDependencyRepository taskDependencyRepository,
                                 GraphValidationService graphValidationService,
                                 ApplicationEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.taskDependencyRepository = taskDependencyRepository;
        this.graphValidationService = graphValidationService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public TaskDependency addDependency(String sourceTaskId, String targetTaskId, DependencyType type) {
        // 1. Run cycle detection validation using Postgres data
        graphValidationService.validateDependency(sourceTaskId, targetTaskId);

        // 2. Check if dependency already exists to avoid DB unique constraint failures
        if (taskDependencyRepository.existsBySourceTaskIdAndTargetTaskId(sourceTaskId, targetTaskId)) {
            throw new InvalidDependencyException("Dependency already exists");
        }

        // 3. Persist dependency in Postgres
        TaskDependency dependency = new TaskDependency();
        dependency.setSourceTaskId(sourceTaskId);
        dependency.setTargetTaskId(targetTaskId);
        dependency.setDependencyType(type);

        TaskDependency savedDep = taskDependencyRepository.save(dependency);

        // 4. Publish event to trigger Neo4j async sync after commit
        eventPublisher.publishEvent(new DependencyCreatedEvent(this, savedDep));

        return savedDep;
    }

    @Transactional
    public void removeDependency(String sourceTaskId, String targetTaskId) {
        TaskDependency dependency = taskDependencyRepository.findBySourceTaskIdAndTargetTaskId(sourceTaskId, targetTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Dependency from " + sourceTaskId + " to " + targetTaskId + " not found", ""));

        taskDependencyRepository.delete(dependency);

        // Publish event to trigger Neo4j sync
        eventPublisher.publishEvent(new DependencyDeletedEvent(this, sourceTaskId, targetTaskId));
    }

    public ProjectGraphResponse getProjectGraph(String projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        List<TaskDependency> dependencies = taskDependencyRepository.findByProjectId(projectId);

        List<GraphNodeDto> nodes = tasks.stream()
                .map(t -> GraphNodeDto.builder()
                        .id(t.getId())
                        .label(t.getTitle())
                        .status(t.getStatus() != null ? t.getStatus().name() : null)
                        .taskKey(t.getTaskKey())
                        .storyPoints(t.getStoryPoints())
                        .estimatedHours(t.getEstimatedHours())
                        .build())
                .collect(Collectors.toList());

        List<GraphEdgeDto> edges = dependencies.stream()
                .map(d -> GraphEdgeDto.builder()
                        .id(d.getId())
                        .source(d.getSourceTaskId())
                        .target(d.getTargetTaskId())
                        .type(d.getDependencyType() != null ? d.getDependencyType().name() : "BLOCKS")
                        .build())
                .collect(Collectors.toList());

        return ProjectGraphResponse.builder()
                .nodes(nodes)
                .edges(edges)
                .build();
    }
}
