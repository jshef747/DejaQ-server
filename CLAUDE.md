# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DejaQ is an LLM cost-optimization platform that reduces API costs through semantic caching, query classification, and hybrid model routing.

**Cache miss pipeline:** User Query → Context Enricher (Qwen 0.5B, makes query standalone) → Normalizer (Qwen 2.5, produces cache key) → Cache Filter (heuristics) → LLM gets **original query + history** (preserves tone) → Response to user → Background: Generalize response (Phi-3.5 Mini) → Store in ChromaDB (if filter passes)

**Cache hit pipeline:** User Query → Context Enricher → Normalizer → ChromaDB returns tone-neutral response (cosine ≤ 0.15) → Context Adjuster adds tone → Response to user

## Commands

### Setup
```bash
# Mac (Apple Silicon) - enables Metal GPU acceleration
CMAKE_ARGS="-DLLAMA_METAL=on" uv sync

# Windows (NVIDIA) - enables CUDA acceleration
$env:CMAKE_ARGS = "-DLLAMA_CUBLAS=on"; uv sync

# CPU only
uv sync
```

### Run
```bash
uv run uvicorn app.main:app --reload
# Server at http://127.0.0.1:8000
# WebSocket test UI: open index.html in browser
```

### Endpoints
- `GET /health` — health check
- `POST /normalize` — normalize a query
- `POST /chat` — full chat pipeline (normalize → cache check → LLM → respond)
- `POST /generalize` — test endpoint: strips tone from an answer to produce neutral version
- `GET /cache/entries` — cache viewer: list all cached entries with metadata
- `DELETE /cache/entries/{id}` — delete a single cache entry
- `GET /conversations` — list all conversations (newest first)
- `GET /conversations/{id}/messages` — get conversation message history
- `DELETE /conversations/{id}` — delete a conversation
- `WS /ws/chat` — real-time WebSocket chat (with conversation history support)

## Architecture

```
app/
├── main.py              # FastAPI init, CORS, startup/shutdown
├── routers/chat.py      # All endpoints (HTTP + WebSocket) + conversation CRUD
├── services/
│   ├── model_loader.py  # ModelManager singleton (Qwen 0.5B, Qwen 1.5B, Llama 3.2 1B, Phi-3.5 Mini)
│   ├── normalizer.py    # Query cleaning via Qwen 2.5-0.5B
│   ├── llm_router.py    # Routes "easy"→Llama 3.2 1B local, "hard"→external API (stub)
│   ├── context_adjuster.py # generalize() strips tone via Phi-3.5 Mini, adjust() adds tone via Qwen 2.5-1.5B
│   ├── context_enricher.py # Rewrites context-dependent queries into standalone ones (Qwen 0.5B)
│   ├── cache_filter.py  # Smart heuristic filter: skips non-cacheable prompts (too short, filler, vague)
│   ├── conversation_store.py # In-memory multi-turn conversation history (max 20 messages)
│   ├── classifier.py    # TODO: NVIDIA prompt-task-and-complexity-classifier
│   └── memory_chromaDB.py # ChromaDB semantic cache (PersistentClient, cosine ≤ 0.15)
├── schemas/chat.py      # ChatRequest/ChatResponse (Pydantic), includes conversation_id
├── models/              # TODO: DB models (PostgreSQL)
├── repositories/        # TODO: DB access layer
└── utils/logger.py      # Centralized logging config
index.html               # WebSocket chatbot test UI with cache diagnostics (project root)
```

**Key patterns:**
- ModelManager is a singleton — models load once on first use
- Models use GGUF format via `llama-cpp-python` for cross-platform GPU support (Metal/CUDA)
- All schemas use Pydantic BaseModel
- Conversation history is passed to the LLM for multi-turn context
- Cache miss triggers background generalization + storage (BackgroundTasks for HTTP, synchronous for WebSocket) — only if cache filter passes
- Context enricher rewrites follow-up queries ("tell me more") into standalone questions before normalization
- Cache filter skips storing trivial messages (filler words, too short, too vague)

## Coding Conventions

- **Never use `print()`** — use `logging.getLogger("dejaq.<module>")` via `app.utils.logger`
- **Package manager**: `uv` only (no pip)
- **Async/await** for all I/O operations
- **Strong typing** with Pydantic for all request/response models
- **Directory structure**: routers (endpoints) → services (business logic) → schemas (data models) → models (DB) → repositories (DB access)

## Models (actual)

| Role | Model | Size | Loader |
|------|-------|------|--------|
| Normalizer | Qwen 2.5-0.5B-Instruct | Q4_K_M | `ModelManager.load_qwen()` |
| Context Adjuster (adjust) | Qwen 2.5-1.5B-Instruct | Q4_K_M | `ModelManager.load_qwen_1_5b()` |
| Generalizer (strip tone) | Phi-3.5-Mini-Instruct | Q4_K_M | `ModelManager.load_phi()` |
| Local LLM (generation) | Llama 3.2-1B-Instruct | Q8_0 | `ModelManager.load_llama()` |

## Current Status

**Working:** FastAPI WebSocket + HTTP, Normalizer (Qwen 0.5B), LLM Router (Llama 3.2 1B local), Context Adjuster (generalize via Phi-3.5 + adjust via Qwen 1.5B), Semantic cache (ChromaDB, cosine ≤ 0.15), Multi-turn conversation history (in-memory), Conversation CRUD endpoints, Background generalize+store on cache miss, Hardware acceleration (Metal/CUDA), Context Enricher (conversation-aware caching), Smart Cache Filter (skip non-cacheable prompts), Cache Viewer API + UI panel
**In progress:** Difficulty Classifier (NVIDIA), Database integration (PostgreSQL), Non-blocking generalize+store in WebSocket (currently `_generalize_and_store` blocks the next message — needs `asyncio.to_thread()` + `create_task()` or Celery)
**Planned:** Celery/RabbitMQ task queue, External LLM APIs (GPT/Gemini), Feedback loop, React frontend, Persistent conversation storage (currently in-memory only)