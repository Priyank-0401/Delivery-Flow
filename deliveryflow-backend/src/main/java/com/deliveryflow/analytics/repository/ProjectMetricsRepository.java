package com.deliveryflow.analytics.repository;

import com.deliveryflow.analytics.entity.ProjectMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectMetricsRepository extends JpaRepository<ProjectMetrics, String> {
}
