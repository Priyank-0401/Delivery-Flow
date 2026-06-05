package com.deliveryflow.analytics.controller;

import com.deliveryflow.analytics.dto.ActivityEventDTO;
import com.deliveryflow.analytics.dto.DashboardOverviewDTO;
import com.deliveryflow.analytics.dto.ProjectMetricsDTO;
import com.deliveryflow.analytics.dto.SprintMetricsDTO;
import com.deliveryflow.analytics.dto.TeamMetricsDTO;
import com.deliveryflow.analytics.service.ActivityService;
import com.deliveryflow.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ActivityService activityService;

    @GetMapping("/dashboard")
    public DashboardOverviewDTO getDashboardOverview() {
        return analyticsService.getDashboardOverview();
    }

    @GetMapping("/projects/{id}")
    public ProjectMetricsDTO getProjectMetrics(@PathVariable String id) {
        return analyticsService.getProjectMetrics(id);
    }

    @GetMapping("/sprints/{id}")
    public SprintMetricsDTO getSprintMetrics(@PathVariable String id) {
        return analyticsService.getSprintMetrics(id);
    }

    @GetMapping("/teams/{id}")
    public TeamMetricsDTO getTeamMetrics(@PathVariable String id) {
        return analyticsService.getTeamMetrics(id);
    }

    @GetMapping("/activity")
    public List<ActivityEventDTO> getRecentActivity() {
        return activityService.getRecentActivity();
    }
}
