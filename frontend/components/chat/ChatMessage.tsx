"use client";

import { useState } from "react";
import type { FeedbackRating } from "@/lib/chat-api";

// The full feedback lifecycle for a single assistant message.
// "idle"/"error" are re-enabled states; "submitting" is in-flight; the rest are terminal.
export type FeedbackPhase = "idle" | "submitting" | "positive" | "negative" | "error";

export interface AppMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
  // Assistant-only fields:
  modelUsed?: string | null;
  responseId?: string | null;
  promptTokens?: number;
  completionTokens?: number;
  feedbackPhase?: FeedbackPhase;
}

interface Props {
  message: AppMessage;
  // Called by parent to trigger the API call and update feedbackPhase.
  onFeedback: (messageId: string, rating: FeedbackRating, comment: string) => Promise<void>;
}

export default function ChatMessage({ message, onFeedback }: Props) {
  const isUser = message.role === "user";
  const [draftRating, setDraftRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");

  const phase = message.feedbackPhase ?? "idle";

  function handleRatingClick(rating: FeedbackRating) {
    if (phase !== "idle" && phase !== "error") return;
    // Open the feedback panel with this rating pre-selected.
    setDraftRating(rating);
    // Signal parent to expand this message's feedback area.
    // We use a local expanded state to show the comment box.
  }

  async function handleSubmit() {
    if (!draftRating) return;
    await onFeedback(message.id, draftRating, comment);
    setComment("");
  }

  function handleCancel() {
    setDraftRating(null);
    setComment("");
  }

  const feedbackOpen = (phase === "idle" || phase === "error") && draftRating !== null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: "4px",
        padding: "0 24px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", maxWidth: "82%", flexDirection: isUser ? "row-reverse" : "row" }}>
        {/* Avatar */}
        <div
          style={{
            alignItems: "center",
            background: isUser ? "var(--accent-bg)" : "var(--bg-3)",
            border: `1px solid ${isUser ? "var(--accent-border)" : "var(--border)"}`,
            borderRadius: "50%",
            color: isUser ? "var(--accent)" : "var(--fg-dim)",
            display: "flex",
            flexShrink: 0,
            fontSize: "10px",
            fontWeight: 700,
            height: "28px",
            justifyContent: "center",
            width: "28px",
          }}
        >
          {isUser ? "U" : <BotIcon />}
        </div>

        {/* Bubble */}
        <div
          style={{
            background: isUser ? "var(--accent-bg)" : "var(--bg-2)",
            border: `1px solid ${isUser ? "var(--accent-border)" : "var(--border)"}`,
            borderRadius: isUser ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
            color: "var(--fg)",
            fontSize: "13px",
            lineHeight: 1.6,
            padding: "10px 14px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </div>
      </div>

      {/* Metadata row — model badge + timestamp */}
      {!isUser && (
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            paddingLeft: "38px", // align under bubble (avatar 28px + gap 10px)
          }}
        >
          {message.modelUsed && (
            <span
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--fg-dimmer)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                padding: "2px 6px",
              }}
            >
              {message.modelUsed}
            </span>
          )}
          {(message.promptTokens !== undefined || message.completionTokens !== undefined) && (
            <span style={{ color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
              {(message.promptTokens ?? 0) + (message.completionTokens ?? 0)} tok
            </span>
          )}
          <span style={{ color: "var(--fg-dimmer)", fontSize: "10px" }}>
            {formatTs(message.ts)}
          </span>
        </div>
      )}

      {/* Feedback row — only for assistant messages that have a response ID */}
      {!isUser && message.responseId && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "38px" }}>
          {/* Rating buttons */}
          <div style={{ alignItems: "center", display: "flex", gap: "4px" }}>
            {(phase === "idle" || phase === "error" || phase === "submitting") && (
              <>
                <button
                  onClick={() => handleRatingClick("positive")}
                  disabled={phase === "submitting"}
                  title="Helpful"
                  style={thumbBtn(draftRating === "positive", "positive", phase === "submitting")}
                >
                  <ThumbUpIcon />
                </button>
                <button
                  onClick={() => handleRatingClick("negative")}
                  disabled={phase === "submitting"}
                  title="Not helpful"
                  style={thumbBtn(draftRating === "negative", "negative", phase === "submitting")}
                >
                  <ThumbDownIcon />
                </button>
              </>
            )}
            {phase === "positive" && (
              <span style={feedbackDoneStyle("positive")}>
                <ThumbUpIcon /> Helpful — thanks!
              </span>
            )}
            {phase === "negative" && (
              <span style={feedbackDoneStyle("negative")}>
                <ThumbDownIcon /> Noted — thanks for the feedback.
              </span>
            )}
            {phase === "error" && draftRating === null && (
              <span style={{ color: "var(--red)", fontSize: "11px" }}>Feedback failed — try again.</span>
            )}
          </div>

          {/* Inline comment area — appears when a rating is selected but not yet submitted */}
          {feedbackOpen && (
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxWidth: "360px",
                padding: "10px 12px",
              }}
            >
              <span style={{ color: "var(--fg-dim)", fontSize: "11px" }}>
                Rating: <strong style={{ color: draftRating === "positive" ? "var(--green)" : "var(--red)" }}>
                  {draftRating === "positive" ? "Helpful" : "Not helpful"}
                </strong>
                {" · "}Add an optional note:
              </span>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What could be improved? (optional)"
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border-2)",
                  borderRadius: "4px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  lineHeight: 1.5,
                  outline: "none",
                  padding: "6px 8px",
                  resize: "none",
                  width: "100%",
                }}
              />
              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                <button onClick={handleCancel} style={btn("secondary")}>
                  Cancel
                </button>
                <button onClick={handleSubmit} style={btn("primary")}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timestamp for user messages */}
      {isUser && (
        <span style={{ color: "var(--fg-dimmer)", fontSize: "10px", paddingRight: "38px" }}>
          {formatTs(message.ts)}
        </span>
      )}
    </div>
  );
}

