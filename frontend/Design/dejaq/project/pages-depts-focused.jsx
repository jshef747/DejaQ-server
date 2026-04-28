// Departments page — focused on a single org, with drag-reorder and expandable details

function DepartmentsFocusedPage({ org, orgs, setOrg, depts, setDepts }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState({});
  const [drag, setDrag] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const rows = depts[org.id] || [];
  const orgTotal = rows.reduce((a, d) => a + totalRequests(d), 0);
  const orgHits = rows.reduce((a, d) => a + d.hits, 0);
  const orgMisses = orgTotal - orgHits;
  const orgRate = orgTotal ? orgHits / orgTotal : 0;

  const create = () => {
    if (!newName.trim()) return;
    const id = 'dept_' + Math.random().toString(36).slice(2, 8);
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-');
    const today = new Date().toISOString().slice(0, 10);
    setDepts({ ...depts, [org.id]: [{ id, name: slug, hits: 0, misses: 0, createdAt: today }, ...rows] });
    setNewName('');
    setShowCreate(false);
  };

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const onDragStart = (id) => (e) => {
    setDrag({ id });
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', id); } catch(_) {}
  };
  const onDragOverRow = (id) => (e) => {
    if (!drag) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientY - rect.top) < rect.height / 2 ? 'before' : 'after';
    setDropTarget({ id, pos });
  };
  const onDrop = (e) => {
    if (!drag || !dropTarget) { setDrag(null); setDropTarget(null); return; }
    e.preventDefault();
    if (drag.id === dropTarget.id) { setDrag(null); setDropTarget(null); return; }
    const arr = rows.slice();
    const moved = arr.find(d => d.id === drag.id);
    const rest = arr.filter(d => d.id !== drag.id);
    const idx = rest.findIndex(d => d.id === dropTarget.id);
    const insertAt = dropTarget.pos === 'after' ? idx + 1 : idx;
    rest.splice(insertAt, 0, moved);
    setDepts({ ...depts, [org.id]: rest });
    setDrag(null);
    setDropTarget(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">
            Cache partitions inside a single organization. Drag rows to reorder priority; click a row to inspect its configuration.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={12} />New department
        </button>
      </div>

      {/* Org scope selector + summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0,
        border: '1px solid var(--border)', borderRadius: 6, marginBottom: 16,
        background: 'var(--bg-2)', overflow: 'hidden'
      }}>
        <div style={{ padding: '14px 16px', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Scoped to organization
          </div>
          <select
            className="select"
            value={org.id}
            onChange={e => setOrg(orgs.find(o => o.id === e.target.value))}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500 }}>
            {orgs.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <div className="mono dimmer" style={{ fontSize: 11, marginTop: 6 }}>{org.id}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center' }}>
          <div style={{ padding: '14px 16px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Departments</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{rows.length}</div>
          </div>
          <div style={{ padding: '14px 16px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Hit rate</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)' }}>{orgTotal ? fmtPct(orgRate) : '—'}</div>
          </div>
          <div style={{ padding: '14px 16px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Requests</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{fmtNum(orgTotal)}</div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Hits / Misses</div>
            <div className="mono" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--accent)' }}>{fmtNum(orgHits)}</span>
              <span className="dimmer"> / </span>
              <span style={{ color: 'var(--amber)' }}>{fmtNum(orgMisses)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" size={12} />
            <input placeholder={`Filter departments in ${org.name}…`} />
          </div>
          <span style={{ marginLeft: 'auto' }} className="mono dimmer">{rows.length} departments</span>
        </div>

        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 220px 180px 140px 110px', gap: 12,
          padding: '9px 12px', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--fg-dimmer)', background: '#1d1d1d', borderBottom: '1px solid var(--border)'
        }}>
          <div>Name</div>
          <div>Cache stats (24h)</div>
          <div>Hit rate</div>
          <div>Created</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        <div onDrop={onDrop} onDragEnd={() => { setDrag(null); setDropTarget(null); }}>
          {rows.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-dimmer)' }}>
              No departments yet in <span className="mono" style={{ color: 'var(--fg-dim)' }}>{org.id}</span>. Create one to start partitioning traffic.
            </div>
          )}

          {rows.map((d, di) => {
            const total = totalRequests(d);
            const rate = total ? hitRate(d) : 0;
            const isOpen = !!expanded[d.id];
            const isDragging = drag && drag.id === d.id;
            const dropBefore = dropTarget && dropTarget.id === d.id && dropTarget.pos === 'before';
            const dropAfter  = dropTarget && dropTarget.id === d.id && dropTarget.pos === 'after';
            return (
              <React.Fragment key={d.id}>
                {dropBefore && <div style={{ height: 2, background: 'var(--accent)', margin: '0 12px' }} />}
                <div
                  draggable
                  onDragStart={onDragStart(d.id)}
                  onDragOver={onDragOverRow(d.id)}
                  onClick={() => toggle(d.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 220px 180px 140px 110px', gap: 12,
                    padding: '10px 12px', alignItems: 'center',
                    borderBottom: isOpen ? '1px solid var(--border)' : (di < rows.length - 1 ? '1px solid var(--border)' : 'none'),
                    opacity: isDragging ? 0.5 : 1,
                    background: isDragging ? 'var(--bg-3)' : 'transparent',
                    cursor: 'grab',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--fg-dimmer)', cursor: 'grab', fontSize: 10, fontFamily: 'monospace', userSelect: 'none' }}>⋮⋮</span>
                    <span style={{ width: 14, display: 'inline-flex', transition: 'transform 0.12s', transform: isOpen ? 'rotate(90deg)' : 'none', color: 'var(--fg-dim)' }}>
                      <Icon name="arrow" size={10} />
                    </span>
                    <Icon name="hash" size={12} />
                    <span className="mono" style={{ fontWeight: 500 }}>{d.name}</span>
                    <span className="mono dimmer" style={{ fontSize: 10.5 }}>{d.id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span className="pill pill-hit"><span className="pill-dot"></span>HIT {fmtNum(d.hits)}</span>
                    <span className="pill pill-miss"><span className="pill-dot"></span>MISS {fmtNum(d.misses)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mono" style={{ minWidth: 48, fontSize: 12, color: rate >= 0.7 ? 'var(--accent)' : 'var(--fg)' }}>{total ? fmtPct(rate) : '—'}</span>
                    <div className="hbar" style={{ width: 80 }}><div className="hbar-fill" style={{ width: (rate*100)+'%' }} /></div>
                  </div>
                  <div className="mono dim" style={{ fontSize: 11 }}>{d.createdAt}</div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-xs">Open <Icon name="arrow" size={10} /></button>
                  </div>
                </div>

                {/* Expanded details panel */}
                {isOpen && (
                  <div style={{
                    background: '#1b1b1b',
                    borderBottom: di < rows.length - 1 ? '1px solid var(--border)' : 'none',
                    padding: '16px 12px 16px 56px',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Routing</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <div className="mono" style={{ fontSize: 11.5 }}><span className="dimmer">local →</span> llama-3.2-1b</div>
                          <div className="mono" style={{ fontSize: 11.5 }}><span className="dimmer">external →</span> claude-sonnet-4</div>
                          <div className="mono" style={{ fontSize: 11.5 }}><span className="dimmer">threshold →</span> 0.82</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Cache</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <div className="mono" style={{ fontSize: 11.5 }}><span className="dimmer">ttl →</span> 24h</div>
                          <div className="mono" style={{ fontSize: 11.5 }}><span className="dimmer">size →</span> {fmtNum(d.hits + d.misses)} entries</div>
                          <div className="mono" style={{ fontSize: 11.5 }}><span className="dimmer">similarity →</span> cosine ≥ 0.88</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Endpoint</div>
                        <div className="mono" style={{
                          fontSize: 11, padding: '6px 8px', background: 'var(--bg)',
                          border: '1px solid var(--border)', borderRadius: 4, lineHeight: 1.4,
                          wordBreak: 'break-all'
                        }}>
                          POST /v1/{org.id}/<span style={{ color: 'var(--accent)' }}>{d.name}</span>/complete
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                          <button className="btn btn-xs">Copy cURL</button>
                          <button className="btn btn-xs btn-ghost-danger">Flush cache</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {dropAfter && <div style={{ height: 2, background: 'var(--accent)', margin: '0 12px' }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--fg-dimmer)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 16 }}>
        <span>↕ drag to reorder · order affects routing priority</span>
        <span>↓ click row to view routing & cache config</span>
      </div>

      {showCreate && (
        <Modal
          title="Create department"
          subtitle={`In organization ${org.name}`}
          onClose={() => setShowCreate(false)}
          footer={<>
            <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create} disabled={!newName.trim()}>Create department</button>
          </>}>
          <div className="field">
            <label className="field-label">Name</label>
            <input className="input" autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. customer-support" onKeyDown={e => e.key === 'Enter' && create()} />
            <div className="field-hint">lowercase, hyphen-separated. visible to end users in logs.</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { DepartmentsFocusedPage });
