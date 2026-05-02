# Getting Started

## Prerequisites

- Python 3.13+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) package manager
- Redis (for background task queue)
- A free [Supabase](https://supabase.com) project (for dashboard auth)

---

## 1. Install dependencies

```bash
# Backend (from repo root)
uv sync

# Frontend
cd frontend
npm install
```

---

## 2. Configure environment variables

Create `server/.env`:

```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # optional, needed for demo seed only

DEJAQ_CREDENTIAL_ENCRYPTION_KEY=   # generate below
```

Generate the encryption key:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

---

## 3. Run the database migration

```bash
cd server
uv run alembic upgrade head
```

---

## 4. Seed demo data (optional)

Creates a demo org, departments, API key, and a Supabase Auth user.

```bash
cd server
uv run dejaq-admin seed demo
```

Demo login: `demo@dejaq.local` / `demo1234`

---

## 5. Start the stack

Open **four terminals** from the repo root:

**Terminal 1 — Redis**
```bash
redis-server
```

**Terminal 2 — FastAPI backend**
```bash
cd server
uv run uvicorn app.main:app --reload
# Running at http://127.0.0.1:8000
```

**Terminal 3 — Celery worker** (background cache tasks)
```bash
cd server
uv run celery -A app.celery_app:celery_app worker --queues=background --pool=solo --loglevel=info
```

**Terminal 4 — Next.js frontend**
```bash
cd frontend
npm run dev
# Running at http://localhost:3000
```

> **No Redis?** Skip terminals 1 and 3 and set `DEJAQ_USE_CELERY=false` in terminal 2.

---

## 6. Open the app

| Surface | URL |
|---------|-----|
| Dashboard (login required) | http://localhost:3000 |
| Chat UI | http://localhost:3000/chat |
| API health check | http://127.0.0.1:8000/health |

### Chat UI quick start

1. Go to **http://localhost:3000/chat**
2. Click **Settings** and paste your DejaQ org API key
3. Optionally enter a department slug
4. Start chatting — easy questions route to the local model, hard ones go to your configured external provider, and repeated questions are answered instantly from the semantic cache

---

## Shortcut: combined startup script

```bash
./server/scripts/start.sh
```

The script prompts for a deployment mode (`in-process`, `self-hosted`, or `cloud`) and starts all services.
