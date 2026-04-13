## Why

The current server normalizer uses Qwen 2.5-0.5B to rewrite queries into compact canonical strings (e.g., "debug slow query after data migration"), but the normalization-test harness has since proven that raw passthrough + bge-small embeddings outperforms that approach — 70.7% Hit@0.20 vs worse for many categories, with zero LLM overhead for 95%+ of queries. v22 adds a targeted opinion-query gate (Gemma 4 E2B rewrites to "best <noun>") that closes the only remaining category gap. The test harness already validated this; now the server needs to match.

## What Changes

- **Replace `NormalizerService`**: Drop Qwen 2.5-0.5B LLM normalization. New logic: lowercase passthrough for non-opinion queries; Gemma 4 E2B rewrite to "best <noun>" for opinion queries (regex-gated).
- **Add bge-small-en-v1.5 embedder to server**: ChromaDB currently uses its default embedding function. Replace with `sentence-transformers` (BAAI/bge-small-en-v1.5) to match the v22 test harness — this is what produces the validated Hit@0.20 numbers.
- **Add `load_gemma_e2b` to `ModelManager`**: Load `unsloth/gemma-4-E2B-it-GGUF` Q4_K_M for the opinion rewriter (separate from the existing `load_gemma` 26B model).
- **Port v22 opinion gate logic into server**: Copy `_OPINION_GATE`, `_HOWTO_ADVERBIAL`, `_BEST_FORM` regexes and `_postprocess` logic from `normalization-test/configs/v22_opinion_llm_rewrite_bge_small.py`.
- **Add v22 to normalization-test as the reference/champion config**: Mark v22 as the current production-equivalent baseline in the harness (set `enabled: True`, ensure it runs by default alongside v20 for comparison).
- **Wire bge-small into ChromaDB `MemoryService`**: Pass a custom `embedding_function` (sentence-transformers bge-small) to the ChromaDB collection so stored and queried embeddings use the same model. **BREAKING**: existing cached entries embedded with the old default model become stale — cache must be cleared on deploy.

## Capabilities

### New Capabilities

- `v22-normalizer`: Server-side query normalization using the v22 strategy — opinion-gated LLM rewrite + raw passthrough + bge-small embedding for cache lookup.

### Modified Capabilities

<!-- No existing spec files to delta against -->

## Impact

- **`server/app/services/normalizer.py`**: Full rewrite — remove Qwen LLM, add regex gate, add Gemma E2B for opinion queries.
- **`server/app/services/model_loader.py`**: Add `load_gemma_e2b()` method for `unsloth/gemma-4-E2B-it-GGUF`.
- **`server/app/services/memory_chromaDB.py`**: Add bge-small embedding function to collection init.
- **`server/pyproject.toml`**: Add `sentence-transformers` dependency.
- **`normalization-test/configs/v22_opinion_llm_rewrite_bge_small.py`**: Already exists and is correct — no changes needed, just ensure it is included as the champion baseline.
- **Breaking**: ChromaDB cache invalidated on deploy due to embedding model change. Document in deploy notes.
