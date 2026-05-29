# DeliveryFlow - Dependency Intelligence Engine

**Document ID:** DF-SRS-02  
**Target Audience:** Solution Architects, Data Scientists, Backend Engineers, Product Managers

The Dependency Intelligence Engine is the flagship feature of DeliveryFlow. It shifts project management from flat-list task tracking to multi-dimensional graph analysis, enabling PMOs to visualize, analyze, and predict failures caused by interconnected tasks.

---

## 1. Business Purpose
To provide deterministic, mathematical visibility into how work across disparate teams is connected, ensuring that delays in upstream dependencies are immediately quantified and communicated to downstream stakeholders before they result in missed release dates.

## 2. Problem Being Solved
In enterprise software delivery, Team A often cannot finish their UI work until Team B finishes their API, which requires Team C to update a database schema. If Team C is delayed by 3 days, traditional tools require human intervention to realize that Team A will miss their sprint goal. By the time Team A realizes this, the sprint is already ruined. This engine solves the "invisible blocker" problem.

## 3. Current Industry Challenges
- **Manual Linking:** ALM tools like Jira allow "blocks/is blocked by" linking, but it is a manual, error-prone process.
- **Cross-Project Silos:** Most tools fail to visualize dependencies that cross different Jira Projects or GitHub Repositories.
- **Lack of Ripple Effect Analysis:** When a task is delayed, there is no automated system to calculate the statistical probability of that delay cascading through the network to impact a major release.

## 4. User Workflow & Journey
1. **Trigger:** A developer on Team B updates a Jira ticket (Node B) extending the due date by 2 days.
2. **Ingestion:** DeliveryFlow ingests the webhook and updates the graph in real-time.
3. **Traversal:** The engine traverses outward from Node B to find all downstream dependent tasks (Nodes A, X, Y).
4. **Recalculation:** The engine recalculates the Critical Path and Risk Scores for all downstream nodes.
5. **Alerting:** The engine determines that Node A is on the critical path for a major release. An alert is sent to Team A's Scrum Master and the Delivery Manager.
6. **Action:** The Delivery Manager uses the interactive UI graph to trace the delay back to Team B and renegotiates scope.

---

## 5. Dependency Graph Architecture

DeliveryFlow utilizes a Graph Database (Neo4j) to map the execution network. 

### Data Model
The network is a Directed Acyclic Graph (DAG) under ideal conditions, though the engine explicitly checks for cyclic violations (circular dependencies).

### Node Types
Nodes represent units of work or organizational constructs.
- `TASK`: A standard unit of work (e.g., Jira Story, Bug, Task). Attributes: `id`, `status`, `story_points`, `assignee`, `due_date`, `team_id`.
- `EPIC`: A collection of tasks.
- `MILESTONE`: A target release date or deployment marker. Attributes: `id`, `target_date`, `is_hard_deadline`.
- `DEVELOPER`: The human assigned to the work.
- `TEAM`: A logical grouping of developers.

### Edge Types (Relationships)
Edges are directional and carry a `weight` (impact score).
- `BLOCKS` (Source Task -> Target Task): Execution of Target cannot begin until Source is closed. Weight = 1.0.
- `RELATES_TO` (Source Task -> Target Task): Loose dependency, primarily informational. Weight = 0.2.
- `BELONGS_TO` (Task -> Epic, Task -> Sprint).
- `ASSIGNED_TO` (Task -> Developer).

---

## 6. Critical Path Analysis (CPA) Algorithm

DeliveryFlow dynamically calculates the Critical Path for any selected `MILESTONE` node. The critical path is the longest sequence of dependent tasks that must be completed on time for the milestone to be met.

### Pseudo Algorithm for CPA
```text
function calculateCriticalPath(milestoneNode):
    graph = fetchSubGraph(milestoneNode, direction="UPSTREAM")
    
    // Assign duration to each node. If story points exist, convert to estimated days based on team velocity.
    for node in graph:
        node.duration = estimateDuration(node.story_points, node.team_id)
        
    // Forward Pass: Calculate Earliest Start (ES) and Earliest Finish (EF)
    for node in topologicalSort(graph):
        if node.hasNoInboundBlocks():
            node.ES = today()
        else:
            node.ES = max(all upstream neighbors' EF)
        node.EF = node.ES + node.duration
        
    // Backward Pass: Calculate Latest Start (LS) and Latest Finish (LF)
    milestone_date = milestoneNode.target_date
    for node in reverseTopologicalSort(graph):
        if node.hasNoOutboundBlocks():
            node.LF = milestone_date
        else:
            node.LF = min(all downstream neighbors' LS)
        node.LS = node.LF - node.duration
        
        // Calculate Slack
        node.slack = node.LS - node.ES
        
        if node.slack <= 0:
            node.is_critical = true
            
    return filterNodes(graph, is_critical == true)
```

