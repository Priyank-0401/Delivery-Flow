package com.deliveryflow.sprint.service;

import com.deliveryflow.common.exception.ResourceNotFoundException;
import com.deliveryflow.sprint.dto.CreateSprintRequest;
import com.deliveryflow.sprint.dto.SprintResponse;
import com.deliveryflow.sprint.entity.Sprint;
import com.deliveryflow.sprint.mapper.SprintMapper;
import com.deliveryflow.sprint.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;

    @Autowired
    public SprintService(SprintRepository sprintRepository) {
        this.sprintRepository = sprintRepository;
    }

    public List<SprintResponse> getAllSprints() {
        return sprintRepository.findAll()
                .stream()
                .map(SprintMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<SprintResponse> getSprintsByProject(String projectId) {
        return sprintRepository.findByProjectId(projectId)
                .stream()
                .map(SprintMapper::toResponse)
                .collect(Collectors.toList());
    }

    public SprintResponse getSprintById(String id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", id));
        return SprintMapper.toResponse(sprint);
    }

    public SprintResponse createSprint(CreateSprintRequest request) {
        Sprint sprint = SprintMapper.toEntity(request);
        return SprintMapper.toResponse(sprintRepository.save(sprint));
    }
}
