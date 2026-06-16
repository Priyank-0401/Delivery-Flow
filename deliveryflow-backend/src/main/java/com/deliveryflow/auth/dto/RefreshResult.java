package com.deliveryflow.auth.dto;

public record RefreshResult(
    TokenRefreshResponse response,
    String refreshToken
) {}
