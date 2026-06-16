# Feature Specification: Authentication & Security Infrastructure

**Feature Branch**: `phase-1.1-auth-security`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Phase 1.1 — Authentication & Security Infrastructure for DeliveryFlow. Implement JWT-based authentication, Spring Security filter chain, RBAC, protected API routes, input validation, global exception handling, and standardized error responses. This is the foundational security layer that ALL subsequent features depend on."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Login with JWT (Priority: P1)

A registered user navigates to the DeliveryFlow login page, enters their email and password, and receives a JWT access token + refresh token. The access token is used to authenticate all subsequent API requests. The refresh token is stored in an HTTP-only cookie and can be used to obtain a new access token when the current one expires.

**Why this priority**: Authentication is the absolute foundation. No other feature can function without user identity. Every API call in the platform depends on knowing WHO is making the request.

**Independent Test**: Can be fully tested by sending a POST to `/api/v1/auth/login` with valid credentials and verifying a JWT is returned with correct claims (userId, role, tenantId, expiry). Then use that token to access a protected endpoint.

**Acceptance Scenarios**:

1. **Given** a registered user with email "demo@deliveryflow.io" and password "SecurePass123!", **When** they POST to `/api/v1/auth/login` with valid credentials, **Then** the response returns HTTP 200 with `{ "accessToken": "<jwt>", "tokenType": "Bearer", "expiresIn": 3600, "user": { "id", "email", "name", "role" } }` and a `Set-Cookie` header containing the refresh token (HttpOnly, Secure, SameSite=Strict).
2. **Given** a user attempts login with incorrect password, **When** they POST to `/api/v1/auth/login`, **Then** the response returns HTTP 401 with `{ "status": 401, "message": "Invalid credentials", "timestamp": "<ISO-8601>" }` and no token is issued.
3. **Given** a user attempts login with a non-existent email, **When** they POST to `/api/v1/auth/login`, **Then** the response returns HTTP 401 with the same generic "Invalid credentials" message (no information leakage about whether the email exists).
4. **Given** a user has exceeded 5 failed login attempts within 1 minute, **When** they attempt another login, **Then** the response returns HTTP 429 with `{ "status": 429, "message": "Too many login attempts. Please try again later." }`.

---

### User Story 2 - User Registration (Priority: P1)

A new user can create an account by providing their name, email, and password. The system validates the input, hashes the password with BCrypt, creates the user record, and returns a JWT token so the user is immediately logged in after registration.

**Why this priority**: Without registration, the system has no users beyond the hardcoded seed user. This is essential for any multi-user scenario.

**Independent Test**: POST to `/api/v1/auth/register` with valid data, verify user is created in DB with hashed password, and a valid JWT is returned.

**Acceptance Scenarios**:

1. **Given** a new user with valid email "newuser@company.com", name "Jane Doe", and password "MyStr0ng!Pass", **When** they POST to `/api/v1/auth/register`, **Then** the response returns HTTP 201 with the same token structure as login, the user exists in the database with a BCrypt-hashed password, and the role defaults to "MEMBER".
2. **Given** a user attempts to register with an email that already exists, **When** they POST to `/api/v1/auth/register`, **Then** the response returns HTTP 409 with `{ "status": 409, "message": "An account with this email already exists" }`.
3. **Given** a user submits a password shorter than 12 characters, **When** they POST to `/api/v1/auth/register`, **Then** the response returns HTTP 400 with validation errors specifying the password policy requirements.
4. **Given** a user submits an invalid email format, **When** they POST to `/api/v1/auth/register`, **Then** the response returns HTTP 400 with `{ "errors": [{ "field": "email", "message": "Must be a valid email address" }] }`.

---

### User Story 3 - Protected API Access via JWT (Priority: P1)

All existing API endpoints (projects, tasks, sprints, teams, users, analytics) are protected behind JWT authentication. Requests without a valid `Authorization: Bearer <token>` header receive a 401 Unauthorized response. Requests with an expired token receive a 401 with a specific "Token expired" message.

**Why this priority**: Without protecting existing endpoints, the application has zero security. This is a hard prerequisite for RBAC and all future features.

**Independent Test**: Try accessing `GET /api/v1/projects` without a token (expect 401), with an invalid token (expect 401), with an expired token (expect 401), and with a valid token (expect 200).

**Acceptance Scenarios**:

1. **Given** a request to `GET /api/v1/projects` without an Authorization header, **When** the request is received, **Then** the response returns HTTP 401 with `{ "status": 401, "message": "Authentication required" }`.
2. **Given** a request with `Authorization: Bearer <valid-jwt>`, **When** the request is received, **Then** the Spring Security filter extracts the userId and role from the JWT, sets the SecurityContext, and the request proceeds to the controller.
3. **Given** a request with an expired JWT (older than 60 minutes), **When** the request is received, **Then** the response returns HTTP 401 with `{ "status": 401, "message": "Token has expired" }`.
4. **Given** a request with a malformed/tampered JWT, **When** the request is received, **Then** the response returns HTTP 401 with `{ "status": 401, "message": "Invalid token" }`.

---

### User Story 4 - Token Refresh (Priority: P2)

When a user's access token expires, the frontend can call `POST /api/v1/auth/refresh` with the refresh token cookie to obtain a new access token without re-entering credentials. This enables seamless session continuation.

**Why this priority**: Essential for UX — users shouldn't have to re-login every 60 minutes. But the system works without it (users can re-login manually).

**Independent Test**: Login to get tokens, wait for access token expiry (or use a short-lived test token), call refresh endpoint, verify new access token is issued.

**Acceptance Scenarios**:

1. **Given** a user has a valid refresh token cookie, **When** they POST to `/api/v1/auth/refresh`, **Then** the response returns HTTP 200 with a new access token and the refresh token cookie is rotated (new refresh token issued, old one invalidated).
2. **Given** a user's refresh token has been revoked or expired, **When** they POST to `/api/v1/auth/refresh`, **Then** the response returns HTTP 401 with `{ "message": "Refresh token is invalid or expired. Please log in again." }`.

---

### User Story 5 - Role-Based Access Control (RBAC) (Priority: P2)

The system enforces role-based authorization on API endpoints. Four roles exist: ADMIN, PMO, MANAGER, MEMBER. Each role has specific permissions. Admin can manage users and system settings. PMO can manage portfolios and view all projects. Manager can manage their assigned projects and teams. Member can view assigned projects and update their own tasks.

**Why this priority**: RBAC is critical for multi-tenant security and data isolation. Without it, any authenticated user can do anything.

**Independent Test**: Login as a MEMBER and attempt to DELETE a project (expect 403). Login as ADMIN and perform the same action (expect 200).

**Acceptance Scenarios**:

1. **Given** a user with role "MEMBER" tries to `DELETE /api/v1/projects/{id}`, **When** the request is processed, **Then** the response returns HTTP 403 with `{ "status": 403, "message": "Access denied. Insufficient permissions." }`.
2. **Given** a user with role "ADMIN" tries to `DELETE /api/v1/projects/{id}`, **When** the request is processed, **Then** the deletion succeeds.
3. **Given** a user with role "MANAGER" tries to access a project they are NOT assigned to, **When** the request is processed, **Then** the response returns HTTP 403.

---

### User Story 6 - Get Current User Profile (Priority: P2)

An authenticated user can call `GET /api/v1/users/me` to retrieve their own profile information, including their id, name, email, role, and team memberships.

**Why this priority**: The frontend needs this endpoint to display the current user's info in the header and to determine which UI elements to show based on role.

**Independent Test**: Login, call `/api/v1/users/me` with the token, verify the response contains the correct user data.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they GET `/api/v1/users/me`, **Then** the response returns HTTP 200 with `{ "id": "...", "name": "...", "email": "...", "role": "...", "createdAt": "..." }`.
2. **Given** an unauthenticated request, **When** they GET `/api/v1/users/me`, **Then** the response returns HTTP 401.

---

### User Story 7 - Global Exception Handling & Standardized Errors (Priority: P1)

ALL API errors across the entire application return a consistent JSON structure. No stack traces leak in production. Validation errors include field-level detail. 404s, 500s, and all other HTTP errors follow the same format.

**Why this priority**: Industry-grade APIs must have consistent, predictable error responses. This is foundational infrastructure that every API consumer depends on.

**Independent Test**: Trigger various error scenarios (404 not found, 400 validation, 500 server error, 401 auth, 403 forbidden) and verify all return the standardized format.

**Acceptance Scenarios**:

1. **Given** a request to `GET /api/v1/projects/nonexistent-id`, **When** the project is not found, **Then** the response returns HTTP 404 with `{ "status": 404, "message": "Project not found", "timestamp": "<ISO-8601>", "path": "/api/v1/projects/nonexistent-id" }`.
2. **Given** a POST request with invalid JSON body, **When** validation fails, **Then** the response returns HTTP 400 with `{ "status": 400, "message": "Validation failed", "errors": [{ "field": "name", "message": "must not be blank" }], "timestamp": "..." }`.
3. **Given** an unexpected server error occurs, **When** the exception is caught, **Then** the response returns HTTP 500 with `{ "status": 500, "message": "An unexpected error occurred", "timestamp": "..." }` and the actual stack trace is logged server-side only.

