package com.deliveryflow.health.repository;

import com.deliveryflow.health.entity.ProjectHealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectHealthMetricRepository extends JpaRepository<ProjectHealthMetric, String> {
    Optional<ProjectHealthMetric> findByProjectId(String projectId);
}
