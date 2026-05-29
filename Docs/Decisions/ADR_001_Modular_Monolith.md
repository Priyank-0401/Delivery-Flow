# ADR-001: Backend Architecture - Modular Monolith

**Status:** Accepted  
**Date:** 2026-05-29  
**Decision Maker:** Principal Engineer

## 1. Context
DeliveryFlow is an enterprise SaaS platform with multiple distinct domains (Auth, Project Management, Analytics, AI). As a solo developer optimizing for completion probability and recruiter impact, we need an architecture that allows rapid iteration while demonstrating an understanding of enterprise scaling patterns. Starting with a distributed microservices architecture introduces massive operational overhead (network latency, distributed tracing, complex deployments).

## 2. Decision
We will build the Spring Boot backend as a **Modular Monolith**. The application will compile into a single `.jar` file and run as a single process, but the internal package structure will strictly enforce domain boundaries (e.g., `com.deliveryflow.auth`, `com.deliveryflow.projects`, `com.deliveryflow.graph`). 

We will use **Spring Modulith** to enforce these boundaries at compile-time, ensuring that one domain cannot directly access the internal database repositories of another domain.

## 3. Alternatives Considered
- **Standard Monolith (Big Ball of Mud):** 
  - *Pros:* Easiest to start. 
  - *Cons:* Extremely difficult to decouple later. Low resume impact.
- **Microservices Architecture:** 
  - *Pros:* Ultimate scalability. High recruiter buzzword value. 
  - *Cons:* Devastating to solo developer productivity. Too much DevOps overhead for Phase 1.

## 4. Tradeoffs
- *Pros:* Fast local development, single deployment pipeline, zero network latency between domains.
- *Cons:* Requires strict discipline to not violate package boundaries. A single memory leak in the AI module will crash the entire application.

## 5. Consequences
By strictly enforcing domain boundaries internally via Spring Modulith, we retain the option to easily extract any specific module (e.g., the `graph-engine`) into a standalone microservice in Phase 5 if scalability demands it, proving senior-level architectural foresight.
