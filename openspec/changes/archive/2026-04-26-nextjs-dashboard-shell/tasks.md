## 1. Scaffold Next.js App

- [x] 1.1 Run `npx create-next-app@latest frontend` from repo root — select TypeScript, Tailwind, App Router, no src dir, import alias `@/*`, npm as package manager; verify `tsconfig.json` contains `"@/*"` path alias covering `app/`, `lib/`, `components/`
- [x] 1.2 Install Supabase deps: `npm install @supabase/supabase-js @supabase/ssr`
- [x] 1.3 Create `frontend/.env.local.example` with placeholder values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
- [x] 1.4 Add `frontend/.env.local` to `frontend/.gitignore` (verify it's already excluded by default scaffolding)

## 2. Design Tokens & Global Styles

- [x] 2.1 Add `Inter` (weights 400, 500, 600, 700) and `JetBrains Mono` (weight 400) via `next/font/google` in the root layout; expose as CSS variables `--font-sans` and `--font-mono`
- [x] 2.2 Define all CSS custom properties in `frontend/app/globals.css`: `--bg: #1c1c1c`, `--bg-2: #1f1f1f`, `--bg-3: #242424`, `--bg-hover: #262626`, `--border: #2a2a2a`, `--border-2: #333`, `--fg: #ededed`, `--fg-dim: #a1a1a1`, `--fg-dimmer: #6e6e6e`, `--accent: #f97316`, `--accent-hover: #fb8533`, `--accent-bg: rgba(249,115,22,0.12)`, `--accent-border: rgba(249,115,22,0.3)`, `--amber: #f59e0b`, `--amber-bg: rgba(245,158,11,0.12)`, `--amber-border: rgba(245,158,11,0.3)`, `--red: #ef4444`, `--red-bg: rgba(239,68,68,0.12)`, `--red-border: rgba(239,68,68,0.3)`, `--green: #22c55e`, `--green-bg: rgba(34,197,94,0.12)`, `--blue: #3b82f6`, `--blue-bg: rgba(59,130,246,0.12)`, `--purple: #a855f7`, `--purple-bg: rgba(168,85,247,0.12)`
- [x] 2.3 Extend `tailwind.config.ts`: map CSS variables to Tailwind color utilities; set `fontFamily` for `sans` and `mono`; do NOT set `darkMode` — the app is always dark (no light mode toggle)
- [x] 2.4 Set body defaults in `globals.css`: `background: var(--bg)`, `color: var(--fg)`, `font-family: var(--font-sans)`, `font-size: 13px`, `letter-spacing: -0.005em`, `-webkit-font-smoothing: antialiased`

## 3. Supabase Auth Utilities

- [x] 3.1 Create `frontend/lib/supabase/server.ts` — exports `createClient()` using `@supabase/ssr` `createServerClient`; must be called inside an async function (one fresh client per request); uses `cookies()` from `next/headers` for get/set; validate that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, throw descriptively if missing
- [x] 3.2 Create `frontend/proxy.ts` (Next.js 16 renamed middleware → proxy) — use `matcher` config: `['/dashboard/:path*', '/login', '/signup']` (excludes `/_next/*`, static assets); call `supabase.auth.getUser()` (not `getSession()`) to validate and refresh the session; if no valid session on `/dashboard/*` → redirect to `/login`; if valid session on `/login` or `/signup` → redirect to `/dashboard`; if `getUser()` fails (refresh token expired) → clear cookies and redirect to `/login`
- [x] 3.3 Create `frontend/lib/supabase/client.ts` — exports `createClient()` using `@supabase/ssr` `createBrowserClient` for use in client components

## 4. Auth Pages

- [x] 4.1 Create `frontend/app/(auth)/layout.tsx` — centered card layout, `var(--bg)` background, no sidebar
- [x] 4.2 Create `frontend/app/(auth)/login/page.tsx` — email + password form, sign-in server action, link to `/signup`, error message display; orange primary button, Inter font, dark card style
- [x] 4.3 Create `frontend/app/(auth)/signup/page.tsx` — email + password form, sign-up server action, link to `/login`, error message display; same styling as login
- [x] 4.4 Create `frontend/app/actions/auth.ts` — `signIn(formData)`, `signUp(formData)`, `signOut()` server actions; `signIn`/`signUp` redirect to `/dashboard` on success; `signOut` clears session and redirects to `/login`

## 5. Dashboard Layout & Sidebar

- [x] 5.1 Create `frontend/app/dashboard/layout.tsx` — CSS grid `grid-template-columns: 220px 1fr`, `min-height: 100vh`; reads session server-side via server Supabase client; passes user email to Sidebar
- [x] 5.2 Create `frontend/components/Sidebar.tsx` — client component; sidebar container: background `#181818` (NOT `var(--bg)`), border-right `1px solid var(--border)`, padding `14px 10px`; logo mark: 22×22px square, `var(--accent)` background, text "Dq" bold monospace, border-radius 4px; wordmark "DejaQ" next to logo; org switcher button below logo row: border `1px var(--border)`, border-radius 5px, shows current org name; nav items in order: Organizations, Departments, API Keys, Analytics, Settings, Chat Demo; nav item style: padding `6px 8px`, border-radius `5px`, icon 14×14px; active state: icon color `var(--accent)`, background `var(--bg-3)`; sidebar footer: 22×22px circle avatar with user initials, user email, role "owner" in `var(--fg-dimmer)` monospace, sign-out button
- [x] 5.3 Create `frontend/components/Topbar.tsx` — height 48px, border-bottom `1px var(--border)`; breadcrumbs: org ID prefix in `var(--font-mono)`, followed by section name; right side: env pill (`var(--bg-2)` bg, `var(--border)` border) + green status dot (`var(--green)`, 6px circle)
- [x] 5.4 Wire sign-out button in Sidebar to `signOut` server action

## 6. Dashboard Home Page

- [x] 6.1 Create `frontend/app/dashboard/page.tsx` — server component; reads session for user email; renders welcome heading and user email; calls `GET /health` via `apiFetch` with 5-second timeout (wrapped in try/catch — failure must not crash the page); shows "Backend connected" on success or "Backend unavailable" on error/timeout

## 7. Placeholder Pages

- [x] 7.1 Create `frontend/app/dashboard/organizations/page.tsx` — "Organizations" heading + styled "Coming soon" empty-state card
- [x] 7.2 Create `frontend/app/dashboard/departments/page.tsx` — same pattern
- [x] 7.3 Create `frontend/app/dashboard/keys/page.tsx` — same pattern
- [x] 7.4 Create `frontend/app/dashboard/analytics/page.tsx` — same pattern
- [x] 7.5 Create `frontend/app/dashboard/settings/page.tsx` — same pattern
- [x] 7.6 Create `frontend/app/dashboard/chat/page.tsx` — same pattern

## 8. API Client Module

- [x] 8.1 Create `frontend/lib/api.ts` — server-only module (add `import 'server-only'` at top); validate `NEXT_PUBLIC_API_BASE_URL` is set at module load time, throw `"NEXT_PUBLIC_API_BASE_URL is required"` if missing; export `apiFetch(path, init?)` that: calls server Supabase client to get session, throws if no session, adds `Authorization: Bearer <access_token>` and `Content-Type: application/json` headers, prepends base URL, throws on HTTP 401 or 5xx, returns response for all other status codes
- [x] 8.2 Use `apiFetch` in the dashboard home page (`GET /health`) to verify the module works end-to-end

## 9. Root Layout & Metadata

- [x] 9.1 Update `frontend/app/layout.tsx` — apply Inter font CSS variable to `<html>`, set `lang="en"`, title "DejaQ", apply body dark background via globals.css
- [x] 9.2 Add `frontend/app/not-found.tsx` — styled 404 page within dark theme (no sidebar, centered message)

## 10. CLAUDE.md Update

- [x] 10.1 Add `### Frontend (dashboard)` section to repo root `CLAUDE.md` with: `cd frontend && npm install`, `cp .env.local.example .env.local` (then fill in Supabase keys and API base URL), `npm run dev` (port 3000); env vars table (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`); demo account (`demo@dejaq.local` / `demo1234`); note that the dashboard sends Supabase JWT as Bearer token to the FastAPI backend; note that FastAPI CORS must allow `http://localhost:3000` for local dev

## 11. Verification

- [x] 11.1 Run `npm run build` inside `frontend/` — confirm zero TypeScript errors and successful build
- [x] 11.2 Start dev server, navigate to `http://localhost:3000` — confirm redirect to `/login`
- [x] 11.3 Navigate to `http://localhost:3000/login` while already signed in — confirm redirect to `/dashboard`
- [x] 11.4 Sign in with `demo@dejaq.local` / `demo1234` — confirm redirect to `/dashboard` and sidebar renders with correct nav order (Organizations first)
- [x] 11.5 Navigate to each of the six placeholder pages — confirm all render within the layout with no 404
- [x] 11.6 Click sign-out — confirm redirect to `/login` and session cleared
- [x] 11.7 Attempt to navigate to `/dashboard` after sign-out — confirm redirect back to `/login`
