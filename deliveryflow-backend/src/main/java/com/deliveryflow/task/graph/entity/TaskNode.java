package com.deliveryflow.task.graph.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Node("Task")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskNode {

    @Id
    private String id; // Matches task id in Postgres

    private String taskKey;
    private String title;
    private String status;
    private String projectId;
    private LocalDate dueDate;
    private Integer storyPoints;
    private BigDecimal estimatedHours; // Used for duration in CPM math

    @Builder.Default
    @Relationship(type = "BLOCKS", direction = Relationship.Direction.OUTGOING)
    private Set<DependencyRelationship> blockedTasks = new HashSet<>();
}
