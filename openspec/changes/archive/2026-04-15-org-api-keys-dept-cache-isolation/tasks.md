## 1. Database — api_keys table

- [x] 1.1 Create SQLAlchemy model `ApiKey` in `server/app/models/` (id UUID PK, org_id FK→orgs.id, token TEXT UNIQUE NOT NULL, created_at DATETIME, revoked_at DATETIME nullable)
- [x] 1.2 Write Alembic migration to create the `api_keys` table
- [x] 1.3 Create `server/app/db/api_key_repo.py` with functions: `create_key(session, org_id) → ApiKey`, `get_active_key_by_token(session, token) → ApiKey | None`, `list_keys_for_org(session, org_id) → list[ApiKey]`, `revoke_key(session, key_id) → ApiKey | None`
- [x] 1.4 Add constraint: `get_active_key_for_org(session, org_id) → ApiKey | None` (WHERE revoked_at IS NULL LIMIT 1) — used by `key generate` to check for existing active key

## 2. CLI — key command group

- [x] 2.1 Add `@cli.group() key` in `server/cli/admin.py`
- [x] 2.2 Implement `key generate --org <slug> [--force]`: look up org, reject if active key exists (unless --force), revoke existing if --force, insert new key, print full token + id + created_at
- [x] 2.3 Implement `key list --org <slug>`: query all keys for org, print table with id, truncated token (12 chars + `...`), created_at, revoked_at (or `—`)
- [x] 2.4 Implement `key revoke --id <uuid>`: set revoked_at, warn if already revoked, print confirmation

## 3. Middleware — SQLite key registry with in-process cache

- [x] 3.1 Replace `_KNOWN_KEYS` dict in `server/app/middleware/api_key.py` with a `_KeyCache` class holding: `_keys: dict[str, tuple[str,str]]` (token → (org_slug, org_id)), `_depts: dict[tuple[str,str], str]` (org_id, dept_slug) → cache_namespace), `_loaded_at: float`, `_ttl: int`
- [x] 3.2 Implement `_KeyCache.refresh(session)`: query `api_keys WHERE revoked_at IS NULL` joined to `orgs`; query `departments` for all rows; populate both dicts; set `_loaded_at`
- [x] 3.3 Implement `_KeyCache.resolve(token) → tuple[str, str]` (org_slug, org_id): refresh if stale, look up token
- [x] 3.4 Implement `_KeyCache.namespace(org_id, dept_slug) → str`: return matching `cache_namespace` or `"{org_slug}/__default__"`
- [x] 3.5 Update `ApiKeyMiddleware.dispatch`: after extracting token, call `_KEY_CACHE.resolve(token)` to get org_slug; read `X-DejaQ-Department` header; call `_KEY_CACHE.namespace(org_id, dept_slug)` to get cache_namespace; set `request.state.org_slug`, `request.state.cache_namespace` (drop old `request.state.tenant_id`)
- [x] 3.6 Add `DEJAQ_KEY_CACHE_TTL` env var to `server/app/config.py` (default 60)

## 4. ChromaDB — namespace-aware MemoryService pool

- [x] 4.1 Add a module-level `_pool: dict[str, MemoryService] = {}` in `server/app/services/memory_chromaDB.py` (or in the router) and a `get_memory_service(namespace: str) → MemoryService` function that lazily creates/reuses instances
- [x] 4.2 Remove the singleton `MemoryService("dejaq_default")` instantiation from startup/module level

## 5. Chat pipeline — wire namespace through

- [x] 5.1 Update the OpenAI-compatible chat handler (`server/app/routers/` gateway router) to call `get_memory_service(request.state.cache_namespace)` instead of using the global `MemoryService` instance
- [x] 5.2 Pass `cache_namespace` to `generalize_and_store_task` Celery task signature and update the task to accept it, constructing its own `get_memory_service(cache_namespace)` call
- [x] 5.3 Update in-process fallback path (when `DEJAQ_USE_CELERY=false`) to also pass and use `cache_namespace`

## 6. Verification

- [x] 6.1 Run `alembic upgrade head` against a fresh `dejaq.db` — confirm `api_keys` table created
- [x] 6.2 Smoke test CLI: `key generate --org <slug>`, `key list --org <slug>`, `key revoke --id <uuid>`
- [x] 6.3 Smoke test gateway: send request with Bearer token → confirm correct `cache_namespace` in logs; send with `X-DejaQ-Department` header → confirm department namespace used; send without header → confirm `/{org}/__default__` namespace
- [x] 6.4 Confirm cache isolation: two requests with same query but different department headers get independent cache miss/hit behavior
