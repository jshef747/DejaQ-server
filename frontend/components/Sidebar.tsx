"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/dashboard/organizations", label: "Organizations", icon: OrgIcon },
  { href: "/dashboard/departments", label: "Departments", icon: DeptIcon },
  { href: "/dashboard/keys", label: "API Keys", icon: KeyIcon },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
  { href: "/dashboard/chat", label: "Chat Demo", icon: ChatIcon },
];

interface SidebarProps {
  email: string;
}

export default function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <aside
      style={{
        background: "#181818",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "14px 10px",
        gap: "2px",
        position: "sticky",
        top: 0,
        height: "100vh",
        width: "220px",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px 14px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            background: "var(--accent)",
            color: "#0a0a0a",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            display: "grid",
            placeItems: "center",
            borderRadius: "4px",
            fontSize: "11px",
            letterSpacing: "-1px",
            flexShrink: 0,
          }}
        >
          Dq
        </div>
        <span style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "-0.02em" }}>
          DejaQ
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--fg-dimmer)",
            marginLeft: "auto",
            padding: "2px 6px",
            border: "1px solid var(--border)",
            borderRadius: "3px",
          }}
        >
          v0
        </span>
      </div>

      {/* Org switcher */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 8px",
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: "5px",
          marginBottom: "10px",
          cursor: "pointer",
          width: "100%",
          color: "var(--fg)",
          textAlign: "left",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg-3)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg-2)")
        }
      >
        <span
          style={{
            width: "14px",
            height: "14px",
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            borderRadius: "3px",
            display: "grid",
            placeItems: "center",
            color: "var(--accent)",
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          D
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          demo-org
        </span>
        <ChevIcon />
      </button>

      {/* Nav section label */}
      <div
        style={{
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--fg-dimmer)",
          padding: "10px 8px 4px",
          fontWeight: 500,
        }}
      >
        Workspace
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 8px",
              borderRadius: "5px",
              color: isActive ? "var(--fg)" : "var(--fg-dim)",
              background: isActive ? "var(--bg-3)" : "transparent",
              fontSize: "13px",
              textDecoration: "none",
              fontWeight: 400,
              transition: "background 0.1s, color 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-3)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--fg)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--fg-dim)";
              }
            }}
          >
            <Icon
              size={14}
              style={{ color: isActive ? "var(--accent)" : undefined, flexShrink: 0 }}
            />
            {label}
          </Link>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Sidebar footer */}
      <div
        style={{
          paddingTop: "10px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 8px 0",
        }}
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #555, #333)",
            fontSize: "10px",
            display: "grid",
            placeItems: "center",
            fontWeight: 600,
            color: "var(--fg)",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--fg-dimmer)",
            }}
          >
            owner
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            title="Sign out"
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border-2)",
              borderRadius: "4px",
              color: "var(--fg-dim)",
              padding: "3px 6px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            ↩
          </button>
        </form>
      </div>
    </aside>
  );
}

// Icons — inline SVGs at 14×14
function OrgIcon({ size = 14, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
      <rect x="1" y="5" width="14" height="10" rx="1.5" />
      <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" />
    </svg>
  );
}

function DeptIcon({ size = 14, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
      <circle cx="5" cy="6" r="2" />
      <circle cx="11" cy="6" r="2" />
      <path d="M1 14c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M11 10c1.4.4 3 1.6 3 4" />
    </svg>
  );
}

function KeyIcon({ size = 14, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
      <circle cx="5.5" cy="8" r="3.5" />
      <path d="M9 8h6M13 8v2" />
    </svg>
  );
}

function ChartIcon({ size = 14, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
      <path d="M1 12l4-4 3 3 4-5 3 3" />
    </svg>
  );
}

function SettingsIcon({ size = 14, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
    </svg>
  );
}

function ChatIcon({ size = 14, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
      <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6l-4 3V3z" />
    </svg>
  );
}

function ChevIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--fg-dimmer)" }}>
      <path d="M3 4l2 2 2-2" />
    </svg>
  );
}
