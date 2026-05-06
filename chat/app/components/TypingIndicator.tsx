"use client";

// Animated three-dot indicator shown while waiting for the assistant's response.
export default function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        gap: "28px",
        justifyContent: "flex-start",
        padding: "0 24px 16px",
      }}
    >
      {/* Spacer that matches the avatar width in ChatMessage */}
      <div style={{ flexShrink: 0, width: "28px" }} />

      <div
        style={{
          alignItems: "center",
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: "12px 12px 12px 3px",
          display: "flex",
          gap: "5px",
          padding: "12px 16px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              background: "var(--fg-dimmer)",
              borderRadius: "50%",
              display: "block",
              height: "6px",
              width: "6px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
