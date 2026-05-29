package com.deliveryflow.team.mapper;

import com.deliveryflow.team.dto.CreateTeamRequest;
import com.deliveryflow.team.dto.TeamResponse;
import com.deliveryflow.team.entity.Team;

public class TeamMapper {

    public static TeamResponse toResponse(Team team) {
        TeamResponse response = new TeamResponse();
        response.setId(team.getId());
        response.setName(team.getName());
        response.setDescription(team.getDescription());
        response.setTeamType(team.getTeamType());
        response.setCapacity(team.getCapacity());
        response.setCreatedAt(team.getCreatedAt());
        response.setUpdatedAt(team.getUpdatedAt());
        return response;
    }

    public static Team toEntity(CreateTeamRequest request) {
        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        if (request.getTeamType() != null) {
            team.setTeamType(request.getTeamType());
        }
        if (request.getCapacity() != null) {
            team.setCapacity(request.getCapacity());
        }
        return team;
    }
}
