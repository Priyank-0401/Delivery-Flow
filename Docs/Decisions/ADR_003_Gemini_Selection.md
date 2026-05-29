# ADR-003: AI Layer Selection - Gemini API & LangGraph

**Status:** Accepted  
**Date:** 2026-05-29  
**Decision Maker:** Principal Engineer

## 1. Context
Phase 4 of DeliveryFlow introduces the "Delivery Intelligence" layer, which requires natural language generation to explain complex risk metrics and summarize project health. We need an LLM provider and an orchestration framework that balances capability with cost constraints (as a solo developer portfolio project).

## 2. Decision
We will use the **Google Gemini API** as our foundational LLM, orchestrated via **LangGraph**. 

## 3. Alternatives Considered
- **OpenAI (GPT-4o) + LangChain:** 
  - *Pros:* Industry standard, massive mindshare. 
  - *Cons:* API costs can accumulate quickly during development and testing of RAG pipelines.
- **Local LLMs (Llama 3 via Ollama):** 
  - *Pros:* Free, private. 
  - *Cons:* Requires significant GPU resources to run locally alongside Docker, Neo4j, Postgres, and the JVM. Complicates cloud deployment significantly.

## 4. Tradeoffs
- *Pros:* The Gemini API free tier is exceptionally generous for development purposes, allowing extensive testing of our RAG architecture without burning personal capital. LangGraph provides superior agentic workflow control (cycles, state management) compared to basic LangChain chains, which is essential for multi-step data retrieval (e.g., querying Postgres *then* Neo4j before answering).
- *Cons:* Ties the AI layer to Google's ecosystem. 

## 5. Consequences
We will build the AI layer as an abstraction. The system will inject JSON context (Health Scores, Dependency Data) into the prompt. By using LangGraph, we can easily swap the underlying LLM provider in the future if desired, but we secure an immediate, cost-effective MVP execution path.
