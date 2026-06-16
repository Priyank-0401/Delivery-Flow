package com.deliveryflow.health.service;

import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.entity.TaskDependency;
import com.deliveryflow.task.event.*;
import com.deliveryflow.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Listens for lifecycle events (task status changes, dependency mutations, sprint scope changes)
 * and triggers an immediate health recalculation for the affected project.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HealthUpdateEventListener {

    private final HealthCalculationService healthCalculationService;
    private final TaskRepository taskRepository;

    @Async
    @EventListener
    public void onTaskCreated(TaskCreatedEvent event) {
        String projectId = event.getTask().getProjectId();
        if (projectId != null) {
            log.info("Health recalculation triggered by TaskCreatedEvent for project {}", projectId);
            recalculateSafely(projectId);
        }
    }

    @Async
    @EventListener
    public void onTaskUpdated(TaskUpdatedEvent event) {
        String projectId = event.getTask().getProjectId();
        if (projectId != null) {
            log.info("Health recalculation triggered by TaskUpdatedEvent for project {}", projectId);
            recalculateSafely(projectId);
        }
    }

    @Async
    @EventListener
    public void onTaskDeleted(TaskDeletedEvent event) {
        // TaskDeletedEvent only carries the taskId, not the projectId.
        // We cannot look up a deleted task, so we skip recalculation here.
        // The nightly snapshot will catch it.
        log.debug("TaskDeletedEvent received for task {}, skipping immediate recalc", event.getTaskId());
    }

    @Async
    @EventListener
    public void onDependencyCreated(DependencyCreatedEvent event) {
        TaskDependency dep = event.getDependency();
        String projectId = resolveProjectId(dep.getSourceTaskId());
        if (projectId != null) {
            log.info("Health recalculation triggered by DependencyCreatedEvent for project {}", projectId);
            recalculateSafely(projectId);
        }
    }

    @Async
    @EventListener
    public void onDependencyDeleted(DependencyDeletedEvent event) {
        String projectId = resolveProjectId(event.getSourceTaskId());
        if (projectId != null) {
            log.info("Health recalculation triggered by DependencyDeletedEvent for project {}", projectId);
            recalculateSafely(projectId);
        }
    }

    private String resolveProjectId(String taskId) {
        if (taskId == null) return null;
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        return taskOpt.map(Task::getProjectId).orElse(null);
    }

    private void recalculateSafely(String projectId) {
        try {
            healthCalculationService.calculateAndSaveProjectHealth(projectId);
        } catch (Exception e) {
            log.error("Failed to recalculate health for project {} on event trigger", projectId, e);
        }
    }
}
