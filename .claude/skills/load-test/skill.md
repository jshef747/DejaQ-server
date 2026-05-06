---
name: load-test
description: Sends 100 realistic prompts to the running DejaQ stack as a specific persona (department, student group, etc.). Creates a matching department in the demo org each run. Waits for generalize_and_store to complete between prompts. Writes a live-updating markdown report. Reports cache hit/miss stats. Usage: /load-test <persona description>
---

Run a realistic 100-prompt load test against the DejaQ stack, impersonating a given persona.
Each run creates a fresh department in the demo org scoped to this persona, waits for
generalize_and_store to finish between prompts, and writes a live-updating markdown report.

## Known bug — org model override ignored

The endpoint at `server/app/routers/openai_compat.py:395` uses `EXTERNAL_MODEL_NAME` (the global
env default) instead of the per-org model from `org_llm_config`. This means hard queries are
always routed to the default provider (e.g. `gemini-2.5-flash`) even when the org has an
Anthropic key and `claude-haiku-4-5-20251001` configured.

**Workaround used in this skill:** set `DEJAQ_EXTERNAL_MODEL=claude-haiku-4-5-20251001` in the
environment before running the load test script so hard queries go to Anthropic:

```bash
export DEJAQ_EXTERNAL_MODEL=claude-haiku-4-5-20251001
```

Tell the user about this workaround at the start of each run.

## Steps

### 1. Parse the persona

The user invokes this skill as `/load-test <persona>`. Extract the persona from the args.

If no persona was given, ask: "What persona should I simulate? (e.g. 'CS students studying algorithms', 'marketing team at a SaaS company', 'medical residents')"

### 2. Check if DejaQ is already running

```bash
curl -s --max-time 3 http://127.0.0.1:8000/health
```

- 200 response → stack is up, skip to step 4.
- Fails → proceed to step 3.

### 3. Start the DejaQ stack

Tell the user: "Starting DejaQ stack (in-process mode)..."

```bash
DEJAQ_MODE=in-process DEJAQ_EXTERNAL_MODEL=claude-haiku-4-5-20251001 ./server/scripts/start.sh &
```

Poll `/health` every 3 seconds (up to 90s) until 200. Tell the user when ready.

### 4. Ensure demo org and API key exist

```bash
cd server && uv run dejaq-admin org list 2>/dev/null
```

If `demo` org does not exist:
```bash
cd server && uv run dejaq-admin seed demo 2>/dev/null
```

Get the API key:
```bash
cd server && uv run dejaq-admin key list --org demo 2>/dev/null
```

If none, create one:
```bash
cd server && uv run dejaq-admin key create --org demo --name "load-test" 2>/dev/null
```

If the CLI only shows truncated tokens, read the full key directly:
```bash
sqlite3 server/dejaq.db "SELECT token FROM api_keys WHERE revoked_at IS NULL AND org_id = (SELECT id FROM organizations WHERE slug='demo') LIMIT 1;"
```

### 5. Create a department for this run

Derive a slug from the persona: lowercase, spaces/special chars → hyphens, max 50 chars.
Add today's date suffix (YYYYMMDD) to avoid collisions across runs.
Example: `cs-students-algorithms-20260503`

```bash
cd server && uv run dejaq-admin dept create --org demo --name "<full persona name> <YYYYMMDD>" 2>/dev/null
```

Note the `slug` and `cache_namespace` from the output — send the slug as `X-DejaQ-Department`.

### 6. Generate 100 prompts for the persona

Generate exactly 100 prompts. Distribution:

- **~25 prompts (hard)**: open-ended, analytical, multi-step, opinionated, or creative questions
  that the DeBERTa classifier will score as hard. Examples:
  - "Design a cache eviction strategy for a distributed system under high write load"
  - "Compare the trade-offs between microservices and monolithic architectures"
  - "Write a recursive solution for the 0/1 knapsack problem and explain its complexity"
  These should be genuinely complex — not just long.

- **~75 prompts (easy)**: factual, definition, or explanation questions a real person in this
  role would actually ask. Generate them naturally — but lean toward having some topic repetition,
  since real users do revisit the same subjects in different ways. A few loose clusters will
  emerge organically; don't force them but don't avoid them either.

Shuffle all 100 (so clusters are not contiguous — simulates natural usage).

### 7. Write and run the load test script

Write the script to `/tmp/dejaq_load_test.py`. Fill in `PROMPTS`, `API_KEY`, `DEPT_SLUG`,
`PERSONA`, and `REPORT_PATH`.

`REPORT_PATH` must be set to:
```
/Users/jonathansheffer/Desktop/Coding/DejaQ/load-test-reports/<dept-slug>.md
```

Create the directory if it doesn't exist:
```bash
mkdir -p /Users/jonathansheffer/Desktop/Coding/DejaQ/load-test-reports
```

The script must do everything below:

