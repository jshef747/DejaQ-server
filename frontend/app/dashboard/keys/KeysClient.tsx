"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { generateKey, revokeKey } from "@/app/actions/keys";
import type { ApiKeyCreated, ApiKeyItem } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

interface Props {
  orgSlug: string;
  keys: ApiKeyItem[];
  error: string | null;
}

export default function KeysClient({ orgSlug, keys, error }: Props) {
  const router = useRouter();

  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateBusy, setGenerateBusy] = useState(false);
  const [generateErr, setGenerateErr] = useState<string | null>(null);
  const [generateConflict, setGenerateConflict] = useState(false);

  const [newKey, setNewKey] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);

  const [confirmRevokeId, setConfirmRevokeId] = useState<number | null>(null);
  const [revokeBusy, setRevokeBusy] = useState(false);
  const [revokeErr, setRevokeErr] = useState<string | null>(null);

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  async function handleGenerate(force = false) {
    setGenerateBusy(true);
    setGenerateErr(null);
    setGenerateConflict(false);
    const res = await generateKey(orgSlug, force);
    setGenerateBusy(false);
    if (!res.ok) {
      setGenerateErr(res.error);
      if (res.conflict) setGenerateConflict(true);
      return;
    }
    setGenerateOpen(false);
    setNewKey(res.key);
  }

  async function handleRevoke(keyId: number) {
    setRevokeBusy(true);
    setRevokeErr(null);
    const res = await revokeKey(keyId);
    setRevokeBusy(false);
    if (!res.ok) { setRevokeErr(res.error); return; }
    setConfirmRevokeId(null);
    router.refresh();
  }

  function openGenerate() {
    setGenerateErr(null);
    setGenerateConflict(false);
    setGenerateOpen(true);
  }

  async function handleCopy() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeReveal() {
    setNewKey(null);
    setCopied(false);
    router.refresh();
  }

  const confirmRevokeKey = keys.find((k) => k.id === confirmRevokeId);

  return (
    <div style={{ padding: "24px 28px", flex: 1 }}>
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
            API Keys
          </h1>
          <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: "12px" }}>
            Org:{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg)", fontSize: "11px" }}>
              {orgSlug}
            </span>
          </p>
        </div>
        <button
          onClick={openGenerate}
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            borderRadius: "5px",
            color: "var(--accent)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
            padding: "7px 14px",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.2)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent-bg)")}
        >
          + Generate key
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "var(--red-bg)",
            border: "1px solid var(--red-border)",
            borderRadius: "6px",
            color: "var(--red)",
            fontSize: "12px",
            marginBottom: "16px",
            padding: "10px 14px",
          }}
        >
          {error}
        </div>
      )}

      {revokeErr && (
        <div
          style={{
            background: "var(--red-bg)",
            border: "1px solid var(--red-border)",
            borderRadius: "6px",
            color: "var(--red)",
            fontSize: "12px",
            marginBottom: "16px",
            padding: "10px 14px",
          }}
        >
          {revokeErr}
        </div>
      )}

      {keys.length === 0 && !error ? (
        <div
          style={{
            alignItems: "center",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--fg-dim)",
            display: "flex",
            flexDirection: "column",
            fontSize: "12px",
            gap: "14px",
            padding: "32px 18px",
            textAlign: "center",
          }}
        >
          <span>No API keys yet — generate one to start using the gateway.</span>
          <button
            onClick={openGenerate}
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: "5px",
              color: "var(--accent)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
              padding: "7px 14px",
            }}
          >
            + Generate key
          </button>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}>
                {["Key", "Created", "Status", ""].map((col, i) => (
                  <th
                    key={i}
                    style={{
                      color: "var(--fg-dimmer)",
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      padding: "8px 14px",
                      textAlign: "left",
                      textTransform: "uppercase",
                      width: col === "" ? "40px" : undefined,
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => {
                const isHovered = key.id === hoveredId;
                const isRevoked = key.revoked_at !== null;
                return (
                  <tr
                    key={key.id}
                    onMouseEnter={() => setHoveredId(key.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: isHovered ? "var(--bg-3)" : "transparent",
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.1s",
                    }}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          color: "var(--fg)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                        }}
                      >
                        {key.token_prefix}
                      </span>
                    </td>
                    <td style={{ color: "var(--fg-dim)", fontSize: "12px", padding: "10px 14px" }}>
                      {fmt.format(new Date(key.created_at))}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={
                          isRevoked
                            ? {
                                background: "var(--bg-3)",
                                border: "1px solid var(--border-2)",
                                borderRadius: "4px",
                                color: "var(--fg-dimmer)",
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                padding: "2px 7px",
                              }
                            : {
                                background: "var(--accent-bg)",
                                border: "1px solid var(--accent-border)",
                                borderRadius: "4px",
                                color: "var(--accent)",
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                padding: "2px 7px",
                              }
                        }
                      >
                        {isRevoked ? "revoked" : "active"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <button
                        onClick={() => {
                          setRevokeErr(null);
                          setConfirmRevokeId(key.id);
                        }}
                        disabled={isRevoked}
                        title={isRevoked ? "Already revoked" : "Revoke key"}
                        style={{
                          background: "none",
                          border: "none",
                          borderRadius: "4px",
                          color: isHovered && !isRevoked ? "var(--red)" : "var(--fg-dimmer)",
                          cursor: isRevoked ? "not-allowed" : "pointer",
                          fontSize: "13px",
                          opacity: isRevoked ? 0.3 : isHovered ? 1 : 0,
                          padding: "2px 6px",
                          transition: "opacity 0.1s, color 0.1s",
                        }}
                        aria-label={`Revoke key ${key.token_prefix}`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate modal */}
      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate API key">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ color: "var(--fg-dim)", fontSize: "12px", margin: 0 }}>
            Generate a new API key for{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg)", fontSize: "11px" }}>
              {orgSlug}
            </span>
            . The full key will be shown once — copy it before closing.
          </p>

          {generateConflict && (
            <div
              style={{
                background: "var(--red-bg)",
                border: "1px solid var(--red-border)",
                borderRadius: "5px",
                color: "var(--red)",
                fontSize: "12px",
                padding: "10px 12px",
              }}
            >
              An active key already exists for this org.{" "}
              <button
                onClick={() => handleGenerate(true)}
                disabled={generateBusy}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--red)",
                  cursor: generateBusy ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Rotate (revoke & replace)
              </button>
            </div>
          )}

          {generateErr && !generateConflict && (
            <p style={{ color: "var(--red)", fontSize: "11px", margin: 0 }}>{generateErr}</p>
          )}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setGenerateOpen(false)}
              disabled={generateBusy}
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border-2)",
                borderRadius: "5px",
                color: "var(--fg-dim)",
                cursor: generateBusy ? "not-allowed" : "pointer",
                fontSize: "12px",
                opacity: generateBusy ? 0.5 : 1,
                padding: "6px 12px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={generateBusy}
              style={{
                background: "var(--accent-bg)",
                border: "1px solid var(--accent-border)",
                borderRadius: "5px",
                color: "var(--accent)",
                cursor: generateBusy ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: 500,
                opacity: generateBusy ? 0.7 : 1,
                padding: "6px 12px",
              }}
            >
              {generateBusy ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reveal modal */}
      <Modal open={newKey !== null} onClose={closeReveal} title="Your new API key" widthPx={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              borderRadius: "5px",
              color: "var(--red)",
              fontSize: "12px",
              padding: "10px 12px",
            }}
          >
            This is the only time this key will be shown. Copy it now — you cannot retrieve it later.
          </div>

          <div
            style={{
              alignItems: "center",
              background: "var(--bg-3)",
              border: "1px solid var(--border-2)",
              borderRadius: "5px",
              display: "flex",
              gap: "10px",
              padding: "10px 12px",
            }}
          >
            <code
              style={{
                color: "var(--fg)",
                flex: 1,
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                overflowWrap: "break-word",
                userSelect: "all",
                wordBreak: "break-all",
              }}
            >
              {newKey?.token}
            </code>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? "rgba(34,197,94,0.12)" : "var(--bg-2)",
                border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "var(--border-2)"}`,
                borderRadius: "4px",
                color: copied ? "#22c55e" : "var(--fg-dim)",
                cursor: "pointer",
                flexShrink: 0,
                fontSize: "11px",
                padding: "4px 10px",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={closeReveal}
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border-2)",
                borderRadius: "5px",
                color: "var(--fg-dim)",
                cursor: "pointer",
                fontSize: "12px",
                padding: "6px 12px",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Revoke confirm */}
      <ConfirmDialog
        open={!!confirmRevokeId}
        title="Revoke API key"
        message={`Revoke key ${confirmRevokeKey?.token_prefix ?? ""}? It will stop working immediately and cannot be re-activated.`}
        confirmLabel="Revoke"
        destructive
        busy={revokeBusy}
        onCancel={() => setConfirmRevokeId(null)}
        onConfirm={() => confirmRevokeId !== null && handleRevoke(confirmRevokeId)}
      />
    </div>
  );
}
