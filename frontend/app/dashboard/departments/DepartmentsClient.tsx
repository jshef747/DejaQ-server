"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { createDepartment, deleteDepartment } from "@/app/actions/departments";
import type { DepartmentItem, DeptStatsItem, OrgItem } from "@/lib/types";

const fmtDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

function fmtNum(n: number) { return n.toLocaleString("en-US"); }
function fmtPct(n: number) { return (n * 100).toFixed(1) + "%"; }

const COL = "1fr 220px 180px 140px 110px";

interface Props {
  orgSlug: string;
  orgs: OrgItem[];
  depts: DepartmentItem[];
  statsItems: DeptStatsItem[];
  error: string | null;
}

export default function DepartmentsClient({ orgSlug, orgs, depts, statsItems, error }: Props) {
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [drag, setDrag] = useState<{ slug: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ slug: string; pos: "before" | "after" } | null>(null);
  const [order, setOrder] = useState(() => depts.map((d) => d.slug));

  // Keep order in sync when depts list changes (after create/delete)
  const rows = order
    .map((slug) => depts.find((d) => d.slug === slug))
    .filter(Boolean) as DepartmentItem[];
  // append any newly created depts not yet in order
  for (const d of depts) {
    if (!order.includes(d.slug)) rows.push(d);
  }

  const statsMap: Record<string, DeptStatsItem> = {};
  for (const s of statsItems) { statsMap[s.department] = s; }

  const orgHits = statsItems.reduce((a, s) => a + s.hits, 0);
  const orgMisses = statsItems.reduce((a, s) => a + s.misses, 0);
  const orgTotal = orgHits + orgMisses;
  const orgRate = orgTotal ? orgHits / orgTotal : 0;

  async function handleCreate() {
    const trimmed = createName.trim();
    if (!trimmed) { setCreateErr("Name is required."); return; }
    setCreateBusy(true);
    setCreateErr(null);
    const res = await createDepartment(orgSlug, trimmed);
    setCreateBusy(false);
    if (!res.ok) { setCreateErr(res.error); return; }
    setCreateOpen(false);
    setCreateName("");
    router.refresh();
  }

  async function handleDelete(deptSlug: string) {
    setDeleteBusy(true);
    setDeleteErr(null);
    const res = await deleteDepartment(orgSlug, deptSlug);
    setDeleteBusy(false);
    if (!res.ok) { setDeleteErr(res.error); return; }
    setConfirmDeleteSlug(null);
    setOrder((o) => o.filter((s) => s !== deptSlug));
    router.refresh();
  }

  function toggle(slug: string) { setExpanded((e) => ({ ...e, [slug]: !e[slug] })); }

  function onDragStart(slug: string) { setDrag({ slug }); }
  function onDragOver(e: React.DragEvent, slug: string) {
    if (!drag) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = e.clientY - rect.top < rect.height / 2 ? "before" : "after";
    setDropTarget({ slug, pos });
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!drag || !dropTarget || drag.slug === dropTarget.slug) { setDrag(null); setDropTarget(null); return; }
    const arr = rows.map((d) => d.slug).filter((s) => s !== drag.slug);
    const idx = arr.indexOf(dropTarget.slug);
    const at = dropTarget.pos === "after" ? idx + 1 : idx;
    arr.splice(at, 0, drag.slug);
    setOrder(arr);
    setDrag(null);
    setDropTarget(null);
  }

  const currentOrg = orgs.find((o) => o.slug === orgSlug);

  return (
    <div style={{ padding: "24px 28px", flex: 1 }}>
      {/* Header */}
      <div style={{ alignItems: "flex-start", display: "flex", justifyContent: "space-between", marginBottom: "20px", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Departments</h1>
          <p style={{ color: "var(--fg-dim)", fontSize: "13px", margin: 0 }}>
            Cache partitions inside a single organization. Drag rows to reorder priority; click a row to inspect its configuration.
          </p>
        </div>
        <button
          onClick={() => { setCreateName(""); setCreateErr(null); setCreateOpen(true); }}
          style={btnStyle({ background: "var(--accent)", borderColor: "var(--accent)", color: "#1a0d00", fontWeight: 600, padding: "7px 14px" })}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent)")}
        >
          + New department
        </button>
      </div>

      {/* Org scope selector + summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 0, border: "1px solid var(--border)", borderRadius: "6px", marginBottom: "16px", background: "var(--bg-2)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: "10.5px", color: "var(--fg-dimmer)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
            Scoped to organization
          </div>
          <select
            value={orgSlug}
            onChange={(e) => router.push(`/dashboard/departments?org=${e.target.value}`)}
            style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border-2)", color: "var(--fg)", padding: "7px 10px", borderRadius: "5px", outline: "none", fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
          >
            {orgs.map((o) => (
              <option key={o.slug} value={o.slug}>{o.name}</option>
            ))}
          </select>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dimmer)", marginTop: "6px" }}>{orgSlug}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", alignItems: "center" }}>
          {[
            { label: "Departments", value: rows.length.toString() },
            { label: "Hit rate", value: orgTotal ? fmtPct(orgRate) : "—", accent: true },
            { label: "Requests", value: fmtNum(orgTotal) },
          ].map((m) => (
            <div key={m.label} style={{ padding: "14px 16px", borderRight: "1px solid var(--border)" }}>
              <div style={{ fontSize: "10.5px", color: "var(--fg-dimmer)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{m.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 600, color: m.accent ? "var(--accent)" : "var(--fg)" }}>{m.value}</div>
            </div>
          ))}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: "10.5px", color: "var(--fg-dimmer)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Hits / Misses</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
              <span style={{ color: "var(--accent)" }}>{fmtNum(orgHits)}</span>
              <span style={{ color: "var(--fg-dimmer)" }}> / </span>
              <span style={{ color: "var(--amber)" }}>{fmtNum(orgMisses)}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: "6px", color: "var(--red)", fontSize: "12px", marginBottom: "16px", padding: "10px 14px" }}>
          {error}
        </div>
      )}
      {deleteErr && (
        <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: "6px", color: "var(--red)", fontSize: "12px", marginBottom: "16px", padding: "10px 14px" }}>
          {deleteErr}
        </div>
      )}

      <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ alignItems: "center", background: "#1d1d1d", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px", padding: "8px 10px" }}>
          <label style={{ alignItems: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "5px", color: "var(--fg-dim)", display: "flex", flex: 1, fontFamily: "var(--font-mono)", fontSize: "11px", gap: "6px", maxWidth: "360px", minWidth: "220px", padding: "4px 8px" }}>
            <SearchIcon />
            <input placeholder={`Filter departments in ${currentOrg?.name ?? orgSlug}…`} style={{ background: "none", border: "none", color: "var(--fg)", flex: 1, fontFamily: "var(--font-mono)", fontSize: "11px", outline: "none" }} />
          </label>
          <span style={{ color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", fontSize: "11px", marginLeft: "auto" }}>
            {rows.length} department{rows.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: COL, gap: "12px", padding: "9px 12px", fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-dimmer)", background: "#1d1d1d", borderBottom: "1px solid var(--border)" }}>
          <div>Name</div>
          <div>Cache stats</div>
          <div>Hit rate</div>
          <div>Created</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>

        <div onDrop={onDrop} onDragEnd={() => { setDrag(null); setDropTarget(null); }}>
          {rows.length === 0 && !error && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--fg-dimmer)", fontSize: "12px" }}>
              No departments yet in{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-dim)" }}>{orgSlug}</span>.{" "}
              Create one to start partitioning traffic.
            </div>
          )}
          {rows.map((dept, di) => {
            const stats = statsMap[dept.slug];
            const hits = stats?.hits ?? 0;
            const misses = stats?.misses ?? 0;
            const total = hits + misses;
            const rate = total ? hits / total : 0;
            const isOpen = !!expanded[dept.slug];
            const isDragging = drag?.slug === dept.slug;
            const dropBefore = dropTarget?.slug === dept.slug && dropTarget.pos === "before";
            const dropAfter = dropTarget?.slug === dept.slug && dropTarget.pos === "after";
            return (
              <div key={dept.id}>
                {dropBefore && <div style={{ height: "2px", background: "var(--accent)", margin: "0 12px" }} />}
                <div
                  draggable
                  onDragStart={() => onDragStart(dept.slug)}
                  onDragOver={(e) => onDragOver(e, dept.slug)}
                  onClick={() => toggle(dept.slug)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: COL,
                    gap: "12px",
                    padding: "10px 12px",
                    alignItems: "center",
                    borderBottom: isOpen || di < rows.length - 1 ? "1px solid var(--border)" : "none",
                    opacity: isDragging ? 0.5 : 1,
                    background: isDragging ? "var(--bg-3)" : "transparent",
                    cursor: "grab",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--fg-dimmer)", fontSize: "10px", fontFamily: "monospace", userSelect: "none" }}>⋮⋮</span>
                    <span style={{ width: "14px", display: "inline-flex", transition: "transform 0.12s", transform: isOpen ? "rotate(90deg)" : "none", color: "var(--fg-dim)", flexShrink: 0 }}>
                      <ChevRight size={10} />
                    </span>
                    <HashIcon size={12} />
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "12px" }}>{dept.slug}</span>
                    <span style={{ color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", fontSize: "10.5px" }}>{dept.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <span style={pillStyle("hit")}><span style={dotStyle} />HIT {fmtNum(hits)}</span>
                    <span style={pillStyle("miss")}><span style={dotStyle} />MISS {fmtNum(misses)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", minWidth: "48px", color: rate >= 0.7 ? "var(--accent)" : "var(--fg)" }}>
                      {total ? fmtPct(rate) : "—"}
                    </span>
                    <div style={{ height: "4px", background: "var(--bg-3)", borderRadius: "2px", overflow: "hidden", width: "80px" }}>
                      <div style={{ height: "100%", background: "var(--accent)", width: (rate * 100) + "%" }} />
                    </div>
                  </div>
                  <div style={{ color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                    {fmtDate.format(new Date(dept.created_at))}
                  </div>
                  <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setDeleteErr(null); setConfirmDeleteSlug(dept.slug); }}
                      title="Delete department"
                      style={{ background: "none", border: "none", borderRadius: "4px", color: "var(--red)", cursor: "pointer", fontSize: "11px", opacity: 0.6, padding: "2px 6px" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.6")}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isOpen && (
                  <div style={{ background: "#1b1b1b", borderBottom: di < rows.length - 1 ? "1px solid var(--border)" : "none", padding: "16px 12px 16px 56px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "12px" }}>
                      <div>
                        <div style={{ fontSize: "10.5px", color: "var(--fg-dimmer)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Cache</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>
                            <span style={{ color: "var(--fg-dimmer)" }}>namespace → </span>{dept.cache_namespace}
                          </div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>
                            <span style={{ color: "var(--fg-dimmer)" }}>entries → </span>{fmtNum(total)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10.5px", color: "var(--fg-dimmer)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Stats</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>
                            <span style={{ color: "var(--fg-dimmer)" }}>hit rate → </span>
                            <span style={{ color: total ? (rate >= 0.7 ? "var(--accent)" : "var(--fg)") : "var(--fg-dimmer)" }}>
                              {total ? fmtPct(rate) : "—"}
                            </span>
                          </div>
                          {stats?.avg_latency_ms != null && (
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>
                              <span style={{ color: "var(--fg-dimmer)" }}>avg latency → </span>{stats.avg_latency_ms.toFixed(0)} ms
                            </div>
                          )}
                          {stats && (
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>
                              <span style={{ color: "var(--fg-dimmer)" }}>tokens saved → </span>{fmtNum(stats.est_tokens_saved)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10.5px", color: "var(--fg-dimmer)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Endpoint</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", padding: "6px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", lineHeight: "1.4", wordBreak: "break-all" }}>
                          POST /v1/chat/completions
                          <span style={{ color: "var(--fg-dimmer)" }}> · X-DejaQ-Department: </span>
                          <span style={{ color: "var(--accent)" }}>{dept.slug}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {dropAfter && <div style={{ height: "2px", background: "var(--accent)", margin: "0 12px" }} />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "12px", fontSize: "11px", color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", display: "flex", gap: "16px" }}>
        <span>↕ drag to reorder · order affects routing priority</span>
        <span>↓ click row to view cache config</span>
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create department">
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ color: "var(--fg)", display: "block", fontSize: "11.5px", fontWeight: 500, marginBottom: "6px" }}>Name</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. customer-support"
              disabled={createBusy}
              autoFocus
              style={{ width: "100%", background: "var(--bg)", border: `1px solid ${createErr ? "var(--red-border)" : "var(--border-2)"}`, borderRadius: "5px", color: "var(--fg)", fontSize: "12px", fontFamily: "var(--font-mono)", outline: "none", padding: "7px 10px" }}
            />
            {createErr ? (
              <p style={{ color: "var(--red)", fontSize: "11px", margin: "4px 0 0" }}>{createErr}</p>
            ) : (
              <div style={{ color: "var(--fg-dimmer)", fontFamily: "var(--font-mono)", fontSize: "11px", marginTop: "4px" }}>
                lowercase, hyphen-separated. visible to end users in logs.
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setCreateOpen(false)} disabled={createBusy} style={btnStyle({ opacity: createBusy ? 0.5 : 1 })}>Cancel</button>
            <button type="submit" disabled={createBusy} style={btnStyle({ background: "var(--accent)", borderColor: "var(--accent)", color: "#1a0d00", fontWeight: 600, opacity: createBusy ? 0.7 : 1 })}>
              {createBusy ? "Creating…" : "Create department"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteSlug}
        title="Delete department"
        message={`Delete "${depts.find((d) => d.slug === confirmDeleteSlug)?.name ?? confirmDeleteSlug}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={deleteBusy}
        onCancel={() => setConfirmDeleteSlug(null)}
        onConfirm={() => confirmDeleteSlug && handleDelete(confirmDeleteSlug)}
      />
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
