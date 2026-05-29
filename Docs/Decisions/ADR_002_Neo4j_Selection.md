# ADR-002: Graph Database Selection - Neo4j

**Status:** Accepted  
**Date:** 2026-05-29  
**Decision Maker:** Principal Engineer

## 1. Context
The flagship feature of DeliveryFlow is the "Dependency Intelligence Engine," which calculates critical paths, identifies cross-team bottlenecks, and detects circular dependencies. Tasks in software delivery inherently form a Directed Acyclic Graph (DAG). Calculating deep traversals (e.g., "Find all downstream tasks blocked by this API delay up to 5 levels deep") is computationally expensive in a standard relational database.

## 2. Decision
We will use **Neo4j** as our secondary database specifically for modeling and traversing task dependencies. PostgreSQL will remain the primary datastore for all standard CRUD operations (Users, Projects, Sprints). When a task is created or updated in Postgres, an event will sync the node to Neo4j.

## 3. Alternatives Considered
- **PostgreSQL Recursive CTEs:** 
  - *Pros:* Keeps the stack simple (1 database). 
  - *Cons:* Query performance degrades exponentially as graph depth increases. Does not natively support advanced graph algorithms (like Tarjan's for circular dependency detection).
- **MongoDB:** 
  - *Pros:* Document flexibility. 
  - *Cons:* Not a native graph database; ` $graphLookup` is a workaround, not a core feature.

## 4. Tradeoffs
- *Pros:* Neo4j's Cypher query language makes graph traversal trivial. Natively supports algorithms for Critical Path and Centrality (bottleneck detection). Massive resume impact for demonstrating polyglot persistence.
- *Cons:* Introduces the "Dual Write" problem. We must ensure data consistency between Postgres and Neo4j. Requires hosting and managing a second database engine.

## 5. Consequences
We must implement an event-driven sync layer (or Kafka) to keep Neo4j updated when tasks change in Postgres. We will use `Spring Data Neo4j` to interface with the database. This explicitly positions the project as an advanced engineering solution solving a specific domain problem.
