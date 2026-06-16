package com.deliveryflow.analytics.repository;

import com.deliveryflow.analytics.entity.ActivityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityEventRepository extends JpaRepository<ActivityEvent, String> {

    List<ActivityEvent> findTop20ByOrderByCreatedAtDesc();

    Optional<ActivityEvent> findFirstByProjectIdOrderByCreatedAtDesc(String projectId);
}