---

### User Story 8 - Input Validation on All Endpoints (Priority: P2)

All existing and new API endpoints validate their request bodies using Bean Validation annotations (@NotBlank, @Email, @Size, @Min, etc.). Invalid input is rejected before reaching service logic.

**Why this priority**: Prevents garbage data from entering the system and provides clear feedback to API consumers.

**Independent Test**: Send a POST to create a project with a blank name, verify 400 with field-level validation errors.

**Acceptance Scenarios**:

1. **Given** a POST to `/api/v1/projects` with `{ "name": "" }`, **When** validation runs, **Then** the response returns HTTP 400 with errors array containing `{ "field": "name", "message": "must not be blank" }`.
2. **Given** a POST to `/api/v1/auth/register` with `{ "email": "not-an-email", "password": "short" }`, **When** validation runs, **Then** the response returns HTTP 400 with multiple validation errors.

---

### Edge Cases

- What happens when the JWT signing key is rotated? → All existing tokens become invalid; users must re-authenticate.
- What happens when a user is deleted/deactivated while they have an active session? → On next request, the JWT filter checks user existence; if deleted, return 401.
- What happens with concurrent refresh token usage? → Only the latest refresh token is valid (token rotation); reuse of an old refresh token invalidates all tokens for that user (security measure).
- What happens when the database is down during login? → Return 503 Service Unavailable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users via email + password using JWT tokens (access + refresh)
- **FR-002**: System MUST hash passwords using BCrypt with strength factor 12
- **FR-003**: System MUST issue access tokens with 60-minute expiry containing userId, email, role, and issuedAt claims
- **FR-004**: System MUST store refresh tokens in HTTP-only, Secure, SameSite=Strict cookies
- **FR-005**: System MUST enforce role-based access control with roles: ADMIN, PMO, MANAGER, MEMBER
- **FR-006**: System MUST validate all API request bodies using Bean Validation before processing
- **FR-007**: System MUST return standardized error JSON for ALL error responses (400, 401, 403, 404, 409, 429, 500)
- **FR-008**: System MUST rate-limit authentication endpoints (login/register) to 5 requests per minute per IP
- **FR-009**: System MUST log all authentication events (login success, login failure, token refresh, logout) to the audit trail
- **FR-010**: System MUST version all API paths with `/api/v1/` prefix
- **FR-011**: System MUST configure CORS with explicit origin allowlist (no wildcards)
- **FR-012**: System MUST add `password_hash` column to users table and remove any plaintext password storage
- **FR-013**: System MUST add `@Valid` annotations to all controller method parameters that accept request bodies

### Key Entities

- **User (enhanced)**: Existing user entity enhanced with `passwordHash` (BCrypt), `role` (enum: ADMIN/PMO/MANAGER/MEMBER), `lastLoginAt`, `isActive` (boolean for soft disable), `deletedAt` (soft delete)
- **RefreshToken**: New entity — `id` (UUID), `userId` (FK), `token` (hashed), `expiresAt`, `createdAt`, `revokedAt`
- **AuditLog**: New entity — `id` (UUID), `userId` (FK), `action` (LOGIN_SUCCESS, LOGIN_FAILURE, TOKEN_REFRESH, LOGOUT, ACCESS_DENIED), `ipAddress`, `userAgent`, `timestamp`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 existing API controllers return 401 when accessed without a valid JWT
- **SC-002**: Login endpoint returns a valid JWT within 200ms (P95 latency)
- **SC-003**: All API error responses conform to the standardized format (zero stack trace leaks)
- **SC-004**: BCrypt password hashing completes within 500ms per hash operation
- **SC-005**: Expired tokens are correctly rejected (zero false positives)
- **SC-006**: Rate limiting blocks the 6th login attempt within 60 seconds
- **SC-007**: All request validation errors return field-specific messages
- **SC-008**: Unit test coverage for auth module exceeds 85%

## Assumptions

- The application currently has no authentication — this is a greenfield security implementation on an existing codebase
- The existing `users` table will be enhanced with new columns (password_hash, role enum, etc.) via a new Flyway migration
- The JWT secret key will be configured via application.yml (dev) and environment variables (production)
- SSO/SAML integration is out of scope for Phase 1.1 (deferred to a later phase)
- MFA is out of scope for Phase 1.1
- The frontend auth integration (login page, token storage, axios interceptors) will be implemented after the backend is complete
- The demo data seeder will be updated to create users with hashed passwords
