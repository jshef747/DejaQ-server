// Chat demo page with live request inspector

function ChatPage({ org }) {
  const initialMessages = [
    { role: 'user', text: 'How do I rotate an API key without downtime?', cached: false, reqId: 'req_01HJK8ZT' },
    { role: 'bot',  text: 'Generate a new key first, deploy it alongside the old one, then revoke the old key after confirming traffic has fully shifted. Most teams allow a 24-48h overlap window.',
      meta: { status: 'MISS', latency: 1842, model: 'claude-sonnet-4', reqId: 'req_01HJK8ZT' } },
    { role: 'user', text: 'What\'s the best way to rotate keys safely?', cached: true, reqId: 'req_01HJK9B2' },
    { role: 'bot',  text: 'Generate a new key first, deploy it alongside the old one, then revoke the old key after confirming traffic has fully shifted. Most teams allow a 24-48h overlap window.',
      meta: { status: 'HIT', latency: 86, model: 'cache:dq_local', reqId: 'req_01HJK9B2', similarity: 0.91 } },
  ];
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(null);
  const [selectedReq, setSelectedReq] = useState('req_01HJK9B2');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

  const send = () => {
    if (!input.trim()) return;
    const reqId = 'req_' + Math.random().toString(36).slice(2, 10).toUpperCase();
    const cached = Math.random() > 0.45;
    const userMsg = { role: 'user', text: input, reqId, cached };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setSelectedReq(reqId);
    setPending({ reqId, stage: 0, cached });

    const stages = cached
      ? [140, 280, 440, 620]    // cache hit path
      : [160, 320, 520, 740, 1680]; // miss path

    stages.forEach((ms, i) => {
      setTimeout(() => setPending(p => p && ({ ...p, stage: i + 1 })), ms);
    });

    setTimeout(() => {
      const latency = cached ? 92 + Math.floor(Math.random()*30) : 1400 + Math.floor(Math.random()*600);
      const model = cached ? 'cache:dq_local' : 'claude-sonnet-4';
      const botText = cached
        ? 'Returned from semantic cache. Semantic match found at similarity 0.88 against a prior query in this department.'
        : 'I ran a fresh completion. Would you like me to explain the reasoning or just give the short version?';
      setMessages(m => [...m, {
        role: 'bot', text: botText,
        meta: { status: cached ? 'HIT' : 'MISS', latency, model, reqId, similarity: cached ? 0.88 : undefined }
      }]);
      setPending(null);
    }, stages[stages.length - 1] + 200);
  };

  // Build inspector rows from messages history
  const requests = messages
    .filter(m => m.role === 'bot' && m.meta)
    .map(m => ({
      ...m.meta,
      query: messages.find(x => x.reqId === m.meta.reqId && x.role === 'user')?.text || ''
    }))
    .reverse();
  const activeReq = requests.find(r => r.reqId === selectedReq) || requests[0];

  return (
    <div className="chat-layout">
      <div className="chat-pane">
        <div className="chat-header">
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Chat playground</div>
            <div className="mono dim" style={{ fontSize: 11 }}>
              {org.name} · dept: <span style={{ color: 'var(--accent)' }}>customer-support</span> · <span className="status-dot"></span>connected
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-xs"><Icon name="refresh" size={11} />Reset</button>
            <button className="btn btn-xs">Copy cURL</button>
          </div>
        </div>

        <div className="chat-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'msg-user' : 'msg-bot'}`}
              onClick={() => m.reqId && setSelectedReq(m.reqId)}
              style={m.reqId ? { cursor: 'pointer' } : {}}>
              {m.text}
              {m.meta && (
                <div className="msg-meta" style={{ color: 'var(--fg-dim)' }}>
                  <span className={`pill ${m.meta.status === 'HIT' ? 'pill-hit' : 'pill-miss'}`} style={{ fontSize: 9.5 }}>
                    <span className="pill-dot"></span>{m.meta.status}
                  </span>
                  <span>{m.meta.latency}ms</span>
                  <span>{m.meta.model}</span>
                  <span className="dimmer">{m.meta.reqId}</span>
                </div>
              )}
            </div>
          ))}
          {pending && (
            <div className="msg msg-bot">
              <div className="typing"><span></span><span></span><span></span></div>
              <div className="msg-meta" style={{ color: 'var(--fg-dim)' }}>
                <span className="mono">running pipeline…</span>
                <span className="dimmer">{pending.reqId}</span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <textarea
            placeholder="Ask anything — e.g. how do I rotate an API key?"
            value={input}
            rows={1}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <button className="btn btn-primary" onClick={send} disabled={!input.trim() || pending}>
            <Icon name="send" size={12} />Send
          </button>
        </div>
      </div>

      <div className="inspector">
        <div className="inspector-header">
          <div className="inspector-title">Request inspector</div>
          <button className="btn btn-xs"><Icon name="download" size={11} />Trace</button>
        </div>
        <div className="inspector-body">
          {pending && (
            <div className="inspector-req" style={{ borderColor: 'var(--accent-border)' }}>
              <div className="inspector-req-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="pill pill-neutral"><span className="pill-dot" style={{ background: 'var(--accent)', animation: 'pulse 1s infinite' }}></span>LIVE</span>
                  <span className="inspector-req-id">{pending.reqId}</span>
                </div>
                <span className="mono dim" style={{ fontSize: 10 }}>now</span>
              </div>
              <div className="inspector-req-body">
                <PipelineStages stage={pending.stage} cached={pending.cached} />
              </div>
            </div>
          )}
          {!pending && !activeReq && (
            <div className="inspector-empty">Send a message to see the request pipeline.</div>
          )}
          {!pending && activeReq && (
            <div className="inspector-req">
              <div className="inspector-req-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`pill ${activeReq.status === 'HIT' ? 'pill-hit' : 'pill-miss'}`}>
                    <span className="pill-dot"></span>{activeReq.status}
                  </span>
                  <span className="inspector-req-id">{activeReq.reqId}</span>
                </div>
                <span className="mono dim" style={{ fontSize: 10 }}>just now</span>
              </div>
              <div className="inspector-req-body">
                <div className="stage-label" style={{ marginBottom: 6 }}>Query</div>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg)', padding: '6px 8px', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)', marginBottom: 12, lineHeight: 1.5 }}>
                  {activeReq.query}
                </div>
                <PipelineStages stage={99} cached={activeReq.status === 'HIT'} req={activeReq} />
                <div className="inspector-footer-row">
                  <div className="metric-mini"><span style={{ color: 'var(--fg-dimmer)' }}>model</span> <b>{activeReq.model}</b></div>
                  <div className="metric-mini"><span style={{ color: 'var(--fg-dimmer)' }}>latency</span> <b style={{ color: activeReq.status === 'HIT' ? 'var(--accent)' : 'var(--amber)' }}>{activeReq.latency}ms</b></div>
                </div>
              </div>
            </div>
          )}

          {!pending && requests.length > 1 && (
            <>
              <div className="stage-label" style={{ padding: '8px 4px 6px' }}>Recent requests</div>
              {requests.filter(r => r.reqId !== (activeReq && activeReq.reqId)).slice(0, 8).map(r => (
                <button key={r.reqId}
                  onClick={() => setSelectedReq(r.reqId)}
                  style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 8, alignItems: 'center',
                    padding: '8px 10px', width: '100%', textAlign: 'left',
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: 5,
                    color: 'var(--fg)', marginBottom: 6, cursor: 'pointer'
                  }}>
                  <span className={`pill ${r.status === 'HIT' ? 'pill-hit' : 'pill-miss'}`} style={{ fontSize: 9.5 }}>
                    <span className="pill-dot"></span>{r.status}
                  </span>
                  <span className="mono" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.query}
                  </span>
                  <span className="mono dim" style={{ fontSize: 10 }}>{r.latency}ms</span>
                  <span className="mono dimmer" style={{ fontSize: 10 }}>{r.reqId.slice(-6)}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineStages({ stage, cached, req }) {
  // stages: 1 enriched, 2 normalized, 3 cache lookup, 4 routed, 5 response
  const defs = cached ? [
    { label: 'enriched',      value: 'dept=customer-support, org=' + (req?.reqId ? 'acme' : '…'), time: '12ms' },
    { label: 'normalized',    value: 'stopwords stripped, lowercased', time: '4ms' },
    { label: 'cache lookup',  value: req ? `hit · sim=${req.similarity?.toFixed(2) ?? '0.88'}` : 'querying kv store…', time: '68ms' },
    { label: 'routed to',     value: 'cache:dq_local',  time: '—' },
  ] : [
    { label: 'enriched',      value: 'dept=customer-support, org=acme', time: '14ms' },
    { label: 'normalized',    value: 'stopwords stripped, lowercased', time: '6ms' },
    { label: 'cache lookup',  value: 'miss · best sim=0.42 (below 0.82)', time: '72ms' },
    { label: 'difficulty',    value: 'score=0.61 → fallback', time: '8ms' },
    { label: 'routed to',     value: req?.model || 'claude-sonnet-4', time: req ? `${req.latency}ms` : 'streaming…' },
  ];
  return (
    <div className="pipeline-stages">
      {defs.map((s, i) => {
        const done = i < stage;
        const active = i === stage - 1;
        const isLast = i === defs.length - 1;
        return (
          <div key={s.label} className="stage" style={{ opacity: stage === 99 || done || active ? 1 : 0.35 }}>
            <div className="stage-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: stage === 99 || done
                  ? (isLast && cached ? 'var(--accent)' : isLast && !cached ? 'var(--amber)' : 'var(--green)')
                  : active ? 'var(--accent)' : 'var(--border-2)',
                boxShadow: active ? '0 0 6px var(--accent)' : 'none',
              }}></span>
              {s.label}
            </div>
            <div className="stage-value">{stage === 99 || done ? s.value : active ? <span className="dim">running…</span> : <span className="dimmer">pending</span>}</div>
            <div className="stage-time">{stage === 99 || done ? s.time : ''}</div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { ChatPage });
