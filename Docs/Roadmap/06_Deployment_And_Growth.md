# DeliveryFlow - Deployment, Debt, & Resume Impact

**Document ID:** DF-RDM-06  
**Target Audience:** DevOps, Engineering, Career Mentors

This document covers the infrastructure rollout, the conscious accrual of technical debt, and an analysis of how each phase translates into extreme portfolio value.

---

## 1. Deployment Roadmap

To minimize DevOps overhead while proving cloud competence, we use a single-server Docker setup for the MVP.

### Environments
- **Development:** Localhost using Docker Compose for Postgres, Redis, and Neo4j. Spring Boot runs in IntelliJ/Eclipse. React runs via `npm run dev`.
- **Production:** A single AWS EC2 instance (t3.medium). 

### The Docker Strategy
- We will write a `docker-compose.prod.yml` that spins up:
  1. `deliveryflow-backend` (Spring Boot JAR)
  2. `deliveryflow-frontend` (Nginx serving React static build)
  3. `postgres-db`
  4. `neo4j-db`
  5. `redis-cache`
- An external Nginx reverse proxy on the host machine routes traffic to the containers and terminates SSL.

### CI/CD Pipeline
- **GitHub Actions:** On push to `main`, a workflow triggers:
  1. Runs Java JUnit tests.
  2. Runs `npm run build` for React.
  3. Builds Docker images.
  4. Executes a remote SSH script to the EC2 instance to run `docker compose up -d`.

### Observability
- **Monitoring:** OpenTelemetry (OTel) traces are configured in Spring Boot.
- **Logging:** Application logs are written to standard out and scraped by AWS CloudWatch (via the Docker awslogs driver).

---

## 2. Technical Debt Strategy

As a solo developer, you *must* accrue technical debt to ship in 15 weeks. The key is accruing it consciously and being able to explain it in an interview.

### Known Debt 1: Security & Auth
- **Debt:** Using hardcoded JWT secrets and ignoring refresh token rotation.
- **Mitigation/Explanation:** "For the MVP, I focused on the domain logic (Graph analysis). In a real environment, I would use AWS Cognito or Keycloak to manage token lifecycles and JWKS."

### Known Debt 2: Dual-Write Graph Sync
- **Debt:** When a task saves in Postgres, we synchronously save it to Neo4j in the same HTTP request.
- **Mitigation/Explanation:** "This creates tight coupling and potential consistency issues if Neo4j is down. The refactoring milestone is to introduce Kafka, publishing a `TaskCreatedEvent` that Neo4j consumes asynchronously."

### Known Debt 3: Monolithic Deployment
- **Debt:** The AI Engine and Core CRUD run in the same JVM.
- **Mitigation/Explanation:** "Since we used Spring Modulith to enforce package boundaries, splitting the AI layer into a Python/FastAPI microservice in the future is trivial."

---

## 3. Resume & Recruiter Impact Analysis

How this project elevates your portfolio at each phase:

### Phase 1: Foundation (Spring Boot, React, Postgres)
- **Impact:** You prove you can build a standard web application. 
- **Recruiter Translation:** "Standard full-stack developer. Safe hire for CRUD applications."

### Phase 2: The Graph Engine (Neo4j, Cypher, React Flow)
- **Impact:** This is the massive differentiator. You prove you can select purpose-built databases for specific domain problems.
- **Recruiter Translation:** "This developer understands complex data structures, algorithms (Critical Path), and isn't afraid of polyglot persistence. High potential."

### Phase 3: Analytics (Math, Dashboards)
- **Impact:** Proves Product Management empathy. You didn't just build tech; you built a solution that solves a business problem (quantifying project health).
- **Recruiter Translation:** "Could easily transition into a Tech Lead or Solution Architect role. Understands the business value of software."

### Phase 4: AI Layer (Gemini, LangGraph, RAG)
- **Impact:** Proves modern platform engineering. You aren't just calling OpenAI; you are using your own proprietary data (Neo4j/Postgres) to ground an LLM.
- **Recruiter Translation:** "Knows how to build Enterprise AI safely without hallucinations."

### Phase 5: OpenTelemetry & CI/CD
- **Impact:** Proves operational maturity. 
- **Recruiter Translation:** "They already know how code gets from their laptop to production, and they know how to monitor it. We don't have to teach them DevOps basics."
