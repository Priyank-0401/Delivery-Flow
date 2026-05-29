package com.deliveryflow.sprint.mapper;

import com.deliveryflow.sprint.dto.CreateSprintRequest;
import com.deliveryflow.sprint.dto.SprintResponse;
import com.deliveryflow.sprint.entity.Sprint;

import java.time.LocalDate;

public class SprintMapper {

    public static SprintResponse toResponse(Sprint sprint) {
        SprintResponse response = new SprintResponse();
        response.setId(sprint.getId());
        response.setProjectId(sprint.getProjectId());
        response.setName(sprint.getName());
        response.setStartDate(sprint.getStartDate());
        response.setEndDate(sprint.getEndDate());
        response.setStatus(sprint.getStatus());
        response.setCreatedAt(sprint.getCreatedAt());
        response.setUpdatedAt(sprint.getUpdatedAt());
        return response;
    }

    public static Sprint toEntity(CreateSprintRequest request) {
        Sprint sprint = new Sprint();
        sprint.setProjectId(request.getProjectId());
        sprint.setName(request.getName());
        if (request.getStartDate() != null) {
            sprint.setStartDate(LocalDate.parse(request.getStartDate()));
        }
        if (request.getEndDate() != null) {
            sprint.setEndDate(LocalDate.parse(request.getEndDate()));
        }
        return sprint;
    }
}
