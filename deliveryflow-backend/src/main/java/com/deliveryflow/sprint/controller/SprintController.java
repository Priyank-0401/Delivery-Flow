package com.deliveryflow.sprint.controller;

import com.deliveryflow.sprint.dto.CreateSprintRequest;
import com.deliveryflow.sprint.dto.SprintResponse;
import com.deliveryflow.sprint.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@CrossOrigin(origins = "*")
public class SprintController {

    private final SprintService sprintService;

    @Autowired
    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping
    public List<SprintResponse> getAllSprints(@RequestParam(required = false) String projectId) {
        if (projectId != null) {
            return sprintService.getSprintsByProject(projectId);
        }
        return sprintService.getAllSprints();
    }

    @GetMapping("/{id}")
    public SprintResponse getSprintById(@PathVariable String id) {
        return sprintService.getSprintById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SprintResponse createSprint(@RequestBody CreateSprintRequest request) {
        return sprintService.createSprint(request);
    }
}
