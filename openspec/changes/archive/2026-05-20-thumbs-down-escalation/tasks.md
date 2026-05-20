## 1. Response Identity

- [x] 1.1 Add a response registry table or SQLite-backed service keyed by `interaction_id`
- [x] 1.2 Store `interaction_id`, org id/slug, department, cache namespace, served tier, optional cache `response_id`, request-message hash, timestamps, and escalation-attempt metadata
- [x] 1.3 Generate an `interaction_id` for every `/v1/chat/completions` response that returns an answer before returning it
- [x] 1.4 Persist the response registry record before returning the chat response so immediate feedback can be verified
- [x] 1.5 Add helper functions to compute a deterministic OpenAI-message hash and to validate interaction ownership

## 2. Chat Endpoint Headers

- [x] 2.1 Identify all answer return paths in `server/app/routers/openai_compat.py` (cache/local/external, streaming/non-streaming)
- [x] 2.2 Emit `X-DejaQ-Interaction-Id` on every chat response that returns an answer
- [x] 2.3 Emit `X-DejaQ-Tier: cache | local | external` on every chat response that returns an answer
- [x] 2.4 Keep `X-DejaQ-Response-Id` only for cache-backed/cache-stored responses where a ChromaDB document ID exists
- [x] 2.5 Add `X-DejaQ-Interaction-Id` and `X-DejaQ-Tier` to exposed CORS headers in `server/app/main.py`

## 3. Schema & API Contract

- [x] 3.1 Extend `FeedbackRequest` with optional `interaction_id: str | None` and optional `messages: list[ChatMessage] | None`
- [x] 3.2 Keep `response_id` supported for legacy cache feedback; allow either `response_id` or `interaction_id`, with `rating` always required
- [x] 3.3 Keep optional `tier` accepted only as non-authoritative client metadata if needed for compatibility; never use it to choose escalation
- [x] 3.4 Add `EscalatedResponse(content: str, tier: Literal["local", "external"], interaction_id: str | None)`
- [x] 3.5 Add canonical `FeedbackResponse` with `status`, optional `new_score`, optional `escalated_response`, and optional `escalation_status`
- [x] 3.6 Preserve exact legacy response shapes when no escalation is requested

## 4. Feedback Auth, Ownership, And Validation

- [x] 4.1 Require a valid org API key for `POST /v1/feedback`; missing/invalid keys return HTTP 401 for this endpoint
- [x] 4.2 Validate that cache `response_id` namespaces belong to the authenticated org/department before score mutation
- [x] 4.3 For escalation, look up `interaction_id` in the response registry and verify it belongs to the authenticated org/department
- [x] 4.4 Validate `messages` shape: allowed roles, string content, non-empty user message, max message count, and max serialized bytes/tokens
- [x] 4.5 Compute the hash of supplied `messages` and reject escalation with `escalation_status="message_mismatch"` when it differs from the registry hash
- [x] 4.6 Prevent duplicate LLM escalation for the same `interaction_id`; repeated attempts return `escalation_status="already_escalated"` without calling a model

## 5. Escalation Service

- [x] 5.1 Create `server/app/services/escalation.py` with an async `escalate(interaction, messages, db_session)` function
- [x] 5.2 Extract or share the OpenAI-message parsing used by chat completions so escalation derives `query`, `history`, and `system_prompt` consistently
- [x] 5.3 Implement cache → local LLM using the local generation path and the supplied original message snapshot
- [x] 5.4 Implement local → external LLM using server-side org LLM config and the authenticated org credential
- [x] 5.5 Implement external terminal case with `escalated_response=None` and `escalation_status="no_further_escalation"`
- [x] 5.6 Return `no_credential`, `provider_error`, or `timeout` statuses for expected external failures without surfacing 5xx responses
- [x] 5.7 Mark the parent interaction as escalation-attempted only when the duplicate guard has been acquired

## 6. Feedback Service Integration

- [x] 6.1 Preserve current ChromaDB score/deletion behavior for legacy cache feedback
- [x] 6.2 For interaction feedback, apply ChromaDB score/deletion only when the registry record has a cache `response_id`
- [x] 6.3 Log every feedback submission with org, department, rating, comment, cache `response_id` if present, and `interaction_id` if present
- [x] 6.4 When `rating == "negative"`, `interaction_id` is valid, and messages match, call the escalation service after feedback logging/score handling
- [x] 6.5 Return canonical escalation fields from the service to the router

## 7. Escalation Usage Logging

- [x] 7.1 Extend request logging or add a compatible log path for escalation-generated answers
- [x] 7.2 Log escalation generations with `source="feedback_escalation"`, `parent_interaction_id`, org, department, tier, model used, latency, and whether the call used an external provider
- [x] 7.3 Ensure logging failures do not affect the feedback response

## 8. Frontend And Proxy

- [x] 8.1 In `chat/app/api/chat/route.ts`, forward `X-DejaQ-Interaction-Id`, `X-DejaQ-Tier`, and existing DejaQ headers to the browser
- [x] 8.2 In the chat UI/store, store `interactionId`, `tier`, optional cache `responseId`, and the exact request-message snapshot on each assistant message
- [x] 8.3 On thumbs-down, send `interaction_id`, optional `response_id`, rating/comment, and the stored request-message snapshot to `POST /v1/feedback`
- [x] 8.4 In `chat/app/api/feedback/route.ts`, pass through `interaction_id`, `messages`, and escalation response fields
- [x] 8.5 Align frontend/proxy feedback timeout with the backend escalation timeout
- [x] 8.6 Show loading state while feedback escalation is in flight and prevent duplicate clicks for the same assistant message
- [x] 8.7 Append escalated answers as assistant messages labeled `Re-answered by local` or `Re-answered by external`, storing their returned metadata
- [x] 8.8 Show concise toast messages for `no_further_escalation`, `no_credential`, `provider_error`, `timeout`, `message_mismatch`, and `already_escalated`

## 9. Validation

- [x] 9.1 Verify existing legacy feedback tests still pass with exact response shapes
- [x] 9.2 Test cache-hit thumbs-down with valid interaction/messages → local answer returned
- [x] 9.3 Test local-answer thumbs-down with valid interaction/messages → external answer returned when credential exists
- [x] 9.4 Test external-answer thumbs-down → `no_further_escalation`
- [x] 9.5 Test missing credential → `no_credential`
- [x] 9.6 Test malformed messages, oversized messages, and message hash mismatch do not call an LLM
- [x] 9.7 Test forged client `tier` cannot force external escalation
- [x] 9.8 Test cross-org/cross-department interaction or cache IDs return authorization/namespace errors
- [x] 9.9 Test duplicate thumbs-down does not trigger duplicate LLM calls
- [x] 9.10 Verify `X-DejaQ-Interaction-Id` and `X-DejaQ-Tier` appear on cache/local/external × streaming/non-streaming answer responses

## 10. Follow-up Fixes

- [x] 10.1 Cache successful escalated answers when normal cache rules pass and return their optional cache `response_id`
- [x] 10.2 Persist and display returned feedback scores in the chat UI
- [x] 10.3 Preserve the full chat transcript when appending an escalated answer after thumbs-down
