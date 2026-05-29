package com.deliveryflow.team.repository;

import com.deliveryflow.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Object> {

    List<TeamMember> findByTeamId(String teamId);

    List<TeamMember> findByUserId(String userId);

    void deleteByTeamIdAndUserId(String teamId, String userId);
}
