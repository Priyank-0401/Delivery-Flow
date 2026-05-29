# DeliveryFlow - Flagship Features Roadmap (Neo4j & AI)

**Document ID:** DF-RDM-05  
**Target Audience:** Data Scientists, Backend Engineers, Hiring Managers

This document outlines the strict implementation strategy for the two standout features of the platform: The Graph Engine and the AI Layer.

---

## 1. Neo4j Graph Engine Roadmap (Phase 2)

The Graph Engine transforms flat task data into a multi-dimensional execution network.

### 1.1 The Graph Model
- **Node Types:**
  - `Task` (Properties: id, title, status, due_date)
  - `Milestone` (Properties: id, target_date)
- **Relationship Types:**
  - `BLOCKS` (Task -> Task): A strict execution dependency.
  - `TARGETS` (Task -> Milestone): Linking the final task in a chain to the release date.

### 1.2 Execution Sequence

**Step 1: The Sync Layer (Week 5)**
- Do not attempt algorithms yet. Simply ensure that when a task is created/deleted in Postgres, the corresponding `Task` node is created/deleted in Neo4j via Spring Events.

**Step 2: Basic Traversal Queries (Week 6)**
- Implement the baseline Cypher queries. 
- *Query Example (Find all downstream blocked tasks):*
  ```cypher
  MATCH (root:Task {id: $taskId})-[:BLOCKS*1..5]->(downstream:Task)
  RETURN downstream
  ```

**Step 3: The Critical Path Algorithm (Week 7)**
- Implement the algorithm to find the longest path to a `Milestone`.
- *Logic:* We cannot rely on standard shortest-path algorithms. We must calculate the "Slack" of every path. The path with exactly zero slack is the critical path.

**Step 4: Bottleneck Detection (Week 8)**
- Implement the centrality algorithm.
- *Logic:* Count the number of inbound `BLOCKS` edges for every node. If Node A blocks 15 other nodes, its Bottleneck Score is extremely high.

---

## 2. AI Layer Roadmap (Phase 4)

**CRITICAL DIRECTIVE:** Do NOT start with AI. 
If you build the AI first, you are building a wrapper around OpenAI. By building the Neo4j engine and Analytics first, the AI becomes a true reasoning engine over your proprietary domain data.

### Phase 4.1: No AI (Weeks 1-11)
- **Why:** Establish the deterministic truth. A project's health score must be a mathematical certainty (e.g., 72/100) before an LLM attempts to explain it.

### Phase 4.2: AI Summaries (Week 12)
- **Implementation:** Introduce the Gemini API. Pass a flat JSON string containing the Project Name, Health Score, and Velocity metrics into a strict system prompt.
- **Output:** A 2-sentence executive summary. 
- **Value:** Proves you can integrate an LLM and parse the response into the UI.

### Phase 4.3: Risk Explanation Engine (Week 13)
- **Implementation:** Augment the prompt context. Now, query Neo4j for the Top 3 Bottleneck nodes and inject them into the prompt.
- **Prompt Logic:** *"You are a Delivery Manager. Explain why this project is at a Health Score of 72, using the following graph bottlenecks..."*
- **Output:** The LLM generates a narrative explaining that the database migration is blocking the frontend team.
- **Value:** Proves you understand basic RAG (Retrieval-Augmented Generation) by fetching deterministic database state to ground the LLM.

### Phase 4.4: Ask DeliveryFlow (Week 14)
- **Implementation:** Introduce LangGraph. Create a conversational chat agent.
- **Logic:** 
  1. User asks: *"Which team is slowing us down?"*
  2. LangGraph router determines this requires workload data.
  3. Agent executes a Postgres query to fetch Team Utilization.
  4. Agent formulates the answer.
- **Value:** Proves advanced agentic orchestration. This is the ultimate recruiter "wow" factor, moving beyond static prompts into dynamic tool-calling.
