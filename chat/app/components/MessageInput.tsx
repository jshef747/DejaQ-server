"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export default function MessageInput({ value, onChange, onSend, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea up to a reasonable max height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter alone sends; Shift+Enter inserts a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  }

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div
      style={{
        background: "var(--bg-2)",
        borderTop: "1px solid var(--border)",
        padding: "12px 16px",
      }}
    >
      <div
        style={{
          alignItems: "flex-end",
          background: "var(--bg)",
          border: "1px solid var(--border-2)",
          borderRadius: "8px",
          display: "flex",
          gap: "8px",
          padding: "8px 8px 8px 14px",
          transition: "border-color 0.15s",
        }}
        onFocusCapture={(e) =>
          (e.currentTarget.style.borderColor = "var(--accent-border)")
        }
        onBlurCapture={(e) =>
          (e.currentTarget.style.borderColor = "var(--border-2)")
        }
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Waiting for response…" : "Ask anything… (Enter to send, Shift+Enter for new line)"}
          rows={1}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--fg)",
            flex: 1,
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            lineHeight: 1.5,
            maxHeight: "200px",
            outline: "none",
            padding: 0,
            resize: "none",
          }}
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          title="Send (Enter)"
          style={{
            alignItems: "center",
            background: canSend ? "var(--accent)" : "var(--bg-3)",
            border: "none",
            borderRadius: "6px",
            color: canSend ? "#1a0d00" : "var(--fg-dimmer)",
            cursor: canSend ? "pointer" : "not-allowed",
            display: "flex",
            flexShrink: 0,
            height: "30px",
            justifyContent: "center",
            transition: "background 0.15s",
            width: "30px",
          }}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
      <p
        style={{
          color: "var(--fg-dim)",
          fontSize: "11px",
          margin: "6px 2px 0",
          textAlign: "center",
        }}
      >
        DejaQ may make mistakes. Verify important information.
      </p>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5l-3-5.5L1.5 6l13-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
