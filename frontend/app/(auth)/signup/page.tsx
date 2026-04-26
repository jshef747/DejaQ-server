"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signUp(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "380px",
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "32px",
      }}
    >
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "var(--accent)",
              borderRadius: "5px",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "14px",
              color: "#1a0d00",
            }}
          >
            Dq
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px" }}>DejaQ</span>
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Create an account
        </h1>
        <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: "13px" }}>
          Start managing your LLM cost optimization
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--fg-dim)", marginBottom: "6px" }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-2)",
              borderRadius: "5px",
              color: "var(--fg)",
              padding: "8px 10px",
              fontSize: "13px",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--fg-dim)", marginBottom: "6px" }}>
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border-2)",
              borderRadius: "5px",
              color: "var(--fg)",
              padding: "8px 10px",
              fontSize: "13px",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")}
          />
        </div>

        {error && (
          <div
            style={{
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              borderRadius: "5px",
              padding: "8px 10px",
              color: "var(--red)",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "var(--bg-3)" : "var(--accent)",
            color: loading ? "var(--fg-dim)" : "#1a0d00",
            border: "none",
            borderRadius: "5px",
            padding: "9px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "4px",
          }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "var(--fg-dimmer)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
