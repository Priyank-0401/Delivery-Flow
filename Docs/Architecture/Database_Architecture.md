# DeliveryFlow - Database Architecture

**Document ID:** DF-ARCH-02  
**Target Audience:** Backend Engineers, Data Architects

DeliveryFlow utilizes a polyglot persistence strategy. PostgreSQL serves as the primary system of record, while Neo4j and Redis serve specialized, domain-specific purposes.

---

## 1. PostgreSQL (The Primary Datastore)

Postgres is chosen for its ACID compliance, robustness, and native vector search capabilities (`pgvector`).

### Core Schema Overview
- `users`: Standard auth details.
- `teams`: Organizational groupings with capacity metrics.
- `projects`: High-level delivery containers.
- `sprints`: Time-boxed iterations linked to projects.
- `tasks`: The fundamental unit of work.

### pgvector Implementation
Instead of deploying Pinecone or Weaviate, DeliveryFlow uses the `pgvector` extension for PostgreSQL. 
- **Use Case:** Storing embeddings of "Project Retrospectives" and "Risk Logs."
- **Table:** `knowledge_embeddings`
  - `id` (UUID)
  - `project_id` (UUID)
  - `content` (TEXT)
  - `embedding` (VECTOR(768)) - Size depends on the embedding model used (e.g., text-embedding-004).
- **Value:** Allows the AI engine to query historical data natively via SQL: `SELECT content FROM knowledge_embeddings ORDER BY embedding <-> '[user query embedding]' LIMIT 3;`

---

## 2. Redis (The Cache Layer)

- **Use Case 1: Session & Rate Limiting.** While JWTs are stateless, Redis stores IP-based rate limiting counts (e.g., max 1000 webhook ingestions per minute per tenant) to protect the Postgres database from DDoS via Jira webhook flooding.
- **Use Case 2: Health Score Caching.** The 8-dimension Health Score requires complex math across multiple tables. Instead of calculating this on every page load, it is calculated periodically (or on specific webhook triggers) and the result is cached in Redis with a TTL of 1 hour.

---

## 3. Data Synchronization Strategy

The hardest problem in polyglot persistence is keeping databases in sync.

- **The Problem:** A Task is created in Postgres. It must also exist in Neo4j to be linked to other tasks.
- **The Solution:** Application-Level Event-Driven Sync.
  1. `TaskService` (PMO Module) executes `taskRepository.save()`.
  2. The transaction commits to Postgres.
  3. `TaskService` publishes a `TaskCreatedEvent` via Spring ApplicationEventPublisher.
  4. `GraphSyncListener` (Intelligence Module) receives the event.
  5. The Listener executes `neo4jTemplate.save()` to create the node.

*Note: In the MVP, this sync is synchronous or handled via `@Async`. In Phase 4, this is the prime candidate for introducing Kafka to guarantee delivery even if Neo4j reboots.*
