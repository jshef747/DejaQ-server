// Analytics + Settings pages

function LineChart({ data1, data2, labels }) {
  const W = 900, H = 240, P = { t: 16, r: 16, b: 28, l: 40 };
  const max = Math.max(...data1) * 1.1;
  const xStep = (W - P.l - P.r) / (data1.length - 1);
  const y = v => H - P.b - (v / max) * (H - P.t - P.b);
  const path = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${P.l + i * xStep} ${y(v)}`).join(' ');
  const area = (data) => `${path(data)} L ${P.l + (data.length-1)*xStep} ${H - P.b} L ${P.l} ${H - P.b} Z`;

  const yTicks = 4;
  return (
    <div>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const yy = P.t + i * (H - P.t - P.b) / yTicks;
          const val = Math.round(max - i * max / yTicks);
          return (
            <g key={i}>
              <line x1={P.l} x2={W - P.r} y1={yy} y2={yy} stroke="#262626" strokeDasharray="2 3" />
              <text x={P.l - 8} y={yy + 3} fill="#6e6e6e" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end">
                {val >= 1000 ? (val/1000).toFixed(1)+'k' : val}
              </text>
            </g>
          );
        })}
        {/* x labels */}
        {labels.map((l, i) => (i % 5 === 0 || i === labels.length - 1) && (
          <text key={i} x={P.l + i * xStep} y={H - 8} fill="#6e6e6e" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">{l}</text>
        ))}
        {/* requests area */}
        <path d={area(data1)} fill="url(#reqGrad)" />
        <path d={path(data1)} fill="none" stroke="#f97316" strokeWidth="1.6" />
        {/* hits line */}
        <path d={path(data2)} fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
        {/* latest dot */}
        <circle cx={P.l + (data1.length - 1) * xStep} cy={y(data1[data1.length - 1])} r="3.5" fill="#f97316" stroke="#1c1c1c" strokeWidth="2" />
      </svg>
      <div className="chart-legend">
        <div className="chart-legend-item" style={{ color: '#f97316' }}><span className="legend-swatch"></span><span style={{ color: 'var(--fg-dim)' }}>Total requests</span></div>
        <div className="chart-legend-item" style={{ color: '#f59e0b' }}><span className="legend-swatch" style={{ background: 'repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 6px)' }}></span><span style={{ color: 'var(--fg-dim)' }}>Cache hits</span></div>
      </div>
    </div>
  );
}

function AnalyticsPage({ org, depts }) {
  const total = REQUEST_SERIES.reduce((a,b) => a+b, 0);
  const hits = HIT_SERIES.reduce((a,b) => a+b, 0);
  const rate = hits / total;
  const tokensSaved = Math.round(hits * 640); // avg prompt size heuristic
  const labels = Array.from({ length: 30 }, (_, i) => `d-${29 - i}`);
  const deptRows = (depts[org.id] || []).slice().sort((a,b) => totalRequests(b) - totalRequests(a));
  const totalReqDept = deptRows.reduce((a,d) => a + totalRequests(d), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            Cache performance for <span className="mono" style={{ color: 'var(--fg)' }}>{org.id}</span> over the last 30 days.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn"><Icon name="filter" size={11} />Last 30 days <Icon name="chev" size={11} /></button>
          <button className="btn"><Icon name="refresh" size={11} />Refresh</button>
          <button className="btn"><Icon name="download" size={11} />Export CSV</button>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <div className="metric-label">Total requests</div>
          <div className="metric-value">{(total/1000).toFixed(1)}k</div>
          <div className="metric-delta up">↑ 14.2% vs prev 30d</div>
        </div>
        <div className="metric">
          <div className="metric-label"><span className="pill-dot" style={{ background: 'var(--accent)' }}></span>Cache hit rate</div>
          <div className="metric-value" style={{ color: 'var(--accent)' }}>{fmtPct(rate)}</div>
          <div className="metric-delta up">↑ 3.1pts vs prev 30d</div>
        </div>
        <div className="metric">
          <div className="metric-label">Avg latency</div>
          <div className="metric-value">142<span style={{ fontSize: 14, color: 'var(--fg-dim)', fontWeight: 400, marginLeft: 4 }}>ms</span></div>
          <div className="metric-delta down">↓ 28% vs prev 30d</div>
        </div>
        <div className="metric">
          <div className="metric-label">Tokens saved (est.)</div>
          <div className="metric-value">{(tokensSaved/1e6).toFixed(1)}M</div>
          <div className="metric-delta up">≈ $312 in provider cost</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Requests over time</h3>
              <div className="card-sub">Hourly buckets · last 30 days · <span className="mono">UTC</span></div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-xs">1h</button>
              <button className="btn btn-xs" style={{ background: 'var(--bg-3)', color: 'var(--fg)' }}>24h</button>
              <button className="btn btn-xs">7d</button>
              <button className="btn btn-xs">30d</button>
            </div>
          </div>
          <div className="card-body">
            <LineChart data1={REQUEST_SERIES} data2={HIT_SERIES} labels={labels} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Model routing</h3>
              <div className="card-sub">Where cache misses got sent</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {[
              { model: 'claude-sonnet-4',  pct: 52, color: 'var(--accent)' },
              { model: 'claude-haiku-4-5', pct: 28, color: 'var(--amber)' },
              { model: 'gpt-5-mini',       pct: 14, color: 'var(--blue)' },
              { model: 'gemini-2.5-pro',   pct: 6,  color: 'var(--purple)' },
            ].map((r, i) => (
              <div key={r.model} style={{ padding: '11px 16px', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                  <span className="mono">{r.model}</span>
                  <span className="mono dim">{r.pct}%</span>
                </div>
                <div className="hbar"><div className="hbar-fill" style={{ width: r.pct + '%', background: r.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Department breakdown</h3>
            <div className="card-sub">Per-department cache performance for {org.name}</div>
          </div>
          <button className="btn btn-xs"><Icon name="download" size={11} />CSV</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Hit rate</th>
              <th>Hits</th>
              <th>Misses</th>
              <th>Requests</th>
              <th>Share of traffic</th>
            </tr>
          </thead>
          <tbody>
            {deptRows.map(d => {
              const rate = hitRate(d);
              const share = totalRequests(d) / (totalReqDept || 1);
              return (
                <tr key={d.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="hash" size={12} /><span className="mono">{d.name}</span>
                  </div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mono" style={{ minWidth: 48, color: rate >= 0.8 ? 'var(--accent)' : rate >= 0.6 ? 'var(--fg)' : 'var(--amber)' }}>{fmtPct(rate)}</span>
                      <div className="hbar" style={{ width: 100 }}><div className="hbar-fill" style={{ width: (rate*100)+'%' }} /></div>
                    </div>
                  </td>
                  <td className="mono" style={{ color: 'var(--accent)' }}>{fmtNum(d.hits)}</td>
                  <td className="mono" style={{ color: 'var(--amber)' }}>{fmtNum(d.misses)}</td>
                  <td className="mono">{fmtNum(totalRequests(d))}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mono dim" style={{ minWidth: 48 }}>{fmtPct(share)}</span>
                      <div className="hbar" style={{ width: 100 }}><div className="hbar-fill" style={{ width: (share*100)+'%', background: 'var(--fg-dimmer)' }} /></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPage({ org, orgs, setOrgs, setOrg, setPage }) {
  const [localModel, setLocalModel] = useState('llama32-1b');
  const [extModel, setExtModel] = useState('claude-sonnet');
  const [threshold, setThreshold] = useState(0.82);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const deleteOrg = () => {
    const rest = orgs.filter(o => o.id !== org.id);
    setOrgs(rest);
    setOrg(rest[0]);
    setShowDelete(false);
    setConfirmText('');
    setPage('organizations');
  };

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure cache behavior and model routing for <span className="mono" style={{ color: 'var(--fg)' }}>{org.id}</span>.</p>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">LLM Configuration</h2>
          <p className="settings-section-sub">Choose the local embedding model for semantic cache lookup and the fallback model for misses.</p>
        </div>
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="field">
              <label className="field-label">Local model (easy queries)</label>
              <select className="select" value={localModel} onChange={e => setLocalModel(e.target.value)}>
                {LOCAL_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.size}</option>
                ))}
              </select>
              <div className="field-hint">runs on-prem · handles queries scoring below the difficulty threshold</div>
            </div>
            <div className="field">
              <label className="field-label">External model (hard queries)</label>
              <select className="select" value={extModel} onChange={e => setExtModel(e.target.value)}>
                {EXTERNAL_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.provider}</option>
                ))}
              </select>
              <div className="field-hint">invoked on cache misses that exceed the difficulty threshold · billed to provider account</div>
            </div>
            <div className="field">
              <label className="field-label">Difficulty threshold</label>
              <div className="slider-row">
                <input className="slider" type="range" min="0" max="1" step="0.01" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} />
                <div className="slider-value">{threshold.toFixed(2)}</div>
              </div>
              <div className="field-hint">queries scoring above this value are routed to the external model · lower = more local, higher = more external</div>
            </div>
          </div>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn">Reset to defaults</button>
            <button className="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title" style={{ color: 'var(--red)' }}>Danger Zone</h2>
          <p className="settings-section-sub">Irreversible actions. Proceed with caution.</p>
        </div>
        <div className="card danger-zone">
          <div className="danger-row">
            <div className="danger-row-text">
              <h4>Delete organization</h4>
              <p>Permanently remove {org.name}, including all departments, API keys, and cache data.</p>
            </div>
            <button className="btn btn-danger" onClick={() => setShowDelete(true)} disabled={orgs.length <= 1}>
              <Icon name="trash" size={11} />Delete organization
            </button>
          </div>
        </div>
      </div>

      {showDelete && (
        <Modal
          title="Delete organization?"
          onClose={() => { setShowDelete(false); setConfirmText(''); }}
          footer={<>
            <button className="btn" onClick={() => { setShowDelete(false); setConfirmText(''); }}>Cancel</button>
            <button className="btn btn-danger" onClick={deleteOrg} disabled={confirmText !== org.name}>I understand, delete</button>
          </>}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, padding: 10, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 5 }}>
            <Icon name="warning" size={16} />
            <div style={{ fontSize: 12, lineHeight: 1.55 }}>
              This will permanently delete <b>{org.name}</b>, all of its departments, API keys, cached embeddings, and audit logs.
            </div>
          </div>
          <div className="field">
            <label className="field-label">Type <span className="mono" style={{ color: 'var(--red)' }}>{org.name}</span> to confirm</label>
            <input className="input" autoFocus value={confirmText} onChange={e => setConfirmText(e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { AnalyticsPage, SettingsPage });
