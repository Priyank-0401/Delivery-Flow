package com.deliveryflow.task.service;

import com.deliveryflow.common.exception.InvalidDependencyException;
import com.deliveryflow.common.exception.ResourceNotFoundException;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.entity.TaskDependency;
import com.deliveryflow.task.repository.TaskDependencyRepository;
import com.deliveryflow.task.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GraphValidationService {

    private final TaskRepository taskRepository;
    private final TaskDependencyRepository taskDependencyRepository;

    @Autowired
    public GraphValidationService(TaskRepository taskRepository, TaskDependencyRepository taskDependencyRepository) {
        this.taskRepository = taskRepository;
        this.taskDependencyRepository = taskDependencyRepository;
    }

    /**
     * Validates whether adding a dependency from sourceTaskId to targetTaskId creates a cycle.
     * Throws InvalidDependencyException if a cycle is detected or if tasks are invalid.
     */
    public void validateDependency(String sourceTaskId, String targetTaskId) {
        if (sourceTaskId.equals(targetTaskId)) {
            throw new InvalidDependencyException("A task cannot depend on itself");
        }

        Task sourceTask = taskRepository.findById(sourceTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", sourceTaskId));
        Task targetTask = taskRepository.findById(targetTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", targetTaskId));

        if (!sourceTask.getProjectId().equals(targetTask.getProjectId())) {
            throw new InvalidDependencyException("Tasks must belong to the same project");
        }

        String projectId = sourceTask.getProjectId();

        // 1. Fetch all existing dependencies for the project
        List<TaskDependency> existingDependencies = taskDependencyRepository.findByProjectId(projectId);

        // 2. Build adjacency list of dependencies
        // Key represents the source task (the blocker), value lists the target tasks (blocked tasks)
        Map<String, List<String>> adjList = new HashMap<>();

        // Initialize entries for all tasks in the project to make DFS traversal simple
        List<Task> projectTasks = taskRepository.findByProjectId(projectId);
        for (Task t : projectTasks) {
            adjList.put(t.getId(), new ArrayList<>());
        }

        // Populate existing edges
        for (TaskDependency dep : existingDependencies) {
            if (adjList.containsKey(dep.getSourceTaskId())) {
                adjList.get(dep.getSourceTaskId()).add(dep.getTargetTaskId());
            }
        }

        // Add the proposed edge
        if (adjList.containsKey(sourceTaskId)) {
            adjList.get(sourceTaskId).add(targetTaskId);
        } else {
            adjList.put(sourceTaskId, new ArrayList<>(List.of(targetTaskId)));
        }

        // 3. DFS to detect cycles
        if (hasCycle(adjList)) {
            throw new InvalidDependencyException("Circular dependency detected");
        }
    }

    private boolean hasCycle(Map<String, List<String>> adjList) {
        Set<String> visited = new HashSet<>();
        Set<String> recStack = new HashSet<>();

        for (String node : adjList.keySet()) {
            if (dfs(node, adjList, visited, recStack)) {
                return true;
            }
        }
        return false;
    }

    private boolean dfs(String node, Map<String, List<String>> adjList, Set<String> visited, Set<String> recStack) {
        if (recStack.contains(node)) {
            return true;
        }
        if (visited.contains(node)) {
            return false;
        }

        visited.add(node);
        recStack.add(node);

        List<String> neighbors = adjList.get(node);
        if (neighbors != null) {
            for (String neighbor : neighbors) {
                if (dfs(neighbor, adjList, visited, recStack)) {
                    return true;
                }
            }
        }

        recStack.remove(node);
        return false;
    }
}
