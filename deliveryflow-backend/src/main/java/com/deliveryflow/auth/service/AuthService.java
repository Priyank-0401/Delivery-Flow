package com.deliveryflow.auth.service;

import com.deliveryflow.auth.dto.AuthResponse;
import com.deliveryflow.auth.dto.LoginRequest;
import com.deliveryflow.auth.dto.LoginResult;
import com.deliveryflow.auth.dto.RegisterRequest;
import com.deliveryflow.auth.dto.RefreshResult;
import com.deliveryflow.auth.dto.TokenRefreshResponse;
import com.deliveryflow.common.exception.DuplicateResourceException;
import com.deliveryflow.common.enums.UserRole;
import com.deliveryflow.auth.entity.RefreshToken;
import com.deliveryflow.auth.repository.RefreshTokenRepository;
import com.deliveryflow.common.audit.service.AuditService;
import com.deliveryflow.user.entity.User;
import com.deliveryflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @Value("${app.jwt.refresh-token-expiry-ms}")
    private long refreshTokenExpiryMs;

    @Transactional
    public LoginResult login(LoginRequest request, String ipAddress, String userAgent) {
        Optional<User> userOpt = userRepository.findByEmail(request.email());

        if (userOpt.isEmpty()) {
            auditService.logEvent(null, "LOGIN_FAILURE", "User", null, ipAddress, userAgent, "Failed login attempt: non-existent email " + request.email());
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userOpt.get();

        if (!user.isActive() || user.getDeletedAt() != null) {
            auditService.logEvent(user.getId(), "LOGIN_FAILURE", "User", user.getId(), ipAddress, userAgent, "Failed login attempt: inactive/deleted account");
            throw new BadCredentialsException("Account is inactive or deleted");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            auditService.logEvent(user.getId(), "LOGIN_FAILURE", "User", user.getId(), ipAddress, userAgent, "Failed login attempt: incorrect password");
            throw new BadCredentialsException("Invalid email or password");
        }

        // Authentication successful
        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = jwtService.generateRefreshToken();
        String hashedRefreshToken = hashToken(rawRefreshToken);

        // Save refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .tokenHash(hashedRefreshToken)
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpiryMs * 1_000_000))
                .build();
        
        // Revoke any existing active refresh tokens first to prevent multiple active sessions
        refreshTokenRepository.deleteByUserId(user.getId());
        refreshTokenRepository.save(refreshToken);

        // Update user last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Log audit event
        auditService.logEvent(user.getId(), "LOGIN_SUCCESS", "User", user.getId(), ipAddress, userAgent, "Successful login");

        AuthResponse.UserDTO userDto = new AuthResponse.UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );

        AuthResponse response = new AuthResponse(
                accessToken,
                "Bearer",
                accessTokenExpiryMs / 1000,
                userDto
        );

        return new LoginResult(response, rawRefreshToken);
    }

    @Transactional
    public LoginResult register(RegisterRequest request, String ipAddress, String userAgent) {
        if (userRepository.existsByEmail(request.email())) {
            auditService.logEvent(null, "REGISTRATION_FAILURE", "User", null, ipAddress, userAgent, "Failed registration: email already exists " + request.email());
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }

        // Validate password strength: 1 upper, 1 lower, 1 digit, 1 special char, min 12 chars
        String passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{12,}$";
        if (!request.password().matches(passwordPattern)) {
            throw new IllegalArgumentException("Password does not meet complexity requirements. It must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        }

        // Create new user
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.MEMBER);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(savedUser);
        String rawRefreshToken = jwtService.generateRefreshToken();
        String hashedRefreshToken = hashToken(rawRefreshToken);

        // Save refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(savedUser.getId())
                .tokenHash(hashedRefreshToken)
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpiryMs * 1_000_000))
                .build();
        refreshTokenRepository.save(refreshToken);

        // Log audit event
        auditService.logEvent(savedUser.getId(), "REGISTRATION_SUCCESS", "User", savedUser.getId(), ipAddress, userAgent, "Successful registration");

        AuthResponse.UserDTO userDto = new AuthResponse.UserDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        AuthResponse response = new AuthResponse(
                accessToken,
                "Bearer",
                accessTokenExpiryMs / 1000,
                userDto
        );

        return new LoginResult(response, rawRefreshToken);
    }

    @Transactional
    public RefreshResult refreshToken(String rawRefreshToken, String ipAddress, String userAgent) {
        String hashedToken = hashToken(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            auditService.logEvent(token.getUserId(), "REFRESH_FAILURE", "User", token.getUserId(), ipAddress, userAgent, "Failed token refresh: token expired");
            throw new BadCredentialsException("Refresh token expired");
        }

        if (token.getRevokedAt() != null) {
            auditService.logEvent(token.getUserId(), "REFRESH_FAILURE", "User", token.getUserId(), ipAddress, userAgent, "Failed token refresh: token revoked");
            throw new BadCredentialsException("Refresh token revoked");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User account not found"));

        if (!user.isActive() || user.getDeletedAt() != null) {
            auditService.logEvent(user.getId(), "REFRESH_FAILURE", "User", user.getId(), ipAddress, userAgent, "Failed token refresh: account inactive or deleted");
            throw new BadCredentialsException("User account is inactive or deleted");
        }

        // Generate new access token
        String accessToken = jwtService.generateAccessToken(user);

        // Rotate refresh token: revoke old one, create new one
        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);

        String newRawRefreshToken = jwtService.generateRefreshToken();
        RefreshToken newRefreshToken = RefreshToken.builder()
                .userId(user.getId())
                .tokenHash(hashToken(newRawRefreshToken))
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpiryMs * 1_000_000))
                .build();
        refreshTokenRepository.save(newRefreshToken);

        // Log audit event
        auditService.logEvent(user.getId(), "REFRESH_SUCCESS", "User", user.getId(), ipAddress, userAgent, "Successful token refresh");

        TokenRefreshResponse response = new TokenRefreshResponse(
                accessToken,
                "Bearer",
                accessTokenExpiryMs / 1000
        );

        return new RefreshResult(response, newRawRefreshToken);
    }

    @Transactional
    public void logout(String rawRefreshToken, String ipAddress, String userAgent) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        String hashedToken = hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hashedToken).ifPresent(token -> {
            refreshTokenRepository.deleteByUserId(token.getUserId());
            auditService.logEvent(token.getUserId(), "LOGOUT_SUCCESS", "User", token.getUserId(), ipAddress, userAgent, "Successful logout");
        });
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
