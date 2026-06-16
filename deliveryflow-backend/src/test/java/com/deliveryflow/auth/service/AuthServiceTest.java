package com.deliveryflow.auth.service;

import com.deliveryflow.auth.dto.AuthResponse;
import com.deliveryflow.auth.dto.LoginRequest;
import com.deliveryflow.auth.dto.LoginResult;
import com.deliveryflow.auth.dto.RegisterRequest;
import com.deliveryflow.auth.dto.RefreshResult;
import com.deliveryflow.common.exception.DuplicateResourceException;
import com.deliveryflow.auth.entity.RefreshToken;
import com.deliveryflow.auth.repository.RefreshTokenRepository;
import com.deliveryflow.common.enums.UserRole;
import com.deliveryflow.common.audit.service.AuditService;
import com.deliveryflow.user.entity.User;
import com.deliveryflow.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuditService auditService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(authService, "accessTokenExpiryMs", 3600000L);
        ReflectionTestUtils.setField(authService, "refreshTokenExpiryMs", 604800000L);
    }

    @Test
    public void whenValidCredentials_thenSuccessfulLogin() {
        User user = new User();
        user.setId("user-1");
        user.setName("Test User");
        user.setEmail("test@df.io");
        user.setPasswordHash("hashed_password");
        user.setRole(UserRole.MEMBER);
        user.setActive(true);

        LoginRequest request = new LoginRequest("test@df.io", "password123");

        when(userRepository.findByEmail("test@df.io")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("access_token_jwt");
        when(jwtService.generateRefreshToken()).thenReturn("refresh_token_uuid");

        LoginResult result = authService.login(request, "127.0.0.1", "Chrome");

        assertNotNull(result);
        assertEquals("refresh_token_uuid", result.refreshToken());
        AuthResponse response = result.response();
        assertEquals("access_token_jwt", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(3600L, response.expiresIn());
        assertEquals("user-1", response.user().id());
        assertEquals("Test User", response.user().name());
        assertEquals("MEMBER", response.user().role());

        // Verify audit log
        verify(auditService).logEvent(eq("user-1"), eq("LOGIN_SUCCESS"), eq("User"), eq("user-1"), eq("127.0.0.1"), eq("Chrome"), any());

        // Verify last login updated
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertNotNull(userCaptor.getValue().getLastLoginAt());

        // Verify refresh token saved
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    public void whenWrongPassword_thenThrowsBadCredentialsException() {
        User user = new User();
        user.setId("user-1");
        user.setEmail("test@df.io");
        user.setPasswordHash("hashed_password");
        user.setActive(true);

        LoginRequest request = new LoginRequest("test@df.io", "wrong_password");

        when(userRepository.findByEmail("test@df.io")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_password", "hashed_password")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(request, "127.0.0.1", "Chrome");
        });

        // Verify failure logged
        verify(auditService).logEvent(eq("user-1"), eq("LOGIN_FAILURE"), eq("User"), eq("user-1"), eq("127.0.0.1"), eq("Chrome"), any());
    }

    @Test
    public void whenNonExistentEmail_thenThrowsBadCredentialsException() {
        LoginRequest request = new LoginRequest("nonexistent@df.io", "password123");

        when(userRepository.findByEmail("nonexistent@df.io")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(request, "127.0.0.1", "Chrome");
        });

        verify(auditService).logEvent(isNull(), eq("LOGIN_FAILURE"), eq("User"), isNull(), eq("127.0.0.1"), eq("Chrome"), any());
    }

    @Test
    public void whenValidRegister_thenSuccessfulRegistration() {
        RegisterRequest request = new RegisterRequest("New User", "new@df.io", "SecurePass123!");

        User savedUser = new User();
        savedUser.setId("new-user-123");
        savedUser.setName("New User");
        savedUser.setEmail("new@df.io");
        savedUser.setRole(UserRole.MEMBER);
        savedUser.setActive(true);

        when(userRepository.existsByEmail("new@df.io")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("hashed_new_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateAccessToken(savedUser)).thenReturn("new_access_token");
        when(jwtService.generateRefreshToken()).thenReturn("new_refresh_token_uuid");

        LoginResult result = authService.register(request, "127.0.0.1", "Chrome");

        assertNotNull(result);
        assertEquals("new_refresh_token_uuid", result.refreshToken());
        AuthResponse response = result.response();
        assertEquals("new_access_token", response.accessToken());
        assertEquals("new-user-123", response.user().id());
        assertEquals("New User", response.user().name());
        assertEquals("MEMBER", response.user().role());

        verify(refreshTokenRepository).save(any(RefreshToken.class));
        verify(auditService).logEvent(eq("new-user-123"), eq("REGISTRATION_SUCCESS"), eq("User"), eq("new-user-123"), eq("127.0.0.1"), eq("Chrome"), any());
    }

    @Test
    public void whenRegisterDuplicateEmail_thenThrowsDuplicateResourceException() {
        RegisterRequest request = new RegisterRequest("New User", "existing@df.io", "SecurePass123!");

        when(userRepository.existsByEmail("existing@df.io")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> {
            authService.register(request, "127.0.0.1", "Chrome");
        });

        verify(auditService).logEvent(isNull(), eq("REGISTRATION_FAILURE"), eq("User"), isNull(), eq("127.0.0.1"), eq("Chrome"), any());
    }

    @Test
    public void whenRegisterPasswordWeak_thenThrowsIllegalArgumentException() {
        RegisterRequest request = new RegisterRequest("New User", "new@df.io", "weakpass");

        when(userRepository.existsByEmail("new@df.io")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(request, "127.0.0.1", "Chrome");
        });
    }

    @Test
    public void whenValidRefreshToken_thenRotatesToken() {
        String rawToken = "raw_refresh_token";
        String hashedToken = authService.hashToken(rawToken);

        RefreshToken token = RefreshToken.builder()
                .userId("user-1")
                .tokenHash(hashedToken)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        User user = new User();
        user.setId("user-1");
        user.setEmail("test@df.io");
        user.setRole(UserRole.MEMBER);
        user.setActive(true);

        when(refreshTokenRepository.findByTokenHash(hashedToken)).thenReturn(Optional.of(token));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("new_access_jwt");
        when(jwtService.generateRefreshToken()).thenReturn("new_raw_refresh_uuid");

        RefreshResult result = authService.refreshToken(rawToken, "127.0.0.1", "Chrome");

        assertNotNull(result);
        assertEquals("new_raw_refresh_uuid", result.refreshToken());
        assertEquals("new_access_jwt", result.response().accessToken());
        assertEquals("Bearer", result.response().tokenType());

        // Verify old refresh token revoked
        assertNotNull(token.getRevokedAt());
        verify(refreshTokenRepository).save(token);
        // Verify new refresh token saved
        verify(refreshTokenRepository).save(argThat(newToken -> newToken.getUserId().equals("user-1") && !newToken.getTokenHash().equals(hashedToken)));
        // Verify success logged
        verify(auditService).logEvent(eq("user-1"), eq("REFRESH_SUCCESS"), eq("User"), eq("user-1"), eq("127.0.0.1"), eq("Chrome"), any());
    }

    @Test
    public void whenRefreshTokenExpired_thenThrowsBadCredentialsException() {
        String rawToken = "expired_refresh_token";
        String hashedToken = authService.hashToken(rawToken);

        RefreshToken token = RefreshToken.builder()
                .userId("user-1")
                .tokenHash(hashedToken)
                .expiresAt(LocalDateTime.now().minusHours(1))
                .build();

        when(refreshTokenRepository.findByTokenHash(hashedToken)).thenReturn(Optional.of(token));

        assertThrows(BadCredentialsException.class, () -> {
            authService.refreshToken(rawToken, "127.0.0.1", "Chrome");
        });

        verify(auditService).logEvent(eq("user-1"), eq("REFRESH_FAILURE"), eq("User"), eq("user-1"), eq("127.0.0.1"), eq("Chrome"), any());
    }

    @Test
    public void whenRefreshTokenRevoked_thenThrowsBadCredentialsException() {
        String rawToken = "revoked_refresh_token";
        String hashedToken = authService.hashToken(rawToken);

        RefreshToken token = RefreshToken.builder()
                .userId("user-1")
                .tokenHash(hashedToken)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .revokedAt(LocalDateTime.now().minusMinutes(5))
                .build();

        when(refreshTokenRepository.findByTokenHash(hashedToken)).thenReturn(Optional.of(token));

        assertThrows(BadCredentialsException.class, () -> {
            authService.refreshToken(rawToken, "127.0.0.1", "Chrome");
        });

        verify(auditService).logEvent(eq("user-1"), eq("REFRESH_FAILURE"), eq("User"), eq("user-1"), eq("127.0.0.1"), eq("Chrome"), any());
    }
}