function formatTs(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function thumbBtn(active: boolean, rating: FeedbackRating, disabled: boolean): React.CSSProperties {
  const isPositive = rating === "positive";
  return {
    alignItems: "center",
    background: active
      ? isPositive ? "var(--green-bg)" : "var(--red-bg)"
      : "var(--bg-3)",
    border: `1px solid ${active
      ? isPositive ? "rgba(34,197,94,0.3)" : "var(--red-border)"
      : "var(--border)"}`,
    borderRadius: "4px",
    color: active
      ? isPositive ? "var(--green)" : "var(--red)"
      : "var(--fg-dimmer)",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    gap: "4px",
    opacity: disabled ? 0.5 : 1,
    padding: "3px 7px",
  };
}

function feedbackDoneStyle(rating: FeedbackRating): React.CSSProperties {
  const ok = rating === "positive";
  return {
    alignItems: "center",
    background: ok ? "var(--green-bg)" : "var(--red-bg)",
    border: `1px solid ${ok ? "rgba(34,197,94,0.3)" : "var(--red-border)"}`,
    borderRadius: "4px",
    color: ok ? "var(--green)" : "var(--red)",
    display: "flex",
    fontSize: "11px",
    gap: "5px",
    padding: "3px 8px",
  };
}

function btn(kind: "primary" | "secondary"): React.CSSProperties {
  const base = { borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: 500, padding: "5px 10px" };
  if (kind === "primary")
    return { ...base, background: "var(--accent)", border: "1px solid var(--accent)", color: "#1a0d00" };
  return { ...base, background: "var(--bg-3)", border: "1px solid var(--border-2)", color: "var(--fg-dim)" };
}

function BotIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="12" height="10" rx="2" />
      <circle cx="5.5" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="9" r="1" fill="currentColor" stroke="none" />
      <path d="M6 12h4M8 4V2M6 2h4" strokeLinecap="round" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 9V15H2a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3zm0 0L8 1l.5-.5A1.5 1.5 0 0 1 11 2v2h3.5a1 1 0 0 1 .97 1.24L14 11a1 1 0 0 1-.97.76H5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 7V1h3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-3zm0 0L8 15l-.5.5A1.5 1.5 0 0 1 5 14v-2H1.5a1 1 0 0 1-.97-1.24L2 5a1 1 0 0 1 .97-.76H11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
