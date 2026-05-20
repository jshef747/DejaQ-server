## Context

Today, `POST /v1/feedback` is cache-focused. It accepts a ChromaDB `response_id`, adjusts score, deletes on the first thumbs-down, and logs feedback. That works for cached answers, but it is not enough to safely trigger new LLM calls:

- local/external answers may not have a ChromaDB entry
- background cache storage can race with immediate feedback
- a client-supplied `tier` can be forged
- arbitrary `messages` could turn feedback into an untracked generation endpoint

This design keeps the current cache feedback contract intact and adds a separate server-side response identity layer for escalation.

## Goals / Non-Goals

**Goals:**
- On thumbs-down, re-run the original user request at the next serving tier and return the result in the feedback response body
- Support cache → local LLM and local → external LLM escalation without depending on a ChromaDB cache entry
- Preserve existing feedback behavior for clients that only send `response_id`, `rating`, and optional `comment`
- Verify org, department, original tier, and message snapshot server-side before escalation
- Prevent `/v1/feedback` from becoming an untracked or forgeable LLM generation endpoint
- Log escalation generations for usage/cost analytics
- Store successful escalated answers in cache when the existing cache policy allows it
- Gracefully return an escalation status instead of 5xx for expected escalation failures

**Non-Goals:**
- Changing thumbs-up behavior
- Storing full conversation content server-side
- Streaming the escalated response
- Escalating past an external LLM
- Trusting client-supplied `tier` for escalation decisions

## Decisions

### D1 — Add an `interaction_id` for every served chat answer

**Decision:** Every `/v1/chat/completions` response that returns an answer gets an `interaction_id`, returned in `X-DejaQ-Interaction-Id`. "Returns an answer" means DejaQ served a cache, local, or external answer; it does not imply the user approved the answer or withheld negative feedback. The server records the interaction before returning the response.

The record stores:

- `interaction_id`
- authenticated `org_id` and `org_slug`
- department slug and cache namespace
- served tier: `cache`, `local`, or `external`
- optional cache `response_id` when a ChromaDB entry exists
- deterministic hash of the exact request messages used for the answer
- whether escalation has already been attempted

**Why:** Feedback escalation must work for all served answers, not only ChromaDB entries. The server needs its own trusted record.

### D2 — Keep legacy `response_id` feedback backward-compatible

**Decision:** Existing payloads that send only `response_id`, `rating`, and optional `comment` continue to behave exactly as today. They adjust/delete ChromaDB entries and do not escalate.

**Why:** Existing SDK users should not be forced into the new escalation flow.

### D3 — Require `interaction_id` and matching messages for escalation

**Decision:** Escalation requires:

- `rating: "negative"`
- a valid `interaction_id` owned by the authenticated org/department
- non-empty `messages`
- a message hash matching the original interaction record

If any of these checks fail, the system does not call an LLM.

**Why:** The client still supplies message content so the server remains stateless about conversation content, but the server can verify that the submitted messages match the original request.

### D4 — The server determines the escalation tier

**Decision:** The backend ignores client-supplied `tier` for authorization. It uses the stored `served_tier` from the interaction record:

- `cache` → local LLM
- `local` → external LLM
- `external` → no further escalation

**Why:** `X-DejaQ-Tier` is useful UI metadata, not a security boundary.

### D5 — Cache score mutation only applies to cache-backed feedback targets

**Decision:** Existing score/deletion behavior applies when the feedback target includes a cache `response_id`. For an `interaction_id` whose original answer was not cache-backed, feedback is logged and escalation can run, but no ChromaDB score mutation is attempted.

**Why:** Local and external answers are not guaranteed to have ChromaDB documents. Treating missing cache docs as a fatal 404 would break escalation.

### D6 — Canonical feedback response shape

**Decision:** For new escalation-aware responses:

```json
{
  "status": "ok|deleted",
  "new_score": 0.0,
  "escalated_response": {
    "content": "...",
    "tier": "local|external",
    "interaction_id": "..."
  },
  "escalation_status": "answered|not_requested|no_further_escalation|no_credential|provider_error|timeout|message_mismatch|already_escalated"
}
```

Legacy non-escalation responses keep their current compact shape and omit new null fields.

**Why:** `status` describes feedback/cache mutation. `escalation_status` describes the re-answer attempt.

### D7 — Escalation is synchronous but bounded

**Decision:** Escalation runs synchronously inside `POST /v1/feedback`, but it must have a server-side timeout. Local and external timeout/provider failures return HTTP 200 with `escalated_response: null` and a clear `escalation_status`.

**Why:** The user is waiting for a better answer, but the feedback endpoint cannot hang indefinitely.

### D8 — Escalation is logged and idempotent per interaction

**Decision:** Each escalation generation is logged as a request event with `source="feedback_escalation"` and `parent_interaction_id`. The response registry prevents more than one LLM escalation for the same interaction.

**Why:** Cost analytics and abuse detection must include escalated generations.

### D9 — Successful escalated answers use normal cache rules

**Decision:** When escalation returns an answer, the server evaluates the original query with the same enrich, normalize, and cache-filter policy used by chat completions. If the query is cacheable, the escalated answer is stored in the same department cache namespace and the child interaction/feedback payload include the deterministic cache `response_id`. Cache storage is best-effort; a storage failure does not fail the feedback response.

**Why:** A better answer produced by feedback recovery should be reusable, but short or filler turns should still respect the existing cache policy.

## Risks / Trade-offs

- **More backend plumbing** — a response registry is additional work, but it avoids overloading ChromaDB document IDs with meanings they do not have.
- **Message hash mismatch** — clients must store the exact request-message snapshot per assistant answer. If they send current chat history later, escalation will be rejected.
- **Long feedback calls** — external escalation can still be slow. The frontend must use a timeout at least as long as the backend escalation timeout and show a loading state.
- **No full server-side replay** — because full messages are not stored, escalation depends on the client returning the original message snapshot. This preserves statelessness but requires careful frontend state.

## Migration Plan

1. Deploy backend response registry and new headers.
2. Preserve legacy feedback behavior.
3. Update the chat frontend/proxy to store `interaction_id`, `tier`, and exact request-message snapshots.
4. Enable escalation only when the frontend can send `interaction_id` plus matching messages.
5. Monitor feedback escalation request logs for cost, latency, duplicate attempts, and failures.
