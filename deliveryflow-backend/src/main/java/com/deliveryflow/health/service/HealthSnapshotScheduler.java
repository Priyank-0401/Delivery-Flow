package com.deliveryflow.health.service;

import com.deliveryflow.health.entity.HealthHistorySnapshot;
import com.deliveryflow.health.entity.ProjectHealthMetric;
import com.deliveryflow.health.repository.HealthHistorySnapshotRepository;
import com.deliveryflow.project.entity.Project;
import com.deliveryflow.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthSnapshotScheduler {

    private final ProjectRepository projectRepository;
    private final HealthCalculationService healthCalculationService;
    private final HealthHistorySnapshotRepository healthHistorySnapshotRepository;

    /**
     * Run daily at midnight to capture historical project health snapshots.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void runDailySnapshots() {
        log.info("Starting daily project health snapshots job");
        List<Project> projects = projectRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Project project : projects) {
            try {
                // 1. Recalculate health to get the latest state
                ProjectHealthMetric currentMetric = healthCalculationService.calculateAndSaveProjectHealth(project.getId());
                int currentScore = currentMetric.getOverallScore();

                // 2. Fetch the most recent historical snapshot prior to today
                Optional<HealthHistorySnapshot> lastSnapshotOpt = healthHistorySnapshotRepository
                        .findFirstByProjectIdAndSnapshotDateBeforeOrderBySnapshotDateDesc(project.getId(), today);

                int delta = 0;
                if (lastSnapshotOpt.isPresent()) {
                    delta = currentScore - lastSnapshotOpt.get().getScore();
                }

                // 3. Save or update today's snapshot
                HealthHistorySnapshot snapshot = healthHistorySnapshotRepository
                        .findByProjectIdAndSnapshotDate(project.getId(), today)
                        .orElse(new HealthHistorySnapshot());

                snapshot.setProjectId(project.getId());
                snapshot.setScore(currentScore);
                snapshot.setHealthDelta(delta);
                snapshot.setSnapshotDate(today);

                healthHistorySnapshotRepository.save(snapshot);
                log.info("Saved health snapshot for project {}: score={}, delta={}", project.getId(), currentScore, delta);
            } catch (Exception e) {
                log.error("Failed to capture daily health snapshot for project {}", project.getId(), e);
            }
        }
    }
}
