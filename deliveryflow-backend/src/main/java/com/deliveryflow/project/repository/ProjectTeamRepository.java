package com.deliveryflow.project.repository;

import com.deliveryflow.project.entity.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Object> {

    List<ProjectTeam> findByProjectId(String projectId);

    List<ProjectTeam> findByTeamId(String teamId);
}
