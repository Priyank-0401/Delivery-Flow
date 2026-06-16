package com.deliveryflow.task.service;

import com.deliveryflow.task.dto.CriticalPathResponse;
import com.deliveryflow.task.dto.TaskCpmDetails;
import com.deliveryflow.task.graph.entity.DependencyRelationship;
import com.deliveryflow.task.graph.entity.TaskNode;
import com.deliveryflow.task.graph.repository.TaskNodeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CriticalPathServiceTest {

    @Mock
    private TaskNodeRepository taskNodeRepository;

    @InjectMocks
    private CriticalPathService criticalPathService;

    @Test
    public void whenLinearSequence_thenDurationAndSlackAreCorrect() {
        // Arrange: A -> B -> C
        TaskNode taskC = TaskNode.builder().id("C").taskKey("C").title("Task C").estimatedHours(BigDecimal.valueOf(2)).blockedTasks(new HashSet<>()).build();
        
        DependencyRelationship relB = DependencyRelationship.builder().targetTask(taskC).type("BLOCKS").build();
        TaskNode taskB = TaskNode.builder().id("B").taskKey("B").title("Task B").estimatedHours(BigDecimal.valueOf(5)).blockedTasks(new HashSet<>(Collections.singletonList(relB))).build();
        
        DependencyRelationship relA = DependencyRelationship.builder().targetTask(taskB).type("BLOCKS").build();
        TaskNode taskA = TaskNode.builder().id("A").taskKey("A").title("Task A").estimatedHours(BigDecimal.valueOf(10)).blockedTasks(new HashSet<>(Collections.singletonList(relA))).build();

        when(taskNodeRepository.findByProjectId("project-1")).thenReturn(Arrays.asList(taskA, taskB, taskC));

        // Act
        CriticalPathResponse response = criticalPathService.calculateCriticalPath("project-1");

        // Assert
        assertNotNull(response);
        assertEquals(17.0, response.getProjectDuration());
        assertEquals(3, response.getCriticalPathTaskIds().size());
        assertTrue(response.getCriticalPathTaskIds().containsAll(Arrays.asList("A", "B", "C")));

        for (TaskCpmDetails task : response.getTasks()) {
            assertEquals(0.0, task.getSlack(), 0.001);
            assertTrue(task.isCritical());
            if (task.getTaskId().equals("A")) {
                assertEquals(0.0, task.getEarliestStart());
                assertEquals(10.0, task.getEarliestFinish());
            } else if (task.getTaskId().equals("B")) {
                assertEquals(10.0, task.getEarliestStart());
                assertEquals(15.0, task.getEarliestFinish());
            } else if (task.getTaskId().equals("C")) {
                assertEquals(10.0 + 5.0, task.getEarliestStart());
                assertEquals(10.0 + 5.0 + 2.0, task.getEarliestFinish());
            }
        }
    }

    @Test
    public void whenBranchingPaths_thenIdentifiesCorrectPathAndSlacks() {
        // Arrange:
        // A (10h) blocks B (5h) and C (2h)
        // B blocks D (3h)
        // C blocks D (3h)
        TaskNode taskD = TaskNode.builder().id("D").taskKey("D").title("Task D").estimatedHours(BigDecimal.valueOf(3)).blockedTasks(new HashSet<>()).build();

        DependencyRelationship relBtoD = DependencyRelationship.builder().targetTask(taskD).type("BLOCKS").build();
        TaskNode taskB = TaskNode.builder().id("B").taskKey("B").title("Task B").estimatedHours(BigDecimal.valueOf(5)).blockedTasks(new HashSet<>(Collections.singletonList(relBtoD))).build();

        DependencyRelationship relCtoD = DependencyRelationship.builder().targetTask(taskD).type("BLOCKS").build();
        TaskNode taskC = TaskNode.builder().id("C").taskKey("C").title("Task C").estimatedHours(BigDecimal.valueOf(2)).blockedTasks(new HashSet<>(Collections.singletonList(relCtoD))).build();

        DependencyRelationship relAtoB = DependencyRelationship.builder().targetTask(taskB).type("BLOCKS").build();
        DependencyRelationship relAtoC = DependencyRelationship.builder().targetTask(taskC).type("BLOCKS").build();
        TaskNode taskA = TaskNode.builder().id("A").taskKey("A").title("Task A").estimatedHours(BigDecimal.valueOf(10)).blockedTasks(new HashSet<>(Arrays.asList(relAtoB, relAtoC))).build();

        when(taskNodeRepository.findByProjectId("project-1")).thenReturn(Arrays.asList(taskA, taskB, taskC, taskD));

        // Act
        CriticalPathResponse response = criticalPathService.calculateCriticalPath("project-1");

        // Assert
        assertNotNull(response);
        assertEquals(18.0, response.getProjectDuration()); // Path: A(10) + B(5) + D(3) = 18
        assertEquals(3, response.getCriticalPathTaskIds().size());
        assertTrue(response.getCriticalPathTaskIds().containsAll(Arrays.asList("A", "B", "D")));
        assertFalse(response.getCriticalPathTaskIds().contains("C")); // C is not critical

        Map<String, TaskCpmDetails> taskDetails = new HashMap<>();
        for (TaskCpmDetails t : response.getTasks()) {
            taskDetails.put(t.getTaskId(), t);
        }

        // Check A
        assertTrue(taskDetails.get("A").isCritical());
        assertEquals(0.0, taskDetails.get("A").getSlack(), 0.001);

        // Check B
        assertTrue(taskDetails.get("B").isCritical());
        assertEquals(0.0, taskDetails.get("B").getSlack(), 0.001);

        // Check D
        assertTrue(taskDetails.get("D").isCritical());
        assertEquals(0.0, taskDetails.get("D").getSlack(), 0.001);

        // Check C
        assertFalse(taskDetails.get("C").isCritical());
        assertEquals(3.0, taskDetails.get("C").getSlack(), 0.001); // Slack = LS(13) - ES(10) = 3
        assertEquals(10.0, taskDetails.get("C").getEarliestStart());
        assertEquals(12.0, taskDetails.get("C").getEarliestFinish());
        assertEquals(13.0, taskDetails.get("C").getLatestStart());
        assertEquals(15.0, taskDetails.get("C").getLatestFinish());
    }
}
