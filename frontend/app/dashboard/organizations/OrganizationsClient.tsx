"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DepartmentItem, DeptStatsItem, OrgItem } from "@/lib/types";

const fmtDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

function fmtNum(n: number) {
  return n.toLocaleString("en-US");
}
function fmtPct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

interface Props {
  orgs: OrgItem[];
  allDepts: DepartmentItem[];
  statsMap: Record<string, DeptStatsItem>;
  error: string | null;
}

const COL = "1fr 200px 160px 140px 110px";

export default function OrganizationsClient({ orgs, allDepts, statsMap, error }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    orgs.forEach((o, i) => { init[o.slug] = i < 2; });
    return init;
  });
  const [drag, setDrag] = useState<{ kind: "org" | "dept"; slug: string; fromOrg?: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ slug: string; pos: "before" | "after" | "into" } | null>(null);
  const [orgOrder, setOrgOrder] = useState(() => orgs.map((o) => o.slug));

  const deptsByOrg: Record<string, DepartmentItem[]> = {};
  for (const d of allDepts) {
    (deptsByOrg[d.org_slug] ??= []).push(d);
  }

  const toggle = (slug: string) => setExpanded((e) => ({ ...e, [slug]: !e[slug] }));

  const searchLower = search.toLowerCase();
  const visibleSlugs = search.trim()
    ? orgOrder.filter((slug) => {
        const org = orgs.find((o) => o.slug === slug);
        if (!org) return false;
        if (
          org.name.toLowerCase().includes(searchLower) ||
          org.slug.toLowerCase().includes(searchLower)
        )
          return true;
        return (deptsByOrg[slug] ?? []).some((d) => d.slug.includes(searchLower));
      })
    : orgOrder;

  // Drag helpers
  function onOrgDragStart(slug: string) {
    setDrag({ kind: "org", slug });
  }
  function onOrgDragOver(e: React.DragEvent, slug: string) {
    if (!drag || drag.kind !== "org") return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = e.clientY - rect.top < rect.height / 2 ? "before" : "after";
    setDropTarget({ slug, pos });
  }
  function onDeptDragStart(deptSlug: string, fromOrg: string) {
    setDrag({ kind: "dept", slug: deptSlug, fromOrg });
  }
  function onDeptDragOver(e: React.DragEvent, deptSlug: string) {
    if (!drag || drag.kind !== "dept") return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = e.clientY - rect.top < rect.height / 2 ? "before" : "after";
    setDropTarget({ slug: deptSlug, pos });
  }
  function onOrgDropZone(e: React.DragEvent, orgSlug: string) {
    if (!drag || drag.kind !== "dept") return;
    e.preventDefault();
    setDropTarget({ slug: orgSlug, pos: "into" });
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!drag || !dropTarget) { setDrag(null); setDropTarget(null); return; }

    if (drag.kind === "org" && (dropTarget.pos === "before" || dropTarget.pos === "after")) {
      if (drag.slug !== dropTarget.slug) {
        const next = orgOrder.filter((s) => s !== drag.slug);
        const idx = next.indexOf(dropTarget.slug);
        const at = dropTarget.pos === "after" ? idx + 1 : idx;
        next.splice(at, 0, drag.slug);
        setOrgOrder(next);
      }
    }
    // dept-into-org and dept reorder are visual-only for now (no backend persistence)
    setDrag(null);
    setDropTarget(null);
  }

  return (
    <div style={{ padding: "24px 28px", flex: 1 }}>
      {/* Header */}
      <div style={{ alignItems: "flex-start", display: "flex", justifyContent: "space-between", marginBottom: "20px", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Organizations</h1>
          <p style={{ color: "var(--fg-dim)", fontSize: "13px", margin: 0, maxWidth: "640px" }}>
            Drag to reorder. Drop a department onto another org to move it. Each org owns a cache namespace; each department is a partition inside that namespace.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => { const all: Record<string, boolean> = {}; orgs.forEach((o) => (all[o.slug] = true)); setExpanded(all); }}
            style={btnStyle()}
          >
            Expand all
          </button>
          <button onClick={() => setExpanded({})} style={btnStyle()}>
            Collapse all
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: "6px", color: "var(--red)", fontSize: "12px", marginBottom: "16px", padding: "10px 14px" }}>
          {error}
        </div>
      )}

      <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ alignItems: "center", background: "#1d1d1d", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px", padding: "8px 10px" }}>
          <label style={{ alignItems: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "5px", color: "var(--fg-dim)", display: "flex", flex: 1, fontFamily: "var(--font-mono)", fontSize: "11px", gap: "6px", maxWidth: "360px", minWidth: "220px", padding: "4px 8px" }}>
            <SearchIcon />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter organizations and departments…"
              style={{ background: "none", border: "none", color: "var(--fg)", flex: 1, fontFamily: "var(--font-mono)", fontSize: "11px", outline: "none" }}
            />
          </label>
          <span style={{ color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", fontSize: "11px", marginLeft: "auto" }}>
            {visibleSlugs.length} org{visibleSlugs.length !== 1 ? "s" : ""} · {allDepts.length} departments
          </span>
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: COL, gap: "12px", padding: "9px 12px", fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-dimmer)", background: "#1d1d1d", borderBottom: "1px solid var(--border)" }}>
          <div>Name</div>
          <div>Cache stats</div>
          <div>Hit rate / Requests</div>
          <div>Created</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>

        <div onDrop={onDrop} onDragEnd={() => { setDrag(null); setDropTarget(null); }}>
          {visibleSlugs.length === 0 && (
            <div style={{ color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", fontSize: "12px", padding: "40px", textAlign: "center" }}>
              {search ? `No results for "${search}"` : "No organizations yet — create one with dejaq-admin org create"}
            </div>
          )}

          {visibleSlugs.map((slug, oi) => {
            const org = orgs.find((o) => o.slug === slug);
            if (!org) return null;
            const rows = deptsByOrg[slug] ?? [];
            const isOpen = !!expanded[slug];
            const orgHits = rows.reduce((a, d) => a + (statsMap[`${slug}::${d.slug}`]?.hits ?? 0), 0);
            const orgMisses = rows.reduce((a, d) => a + (statsMap[`${slug}::${d.slug}`]?.misses ?? 0), 0);
            const orgTotal = orgHits + orgMisses;
            const orgRate = orgTotal ? orgHits / orgTotal : 0;
            const isDragging = drag?.kind === "org" && drag.slug === slug;
            const dropBefore = dropTarget?.slug === slug && dropTarget.pos === "before";
            const dropAfter = dropTarget?.slug === slug && dropTarget.pos === "after";
            const dropInto = dropTarget?.slug === slug && dropTarget.pos === "into";

            return (
              <div key={slug}>
                {dropBefore && <div style={{ height: "2px", background: "var(--accent)", margin: "0 12px" }} />}
                <div
                  draggable
                  onDragStart={() => onOrgDragStart(slug)}
                  onDragOver={(e) => {
                    if (drag?.kind === "dept") { onOrgDropZone(e, slug); return; }
                    onOrgDragOver(e, slug);
                  }}
                  onDragLeave={() => setDropTarget(null)}
                  onClick={() => toggle(slug)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: COL,
                    gap: "12px",
                    padding: "10px 12px",
                    alignItems: "center",
                    borderBottom: isOpen || oi < visibleSlugs.length - 1 ? "1px solid var(--border)" : "none",
                    background: dropInto ? "var(--accent-bg)" : isDragging ? "var(--bg-3)" : "transparent",
                    opacity: isDragging ? 0.5 : 1,
                    cursor: "grab",
                    borderLeft: dropInto ? "2px solid var(--accent)" : "2px solid transparent",
                    userSelect: "none",
                  }}
                >
                  {/* Name col */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--fg-dimmer)", fontSize: "10px", fontFamily: "monospace", userSelect: "none" }}>⋮⋮</span>
                    <span style={{ width: "16px", display: "inline-flex", transition: "transform 0.12s", transform: isOpen ? "rotate(90deg)" : "none", color: "var(--fg-dim)" }}>
                      <ChevRight size={11} />
                    </span>
                    <span style={{ width: "20px", height: "20px", display: "grid", placeItems: "center", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "4px", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
                      {org.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span style={{ fontWeight: 500 }}>{org.name}</span>
                    <span style={{ color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{org.slug}</span>
                    <span style={{ background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: "3px", color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: "10px", padding: "1px 6px" }}>
                      {rows.length} dept{rows.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Cache stats */}
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
                    {rows.length ? (
                      <>
                        <span style={{ color: "var(--accent)" }}>{fmtNum(orgHits)}</span>
                        {" / "}
                        <span style={{ color: "var(--amber)" }}>{fmtNum(orgMisses)}</span>
                      </>
                    ) : (
                      <span style={{ color: "var(--fg-dimmer)" }}>—</span>
                    )}
                  </div>
                  {/* Hit rate */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", minWidth: "48px", color: orgRate >= 0.7 ? "var(--accent)" : "var(--fg)" }}>
                      {orgTotal ? fmtPct(orgRate) : "—"}
                    </span>
                    <div style={{ height: "4px", background: "var(--bg-3)", borderRadius: "2px", overflow: "hidden", width: "70px", flexShrink: 0 }}>
                      <div style={{ height: "100%", background: "var(--accent)", width: (orgRate * 100) + "%" }} />
                    </div>
                  </div>
                  {/* Created */}
                  <div style={{ color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                    {fmtDate.format(new Date(org.created_at))}
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/dashboard/departments?org=${org.slug}`)}
                      style={btnStyle({ fontSize: "11px", padding: "3px 8px" })}
                    >
                      Open <ChevRight size={10} />
                    </button>
                  </div>
                </div>
                {dropAfter && !isOpen && <div style={{ height: "2px", background: "var(--accent)", margin: "0 12px" }} />}

                {/* Dept sub-rows */}
                {isOpen && (
                  <div style={{ background: "#1b1b1b", borderBottom: oi < visibleSlugs.length - 1 ? "1px solid var(--border)" : "none" }}>
                    {rows.length === 0 && (
                      <div style={{ padding: "14px 12px 14px 58px", color: "var(--fg-dimmer)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                        no departments yet
                      </div>
                    )}
                    {rows.map((d, di) => {
                      const stats = statsMap[`${slug}::${d.slug}`];
                      const hits = stats?.hits ?? 0;
                      const misses = stats?.misses ?? 0;
                      const total = hits + misses;
                      const rate = total ? hits / total : 0;
                      const deptDragging = drag?.kind === "dept" && drag.slug === d.slug;
                      const deptBefore = dropTarget?.slug === d.slug && dropTarget.pos === "before";
                      const deptAfter = dropTarget?.slug === d.slug && dropTarget.pos === "after";
                      return (
                        <div key={d.id}>
                          {deptBefore && <div style={{ height: "2px", background: "var(--accent)", marginLeft: "58px", marginRight: "12px" }} />}
                          <div
                            draggable
                            onDragStart={() => onDeptDragStart(d.slug, slug)}
                            onDragOver={(e) => onDeptDragOver(e, d.slug)}
                            style={{
                              display: "grid",
                              gridTemplateColumns: COL,
                              gap: "12px",
                              padding: "8px 12px",
                              alignItems: "center",
                              borderBottom: di < rows.length - 1 ? "1px solid var(--border)" : "none",
                              opacity: deptDragging ? 0.5 : 1,
                              background: deptDragging ? "var(--bg-3)" : "transparent",
                              cursor: "grab",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "44px" }}>
                              <span style={{ color: "var(--fg-dimmer)", fontSize: "10px", fontFamily: "monospace", userSelect: "none" }}>⋮⋮</span>
                              <span style={{ color: "var(--fg-dimmer)" }}>└</span>
                              <HashIcon size={12} />
                              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "12px" }}>{d.slug}</span>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <span style={{ ...pillStyle("hit") }}>
                                <span style={dotStyle} />
                                HIT {fmtNum(hits)}
                              </span>
                              <span style={{ ...pillStyle("miss") }}>
                                <span style={dotStyle} />
                                MISS {fmtNum(misses)}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", minWidth: "48px", color: rate >= 0.7 ? "var(--accent)" : "var(--fg)" }}>
                                {total ? fmtPct(rate) : "—"}
                              </span>
                              <div style={{ height: "4px", background: "var(--bg-3)", borderRadius: "2px", overflow: "hidden", width: "70px" }}>
                                <div style={{ height: "100%", background: "var(--accent)", width: (rate * 100) + "%" }} />
                              </div>
                            </div>
                            <div style={{ color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                              {fmtDate.format(new Date(d.created_at))}
                            </div>
                            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => router.push(`/dashboard/departments?org=${slug}`)}
                                style={btnStyle({ fontSize: "11px", padding: "3px 8px" })}
                              >
                                Open <ChevRight size={10} />
                              </button>
                            </div>
                          </div>
                          {deptAfter && <div style={{ height: "2px", background: "var(--accent)", marginLeft: "58px", marginRight: "12px" }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
                {dropAfter && isOpen && <div style={{ height: "2px", background: "var(--accent)", margin: "0 12px" }} />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "12px", padding: "10px 12px", fontSize: "11px", color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", display: "flex", gap: "16px" }}>
        <span>↕ drag rows to reorder</span>
        <span>↓ click a row to expand</span>
      </div>
    </div>
  );
}

const dotStyle: React.CSSProperties = {
  width: "5px",
  height: "5px",
  borderRadius: "50%",
  background: "currentColor",
  display: "inline-block",
};

function pillStyle(kind: "hit" | "miss"): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "2px 7px",
    borderRadius: "3px",
    fontFamily: "var(--font-mono)",
    fontSize: "10.5px",
    fontWeight: 500,
    border: "1px solid",
    lineHeight: "1.5",
    ...(kind === "hit"
      ? { background: "var(--accent-bg)", color: "var(--accent)", borderColor: "var(--accent-border)" }
      : { background: "var(--amber-bg)", color: "var(--amber)", borderColor: "var(--amber-border)" }),
  };
}

function btnStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    alignItems: "center",
    background: "var(--bg-2)",
    border: "1px solid var(--border-2)",
    borderRadius: "5px",
    color: "var(--fg)",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "12px",
    fontWeight: 500,
    gap: "6px",
    padding: "6px 12px",
    whiteSpace: "nowrap",
    ...extra,
  };
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10.5 10.5l3 3" />
    </svg>
  );
}

function ChevRight({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2l4 3-4 3" />
    </svg>
  );
}

function HashIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 9h8M4 7h8M7 3l-2 10M11 3l-2 10" />
    </svg>
  );
}
