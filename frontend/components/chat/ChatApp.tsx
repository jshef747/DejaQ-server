"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sendChatMessage, sendFeedback, isApiError, type FeedbackRating } from "@/lib/chat-api";
import { loadSettings, persistSettings, type ChatSettings } from "@/lib/chat-store";
import ChatMessage, { type AppMessage, type FeedbackPhase } from "@/components/chat/ChatMessage";
import MessageInput from "@/components/chat/MessageInput";
import SettingsModal from "@/components/chat/SettingsModal";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ToastStack, { type ToastData } from "@/components/chat/Toast";

const WELCOME_PROMPTS = [
  "What are the main benefits of semantic caching for LLM APIs?",
  "Explain how transformer attention mechanisms work.",
  "What's the difference between RAG and fine-tuning?",
  "Summarize the trade-offs between local and cloud LLM inference.",
];

let msgCounter = 0;
function newId() {
  return `msg_${++msgCounter}_${Date.now()}`;
}

export default function ChatApp() {
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({ apiKey: "", deptSlug: "", apiBaseUrl: "" });
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load settings from localStorage on first render.
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Scroll to the newest message whenever messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Open settings automatically if no API key is configured.
  useEffect(() => {
    if (!settings.apiKey) setSettingsOpen(true);
  }, [settings.apiKey]);

  function addToast(kind: ToastData["kind"], message: string) {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, kind, message }]);
  }

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  function saveSettings(next: ChatSettings) {
    persistSettings(next);
    setSettings(next);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    if (!settings.apiKey) {
      addToast("error", "Paste your organization API key in Settings to start chatting.");
      setSettingsOpen(true);
      return;
    }

    // Append the user message immediately so the UI feels responsive.
    const userMsg: AppMessage = { id: newId(), role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build the conversation history to send (role + content only — no metadata).
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    const result = await sendChatMessage(history, settings.apiKey, settings.deptSlug);
    setIsLoading(false);

    if (isApiError(result)) {
      addToast("error", result.message);
      // Remove the optimistically added user message on hard errors so the
      // user can retry without duplicating it.
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(text);
      return;
    }

    const assistantMsg: AppMessage = {
      id: newId(),
      role: "assistant",
      content: result.text,
      ts: Date.now(),
      modelUsed: result.modelUsed,
      responseId: result.responseId,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      feedbackPhase: "idle",
    };
    setMessages((prev) => [...prev, assistantMsg]);
  }

  function updateFeedbackPhase(msgId: string, phase: FeedbackPhase) {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedbackPhase: phase } : m))
    );
  }

  async function handleFeedback(msgId: string, rating: FeedbackRating, comment: string) {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.responseId) return;

    updateFeedbackPhase(msgId, "submitting");

    const result = await sendFeedback(
      msg.responseId,
      rating,
      comment,
      settings.apiKey,
      settings.deptSlug,
    );

    if (isApiError(result)) {
      updateFeedbackPhase(msgId, "error");
      addToast("error", `Feedback failed: ${result.message}`);
      return;
    }

    updateFeedbackPhase(msgId, rating);

    if (result.status === "deleted") {
      addToast("info", "Feedback recorded — the cached response was removed.");
    } else {
      addToast("success", `Feedback recorded. New score: ${result.newScore?.toFixed(1) ?? "—"}`);
    }
  }

  function handleClear() {
    if (messages.length === 0) return;
    setMessages([]);
  }

  function handleWelcomePrompt(prompt: string) {
    setInput(prompt);
  }

  const hasApiKey = Boolean(settings.apiKey);

  return (
    <div
      style={{
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          alignItems: "center",
          background: "#181818",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          flexShrink: 0,
          gap: "10px",
          padding: "0 20px",
          height: "48px",
        }}
      >
        {/* Logo */}
        <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
          <div
            style={{
              alignItems: "center",
              background: "var(--accent)",
              borderRadius: "4px",
              color: "#0a0a0a",
              display: "flex",
              flexShrink: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 700,
              height: "22px",
              justifyContent: "center",
              letterSpacing: "-1px",
              width: "22px",
            }}
          >
            Dq
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>DejaQ Chat</span>
        </div>

        {/* Connection status badge */}
        <div
          style={{
            alignItems: "center",
            background: hasApiKey ? "var(--green-bg)" : "var(--red-bg)",
            border: `1px solid ${hasApiKey ? "rgba(34,197,94,0.3)" : "var(--red-border)"}`,
            borderRadius: "4px",
            color: hasApiKey ? "var(--green)" : "var(--red)",
            display: "flex",
            fontSize: "11px",
            gap: "5px",
            padding: "3px 8px",
          }}
        >
          <span
            style={{
              background: hasApiKey ? "var(--green)" : "var(--red)",
              borderRadius: "50%",
              display: "inline-block",
              height: "5px",
              width: "5px",
            }}
          />
          {hasApiKey ? `Connected${settings.deptSlug ? ` · ${settings.deptSlug}` : ""}` : "No API key"}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            title="Clear conversation"
            style={iconBtn()}
          >
            <TrashIcon />
            <span>Clear</span>
          </button>
        )}
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          style={iconBtn()}
        >
          <SettingsGearIcon />
          <span>Settings</span>
        </button>
        <Link
          href="/dashboard"
          style={{
            ...iconBtn(),
            color: "var(--fg-dim)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
          title="Go to Dashboard"
        >
          <DashboardIcon />
          <span>Dashboard</span>
        </Link>
      </header>

      {/* ── Message list ── */}
      <main
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          overflowY: "auto",
          paddingTop: "16px",
        }}
      >
        {messages.length === 0 ? (
          <WelcomeScreen
            hasApiKey={hasApiKey}
            onOpenSettings={() => setSettingsOpen(true)}
            onSelectPrompt={handleWelcomePrompt}
          />
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onFeedback={handleFeedback}
              />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </main>

      {/* ── Input area ── */}
      <MessageInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isLoading}
      />

      {/* ── Overlays ── */}
      <SettingsModal
        open={settingsOpen}
        initialSettings={settings}
        onSave={saveSettings}
        onClose={() => setSettingsOpen(false)}
      />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// ─── Welcome screen ────────────────────────────────────────────────────────

function WelcomeScreen({
  hasApiKey,
  onOpenSettings,
  onSelectPrompt,
}: {
  hasApiKey: boolean;
  onOpenSettings: () => void;
  onSelectPrompt: (p: string) => void;
}) {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: "28px",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      {/* Hero */}
      <div style={{ maxWidth: "460px", textAlign: "center" }}>
        <div
          style={{
            alignItems: "center",
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            borderRadius: "12px",
            display: "inline-flex",
            justifyContent: "center",
            marginBottom: "16px",
            padding: "14px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="8" width="28" height="18" rx="4" stroke="var(--accent)" strokeWidth="2" />
            <circle cx="10" cy="17" r="2" fill="var(--accent)" />
            <circle cx="22" cy="17" r="2" fill="var(--accent)" />
            <path d="M16 8V4M12 4h8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 8px" }}>
          Welcome to DejaQ Chat
        </h1>
        <p style={{ color: "var(--fg-dim)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
          Your queries are semantically cached and intelligently routed — easy questions go local, hard
          ones reach your configured external provider. Repeated questions get instant cached answers.
        </p>
      </div>

      {/* API key warning */}
      {!hasApiKey && (
        <div
          style={{
            alignItems: "center",
            background: "var(--amber-bg)",
            border: "1px solid var(--amber-border)",
            borderRadius: "8px",
            color: "var(--amber)",
            display: "flex",
            gap: "10px",
            maxWidth: "460px",
            padding: "12px 16px",
            width: "100%",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
            <path d="M8 1L15 14H1L8 1z" /><path d="M8 6v3.5M8 11.5v.5" strokeLinecap="round" />
          </svg>
          <span style={{ flex: 1, fontSize: "12px", lineHeight: 1.45 }}>
            No API key configured. Add your organization API key to start chatting.
          </span>
          <button
            onClick={onOpenSettings}
            style={{
              background: "var(--amber-bg)",
              border: "1px solid var(--amber-border)",
              borderRadius: "4px",
              color: "var(--amber)",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 500,
              padding: "5px 10px",
              whiteSpace: "nowrap",
            }}
          >
            Open Settings
          </button>
        </div>
      )}

      {/* Example prompts */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "460px", width: "100%" }}>
        <p style={{ color: "var(--fg-dimmer)", fontSize: "11px", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Try asking
        </p>
        {WELCOME_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPrompt(prompt)}
            disabled={!hasApiKey}
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: hasApiKey ? "var(--fg)" : "var(--fg-dimmer)",
              cursor: hasApiKey ? "pointer" : "not-allowed",
              fontSize: "13px",
              lineHeight: 1.5,
              padding: "10px 14px",
              textAlign: "left",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (hasApiKey) {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-3)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-2)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shared style helpers ──────────────────────────────────────────────────

function iconBtn(): React.CSSProperties {
  return {
    alignItems: "center",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "5px",
    color: "var(--fg-dim)",
    cursor: "pointer",
    display: "flex",
    fontSize: "12px",
    gap: "5px",
    padding: "4px 8px",
  };
}

// ─── Header icons ──────────────────────────────────────────────────────────

function SettingsGearIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}
