package com.deliveryflow.task.controller;

import com.deliveryflow.task.service.GraphRebuildService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/graph")
public class AdminGraphController {

    private final GraphRebuildService graphRebuildService;

    @Autowired
    public AdminGraphController(GraphRebuildService graphRebuildService) {
        this.graphRebuildService = graphRebuildService;
    }

    @PostMapping("/rebuild")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('ADMIN')")
    public void rebuildGraph() {
        graphRebuildService.rebuildGraph();
    }
}
