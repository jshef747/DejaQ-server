## Why

Orgs need a way to authenticate their chatbot integrations against DejaQ without sharing credentials, and different departments within an org should never bleed cached responses into each other's namespaces. Right now the gateway uses a hardcoded dict in `config.py` with no org-level key management, making multi-tenant isolation impossible.

## What Changes

- **New**: `api_keys` table in SQLite — one key per org, generated as a secure random token
- **New**: CLI commands: `key generate <org-slug>`, `key list <org-slug>`, `key revoke <key-id>` 
- **Modified**: Gateway (OpenAI-compatible, `app/gateway/`) resolves org from the API key by querying SQLite instead of the hardcoded dict in `config.py`
- **New**: Gateway reads optional `X-DejaQ-Department` header; resolves department slug → ChromaDB namespace; falls back to `<org-slug>/__default__` when header absent
- **New**: ChromaDB collection selection is namespace-aware — each `<org-slug>/<dept-slug>` gets its own isolated collection

## Capabilities

### New Capabilities
- `api-key-management`: Generate, list, and revoke per-org API keys stored in SQLite; keys are long-lived opaque tokens with created_at and revoked_at timestamps

### Modified Capabilities
- `api-key-auth`: Gateway auth now resolves org from SQLite key lookup instead of hardcoded config dict; adds department namespace resolution via `X-DejaQ-Department` header
- `department-management`: Department slug is now used as a ChromaDB collection namespace suffix, making department isolation a real runtime concern rather than a data-model-only concept
- `openai-chat-completions`: Gateway wires auth → org → namespace before passing requests to the cache pipeline; all cache reads/writes are scoped to the resolved namespace

## Impact

- `app/config.py`: remove hardcoded API key dict
- `app/gateway/` (auth middleware): replace dict lookup with SQLite query; add department header parsing
- `app/services/memory_chromaDB.py`: parameterize collection name with namespace
- `app/db/` (SQLite models): add `api_keys` table
- `app/cli/` (admin CLI): add `key` command group
- No breaking change to external chatbot clients — they just add their org key as Bearer token (already expected by gateway) and optionally send `X-DejaQ-Department`
