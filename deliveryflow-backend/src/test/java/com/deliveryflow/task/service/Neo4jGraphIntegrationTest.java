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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class Neo4jGraphIntegrationTest {

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

    @Autowired
    private TaskNodeRepository taskNodeRepository;

    @Autowired
    private GraphRebuildService graphRebuildService;

    private String testProjectId;
    private String createdTaskId;
    private String secondTaskId;

    @BeforeEach
    public void setUp() {
        try {
            taskNodeRepository.deleteAll(); // Purge Neo4j test data
        } catch (Exception e) {
            // Ignore connection errors if database is temporarily unavailable during setup checks
        }

        Project project = new Project();
        project.setName("Test Real Neo4j Project");
        project.setProjectCode("TNEO");
        project.setStatus(ProjectStatus.ACTIVE);
        project = projectRepository.save(project);
        testProjectId = project.getId();
    }

    @AfterEach
    public void tearDown() {
        if (createdTaskId != null) {
            try { taskRepository.deleteById(createdTaskId); } catch (Exception e) {}
        }
        if (secondTaskId != null) {
            try { taskRepository.deleteById(secondTaskId); } catch (Exception e) {}
        }
        if (testProjectId != null) {
            try { projectRepository.deleteById(testProjectId); } catch (Exception e) {}
        }
        try { taskNodeRepository.deleteAll(); } catch (Exception e) {}
    }

    @Test
    public void testTaskAndDependencySyncToNeo4j() throws Exception {
        // 1. Create a task in Postgres, verify it syncs to Neo4j
        CreateTaskRequest request = new CreateTaskRequest();
        request.setProjectId(testProjectId);
        request.setTitle("Real Neo4j Task 1");
        request.setStoryPoints(5);
        request.setEstimatedHours("24");

        var response = taskService.createTask(request);
        createdTaskId = response.getId();

        // Check if saved to Neo4j
        Optional<TaskNode> node1Opt = taskNodeRepository.findById(createdTaskId);
        assertTrue(node1Opt.isPresent(), "TaskNode 1 should be synced to Neo4j");
        TaskNode node1 = node1Opt.get();
        assertEquals("Real Neo4j Task 1", node1.getTitle());
        assertEquals(24.0, node1.getEstimatedHours().doubleValue());

        // 2. Create another task
        CreateTaskRequest request2 = new CreateTaskRequest();
        request2.setProjectId(testProjectId);
        request2.setTitle("Real Neo4j Task 2");
        request2.setStoryPoints(3);
        request2.setEstimatedHours("8");

        var response2 = taskService.createTask(request2);
        secondTaskId = response2.getId();

        Optional<TaskNode> node2Opt = taskNodeRepository.findById(secondTaskId);
        assertTrue(node2Opt.isPresent(), "TaskNode 2 should be synced to Neo4j");

        // 3. Create a dependency between them (Task 1 blocks Task 2)
        taskDependencyService.addDependency(createdTaskId, secondTaskId, DependencyType.BLOCKS);

        // Verify the relationship exists in Neo4j
        Optional<TaskNode> updatedNode1Opt = taskNodeRepository.findById(createdTaskId);
        assertTrue(updatedNode1Opt.isPresent());
        TaskNode updatedNode1 = updatedNode1Opt.get();
        assertFalse(updatedNode1.getBlockedTasks().isEmpty(), "Task 1 should block another task in Neo4j");
        boolean blocksTarget = updatedNode1.getBlockedTasks().stream()
                .anyMatch(rel -> rel.getTargetTask().getId().equals(secondTaskId) && "BLOCKS".equals(rel.getType()));
        assertTrue(blocksTarget, "Task 1 should block Task 2 in Neo4j with relationship BLOCKS");

        // 4. Test GraphRebuildService
        // Delete Neo4j node directly to simulate desync
        taskNodeRepository.deleteById(createdTaskId);
        assertFalse(taskNodeRepository.existsById(createdTaskId), "Node should be deleted in Neo4j");

        // Run rebuild
        graphRebuildService.rebuildGraph();

        // Verify it was reconstructed from Postgres
        assertTrue(taskNodeRepository.existsById(createdTaskId), "Node should be reconstructed in Neo4j");
        assertTrue(taskNodeRepository.existsById(secondTaskId), "Node 2 should be reconstructed in Neo4j");
    }
}
