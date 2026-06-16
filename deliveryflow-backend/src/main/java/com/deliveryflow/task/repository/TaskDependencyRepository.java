package com.deliveryflow.task.repository;

import com.deliveryflow.task.entity.TaskDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskDependencyRepository extends JpaRepository<TaskDependency, String> {

    List<TaskDependency> findBySourceTaskId(String sourceTaskId);

    List<TaskDependency> findByTargetTaskId(String targetTaskId);

    Optional<TaskDependency> findBySourceTaskIdAndTargetTaskId(String sourceTaskId, String targetTaskId);

    boolean existsBySourceTaskIdAndTargetTaskId(String sourceTaskId, String targetTaskId);

    void deleteBySourceTaskIdAndTargetTaskId(String sourceTaskId, String targetTaskId);

    @Query("SELECT td FROM TaskDependency td WHERE td.sourceTaskId IN (SELECT t.id FROM Task t WHERE t.projectId = :projectId)")
    List<TaskDependency> findByProjectId(@Param("projectId") String projectId);
}
