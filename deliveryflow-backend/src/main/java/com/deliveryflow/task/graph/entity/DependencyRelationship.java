package com.deliveryflow.task.graph.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.LocalDateTime;

@RelationshipProperties
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DependencyRelationship {

    @RelationshipId
    private Long id;

    @TargetNode
    private TaskNode targetTask;

    private String type; // BLOCKS, RELATES_TO, DUPLICATES, DEPENDS_ON
    private String createdBy;
    private LocalDateTime createdAt;
    private Double confidenceScore;
    private Double riskWeight;
}
