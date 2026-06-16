package com.deliveryflow.health.repository;

import com.deliveryflow.health.entity.HealthHistorySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthHistorySnapshotRepository extends JpaRepository<HealthHistorySnapshot, String> {
    List<HealthHistorySnapshot> findByProjectIdOrderBySnapshotDateAsc(String projectId);
    
    Optional<HealthHistorySnapshot> findFirstByProjectIdAndSnapshotDateBeforeOrderBySnapshotDateDesc(String projectId, LocalDate date);
    
    Optional<HealthHistorySnapshot> findByProjectIdAndSnapshotDate(String projectId, LocalDate date);
}
