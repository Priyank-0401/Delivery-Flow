package com.deliveryflow.auth.dto;

public record LoginResult(
    AuthResponse response,
    String refreshToken
) {}
