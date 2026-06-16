package com.deliveryflow.health.service;

import com.deliveryflow.common.exception.ResourceNotFoundException;
import com.deliveryflow.health.entity.ProjectHealthConfig;
import com.deliveryflow.health.repository.ProjectHealthConfigRepository;
import com.deliveryflow.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthConfigService {

    private final ProjectHealthConfigRepository projectHealthConfigRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public ProjectHealthConfig getConfigByProjectId(String projectId) {
        // Verify project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        return projectHealthConfigRepository.findByProjectId(projectId)
                .orElseGet(() -> {
                    ProjectHealthConfig config = new ProjectHealthConfig();
                    config.setProjectId(projectId);
                    return projectHealthConfigRepository.save(config);
                });
    }

    @Transactional
    public ProjectHealthConfig updateConfig(String projectId, ProjectHealthConfig updatedConfig) {
        // Verify project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        ProjectHealthConfig config = projectHealthConfigRepository.findByProjectId(projectId)
                .orElseGet(() -> {
                    ProjectHealthConfig newConfig = new ProjectHealthConfig();
                    newConfig.setProjectId(projectId);
                    return newConfig;
                });

        config.setVelocityWeight(updatedConfig.getVelocityWeight());
        config.setBlockerWeight(updatedConfig.getBlockerWeight());
        config.setDefectWeight(updatedConfig.getDefectWeight());
        config.setDependencyWeight(updatedConfig.getDependencyWeight());
        config.setUtilizationWeight(updatedConfig.getUtilizationWeight());
        config.setStabilityWeight(updatedConfig.getStabilityWeight());
        config.setScopeCreepWeight(updatedConfig.getScopeCreepWeight());
        config.setReleaseConfidenceWeight(updatedConfig.getReleaseConfidenceWeight());

        // Validate constraint manually before saving
        if (!config.isSumOfWeightsValid()) {
            throw new IllegalArgumentException("The sum of all health weights must equal exactly 1.00 (Current sum: " + config.getSumOfWeights() + ")");
        }

        return projectHealthConfigRepository.save(config);
    }
}
