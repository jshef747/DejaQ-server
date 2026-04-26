## Why

DejaQ has a working management API (`/admin/v1/*`) but no browser-based operator interface — platform operators must use raw API calls or the CLI to manage orgs, departments, and API keys. A web dashboard gives operators a visual surface that is also the foundation for all future B-Web features.

## What Changes

- Add `frontend/` directory at repo root containing a Next.js 15 app (TypeScript, Tailwind, App Router, npm)
- Supabase email/password auth using `@supabase/supabase-js` + `@supabase/ssr` (cookie-based sessions, no manual session handling)
- Sign-in page, sign-up page, and sign-out server action
- Protected `/dashboard` layout with dark-theme sidebar (Organizations, Departments, API Keys, Analytics, Settings, Chat Demo)
- Dashboard home page (`/dashboard`) — renders real content; other sections are placeholder pages
- Thin API client module (`lib/api.ts`) that reads the Supabase session JWT and injects it as `Authorization: Bearer` on every management API request
- CLAUDE.md updated with frontend run instructions, demo account usage, and API connection docs

## Capabilities

### New Capabilities

- `frontend-shell`: Next.js app scaffold with Supabase auth, protected layout, dark-theme sidebar, and management API client

### Modified Capabilities

(none — backend is unchanged)

## Impact

- New `frontend/` directory at repo root (not inside `server/`)
- New env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE_URL`
- No changes to `server/` code or existing endpoints
- CLAUDE.md updated (frontend section added)
- Demo user (`demo@dejaq.local` / `demo1234`) seeded by existing `dejaq-admin seed demo` — no new seeding needed
