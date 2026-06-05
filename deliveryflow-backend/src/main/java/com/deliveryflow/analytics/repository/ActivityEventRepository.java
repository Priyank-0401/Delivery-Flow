package com.deliveryflow.analytics.repository;

import com.deliveryflow.analytics.entity.ActivityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityEventRepository extends JpaRepository<ActivityEvent, String> {

    List<ActivityEvent> findTop20ByOrderByCreatedAtDesc();
}
