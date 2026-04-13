## 1. Dependencies

- [x] 1.1 Add `sentence-transformers` to `server/pyproject.toml` and run `uv sync` in the server directory

## 2. ModelManager — Gemma E2B loader

- [x] 2.1 Add `_gemma_e2b = None` class attribute to `ModelManager` in `server/app/services/model_loader.py`
- [x] 2.2 Implement `load_gemma_e2b()` classmethod: lazy-loads `unsloth/gemma-4-E2B-it-GGUF` Q4_K_M with `n_ctx=2048`

## 3. NormalizerService — v22 rewrite

- [x] 3.1 Port `_OPINION_GATE`, `_HOWTO_ADVERBIAL`, `_BEST_FORM` regex constants from `normalization-test/configs/v22_opinion_llm_rewrite_bge_small.py` into `server/app/services/normalizer.py`
- [x] 3.2 Port the opinion system prompt and few-shots (18 entries) from the v22 config into `normalizer.py`
- [x] 3.3 Rewrite `NormalizerService.__init__` to remove Qwen model loading; load Gemma E2B lazily only when opinion gate fires
- [x] 3.4 Rewrite `NormalizerService.normalize()`: non-opinion → `query.strip().lower()`; opinion → call Gemma E2B with system prompt + few-shots, apply `_postprocess` validation, fall back to lowercase passthrough on format failure

## 4. MemoryService — bge-small embedding function

- [x] 4.1 Add a `SentenceTransformerEmbeddingFunction` wrapper (using `sentence_transformers.SentenceTransformer("BAAI/bge-small-en-v1.5")`) to `server/app/services/memory_chromaDB.py`
- [x] 4.2 Pass the bge-small embedding function to `get_or_create_collection()` in `MemoryService.__init__`
- [x] 4.3 Verify `check_cache` and `store_interaction` work correctly (ChromaDB uses the collection's embedding function automatically for both `query_texts` and `documents`)

## 5. Normalization-test harness

- [x] 5.1 Confirm `v22_opinion_llm_rewrite_bge_small` config has `"enabled": True` in `normalization-test/configs/v22_opinion_llm_rewrite_bge_small.py` (already set; verify it runs by default with `harness.runner`)
- [ ] 5.2 Run the harness against v20 and v22 to confirm results match the latest report (Hit@0.20 ≥ 70.7%, 0% cross-FP)

## 6. Smoke test & cache clear

- [ ] 6.1 Clear existing ChromaDB collection (wipe persistent storage or delete all entries via `DELETE /cache/entries/{id}`) before testing
- [ ] 6.2 Start server and send a non-opinion query to `POST /normalize` — verify response is lowercase passthrough, no LLM latency
- [ ] 6.3 Send an opinion query (e.g., "What is the greatest coffee?") to `POST /normalize` — verify response is "best coffee"
- [ ] 6.4 Send two semantically equivalent queries via `POST /chat`, confirm second query returns cache HIT at cosine ≤ 0.15
