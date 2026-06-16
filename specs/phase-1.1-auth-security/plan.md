# Implementation Plan: Authentication & Security Infrastructure

**Branch**: `phase-1.1-auth-security` | **Date**: 2026-06-16 | **Spec**: [spec.md](file:///d:/Projects/DeliveryFlow/specs/phase-1.1-auth-security/spec.md)

**Input**: Feature specification from `/specs/phase-1.1-auth-security/spec.md`

## Summary

Implement a complete JWT-based authentication and authorization layer for DeliveryFlow using Spring Security 6. This includes login/register endpoints, JWT token generation/validation, refresh token rotation, role-based access control (RBAC), global exception handling, input validation, and API versioning. All 6 existing controllers will be secured behind JWT authentication.

## Technical Context

**Language/Version**: Java 21

**Primary Dependencies**:
- `spring-boot-starter-security` — Spring Security 6 filter chain
- `io.jsonwebtoken:jjwt-api/impl/jackson` (v0.12.x) — JWT creation and parsing
- `spring-boot-starter-validation` — Bean Validation (Jakarta)
- `spring-boot-starter-actuator` — Health/readiness probes

**Storage**: PostgreSQL 15 (existing) — enhanced with new columns and tables

**Testing**: JUnit 5 + Mockito + Spring Boot Test + MockMvc

**Target Platform**: Linux/Docker server (Spring Boot fat JAR)

**Project Type**: Web service (REST API, modular monolith)

**Performance Goals**: Login P95 < 200ms, JWT validation < 5ms per request

**Constraints**: BCrypt strength 12, JWT expiry 60 minutes, refresh token 7 days

**Scale/Scope**: Single tenant initially, ~100 concurrent users

## Constitution Check

| Principle | Compliance |
|:----------|:-----------|
| I. Modular Monolith | ✅ Auth is a new self-contained package: `com.deliveryflow.auth` |
| II. Security-First | ✅ This IS the security implementation |
| III. Test-Driven | ✅ Unit tests for all services, integration tests for auth endpoints |
| IV. API Standards | ✅ Versioned paths `/api/v1/auth/*`, standardized errors |
| V. Database Integrity | ✅ Flyway migration, soft deletes, audit columns |
| VI. Observability | ✅ Actuator + security event logging |
| VII. Clean Code | ✅ DTOs, service delegation, no logic in controllers |

## Project Structure

### Documentation (this feature)

```text
specs/phase-1.1-auth-security/
├── spec.md              # Feature specification
├── plan.md              # This file
└── tasks.md             # Task breakdown (generated next)
```

### Source Code (repository root)

```text
deliveryflow-backend/
├── build.gradle                              # Add spring-security, jjwt, validation deps
├── src/main/java/com/deliveryflow/
│   ├── auth/                                 # NEW — Auth module
│   │   ├── controller/
│   │   │   └── AuthController.java           # login, register, refresh, logout
│   │   ├── dto/
│   │   │   ├── LoginRequest.java             # email, password
│   │   │   ├── RegisterRequest.java          # name, email, password
│   │   │   ├── AuthResponse.java             # accessToken, tokenType, expiresIn, user
│   │   │   └── TokenRefreshResponse.java     # accessToken, expiresIn
│   │   ├── entity/
│   │   │   └── RefreshToken.java             # id, userId, tokenHash, expiresAt, revokedAt
│   │   ├── repository/
│   │   │   └── RefreshTokenRepository.java
│   │   ├── service/
│   │   │   ├── AuthService.java              # login, register, refresh, logout logic
│   │   │   └── JwtService.java               # generateToken, validateToken, extractClaims
│   │   └── security/
│   │       ├── JwtAuthenticationFilter.java  # OncePerRequestFilter — extracts and validates JWT
│   │       ├── JwtAuthenticationEntryPoint.java  # Handles 401 responses
│   │       └── SecurityConfig.java           # SecurityFilterChain bean configuration
│   ├── common/
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java   # @ControllerAdvice
│   │   │   ├── ApiErrorResponse.java         # Standardized error DTO
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── DuplicateResourceException.java
│   │   │   └── AccessDeniedException.java
│   │   └── audit/
│   │       ├── entity/AuditLog.java
│   │       ├── repository/AuditLogRepository.java
│   │       └── service/AuditService.java
│   ├── config/
│   │   └── WebConfig.java                    # MODIFY — proper CORS configuration
│   ├── user/
│   │   ├── entity/User.java                  # MODIFY — add passwordHash, role enum, isActive
│   │   └── service/UserService.java          # MODIFY — add findByEmail, existsByEmail
│   └── [all other modules]/
│       └── controller/*.java                 # MODIFY — add @Valid, remove @CrossOrigin
├── src/main/resources/
│   ├── application.yml                       # MODIFY — add JWT config, security props
│   └── db/migration/
│       └── V4__auth_security.sql             # NEW — auth tables, user enhancements
├── src/test/java/com/deliveryflow/
│   ├── auth/
│   │   ├── controller/AuthControllerTest.java  # MockMvc integration tests
│   │   └── service/
│   │       ├── AuthServiceTest.java
│   │       └── JwtServiceTest.java
│   └── common/
│       └── exception/GlobalExceptionHandlerTest.java
```

**Structure Decision**: Auth module follows the established modular monolith pattern with its own controller/service/repository/dto/entity layers. Security configuration classes live in `auth/security/` since they are auth-specific. Global exception handling lives in `common/exception/` since it's cross-cutting.

## Detailed Implementation Design

### 1. Flyway Migration V4 (`V4__auth_security.sql`)

```sql
-- Enhance users table
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Update existing seed user with default password (BCrypt hash of "Demo@12345678")
UPDATE users SET password_hash = '$2a$12$placeholder_hash_to_be_generated_at_runtime' WHERE id = 'USR-1';
UPDATE users SET role = 'ADMIN' WHERE id = 'USR-1';
```

### 2. JWT Configuration

```yaml
# application.yml additions
app:
  jwt:
    secret: ${JWT_SECRET:deliveryflow-dev-secret-key-minimum-256-bits-long-for-hs256}
    access-token-expiry-ms: 3600000    # 60 minutes
    refresh-token-expiry-ms: 604800000 # 7 days
  cors:
    allowed-origins: http://localhost:5173,http://localhost:3000
```

### 3. Security Filter Chain Design

```
Request → CORS Filter → JWT Auth Filter → SecurityContext → Controller
                ↓
         No token / invalid → 401 (JwtAuthenticationEntryPoint)
                ↓
         Valid token → Extract userId, role → Set Authentication
                ↓
         @PreAuthorize checks → 403 if insufficient role
                ↓
         Controller → Service → Response
```

### 4. RBAC Permission Matrix

| Endpoint Pattern | ADMIN | PMO | MANAGER | MEMBER |
|:-----------------|:-----:|:---:|:-------:|:------:|
| `POST /api/v1/auth/*` | ✅ Public | ✅ Public | ✅ Public | ✅ Public |
| `GET /api/v1/users/me` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/users` | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/v1/users/{id}` | ✅ | ❌ | ❌ | ❌ |
| `POST /api/v1/projects` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/v1/projects` | ✅ | ✅ | ✅ | ✅ |
| `DELETE /api/v1/projects/{id}` | ✅ | ✅ | ❌ | ❌ |
| `POST /api/v1/teams` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/v1/analytics/*` | ✅ | ✅ | ✅ | ✅ |
| `GET /health` | ✅ Public | ✅ Public | ✅ Public | ✅ Public |

## Complexity Tracking

| Decision | Why Needed | Simpler Alternative Rejected Because |
|:---------|:-----------|:-------------------------------------|
| Refresh token rotation | Security best practice — prevents token replay attacks | Simple long-lived access tokens are insecure |
| BCrypt strength 12 | OWASP recommendation for password hashing | Lower strength factors are computationally cheap to brute-force |
| Rate limiting on auth | Prevents credential stuffing attacks | No rate limiting allows unlimited brute-force attempts |