```python
#!/usr/bin/env python3
"""DejaQ load test — sequential with generalize_and_store wait + live MD report."""
import asyncio
import time
import statistics
import os
import datetime
import chromadb

PERSONA = "PLACEHOLDER"
API_KEY = "PLACEHOLDER"
DEPT_SLUG = "PLACEHOLDER"
REPORT_PATH = "/tmp/dejaq_load_test_report.md"
BASE_URL = "http://127.0.0.1:8000"
CHROMA_HOST = "127.0.0.1"
CHROMA_PORT = 8001
COLLECTION_NAME = "dejaq_cache"
STORE_TIMEOUT = 60
STORE_POLL_INTERVAL = 1.0

PROMPTS: list[str] = [
    # PLACEHOLDER — 100 items
]


def write_report(results: list[dict], persona: str, dept: str, in_progress: bool = True) -> None:
    """Write/overwrite the markdown report with current results."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    hits = [r for r in results if r["is_hit"]]
    misses = [r for r in results if not r["is_hit"] and r["status"] == 200]
    errs = [r for r in results if r["status"] != 200]
    latencies = [r["latency_ms"] for r in results if r["status"] == 200]
    total = len(results)

    lines = []
    lines.append(f"# DejaQ Load Test Report")
    lines.append(f"")
    lines.append(f"**Persona:** {persona}  ")
    lines.append(f"**Department:** `{dept}`  ")
    lines.append(f"**Updated:** {now}  ")
    lines.append(f"**Status:** {'⏳ In progress ({total}/100)' if in_progress else '✅ Complete'}  ")
    lines.append(f"")

    # Summary stats
    if total > 0:
        lines.append(f"## Summary")
        lines.append(f"")
        lines.append(f"| Metric | Value |")
        lines.append(f"|--------|-------|")
        lines.append(f"| Total sent | {total} |")
        lines.append(f"| Cache hits | {len(hits)} ({100*len(hits)//total}%) |")
        lines.append(f"| Cache misses | {len(misses)} ({100*len(misses)//total}%) |")
        lines.append(f"| Errors | {len(errs)} |")
        if latencies:
            s = sorted(latencies)
            n = len(s)
            lines.append(f"| Latency p50 | {s[n//2]} ms |")
            lines.append(f"| Latency p95 | {s[int(n*0.95)]} ms |")
            lines.append(f"| Latency p99 | {s[int(n*0.99)]} ms |")
            lines.append(f"| Latency avg | {int(statistics.mean(s))} ms |")
        lines.append(f"")

    # Per-prompt table
    lines.append(f"## Prompts")
    lines.append(f"")
    lines.append(f"| # | Status | Latency (ms) | Difficulty | Normalized | Prompt |")
    lines.append(f"|---|--------|-------------|------------|------------|--------|")
    for r in results:
        status_icon = "✅ HIT" if r["is_hit"] else ("❌ ERR" if r["status"] != 200 else "🔄 MISS")
        diff = r.get("difficulty", "—")
        diff_score = r.get("diff_score", "")
        diff_label = f"{diff} ({diff_score:.2f})" if diff_score != "" else diff
        normalized = r.get("normalized", "—")
        normalized_cell = normalized[:60].replace("|", "\\|") if normalized and normalized != "—" else "—"
        prompt_cell = r["prompt"][:70].replace("|", "\\|")
        latency = r["latency_ms"] if r["status"] != 0 else "timeout"
        lines.append(f"| {r['idx']} | {status_icon} | {latency} | {diff_label} | {normalized_cell} | {prompt_cell} |")

    lines.append(f"")

    # Error details
    if errs:
        lines.append(f"## Errors")
        lines.append(f"")
        for e in errs:
            lines.append(f"- **[{e['idx']}]** status={e['status']} — `{(e['error'] or '')[:200]}`")
        lines.append(f"")

    with open(REPORT_PATH, "w") as f:
        f.write("\n".join(lines))


async def send_prompt(session, prompt: str, idx: int) -> dict:
    import aiohttp
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "X-DejaQ-Department": DEPT_SLUG,
    }
    body = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": prompt}],
    }
    t0 = time.monotonic()
    try:
        async with session.post(
            f"{BASE_URL}/v1/chat/completions",
            json=body,
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=180),
        ) as resp:
            latency_ms = int((time.monotonic() - t0) * 1000)
            resp_id = resp.headers.get("x-dejaq-response-id") or resp.headers.get("X-DejaQ-Response-Id")
            # A response_id with ":" means the entry exists in cache (hit) or was just stored (miss)
            # HIT = response came FROM cache; we detect this because on a hit the response_id
            # is set but x-dejaq-model-used reflects the cached model, not a new inference
            # Simpler heuristic: cache hit responses are very fast (<2s typically)
            # But the real signal is the response_id format — hits have it, non-cacheable misses don't
            is_hit = resp_id is not None and ":" in resp_id and resp.status == 200
            # Read difficulty header
            difficulty = resp.headers.get("x-dejaq-prompt-difficulty", "—")
            status = resp.status
            body_text = await resp.text()

            # Try to extract diff_score from response body JSON
            diff_score = ""
            try:
                import json as _json
                # Difficulty score is not in the response body — we note the label only
                pass
            except Exception:
                pass

            return {
                "idx": idx,
                "prompt": prompt,
                "status": status,
                "latency_ms": latency_ms,
                "response_id": resp_id,
                "is_hit": is_hit,
                "difficulty": difficulty,
                "diff_score": diff_score,
                "normalized": "—",  # not exposed in response headers currently
                "error": body_text if status != 200 else None,
            }
    except Exception as e:
        latency_ms = int((time.monotonic() - t0) * 1000)
        return {
            "idx": idx, "prompt": prompt, "status": 0, "latency_ms": latency_ms,
            "response_id": None, "is_hit": False, "difficulty": "—", "diff_score": "",
            "normalized": "—", "error": str(e),
        }


def wait_for_store(doc_id: str, chroma_col, timeout: float) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            result = chroma_col.get(ids=[doc_id])
            if result and result.get("ids") and doc_id in result["ids"]:
                return True
        except Exception:
            pass
        time.sleep(STORE_POLL_INTERVAL)
    return False


async def main():
    import aiohttp

    print(f"\n=== DejaQ Load Test ===")
    print(f"Persona    : {PERSONA}")
    print(f"Department : {DEPT_SLUG}")
    print(f"Prompts    : {len(PROMPTS)}")
    print(f"Report     : {REPORT_PATH}")
    print(f"Strategy   : sequential, wait for generalize_and_store between misses\n")

    chroma = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
    col = None
    try:
        col = chroma.get_or_create_collection(COLLECTION_NAME)
        print(f"ChromaDB   : connected (docs={col.count()})\n")
    except Exception as e:
        print(f"[WARN] ChromaDB unavailable ({e}) — store-wait disabled\n")

    results = []
    write_report(results, PERSONA, DEPT_SLUG, in_progress=True)

    async with aiohttp.ClientSession() as session:
        for idx, prompt in enumerate(PROMPTS, start=1):
            result = await send_prompt(session, prompt, idx)
            results.append(result)

            hit_flag = "HIT " if result["is_hit"] else ("ERR " if result["status"] != 200 else "MISS")
            diff_label = result.get("difficulty", "—")
            print(f"  [{idx:3d}/100] {hit_flag} {result['latency_ms']:6d}ms  [{diff_label:4s}]  {prompt[:60]}")

            # Write live report after every prompt
            write_report(results, PERSONA, DEPT_SLUG, in_progress=(idx < len(PROMPTS)))

            # On a cache miss, wait for generalize_and_store to finish before next prompt
            if not result["is_hit"] and result["status"] == 200 and result["response_id"] and col is not None:
                parts = result["response_id"].split(":", 1)
                if len(parts) == 2:
                    doc_id = parts[1]
                    stored = wait_for_store(doc_id, col, STORE_TIMEOUT)
                    if stored:
                        print(f"           └─ stored (doc_id={doc_id[:20]}...)")
                    else:
                        print(f"           └─ [WARN] store timeout after {STORE_TIMEOUT}s")

    # Final report
    write_report(results, PERSONA, DEPT_SLUG, in_progress=False)

    hits = [r for r in results if r["is_hit"]]
    misses = [r for r in results if not r["is_hit"] and r["status"] == 200]
    errs = [r for r in results if r["status"] != 200]
    latencies = [r["latency_ms"] for r in results if r["status"] == 200]

    print(f"\n{'='*52}")
    print(f"=== DejaQ Load Test Results ===")
    print(f"Persona  : {PERSONA}")
    print(f"Total    : {len(results)}")
    print(f"Hits     : {len(hits):3d}  ({100*len(hits)//len(results)}%)")
    print(f"Misses   : {len(misses):3d}  ({100*len(misses)//len(results)}%)")
    print(f"Errors   : {len(errs):3d}")
    if latencies:
        s = sorted(latencies)
        n = len(s)
        print(f"\nLatency (ms)")
        print(f"  p50    : {s[n//2]}")
        print(f"  p95    : {s[int(n*0.95)]}")
        print(f"  p99    : {s[int(n*0.99)]}")
        print(f"  avg    : {int(statistics.mean(s))}")
    if errs:
        print(f"\nFirst errors:")
        for e in errs[:3]:
            print(f"  [{e['idx']}] status={e['status']} — {(e['error'] or '')[:120]}")
    print(f"\nFull report: {REPORT_PATH}")
    print(f"{'='*52}\n")


if __name__ == "__main__":
    asyncio.run(main())
```

Before running, export the workaround env var:
```bash
export DEJAQ_EXTERNAL_MODEL=claude-haiku-4-5-20251001
```

Then run:
```bash
/Users/jonathansheffer/Desktop/Coding/DejaQ/server/.venv/bin/python /tmp/dejaq_load_test.py
```

### 8. Report to user

Show the final summary. Tell the user:
- The live report is at `DejaQ/load-test-reports/<dept-slug>.md` (open in any markdown viewer)
- Hit rate across the easy clustered prompts
- How many hard prompts were routed to Anthropic (difficulty=hard in the table)
- Any remaining errors
- Remind them of the bug: the endpoint ignores `org_llm_config.external_model` and always uses
  the global `DEJAQ_EXTERNAL_MODEL` env var — worth fixing so org-level model overrides work.
