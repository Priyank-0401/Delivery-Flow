# DeliveryFlow - Non-Functional Requirements & Cloud Architecture

**Document ID:** DF-SRS-09  
**Target Audience:** DevOps Engineers, Cloud Architects, Security Officers

DeliveryFlow is a high-throughput, enterprise-grade SaaS application. It must ingest thousands of webhooks per minute from external integrations while maintaining sub-second latency for UI rendering and graph traversal.

---

## 1. Non-Functional Requirements (NFRs)

### 1.1 Security
- **Data at Rest:** All EBS volumes and RDS instances must use AES-256 encryption via AWS KMS.
- **Data in Transit:** TLS 1.3 is enforced globally via AWS API Gateway and ALB. No unencrypted HTTP traffic allowed.
- **Authentication:** OAuth2/OIDC via AWS Cognito or Corporate SSO. JWT tokens expire every 1 hour.
- **Tenant Isolation:** Postgres Row-Level Security (RLS) ensures `tenant_a` can never query `tenant_b` data.

### 1.2 Scalability
- **Horizontal Scaling:** Spring Boot microservices must be completely stateless (session state in Redis) to allow auto-scaling in EKS based on CPU utilization > 70%.
- **Event Streaming:** Kafka (Amazon MSK) is partitioned by `tenant_id` to ensure strict event ordering per project while scaling throughput across 12+ brokers.

### 1.3 Availability & Reliability
- **Uptime Target:** 99.99% (Maximum 4.32 minutes of downtime per month).
- **Multi-AZ:** All critical infrastructure (EKS, RDS, MSK, Redis) must be deployed across 3 Availability Zones (AZs) in the `us-east-1` region.
- **Graceful Degradation:** If the AI Insights Engine (LLM API) is unavailable, the core Health Scores and dashboards must continue to function.

### 1.4 Performance
- **API Latency:** 95th percentile (P95) response time must be < 200ms for standard CRUD operations.
- **Graph Traversal:** Critical Path recalculation must complete in < 1000ms for graphs up to 5,000 nodes.
- **Web UI:** Initial Time To Interactive (TTI) must be < 1.5 seconds on a standard broadband connection.

### 1.5 Observability
- **Metrics:** Prometheus scrapes EKS pods every 15 seconds.
- **Logging:** All application logs are pushed to Amazon CloudWatch via FluentBit. Logs must be structured as JSON.
- **Tracing:** OpenTelemetry (OTEL) is used to inject `trace_id` headers to track a single request from the API Gateway, through Kafka, to the database.

### 1.6 Disaster Recovery & Backup Strategy
- **RTO (Recovery Time Objective):** 4 Hours.
- **RPO (Recovery Point Objective):** 5 Minutes.
- **Strategy:** Amazon RDS Automated Backups (Point-In-Time-Recovery) configured for 30 days. Weekly manual snapshots copied to a secondary AWS Region (`us-west-2`) for catastrophic region failure.

### 1.7 Compliance
- **SOC2 Type II:** Architecture must support continuous compliance auditing.
- **GDPR / CCPA:** Must provide a hard-delete API for user PII (Right to be Forgotten).

---

## 2. AWS Cloud Architecture

DeliveryFlow is exclusively hosted on AWS, utilizing cloud-native managed services to reduce operational overhead.

### Component Selection Justification
- **Amazon Route53:** Global DNS routing and health checking.
- **Amazon API Gateway:** Handles rate-limiting, JWT validation, and DDoS protection (via AWS Shield) before traffic hits the cluster.
- **Amazon EKS (Elastic Kubernetes Service):** Orchestrates the Spring Boot microservices. Chosen for its vendor-agnostic container management and massive scaling capabilities.
- **Amazon RDS (PostgreSQL):** The primary relational datastore. Chosen for ACID compliance, JSONB support, and robust Point-In-Time Recovery.
- **Amazon ElastiCache (Redis):** Handles distributed caching (Health Score caching) and user session state to keep EKS pods stateless.
- **Amazon MSK (Managed Streaming for Kafka):** Ingests the massive volume of webhook events from Jira/GitHub. Chosen over SQS because Kafka allows event replay and strict ordering.
- **Amazon S3:** Stores generated PDF/Excel reports and UI static assets.
- **Amazon Cognito:** Manages local user directories and brokers SAML connections to corporate IdPs (Okta/Entra ID).
- **Amazon CloudWatch:** Centralized aggregation for logs and metrics.
- **Amazon SNS:** Publishes high-severity system alerts (e.g., "DB CPU at 95%") to the DevOps on-call PagerDuty schedule.

---

## 3. Deployment Flow (CI/CD)

1. **Commit:** Developer pushes code to GitHub `main` branch.
2. **Build:** GitHub Actions runs Unit Tests, SonarQube static analysis, and builds the Docker image.
3. **Publish:** Image is pushed to Amazon ECR (Elastic Container Registry).
4. **Deploy:** ArgoCD (running inside EKS) detects the new ECR image tag and updates the Kubernetes Deployment manifests.
5. **Rollout:** EKS performs a Rolling Update, spinning up new pods and gracefully terminating old ones to ensure zero-downtime deployment.

---

## 4. Cost Considerations
- **Compute:** Utilize AWS Graviton (ARM) EC2 instances for EKS worker nodes to reduce compute costs by 20%. Use Spot Instances for background batch-processing workers.
- **Data Transfer:** Keep API Gateway, EKS, and RDS in the same VPC to eliminate intra-AWS data egress charges.
- **Storage Tiering:** Move old PDF reports in S3 to Glacier Infrequent Access after 90 days.
