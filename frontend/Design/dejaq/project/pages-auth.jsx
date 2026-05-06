// Auth + Onboarding screens
const { useState: useStateAuth, useEffect: useEffectAuth } = React;

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e && e.preventDefault();
    if (!email || !password || (mode === 'signup' && !name)) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuth({ email, name: name || email.split('@')[0], isNew: mode === 'signup' });
    }, 700);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)',
      display: 'grid', gridTemplateColumns: '1fr 1fr'
    }}>
      {/* Left marketing panel */}
      <div style={{
        background: 'linear-gradient(180deg, #181818 0%, #141414 100%)',
        borderRight: '1px solid var(--border)',
        padding: '40px 48px', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '28px 28px', opacity: 0.35, maskImage: 'radial-gradient(circle at 60% 40%, black 0%, transparent 70%)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div className="logo-mark" style={{ width: 28, height: 28, fontSize: 15 }}>Dq</div>
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em' }}>DejaQ</div>
        </div>

        <div style={{ marginTop: 64, position: 'relative' }}>
          <div style={{
            fontSize: 11, color: 'var(--accent)', letterSpacing: '0.08em',
            textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 14
          }}>semantic cache · for llm apps</div>
          <h1 style={{
            fontSize: 36, lineHeight: 1.15, letterSpacing: '-0.03em',
            fontWeight: 600, margin: 0, maxWidth: 440
          }}>
            Stop paying twice<br />
            for the <span style={{ color: 'var(--accent)' }}>same answer.</span>
          </h1>
          <p style={{ marginTop: 14, fontSize: 13, color: 'var(--fg-dim)', maxWidth: 420, lineHeight: 1.6 }}>
            Route repetitive queries to a local cache, hard queries to frontier models.
            Ship faster, cut provider bills by up to 80%.
          </p>
        </div>

        <div style={{ marginTop: 40, position: 'relative' }}>
          <div style={{
            border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-2)',
            overflow: 'hidden', maxWidth: 460
          }}>
            <div style={{
              padding: '7px 12px', fontSize: 10.5, color: 'var(--fg-dimmer)',
              fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>live · customer-support</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.2s infinite', boxShadow: '0 0 6px var(--green)' }}></span>
                streaming
              </span>
            </div>
            <div style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.9 }}>
              {[
                { t: '14:22:08', status: 'HIT',  ms: 86,   q: 'how do I rotate keys' },
                { t: '14:22:11', status: 'HIT',  ms: 94,   q: 'what plans are available' },
                { t: '14:22:14', status: 'MISS', ms: 1820, q: 'rate limits for bulk embed' },
                { t: '14:22:16', status: 'HIT',  ms: 71,   q: 'how to cancel my account' },
                { t: '14:22:19', status: 'HIT',  ms: 88,   q: 'whats ur refund policy' },
                { t: '14:22:22', status: 'HIT',  ms: 102,  q: 'reset password email' },
                { t: '14:22:26', status: 'MISS', ms: 1640, q: 'custom RBAC per department' },
                { t: '14:22:28', status: 'HIT',  ms: 79,   q: 'billing cycle renewal' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 52px 1fr 54px', gap: 10, alignItems: 'center', opacity: 1 - i * 0.06 }}>
                  <span style={{ color: 'var(--fg-dimmer)' }}>{row.t}</span>
                  <span style={{
                    color: row.status === 'HIT' ? 'var(--accent)' : 'var(--amber)',
                    fontWeight: 600
                  }}>{row.status}</span>
                  <span style={{ color: 'var(--fg-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.q}</span>
                  <span style={{ color: row.status === 'HIT' ? 'var(--accent)' : 'var(--fg-dim)', textAlign: 'right' }}>{row.ms}ms</span>
                </div>
              ))}
            </div>
            <div style={{
              padding: '8px 12px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-dimmer)'
            }}>
              <span>last 8 events · <span style={{ color: 'var(--accent)' }}>6 hits</span> · <span style={{ color: 'var(--amber)' }}>2 misses</span></span>
              <span>hit rate <span style={{ color: 'var(--accent)' }}>75%</span></span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 20, fontSize: 11, color: 'var(--fg-dimmer)', fontFamily: 'var(--font-mono)', position: 'relative' }}>
          <span>SOC 2 Type II</span>
          <span>·</span>
          <span>self-hostable</span>
          <span>·</span>
          <span>80% cheaper bills</span>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--fg-dim)', margin: '0 0 24px' }}>
            {mode === 'signin' ? 'Sign in to continue to DejaQ.' : 'Start caching queries in under 60 seconds.'}
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className="btn" style={{ flex: 1, justifyContent: 'center', padding: '9px 12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="btn" style={{ flex: 1, justifyContent: 'center', padding: '9px 12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.57v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.72.09-.72 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5.99.1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.24 3.22c0 4.61-2.81 5.63-5.48 5.92.42.38.81 1.12.81 2.27v3.36c0 .31.22.69.82.57A12 12 0 0 0 12 .3"/></svg>
              GitHub
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10.5, color: 'var(--fg-dimmer)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={submit}>
            {mode === 'signup' && (
              <div className="field">
                <label className="field-label">Full name</label>
                <input className="input" style={{ fontFamily: 'var(--font-sans)' }} value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" autoFocus />
              </div>
            )}
            <div className="field">
              <label className="field-label">Email</label>
              <input className="input" style={{ fontFamily: 'var(--font-sans)' }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" autoFocus={mode === 'signin'} />
            </div>
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="field-label">Password</label>
                {mode === 'signin' && <a href="#" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Forgot?</a>}
              </div>
              <input className="input" style={{ fontFamily: 'var(--font-sans)' }} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && (
              <div style={{ fontSize: 11.5, color: 'var(--red)', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px 12px' }} disabled={loading}>
              {loading ? 'Signing in…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
              {!loading && <Icon name="arrow" size={12} />}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12.5, color: 'var(--fg-dim)' }}>
            {mode === 'signin' ? <>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setMode('signup'); }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign up</a></>
                                : <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setMode('signin'); }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</a></>}
          </div>

          <div style={{ marginTop: 28, fontSize: 11, color: 'var(--fg-dimmer)', textAlign: 'center', lineHeight: 1.6 }}>
            By continuing you agree to our <a href="#" style={{ color: 'var(--fg-dim)' }}>Terms</a> and <a href="#" style={{ color: 'var(--fg-dim)' }}>Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

// ——— Onboarding ————————————————————————————————
function Onboarding({ user, onDone }) {
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState(user.name ? user.name + '\'s org' : '');
  const [deptName, setDeptName] = useState('customer-support');
  const [localModel, setLocalModel] = useState('llama32-1b');
  const [extModel, setExtModel] = useState('claude-sonnet');
  const [keyCopied, setKeyCopied] = useState(false);

  const generatedKey = React.useMemo(
    () => 'dq_live_' + Math.random().toString(36).slice(2, 6) + '_' + Math.random().toString(36).slice(2, 22),
    []
  );

  const steps = [
    { id: 'org', label: 'Create organization' },
    { id: 'dept', label: 'First department' },
    { id: 'models', label: 'Pick models' },
    { id: 'key', label: 'Generate API key' },
  ];

  const finish = () => {
    onDone({ orgName: orgName.trim(), deptName: deptName.trim(), localModel, extModel, apiKey: generatedKey });
  };

  const canNext =
    (step === 0 && orgName.trim().length > 1) ||
    (step === 1 && deptName.trim().length > 1) ||
    (step === 2) ||
    (step === 3 && keyCopied);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', display: 'flex', flexDirection: 'column' }}>
      {/* top bar */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="logo-mark">Dq</div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>DejaQ</div>
        <div style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>
          signed in as <span style={{ color: 'var(--fg)' }}>{user.email}</span>
          <button className="btn btn-xs" style={{ marginLeft: 10 }} onClick={finish}>Skip setup</button>
        </div>
      </div>

      {/* progress */}
      <div style={{ padding: '28px 40px 20px', borderBottom: '1px solid var(--border)', background: '#181818' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
                    background: i < step ? 'var(--accent)' : i === step ? 'var(--accent-bg)' : 'var(--bg-3)',
                    color: i < step ? '#1a0d00' : i === step ? 'var(--accent)' : 'var(--fg-dimmer)',
                    border: `1px solid ${i <= step ? 'var(--accent)' : 'var(--border-2)'}`,
                  }}>
                    {i < step ? <Icon name="check" size={12} /> : i + 1}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: i === step ? 'var(--fg)' : 'var(--fg-dim)',
                    fontWeight: i === step ? 500 : 400
                  }}>{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    flex: 1, height: 1, margin: '0 14px',
                    background: i < step ? 'var(--accent)' : 'var(--border-2)',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, padding: '40px 24px', display: 'grid', placeItems: 'start center', overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          {step === 0 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Name your organization</h1>
              <p style={{ fontSize: 13, color: 'var(--fg-dim)', margin: '0 0 24px' }}>
                Orgs are the top-level boundary for members, keys, and cached data. You can create more later.
              </p>
              <div className="field">
                <label className="field-label">Organization name</label>
                <input className="input" style={{ fontFamily: 'var(--font-sans)', padding: '10px 12px', fontSize: 14 }} autoFocus value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Acme AI" />
                <div className="field-hint">
                  will be slugged as: <span style={{ color: 'var(--accent)' }}>org_{orgName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14) || '…'}</span>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Create your first department</h1>
              <p style={{ fontSize: 13, color: 'var(--fg-dim)', margin: '0 0 24px' }}>
                Departments partition the cache by use case — e.g. separate support chat from docs Q&amp;A so their caches don't collide.
              </p>
              <div className="field">
                <label className="field-label">Department name</label>
                <input className="input" autoFocus value={deptName} onChange={e => setDeptName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="e.g. customer-support" />
                <div className="field-hint">lowercase, hyphen-separated · you can always add more departments later</div>
              </div>
              <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-dimmer)', marginBottom: 8 }}>common partitions</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['customer-support', 'docs-qa', 'sales-assistant', 'code-review', 'internal-ops'].map(s => (
                    <button key={s} className="btn btn-xs" style={{ fontFamily: 'var(--font-mono)' }} onClick={() => setDeptName(s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Choose your models</h1>
              <p style={{ fontSize: 13, color: 'var(--fg-dim)', margin: '0 0 24px' }}>
                DejaQ routes easy queries to a local model and hard queries to a frontier model. You can change this anytime in Settings.
              </p>
              <div className="field">
                <label className="field-label">Local model (easy queries)</label>
                <select className="select" value={localModel} onChange={e => setLocalModel(e.target.value)}>
                  {LOCAL_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.size}</option>
                  ))}
                </select>
                <div className="field-hint">runs on-prem · fast, cheap</div>
              </div>
              <div className="field">
                <label className="field-label">External model (hard queries)</label>
                <select className="select" value={extModel} onChange={e => setExtModel(e.target.value)}>
                  {EXTERNAL_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.provider}</option>
                  ))}
                </select>
                <div className="field-hint">frontier accuracy on the long tail · billed to provider account</div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Your first API key</h1>
              <p style={{ fontSize: 13, color: 'var(--fg-dim)', margin: '0 0 20px' }}>
                This is the only time you'll see this key. Store it in a secret manager.
              </p>
              <div style={{ padding: 14, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-dimmer)', marginBottom: 6 }}>API key · production</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border-2)', borderRadius: 4
                }}>
                  <span className="mono" style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--accent)' }}>{generatedKey}</span>
                  <button className="btn btn-xs" onClick={() => {
                    try { navigator.clipboard.writeText(generatedKey); } catch(_) {}
                    setKeyCopied(true);
                  }}>
                    {keyCopied ? <><Icon name="check" size={10} />Copied</> : <><Icon name="copy" size={10} />Copy</>}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, padding: 12, background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 6, marginBottom: 16 }}>
                <Icon name="warning" size={16} />
                <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--fg)' }}>
                  We'll only show this once. If you lose it, you can revoke and generate a new one.
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: keyCopied ? 'var(--fg)' : 'var(--fg-dim)' }}>
                <input type="checkbox" checked={keyCopied} onChange={e => setKeyCopied(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                I've saved this key somewhere safe.
              </label>
            </div>
          )}
        </div>
      </div>

      {/* footer */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '14px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#181818'
      }}>
        <button className="btn" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
          Back
        </button>
        <div className="mono dimmer" style={{ fontSize: 11 }}>step {step + 1} of {steps.length}</div>
        {step < steps.length - 1
          ? <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(s => s + 1)}>
              Continue <Icon name="arrow" size={12} />
            </button>
          : <button className="btn btn-primary" disabled={!canNext} onClick={finish}>
              Go to dashboard <Icon name="arrow" size={12} />
            </button>}
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen, Onboarding });
