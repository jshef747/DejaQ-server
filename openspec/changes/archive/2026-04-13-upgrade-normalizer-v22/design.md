## Context

The normalization-test harness has been iterating on normalizer strategies. v22 is the current champion: it uses raw passthrough (lowercase) for non-opinion queries and Gemma 4 E2B to rewrite opinion queries to "best <noun>". Embedding is done via `BAAI/bge-small-en-v1.5` rather than an LLM-generated string. This outperforms the current server's Qwen 2.5-0.5B approach across most categories and eliminates LLM cost on ~95% of traffic.

The server currently:
1. Calls Qwen 0.5B on every query to produce a compact key string.
2. Passes that string to ChromaDB, which uses its default embedding function.

The v22 architecture:
1. Checks regex gate — opinion query or not.
2. Non-opinion: lowercase passthrough. No LLM.
3. Opinion: Gemma 4 E2B rewrites to `best <noun>`. LLM called only when gate fires.
4. bge-small-en-v1.5 embeds the result for ChromaDB storage/lookup.

## Goals / Non-Goals

**Goals:**
- Replace `NormalizerService` with v22 logic (regex gate + optional Gemma E2B rewrite).
- Replace ChromaDB's default embedder with bge-small-en-v1.5 in `MemoryService`.
- Add `load_gemma_e2b()` to `ModelManager` (separate from the 26B `load_gemma`).
- Add `sentence-transformers` to server dependencies.
- Ensure normalization-test v22 config runs by default as the reference baseline.

**Non-Goals:**
- Improving Hit@0.20 beyond v22 (that's a future iteration).
- Migrating existing ChromaDB cache entries (too costly; just clear on deploy).
- Changing the context enricher, generalizer, or LLM router.
- Adding a v23+ config to the harness.

## Decisions

**D1: Raw passthrough over LLM normalization for non-opinion queries**
The harness proves bge-small closes most synonym gaps without LLM help. Removing Qwen from the hot path saves ~200-500ms per cache miss and reduces memory footprint. Risk: edge cases where exact-phrase similarity fails — acceptable given the data.

**D2: sentence-transformers for bge-small, not llama-cpp**
bge-small is a HuggingFace transformer model, not a GGUF. We use `sentence-transformers` which is the canonical library. This means a second model-loading path alongside llama-cpp. Alternative considered: GGUF-quantized bge-small via llama-cpp — possible but unnecessary complexity since bge-small is tiny (33M params) and runs fast on CPU.

**D3: ChromaDB custom embedding function (not query-side only)**
We must pass bge-small as the embedding function at collection creation time so stored embeddings and query embeddings use the same model. ChromaDB's default model (all-MiniLM-L6-v2) produces incompatible embedding space. This is a one-way migration — existing cache entries embedded with the old model must be cleared.

**D4: Gemma 4 E2B as a separate `load_gemma_e2b()` in ModelManager**
The existing `load_gemma()` loads the 26B A4B MoE (generation model). The E2B is a separate 2B model used only for opinion rewriting. Keep them separate to avoid confusion and allow independent lazy-loading.

**D5: Port regex constants verbatim from v22 config**
`_OPINION_GATE`, `_HOWTO_ADVERBIAL`, `_BEST_FORM` are already validated by the harness. Porting them as-is avoids re-testing drift. If the logic needs tuning, it should be tested in the harness first, then ported.

## Risks / Trade-offs

- **Cache invalidation on deploy** → Must wipe ChromaDB collection before first request. Document in deploy notes. The cache is warm-started from scratch anyway (in-memory is empty on restart).
- **Gemma E2B cold-start latency** → First opinion query after server start triggers model download (~2GB) + load. Acceptable for dev; in prod consider pre-warming. Gemma E2B is already cached from harness runs.
- **sentence-transformers dependency size** → Adds ~500MB transitive deps (torch, transformers). Already present via other services (ClassifierService uses transformers). Minimal net addition.
- **False-positive opinion gate** → Queries containing "greatest" in non-opinion contexts (e.g., "the greatest common divisor") may incorrectly trigger the rewriter. The `_HOWTO_ADVERBIAL` guard handles "best way/method/…to" but other edge cases exist. Acceptable for v22; harness data shows 0% false positives on current test set.

## Migration Plan

1. Add `sentence-transformers` to `server/pyproject.toml` and run `uv sync`.
2. Implement `load_gemma_e2b()` in `ModelManager`.
3. Rewrite `NormalizerService` with v22 logic.
4. Update `MemoryService` to use bge-small as the ChromaDB embedding function.
5. On deploy: clear ChromaDB collection (`DELETE /cache/entries/{id}` for each, or wipe the persistent storage directory).
6. Smoke test: `POST /normalize` with opinion and non-opinion queries; verify `POST /chat` cache hits at cosine ≤ 0.15.

**Rollback**: Revert normalizer + MemoryService commits, clear ChromaDB again, restart.

## Open Questions

- Should we pre-warm Gemma E2B at startup or keep it lazy-loaded? (Lazy is fine for now; revisit when multi-user load matters.)
- Does the existing ChromaDB persistent storage path need to change to avoid serving stale embeddings? (Answer: no path change needed — just clear the collection contents on first deploy.)
