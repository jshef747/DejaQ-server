// Sidebar + top app shell
const { useState, useEffect, useMemo, useRef } = React;

function Sidebar({ page, setPage, org, setOrg, orgs, showOrgMenu, setShowOrgMenu, user, onSignOut }) {
  const nav = [
    { id: 'analytics',     label: 'Analytics',     icon: 'chart' },
    { id: 'organizations', label: 'Organizations', icon: 'building' },
    { id: 'departments',   label: 'Departments',   icon: 'users' },
    { id: 'keys',          label: 'API Keys',      icon: 'key' },
    { id: 'chat',          label: 'Chat demo',     icon: 'chat' },
  ];
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">Dq</div>
        <div className="logo-text">DejaQ</div>
        <div className="logo-sub">v0.4.2</div>
      </div>

      <div style={{ position: 'relative' }}>
        <button className="org-switcher" onClick={() => setShowOrgMenu(v => !v)}>
          <span style={{ width: 14, height: 14, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 3, display: 'grid', placeItems: 'center', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 }}>
            {org.name.slice(0,1)}
          </span>
          <span className="org-switcher-name">{org.name}</span>
          <Icon name="chev" size={12} />
        </button>
        {showOrgMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
            background: '#1e1e1e', border: '1px solid var(--border-2)', borderRadius: 5,
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)', zIndex: 50, padding: 4
          }}>
            {orgs.map(o => (
              <button key={o.id}
                onClick={() => { setOrg(o); setShowOrgMenu(false); }}
                className="nav-item"
                style={{ background: o.id === org.id ? 'var(--bg-3)' : 'transparent' }}>
                <span className="mono dim" style={{ fontSize: 11, width: 56, overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.id}</span>
                <span>{o.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="nav-section-label">Workspace</div>
      {nav.map(n => (
        <button key={n.id}
          className={`nav-item ${page === n.id ? 'active' : ''}`}
          onClick={() => setPage(n.id)}>
          <Icon name={n.icon} size={14} />
          {n.label}
        </button>
      ))}

      <div className="nav-section-label">Account</div>
      <button className={`nav-item ${page === 'settings' ? 'active' : ''}`} onClick={() => setPage('settings')}>
        <Icon name="settings" size={14} />Settings
      </button>

      <div className="sidebar-footer">
        <div className="avatar">{user ? (user.name || user.email).slice(0,2).toUpperCase() : 'JL'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user ? (user.name || user.email.split('@')[0]) : 'Jordan Liu'}</div>
          <div className="sidebar-user-role">owner</div>
        </div>
        {onSignOut && (
          <button className="btn btn-xs" style={{ padding: '3px 6px' }} onClick={onSignOut} title="Sign out">
            <Icon name="x" size={10} />
          </button>
        )}
      </div>
    </aside>
  );
}

function Topbar({ page, org }) {
  const crumbs = {
    analytics: ['Analytics', 'Overview'],
    organizations: ['Organizations'],
    departments: ['Organizations', org.name, 'Departments'],
    keys: ['API Keys'],
    chat: ['Playground', 'Chat demo'],
    settings: ['Settings', 'Configuration'],
  }[page] || ['—'];
  return (
    <div className="topbar">
      <div className="breadcrumbs">
        <span className="mono dim">{org.id}</span>
        <span className="sep">/</span>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'current' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-right">
        <div className="env-pill"><span className="status-dot"></span>all systems operational</div>
        <div className="env-pill">region: us-east-1</div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar });
