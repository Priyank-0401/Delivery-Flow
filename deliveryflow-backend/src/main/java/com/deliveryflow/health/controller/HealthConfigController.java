package com.deliveryflow.health.controller;

import com.deliveryflow.health.dto.HealthConfigResponse;
import com.deliveryflow.health.dto.UpdateHealthConfigReq;
import com.deliveryflow.health.entity.ProjectHealthConfig;
import com.deliveryflow.health.mapper.HealthMapper;
import com.deliveryflow.health.service.HealthConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/health/config")
@RequiredArgsConstructor
public class HealthConfigController {

    private final HealthConfigService healthConfigService;

    /**
     * GET /api/v1/projects/{projectId}/health/config
     * Retrieve current health weights configuration.
     */
    @GetMapping
    public HealthConfigResponse getConfig(@PathVariable String projectId) {
        ProjectHealthConfig config = healthConfigService.getConfigByProjectId(projectId);
        return HealthMapper.toConfigResponse(config);
    }

    /**
     * PUT /api/v1/projects/{projectId}/health/config
     * Update health weights configuration.
     * Restricted to ADMIN, PMO, and MANAGER roles.
     */
    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PMO', 'MANAGER')")
    public HealthConfigResponse updateConfig(
            @PathVariable String projectId,
            @Valid @RequestBody UpdateHealthConfigReq request) {
        ProjectHealthConfig updated = new ProjectHealthConfig();
        updated.setVelocityWeight(request.getVelocityWeight());
        updated.setBlockerWeight(request.getBlockerWeight());
        updated.setDefectWeight(request.getDefectWeight());
        updated.setDependencyWeight(request.getDependencyWeight());
        updated.setUtilizationWeight(request.getUtilizationWeight());
        updated.setStabilityWeight(request.getStabilityWeight());
        updated.setScopeCreepWeight(request.getScopeCreepWeight());
        updated.setReleaseConfidenceWeight(request.getReleaseConfidenceWeight());

        ProjectHealthConfig saved = healthConfigService.updateConfig(projectId, updated);
        return HealthMapper.toConfigResponse(saved);
    }
}
