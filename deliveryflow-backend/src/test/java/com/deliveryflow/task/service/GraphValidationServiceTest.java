package com.deliveryflow.task.service;

import com.deliveryflow.common.enums.DependencyType;
import com.deliveryflow.common.exception.InvalidDependencyException;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.entity.TaskDependency;
import com.deliveryflow.task.repository.TaskDependencyRepository;
import com.deliveryflow.task.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GraphValidationServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskDependencyRepository taskDependencyRepository;

    @InjectMocks
    private GraphValidationService graphValidationService;

    @Test
    public void whenSelfDependency_thenThrowsInvalidDependencyException() {
        assertThrows(InvalidDependencyException.class, () -> {
            graphValidationService.validateDependency("task-1", "task-1");
        });
    }

    @Test
    public void whenTasksInDifferentProjects_thenThrowsInvalidDependencyException() {
        Task task1 = new Task();
        task1.setId("task-1");
        task1.setProjectId("project-A");

        Task task2 = new Task();
        task2.setId("task-2");
        task2.setProjectId("project-B");

        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task1));
        when(taskRepository.findById("task-2")).thenReturn(Optional.of(task2));

        assertThrows(InvalidDependencyException.class, () -> {
            graphValidationService.validateDependency("task-1", "task-2");
        });
    }

    @Test
    public void whenNoCycle_thenValidationSucceeds() {
        Task task1 = new Task();
        task1.setId("task-1");
        task1.setProjectId("project-A");

        Task task2 = new Task();
        task2.setId("task-2");
        task2.setProjectId("project-A");

        Task task3 = new Task();
        task3.setId("task-3");
        task3.setProjectId("project-A");

        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task1));
        when(taskRepository.findById("task-2")).thenReturn(Optional.of(task2));
        when(taskRepository.findByProjectId("project-A")).thenReturn(Arrays.asList(task1, task2, task3));

        // Existing dependency: task-2 -> task-3
        TaskDependency dep1 = new TaskDependency("dep-1", "task-2", "task-3", DependencyType.BLOCKS, null, null);
        when(taskDependencyRepository.findByProjectId("project-A")).thenReturn(Collections.singletonList(dep1));

        // Proposing: task-1 -> task-2 (Final graph: 1 -> 2 -> 3, no cycles)
        assertDoesNotThrow(() -> {
            graphValidationService.validateDependency("task-1", "task-2");
        });
    }

    @Test
    public void whenDirectCycle_thenThrowsCircularDependencyException() {
        Task task1 = new Task();
        task1.setId("task-1");
        task1.setProjectId("project-A");

        Task task2 = new Task();
        task2.setId("task-2");
        task2.setProjectId("project-A");

        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task1));
        when(taskRepository.findById("task-2")).thenReturn(Optional.of(task2));
        when(taskRepository.findByProjectId("project-A")).thenReturn(Arrays.asList(task1, task2));

        // Existing dependency: task-2 -> task-1
        TaskDependency dep1 = new TaskDependency("dep-1", "task-2", "task-1", DependencyType.BLOCKS, null, null);
        when(taskDependencyRepository.findByProjectId("project-A")).thenReturn(Collections.singletonList(dep1));

        // Proposing: task-1 -> task-2 (Creates direct cycle 1 -> 2 -> 1)
        assertThrows(InvalidDependencyException.class, () -> {
            graphValidationService.validateDependency("task-1", "task-2");
        });
    }

    @Test
    public void whenIndirectCycle_thenThrowsCircularDependencyException() {
        Task task1 = new Task();
        task1.setId("task-1");
        task1.setProjectId("project-A");

        Task task2 = new Task();
        task2.setId("task-2");
        task2.setProjectId("project-A");

        Task task3 = new Task();
        task3.setId("task-3");
        task3.setProjectId("project-A");

        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task1));
        when(taskRepository.findById("task-3")).thenReturn(Optional.of(task3));
        when(taskRepository.findByProjectId("project-A")).thenReturn(Arrays.asList(task1, task2, task3));

        // Existing dependency: 1 -> 2 and 2 -> 3
        TaskDependency dep1 = new TaskDependency("dep-1", "task-1", "task-2", DependencyType.BLOCKS, null, null);
        TaskDependency dep2 = new TaskDependency("dep-2", "task-2", "task-3", DependencyType.BLOCKS, null, null);
        when(taskDependencyRepository.findByProjectId("project-A")).thenReturn(Arrays.asList(dep1, dep2));

        // Proposing: task-3 -> task-1 (Creates indirect cycle 1 -> 2 -> 3 -> 1)
        assertThrows(InvalidDependencyException.class, () -> {
            graphValidationService.validateDependency("task-3", "task-1");
        });
    }
}
