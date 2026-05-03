"use client";

import { useEffect, useRef, useState } from "react";
import { checkServerHealth, fetchDepartments, isApiError, type Department } from "./chat-api";
import type { ChatSettings, ModelProfile, RoutingMode } from "./chat-store";

interface Props {
  open: boolean;
  initialSettings: ChatSettings;
  onSave: (settings: ChatSettings) => void;
  onClose: () => void;
}

type HealthStatus = "idle" | "checking" | "ok" | "error";
type DeptLoadStatus = "idle" | "loading" | "loaded" | "error";

export default function SettingsModal({ open, initialSettings, onSave, onClose }: Props) {
  const [apiKey, setApiKey] = useState(initialSettings.apiKey);
  const [deptSlug, setDeptSlug] = useState(initialSettings.deptSlug);
  const [apiBaseUrl, setApiBaseUrl] = useState(initialSettings.apiBaseUrl);
  const [modelProfile, setModelProfile] = useState<ModelProfile>(initialSettings.modelProfile);
  const [routingMode, setRoutingMode] = useState<RoutingMode>(initialSettings.routingMode);
  const [health, setHealth] = useState<HealthStatus>("idle");
  const [healthText, setHealthText] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptStatus, setDeptStatus] = useState<DeptLoadStatus>("idle");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const deptFetchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset local state whenever the modal opens with fresh initial values.
  useEffect(() => {
    if (!open) return;
    setApiKey(initialSettings.apiKey);
    setDeptSlug(initialSettings.deptSlug);
    setApiBaseUrl(initialSettings.apiBaseUrl);
    setModelProfile(initialSettings.modelProfile);
    setRoutingMode(initialSettings.routingMode);
    setHealth("idle");
    setHealthText("");
    setDepartments([]);
    setDeptStatus("idle");
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [
    open,
    initialSettings.apiKey,
    initialSettings.deptSlug,
    initialSettings.apiBaseUrl,
    initialSettings.modelProfile,
    initialSettings.routingMode,
  ]);

  // Load departments whenever the API key (or base URL) changes — debounced 600ms.
  useEffect(() => {
    if (deptFetchRef.current) clearTimeout(deptFetchRef.current);
    if (!apiKey.trim()) {
      setDepartments([]);
      setDeptStatus("idle");
      setDeptSlug("");
      return;
    }
    setDeptStatus("loading");
    deptFetchRef.current = setTimeout(async () => {
      const result = await fetchDepartments(apiKey.trim(), apiBaseUrl.trim());
      if (isApiError(result)) {
        setDepartments([]);
        setDeptStatus("error");
        setDeptSlug("");
      } else {
        setDepartments(result);
        setDeptStatus("loaded");
        // Keep the previous selection only if it still exists in the new list.
        setDeptSlug((prev) =>
          result.some((d) => d.slug === prev) ? prev : result[0]?.slug ?? ""
        );
      }
    }, 600);
    return () => {
      if (deptFetchRef.current) clearTimeout(deptFetchRef.current);
    };
  }, [apiKey, apiBaseUrl]);

  // Close on Escape key.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleTest() {
    setHealth("checking");
    setHealthText("");
    const result = await checkServerHealth();
    if (result.reachable) {
      setHealth("ok");
      setHealthText(`Connected — Celery: ${result.celery}`);
    } else {
      setHealth("error");
      setHealthText("Cannot reach the server. Check the API base URL.");
    }
  }

  function handleSave() {
    onSave({
      apiKey: apiKey.trim(),
      deptSlug: deptSlug.trim(),
      apiBaseUrl: apiBaseUrl.trim(),
      modelProfile,
      routingMode,
    });
    onClose();
  }

  const canSave = apiKey.trim().length > 0 && deptSlug.trim().length > 0;

  if (!open) return null;

  const defaultBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

  return (
    // Backdrop — clicking outside the card closes the modal.
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        alignItems: "center",
        backdropFilter: "blur(2px)",
        background: "rgba(0,0,0,0.6)",
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        left: 0,
        position: "fixed",
        right: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Modal card */}
      <div
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-2)",
          borderRadius: "10px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          maxWidth: "460px",
          width: "calc(100vw - 40px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            alignItems: "center",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            padding: "16px 20px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>Connection Settings</h2>
            <p style={{ color: "var(--fg-dim)", fontSize: "12px", margin: "2px 0 0" }}>
              Settings are saved locally in your browser.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "4px",
              color: "var(--fg-dimmer)",
              cursor: "pointer",
              fontSize: "16px",
              marginLeft: "auto",
              padding: "2px 6px",
            }}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
          <Field
            label="Organization API Key"
            hint="Required — Bearer token for /v1/chat/completions"
          >
            <input
              ref={firstInputRef}
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="dq_..."
              style={inputStyle}
              autoComplete="off"
            />
          </Field>

          {/* Department selector */}
          <Field
            label={
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                Department
                <span style={{ color: "var(--red)", fontSize: "11px" }}>required</span>
                {deptStatus === "loading" && (
                  <span style={{ color: "var(--fg-dimmer)", fontSize: "11px" }}>Loading…</span>
                )}
                {deptStatus === "error" && (
                  <span style={{ color: "var(--red)", fontSize: "11px" }}>Could not load</span>
                )}
              </span>
            }
            hint="Select the department whose cache namespace you want to use"
          >
            <select
              value={deptSlug}
              onChange={(e) => setDeptSlug(e.target.value)}
              disabled={deptStatus === "loading" || !apiKey.trim()}
              style={{
                ...inputStyle,
                cursor: deptStatus === "loading" || !apiKey.trim() ? "not-allowed" : "pointer",
                opacity: deptStatus === "loading" || !apiKey.trim() ? 0.55 : 1,
              }}
            >
              {departments.length === 0 ? (
                <option value="">--</option>
              ) : (
                departments.map((d) => (
                  <option key={d.id} value={d.slug}>
                    {d.label} ({d.slug})
                  </option>
                ))
              )}
            </select>
          </Field>

          <Field
            label="API Base URL"
            hint={`Optional — overrides the default (${defaultBase})`}
          >
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder={defaultBase}
              style={inputStyle}
              autoComplete="off"
            />
          </Field>

          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "12px",
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <div style={{ color: "var(--fg)", fontSize: "12px", fontWeight: 600 }}>
                Temporary developer overrides
              </div>
              <div style={{ color: "var(--fg-dimmer)", fontSize: "11px", lineHeight: 1.45, marginTop: "3px" }}>
                Browser-only controls for CPU-only testing.
              </div>
            </div>
            <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr" }}>
              <Field
                label="Local model profile"
                hint="Weak CPU uses Qwen 0.5B for local roles"
              >
                <select
                  value={modelProfile}
                  onChange={(e) => setModelProfile(e.target.value as ModelProfile)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="default">Default</option>
                  <option value="weak_cpu">Weak CPU Test</option>
                </select>
              </Field>
              <Field
                label="Routing mode"
                hint="Forced modes skip the classifier"
              >
                <select
                  value={routingMode}
                  onChange={(e) => setRoutingMode(e.target.value as RoutingMode)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="auto">Auto</option>
                  <option value="easy_local">Force Easy/Local</option>
                  <option value="hard_external">Force Hard/External</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Connection test */}
          <div
            style={{
              alignItems: "center",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              display: "flex",
              gap: "10px",
              padding: "10px 14px",
            }}
          >
            <div style={{ flex: 1 }}>
              {health === "idle" && (
                <span style={{ color: "var(--fg-dimmer)", fontSize: "12px" }}>
                  Test connectivity to the DejaQ server.
                </span>
              )}
              {health === "checking" && (
                <span style={{ color: "var(--fg-dim)", fontSize: "12px" }}>Checking…</span>
              )}
              {health === "ok" && (
                <span style={{ color: "var(--green)", fontSize: "12px" }}>✓ {healthText}</span>
              )}
              {health === "error" && (
                <span style={{ color: "var(--red)", fontSize: "12px" }}>✗ {healthText}</span>
              )}
            </div>
            <button
              onClick={handleTest}
              disabled={health === "checking"}
              style={btn("secondary", health === "checking")}
            >
              {health === "checking" ? "Testing…" : "Test connection"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            padding: "14px 20px",
          }}
        >
          <button onClick={onClose} style={btn("secondary")}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            title={!canSave ? "API key and department are required" : undefined}
            style={btn("primary", !canSave)}
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span style={{ color: "var(--fg)", fontSize: "12px", fontWeight: 500 }}>{label}</span>
      {children}
      <span style={{ color: "var(--fg-dimmer)", fontSize: "11px" }}>{hint}</span>
    </label>
  );
}

function btn(kind: "primary" | "secondary", disabled = false) {
  const base = {
    borderRadius: "5px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "12px",
    fontWeight: 500,
    opacity: disabled ? 0.55 : 1,
    padding: "7px 14px",
    whiteSpace: "nowrap" as const,
  };
  if (kind === "primary")
    return { ...base, background: "var(--accent)", border: "1px solid var(--accent)", color: "#1a0d00" };
  return { ...base, background: "var(--bg-3)", border: "1px solid var(--border-2)", color: "var(--fg-dim)" };
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border-2)",
  borderRadius: "5px",
  color: "var(--fg)",
  fontFamily: "var(--font-sans)",
  fontSize: "13px",
  outline: "none",
  padding: "8px 10px",
  width: "100%",
};
