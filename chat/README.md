# DejaQ Chat

Standalone Next.js chat app for the DejaQ gateway. The browser never receives the organization API key; server route handlers read it from `chat/.env.local` and proxy requests to the DejaQ backend.

## Setup

```bash
cd chat
npm install
cp .env.local.example .env.local
```

Fill in:

```bash
DEJAQ_API_KEY=dq_...
DEJAQ_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000/dashboard
```

## Run

```bash
npm run dev
```

Open `http://localhost:3001`.

## Verify

```bash
npx tsc --noEmit --pretty false
npm run build
```
