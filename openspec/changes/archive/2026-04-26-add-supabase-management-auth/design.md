## Context

DejaQ has two distinct auth surfaces. The OpenAI-compatible gateway (`/v1/chat/completions` and `/v1/feedback`) authenticates customer traffic with DejaQ org API keys and resolves org/department cache namespaces. The management API (`/admin/v1/*`) is the operator/dashboard surface and is currently documented around a shared admin token, while the code is in a transition state where the admin routes are mounted separately and the gateway API-key middleware skips them.

This change introduces Supabase as the source of login identity for the management surface only. DejaQ still keeps authorization state locally in SQLite because orgs, departments, API keys, routing config, and CLI workflows already live there. BW0.5 uses the official Supabase Python SDK for JWT validation and user lookup; BW1 frontend work will use `@supabase/supabase-js` and `@supabase/ssr` for the same reason on the browser/server-rendered side.

## Goals / Non-Goals

**Goals:**
- Validate Supabase-issued access JWTs on every HTTP management API request through the official Supabase Python SDK.
- Store local user identity rows keyed by Supabase user id and email.
- Store many-to-many user/org memberships so management API actions can be scoped per user.
- Preserve current `dejaq-admin` CLI behavior by using an explicit trusted system actor path with full org access.
- Seed a useful demo account, demo org, departments, and sample stats during setup.
- Document Supabase setup and demo credentials in `CLAUDE.md`.
- Keep gateway API-key auth and request cache namespacing unchanged.

**Non-Goals:**
- Replacing org API keys for `/v1/*` traffic with Supabase auth.
- Implementing roles or permissions beyond org membership.
- Moving org data from SQLite to Supabase/Postgres.
- Adding dashboard frontend sign-in flows in this backend-only change.
- Backfilling real production users automatically beyond the documented demo seed.

## Decisions

### Use the official Supabase Python SDK for JWT validation

Management requests SHALL use `Authorization: Bearer <supabase-access-token>`. The FastAPI auth dependency will create/configure the official Supabase Python SDK client and call `supabase.auth.get_user(<access_token>)`, or the SDK's current equivalent request-time Auth user lookup, to validate the access token and retrieve the Supabase user id/email before any admin route handler runs. DejaQ SHALL NOT implement manual JWT signature verification, local JWT decoding, JWKS fetching, key caching, or JWT-secret fallback logic in application code. Supabase signing-key rotation remains owned by Supabase and the SDK/Auth API path.

Alternative considered: manual JWT verification with JWKS or a project JWT secret. That can be fast, but it duplicates security-sensitive logic and can drift when Supabase changes signing behavior or rotates keys.

### Keep authorization in SQLite

Add `users` and `user_org_memberships` tables to the existing SQLAlchemy/Alembic database. `users.supabase_user_id` is unique/not-null and stores the Supabase user id returned by the SDK user object; `users.email` stores the SDK user object's email for display and auditing. User rows include `created_at` and `updated_at` because email can refresh from Supabase. Membership rows join users to existing `organizations`, include `created_at`, and have a uniqueness constraint on `(user_id, org_id)`, lookup indexes, and cascade foreign keys.

Alternative considered: store DejaQ org memberships only in Supabase user metadata. That makes CLI and local admin tooling harder to keep authoritative and couples DejaQ org changes to Supabase metadata writes.

### Pass explicit auth context to admin services

Create a `ManagementAuthContext` containing actor type (`user` or `system`), Supabase user id/email for HTTP users, and accessible org ids/slugs. Admin routers depend on this context and pass it to service functions. Service functions enforce org access centrally, so CLI/API parity remains testable and route handlers stay thin. The CLI constructs a system context and therefore does not need Supabase credentials or JWTs. HTTP requests always resolve to user actors; no request header, JWT claim, query parameter, or body can request system-actor privileges.

Alternative considered: attach raw auth data only to `request.state`. That hides authorization decisions inside handlers and makes shared service/CLI behavior easier to accidentally diverge.

### Scope by org membership, not roles

For this change, membership grants full management access within an org: departments, org API keys, stats, feedback, and org-level LLM config. Creating an org through HTTP creates a membership for the caller. A user can belong to many orgs. Role-based permissions can be layered later without changing the identity table or the request context shape.

Alternative considered: add owner/admin/viewer roles immediately. The current requirement only asks for per-user authorization and multi-org membership; roles would add UI and migration complexity before there is a concrete product contract.

### Demo seed is idempotent and setup-owned

The setup path will upsert a demo org, one or two departments, a local user row for the demo Supabase user, a user/org membership, and sample stats rows. If Supabase service credentials are configured, it also creates or updates the Supabase Auth user with `demo@dejaq.local` / `demo1234`. Service-role credentials are only used by explicit setup/demo seed/admin provisioning paths, never by the request-time HTTP management auth dependency. Running the seed repeatedly must not duplicate orgs, departments, memberships, or stats batches.

Alternative considered: require manual dashboard setup. That would leave first-run sign-in unable to show a populated dashboard, which is the explicit problem this change solves.

## Risks / Trade-offs

- Supabase Auth availability affects management API requests -> Invalid user tokens return 401, SDK/Auth service failures return 503, and failures never log token contents or raw authorization headers.
- SDK configuration can be wrong or missing -> Return HTTP 503 for management API requests when Supabase URL/key settings are absent or unusable, and document the required variables.
- Existing admin tests may assume unscoped global access -> Update tests to use system context for service/CLI parity and user context for HTTP scoping.
- No roles means any member can manage all resources inside an org -> Document as intentional v1 behavior and keep table/context shapes compatible with later roles.
- Demo seeding could pollute production data -> Make it an explicit setup/seed command or guarded setup flag, and document demo credentials as local/demo only.

## Migration Plan

1. Add the official Supabase Python SDK dependency and Supabase-related config values.
2. Add Alembic migration for `users` and `user_org_memberships`, including indexes/unique constraints and cascade behavior.
3. Add SQLAlchemy models/repositories for users and memberships.
4. Add `ManagementAuthContext`, Supabase SDK-backed auth service, and FastAPI dependency for admin routes.
5. Thread auth context through admin routers/services and update service tests for user vs system actor behavior.
6. Add idempotent demo seed logic and wire it into the documented setup path.
7. Update `CLAUDE.md`, `.env.example`, and relevant tests.

Rollback: revert the admin router dependency and service context changes, downgrade the Alembic migration to drop the two new tables, and restore the prior admin-token contract if needed. Gateway org API keys are not migrated and require no rollback.

## Open Questions

- Should demo seeding run automatically from `server/scripts/start.sh`, or should setup expose an explicit `dejaq-admin seed demo` command that scripts can call?
- Should HTTP org creation be allowed for every authenticated Supabase user in v1, or should it be disabled until role-based authorization exists?
