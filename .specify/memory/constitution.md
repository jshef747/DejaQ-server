# DejaQ Server Constitution

## Core Principles

### I. Cost Optimization Through Semantic Caching
DejaQ exists to reduce LLM API costs. Every architectural decision serves this goal: normalize queries to maximize cache hits, store tone-neutral responses to prevent cache fragmentation, enrich context-dependent queries into standalone form before lookup. The cache pipeline is the product — treat it as the critical path.

### II. Non-Blocking User Experience
Users must never wait for background work. The response goes out immediately; generalization and cache storage happen asynchronously via Celery task queue (or in-process fallback). Fire-and-forget is the pattern — the user-facing latency budget is inference only, never storage.

### III. Local-First Inference
All models run locally via GGUF format through `llama-cpp-python` with hardware acceleration (Metal on macOS, CUDA on NVIDIA). No external API calls in the default pipeline. This ensures zero per-query API costs for the core flow and full offline capability.

### IV. Singleton Model Management
Models are expensive to load. `ModelManager` is a class-level singleton — each model loads exactly once on first use, then stays in memory. Celery workers lazy-load their own instances. Never instantiate models per-request. Never duplicate model loading logic.

### V. Separation of Tone and Semantics
Cache stores tone-neutral (generalized) responses. On cache hit, tone is re-applied via the context adjuster. This prevents the same factual answer from being cached N times with different tones. Generalization (Phi-3.5 Mini) and adjustment (Qwen 1.5B) are distinct, dedicated pipeline stages.

## Tech Stack (Non-Negotiable)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Runtime | Python 3.13+ | ML ecosystem, async support |
| Framework | FastAPI + Uvicorn | Async HTTP + WebSocket in one framework |
| Package Manager | **uv only** | Fast, deterministic. No pip, no conda, no poetry |
| Local Inference | llama-cpp-python (GGUF) | Cross-platform GPU: Metal (macOS), CUDA (NVIDIA) |
| Classifier | transformers + torch (DeBERTa) | Full-precision PyTorch for NVIDIA DeBERTa |
| Vector DB | ChromaDB (PersistentClient) | Cosine similarity, persistent storage, zero config |
| Task Queue | Celery + Redis | Background processing with graceful fallback |
| Schemas | Pydantic v2 | All request/response models, strict typing |
| Testing | pytest | Marker-based gating by model dependency |

## Coding Conventions

### Logging — No Exceptions
- **Never use `print()` or `traceback.print_exc()`** — this is non-negotiable
- Always use `logging.getLogger("dejaq.<layer>.<module>")` (e.g., `dejaq.services.normalizer`, `dejaq.router.chat`, `dejaq.tasks.cache`)
- For exceptions: `logger.error("message", exc_info=True)`
- Latency logging pattern: `start = time.time()` → `latency = (time.time() - start) * 1000` → `logger.info("... %.2f ms", latency)`

### Naming
- **Files**: `snake_case.py`
- **Classes**: `PascalCase` with `Service` suffix for business logic (`NormalizerService`, `LLMRouterService`)
- **Methods**: `snake_case` public, `_snake_case` private
- **Constants**: `UPPER_SNAKE_CASE` at module level
- **Query lifecycle variables**: `raw_query` → `enriched` → `clean_query` → `cached_answer` / `answer`

### Architecture Layers
```
routers/    → HTTP/WebSocket endpoints (async, thin)
services/   → Business logic + inference (sync where CPU-bound)
tasks/      → Celery background tasks (lazy-load models)
schemas/    → Pydantic request/response models
models/     → Database models (PostgreSQL — planned)
repositories/ → Database access layer (planned)
utils/      → Cross-cutting concerns (logging)
```
- Routers call services. Services do not import routers.
- Tasks lazy-load services via module-level globals.
- Schemas are pure data — no logic, no imports from services.

### Async Rules
- Route handlers are `async def`
- Model inference is synchronous (llama-cpp-python is not awaitable) — this is correct
- Use `async` only for actual I/O (HTTP, WebSocket, database)

### Service Instantiation
- Services are instantiated as module-level globals in the router (load once, reuse)
- No per-request instantiation. No dependency injection framework.
- Celery tasks use module-level globals with lazy init (`if _service is None: _service = ...`)

## Testing Standards

### Structure
- One test file per service: `tests/test_<service>.py`
- Shared fixtures in `tests/conftest.py`
- Class-based grouping: `class TestFeatureName` with `test_behavior_description` methods

### Fixture Scoping
- `scope="function"` for stateful, no-model services (ConversationStore, MemoryService with tmp_path)
- `scope="session"` for model-backed services (load once per pytest session, avoid repeated model downloads)

### Model Markers (Non-Negotiable)
Every test that requires a model MUST be marked:
- `@pytest.mark.no_model` — pure logic, no ML models
- `@pytest.mark.qwen` — requires Qwen 0.5B
- `@pytest.mark.qwen_1_5b` — requires Qwen 1.5B
- `@pytest.mark.phi` — requires Phi-3.5 Mini
- `@pytest.mark.llama` — requires Llama 3.2 1B
- `@pytest.mark.deberta` — requires NVIDIA DeBERTa

This enables running fast tests (`-m no_model`) without downloading multi-GB models.

### What to Test
- Unit tests for pure logic (cache filter heuristics, conversation store CRUD, ChromaDB operations)
- Integration tests against real models for inference quality (normalizer output, enricher rewrites, classifier routing)
- Assert on: string content/keywords, types, lengths, boolean returns

## Anti-Patterns to Avoid

1. **No `print()` anywhere** — use the logger. Including `traceback.print_exc()`.
2. **No per-request model loading** — always use ModelManager singleton or module-level lazy init.
3. **No `pip install`** — use `uv add` / `uv sync` exclusively.
4. **No `--pool=prefork` on macOS** — Metal GPU crashes on fork(). Always `--pool=solo`.
5. **No blocking the event loop with inference** — if adding concurrent user support, offload to `run_in_executor` or a Celery inference queue, not inline in async handlers.
6. **No caching tone-specific responses** — always generalize before storing, adjust after retrieval.
7. **No unused dependencies** — if a library isn't imported anywhere, remove it from pyproject.toml.
8. **No hardcoded secrets or credentials** — use environment variables via `app/config.py`.
9. **No wildcard CORS in production** — `allow_origins=["*"]` is dev-only.
10. **No duplicate cache entries** — use SHA-256 hash of normalized query as ChromaDB document ID (upsert semantics).

## Celery + macOS Metal GPU Rules

These are hard-won lessons — do not deviate:
- `--pool=solo` always on macOS Apple Silicon (Metal GPU cannot survive fork)
- Achieve parallelism via multiple worker instances, not prefork concurrency
- `task_reject_on_worker_lost=False` prevents infinite re-queue loops on worker crashes
- Workers lazy-load models — never import models at module level in task files

## Governance

- This constitution reflects the actual codebase as of 2026-02-18
- CLAUDE.md is the authoritative source for development instructions; this constitution captures the deeper architectural rationale
- Amendments should be reflected in both this file and CLAUDE.md where applicable
- All PRs should verify compliance with these conventions

**Version**: 1.0.0 | **Ratified**: 2026-02-18