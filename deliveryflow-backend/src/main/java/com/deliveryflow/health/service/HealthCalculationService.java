package com.deliveryflow.health.service;

import com.deliveryflow.analytics.entity.ActivityEvent;
import com.deliveryflow.analytics.repository.ActivityEventRepository;
import com.deliveryflow.common.enums.SprintStatus;
import com.deliveryflow.common.enums.TaskStatus;
import com.deliveryflow.common.enums.TaskType;
import com.deliveryflow.common.enums.TaskPriority;
import com.deliveryflow.health.entity.ProjectHealthConfig;
import com.deliveryflow.health.entity.ProjectHealthMetric;
import com.deliveryflow.health.repository.ProjectHealthConfigRepository;
import com.deliveryflow.health.repository.ProjectHealthMetricRepository;
import com.deliveryflow.project.entity.ProjectTeam;
import com.deliveryflow.project.repository.ProjectTeamRepository;
import com.deliveryflow.sprint.entity.Sprint;
import com.deliveryflow.sprint.repository.SprintRepository;
import com.deliveryflow.task.dto.CriticalPathResponse;
import com.deliveryflow.task.dto.TaskCpmDetails;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.repository.TaskRepository;
import com.deliveryflow.task.service.CriticalPathService;
import com.deliveryflow.team.entity.Team;
import com.deliveryflow.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthCalculationService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final TeamRepository teamRepository;
    private final ActivityEventRepository activityEventRepository;
    private final ProjectHealthConfigRepository projectHealthConfigRepository;
    private final ProjectHealthMetricRepository projectHealthMetricRepository;
    private final CriticalPathService criticalPathService;

    @Transactional
    public ProjectHealthMetric calculateAndSaveProjectHealth(String projectId) {
        log.info("Calculating health score for project {}", projectId);
        
        // 0. Ensure config exists, fallback to default if not present
        ProjectHealthConfig config = projectHealthConfigRepository.findByProjectId(projectId)
                .orElseGet(() -> {
                    ProjectHealthConfig newConfig = new ProjectHealthConfig();
                    newConfig.setProjectId(projectId);
                    return projectHealthConfigRepository.save(newConfig);
                });

        List<String> contributingFactors = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Fetch all project tasks
        List<Task> allTasks = taskRepository.findByProjectId(projectId);

        // 1. Velocity Consistency (FR-001)
        int velocityScore = calculateVelocityConsistency(projectId, contributingFactors);

        // 2. Blocker Density (FR-002)
        int blockerScore = calculateBlockerDensity(allTasks, contributingFactors);

        // 3. Defect Leakage (FR-003)
        int defectScore = calculateDefectLeakage(allTasks, contributingFactors);

        // 4. Dependency Risk (FR-004)
        int dependencyScore = calculateDependencyRisk(projectId, allTasks, today, contributingFactors);

        // 5. Team Utilization (FR-005)
        int utilizationScore = calculateTeamUtilization(projectId, allTasks, contributingFactors);

        // 6. Sprint Stability (FR-006)
        int stabilityScore = calculateSprintStability(projectId, today, contributingFactors);

        // 7. Scope Creep (FR-007)
        int scopeCreepScore = calculateScopeCreep(projectId, contributingFactors);

        // 8. Release Confidence (FR-008)
        int releaseConfidenceScore = calculateReleaseConfidence(allTasks, contributingFactors);

        // Calculate weighted score
        double weightedSum = (velocityScore * config.getVelocityWeight().doubleValue())
                + (blockerScore * config.getBlockerWeight().doubleValue())
                + (defectScore * config.getDefectWeight().doubleValue())
                + (dependencyScore * config.getDependencyWeight().doubleValue())
                + (utilizationScore * config.getUtilizationWeight().doubleValue())
                + (stabilityScore * config.getStabilityWeight().doubleValue())
                + (scopeCreepScore * config.getScopeCreepWeight().doubleValue())
                + (releaseConfidenceScore * config.getReleaseConfidenceWeight().doubleValue());

        int overallScore = (int) Math.round(weightedSum);

        // Apply Staleness decay logic (FR-010)
        int stalenessDeduction = calculateStalenessDeduction(projectId, LocalDateTime.now(), contributingFactors);
        overallScore = Math.max(0, overallScore - stalenessDeduction);

        // Check if there are no contributing factors, add a positive default
        if (contributingFactors.isEmpty()) {
            contributingFactors.add("All execution metrics within normal thresholds");
        }

        // Save ProjectHealthMetric cache
        ProjectHealthMetric metric = projectHealthMetricRepository.findByProjectId(projectId)
                .orElse(new ProjectHealthMetric());
        
        metric.setProjectId(projectId);
        metric.setOverallScore(overallScore);
        metric.setVelocityScore(velocityScore);
        metric.setBlockerScore(blockerScore);
        metric.setDefectScore(defectScore);
        metric.setDependencyScore(dependencyScore);
        metric.setUtilizationScore(utilizationScore);
        metric.setStabilityScore(stabilityScore);
        metric.setScopeCreepScore(scopeCreepScore);
        metric.setReleaseConfidenceScore(releaseConfidenceScore);
        metric.setContributingFactors(String.join("; ", contributingFactors));
        
        return projectHealthMetricRepository.save(metric);
    }

    private int calculateVelocityConsistency(String projectId, List<String> factors) {
        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        List<Sprint> completedSprints = sprints.stream()
                .filter(s -> s.getStatus() == SprintStatus.COMPLETED)
                .collect(Collectors.toList());

        if (completedSprints.size() < 3) {
            return 80; // Default fallback score
        }

        // Calculate completed story points (velocity) for completed sprints
        List<Integer> velocities = new ArrayList<>();
        for (Sprint s : completedSprints) {
            List<Task> sprintTasks = taskRepository.findBySprintId(s.getId());
            int completedPoints = sprintTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                    .sum();
            velocities.add(completedPoints);
        }

        Collections.sort(velocities);
        double median;
        int size = velocities.size();
        // Look at the last 5 completed sprints max
        if (size > 5) {
            List<Integer> last5 = velocities.subList(size - 5, size);
            median = calculateMedianOfList(last5);
        } else {
            median = calculateMedianOfList(velocities);
        }

        // Fetch current active sprint velocity
        Optional<Sprint> activeSprintOpt = sprints.stream()
                .filter(s -> s.getStatus() == SprintStatus.ACTIVE)
                .findFirst();

        if (activeSprintOpt.isEmpty()) {
            return 100;
        }

        Sprint activeSprint = activeSprintOpt.get();
        List<Task> activeSprintTasks = taskRepository.findBySprintId(activeSprint.getId());
        int currentVelocity = activeSprintTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        if (median == 0) {
            return currentVelocity > 0 ? 100 : 80;
        }

        double ratio = (double) currentVelocity / median;
        if (ratio >= 1.0) {
            return 100;
        } else {
            int score = (int) Math.round(ratio * 100);
            if (score < 90) {
                factors.add("Sprint velocity consistency is low (" + currentVelocity + " points vs median " + (int) Math.round(median) + ")");
            }
            return score;
        }
    }

    private double calculateMedianOfList(List<Integer> list) {
        int size = list.size();
        if (size == 0) return 0.0;
        if (size % 2 == 1) {
            return list.get(size / 2);
        } else {
            return (list.get(size / 2 - 1) + list.get(size / 2)) / 2.0;
        }
    }

    private int calculateBlockerDensity(List<Task> tasks, List<String> factors) {
        List<Task> activeTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE)
                .collect(Collectors.toList());

        if (activeTasks.isEmpty()) {
            return 100;
        }

        long blockedCount = activeTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.BLOCKED)
                .count();

        double ratio = (double) blockedCount / activeTasks.size();
        if (ratio > 0.50) {
            factors.add(blockedCount + " blocked tasks represents " + Math.round(ratio * 100) + "% of active tasks (drops blocker density to 0)");
            return 0;
        }

        int score = (int) Math.round((1.0 - ratio) * 100);
        if (blockedCount > 0) {
            factors.add(blockedCount + " blocked dependencies");
        }
        return score;
    }

    private int calculateDefectLeakage(List<Task> tasks, List<String> factors) {
        long openHighCriticalBugs = tasks.stream()
                .filter(t -> t.getType() == TaskType.BUG && t.getStatus() != TaskStatus.DONE)
                .filter(t -> t.getPriority() == TaskPriority.HIGH || t.getPriority() == TaskPriority.CRITICAL)
                .count();

        if (openHighCriticalBugs == 0) {
            return 100;
        }

        int score = Math.max(0, 100 - (int) (openHighCriticalBugs * 10));
        factors.add(openHighCriticalBugs + " open high/critical severity defects");
        return score;
    }

    private int calculateDependencyRisk(String projectId, List<Task> allTasks, LocalDate today, List<String> factors) {
        CriticalPathResponse cpm = criticalPathService.calculateCriticalPath(projectId);
        if (cpm == null || cpm.getCriticalPathTaskIds() == null || cpm.getCriticalPathTaskIds().isEmpty()) {
            return 100;
        }

        Set<String> cpTaskIds = new HashSet<>(cpm.getCriticalPathTaskIds());
        List<Task> cpTasks = allTasks.stream()
                .filter(t -> cpTaskIds.contains(t.getId()))
                .collect(Collectors.toList());

        if (cpTasks.isEmpty()) {
            return 100;
        }

        // 1. % of critical path tasks overdue (40% weight)
        long overdueCPTasks = cpTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(today))
                .count();
        double overdueRatio = (double) overdueCPTasks / cpTasks.size();
        double overdueCPScore = 100 * (1.0 - overdueRatio);

        if (overdueCPTasks > 0) {
            factors.add(overdueCPTasks + " overdue critical path tasks");
        }

        // 2. Number of blocked critical path tasks (40% weight, -25 pts per blocked CP task)
        long blockedCPTasks = cpTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.BLOCKED)
                .count();
        double blockedCPScore = Math.max(0.0, 100.0 - (blockedCPTasks * 25.0));

        if (blockedCPTasks > 0) {
            factors.add(blockedCPTasks + " blocked critical path tasks");
        }

        // 3. Average slack across non-critical tasks (20% weight, standard target 40 hours buffer)
        List<TaskCpmDetails> details = cpm.getTasks();
        double totalSlack = 0.0;
        int nonCriticalCount = 0;
        if (details != null) {
            for (TaskCpmDetails detail : details) {
                if (!detail.isCritical()) {
                    totalSlack += detail.getSlack();
                    nonCriticalCount++;
                }
            }
        }
        double avgSlack = nonCriticalCount == 0 ? 40.0 : totalSlack / nonCriticalCount;
        double avgSlackScore = Math.min(100.0, (avgSlack / 40.0) * 100.0);

        if (avgSlack < 16.0 && nonCriticalCount > 0) {
            factors.add("Low dependency schedule buffer (avg slack " + Math.round(avgSlack) + "h)");
        }

        double score = (overdueCPScore * 0.40) + (blockedCPScore * 0.40) + (avgSlackScore * 0.20);
        return (int) Math.round(score);
    }

    private int calculateTeamUtilization(String projectId, List<Task> allTasks, List<String> factors) {
        List<ProjectTeam> ptList = projectTeamRepository.findByProjectId(projectId);
        int totalCapacity = 0;
        for (ProjectTeam pt : ptList) {
            Optional<Team> teamOpt = teamRepository.findById(pt.getTeamId());
            if (teamOpt.isPresent()) {
                totalCapacity += teamOpt.get().getCapacity() != null ? teamOpt.get().getCapacity() : 0;
            }
        }

        if (totalCapacity == 0) {
            totalCapacity = 80; // default backup capacity in hours
        }

        // Calculate assigned estimated hours of active tasks
        double assignedHours = 0.0;
        List<Task> activeTasks = allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE)
                .collect(Collectors.toList());

        for (Task t : activeTasks) {
            if (t.getEstimatedHours() != null) {
                assignedHours += t.getEstimatedHours().doubleValue();
            } else {
                int sp = t.getStoryPoints() != null ? t.getStoryPoints() : 0;
                assignedHours += sp > 0 ? sp * 8.0 : 4.0; // Fallback estimates
            }
        }

        double ratio = assignedHours / totalCapacity;

        int score;
        if (ratio >= 0.80 && ratio <= 1.00) {
            score = 100;
        } else if (ratio > 1.00 && ratio <= 1.20) {
            // Decline linearly from 100 to 50
            score = (int) Math.round(100.0 - ((ratio - 1.00) / 0.20) * 50.0);
        } else if (ratio > 1.20 && ratio <= 1.50) {
            // Decline linearly from 50 to 0
            score = (int) Math.round(50.0 - ((ratio - 1.20) / 0.30) * 50.0);
        } else if (ratio > 1.50) {
            score = 0;
        } else {
            // ratio < 0.80: decline linearly from 100 (at 80%) to 0 (at 0%)
            score = (int) Math.round((ratio / 0.80) * 100.0);
        }

        if (ratio > 1.10) {
            factors.add("Team is overloaded at " + Math.round(ratio * 100) + "% utilization (" + Math.round(assignedHours) + "h assigned vs " + totalCapacity + "h capacity)");
        } else if (ratio < 0.50) {
            factors.add("Team is under-utilized at " + Math.round(ratio * 100) + "% utilization");
        }

        return score;
    }

    private int calculateSprintStability(String projectId, LocalDate today, List<String> factors) {
        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        Optional<Sprint> activeSprintOpt = sprints.stream()
                .filter(s -> s.getStatus() == SprintStatus.ACTIVE)
                .findFirst();

        if (activeSprintOpt.isEmpty()) {
            return 100; // No active sprint stability penalty
        }

        Sprint sprint = activeSprintOpt.get();
        if (sprint.getStartDate() == null || sprint.getEndDate() == null) {
            return 100;
        }

        long totalDays = ChronoUnit.DAYS.between(sprint.getStartDate(), sprint.getEndDate());
        if (totalDays <= 0) totalDays = 14;

        long elapsedDays = ChronoUnit.DAYS.between(sprint.getStartDate(), today);
        double timeElapsedRatio = Math.min(1.0, Math.max(0.0, (double) elapsedDays / totalDays));

        List<Task> sprintTasks = taskRepository.findBySprintId(sprint.getId());
        if (sprintTasks.isEmpty()) {
            return 100;
        }

        int totalStoryPoints = sprintTasks.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        double completionRate;
        if (totalStoryPoints > 0) {
            int completedPoints = sprintTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                    .sum();
            completionRate = (double) completedPoints / totalStoryPoints;
        } else {
            long totalTasks = sprintTasks.size();
            long completedTasks = sprintTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .count();
            completionRate = (double) completedTasks / totalTasks;
        }

        if (completionRate >= timeElapsedRatio) {
            return 100;
        } else {
            int score = 100 - (int) Math.round((timeElapsedRatio - completionRate) * 100.0);
            score = Math.max(0, score);
            if (score < 90) {
                factors.add("Sprint delivery progress is lagging (Completed: " + Math.round(completionRate * 100) + "% vs Time Elapsed: " + Math.round(timeElapsedRatio * 100) + "%)");
            }
            return score;
        }
    }

    private int calculateScopeCreep(String projectId, List<String> factors) {
        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        Optional<Sprint> activeSprintOpt = sprints.stream()
                .filter(s -> s.getStatus() == SprintStatus.ACTIVE)
                .findFirst();

        if (activeSprintOpt.isEmpty()) {
            return 100;
        }

        Sprint sprint = activeSprintOpt.get();
        List<Task> sprintTasks = taskRepository.findBySprintId(sprint.getId());
        if (sprintTasks.isEmpty()) {
            return 100;
        }

        // Filter tasks created after the sprint start date
        LocalDateTime sprintStartDateTime = sprint.getStartDate().atStartOfDay();
        List<Task> addedTasks = sprintTasks.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(sprintStartDateTime))
                .collect(Collectors.toList());

        int addedPoints = addedTasks.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        int totalPoints = sprintTasks.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        if (totalPoints == 0) {
            return 100;
        }

        double ratio = (double) addedPoints / totalPoints;
        int score = Math.max(0, 100 - (int) Math.round(ratio * 100.0));
        
        if (addedPoints > 0) {
            factors.add(Math.round(ratio * 100) + "% sprint scope increase (" + addedPoints + " SP added post-start)");
        }
        return score;
    }

    private int calculateReleaseConfidence(List<Task> tasks, List<String> factors) {
        if (tasks.isEmpty()) {
            return 100;
        }

        long total = tasks.size();
        long completed = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .count();

        int score = (int) Math.round(((double) completed / total) * 100.0);
        if (score < 50) {
            factors.add("Overall project completion is low at " + score + "%");
        }
        return score;
    }

    private int calculateStalenessDeduction(String projectId, LocalDateTime now, List<String> factors) {
        Optional<ActivityEvent> latestEventOpt = activityEventRepository.findFirstByProjectIdOrderByCreatedAtDesc(projectId);
        
        LocalDateTime lastActivity;
        if (latestEventOpt.isPresent()) {
            lastActivity = latestEventOpt.get().getCreatedAt();
        } else {
            // Fallback to project creation/update
            return 0; // If no event recorded, don't deduct yet to avoid penalizing new projects
        }

        if (lastActivity.isAfter(now)) {
            return 0;
        }

        long nonWeekendHours = 0;
        LocalDateTime temp = lastActivity;
        while (temp.isBefore(now)) {
            DayOfWeek day = temp.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                nonWeekendHours++;
            }
            temp = temp.plusHours(1);
        }

        if (nonWeekendHours <= 72) {
            return 0;
        }

        long hoursExceeding = nonWeekendHours - 72;
        long daysExceeding = (hoursExceeding + 23) / 24; // round up to count partial days
        long deduction = daysExceeding * 5;
        int finalDeduction = (int) Math.min(30, deduction);

        if (finalDeduction > 0) {
            factors.add("Project has zero updates for " + daysExceeding + " business days (exceeded 72h threshold, -" + finalDeduction + " pts)");
        }

        return finalDeduction;
    }
}
