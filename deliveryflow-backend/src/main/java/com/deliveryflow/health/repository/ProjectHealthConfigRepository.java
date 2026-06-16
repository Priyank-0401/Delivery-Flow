package com.deliveryflow.health.repository;

import com.deliveryflow.health.entity.ProjectHealthConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectHealthConfigRepository extends JpaRepository<ProjectHealthConfig, String> {
    Optional<ProjectHealthConfig> findByProjectId(String projectId);
}
