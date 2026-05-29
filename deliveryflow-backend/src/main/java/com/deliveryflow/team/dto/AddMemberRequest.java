package com.deliveryflow.team.dto;

import lombok.Data;

@Data
public class AddMemberRequest {
    private String userId;
    private String role;
}
