package com.deliveryflow.user.service;

import com.deliveryflow.common.exception.ResourceNotFoundException;
import com.deliveryflow.user.dto.CreateUserRequest;
import com.deliveryflow.user.dto.UserResponse;
import com.deliveryflow.user.entity.User;
import com.deliveryflow.user.mapper.UserMapper;
import com.deliveryflow.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return UserMapper.toResponse(user);
    }

    public UserResponse createUser(CreateUserRequest request) {
        User user = UserMapper.toEntity(request);
        return UserMapper.toResponse(userRepository.save(user));
    }
}
