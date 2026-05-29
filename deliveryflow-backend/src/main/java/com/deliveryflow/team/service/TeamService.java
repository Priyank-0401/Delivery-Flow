package com.deliveryflow.team.service;

import com.deliveryflow.common.enums.TeamMemberRole;
import com.deliveryflow.team.dto.AddMemberRequest;
import com.deliveryflow.team.dto.CreateTeamRequest;
import com.deliveryflow.team.dto.TeamResponse;
import com.deliveryflow.team.entity.Team;
import com.deliveryflow.team.entity.TeamMember;
import com.deliveryflow.team.mapper.TeamMapper;
import com.deliveryflow.team.repository.TeamMemberRepository;
import com.deliveryflow.team.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Autowired
    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(TeamMapper::toResponse)
                .collect(Collectors.toList());
    }

    public TeamResponse getTeamById(String id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found: " + id));
        return TeamMapper.toResponse(team);
    }

    public TeamResponse createTeam(CreateTeamRequest request) {
        Team team = TeamMapper.toEntity(request);
        return TeamMapper.toResponse(teamRepository.save(team));
    }

    public TeamMember addMember(String teamId, AddMemberRequest request) {
        // Verify team exists
        teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));

        TeamMember member = new TeamMember();
        member.setTeamId(teamId);
        member.setUserId(request.getUserId());
        if (request.getRole() != null) {
            member.setRole(TeamMemberRole.valueOf(request.getRole()));
        }
        return teamMemberRepository.save(member);
    }

    public List<TeamMember> getMembers(String teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    @Transactional
    public void removeMember(String teamId, String userId) {
        teamMemberRepository.deleteByTeamIdAndUserId(teamId, userId);
    }
}
