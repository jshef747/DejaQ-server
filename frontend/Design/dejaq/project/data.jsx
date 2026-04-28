// Mock data + shared helpers for DejaQ
const ORGS = [
  { id: 'org_acme', name: 'Acme AI', createdAt: '2025-01-14', members: 12 },
  { id: 'org_loopwork', name: 'Loopwork Labs', createdAt: '2025-03-02', members: 4 },
  { id: 'org_northpole', name: 'Northpole Systems', createdAt: '2024-11-21', members: 28 },
  { id: 'org_parabola', name: 'Parabola Robotics', createdAt: '2025-02-18', members: 7 },
  { id: 'org_quanta', name: 'Quanta Health', createdAt: '2024-09-07', members: 34 },
  { id: 'org_stripewise', name: 'Stripewise', createdAt: '2025-04-01', members: 2 },
];

const DEPARTMENTS = {
  org_acme: [
    { id: 'dept_support', name: 'customer-support', hits: 18420, misses: 2310, createdAt: '2025-01-15' },
    { id: 'dept_sales',   name: 'sales-assistant',  hits: 9214, misses: 4150, createdAt: '2025-01-22' },
    { id: 'dept_intops',  name: 'internal-ops',     hits: 3108, misses: 1290, createdAt: '2025-02-04' },
    { id: 'dept_docs',    name: 'docs-qa',          hits: 27340, misses: 1840, createdAt: '2025-02-19' },
    { id: 'dept_code',    name: 'code-review',      hits: 4520, misses: 3210, createdAt: '2025-03-11' },
  ],
  org_loopwork: [
    { id: 'dept_lw_1', name: 'product-copy',  hits: 2104, misses: 890, createdAt: '2025-03-03' },
    { id: 'dept_lw_2', name: 'release-notes', hits: 1180, misses: 330, createdAt: '2025-03-18' },
  ],
  org_northpole: [
    { id: 'dept_np_1', name: 'freight-routing',   hits: 54210, misses: 8840, createdAt: '2024-12-02' },
    { id: 'dept_np_2', name: 'customer-chat',     hits: 31220, misses: 5410, createdAt: '2024-12-09' },
    { id: 'dept_np_3', name: 'weather-advisory',  hits: 7840,  misses: 2110, createdAt: '2025-01-20' },
    { id: 'dept_np_4', name: 'inventory-lookup',  hits: 18330, misses: 1440, createdAt: '2025-02-02' },
  ],
  org_parabola: [
    { id: 'dept_pb_1', name: 'telemetry-qa',     hits: 8120, misses: 2430, createdAt: '2025-02-19' },
    { id: 'dept_pb_2', name: 'firmware-diag',    hits: 3210, misses: 1820, createdAt: '2025-03-01' },
  ],
  org_quanta: [
    { id: 'dept_qu_1', name: 'clinical-intake',  hits: 22140, misses: 3210, createdAt: '2024-09-10' },
    { id: 'dept_qu_2', name: 'records-summary',  hits: 14080, misses: 2180, createdAt: '2024-10-04' },
    { id: 'dept_qu_3', name: 'provider-chat',    hits: 9210,  misses: 1420, createdAt: '2024-11-18' },
  ],
  org_stripewise: [
    { id: 'dept_sw_1', name: 'invoice-classify', hits: 420, misses: 180, createdAt: '2025-04-02' },
  ],
};

const API_KEYS = [
  { id: 'k_01', prefix: 'dq_live_7hQ2', suffix: 'r8x1', orgId: 'org_acme',       createdAt: '2025-01-15', lastUsed: '2026-04-18', env: 'production' },
  { id: 'k_02', prefix: 'dq_test_Tp93', suffix: 'a02e', orgId: 'org_acme',       createdAt: '2025-01-20', lastUsed: '2026-04-17', env: 'staging' },
  { id: 'k_03', prefix: 'dq_live_Yv4k', suffix: 'c9m2', orgId: 'org_northpole',  createdAt: '2024-12-01', lastUsed: '2026-04-18', env: 'production' },
  { id: 'k_04', prefix: 'dq_live_JmN8', suffix: 'zq44', orgId: 'org_northpole',  createdAt: '2025-01-02', lastUsed: '2026-04-16', env: 'production' },
  { id: 'k_05', prefix: 'dq_live_Bk3p', suffix: 'h7w1', orgId: 'org_loopwork',   createdAt: '2025-03-04', lastUsed: '2026-04-18', env: 'production' },
  { id: 'k_06', prefix: 'dq_test_Lw0r', suffix: 'e2qa', orgId: 'org_parabola',   createdAt: '2025-02-20', lastUsed: '2026-04-12', env: 'staging' },
  { id: 'k_07', prefix: 'dq_live_Fz61', suffix: 'nx9s', orgId: 'org_quanta',     createdAt: '2024-09-11', lastUsed: '2026-04-18', env: 'production' },
  { id: 'k_08', prefix: 'dq_live_Pq7w', suffix: 'u3fb', orgId: 'org_quanta',     createdAt: '2024-10-08', lastUsed: '2026-04-15', env: 'production' },
  { id: 'k_09', prefix: 'dq_test_Gm2d', suffix: 'o4rk', orgId: 'org_stripewise', createdAt: '2025-04-02', lastUsed: '2026-04-17', env: 'staging' },
];

