# v22-normalizer Specification

## Purpose
TBD - created by archiving change upgrade-normalizer-v22. Update Purpose after archive.
## Requirements
### Requirement: Opinion-gated normalization
The system SHALL normalize user queries using the v22 strategy: opinion queries are rewritten to "best <noun>" via Gemma 4 E2B; all other queries are returned as lowercase passthrough with no LLM call.

#### Scenario: Non-opinion query passes through
- **WHEN** a query does not match the opinion gate regex (e.g., "how do I grow tomatoes?")
- **THEN** the normalized form is the query lowercased and stripped of leading/trailing whitespace, with no LLM invoked

#### Scenario: Opinion query triggers LLM rewrite
- **WHEN** a query matches the opinion gate (e.g., "what is the greatest coffee bean origin?") and does not match the howto-adverbial guard
- **THEN** Gemma 4 E2B is called with the opinion rewrite prompt and the output is validated against the "best <noun>" pattern before being returned

#### Scenario: Howto-adverbial guard suppresses opinion gate
- **WHEN** a query contains "best" used adverbially before way/method/technique/approach/strategy/practice (e.g., "what is the best way to cook steak?")
- **THEN** the opinion gate does NOT fire and the query is returned as lowercase passthrough

#### Scenario: LLM output fails format validation, falls back to passthrough
- **WHEN** Gemma 4 E2B returns output that does not match the pattern "best <1-3 word noun>"
- **THEN** the system falls back to the lowercased original query instead of using the malformed LLM output

### Requirement: bge-small-en-v1.5 embedding for cache lookup
The system SHALL use `BAAI/bge-small-en-v1.5` (via sentence-transformers) as the embedding function for both storing and querying the ChromaDB cache, replacing the default ChromaDB embedding model.

#### Scenario: Cache hit uses bge-small similarity
- **WHEN** a normalized query is submitted for cache lookup
- **THEN** similarity is computed using bge-small embeddings and the cosine distance threshold of 0.15 (production) / 0.20 (trusted) applies

#### Scenario: Stored entries use bge-small embeddings
- **WHEN** a new interaction is stored in ChromaDB
- **THEN** the document is embedded with bge-small-en-v1.5, not the ChromaDB default model

### Requirement: Gemma 4 E2B loaded separately in ModelManager
The system SHALL expose a `load_gemma_e2b()` classmethod on `ModelManager` that lazy-loads `unsloth/gemma-4-E2B-it-GGUF` (Q4_K_M) independently of the existing 26B generation model.

#### Scenario: E2B model loaded on first opinion query
- **WHEN** the first opinion query arrives and Gemma E2B has not yet been loaded
- **THEN** the model is downloaded and loaded before processing the query; subsequent requests reuse the cached instance

#### Scenario: E2B and generation models coexist
- **WHEN** both `load_gemma_e2b()` and `load_gemma()` are called
- **THEN** each returns its own independent model instance without interfering with the other

