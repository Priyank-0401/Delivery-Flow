package com.deliveryflow.analytics.service;

import com.deliveryflow.analytics.dto.DashboardOverviewDTO;
import com.deliveryflow.analytics.dto.ProjectMetricsDTO;
import com.deliveryflow.analytics.dto.SprintMetricsDTO;
import com.deliveryflow.analytics.dto.TeamMetricsDTO;
import com.deliveryflow.analytics.entity.ProjectMetrics;
import com.deliveryflow.analytics.repository.ProjectMetricsRepository;
import com.deliveryflow.common.enums.SprintStatus;
import com.deliveryflow.common.enums.TaskStatus;
import com.deliveryflow.project.repository.ProjectRepository;
import com.deliveryflow.sprint.repository.SprintRepository;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final ProjectMetricsRepository projectMetricsRepository;

    public DashboardOverviewDTO getDashboardOverview() {
        long totalProjects = projectRepository.count();
        
        List<Task> allTasks = taskRepository.findAll();
        int blockedTasks = 0;
        int completedTasks = 0;
        for (Task t : allTasks) {
            if (t.getStatus() == TaskStatus.BLOCKED) {
                blockedTasks++;
            } else if (t.getStatus() == TaskStatus.DONE) {
                completedTasks++;
            }
        }
        
        long activeSprints = sprintRepository.findAll().stream()
                .filter(s -> s.getStatus() == SprintStatus.ACTIVE)
                .count();

        double overallCompletionRate = 0.0;
        if (!allTasks.isEmpty()) {
            overallCompletionRate = ((double) completedTasks / allTasks.size()) * 100.0;
            // Round to 2 decimal places
            overallCompletionRate = BigDecimal.valueOf(overallCompletionRate)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        DashboardOverviewDTO dto = new DashboardOverviewDTO();
        dto.setTotalProjects((int) totalProjects);
        dto.setBlockedTasks(blockedTasks);
        dto.setActiveSprints((int) activeSprints);
        dto.setOverallCompletionRate(overallCompletionRate);
        return dto;
    }

    public ProjectMetricsDTO getProjectMetrics(String projectId) {
        // Find existing or compute on the fly
        return projectMetricsRepository.findById(projectId)
                .map(m -> {
                    ProjectMetricsDTO dto = new ProjectMetricsDTO();
                    dto.setProjectId(m.getProjectId());
                    dto.setTotalTasks(m.getTotalTasks());
                    dto.setCompletedTasks(m.getCompletedTasks());
                    dto.setBlockedTasks(m.getBlockedTasks());
                    dto.setCompletionRate(m.getCompletionRate().doubleValue());
                    
                    // Compute overdue tasks from live data
                    List<Task> tasks = taskRepository.findByProjectId(projectId);
                    int overdue = 0;
                    LocalDate today = LocalDate.now();
                    for (Task t : tasks) {
                        if (t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(today)) {
                            overdue++;
                        }
                    }
                    dto.setOverdueTasks(overdue);
                    return dto;
                })
                .orElseGet(() -> {
                    // Compute from scratch and save
                    List<Task> tasks = taskRepository.findByProjectId(projectId);
                    int total = tasks.size();
                    int completed = 0;
                    int blocked = 0;
                    int overdue = 0;
                    LocalDate today = LocalDate.now();

                    for (Task t : tasks) {
                        if (t.getStatus() == TaskStatus.DONE) {
                            completed++;
                        } else {
                            if (t.getStatus() == TaskStatus.BLOCKED) {
                                blocked++;
                            }
                            if (t.getDueDate() != null && t.getDueDate().isBefore(today)) {
                                overdue++;
                            }
                        }
                    }

                    double rate = total == 0 ? 0.0 : ((double) completed / total) * 100.0;
                    BigDecimal rateBD = BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP);

                    ProjectMetrics m = new ProjectMetrics();
                    m.setProjectId(projectId);
                    m.setTotalTasks(total);
                    m.setCompletedTasks(completed);
                    m.setBlockedTasks(blocked);
                    m.setCompletionRate(rateBD);
                    m.setUpdatedAt(LocalDateTime.now());
                    projectMetricsRepository.save(m);

                    ProjectMetricsDTO dto = new ProjectMetricsDTO();
                    dto.setProjectId(projectId);
                    dto.setTotalTasks(total);
                    dto.setCompletedTasks(completed);
                    dto.setBlockedTasks(blocked);
                    dto.setOverdueTasks(overdue);
                    dto.setCompletionRate(rateBD.doubleValue());
                    return dto;
                });
    }

    public SprintMetricsDTO getSprintMetrics(String sprintId) {
        List<Task> sprintTasks = taskRepository.findBySprintId(sprintId);
        int completedPoints = 0;
        int remainingPoints = 0;

        for (Task t : sprintTasks) {
            int pts = t.getStoryPoints() != null ? t.getStoryPoints() : 0;
            if (t.getStatus() == TaskStatus.DONE) {
                completedPoints += pts;
            } else {
                remainingPoints += pts;
            }
        }

        SprintMetricsDTO dto = new SprintMetricsDTO();
        dto.setSprintId(sprintId);
        dto.setCompletedStoryPoints(completedPoints);
        dto.setRemainingStoryPoints(remainingPoints);
        // Average velocity of active/completed sprint can be represented as completed story points so far
        dto.setVelocity(completedPoints);
        return dto;
    }

    public TeamMetricsDTO getTeamMetrics(String teamId) {
        // Simplistic stub for metrics aggregation
        TeamMetricsDTO dto = new TeamMetricsDTO();
        dto.setTeamId(teamId);
        dto.setUtilization(75.5);
        dto.setAssignedHours(120);
        dto.setAvailableHours(160);
        return dto;
    }
}
