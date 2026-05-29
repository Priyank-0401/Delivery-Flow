# DeliveryFlow - Project Health Engine

**Document ID:** DF-SRS-03  
**Target Audience:** Solution Architects, Data Scientists, Backend Engineers, PMO

The Project Health Engine replaces subjective, human-reported status updates with an objective, mathematically derived, real-time health score (0-100). It acts as the core heartbeat monitor for every project within the DeliveryFlow platform.

---

## 1. Business Purpose & Problem Being Solved

**Problem:** Today, project health is determined by a Project Manager asking team leads how things are going, synthesizing that into a gut feeling, and coloring a cell green, yellow, or red in a spreadsheet. This leads to the "Watermelon Effect"—projects that look green on the outside but are red on the inside, eventually bursting right before release.

**Purpose:** To eliminate human bias. If a project is failing, the data knows it before the humans do. By analyzing 8 distinct dimensions of execution data in real-time, the Health Engine provides an un-gameable, objective metric of project stability.

---

## 2. The 8 Dimensions of Health (The Formula)

The Health Score (`HS`) is a weighted composite of 8 normalized metrics. Each metric is calculated on a 0-100 scale, where 100 is perfect health.

### 1. Velocity Consistency (Weight: 15%)
- **Definition:** The stability of the team's output compared to their historical median.
- **Calculation:** `V_score = 100 - (abs(Current_Sprint_Velocity - Median_Velocity_Last_5_Sprints) / Median_Velocity_Last_5_Sprints * 100)`
- **Edge Case:** If it's a new team with no history, a default score of 80 is assigned until 3 sprints are completed.

### 2. Blocker Density (Weight: 15%)
- **Definition:** The percentage of active tasks currently in a blocked state.
- **Calculation:** `B_score = 100 - ( (Blocked_Tasks_Count / Active_Tasks_Count) * 200 )`
- **Rule:** If >50% of tasks are blocked, `B_score` hard-caps at 0.

### 3. Defect Leakage & Open Bugs (Weight: 10%)
- **Definition:** The ratio of critical/high bugs to completed features.
- **Calculation:** `D_score = 100 - (High_Severity_Bugs_Open * 10)`

### 4. Dependency Risk (Weight: 20%)
- **Definition:** Pulled directly from the Dependency Intelligence Engine (see DF-SRS-02).
- **Calculation:** `DR_score = 100 - (Max_Dependency_Risk_Score_In_Project * 100)`

### 5. Team Utilization & Burnout (Weight: 10%)
- **Definition:** Measures if the team is overloaded (leading to mistakes) or underloaded.
- **Calculation:** `U_score = 100 - (abs(Assigned_Hours - Available_Capacity_Hours) / Available_Capacity_Hours * 100)`
- **Rule:** Over 120% utilization immediately sets `U_score` to 0.

### 6. Sprint Stability (Weight: 10%)
- **Definition:** Measures how many days remaining in the sprint vs. points remaining.
- **Calculation:** `SS_score = (Points_Burned / Total_Committed_Points) / (Days_Passed / Total_Sprint_Days) * 100` (capped at 100).

### 7. Scope Creep (Weight: 10%)
- **Definition:** The amount of work added *after* the sprint or milestone was locked.
- **Calculation:** `SC_score = 100 - (Added_Points_Post_Start / Original_Committed_Points * 200)`

### 8. Release Confidence (Weight: 10%)
- **Definition:** ML-driven prediction of hitting the release date (Output from Risk Prediction Engine).
- **Calculation:** `RC_score = Release_Probability_Percentage`

---

## 3. Mathematical Aggregation

The final Project Health Score (`PHS`) is the sum of the weighted scores:

`PHS = (V_score * 0.15) + (B_score * 0.15) + (D_score * 0.10) + (DR_score * 0.20) + (U_score * 0.10) + (SS_score * 0.10) + (SC_score * 0.10) + (RC_score * 0.10)`

---

## 4. Thresholds & Risk Classifications (Color Coding)

| Score Range | Classification | UI Color Code | PMO Action Required |
| :--- | :--- | :--- | :--- |
| **85 - 100** | Healthy | Green | None. Project is executing nominally. |
| **70 - 84** | At Risk | Yellow | Scrum Master must review flagged metrics. |
| **50 - 69** | Critical | Orange | Delivery Manager intervention required. |
| **0 - 49** | Failing | Red | Immediate PMO Escalation & Stakeholder alert. |

---

## 5. Example Calculation

**Project Context:** "Q3 Mobile App Launch"
- Velocity: Team completed 40 points, historical median is 45. `V_score = 88.8`
- Blockers: 2 blocked out of 20 active. `B_score = 80`
- Defects: 3 high severity bugs open. `D_score = 70`
- Dependency: Upstream API is slightly delayed, Risk Score 0.4. `DR_score = 60`
- Utilization: Team assigned 100 hrs, capacity 95 hrs. `U_score = 94.7`
- Stability: Sprint is exactly on track. `SS_score = 100`
- Scope: 5 points added to 40 committed. `SC_score = 75`
- Release Confidence: ML predicts 80% chance of success. `RC_score = 80`

**Calculation:**
`PHS = (88.8 * 0.15) + (80 * 0.15) + (70 * 0.10) + (60 * 0.20) + (94.7 * 0.10) + (100 * 0.10) + (75 * 0.10) + (80 * 0.10)`
`PHS = 13.32 + 12.0 + 7.0 + 12.0 + 9.47 + 10.0 + 7.5 + 8.0`
**Final Health Score = 79.29 (Yellow / At Risk)**

---

## 6. Implementation Notes & Edge Cases

- **Data Staleness:** If the engine receives no webhook updates for a project for over 72 hours (excluding weekends), the Health Score automatically decays by 5 points per day. A project cannot remain "Green" if nobody is actively working on it.
- **Custom Weighting:** PMOs can adjust the weights of the 8 dimensions globally (e.g., if a company cares more about quality, they can increase the Defect weight to 25% and reduce Scope Creep). However, the sum of weights must strictly validate to 1.0 (100%).
