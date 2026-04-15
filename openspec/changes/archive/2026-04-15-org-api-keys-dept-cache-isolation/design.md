## Context

The gateway middleware (`server/app/middleware/api_key.py`) resolves org identity from an in-memory dict `_KNOWN_KEYS` that is hardcoded as empty. There is no way to add keys at runtime without redeploying. The data model already has `orgs` and `departments` tables in SQLite (`dejaq.db`), with `cache_namespace` stored as `"{org_slug}__{dept_slug}"` on each department. `MemoryService` in `memory_chromaDB.py` takes a `collection_name` at construction time but the entire app uses a single instance pointed at `"dejaq_default"`. The admin CLI (`server/cli/admin.py`) has `org` and `dept` command groups; there is no `key` group yet.

## Goals / Non-Goals

**Goals:**
- Add `api_keys` table to SQLite; generate, list, and revoke keys via CLI
- Replace `_KNOWN_KEYS` dict in middleware with a SQLite lookup (cached in-process to avoid per-request DB hits)
- Resolve `org_slug` from key; resolve optional `X-DejaQ-Department` header to `cache_namespace`; fall back to `"{org_slug}/__default__"` when header absent
- Make `MemoryService` namespace-aware so the chat pipeline receives the right scoped collection per request
- End-to-end: `org create` → `dept create` → `key generate` → chatbot points at gateway with Bearer key → department header optionally sent → isolated cache

**Non-Goals:**
- Key expiry / rotation (keys are long-lived until explicitly revoked)
- Per-key rate limiting or quota
- Multi-key-per-org (one active key per org is the model; revoke + regenerate to rotate)
- JWT or asymmetric auth
- Migrating existing `"dejaq_default"` cache data

## Decisions

### D1 — SQLite for key storage, not a new service
Keys live in the same `dejaq.db` SQLite file used for orgs/departments. Avoids a new dependency. The gateway is single-process today; SQLite read performance is not a concern. If DejaQ goes multi-worker, the in-process cache (see D2) keeps read load negligible.

Alternatives considered: Redis (already present) — overhead for simple key→org mapping; env-var secrets — not manageable via CLI.

### D2 — In-process key cache with TTL invalidation
On first request the middleware loads all active keys into a Python dict keyed by token. The cache is refreshed every 60 seconds (configurable via `DEJAQ_KEY_CACHE_TTL`). `key revoke` sets `revoked_at` in SQLite; within one TTL window the revoked key is still accepted — acceptable for an operator tool. No locking needed (single process; asyncio event loop is single-threaded for middleware dispatch).

Alternatives considered: Query SQLite on every request — adds ~1ms latency per request; per-operation cache invalidation — complex, unnecessary for the access pattern.

### D3 — `X-DejaQ-Department` header resolves to `cache_namespace`
The middleware reads `X-DejaQ-Department` (value: department slug, e.g. `"customer-support"`). It looks up `(org_id, dept_slug)` in the in-process department cache (same TTL) to get `cache_namespace`. Falls back to `"{org_slug}/__default__"` when header absent or slug not found — this is not an error; it's the standard single-tenant path.

`request.state.cache_namespace` is set for all `/v1/*` requests. The chat router reads it to select the right `MemoryService` instance.

Alternatives considered: Encoding dept in the API key itself — couples key management to department structure, breaks when departments are added; query string param — less idiomatic for per-request routing context.

### D4 — Pool of `MemoryService` instances keyed by namespace
`MemoryService.__init__` creates a ChromaDB collection. Construction is cheap (HTTP call to ChromaDB server). A module-level `dict[str, MemoryService]` in the chat router (or a `NamespacedCachePool` helper) lazily creates and reuses instances per namespace. No upper bound on pool size needed — number of org×dept pairs is small.

Alternatives considered: Single `MemoryService` with a `collection_name` parameter passed per call — would require `get_or_create_collection` on every cache check; adding a `switch_collection` method — stateful, not thread-safe.

### D5 — `api_keys` table schema
```sql
CREATE TABLE api_keys (
    id        TEXT PRIMARY KEY,          -- UUID
    org_id    TEXT NOT NULL REFERENCES orgs(id),
    token     TEXT NOT NULL UNIQUE,      -- secrets.token_urlsafe(32), stored in plaintext
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME                  -- NULL = active
);
```
Token stored in plaintext (not hashed). DejaQ is an operator-controlled internal tool; the DB is not a shared secrets store. Hashing would prevent "list keys with token values" UX that operators expect. Document in README that `dejaq.db` should be treated as a secret.

Alternatives considered: bcrypt hash — good for user passwords, poor UX for opaque tokens that need to be displayed; separate secrets vault — out of scope.

## Risks / Trade-offs

- **Revocation lag (D2)**: A revoked key is accepted for up to 60s. → Document the TTL; operators who need instant revocation can restart the server process.
- **Plaintext tokens in DB (D5)**: If `dejaq.db` is exfiltrated, all keys are compromised. → File permissions + documentation. Acceptable for an operator-managed internal gateway.
- **`/__default__` namespace collision**: Two orgs using the default namespace each get `"{org_slug}/__default__"` — these are distinct strings, so no collision. ChromaDB collection names use the full string.
- **ChromaDB collection name length**: `"{org_slug}/__{dept_slug}"` can be up to ~120 chars. ChromaDB allows collection names up to 512 chars. No issue.
- **Migration of existing cache**: Existing entries in `"dejaq_default"` are not reachable under any org namespace. → Not migrated; operators start fresh. Document this.

## Migration Plan

1. Add Alembic migration: create `api_keys` table.
2. Deploy updated server — middleware now queries SQLite on first request (lazy init). Requests with no key continue to use the existing `"dejaq_default"` ChromaDB collection (unchanged behavior).
3. Operator runs `dejaq-admin key generate --org <slug>` to issue first key.
4. Chatbot updated to send `Authorization: Bearer <token>` (and optionally `X-DejaQ-Department`).
5. Rollback: revert to previous middleware — old `_KNOWN_KEYS` dict was empty anyway, no behavior change.

## Open Questions

- Should requests with an **unrecognized key** (not in registry) be rejected (401) or served as anonymous? **Resolved: serve as anonymous** — keeps local dev working without keys. No 401 enforcement in this change.
- Should unkeyed/anonymous requests use the existing `"dejaq_default"` ChromaDB collection or a separate namespace? **Resolved: use `"dejaq_default"`** — preserves existing behavior for all non-gateway prompts (WebSocket UI, HTTP chat endpoint, local dev).
