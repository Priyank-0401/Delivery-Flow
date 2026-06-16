package com.deliveryflow.auth.service;

import com.deliveryflow.common.enums.UserRole;
import com.deliveryflow.user.entity.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService jwtService;
    private final String secret = "9a4f2c8d3e7b1a5f6g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0";
    private final long expiryMs = 3600000; // 1 hour

    @BeforeEach
    public void setUp() {
        jwtService = new JwtService(secret, expiryMs);
    }

    @Test
    public void whenGenerateToken_thenHasCorrectClaims() {
        User user = new User();
        user.setId("user-123");
        user.setEmail("user@test.com");
        user.setRole(UserRole.MEMBER);

        String token = jwtService.generateAccessToken(user);
        assertNotNull(token);

        Claims claims = jwtService.extractAllClaims(token);
        assertEquals("user-123", claims.getSubject());
        assertEquals("user@test.com", claims.get("email"));
        assertEquals("MEMBER", claims.get("role"));
    }

    @Test
    public void whenTokenValid_thenValidationSucceeds() {
        User user = new User();
        user.setId("user-123");
        user.setEmail("user@test.com");
        user.setRole(UserRole.MEMBER);

        String token = jwtService.generateAccessToken(user);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals("user-123", jwtService.extractUserId(token));
        assertEquals("user@test.com", jwtService.extractEmail(token));
    }

    @Test
    public void whenTokenExpired_thenValidationFails() {
        // Create a JwtService with 0 expiry
        JwtService shortLivedService = new JwtService(secret, -1000); // 1 sec in past
        User user = new User();
        user.setId("user-123");
        user.setEmail("user@test.com");
        user.setRole(UserRole.MEMBER);

        String token = shortLivedService.generateAccessToken(user);
        assertFalse(jwtService.isTokenValid(token));
    }

    @Test
    public void whenTokenTampered_thenValidationFails() {
        User user = new User();
        user.setId("user-123");
        user.setEmail("user@test.com");
        user.setRole(UserRole.MEMBER);

        String token = jwtService.generateAccessToken(user);
        String tamperedToken = token + "modified";
        assertFalse(jwtService.isTokenValid(tamperedToken));
    }
}
