import React, { useState, useEffect } from 'react';
import {
  Users, Landmark, Search, ArrowUpRight, ArrowDownLeft,
  ShieldCheck, LayoutDashboard, Wallet, Settings,
  Bell, Menu, X, CheckCircle2, AlertCircle, Clock,
  Activity, TrendingUp, Monitor, Smartphone, Tablet,
  ChevronDown, RefreshCw, MoreVertical
} from 'lucide-react';

// ── Sparkline SVG ──────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = '#4f46e5', height = 40 }) => {
  const w = 120, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${h} ` + pts + ` ${w},${h}`;
  const id = `sg${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${id})`} points={area} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
};

// ── Horizontal Bar ─────────────────────────────────────────────────────────────
const HBar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
      <span style={{ fontSize: '12px', color: '#d1d5db' }}>{label}</span>
      <span style={{ fontSize: '12px', color: '#f9fafb', fontWeight: 700 }}>{value.toLocaleString()}</span>
    </div>
    <div style={{ height: '6px', background: '#1f2937', borderRadius: '99px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: '99px' }} />
    </div>
  </div>
);

// ── Donut Chart (SVG) ──────────────────────────────────────────────────────────
const DonutChart = ({ segments }) => {
  const r = 70, cx = 80, cy = 80, strokeW = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth={strokeW} />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={strokeW}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-(offset / 100) * circ}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        );
        offset += seg.pct;
        return el;
      })}
    </svg>
  );
};

// ── Heatmap ────────────────────────────────────────────────────────────────────
const HeatmapGrid = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 18 }, (_, i) => `${i + 1}h`);
  const cell = (i, j) => {
    const v = Math.sin(i * 3.7 + j * 1.3) * 0.5 + 0.5;
    return v > 0.6 ? '#4ade80' : v > 0.3 ? '#86efac' : '#bbf7d0';
  };
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(18,1fr)`, gap: '3px', minWidth: '560px' }}>
        <div />
        {hours.map(h => <div key={h} style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', paddingBottom: '4px' }}>{h}</div>)}
        {days.map((day, di) => (
          <React.Fragment key={day}>
            <div style={{ fontSize: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>{day}</div>
            {hours.map((_, hi) => (
              <div key={hi} style={{ height: '20px', borderRadius: '3px', background: cell(di, hi) }} />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
        {[['#4ade80', '51–100'], ['#bbf7d0', '0–50']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: c }} />
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bankDetails, setBankDetails] = useState([]);
  const [quantifyHistory, setQuantifyHistory] = useState([]);
  const [timeFilter, setTimeFilter] = useState('6M');

  const spark1 = [30, 45, 28, 60, 52, 75, 68, 90, 72, 88, 95, 82];
  const spark2 = [80, 65, 90, 55, 70, 45, 60, 75, 50, 68, 72, 58];
  const barData = [40, 55, 35, 70, 60, 80, 55, 90, 65, 75, 85, 70];

  const countryData = [
    { name: 'India', value: 1010, color: '#7c3aed' },
    { name: 'United States', value: 1640, color: '#7c3aed' },
    { name: 'China', value: 490, color: '#06b6d4' },
    { name: 'Indonesia', value: 1255, color: '#06b6d4' },
    { name: 'Russia', value: 1050, color: '#f97316' },
    { name: 'Bangladesh', value: 689, color: '#7c3aed' },
    { name: 'Canada', value: 800, color: '#7c3aed' },
    { name: 'Brazil', value: 420, color: '#eab308' },
    { name: 'Vietnam', value: 1085, color: '#7c3aed' },
    { name: 'UK', value: 589, color: '#7c3aed' },
  ];
  const maxC = Math.max(...countryData.map(c => c.value));

  const topPages = [
    { path: '/themesbrand/skote-25867', active: 99, pct: '25.3%' },
    { path: '/dashonic/chat-24518', active: 86, pct: '22.7%' },
    { path: '/skote/timeline-27391', active: 64, pct: '18.7%' },
    { path: '/themesbrand/minia-26441', active: 53, pct: '14.2%' },
    { path: '/dashon/dashboard-29873', active: 33, pct: '12.6%' },
    { path: '/doot/chats-29964', active: 20, pct: '10.9%' },
    { path: '/minton/pages-29739', active: 10, pct: '7.3%' },
  ];

  const referrals = [
    { site: 'www.google.com', pct: 24.58, color: '#4f46e5' },
    { site: 'www.youtube.com', pct: 17.51, color: '#7c3aed' },
    { site: 'www.meta.com', pct: 23.05, color: '#06b6d4' },
    { site: 'www.medium.com', pct: 12.22, color: '#eab308' },
    { site: 'Other', pct: 17.58, color: '#f97316' },
  ];

  const durationRows = [
    { range: '0-30', sessions: '2,250', views: '4,250' },
    { range: '31-60', sessions: '1,501', views: '2,050' },
    { range: '61-120', sessions: '750', views: '1,600' },
    { range: '121-240', sessions: '540', views: '1,040' },
  ];

  const demoBanks = () => [
    { _id: 'd1', userId: { name: 'Rajesh Kumar', phone: '+91 98765 43210' }, accountHolder: 'Rajesh Kumar', accountNumber: '123456789012', ifsc: 'HDFC0001234', bankName: 'HDFC Bank', status: 'Verified', submittedAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'd2', userId: { name: 'Priya Sharma', phone: '+91 87654 32109' }, accountHolder: 'Priya Sharma', accountNumber: '987654321098', ifsc: 'ICIC0005678', bankName: 'ICICI Bank', status: 'Pending', submittedAt: new Date(Date.now() - 172800000).toISOString() },
    { _id: 'd3', userId: { name: 'Amit Patel', phone: '+91 76543 21098' }, accountHolder: 'Amit Patel', accountNumber: '456789012345', ifsc: 'SBIN0009012', bankName: 'SBI', status: 'Rejected', submittedAt: new Date(Date.now() - 259200000).toISOString() },
    { _id: 'd4', userId: { name: 'Sneha Gupta', phone: '+91 65432 10987' }, accountHolder: 'Sneha Gupta', accountNumber: '234567890123', ifsc: 'AXIS0003456', bankName: 'Axis Bank', status: 'Pending', submittedAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'd5', userId: { name: 'Vikram Singh', phone: '+91 54321 09876' }, accountHolder: 'Vikram Singh', accountNumber: '678901234567', ifsc: 'PNB0007890', bankName: 'PNB', status: 'Verified', submittedAt: new Date(Date.now() - 345600000).toISOString() },
  ];

  const demoQuantify = () => [
    { _id: 'q1', userId: { name: 'Rajesh Kumar', phone: '+91 98765 43210' }, balance: 5000, approvedDepositAmount: 10000, todayEarning: 900, totalRevenue: 15900, isQuantifying: true, lastUpdated: new Date().toISOString() },
    { _id: 'q2', userId: { name: 'Priya Sharma', phone: '+91 87654 32109' }, balance: 3000, approvedDepositAmount: 7500, todayEarning: 630, totalRevenue: 11130, isQuantifying: false, lastUpdated: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'q3', userId: { name: 'Amit Patel', phone: '+91 76543 21098' }, balance: 8000, approvedDepositAmount: 15000, todayEarning: 1380, totalRevenue: 24380, isQuantifying: true, lastUpdated: new Date().toISOString() },
    { _id: 'q4', userId: { name: 'Sneha Gupta', phone: '+91 65432 10987' }, balance: 2500, approvedDepositAmount: 5000, todayEarning: 450, totalRevenue: 7950, isQuantifying: false, lastUpdated: new Date(Date.now() - 172800000).toISOString() },
  ];

  useEffect(() => {
    if (activeTab === 'bank') setBankDetails(demoBanks());
    if (activeTab === 'quantify') setQuantifyHistory(demoQuantify());
  }, [activeTab]);

  const updateBankStatus = (id, status) =>
    setBankDetails(prev => prev.map(b => b._id === id ? { ...b, status } : b));

  // ── Shared styles ──────────────────────────────────────────────────────────
  const card = { background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '20px' };
  const th = { fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #374151' };
  const td = { fontSize: '13px', color: '#d1d5db', padding: '10px 12px', borderBottom: '1px solid #1f2937' };

  const badge = v => ({
    padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
    background: v === 'Verified' || v === 'Active' ? 'rgba(74,222,128,0.12)' : v === 'Pending' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
    color: v === 'Verified' || v === 'Active' ? '#4ade80' : v === 'Pending' ? '#fbbf24' : '#f87171',
  });

  const pill = active => ({
    padding: '3px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
    border: 'none', cursor: 'pointer',
    background: active ? '#4f46e5' : 'transparent',
    color: active ? '#fff' : '#6b7280',
  });

  const navBtn = active => ({
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
    padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? 'rgba(79,70,229,0.15)' : 'transparent',
    color: active ? '#818cf8' : '#6b7280',
    fontSize: '13px', fontWeight: active ? 700 : 500,
    borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
    marginBottom: '2px',
  });

  const chg = up => ({ fontSize: '11px', fontWeight: 700, color: up ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '2px' });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'deposits', label: 'Deposits', icon: ArrowUpRight },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownLeft },
    { id: 'quantify', label: 'Quantify History', icon: Activity },
    { id: 'bank', label: 'Bank Details', icon: Landmark },
    { id: 'recharge', label: 'Wallet Recharge', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  const renderDashboard = () => (
    <div>
      {/* Row 1 – 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Users', value: '28.05k', change: '+16.24%', up: true, spark: spark1, color: '#7c3aed', Icon: Users },
          { label: 'Sessions', value: '97.66k', change: '-3.96%', up: false, spark: spark2, color: '#06b6d4', Icon: Activity },
          { label: 'Avg. Visit Duration', value: '3m 40sec', change: '-0.24%', up: false, spark: spark1, color: '#f97316', Icon: Clock },
          { label: 'Bounce Rate', value: '33.48%', change: '+7.05%', up: true, spark: spark2, color: '#4ade80', Icon: TrendingUp },
        ].map((s, i) => (
          <div key={i} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: '26px', fontWeight: 800, color: '#f9fafb', margin: '0 0 4px', letterSpacing: '-1px' }}>{s.value}</p>
                <p style={chg(s.up)}>{s.up ? '▲' : '▼'} {s.change} <span style={{ color: '#6b7280', fontWeight: 400 }}>vs. prev month</span></p>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.Icon size={18} color="#fff" />
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <Sparkline data={s.spark} color={s.color} height={36} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 – Map + Sessions by Country */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Live Users By Country</span>
            <button style={{ ...pill(true), fontSize: '10px' }}>Export Report</button>
          </div>
          {/* Map placeholder */}
          <div style={{ background: '#111827', borderRadius: '8px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: '12px' }}>
            <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', opacity: 0.2 }}>
              <ellipse cx="200" cy="200" rx="130" ry="90" fill="#374151" />
              <ellipse cx="430" cy="180" rx="170" ry="100" fill="#374151" />
              <ellipse cx="640" cy="200" rx="90" ry="110" fill="#374151" />
              <ellipse cx="390" cy="320" rx="60" ry="50" fill="#374151" />
              <ellipse cx="620" cy="320" rx="55" ry="45" fill="#374151" />
            </svg>
            {[[23, 40], [39, 27], [55, 25], [73, 38], [80, 45], [25, 50], [46, 73]].map(([x, y], i) => (
              <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(99,102,241,0.9)', boxShadow: '0 0 0 4px rgba(99,102,241,0.25)' }} />
            ))}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Duration (Secs)', 'Sessions', 'Views'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {durationRows.map(r => (
                <tr key={r.range}>
                  <td style={td}>{r.range}</td><td style={td}>{r.sessions}</td><td style={td}>{r.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Sessions by Countries</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', '1M', '6M'].map(t => <button key={t} style={pill(t === timeFilter)} onClick={() => setTimeFilter(t)}>{t}</button>)}
            </div>
          </div>
          {countryData.map(c => <HBar key={c.name} label={c.name} value={c.value} max={maxC} color={c.color} />)}
        </div>
      </div>

      {/* Row 3 – Audience Metrics + Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Audiences Metrics</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', '1M', '6M', '1Y'].map(t => <button key={t} style={pill(t === timeFilter)} onClick={() => setTimeFilter(t)}>{t}</button>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            {[
              { label: 'Avg. Session', val: '854', c: '49%' },
              { label: 'Conversion Rate', val: '1,278', c: '60%' },
              { label: 'Avg. Session Duration', val: '3m 40sec', c: '37%' },
            ].map(m => (
              <div key={m.label}>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#f9fafb', margin: '0 0 2px' }}>{m.val}</p>
                <p style={{ ...chg(true), marginBottom: '2px' }}>▲ {m.c}</p>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>{m.label}</p>
              </div>
            ))}
          </div>
          <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
            {barData.map((v, i) => (
              <div key={i} style={{ flex: 1, background: i === barData.length - 1 ? '#4f46e5' : '#374151', height: `${v}%`, borderRadius: '3px 3px 0 0' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
              <span key={m} style={{ fontSize: '9px', color: '#6b7280' }}>{m}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            {[['#374151', 'Last Year'], ['#4f46e5', 'Current Year']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }} />
                <span style={{ fontSize: '10px', color: '#6b7280' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Audiences Sessions by Country</span>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Sort by: Current Week ▾</span>
          </div>
          <HeatmapGrid />
        </div>
      </div>

      {/* Row 4 – Device + Referrals + Top Pages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {/* Device */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Users by Device</span>
            <MoreVertical size={14} color="#6b7280" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <DonutChart segments={[{ pct: 50, color: '#7c3aed' }, { pct: 34, color: '#eab308' }, { pct: 16, color: '#06b6d4' }]} />
          </div>
          {[
            { label: 'Desktop Users', val: '78.56k', c: '+2.08%', up: true, Icon: Monitor, color: '#7c3aed' },
            { label: 'Mobile Users', val: '105.02k', c: '-10.52%', up: false, Icon: Smartphone, color: '#eab308' },
            { label: 'Tablet Users', val: '42.89k', c: '-7.36%', up: false, Icon: Tablet, color: '#06b6d4' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #374151' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <d.Icon size={14} color={d.color} />
                <span style={{ fontSize: '12px', color: '#d1d5db' }}>{d.label}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#f9fafb', margin: 0 }}>{d.val}</p>
                <p style={{ ...chg(d.up), fontSize: '10px', margin: 0 }}>{d.up ? '▲' : '▼'} {d.c}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Referrals */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Top Referrals Pages</span>
            <button style={{ ...pill(true), fontSize: '10px' }}>Export Report</button>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>TOTAL REFERRALS PA…</p>
            <p style={{ fontSize: '26px', fontWeight: 800, color: '#f9fafb', margin: '4px 0 2px' }}>725,800</p>
            <p style={{ ...chg(true), fontSize: '11px', justifyContent: 'center' }}>▲ +15.72% <span style={{ color: '#6b7280', fontWeight: 400 }}>vs. previous month</span></p>
            <div style={{ height: '8px', borderRadius: '99px', overflow: 'hidden', display: 'flex', marginTop: '10px' }}>
              {referrals.map(r => <div key={r.site} style={{ flex: r.pct, background: r.color }} />)}
            </div>
          </div>
          {referrals.map(r => (
            <div key={r.site} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#d1d5db' }}>{r.site}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f9fafb' }}>{r.pct}%</span>
            </div>
          ))}
          <button style={{ fontSize: '11px', fontWeight: 600, color: '#818cf8', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '8px', width: '100%', textAlign: 'center' }}>Show All</button>
        </div>

        {/* Top Pages */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Top Pages</span>
            <MoreVertical size={14} color="#6b7280" />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Active Page</th>
                <th style={{ ...th, textAlign: 'right' }}>Active</th>
                <th style={{ ...th, textAlign: 'right' }}>Users</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map(p => (
                <tr key={p.path}>
                  <td style={{ ...td, fontSize: '11px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#818cf8' }}>{p.path}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{p.active}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{p.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Bank Details Management</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setBankDetails(demoBanks())} style={{ ...pill(true), background: '#7c3aed', fontSize: '12px' }}>Load Demo</button>
          <button onClick={() => setBankDetails(demoBanks())} style={{ background: '#1f2937', border: '1px solid #374151', color: '#d1d5db', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} />Refresh
          </button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
          <thead><tr>{['User', 'Account Holder', 'Bank Name', 'Account No.', 'IFSC', 'Status', 'Submitted', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {bankDetails.map(b => (
              <tr key={b._id}>
                <td style={td}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#f9fafb' }}>{b.userId?.name || 'N/A'}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>{b.userId?.phone || 'N/A'}</p>
                </td>
                <td style={td}>{b.accountHolder}</td>
                <td style={td}>{b.bankName || 'N/A'}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: '12px' }}>{b.accountNumber.replace(/.(?=.{4})/g, '*')}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: '12px' }}>{b.ifsc}</td>
                <td style={td}><span style={badge(b.status)}>{b.status}</span></td>
                <td style={{ ...td, color: '#6b7280', fontSize: '11px' }}>{new Date(b.submittedAt).toLocaleDateString()}</td>
                <td style={td}>
                  {b.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => updateBankStatus(b._id, 'Verified')} style={{ background: 'rgba(74,222,128,0.1)', border: 'none', color: '#4ade80', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>✓ Verify</button>
                      <button onClick={() => updateBankStatus(b._id, 'Rejected')} style={{ background: 'rgba(248,113,113,0.1)', border: 'none', color: '#f87171', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>✕ Reject</button>
                    </div>
                  ) : <span style={{ color: '#6b7280', fontSize: '11px' }}>{b.status}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQuantifyHistory = () => (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Quantify History</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setQuantifyHistory(demoQuantify())} style={{ ...pill(true), background: '#7c3aed', fontSize: '12px' }}>Load Demo</button>
          <button onClick={() => setQuantifyHistory(demoQuantify())} style={{ background: '#1f2937', border: '1px solid #374151', color: '#d1d5db', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} />Refresh
          </button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead><tr>{['User', 'Balance', 'Deposit Amt', "Today's Earning", 'Total Revenue', 'Status', 'Last Updated'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {quantifyHistory.map(r => (
              <tr key={r._id}>
                <td style={td}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#f9fafb' }}>{r.userId?.name || 'N/A'}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>{r.userId?.phone || 'N/A'}</p>
                </td>
                <td style={td}>₹{r.balance?.toFixed(2)}</td>
                <td style={td}>₹{r.approvedDepositAmount?.toFixed(2)}</td>
                <td style={{ ...td, color: '#4ade80', fontWeight: 700 }}>₹{r.todayEarning?.toFixed(2)}</td>
                <td style={{ ...td, color: '#818cf8', fontWeight: 700 }}>₹{r.totalRevenue?.toFixed(2)}</td>
                <td style={td}><span style={badge(r.isQuantifying ? 'Active' : 'Inactive')}>{r.isQuantifying ? 'Active' : 'Inactive'}</span></td>
                <td style={{ ...td, fontSize: '11px', color: '#6b7280' }}>{r.lastUpdated ? new Date(r.lastUpdated).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPlaceholder = () => (
    <div style={{ ...card, textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ width: '52px', height: '52px', background: 'rgba(79,70,229,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <AlertCircle size={26} color="#818cf8" />
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f9fafb', margin: '0 0 8px', textTransform: 'capitalize' }}>{activeTab} Module</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>This section is currently being initialised.</p>
      <button onClick={() => setActiveTab('dashboard')} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Return to Dashboard</button>
    </div>
  );

  const pages = { dashboard: renderDashboard, bank: renderBankDetails, quantify: renderQuantifyHistory };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#f9fafb' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: '#0f172a',
        borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px', color: '#f9fafb', margin: 0 }}>AdminCORE</p>
              <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Management Suite</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#4b5563', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px 10px 4px', margin: 0 }}>Main Menu</p>
          {menuItems.slice(0, 4).map(item => (
            <button key={item.id} style={navBtn(activeTab === item.id)} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              <item.icon size={16} /><span>{item.label}</span>
            </button>
          ))}
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#4b5563', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '12px 10px 4px', margin: 0 }}>Operations</p>
          {menuItems.slice(4).map(item => (
            <button key={item.id} style={navBtn(activeTab === item.id)} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              <item.icon size={16} /><span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '14px', borderTop: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#111827', borderRadius: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>AD</div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#f9fafb', margin: 0 }}>Root Admin</p>
              <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>System Secure</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '220px', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{ padding: '12px 24px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '14px', background: '#111827', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ flex: 1, position: 'relative', maxWidth: '380px' }}>
            <Search size={14} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '8px 12px 8px 34px', color: '#f9fafb', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Search users, transactions, UID…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '7px', display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer' }}>
              <Bell size={16} color="#9ca3af" />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff' }}>SU</div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#f9fafb', margin: 0 }}>Super User</p>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Master Key Active</p>
              </div>
              <ChevronDown size={14} color="#6b7280" />
            </div>
          </div>
        </header>

        {/* Page header */}
        <div style={{ padding: '20px 24px 0' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 4px' }}>Internal Management</p>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f9fafb', margin: '0 0 20px', letterSpacing: '-0.5px', textTransform: 'capitalize' }}>
            System <span style={{ color: '#374151' }}>/</span> {activeTab}
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: '0 24px 40px' }}>
          {pages[activeTab] ? pages[activeTab]() : renderPlaceholder()}
        </div>
      </main>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />}
    </div>
  );
};

export default AdminPanel;