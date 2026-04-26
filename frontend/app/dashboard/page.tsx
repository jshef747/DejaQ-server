import { createClient } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import Topbar from "@/components/Topbar";

async function getBackendStatus(): Promise<"connected" | "unavailable"> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await apiFetch("/health", { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok ? "connected" : "unavailable";
  } catch {
    return "unavailable";
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const backendStatus = await getBackendStatus();
  const connected = backendStatus === "connected";

  return (
    <>
      <Topbar section="Overview" />
      <div style={{ padding: "24px 28px", flex: 1 }}>
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: "0 0 6px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: "13px" }}>
            Signed in as{" "}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--fg)",
                fontSize: "12px",
              }}
            >
              {user?.email}
            </span>
          </p>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: connected ? "var(--green-bg)" : "var(--red-bg)",
            border: `1px solid ${connected ? "rgba(34,197,94,0.3)" : "var(--red-border)"}`,
            borderRadius: "6px",
            padding: "10px 14px",
            fontSize: "12px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: connected ? "var(--green)" : "var(--red)",
              boxShadow: connected ? "0 0 6px var(--green)" : "0 0 6px var(--red)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ color: connected ? "var(--green)" : "var(--red)", fontWeight: 500 }}>
            {connected ? "Backend connected" : "Backend unavailable"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--fg-dimmer)",
            }}
          >
            {process.env.NEXT_PUBLIC_API_BASE_URL ?? "—"}
          </span>
        </div>
      </div>
    </>
  );
}
