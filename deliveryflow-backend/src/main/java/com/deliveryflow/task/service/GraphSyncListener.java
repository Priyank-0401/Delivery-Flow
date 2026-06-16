package com.deliveryflow.task.service;

import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.entity.TaskDependency;
import com.deliveryflow.task.event.*;
import com.deliveryflow.task.graph.entity.DependencyRelationship;
import com.deliveryflow.task.graph.entity.TaskNode;
import com.deliveryflow.task.graph.repository.TaskNodeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashSet;
import java.util.Optional;

@Component
@Slf4j
public class GraphSyncListener {

    private final TaskNodeRepository taskNodeRepository;

    @Autowired
    public GraphSyncListener(TaskNodeRepository taskNodeRepository) {
        this.taskNodeRepository = taskNodeRepository;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTaskCreated(TaskCreatedEvent event) {
        Task task = event.getTask();
        log.info("Syncing created task {} to Neo4j", task.getId());
        TaskNode node = TaskNode.builder()
                .id(task.getId())
                .taskKey(task.getTaskKey())
                .title(task.getTitle())
                .status(task.getStatus() != null ? task.getStatus().name() : null)
                .projectId(task.getProjectId())
                .dueDate(task.getDueDate())
                .storyPoints(task.getStoryPoints())
                .estimatedHours(task.getEstimatedHours())
                .blockedTasks(new HashSet<>())
                .build();
        taskNodeRepository.save(node);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTaskUpdated(TaskUpdatedEvent event) {
        Task task = event.getTask();
        log.info("Syncing updated task {} to Neo4j", task.getId());
        Optional<TaskNode> existingNode = taskNodeRepository.findById(task.getId());
        TaskNode node;
        if (existingNode.isPresent()) {
            node = existingNode.get();
            node.setTaskKey(task.getTaskKey());
            node.setTitle(task.getTitle());
            node.setStatus(task.getStatus() != null ? task.getStatus().name() : null);
            node.setProjectId(task.getProjectId());
            node.setDueDate(task.getDueDate());
            node.setStoryPoints(task.getStoryPoints());
            node.setEstimatedHours(task.getEstimatedHours());
        } else {
            node = TaskNode.builder()
                    .id(task.getId())
                    .taskKey(task.getTaskKey())
                    .title(task.getTitle())
                    .status(task.getStatus() != null ? task.getStatus().name() : null)
                    .projectId(task.getProjectId())
                    .dueDate(task.getDueDate())
                    .storyPoints(task.getStoryPoints())
                    .estimatedHours(task.getEstimatedHours())
                    .blockedTasks(new HashSet<>())
                    .build();
        }
        taskNodeRepository.save(node);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTaskDeleted(TaskDeletedEvent event) {
        String taskId = event.getTaskId();
        log.info("Syncing deleted task {} to Neo4j", taskId);
        taskNodeRepository.deleteById(taskId);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDependencyCreated(DependencyCreatedEvent event) {
        TaskDependency dep = event.getDependency();
        log.info("Syncing created dependency from {} to {} to Neo4j", dep.getSourceTaskId(), dep.getTargetTaskId());
        Optional<TaskNode> sourceOpt = taskNodeRepository.findById(dep.getSourceTaskId());
        Optional<TaskNode> targetOpt = taskNodeRepository.findById(dep.getTargetTaskId());

        if (sourceOpt.isPresent() && targetOpt.isPresent()) {
            TaskNode source = sourceOpt.get();
            TaskNode target = targetOpt.get();

            // Ensure no duplicate relationships are saved in the graph entity list
            source.getBlockedTasks().removeIf(r -> r.getTargetTask().getId().equals(target.getId()));

            DependencyRelationship rel = DependencyRelationship.builder()
                    .targetTask(target)
                    .type(dep.getDependencyType() != null ? dep.getDependencyType().name() : "BLOCKS")
                    .createdAt(dep.getCreatedAt())
                    .createdBy("SYSTEM_EVENT")
                    .confidenceScore(1.0)
                    .riskWeight(1.0)
                    .build();
            source.getBlockedTasks().add(rel);
            taskNodeRepository.save(source);
        } else {
            log.warn("Could not sync dependency to Neo4j: source/target task not found in graph database");
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDependencyDeleted(DependencyDeletedEvent event) {
        log.info("Syncing deleted dependency from {} to {} to Neo4j", event.getSourceTaskId(), event.getTargetTaskId());
        Optional<TaskNode> sourceOpt = taskNodeRepository.findById(event.getSourceTaskId());
        if (sourceOpt.isPresent()) {
            TaskNode source = sourceOpt.get();
            boolean removed = source.getBlockedTasks().removeIf(r -> r.getTargetTask().getId().equals(event.getTargetTaskId()));
            if (removed) {
                taskNodeRepository.save(source);
            }
        }
    }
}
