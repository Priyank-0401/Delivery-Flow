# DeliveryFlow - AI Architecture

**Document ID:** DF-ARCH-04  
**Target Audience:** AI Engineers, Solution Architects

The AI Layer in DeliveryFlow transforms deterministic data (graphs, health scores) into contextual insights. It is strictly constrained to prevent hallucinations and relies on the Google Gemini API.

---

## 1. Architectural Principles
- **No Hallucinations:** The AI is never allowed to guess. If data is missing, it must output "Insufficient data."
- **Zero-Shot RAG:** The LLM does not have "memory" across days. Every request is injected with the exact, current state of the project at that millisecond.
- **Cost Efficiency:** Using Gemini ensures access to a generous free tier for development, with LangGraph handling the orchestration.

---

## 2. LangGraph State Machine

We utilize LangGraph to build an agentic workflow for the "Ask DeliveryFlow" chatbot. Unlike a basic linear prompt, LangGraph allows the agent to iteratively query different databases before formulating an answer.

### The Agent Workflow
1. **User Input:** *"Why is Team A delayed?"*
2. **Router Node (LLM):** Classifies the intent. 
   - *Option A:* "Needs Dependency Data" -> Routes to Neo4j Tool.
   - *Option B:* "Needs Workload Data" -> Routes to Postgres Tool.
3. **Tool Node:** Executes the specific backend service method (e.g., `workloadService.getTeamUtilization(teamId)`).
4. **Synthesis Node (LLM):** Injects the retrieved JSON payload into a strict prompt.
5. **Output:** Returns the final answer to the user.

---

## 3. Prompt Engineering (The Summarization Engine)

For static UI elements (like the "Generate Exec Summary" button), we bypass LangGraph and use a direct API call with a highly structured prompt.

### The Context Payload
When the button is clicked, the backend aggregates a JSON block:
```json
{
  "project_name": "Mobile Q3",
  "health_score": 62,
  "top_negative_driver": "Dependency Risk",
  "critical_path_blocker": "API-402 (DevOps Team)",
  "team_utilization": "115%"
}
```

### The System Prompt
```text
You are the DeliveryFlow Principal AI. You analyze software project data and report to Executives.
Read the provided JSON data.
Generate a 3-bullet-point summary.
Bullet 1: State the overall health.
Bullet 2: Identify the root cause of any delays.
Bullet 3: Provide ONE actionable recommendation.
DO NOT invent metrics. DO NOT use formatting other than bullet points.
```

---

## 4. Explainability & Trust

Enterprise users will not trust the AI if it is a black box. 
Every time the AI engine generates a summary, the backend appends an `AI_Metadata` block to the response containing the exact JSON context payload that was injected into the prompt. 

In the UI, users can click an **"Inspect AI Reasoning"** toggle. This reveals the raw JSON data the AI used to make its claim, proving mathematically that the AI's conclusion is grounded in reality.
