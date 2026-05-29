# ADR-004: MVP Deployment Architecture - AWS EC2 & Docker

**Status:** Accepted  
**Date:** 2026-05-29  
**Decision Maker:** Principal Engineer

## 1. Context
To maximize completion probability, the deployment phase must not become a black hole of DevOps complexity. However, to maximize recruiter impact, the deployment cannot just be a Heroku or Vercel click-to-deploy monolith. It must demonstrate an understanding of Linux, containerization, and reverse proxies.

## 2. Decision
We will deploy the DeliveryFlow MVP to a single **AWS EC2 instance** using **Docker Compose** and **Nginx**.

## 3. Alternatives Considered
- **Kubernetes (AWS EKS):** 
  - *Pros:* Enterprise standard, massive buzzword value. 
  - *Cons:* Brutal learning curve. Massive overkill for a solo developer MVP. High AWS costs just to keep the control plane running. Will likely derail the project timeline.
- **AWS ECS (Fargate):** 
  - *Pros:* Serverless containers. 
  - *Cons:* Hides the underlying OS and networking configuration, which is valuable to learn and demonstrate.

## 4. Tradeoffs
- *Pros:* Docker Compose provides a clean, infrastructure-as-code representation of the entire stack (React, Spring Boot, Postgres, Neo4j, Redis). EC2 + Nginx demonstrates fundamental networking, port forwarding, and SSL termination knowledge. Extremely cost-effective.
- *Cons:* Manual scaling. No automated self-healing if the EC2 instance goes down (acceptable for an MVP portfolio piece).

## 5. Consequences
We will write a `docker-compose.yml` file that orchestrates the 5 necessary containers. Nginx will sit in front of the EC2 instance, serving the static React build and reverse-proxying API calls to the Spring Boot container. Later, we will add a GitHub Actions pipeline to automatically build and SCP the new Docker images to the EC2 instance on push.
