## 1. Dependencies and Configuration

- [x] 1.1 Add the official Supabase Python SDK to `server/pyproject.toml` and refresh the lockfile with `uv`.
- [x] 1.2 Add Supabase auth settings to `app/config.py`, including project URL, anon/public key for SDK auth calls, and optional service-role settings for demo seeding.
- [x] 1.3 Update `server/.env.example` with the new Supabase management auth and demo seed variables.

## 2. Database Model and Migration

- [x] 2.1 Add SQLAlchemy models for local management users and user-org memberships.
- [x] 2.2 Register the new models in `app/db/models/__init__.py` and `server/alembic/env.py`, and add bidirectional relationships on `Organization`, local management user, and membership models with parent-to-membership delete-orphan cascade.
- [x] 2.3 Add an Alembic migration creating `users` and `user_org_memberships` with `users.supabase_user_id` unique/not-null, user and membership timestamps, membership uniqueness on `(user_id, org_id)`, indexes for user/org membership lookups, and `ON DELETE CASCADE` foreign keys to both `users` and `organizations`.
- [x] 2.4 Add repository helpers for upserting users by Supabase id, updating email, listing memberships, and creating memberships idempotently.

## 3. Management Auth Context

- [x] 3.1 Add a typed `ManagementAuthContext` supporting `user` and `system` actors.
- [x] 3.2 Implement Supabase SDK-backed token validation and user lookup for admin requests using `supabase.auth.get_user(<access_token>)` or the SDK's current equivalent, with fail-closed configuration/runtime handling and no manual JWT/JWKS verification, local JWT decoding, `get_session()`, or JWT-secret verification code.
- [x] 3.3 Implement the FastAPI dependency that extracts bearer tokens, validates them through the Supabase SDK, resolves/upserts local users, loads memberships, and returns `ManagementAuthContext`.
- [x] 3.4 Add unit tests for valid SDK user lookup, missing/malformed headers, expired/invalid token handling, SDK transport failures returning HTTP 503 without user mutation, missing Supabase config, user upsert, email refresh, empty memberships, service-role exclusion from request auth, and absence of `get_session()`, local JWT decoding, manual JWKS, or JWT-secret verification paths.

## 4. Admin Service Authorization

- [x] 4.1 Thread `ManagementAuthContext` through admin routers and shared admin service functions.
- [x] 4.2 Update org listing, creation, and deletion to scope user actors by membership while preserving full system actor access; if HTTP org creation remains enabled, create the caller's user-org membership for the new organization in the same database transaction.
- [x] 4.3 Update department, API-key, stats, feedback, and LLM-config admin paths to reject inaccessible org resources with HTTP 403 and unknown resources with HTTP 404.
- [x] 4.4 Update `/admin/v1/whoami` to return actor type, Supabase user id, email, and accessible orgs.
- [x] 4.5 Ensure the org API-key middleware still skips `/admin/v1/*` before parsing or logging authorization headers.
- [x] 4.6 Ensure HTTP requests cannot construct or impersonate a system actor through headers, JWT claims, query parameters, or request bodies.

## 5. CLI System Actor Path

- [x] 5.1 Update `dejaq-admin` CLI calls to pass a system auth context into shared admin services.
- [x] 5.2 Keep existing CLI command names, arguments, and output behavior unchanged.
- [x] 5.3 Update CLI/API parity tests so CLI coverage uses system context and HTTP coverage uses scoped user context.

## 6. Demo Seed

- [x] 6.1 Add an idempotent seed implementation for the demo org, departments, local user, membership, and sample stats rows.
- [x] 6.2 Add Supabase Auth user creation/update for `demo@dejaq.local` / `demo1234` when service-role credentials are configured.
- [x] 6.3 Restrict Supabase service-role credentials to explicit setup/demo seed/admin provisioning paths and keep them out of the request-time HTTP management auth dependency.
- [x] 6.4 Wire the demo seed into the documented setup path or an explicit CLI/setup command.
- [x] 6.5 Initialize the `DEJAQ_STATS_DB` request-log schema before inserting demo sample stats, and dedupe seeded rows with deterministic identifiers such as `response_id` values prefixed with `demo-seed:`.
- [x] 6.6 Add tests proving repeated demo seeding does not duplicate users, orgs, departments, memberships, or sample stats batches.

## 7. Documentation and Verification

- [x] 7.1 Update `CLAUDE.md` with Supabase project setup, required Supabase SDK environment variables, the demo seed flow, and demo credentials.
- [x] 7.2 Update `CLAUDE.md` to state that `/v1/chat/completions` and `/v1/feedback` continue to use org API keys rather than Supabase JWTs.
- [x] 7.3 Run focused admin auth, admin API, admin service, CLI parity, stats service, and gateway smoke tests.
- [x] 7.4 Run `openspec status --change add-supabase-management-auth` and confirm the change is apply-ready.
