# DeliveryFlow - AI Insights Engine

**Document ID:** DF-SRS-04  
**Target Audience:** Solution Architects, ML Engineers, Product Managers

The AI Insights Engine transforms raw tabular data, graph metrics, and health scores into natural language narratives and actionable remediation strategies. It bridges the gap between complex data science and human decision-making.

---

## 1. Business Purpose & Problem Being Solved

**Problem:** While dashboards and health scores are useful, they still require a human to interpret them. An Executive looking at a Health Score of 65 might ask, "Why is it 65? What do we do about it?" 
**Purpose:** To provide instant, explainable, human-readable answers. The AI Insights Engine acts as an automated Data Analyst, constantly monitoring the project and generating plain-English summaries and recommendations.

---

## 2. RAG Architecture (Retrieval-Augmented Generation)

DeliveryFlow does not rely on generic LLM knowledge. It utilizes a strict RAG architecture to ensure hallucinations are mathematically impossible regarding project state.

### Architecture Flow:
1. **Trigger:** User opens a Project Dashboard or asks a natural language question via the UI Chatbot.
2. **Retrieval (Vector DB & Graph DB):** The system fetches the current Health Score breakdown, recent Jira webhook payloads, Dependency Graph critical paths, and historical team velocity from PostgreSQL/Neo4j.
3. **Context Construction:** A deterministic JSON payload of this retrieved data is constructed.
4. **Prompt Engineering:** The JSON is injected into a strict system prompt instructing the LLM (e.g., Claude 3.5 Sonnet or GPT-4) to act as a Delivery Manager.
5. **Generation:** The LLM generates the narrative based *only* on the injected JSON data.

---

## 3. Inputs & Outputs

### Inputs (The Context Window)
- **Project Metadata:** Name, Target Date, Current Health Score.
- **Negative Drivers:** The top 3 metrics dragging the Health Score down.
- **Blocker Context:** The specific Jira Ticket IDs and summaries that are blocking the critical path.
- **Capacity Data:** The specific utilization percentage of the teams involved.

### Outputs
- **Executive Summary:** A 2-sentence summary of the project state.
- **Risk Narrative:** A detailed explanation of *why* the project is at risk.
- **Remediation Recommendations:** 2-3 specific, actionable steps to fix the problem.
- **Confidence Score:** A percentage representing the statistical certainty of the AI's assessment.

---

## 4. Prompt Engineering Strategy

The system prompt enforces strict rules to prevent hallucination and maintain enterprise tone.

**Sample System Prompt Fragment:**
> "You are the DeliveryFlow AI Assistant. Analyze the provided JSON project data. You must adhere to these rules: 
> 1. Never invent data, dates, or ticket numbers. If a reason is unknown, state 'Insufficient data'.
> 2. Always output in the format: [Summary], [Root Cause], [Recommendations].
> 3. Tone must be professional, urgent if Health < 50, and objective.
> 4. Recommendations must be actionable (e.g., 'Reassign ticket X', not 'Work harder')."

---

## 5. Explainability Layer & Confidence Scores

Enterprise users distrust "black box" AI. The Explainability Layer ensures every AI claim is backed by data.

- **Citation Linking:** When the AI generates a sentence like, "The backend team is a bottleneck," it must hyperlink to the specific node in the Dependency Graph that proves this.
- **Confidence Score:** Calculated using a deterministic algorithm alongside the LLM output. If the AI recommendation is based on a team with highly erratic historical velocity, the Confidence Score will be low (e.g., 40%). If it's based on a hard graph blocker, Confidence is high (95%).

---

## 6. Example AI Responses & Risk Narratives

### Example 1: Critical Dependency Risk
**Context:** Health Score dropped from 85 to 62.
**AI Output:**
> **Summary:** The Q3 Mobile Launch is at high risk of a 14-day delay due to cascading dependency failures. (Confidence: 92%)
>
> **Root Cause:** Ticket `API-402 (Payment Gateway Update)` is currently blocked by the DevOps team. Because `API-402` is on the critical path for the Mobile Team's `MOB-110 (Checkout Screen)`, the entire sprint is now mathematically compromised.
>
> **Recommended Actions:**
> 1. **Escalate:** Immediately ping the DevOps lead regarding `API-402`.
> 2. **Pivot:** Direct the Mobile Team to begin work on `MOB-115 (User Profile)` which has no active blockers and fits within their remaining sprint capacity.

### Example 2: Workload Imbalance
**Context:** Team utilization for Backend Squad A is at 130%.
**AI Output:**
> **Summary:** Backend Squad A is severely overloaded, which is driving up defect leakage and threatening sprint stability. (Confidence: 88%)
>
> **Root Cause:** 45 story points were added to Squad A's backlog post-planning, pushing their utilization to 130% of their historical capacity. Meanwhile, Frontend Squad B is currently sitting at 65% utilization.
>
> **Recommended Actions:**
> 1. **Rebalance:** Transfer 15 points of non-specialized QA automation tasks from Squad A to Squad B to normalize utilization.
> 2. **Reject Scope:** Remove the 3 recently added feature tickets from the active sprint back to the backlog.

---

## 7. Business Rules & Edge Cases

- **Validation Rule:** The AI cannot execute destructive actions automatically. It can only *recommend*. A human must click "Execute Recommendation" (e.g., to actually reassign the ticket in Jira).
- **Edge Case - Null Data:** If a project has just started and has no history, the AI must explicitly state: "Insufficient historical data for accurate prediction. Monitoring baseline metrics."
- **Security:** RAG payloads are scrubbed of PII and strictly enforce the user's RBAC permissions. The AI will never summarize a confidential ticket the requesting user does not have permission to view.
