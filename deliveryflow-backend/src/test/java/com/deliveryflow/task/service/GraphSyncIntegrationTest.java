package com.deliveryflow.task.service;

import com.deliveryflow.common.enums.DependencyType;
import com.deliveryflow.common.enums.ProjectStatus;
import com.deliveryflow.project.entity.Project;
import com.deliveryflow.project.repository.ProjectRepository;
import com.deliveryflow.task.dto.CreateTaskRequest;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.graph.entity.TaskNode;
import com.deliveryflow.task.graph.repository.TaskNodeRepository;
import com.deliveryflow.task.repository.TaskDependencyRepository;
import com.deliveryflow.task.repository.TaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
public class GraphSyncIntegrationTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskDependencyService taskDependencyService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskDependencyRepository taskDependencyRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @MockBean
    private TaskNodeRepository taskNodeRepository;

    private String testProjectId;
    private String createdTaskId;
    private String secondTaskId;

    @BeforeEach
    public void setUp() {
        Project project = new Project();
        project.setName("Test Sync Project");
        project.setProjectCode("TSYNC");
        project.setStatus(ProjectStatus.ACTIVE);
        project = projectRepository.save(project);
        testProjectId = project.getId();
    }

    @AfterEach
    public void tearDown() {
        if (createdTaskId != null) {
            try {
                taskRepository.deleteById(createdTaskId);
            } catch (Exception e) {
                // Ignore cleanup failures
            }
        }
        if (secondTaskId != null) {
            try {
                taskRepository.deleteById(secondTaskId);
            } catch (Exception e) {
                // Ignore cleanup failures
            }
        }
        if (testProjectId != null) {
            try {
                projectRepository.deleteById(testProjectId);
            } catch (Exception e) {
                // Ignore cleanup failures
            }
        }
    }

    @Test
    public void whenTaskCreated_thenSyncsToNeo4j() {
        // Arrange
        CreateTaskRequest request = new CreateTaskRequest();
        request.setProjectId(testProjectId);
        request.setTitle("Sync Test Task");
        request.setStoryPoints(3);
        request.setEstimatedHours("12");

        // Act
        var response = taskService.createTask(request);
        createdTaskId = response.getId();

        // Assert: Verify Neo4j repository save was invoked via event listener
        ArgumentCaptor<TaskNode> captor = ArgumentCaptor.forClass(TaskNode.class);
        verify(taskNodeRepository, timeout(1000).times(1)).save(captor.capture());
        
        TaskNode savedNode = captor.getValue();
        assertEquals(createdTaskId, savedNode.getId());
        assertEquals(testProjectId, savedNode.getProjectId());
        assertEquals("Sync Test Task", savedNode.getTitle());
        assertEquals(12.0, savedNode.getEstimatedHours().doubleValue());
    }

    @Test
    public void whenDependencyCreated_thenSyncsToNeo4j() {
        // Arrange: Create two tasks in Postgres under testProjectId
        Task source = new Task();
        source.setProjectId(testProjectId);
        source.setTitle("Source Task");
        source.setTaskKey("S-1");
        source = taskRepository.save(source);
        createdTaskId = source.getId();

        Task target = new Task();
        target.setProjectId(testProjectId);
        target.setTitle("Target Task");
        target.setTaskKey("T-1");
        target = taskRepository.save(target);
        secondTaskId = target.getId();

        // Mock Neo4j nodes retrieval
        TaskNode sourceNode = TaskNode.builder().id(createdTaskId).projectId(testProjectId).build();
        TaskNode targetNode = TaskNode.builder().id(secondTaskId).projectId(testProjectId).build();
        when(taskNodeRepository.findById(createdTaskId)).thenReturn(Optional.of(sourceNode));
        when(taskNodeRepository.findById(secondTaskId)).thenReturn(Optional.of(targetNode));

        // Act: Create dependency
        taskDependencyService.addDependency(createdTaskId, secondTaskId, DependencyType.BLOCKS);

        // Assert: Verify sync listener triggered saving the updated source node
        verify(taskNodeRepository, timeout(1000).times(1)).save(argThat(node -> 
            node.getId().equals(createdTaskId) && 
            node.getBlockedTasks().stream().anyMatch(rel -> rel.getTargetTask().getId().equals(secondTaskId))
        ));

        // Clean up database relation
        try {
            taskDependencyRepository.deleteBySourceTaskIdAndTargetTaskId(createdTaskId, secondTaskId);
        } catch (Exception e) {
            // Ignore cleanup failures
        }
    }
}
