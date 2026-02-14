# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DejaQ is an LLM cost-optimization platform that reduces API costs through semantic caching, query classification, and hybrid model routing.

**Cache miss pipeline (current):** User Query → Normalizer (Qwen 2.5, produces cache key) → LLM gets **original query** (preserves tone) → Response to user → Generalize response (tone-neutral, for future cache storage)

**Cache hit pipeline (future):** User Query → Normalizer → Cache returns tone-neutral response → Context Adjuster adds tone → Response to user

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
- `POST /chat` — full chat pipeline (normalize → LLM with original query → respond)
- `POST /generalize` — test endpoint: strips tone from an answer to produce neutral version
- `WS /ws/chat` — real-time WebSocket chat

## Architecture

```
app/
├── main.py              # FastAPI init, CORS, startup/shutdown
├── routers/chat.py      # All endpoints (HTTP + WebSocket)
├── services/
│   ├── model_loader.py  # ModelManager singleton (Qwen, Llama, Phi GGUF models)
│   ├── normalizer.py    # Query cleaning via Qwen 2.5-0.5B
│   ├── llm_router.py    # Routes "easy"→Llama local, "hard"→external API
│   ├── context_adjuster.py # Two-way: generalize() strips tone via Phi-3.5 Mini (for cache), adjust() adds tone via Qwen 1.5B (for cache hits)
│   ├── classifier.py    # TODO: NVIDIA prompt-task-and-complexity-classifier
│   └── memory_chromaDB.py # TODO: BERT embeddings + ChromaDB semantic cache
├── schemas/chat.py      # ChatRequest/ChatResponse (Pydantic)
├── models/              # TODO: DB models (PostgreSQL)
├── repositories/        # TODO: DB access layer
└── utils/logger.py      # Centralized logging config
```

**Key patterns:**
- ModelManager is a singleton — models load once on first use
- Models use GGUF format via `llama-cpp-python` for cross-platform GPU support (Metal/CUDA)
- All schemas use Pydantic BaseModel

## Coding Conventions

- **Never use `print()`** — use `logging.getLogger("dejaq.<module>")` via `app.utils.logger`
- **Package manager**: `uv` only (no pip)
- **Async/await** for all I/O operations
- **Strong typing** with Pydantic for all request/response models
- **Directory structure**: routers (endpoints) → services (business logic) → schemas (data models) → models (DB) → repositories (DB access)

## Current Status

**Working:** FastAPI WebSocket, Normalizer (Qwen), LLM Router (Llama local), Context Adjuster (generalize + adjust), hardware acceleration
**In progress:** Difficulty Classifier, Database integration, Semantic cache (ChromaDB — `generalize()` output will feed into cache storage)
**Planned:** Celery/RabbitMQ task queue, External LLM APIs (GPT/Gemini), Feedback loop, React frontend