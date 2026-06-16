package com.deliveryflow.task.service;

import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.entity.TaskDependency;
import com.deliveryflow.task.graph.entity.DependencyRelationship;
import com.deliveryflow.task.graph.entity.TaskNode;
import com.deliveryflow.task.graph.repository.TaskNodeRepository;
import com.deliveryflow.task.repository.TaskDependencyRepository;
import com.deliveryflow.task.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class GraphRebuildService {

      private final TaskRepository taskRepository;
      private final TaskDependencyRepository taskDependencyRepository;
      private final TaskNodeRepository taskNodeRepository;

      @Autowired
      public GraphRebuildService(TaskRepository taskRepository,
                                 TaskDependencyRepository taskDependencyRepository,
                                 TaskNodeRepository taskNodeRepository) {
          this.taskRepository = taskRepository;
          this.taskDependencyRepository = taskDependencyRepository;
          this.taskNodeRepository = taskNodeRepository;
      }

      @Transactional
      public void rebuildGraph() {
          // 1. Purge the Neo4j database
          taskNodeRepository.deleteAll();

          // 2. Fetch all Tasks from Postgres
          List<Task> postgresTasks = taskRepository.findAll();
          Map<String, TaskNode> nodeMap = new HashMap<>();

          for (Task task : postgresTasks) {
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
              nodeMap.put(task.getId(), node);
          }

          // Save nodes first to establish them in Neo4j
          taskNodeRepository.saveAll(nodeMap.values());

          // 3. Fetch all TaskDependencies from Postgres
          List<TaskDependency> dependencies = taskDependencyRepository.findAll();

          for (TaskDependency dep : dependencies) {
              TaskNode sourceNode = nodeMap.get(dep.getSourceTaskId());
              TaskNode targetNode = nodeMap.get(dep.getTargetTaskId());

              if (sourceNode != null && targetNode != null) {
                  DependencyRelationship rel = DependencyRelationship.builder()
                          .targetTask(targetNode)
                          .type(dep.getDependencyType() != null ? dep.getDependencyType().name() : "BLOCKS")
                          .createdAt(dep.getCreatedAt())
                          .createdBy("SYSTEM_REBUILD")
                          .confidenceScore(1.0)
                          .riskWeight(1.0)
                          .build();
                  sourceNode.getBlockedTasks().add(rel);
              }
          }

          // 4. Save nodes with their relationships
          taskNodeRepository.saveAll(nodeMap.values());
      }
}
