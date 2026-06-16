package com.deliveryflow.user.mapper;

import com.deliveryflow.user.dto.CreateUserRequest;
import com.deliveryflow.user.dto.UserResponse;
import com.deliveryflow.user.entity.User;
import com.deliveryflow.common.enums.UserRole;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole() != null ? user.getRole().name() : null);
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    public static User toEntity(CreateUserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getRole() != null) {
            user.setRole(UserRole.valueOf(request.getRole()));
        }
        return user;
    }
}
