// Organizations, Departments, API Keys pages + their modals

function Modal({ title, subtitle, onClose, children, footer, width }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={width ? { width } : undefined} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {subtitle && <p className="modal-sub">{subtitle}</p>}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ——— Organizations ————————————————————————————————
function OrganizationsPage({ orgs, setOrgs }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const create = () => {
    if (!newName.trim()) return;
    const id = 'org_' + newName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14);
    const today = new Date().toISOString().slice(0, 10);
    setOrgs([{ id, name: newName.trim(), createdAt: today, members: 1 }, ...orgs]);
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-subtitle">Top-level tenants. Each org has its own departments, API keys, and cache namespace.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={12} />New organization
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" size={12} />
            <input placeholder="Search organizations…" />
            <span className="kbd">⌘K</span>
          </div>
          <button className="btn btn-xs"><Icon name="filter" size={11} />Filter</button>
          <button className="btn btn-xs"><Icon name="download" size={11} />Export</button>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Name</th>
              <th>Organization ID</th>
              <th>Members</th>
              <th>Created</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {orgs.map(o => (
              <tr key={o.id}>
                <td>
                  <span style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 4, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>
                    {o.name.slice(0, 1)}
                  </span>
                </td>
                <td style={{ fontWeight: 500 }}>{o.name}</td>
                <td className="mono dim">{o.id}</td>
                <td className="mono">{o.members}</td>
                <td className="mono dim">{o.createdAt}</td>
                <td><button className="btn btn-xs">Manage <Icon name="arrow" size={10} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal
          title="Create organization"
          subtitle="Organizations are the top-level container for your DejaQ deployment."
          onClose={() => setShowCreate(false)}
          footer={<>
            <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create} disabled={!newName.trim()}>Create organization</button>
          </>}>
          <div className="field">
            <label className="field-label">Name</label>
            <input className="input" autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Acme AI" onKeyDown={e => e.key === 'Enter' && create()} />
            <div className="field-hint">
              will be slugged as: org_{newName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14) || '—'}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ——— Departments ————————————————————————————————
function DepartmentsPage({ org, depts, setDepts }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const create = () => {
    if (!newName.trim()) return;
    const id = 'dept_' + Math.random().toString(36).slice(2, 8);
    const today = new Date().toISOString().slice(0, 10);
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-');
    setDepts({ ...depts, [org.id]: [{ id, name: slug, hits: 0, misses: 0, createdAt: today }, ...(depts[org.id] || [])] });
    setNewName('');
    setShowCreate(false);
  };

  const rows = depts[org.id] || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">
            Logical buckets inside <span className="mono" style={{ color: 'var(--fg)' }}>{org.id}</span>. Each department gets its own semantic cache partition and routing rules.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={12} />New department
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" size={12} />
            <input placeholder={`Filter departments in ${org.name}…`} />
          </div>
          <button className="btn btn-xs"><Icon name="filter" size={11} />Filter</button>
          <span style={{ marginLeft: 'auto' }} className="mono dimmer" >{rows.length} departments</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Cache stats (24h)</th>
              <th>Hit rate</th>
              <th>Requests</th>
              <th>Created</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--fg-dimmer)' }}>
                No departments yet. Create one to start partitioning traffic.
              </td></tr>
            )}
            {rows.map(d => {
              const total = totalRequests(d);
              const rate = total ? hitRate(d) : 0;
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="hash" size={12} />
                      <span className="mono" style={{ fontWeight: 500 }}>{d.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <span className="pill pill-hit"><span className="pill-dot"></span>HIT {fmtNum(d.hits)}</span>
                      <span className="pill pill-miss"><span className="pill-dot"></span>MISS {fmtNum(d.misses)}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mono" style={{ minWidth: 48, color: rate >= 0.7 ? 'var(--accent)' : 'var(--fg)' }}>{fmtPct(rate)}</span>
                      <div className="hbar" style={{ width: 80 }}><div className="hbar-fill" style={{ width: (rate*100)+'%' }} /></div>
                    </div>
                  </td>
                  <td className="mono">{fmtNum(total)}</td>
                  <td className="mono dim">{d.createdAt}</td>
                  <td><button className="btn btn-xs">Open <Icon name="arrow" size={10} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

// ——— API Keys ————————————————————————————————
function KeysPage({ keys, setKeys, orgs }) {
  const [confirm, setConfirm] = useState(null); // key being revoked

  const revoke = () => {
    setKeys(keys.filter(k => k.id !== confirm.id));
    setConfirm(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">API Keys</h1>
          <p className="page-subtitle">Secret keys scoped to an organization. Treat them like passwords — they are shown once at creation.</p>
        </div>
        <button className="btn btn-primary">
          <Icon name="plus" size={12} />Generate key
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search">
            <Icon name="search" size={12} />
            <input placeholder="Search by prefix or org…" />
          </div>
          <button className="btn btn-xs"><Icon name="filter" size={11} />Environment</button>
          <button className="btn btn-xs"><Icon name="filter" size={11} />Organization</button>
          <span style={{ marginLeft: 'auto' }} className="mono dimmer">{keys.length} active keys</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Organization</th>
              <th>Environment</th>
              <th>Created</th>
              <th>Last used</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ color: 'var(--fg)' }}>{maskKey(k.prefix, k.suffix)}</span>
                    <button className="btn btn-xs" title="Copy" style={{ padding: '2px 6px' }}>
                      <Icon name="copy" size={10} />
                    </button>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span className="mono dim">{orgs.find(o => o.id === k.orgId)?.name || k.orgId}</span>
                  </span>
                </td>
                <td>
                  {k.env === 'production'
                    ? <span className="pill pill-green"><span className="pill-dot"></span>production</span>
                    : <span className="pill pill-neutral">staging</span>}
                </td>
                <td className="mono dim">{k.createdAt}</td>
                <td className="mono dim">{k.lastUsed}</td>
                <td><button className="btn btn-xs btn-ghost-danger" onClick={() => setConfirm(k)}>
                  <Icon name="trash" size={10} />Revoke
                </button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirm && (
        <Modal
          title="Revoke API key?"
          onClose={() => setConfirm(null)}
          footer={<>
            <button className="btn" onClick={() => setConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={revoke}>Revoke key</button>
          </>}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, padding: 10, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 5 }}>
            <Icon name="warning" size={16} />
            <div style={{ fontSize: 12, lineHeight: 1.55 }}>
              Any services still using this key will <b>immediately stop working</b>. This cannot be undone.
            </div>
          </div>
          <div className="field">
            <label className="field-label">Key</label>
            <div className="mono" style={{ padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }}>
              {maskKey(confirm.prefix, confirm.suffix)}
            </div>
          </div>
          <div className="field">
            <label className="field-label">Organization</label>
            <div className="mono dim" style={{ fontSize: 12 }}>{orgs.find(o => o.id === confirm.orgId)?.name} · {confirm.orgId}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { Modal, OrganizationsPage, DepartmentsPage, KeysPage });