### Bottleneck Detection
A bottleneck is a node (often a `DEVELOPER` or a specific `TASK`) that has a disproportionately high number of inbound or outbound `BLOCKS` edges, or sits on multiple critical paths simultaneously.
- **Bottleneck Score** = `(Outbound_Edges * 1.5) + (Inbound_Edges * 1.0) + (Intersection_Count_Critical_Paths * 5.0)`

---

## 7. Dependency Risk Scoring Formula

When an upstream task is delayed, the engine assigns a Risk Score (0.0 to 1.0) to all downstream tasks.

### Variables:
- `T_delay`: Number of days the source task is delayed.
- `Slack`: The amount of slack time (in days) the downstream task has before it impacts the milestone.
- `C_weight`: Connection weight (BLOCKS = 1.0).

### Formula:
`Risk_Score = min( 1.0, (T_delay * C_weight) / max(0.1, Slack) )`

### Sample Calculation:
- **Scenario:** Database Migration (Task A) is delayed by 4 days. It BLOCKS API Dev (Task B). Task B has 2 days of Slack before the Sprint ends.
- `T_delay` = 4
- `Slack` = 2
- `C_weight` = 1.0
- **Calculation:** `(4 * 1.0) / 2 = 2.0`. Min(1.0, 2.0) = **1.0 (100% Risk - Guaranteed Sprint Failure)**.

### Risk Classifications (Decision Table)

| Risk Score Range | Classification | UI Color Code | Escalation Action |
| :--- | :--- | :--- | :--- |
| 0.00 - 0.25 | Low | Green | Informational Log Only |
| 0.26 - 0.50 | Moderate | Yellow | Alert Scrum Master |
| 0.51 - 0.85 | High | Orange | Alert Delivery Manager |
| 0.86 - 1.00 | Critical | Red | Alert PMO & Flag as Blocker |

---

## 8. Graph Traversal Logic & Circular Dependencies

### Traversal
The engine uses Breadth-First Search (BFS) for localized ripple effect analysis (e.g., "Who does this delay impact in the next 2 degrees of separation?"). It uses Depth-First Search (DFS) for validating complete paths to a milestone.

### Circular Dependency Detection
A circular dependency (A blocks B, B blocks C, C blocks A) is a catastrophic failure state in Agile execution.
- **Trigger:** On every edge creation (`BLOCKS` edge added via webhook).
- **Logic:** The engine runs Tarjan's strongly connected components algorithm on the sub-graph. 
- **Validation Rule:** If a cycle is detected, the transaction is flagged. 
- **Action:** An immediate "SEV-1 Execution Alert" is fired to all involved Scrum Masters. The UI visualizes the cycle in a red loop.

---

## 9. Cross-Team Dependency Identification

Traditional systems fail because Team A (Project X) doesn't look at Team B (Project Y). DeliveryFlow resolves this by stripping the concept of "Project" from the graph traversal.

- The Graph database treats `TEAM` as just another property.
- When an edge connects Node (Team=A) to Node (Team=B), it is tagged with an `IS_CROSS_TEAM=true` boolean.
- **Business Rule:** Any edge marked `IS_CROSS_TEAM=true` automatically receives a 1.2x multiplier to its Risk Score, as cross-team communication mathematically introduces higher latency.

---

## 10. Release Impact Analysis

When a major epic or feature is marked at risk, the system must translate this into business impact.
- **Logic:** The engine traverses to the terminal node (usually a `MILESTONE` or `RELEASE`). 
- It aggregates the financial cost or strategic weight of the delayed features.
- **Output Example:** "The delay in the Payment Gateway API (Team C) has a 92% probability of delaying the Q4 E-commerce Launch by 14 days."

---

## 11. Edge Cases & Error Handling

- **Edge Case 1: Missing Estimations.** If a task has 0 story points, the engine uses the team's historical median task completion time (e.g., 3.2 days) as a fallback duration.
- **Edge Case 2: Infinite Delays.** If an upstream task is moved to the backlog (effectively delayed infinitely), the downstream Risk Score is hardcoded to 1.0 and flagged as "Orphaned Dependency".
- **Error Handling:** If the graph database (Neo4j) is temporarily unreachable, the webhook ingestion service queues the relationship updates in Kafka to ensure zero data loss. Graph consistency is guaranteed via eventual consistency.

---

## 12. Security & Access Considerations

- **Tenant Isolation:** Graph nodes are strictly partitioned by `tenant_id`. Traversal algorithms inject `WHERE node.tenant_id = $tenant` into every Cypher query to prevent data leakage.
- **Node-Level RBAC:** While a user may see a node exists to understand the graph structure, the title/description of the blocked task may be masked (e.g., "Confidential HR Task") if the user lacks cross-project read permissions.