// ~30 data points, last 30 days
const REQUEST_SERIES = [
  1200, 1380, 1410, 1500, 1620, 1700, 1680, 1820, 1900, 2010,
  2140, 2300, 2250, 2380, 2510, 2680, 2740, 2900, 2880, 3010,
  3180, 3240, 3400, 3460, 3590, 3710, 3850, 3920, 4080, 4210,
];
const HIT_SERIES = [
   900, 1030, 1060, 1135, 1230, 1280, 1270, 1390, 1460, 1540,
  1640, 1760, 1720, 1830, 1950, 2100, 2150, 2290, 2270, 2380,
  2540, 2600, 2740, 2790, 2900, 3000, 3130, 3190, 3330, 3450,
];

const LOCAL_MODELS = [
  { id: 'qwen25-05b',    name: 'qwen2.5-0.5b-instruct', size: '500M', type: 'llm' },
  { id: 'llama32-1b',    name: 'llama-3.2-1b-instruct', size: '1.2B', type: 'llm' },
  { id: 'phi35-mini',    name: 'phi-3.5-mini-instruct', size: '3.8B', type: 'llm' },
  { id: 'gemma2-2b',     name: 'gemma-2-2b-it',         size: '2.6B', type: 'llm' },
  { id: 'qwen25-3b',     name: 'qwen2.5-3b-instruct',   size: '3.1B', type: 'llm' },
  { id: 'llama32-3b',    name: 'llama-3.2-3b-instruct', size: '3.2B', type: 'llm' },
];
const EXTERNAL_MODELS = [
  { id: 'claude-opus',    name: 'claude-opus-4',    provider: 'anthropic' },
  { id: 'claude-sonnet',  name: 'claude-sonnet-4',  provider: 'anthropic' },
  { id: 'claude-haiku',   name: 'claude-haiku-4-5', provider: 'anthropic' },
  { id: 'gpt-5',          name: 'gpt-5',            provider: 'openai' },
  { id: 'gpt-5-mini',     name: 'gpt-5-mini',       provider: 'openai' },
  { id: 'gemini-25-pro',  name: 'gemini-2.5-pro',   provider: 'google' },
  { id: 'llama-4-70b',    name: 'llama-4-70b',      provider: 'meta' },
];

function maskKey(prefix, suffix) {
  return `${prefix}_••••••••••••••••_${suffix}`;
}
function orgName(id) {
  const o = ORGS.find(x => x.id === id);
  return o ? o.name : '—';
}
function totalRequests(dept) { return dept.hits + dept.misses; }
function hitRate(dept) { return dept.hits / (dept.hits + dept.misses); }
function fmtNum(n) { return n.toLocaleString('en-US'); }
function fmtPct(n, digits = 1) { return (n * 100).toFixed(digits) + '%'; }

// Icons (lucide-ish, stroke-based)
const Icon = ({ name, size = 14 }) => {
  const paths = {
    building: <><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    key: <><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.5 12.5 10-10"/><path d="m16.5 6.5 3 3"/><path d="m19 4 3 3"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 15 3-4 4 3 5-6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    chev: <><path d="m6 9 6 6 6-6"/></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></>,
    zap: <><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    warning: <><path d="m21 16-9-14-9 14h18z"/><path d="M12 8v5M12 17h0"/></>,
    filter: <><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></>,
    x: <><path d="M18 6 6 18M6 6l12 12"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
    arrow: <><path d="m9 18 6-6-6-6"/></>,
    cpu: <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></>,
    cloud: <><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></>,
    hash: <><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></>,
    db: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

Object.assign(window, { ORGS, DEPARTMENTS, API_KEYS, REQUEST_SERIES, HIT_SERIES, LOCAL_MODELS, EXTERNAL_MODELS, maskKey, orgName, totalRequests, hitRate, fmtNum, fmtPct, Icon });
