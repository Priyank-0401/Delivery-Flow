package com.deliveryflow.team.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamResponse {
    private String id;
    private String name;
    private String description;
    private String teamType;
    private Integer capacity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
