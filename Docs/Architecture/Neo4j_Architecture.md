# DeliveryFlow - Neo4j Architecture

**Document ID:** DF-ARCH-03  
**Target Audience:** Backend Engineers, Data Scientists

Neo4j is the engine that powers DeliveryFlow's flagship feature: The Dependency Intelligence Engine. It is used exclusively for graph traversal and structural analysis, not for storing long-form text or metadata.

---

## 1. Graph Schema

To ensure performance, nodes in Neo4j only store the absolute minimum data required to calculate critical paths. All other data (descriptions, comments, attachments) remains in Postgres.

### 1.1 Nodes
- `(:Task)`
  - `id`: UUID (matches Postgres Task ID)
  - `status`: String (e.g., "DONE", "IN_PROGRESS")
  - `estimated_duration_days`: Float (Derived from story points / velocity)
- `(:Milestone)`
  - `id`: UUID
  - `target_date`: Timestamp

### 1.2 Relationships
- `[:BLOCKS]` - Directed edge indicating the Target cannot start until the Source is `DONE`.
- `[:TARGETS]` - Directed edge linking the final task in a chain to a Milestone.

---

## 2. Critical Path Algorithm (Cypher)

The system must dynamically find the path with zero slack. Because Neo4j's built-in `shortestPath` algorithms measure *hops*, not *time*, we implement a custom Cypher query utilizing list comprehension and reduction to sum the `estimated_duration_days` along paths.

**Draft Query Logic:**
```cypher
MATCH path = (start:Task)-[:BLOCKS*]->(end:Milestone {id: $milestoneId})
WHERE NOT ()-[:BLOCKS]->(start) // Find root nodes
WITH path, 
     reduce(totalDuration = 0.0, node IN nodes(path) | 
            totalDuration + coalesce(node.estimated_duration_days, 0.0)) AS pathDuration
ORDER BY pathDuration DESC
LIMIT 1
RETURN path, pathDuration
```
*Note: This query finds the longest path in terms of time, which by definition is the Critical Path.*

---

## 3. Circular Dependency Detection

Circular dependencies (A blocks B, B blocks C, C blocks A) will cause infinite loops in critical path calculations.

**Constraint Enforcement:**
Before inserting a new `[:BLOCKS]` edge from Node A to Node B, the system must check if a path already exists from Node B to Node A.

**Validation Query:**
```cypher
MATCH path = (b:Task {id: $targetId})-[:BLOCKS*]->(a:Task {id: $sourceId})
RETURN count(path) > 0 AS cycleExists
```
If `cycleExists` is true, the API rejects the request with a `400 Bad Request: Circular Dependency Detected`.

---

## 4. UI Data Formatting
The React Flow UI expects data in a specific `nodes` and `edges` format. The backend `GraphService` maps Neo4j's native path results directly into this JSON structure to minimize frontend processing overhead.
