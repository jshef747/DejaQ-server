# DejaQ - Project Overview

## 🎯 Goal
DejaQ is an intelligent middleware designed to optimize Enterprise LLM usage. It acts as a traffic controller between users and AI models to reduce costs and latency.

## 🏗️ Architecture Flow
1.  **Client (WebSocket):** Sends a raw user query (JSON).
2.  **Gateway (FastAPI):** Validates the schema (Strict Pydantic).
3.  **Normalizer (Local Qwen 2.5):** Strips noise from the query (e.g., "umm hello" -> "search query").
4.  **Organizational Memory (Vector DB):** *[Future]* Checks if the answer is already cached.
5.  **Router (Logic):** Decides if the query is "Easy" (Local LLM) or "Hard" (External API).
6.  **Generation:**
    * **Local:** Uses Llama 3.2 (1B) via `llama-cpp-python`.
    * **External:** *[Future]* GPT-4/Gemini.
7.  **Response:** Sends the answer + metadata back to the client.

## 🔑 Key Features
* **Protocol:** WebSockets (Real-time).
* **Hardware Agnostic:** Runs on Apple Silicon (Metal) and Windows (CUDA) using GGUF models / windows CPU only.
* **Privacy:** First-party data stays local whenever possible.