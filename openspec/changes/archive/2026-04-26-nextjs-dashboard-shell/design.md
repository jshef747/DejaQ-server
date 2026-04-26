## Context

DejaQ's management API (`/admin/v1/*` at `http://127.0.0.1:8000`) uses Supabase JWT auth — the server validates `Authorization: Bearer <supabase-access-token>` via the Supabase Auth SDK. The demo workspace is pre-seeded (`demo@dejaq.local` / `demo1234`). There is no existing frontend; this is greenfield.

## Goals / Non-Goals

**Goals:**
- Next.js 15 app at `frontend/` using App Router, TypeScript, Tailwind, npm
- Supabase email/password auth with cookie-based sessions (`@supabase/ssr`)
- Protected `/dashboard` layout — unauthenticated requests redirect to `/login`
- Sidebar with all six sections wired (five are placeholder pages; dashboard home is live)
- Thin `lib/api.ts` module — reads session JWT, sends it as Bearer on every management API call
- Visual parity with the Claude Design: dark theme, orange accent, monospace keys/IDs, dense dev-tool aesthetic

**Non-Goals:**
- No Google/GitHub SSO (email/password only for this phase)
- No real data on placeholder pages (Organizations, Departments, API Keys, Analytics, Settings, Chat Demo are stubs)
- No deployment config — local dev only
- No changes to the FastAPI backend

## Decisions

### Next.js App Router (not Pages Router)
App Router enables server components for session checking and middleware-based auth redirects without client-side flicker. `@supabase/ssr` is designed for App Router cookie patterns. Alternative (Pages Router) is being phased out and lacks good SSR session support.

### `@supabase/supabase-js` + `@supabase/ssr` — no manual session handling
`@supabase/ssr` provides `createBrowserClient` and `createServerClient` with correct cookie read/write for Next.js middleware and server components. Manual JWT storage in `localStorage` or custom cookies would be insecure and duplicates solved work.

### Middleware-based auth guard (not per-page redirects)
`middleware.ts` at the app root intercepts `/dashboard/*`, `/login`, and `/signup` via a `matcher` config. It calls `supabase.auth.getUser()` (not `getSession()`) to validate and refresh the session on every protected request. Unauthenticated `/dashboard/*` requests redirect to `/login`; authenticated requests to `/login` or `/signup` redirect to `/dashboard`. If the refresh token is expired, the middleware clears the session cookie and redirects to `/login`. The `matcher` explicitly excludes `/_next/*` and static assets so middleware does not run on every file request. Alternative (per-layout `redirect()`) scatters auth logic and has no single enforcement point.

### Thin `lib/api.ts` client — server-only (not SWR/React Query in this phase)
A server-only fetch wrapper (uses `import 'server-only'`) that reads the session via the server Supabase client and adds `Authorization: Bearer`. It throws if no session exists, throws on HTTP 401 or 5xx, and returns the response for all other status codes. Marking it server-only prevents accidental use from client components (which cannot call `cookies()` and would crash at runtime). Client-side callers will need a different pattern in future phases (e.g. a route handler proxy or browser session read via `createBrowserClient`). No caching library yet — placeholder pages don't need it, and adding a data-fetching layer now would be premature.

### Tailwind for styling (design tokens as CSS variables)
The Claude Design uses CSS custom properties (`--bg`, `--accent`, `--font-mono`, etc.). Tailwind's `theme.extend` maps these to utility classes so components can use both patterns. `Inter` + `JetBrains Mono` fonts match the design exactly.

### `npm` as package manager (not pnpm/yarn)
Requirement specified by the user. Consistent with most Next.js scaffolding docs; no monorepo tooling needed since `frontend/` is standalone.

## Risks / Trade-offs

- **CORS on local dev** → FastAPI must include `http://localhost:3000` in `allow_origins`. This is an operator concern (not a code change), but undocumented CORS errors are a common first-run failure. Mitigation: CLAUDE.md explicitly states the CORS requirement in the frontend setup section.
- **Supabase project required** → Real credentials are needed even for local dev. Mitigation: `.env.local.example` documents all three vars; CLAUDE.md includes a `cp` step. The demo user is pre-seeded so no additional backend setup is needed.
- **`lib/api.ts` is server-only** → Client components cannot call `apiFetch` directly. Mitigation: the module uses `import 'server-only'` to produce a build-time error rather than a silent runtime crash. Future client-side data needs will require a separate pattern (route handler proxy or browser Supabase session).
- **Redirect-after-login not implemented** → Users who are redirected from `/dashboard/organizations` to `/login` will land on `/dashboard` after sign-in, not their original destination. Accepted for this phase — deep-link preservation is a future enhancement.
- **Placeholder pages ship empty** → Five of six sections are stubs. Mitigation: each renders a "Coming soon" card so the gap is visible and not mistaken for a bug.

## Migration Plan

1. Scaffold `frontend/` with `npx create-next-app@latest` (TypeScript, Tailwind, App Router, no src dir, import alias `@/*`)
2. Install `@supabase/supabase-js` and `@supabase/ssr`
3. Add `frontend/.env.local.example` with the three required env vars
4. Implement auth utilities, middleware, and sign-in/sign-up/sign-out flows
5. Build sidebar layout and dashboard home page
6. Add five placeholder pages
7. Implement `lib/api.ts`
8. Apply design tokens (CSS variables + Tailwind config + Google Fonts)
9. Update `CLAUDE.md`

Rollback: `frontend/` is a new directory with no changes to existing code — removing it is a clean revert.

## Open Questions

- Should CORS on the FastAPI side be updated as part of this change, or left to the implementer? (Recommendation: document the requirement, leave the env config to the operator)
- Will `http://localhost:3000` be the standard dev URL? (Yes — default Next.js dev port)
