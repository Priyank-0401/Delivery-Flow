package com.deliveryflow.team.dto;

import lombok.Data;

@Data
public class CreateTeamRequest {
    private String name;
    private String description;
    private String teamType;
    private Integer capacity;
}
