interface ComingSoonProps {
  section: string;
}

export default function ComingSoon({ section }: ComingSoonProps) {
  return (
    <div
      style={{
        padding: "24px 28px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: "0 0 4px",
          }}
        >
          {section}
        </h1>
        <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: "13px" }}>
          Manage your {section.toLowerCase()} here.
        </p>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "12px 16px",
          fontSize: "12px",
          color: "var(--fg-dim)",
          alignSelf: "flex-start",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--fg-dimmer)",
            background: "var(--bg-3)",
            padding: "2px 6px",
            borderRadius: "3px",
            border: "1px solid var(--border-2)",
          }}
        >
          coming soon
        </span>
        This section is under construction.
      </div>
    </div>
  );
}
