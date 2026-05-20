## Why

When a user gives a thumbs-down, DejaQ should try to recover the experience immediately instead of only changing a cache score. The first version of this proposal tied escalation to the existing ChromaDB `response_id`, but that ID only reliably represents cached entries. Local and external LLM answers can be uncached, blocked by the cache filter, or still waiting on background storage.

This revision separates two concepts:

- cache `response_id`: the existing ChromaDB document identifier used for cache score updates
- `interaction_id`: a new server-side identifier for every chat answer that DejaQ successfully serves, used to safely verify the original org, department, tier, and request-message hash before escalation

## What Changes

- Every `/v1/chat/completions` response that returns an answer gets an `X-DejaQ-Interaction-Id` header
- Every served chat answer is recorded in a response registry before the HTTP response is returned
- The registry stores the authenticated org/department, cache namespace, served tier, optional cache `response_id`, and a hash of the request messages
- `POST /v1/feedback` remains backward-compatible for existing cache feedback payloads
- Escalation requires a valid `interaction_id`, negative feedback, and the exact message snapshot used for the original answer
- The server determines the original tier from the response registry; client-supplied `tier` is ignored for authorization
- Escalation order is server-verified: cache → local LLM → external LLM; external → no further escalation
- Successful escalated answers are cache-stored when the normal cache rules pass, and their feedback response may include a cache `response_id`
- Escalation calls are logged for usage/cost tracking and duplicate escalation is blocked per interaction
- `X-DejaQ-Tier` is added to chat responses that return an answer so the UI can display the serving tier, but it is not trusted by the backend

## Capabilities

### New Capabilities

- `response-identity`: Create a durable server-side `interaction_id` for each chat answer and store enough metadata to safely process feedback later
- `feedback-escalation`: On thumbs-down with a valid interaction and matching message snapshot, automatically escalate to the next serving tier and return a fresh response in the same feedback call

### Modified Capabilities

- `response-feedback`: Feedback can use the legacy cache `response_id` path, or the new `interaction_id` path for escalation
- `openai-chat-completions`: Answer responses include `X-DejaQ-Interaction-Id` and `X-DejaQ-Tier`
- `request-logging`: Escalation generations are logged as request events with `source="feedback_escalation"` and a parent interaction reference

## Impact

- `server/app/routers/openai_compat.py` — create and return `interaction_id`, emit tier headers, register served answer responses before returning
- `server/app/services/response_registry.py` — new service for response identity, message hashes, tier lookup, tenant validation, and duplicate-escalation guard
- `server/app/routers/feedback.py` — require a valid org API key, validate namespace ownership, pass `interaction_id` and messages to the service
- `server/app/services/feedback_service.py` — preserve existing cache score behavior and add server-verified escalation orchestration
- `server/app/services/escalation.py` — call the next tier using the original message snapshot and server-side org configuration
- `server/app/schemas/feedback.py` — add `interaction_id`, `messages`, `EscalatedResponse`, and canonical escalation status fields
- `server/app/main.py` — expose `X-DejaQ-Interaction-Id`, `X-DejaQ-Tier`, and existing DejaQ headers through CORS
- `server/app/services/request_logger.py` — log escalation usage/cost events
- `chat/app/api/chat/route.ts` and `chat/app/api/feedback/route.ts` — forward the new headers and feedback response fields
- Frontend chat UI — store the exact request-message snapshot per assistant message, send it on thumbs-down, persist returned score metadata, and render the escalated answer
