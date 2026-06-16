# Quickstart Validation Guide: Project Health Engine

## 1. Prerequisites
- The backend Spring Boot application must be running on `http://localhost:8080`.
- The database schema migrations must have been completed.
- Seed data must be populated in the PostgreSQL database.

## 2. API Endpoints Validation

### Scenario 1: Retrieve Current Project Health Details
- **Action**: Execute a `GET` request to `/api/v1/projects/{projectId}/health` using a valid JWT Token.
- **Expected Outcome**:
  - Response status `200 OK`.
  - JSON response containing the overall project health score and the detailed breakdown for each of the 8 dimensions:
    ```json
    {
      "projectId": "PHX-PROJECT-ID",
      "overallScore": 79,
      "velocityScore": 88,
      "blockerScore": 80,
      "defectScore": 70,
      "dependencyScore": 60,
      "utilizationScore": 94,
      "stabilityScore": 100,
      "scopeCreepScore": 75,
      "releaseConfidenceScore": 80,
      "lastCalculatedAt": "2026-06-16T17:00:00"
    }
    ```

### Scenario 2: Save Custom Health Weights
- **Action**: Execute a `PUT` request to `/api/v1/projects/{projectId}/health/config` with weights that sum to exactly `1.0`.
- **Request Body**:
  ```json
  {
    "velocityWeight": 0.10,
    "blockerWeight": 0.20,
    "defectWeight": 0.10,
    "dependencyWeight": 0.20,
    "utilizationWeight": 0.10,
    "stabilityWeight": 0.10,
    "scopeCreepWeight": 0.10,
    "releaseConfidenceWeight": 0.10
  }
  ```
- **Expected Outcome**:
  - Response status `200 OK`.
  - The configuration is saved and future health updates reflect the new weights.

### Scenario 3: Retrieve 30-Day Health History
- **Action**: Execute a `GET` request to `/api/v1/projects/{projectId}/health/history`.
- **Expected Outcome**:
  - Response status `200 OK`.
  - A chronological list of snapshots showing scores per date.

---

## 3. UI Validation
1. Log in to the application and navigate to the project dashboard.
2. Verify that the current overall health status is rendered as a color-coded indicator dial (Green, Yellow, Orange, or Red).
3. Verify that the Radar Chart loads correctly with the 8 metrics.
4. Verify that the history line chart displays the 30-day health score trend correctly.
