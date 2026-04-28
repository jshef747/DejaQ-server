// Collapsible, drag-reorderable org→department tree
// Inspired by Supabase's schema/tables sidebar

function OrgTreePage({ orgs, setOrgs, depts, setDepts, focusOrgId, setOrg }) {
  const [expanded, setExpanded] = useState(() => {
    const init = {};
    orgs.forEach((o, i) => { init[o.id] = i < 2 || o.id === focusOrgId; });
    return init;
  });
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showCreateDept, setShowCreateDept] = useState(null); // orgId
  const [newOrgName, setNewOrgName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [drag, setDrag] = useState(null); // { kind: 'org'|'dept', id, fromOrg? }
  const [dropTarget, setDropTarget] = useState(null); // { kind, id, pos: 'before'|'after'|'into' }

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const createOrg = () => {
    if (!newOrgName.trim()) return;
    const id = 'org_' + newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14);
    setOrgs([{ id, name: newOrgName.trim(), createdAt: new Date().toISOString().slice(0,10), members: 1 }, ...orgs]);
    setDepts({ ...depts, [id]: [] });
    setExpanded(e => ({ ...e, [id]: true }));
    setNewOrgName('');
    setShowCreateOrg(false);
  };
  const createDept = () => {
    if (!newDeptName.trim() || !showCreateDept) return;
    const orgId = showCreateDept;
    const id = 'dept_' + Math.random().toString(36).slice(2, 8);
    const slug = newDeptName.trim().toLowerCase().replace(/\s+/g, '-');
    setDepts({ ...depts, [orgId]: [{ id, name: slug, hits: 0, misses: 0, createdAt: new Date().toISOString().slice(0,10) }, ...(depts[orgId] || [])] });
    setNewDeptName('');
    setShowCreateDept(null);
  };

  // Drag handlers
  const onDragStart = (kind, id, fromOrg) => (e) => {
    setDrag({ kind, id, fromOrg });
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', id); } catch(_) {}
  };
  const onDragOver = (kind, id, pos) => (e) => {
    if (!drag) return;
    // Orgs reorder among orgs; depts reorder among depts (can cross orgs if pos='into' on an org)
    if (drag.kind === 'org' && kind === 'org') {
      e.preventDefault();
      setDropTarget({ kind, id, pos });
    } else if (drag.kind === 'dept' && kind === 'dept') {
      e.preventDefault();
      setDropTarget({ kind, id, pos });
    } else if (drag.kind === 'dept' && kind === 'org' && pos === 'into') {
      e.preventDefault();
      setDropTarget({ kind, id, pos });
    }
  };
  const onDrop = (e) => {
    if (!drag || !dropTarget) return;
    e.preventDefault();
    if (drag.kind === 'org' && dropTarget.kind === 'org' && drag.id !== dropTarget.id) {
      const next = orgs.filter(o => o.id !== drag.id);
      const idx = next.findIndex(o => o.id === dropTarget.id);
      const insertAt = dropTarget.pos === 'after' ? idx + 1 : idx;
      const moved = orgs.find(o => o.id === drag.id);
      next.splice(insertAt, 0, moved);
      setOrgs(next);
    }
    if (drag.kind === 'dept') {
      const fromOrg = drag.fromOrg;
      const item = (depts[fromOrg] || []).find(d => d.id === drag.id);
      if (!item) { setDrag(null); setDropTarget(null); return; }
      const removed = { ...depts, [fromOrg]: (depts[fromOrg] || []).filter(d => d.id !== drag.id) };
      if (dropTarget.kind === 'org' && dropTarget.pos === 'into') {
        const targetOrg = dropTarget.id;
        removed[targetOrg] = [item, ...(removed[targetOrg] || [])];
        setDepts(removed);
        setExpanded(x => ({ ...x, [targetOrg]: true }));
      } else if (dropTarget.kind === 'dept') {
        // find which org the target dept belongs to
        let targetOrg = null;
        Object.keys(depts).forEach(oid => {
          if ((depts[oid] || []).some(d => d.id === dropTarget.id)) targetOrg = oid;
        });
        if (!targetOrg) { setDrag(null); setDropTarget(null); return; }
        const arr = (removed[targetOrg] || []).slice();
        const idx = arr.findIndex(d => d.id === dropTarget.id);
        const insertAt = dropTarget.pos === 'after' ? idx + 1 : idx;
        arr.splice(insertAt, 0, item);
        removed[targetOrg] = arr;
        setDepts(removed);
      }
    }
    setDrag(null);
    setDropTarget(null);
  };
  const onDragEnd = () => { setDrag(null); setDropTarget(null); };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-subtitle">
            Drag to reorder. Drop a department onto another org to move it. Each org owns a cache namespace; each department is a partition inside that namespace.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => {
            const all = {}; orgs.forEach(o => all[o.id] = true); setExpanded(all);
          }}>Expand all</button>
          <button className="btn" onClick={() => setExpanded({})}>Collapse all</button>
          <button className="btn btn-primary" onClick={() => setShowCreateOrg(true)}>
            <Icon name="plus" size={12} />New organization
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" size={12} />
            <input placeholder="Filter organizations and departments…" />
            <span className="kbd">⌘K</span>
          </div>
          <span style={{ marginLeft: 'auto' }} className="mono dimmer">
            {orgs.length} orgs · {Object.values(depts).reduce((a,d) => a + (d?.length || 0), 0)} departments
          </span>
        </div>

        {/* Tree header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 200px 160px 140px 100px', gap: 12,
          padding: '9px 12px', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--fg-dimmer)', background: '#1d1d1d', borderBottom: '1px solid var(--border)'
        }}>
          <div>Name</div>
          <div>Cache stats</div>
          <div>Hit rate / Requests</div>
          <div>Created</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        <div onDrop={onDrop} onDragEnd={onDragEnd}>
          {orgs.map((o, oi) => {
            const rows = depts[o.id] || [];
            const isOpen = !!expanded[o.id];
            const orgTotal = rows.reduce((a, d) => a + totalRequests(d), 0);
            const orgHits  = rows.reduce((a, d) => a + d.hits, 0);
            const orgRate  = orgTotal ? orgHits / orgTotal : 0;
            const isDragging = drag && drag.kind === 'org' && drag.id === o.id;
            const dropBefore = dropTarget && dropTarget.kind === 'org' && dropTarget.id === o.id && dropTarget.pos === 'before';
            const dropAfter  = dropTarget && dropTarget.kind === 'org' && dropTarget.id === o.id && dropTarget.pos === 'after';
            const dropInto   = dropTarget && dropTarget.kind === 'org' && dropTarget.id === o.id && dropTarget.pos === 'into';
            return (
              <React.Fragment key={o.id}>
                {dropBefore && <div style={{ height: 2, background: 'var(--accent)', margin: '0 12px' }} />}
                <div
                  draggable
                  onDragStart={onDragStart('org', o.id)}
                  onDragOver={(e) => {
                    if (!drag) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    if (drag.kind === 'dept') {
                      onDragOver('org', o.id, 'into')(e);
                    } else {
                      const pos = y < rect.height / 2 ? 'before' : 'after';
                      onDragOver('org', o.id, pos)(e);
                    }
                  }}
                  onDragLeave={() => setDropTarget(null)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 200px 160px 140px 100px', gap: 12,
                    padding: '10px 12px', alignItems: 'center',
                    borderBottom: isOpen ? '1px solid var(--border)' : (oi < orgs.length - 1 ? '1px solid var(--border)' : 'none'),
                    background: dropInto ? 'var(--accent-bg)' : isDragging ? 'var(--bg-3)' : 'transparent',
                    opacity: isDragging ? 0.5 : 1,
                    cursor: 'grab',
                    borderLeft: dropInto ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                  onClick={() => toggle(o.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--fg-dimmer)', cursor: 'grab', fontSize: 10, fontFamily: 'monospace', userSelect: 'none' }}>⋮⋮</span>
                    <span style={{ width: 16, display: 'inline-flex', transition: 'transform 0.12s', transform: isOpen ? 'rotate(90deg)' : 'none', color: 'var(--fg-dim)' }}>
                      <Icon name="arrow" size={11} />
                    </span>
                    <span style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 4, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>
                      {o.name.slice(0,1)}
                    </span>
                    <span style={{ fontWeight: 500 }}>{o.name}</span>
                    <span className="mono dimmer" style={{ fontSize: 11 }}>{o.id}</span>
                    <span className="pill pill-neutral" style={{ fontSize: 10 }}>{rows.length} dept{rows.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="mono dim" style={{ fontSize: 11 }}>
                    {rows.length
                      ? <><span style={{ color: 'var(--accent)' }}>{fmtNum(orgHits)}</span> / <span style={{ color: 'var(--amber)' }}>{fmtNum(orgTotal - orgHits)}</span></>
                      : <span className="dimmer">—</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mono" style={{ minWidth: 48, fontSize: 12, color: orgRate >= 0.7 ? 'var(--accent)' : 'var(--fg)' }}>
                      {orgTotal ? fmtPct(orgRate) : '—'}
                    </span>
                    <div className="hbar" style={{ width: 70 }}><div className="hbar-fill" style={{ width: (orgRate*100)+'%' }} /></div>
                  </div>
                  <div className="mono dim" style={{ fontSize: 11 }}>{o.createdAt}</div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-xs" title="Add department" onClick={() => { setShowCreateDept(o.id); setExpanded(x => ({ ...x, [o.id]: true })); }}>
                      <Icon name="plus" size={10} />
                    </button>
                    <button className="btn btn-xs" onClick={() => { setOrg(o); }}>Switch</button>
                  </div>
                </div>
                {dropAfter && !isOpen && <div style={{ height: 2, background: 'var(--accent)', margin: '0 12px' }} />}

                {isOpen && (
                  <div style={{ background: '#1b1b1b', borderBottom: oi < orgs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {rows.length === 0 && (
                      <div style={{ padding: '14px 12px 14px 58px', color: 'var(--fg-dimmer)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                        no departments · <button className="btn btn-xs" style={{ marginLeft: 6 }} onClick={() => setShowCreateDept(o.id)}>
                          <Icon name="plus" size={10} />create one
                        </button>
                      </div>
                    )}
                    {rows.map((d, di) => {
                      const total = totalRequests(d);
                      const rate = total ? hitRate(d) : 0;
                      const deptDragging = drag && drag.kind === 'dept' && drag.id === d.id;
                      const deptBefore = dropTarget && dropTarget.kind === 'dept' && dropTarget.id === d.id && dropTarget.pos === 'before';
                      const deptAfter  = dropTarget && dropTarget.kind === 'dept' && dropTarget.id === d.id && dropTarget.pos === 'after';
                      return (
                        <React.Fragment key={d.id}>
                          {deptBefore && <div style={{ height: 2, background: 'var(--accent)', marginLeft: 58, marginRight: 12 }} />}
                          <div
                            draggable
                            onDragStart={onDragStart('dept', d.id, o.id)}
                            onDragOver={(e) => {
                              if (!drag || drag.kind !== 'dept') return;
                              const rect = e.currentTarget.getBoundingClientRect();
                              const y = e.clientY - rect.top;
                              const pos = y < rect.height / 2 ? 'before' : 'after';
                              onDragOver('dept', d.id, pos)(e);
                            }}
                            style={{
                              display: 'grid', gridTemplateColumns: '1fr 200px 160px 140px 100px', gap: 12,
                              padding: '8px 12px', alignItems: 'center',
                              borderBottom: di < rows.length - 1 ? '1px solid var(--border)' : 'none',
                              opacity: deptDragging ? 0.5 : 1,
                              background: deptDragging ? 'var(--bg-3)' : 'transparent',
                              cursor: 'grab',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 44 }}>
                              <span style={{ color: 'var(--fg-dimmer)', cursor: 'grab', fontSize: 10, fontFamily: 'monospace', userSelect: 'none' }}>⋮⋮</span>
                              <span style={{ color: 'var(--fg-dimmer)' }}>└</span>
                              <Icon name="hash" size={12} />
                              <span className="mono" style={{ fontWeight: 500 }}>{d.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <span className="pill pill-hit"><span className="pill-dot"></span>HIT {fmtNum(d.hits)}</span>
                              <span className="pill pill-miss"><span className="pill-dot"></span>MISS {fmtNum(d.misses)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="mono" style={{ minWidth: 48, fontSize: 12, color: rate >= 0.7 ? 'var(--accent)' : 'var(--fg)' }}>{total ? fmtPct(rate) : '—'}</span>
                              <div className="hbar" style={{ width: 70 }}><div className="hbar-fill" style={{ width: (rate*100)+'%' }} /></div>
                            </div>
                            <div className="mono dim" style={{ fontSize: 11 }}>{d.createdAt}</div>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              <button className="btn btn-xs">Open</button>
                            </div>
                          </div>
                          {deptAfter && <div style={{ height: 2, background: 'var(--accent)', marginLeft: 58, marginRight: 12 }} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
                {dropAfter && isOpen && <div style={{ height: 2, background: 'var(--accent)', margin: '0 12px' }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 12, padding: '10px 12px', fontSize: 11, color: 'var(--fg-dimmer)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 16 }}>
        <span>↕ drag rows to reorder</span>
        <span>→ drop a department onto an org to move it</span>
        <span>↓ click a row to expand</span>
      </div>

      {showCreateOrg && (
        <Modal
          title="Create organization"
          subtitle="Top-level container for your DejaQ deployment."
          onClose={() => setShowCreateOrg(false)}
          footer={<>
            <button className="btn" onClick={() => setShowCreateOrg(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createOrg} disabled={!newOrgName.trim()}>Create organization</button>
          </>}>
          <div className="field">
            <label className="field-label">Name</label>
            <input className="input" autoFocus value={newOrgName} onChange={e => setNewOrgName(e.target.value)} placeholder="e.g. Acme AI" onKeyDown={e => e.key === 'Enter' && createOrg()} />
            <div className="field-hint">
              will be slugged as: org_{newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14) || '—'}
            </div>
          </div>
        </Modal>
      )}

      {showCreateDept && (
        <Modal
          title="Create department"
          subtitle={`In organization ${orgs.find(o => o.id === showCreateDept)?.name}`}
          onClose={() => setShowCreateDept(null)}
          footer={<>
            <button className="btn" onClick={() => setShowCreateDept(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={createDept} disabled={!newDeptName.trim()}>Create department</button>
          </>}>
          <div className="field">
            <label className="field-label">Name</label>
            <input className="input" autoFocus value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="e.g. customer-support" onKeyDown={e => e.key === 'Enter' && createDept()} />
            <div className="field-hint">lowercase, hyphen-separated. visible to end users in logs.</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { OrgTreePage });
