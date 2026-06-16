package com.deliveryflow.health.controller;

import com.deliveryflow.health.dto.HealthHistoryResponse;
import com.deliveryflow.health.dto.ProjectHealthResponse;
import com.deliveryflow.health.entity.ProjectHealthMetric;
import com.deliveryflow.health.mapper.HealthMapper;
import com.deliveryflow.health.repository.HealthHistorySnapshotRepository;
import com.deliveryflow.health.repository.ProjectHealthMetricRepository;
import com.deliveryflow.health.service.HealthCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/health")
@RequiredArgsConstructor
public class ProjectHealthController {

    private final HealthCalculationService healthCalculationService;
    private final ProjectHealthMetricRepository projectHealthMetricRepository;
    private final HealthHistorySnapshotRepository healthHistorySnapshotRepository;

    /**
     * GET /api/v1/projects/{projectId}/health
     * Retrieve current health metrics and overall score.
     * If no cached metric exists, calculate on the fly.
     */
    @GetMapping
    public ProjectHealthResponse getProjectHealth(@PathVariable String projectId) {
        ProjectHealthMetric metric = projectHealthMetricRepository.findByProjectId(projectId)
                .orElseGet(() -> healthCalculationService.calculateAndSaveProjectHealth(projectId));
        return HealthMapper.toHealthResponse(metric);
    }

    /**
     * POST /api/v1/projects/{projectId}/health/recalculate
     * Force recalculation of project health.
     */
    @PostMapping("/recalculate")
    public ProjectHealthResponse recalculate(@PathVariable String projectId) {
        ProjectHealthMetric metric = healthCalculationService.calculateAndSaveProjectHealth(projectId);
        return HealthMapper.toHealthResponse(metric);
    }

    /**
     * GET /api/v1/projects/{projectId}/health/history
     * Retrieve 30-day health history snapshots.
     */
    @GetMapping("/history")
    public List<HealthHistoryResponse> getHealthHistory(@PathVariable String projectId) {
        return healthHistorySnapshotRepository.findByProjectIdOrderBySnapshotDateAsc(projectId)
                .stream()
                .map(HealthMapper::toHistoryResponse)
                .collect(Collectors.toList());
    }
}
