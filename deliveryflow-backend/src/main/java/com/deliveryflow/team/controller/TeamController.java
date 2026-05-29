package com.deliveryflow.team.controller;

import com.deliveryflow.team.dto.AddMemberRequest;
import com.deliveryflow.team.dto.CreateTeamRequest;
import com.deliveryflow.team.dto.TeamResponse;
import com.deliveryflow.team.entity.TeamMember;
import com.deliveryflow.team.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    private final TeamService teamService;

    @Autowired
    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public List<TeamResponse> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public TeamResponse getTeamById(@PathVariable String id) {
        return teamService.getTeamById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamResponse createTeam(@RequestBody CreateTeamRequest request) {
        return teamService.createTeam(request);
    }

    @PostMapping("/{teamId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamMember addMember(@PathVariable String teamId, @RequestBody AddMemberRequest request) {
        return teamService.addMember(teamId, request);
    }

    @GetMapping("/{teamId}/members")
    public List<TeamMember> getMembers(@PathVariable String teamId) {
        return teamService.getMembers(teamId);
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable String teamId, @PathVariable String userId) {
        teamService.removeMember(teamId, userId);
    }
}
