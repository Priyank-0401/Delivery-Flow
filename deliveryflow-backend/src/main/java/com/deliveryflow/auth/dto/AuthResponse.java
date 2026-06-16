package com.deliveryflow.auth.dto;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    UserDTO user
) {
    public record UserDTO(
        String id,
        String name,
        String email,
        String role
    ) {}
}
