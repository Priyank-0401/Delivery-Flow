# Feature Specification: Project Health Engine

**Feature Branch**: `002-project-health-engine`

**Created**: June 16, 2026

**Status**: Draft

**Input**: User description: "Project Health Engine"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Objective Health Score (Priority: P1)

As a PMO Director or Delivery Manager, I want to see an objective, real-time health score (0-100) for each project rather than subjective status colors, so that I can see the true state of projects without watermelon reporting.

**Why this priority**: It is the core goal of the project health system to remove human bias from progress reporting.

**Independent Test**: Can be tested by creating tasks, modifying velocities, and verifying that the health score is calculated automatically based on the formula.

**Acceptance Scenarios**:
1. **Given** a project with standard metrics, **When** the health score is loaded, **Then** the system returns a score from 0 to 100 representing the weighted sum of the 8 dimensions.
2. **Given** a health score under 50, **When** viewed on the dashboard, **Then** it is classified as "Failing" and colored Red.

---

### User Story 2 - Multi-dimensional Health Diagnostics (Priority: P1)

As a Delivery Manager or Scrum Master, I want to drill down into a project's health score to see the individual grades for the 8 specific execution dimensions and their contributing factors/explanations, so that I can identify which specific areas (e.g. blockers, scope creep, team overload) are dragging down the project.

**Why this priority**: Understanding *why* a project is failing is critical for taking appropriate corrective actions.

**Independent Test**: Can be tested by verifying that the health detail query returns distinct scores for Velocity, Blockers, Defects, Dependencies, Utilization, Stability, Scope Creep, and Release Confidence, along with text explanations.

**Acceptance Scenarios**:
1. **Given** a project health dashboard, **When** the user clicks "View Details", **Then** the UI presents a multi-dimensional visualization (such as a radar/spider chart or progress bars) showing the score of each of the 8 dimensions and lists the top contributing factors (e.g. "4 overdue critical path tasks").

---

### User Story 3 - Health History Trendlines (Priority: P2)

As an Executive Stakeholder or PMO Director, I want to view a historical trendline of a project's health score and the daily/weekly health delta (change) over the last 30 days, so that I can assess whether the project's health is improving, stabilizing, or declining over time.

**Why this priority**: Trend analysis helps stakeholders understand if current remediation efforts are working or if risks are accumulating.

**Independent Test**: Can be tested by verifying that daily health snapshots are recorded with `healthDelta` fields and can be queried as a time-series list.

**Acceptance Scenarios**:
1. **Given** a project with 14 days of recorded snapshots, **When** loading the trend page, **Then** the UI displays a line chart mapping the daily health score history along with delta indicators.

---

### User Story 4 - Custom Metric Weighting Configuration (Priority: P3)

As a PMO Director, I want to adjust the weights of the 8 health dimensions globally, so that the composite health score reflects my organization's unique delivery priorities.

**Why this priority**: Different organizations prioritize different metrics (e.g., software quality/defects over scope creep).

**Independent Test**: Can be tested by modifying the weights configuration, verifying it saves, and checking that subsequent health calculations apply the new weights.

**Acceptance Scenarios**:
1. **Given** a configuration screen, **When** weights are updated such that they sum to exactly 1.0 (100%), **Then** they are saved and applied.
2. **Given** a weights update that does not sum to 1.0, **When** saving, **Then** the system rejects the request with a validation error.

---

### User Story 5 - Automatic Activity Staleness Decay (Priority: P3)

As a PMO Director, I want project health scores to automatically decay if no system updates occur for over 72 hours, capped at a maximum deduction of 30 points, so that inactive or abandoned projects are flagged and cannot falsely report a "Green" status.

**Why this priority**: Ensures that data freshness is enforced and inactive projects do not slip through review.

**Independent Test**: Can be tested by setting a project's last updated timestamp to 10 days ago and verifying that the calculated health score is reduced by exactly 30 points.

---

### Edge Cases

- **No Historical Data**: If a project or team is newly created and has no historical data (e.g. no sprint velocity history), the velocity consistency score defaults to 80 until at least 3 sprints are completed.
- **Graduated Team Overload**: If utilization is between 100% and 120%, the score scales down linearly from 100 to 50. If utilization exceeds 120% up to 150%, it scales down from 50 to 0. Over 150% drops immediately to 0.
- **Extreme Blocker Count**: If more than 50% of active tasks in a project are in a blocked state, the blocker density dimension score drops immediately to 0.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate Velocity Consistency score (15% default weight) comparing the current sprint's velocity against the median velocity of the last 5 completed sprints.
- **FR-002**: System MUST calculate Blocker Density score (15% default weight) representing the ratio of blocked tasks to active tasks.
- **FR-003**: System MUST calculate Defect Leakage score (10% default weight) based on the volume of open high and critical severity bugs.
- **FR-004**: System MUST calculate Dependency Risk score (20% default weight) based on critical path metrics: % of critical path tasks overdue, number of blocked critical path tasks, and average slack across non-critical tasks.
- **FR-005**: System MUST calculate Team Utilization score (10% default weight) based on the ratio of assigned task hours to available capacity hours, using a graduated scoring curve.
- **FR-006**: System MUST calculate Sprint Stability score (10% default weight) by comparing task completion rate against sprint time elapsed.
- **FR-007**: System MUST calculate Scope Creep score (10% default weight) reflecting story points added post-sprint start.
- **FR-008**: System MUST calculate Release Confidence score (10% default weight) based on the predictive release probability (falling back to linear project completion rate).
- **FR-009**: System MUST support custom configurations for metric weights, verifying that the sum of all weights equals exactly 1.0.
- **FR-010**: System MUST automatically deduct 5 points per day from the overall health score for each day a project has had zero activity beyond a 72-hour staleness threshold, capped at a maximum deduction of 30 points.
- **FR-011**: System MUST save a daily historical snapshot of each project's health score along with `healthDelta` (day-over-day change) to support trendline plotting.
- **FR-012**: System MUST support threshold classifications: 85-100 (Healthy / Green), 70-84 (At Risk / Yellow), 50-69 (Critical / Orange), 0-49 (Failing / Red).
- **FR-013**: System MUST persist text explanations/contributing factors (e.g., "4 overdue critical path tasks") alongside calculated metrics.
- **FR-014**: System MUST trigger immediate health recalculations on specific lifecycle events: task status changes, dependency relationships change, sprint scope changes, and critical path recalculations.

### Key Entities *(include if feature involves data)*

- **ProjectHealthMetric**: Stores current metrics for each of the 8 dimensions, contributing factors list (as a serialized list or text), and the aggregated overall health score for a project.
- **ProjectHealthConfig**: Stores the weighting coefficients (0.0 to 1.0) and threshold values for project health calculations.
- **HealthHistorySnapshot**: Stores the historical records of a project's overall health score, daily health delta (`healthDelta`), and snapshot date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The system must calculate a project's composite health score in under 500 milliseconds.
- **SC-002**: Daily health snapshots must run automatically at midnight for all active projects.
- **SC-003**: The UI must load and render the multi-dimensional spider/radar chart in under 1 second.
- **SC-004**: The system must trigger alerts to Slack/Notification panel in under 5 seconds when a project health status crosses a boundary (e.g. slides from Green to Yellow).

## Assumptions

- Historical task and bug metadata are stored and kept up to date in PostgreSQL.
- Capacity hours per sprint are configured at the team level.
- Predictive release confidence values will fall back to a linear completion forecast if the machine learning predictor is not configured.
- Weekends are excluded from the 72-hour data staleness calculations.
