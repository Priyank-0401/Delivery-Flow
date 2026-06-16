package com.deliveryflow.task.graph.repository;

import com.deliveryflow.task.graph.entity.TaskNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskNodeRepository extends Neo4jRepository<TaskNode, String> {
    List<TaskNode> findByProjectId(String projectId);
}
