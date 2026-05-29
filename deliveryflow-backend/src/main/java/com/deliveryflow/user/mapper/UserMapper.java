package com.deliveryflow.user.mapper;

import com.deliveryflow.user.dto.CreateUserRequest;
import com.deliveryflow.user.dto.UserResponse;
import com.deliveryflow.user.entity.User;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    public static User toEntity(CreateUserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        return user;
    }
}
