## Why

The management API currently relies on a single shared admin bearer token, which is suitable for local development but cannot identify individual operators or support per-user organization access. Supabase-issued JWTs let DejaQ authenticate real users while preserving the existing org API-key gateway contract.

## What Changes

- Add Supabase JWT validation for every `/admin/v1/*` management API request using the official Supabase Python SDK.
- Replace the shared `DEJAQ_ADMIN_TOKEN` management auth contract with per-user request context containing Supabase user id, email, and accessible orgs.
- Add SQLite user and user-organization membership data so one Supabase user can belong to multiple DejaQ orgs.
- Keep the `dejaq-admin` CLI working unchanged by running it as a trusted system actor with full org access.
- Seed a demo Supabase user (`demo@dejaq.local` / `demo1234`) tied to a default demo org with sample departments and stats.
- Document Supabase project setup, required environment variables, and demo credentials in `CLAUDE.md`.
- Leave `/v1/chat/completions` and `/v1/feedback` gateway authentication unchanged; they continue to use org API keys.

## Capabilities

### New Capabilities
- `management-user-auth`: Supabase SDK-based JWT validation and user lookup, local user identity records, user-org memberships, request auth context, and trusted system actor behavior.
- `demo-management-seed`: Setup-time demo user/org/department/stats seeding and documentation expectations for the authenticated dashboard demo.

### Modified Capabilities
- `management-api`: Replace shared admin-token authorization with Supabase-backed user authorization and scope management responses/actions to the caller's organization memberships.

## Impact

- Backend dependencies/config: official Supabase Python SDK, Supabase project settings, and optional setup-time Supabase admin credentials for demo user creation.
- Database: new Alembic migration for users and user-org membership tables, plus repository/service helpers for identity lookup and membership checks.
- FastAPI: new management auth dependency using the Supabase SDK, updated admin routers, updated `/admin/v1/whoami`, and tests for JWT success/failure and per-org authorization.
- CLI: explicit trusted system-user path for existing admin commands so CLI behavior and command syntax remain unchanged.
- Setup/docs: update setup scripts or seed command paths and `CLAUDE.md` with Supabase project setup steps and demo credentials.
