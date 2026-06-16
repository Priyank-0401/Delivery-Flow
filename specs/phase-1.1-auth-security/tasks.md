# Tasks: Authentication & Security Infrastructure

**Input**: Design documents from `/specs/phase-1.1-auth-security/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Included — this is a security-critical module requiring comprehensive test coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `deliveryflow-backend/src/main/java/com/deliveryflow/`
- **Tests**: `deliveryflow-backend/src/test/java/com/deliveryflow/`
- **Migrations**: `deliveryflow-backend/src/main/resources/db/migration/`

---

## Phase 1: Setup (Dependencies & Configuration)

**Purpose**: Add required dependencies and configure Spring Security + JWT infrastructure

- [ ] T001 Add security dependencies to `deliveryflow-backend/build.gradle`: `spring-boot-starter-security`, `spring-boot-starter-validation`, `spring-boot-starter-actuator`, `io.jsonwebtoken:jjwt-api:0.12.6`, `io.jsonwebtoken:jjwt-impl:0.12.6` (runtimeOnly), `io.jsonwebtoken:jjwt-jackson:0.12.6` (runtimeOnly)
- [ ] T002 [P] Add JWT and CORS configuration properties to `deliveryflow-backend/src/main/resources/application.yml` under `app.jwt.secret`, `app.jwt.access-token-expiry-ms`, `app.jwt.refresh-token-expiry-ms`, `app.cors.allowed-origins`

---

## Phase 2: Foundational (Database & Core Infrastructure)

**Purpose**: Database migration, exception handling, and base security classes — MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create Flyway migration `V4__auth_security.sql` in `deliveryflow-backend/src/main/resources/db/migration/` — Add `password_hash`, `is_active`, `last_login_at`, `deleted_at` columns to `users` table. Create `refresh_tokens` table (id, user_id, token_hash, expires_at, revoked_at, created_at) with indexes. Create `audit_logs` table (id, user_id, action, resource_type, resource_id, ip_address, user_agent, details, created_at) with indexes.
- [ ] T004 [P] Create `ApiErrorResponse.java` record in `deliveryflow-backend/src/main/java/com/deliveryflow/common/exception/ApiErrorResponse.java` — Fields: status (int), message (String), timestamp (LocalDateTime), path (String), errors (List<FieldError>). Inner record FieldError with field (String), message (String).
- [ ] T005 [P] Create `ResourceNotFoundException.java` in `common/exception/` — extends RuntimeException, takes resourceName and resourceId in constructor
- [ ] T006 [P] Create `DuplicateResourceException.java` in `common/exception/` — extends RuntimeException, for 409 Conflict responses
- [ ] T007 [P] Create `RateLimitExceededException.java` in `common/exception/` — extends RuntimeException, for 429 Too Many Requests
- [ ] T008 Create `GlobalExceptionHandler.java` in `common/exception/` — @ControllerAdvice handling: ResourceNotFoundException→404, DuplicateResourceException→409, RateLimitExceededException→429, MethodArgumentNotValidException→400 (with field errors), AccessDeniedException→403, AuthenticationException→401, Exception→500 (generic). ALL handlers return ApiErrorResponse. Log stack traces server-side only for 500s.
- [ ] T009 [P] Create `UserRole.java` enum in `common/enums/` — values: ADMIN, PMO, MANAGER, MEMBER
- [ ] T010 Update `User.java` entity in `user/entity/` — Add fields: passwordHash (String), isActive (boolean, default true), lastLoginAt (LocalDateTime), deletedAt (LocalDateTime). Change role field from String to UserRole enum. Add @Column annotations with proper lengths.
- [ ] T011 Update `UserRepository.java` in `user/repository/` — Add methods: `Optional<User> findByEmail(String email)`, `boolean existsByEmail(String email)`, `Optional<User> findByIdAndDeletedAtIsNull(String id)`
- [ ] T012 [P] Create `AuditLog.java` entity in `common/audit/entity/` — Fields: id (UUID), userId (String), action (String), resourceType (String), resourceId (String), ipAddress (String), userAgent (String), details (String), createdAt (LocalDateTime)
- [ ] T013 [P] Create `AuditLogRepository.java` in `common/audit/repository/` — extends JpaRepository
- [ ] T014 Create `AuditService.java` in `common/audit/service/` — Method: `void logEvent(String userId, String action, String resourceType, String resourceId, String ipAddress, String userAgent, String details)`

**Checkpoint**: Foundation ready — database migrated, exception handling active, user entity enhanced

---

## Phase 3: User Story 7 - Global Exception Handling & Standardized Errors (Priority: P1) 🎯

**Goal**: All API errors return consistent JSON format. No stack trace leaks.

**Independent Test**: Trigger 404, 400, 401, 403, 500 errors and verify all use ApiErrorResponse format.

### Tests for User Story 7

- [ ] T015 [P] [US7] Create `GlobalExceptionHandlerTest.java` in `test/.../common/exception/` — Test all exception types: ResourceNotFoundException→404, DuplicateResourceException→409, MethodArgumentNotValidException→400 with field errors, generic Exception→500 with no stack trace. Use MockMvc with a test controller that throws each exception type.

### Implementation for User Story 7

- [ ] T016 [US7] Update ALL existing controllers (`ProjectController`, `TaskController`, `SprintController`, `TeamController`, `UserController`, `AnalyticsController`) — Remove `@CrossOrigin(origins = "*")` annotations. Change all `@RequestMapping` base paths to use `/api/v1/` prefix (e.g., `/api/v1/projects`). Ensure service methods throw `ResourceNotFoundException` instead of returning null.
- [ ] T017 [US7] Update all existing service classes — Replace any null returns with `throw new ResourceNotFoundException("EntityName", id)` when entities are not found.
- [ ] T018 [US7] Update `WebConfig.java` in `config/` — Replace wildcard CORS with explicit origins from `app.cors.allowed-origins` config property. Add proper methods/headers allowlist.

**Checkpoint**: All existing endpoints now return standardized errors and use /api/v1/ paths

---

## Phase 4: User Story 1 - User Login with JWT (Priority: P1) 🎯 MVP

**Goal**: Users can authenticate with email/password and receive a JWT token

**Independent Test**: POST to `/api/v1/auth/login` with valid credentials → receive JWT → use JWT to access protected endpoint

### Tests for User Story 1

- [ ] T019 [P] [US1] Create `JwtServiceTest.java` in `test/.../auth/service/` — Test generateAccessToken (verify claims: userId, email, role), test validateToken (valid, expired, tampered), test extractClaims, test token expiry
- [ ] T020 [P] [US1] Create `AuthServiceTest.java` (login tests) in `test/.../auth/service/` — Test successful login (returns tokens), test login with wrong password (throws), test login with non-existent email (throws), test login updates lastLoginAt

### Implementation for User Story 1

- [ ] T021 [P] [US1] Create `JwtService.java` in `auth/service/` — Methods: `String generateAccessToken(User user)` (claims: sub=userId, email, role, iat, exp), `String generateRefreshToken()` (random UUID), `Claims extractAllClaims(String token)`, `boolean isTokenValid(String token)`, `String extractUserId(String token)`. Use JJWT library with HS256. Read secret and expiry from `@Value("${app.jwt.*}")`.
- [ ] T022 [P] [US1] Create `LoginRequest.java` record in `auth/dto/` — Fields: @NotBlank @Email String email, @NotBlank String password
- [ ] T023 [P] [US1] Create `AuthResponse.java` record in `auth/dto/` — Fields: String accessToken, String tokenType ("Bearer"), long expiresIn, UserDTO user. Inner record UserDTO with String id, String name, String email, String role.
- [ ] T024 [US1] Create `RefreshToken.java` entity in `auth/entity/` — Fields: id (UUID), userId (String), tokenHash (String, unique), expiresAt (LocalDateTime), revokedAt (LocalDateTime), createdAt (LocalDateTime)
- [ ] T025 [P] [US1] Create `RefreshTokenRepository.java` in `auth/repository/` — Methods: `Optional<RefreshToken> findByTokenHash(String hash)`, `void deleteByUserId(String userId)`, `List<RefreshToken> findAllByUserIdAndRevokedAtIsNull(String userId)`
- [ ] T026 [US1] Create `AuthService.java` in `auth/service/` — Method: `AuthResponse login(LoginRequest request, String ipAddress, String userAgent)`. Logic: Find user by email, verify password with BCryptPasswordEncoder.matches(), generate access token via JwtService, generate and persist refresh token, log audit event, update user.lastLoginAt, return AuthResponse with tokens. Throw on invalid credentials (generic message).
- [ ] T027 [US1] Create `AuthController.java` in `auth/controller/` — `POST /api/v1/auth/login` endpoint accepting @Valid @RequestBody LoginRequest, calling AuthService.login(), setting refresh token as HttpOnly cookie in response, returning AuthResponse.

**Checkpoint**: Login endpoint works. JWT is issued on successful authentication.

---

## Phase 5: User Story 2 - User Registration (Priority: P1)

**Goal**: New users can create accounts with email/password

**Independent Test**: POST to `/api/v1/auth/register` → user created with hashed password → JWT returned

### Tests for User Story 2

- [ ] T028 [P] [US2] Add registration tests to `AuthServiceTest.java` — Test successful registration (user created, password hashed, JWT returned), test duplicate email (throws DuplicateResourceException), test password validation (too short, missing requirements)

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create `RegisterRequest.java` record in `auth/dto/` — Fields: @NotBlank @Size(max=100) String name, @NotBlank @Email String email, @NotBlank @Size(min=12, max=128) String password
- [ ] T030 [US2] Add `register()` method to `AuthService.java` — Logic: Check email uniqueness, validate password strength, hash password with BCrypt(strength=12), create User entity with role=MEMBER, generate tokens, log audit event, return AuthResponse
- [ ] T031 [US2] Add `POST /api/v1/auth/register` endpoint to `AuthController.java` — Accept @Valid @RequestBody RegisterRequest, return HTTP 201 with AuthResponse

**Checkpoint**: Users can register and immediately receive JWT tokens

---

## Phase 6: User Story 3 - Protected API Access via JWT (Priority: P1)

**Goal**: All existing endpoints require valid JWT; unauthenticated requests get 401

**Independent Test**: Access /api/v1/projects without token → 401. With valid token → 200.

### Tests for User Story 3

- [ ] T032 [P] [US3] Create `JwtAuthenticationFilterTest.java` in `test/.../auth/security/` — Test: request without token → 401, request with valid token → SecurityContext set, request with expired token → 401 with "Token expired", request with malformed token → 401 with "Invalid token"
- [ ] T033 [P] [US3] Create `AuthControllerIntegrationTest.java` in `test/.../auth/controller/` — Full MockMvc test: register user → login → use token to access /api/v1/projects → 200. Access /api/v1/projects without token → 401. Access with expired token → 401.

### Implementation for User Story 3

- [ ] T034 [US3] Create `JwtAuthenticationFilter.java` in `auth/security/` — extends OncePerRequestFilter. Logic: Extract "Bearer " token from Authorization header, validate via JwtService, extract userId, load User from DB, create UsernamePasswordAuthenticationToken with user details and authorities (role), set SecurityContextHolder. If token invalid/expired, pass to entry point.
- [ ] T035 [P] [US3] Create `JwtAuthenticationEntryPoint.java` in `auth/security/` — implements AuthenticationEntryPoint. Returns JSON ApiErrorResponse with 401 status. Differentiates between "Authentication required" (no token), "Token has expired", and "Invalid token" based on exception type.
- [ ] T036 [US3] Create `SecurityConfig.java` in `auth/security/` — @Configuration @EnableWebSecurity @EnableMethodSecurity. Define SecurityFilterChain bean: disable CSRF (stateless API), set session management to STATELESS, configure CORS from WebConfig, whitelist paths (POST /api/v1/auth/**, GET /health, GET /actuator/**, Swagger paths), require authentication for all other paths, add JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter, set JwtAuthenticationEntryPoint. Define PasswordEncoder bean (BCryptPasswordEncoder strength 12).

**Checkpoint**: ALL existing API endpoints now require JWT. The application is secured.

---

## Phase 7: User Story 4 - Token Refresh (Priority: P2)

**Goal**: Expired access tokens can be renewed via refresh token without re-login

**Independent Test**: Login → get refresh token cookie → call /api/v1/auth/refresh → get new access token

### Tests for User Story 4

- [ ] T037 [P] [US4] Add refresh token tests to `AuthServiceTest.java` — Test successful refresh (new access token issued, refresh token rotated), test with revoked refresh token (throws), test with expired refresh token (throws)

### Implementation for User Story 4

- [ ] T038 [US4] Add `refreshToken()` method to `AuthService.java` — Logic: Extract refresh token from cookie, hash it, lookup in DB, verify not expired/revoked, load user, generate new access token, rotate refresh token (revoke old, create new), return TokenRefreshResponse
- [ ] T039 [P] [US4] Create `TokenRefreshResponse.java` record in `auth/dto/` — Fields: String accessToken, String tokenType, long expiresIn
- [ ] T040 [US4] Add `POST /api/v1/auth/refresh` endpoint to `AuthController.java` — Extract refresh token from HttpServletRequest cookies, call AuthService.refreshToken(), set new refresh token cookie, return TokenRefreshResponse
- [ ] T041 [US4] Add `POST /api/v1/auth/logout` endpoint to `AuthController.java` — Revoke all refresh tokens for the user, clear the refresh token cookie, log audit event

**Checkpoint**: Token refresh flow works. Users maintain sessions seamlessly.

---

## Phase 8: User Story 5 - Role-Based Access Control (Priority: P2)

**Goal**: Endpoints enforce role-specific permissions using @PreAuthorize

**Independent Test**: Login as MEMBER → try DELETE project → 403. Login as ADMIN → same action → 200.

### Tests for User Story 5

- [ ] T042 [P] [US5] Create `RbacIntegrationTest.java` in `test/.../auth/` — Test: MEMBER cannot delete project (403), ADMIN can delete project, MEMBER cannot list all users (403), PMO can list all users, MANAGER can create project, MEMBER cannot create project (403)

### Implementation for User Story 5

- [ ] T043 [US5] Add `@PreAuthorize` annotations to all existing controllers: `ProjectController` (create: MANAGER+, delete: PMO+), `TaskController` (create: MEMBER+, delete: MANAGER+), `SprintController` (create: MANAGER+), `TeamController` (create: PMO+), `UserController` (list: PMO+, delete: ADMIN). Use SpEL expressions like `@PreAuthorize("hasAnyRole('ADMIN','PMO')")`.
- [ ] T044 [US5] Update `JwtAuthenticationFilter.java` to set proper `GrantedAuthority` from user role — Ensure the role from JWT maps to Spring Security authorities with "ROLE_" prefix (e.g., ROLE_ADMIN, ROLE_PMO)

**Checkpoint**: RBAC is enforced. Different roles have different access levels.

---

## Phase 9: User Story 6 & 8 - User Profile & Input Validation (Priority: P2)

**Goal**: /users/me endpoint returns current user. All endpoints validate input.

### Tests for User Story 6 & 8

- [ ] T045 [P] [US6] Add `/users/me` test to `AuthControllerIntegrationTest.java` — Login → call GET /api/v1/users/me → verify user data returned. Call without token → 401.
- [ ] T046 [P] [US8] Create `ValidationIntegrationTest.java` in `test/.../common/` — Test: POST project with blank name → 400 with field error. POST register with invalid email → 400 with field error. POST register with short password → 400 with field error.

### Implementation for User Story 6 & 8

- [ ] T047 [US6] Update `UserController.java` — Add `GET /api/v1/users/me` endpoint that extracts userId from SecurityContext and returns the authenticated user's profile
- [ ] T048 [US8] Add `@Valid` annotation to ALL existing controller methods that accept `@RequestBody` — ProjectController.createProject, TaskController.createTask, SprintController.createSprint, TeamController.createTeam. Add Bean Validation annotations to ALL request DTOs: CreateProjectRequest (@NotBlank name), CreateTaskRequest (@NotBlank title), CreateSprintRequest (@NotBlank name, @NotNull projectId), CreateTeamRequest (@NotBlank name), AddMemberRequest, CreateUserRequest (@Email, @NotBlank).

**Checkpoint**: User profile accessible. All inputs validated before reaching service layer.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Demo seeder update, documentation, cleanup

- [ ] T049 Update `DemoDataSeeder.java` — Hash all seeded user passwords with BCrypt. Set proper UserRole enum values. Update seed user USR-1 with hashed password "Demo@12345678" and role ADMIN.
- [ ] T050 [P] Update `application.yml` — Add Spring Actuator endpoints config (health, info), configure Swagger/OpenAPI to include JWT Bearer auth scheme, add security-related logging levels
- [ ] T051 [P] Update SpringDoc OpenAPI configuration — Add global security scheme (Bearer JWT) so Swagger UI shows "Authorize" button. Create `OpenApiConfig.java` in `config/` if needed.
- [ ] T052 Run full test suite and verify all tests pass — `./gradlew test`
- [ ] T053 Build and verify application starts correctly — `./gradlew bootRun`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US7 Global Errors (Phase 3)**: Depends on Phase 2 — Standardizes error handling for all subsequent phases
- **US1 Login (Phase 4)**: Depends on Phase 2 + Phase 3
- **US2 Register (Phase 5)**: Depends on Phase 4 (reuses AuthService, AuthController)
- **US3 JWT Protection (Phase 6)**: Depends on Phase 4 (needs JwtService)
- **US4 Token Refresh (Phase 7)**: Depends on Phase 6 (needs JWT filter working)
- **US5 RBAC (Phase 8)**: Depends on Phase 6 (needs authenticated SecurityContext)
- **US6 & US8 (Phase 9)**: Depends on Phase 6
- **Polish (Phase 10)**: Depends on all previous phases

### Parallel Opportunities

- T001 and T002 can run in parallel (Phase 1)
- T004, T005, T006, T007, T009, T012, T013 can run in parallel (Phase 2 — all create new files)
- T019 and T020 (US1 tests) can run in parallel
- T021, T022, T023, T025 (US1 models and DTOs) can run in parallel
- T049, T050, T051 (Phase 10 polish) can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1 + 3 + 7)

1. Complete Phase 1: Setup (dependencies)
2. Complete Phase 2: Foundational (migration, exceptions, entity updates)
3. Complete Phase 3: US7 — Global error handling + API versioning
4. Complete Phase 4: US1 — Login with JWT
5. Complete Phase 6: US3 — JWT protection on all endpoints
6. **STOP and VALIDATE**: Login works, all endpoints secured, errors standardized
7. Continue with remaining user stories

### Verification Command

```bash
# Run all tests
cd deliveryflow-backend && ./gradlew test

# Verify app starts
cd deliveryflow-backend && ./gradlew bootRun

# Test login flow
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@deliveryflow.io","password":"Demo@12345678"}'

# Test protected endpoint without token
curl http://localhost:8080/api/v1/projects
# Expected: 401

# Test protected endpoint with token
curl http://localhost:8080/api/v1/projects \
  -H "Authorization: Bearer <token-from-login>"
# Expected: 200
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Commit after each phase completion
- BCrypt hash generation at runtime, not hardcoded in migration
- JWT secret MUST be externalized via environment variables in production
