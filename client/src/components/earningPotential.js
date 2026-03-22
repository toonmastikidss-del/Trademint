import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, TrendingUp, DollarSign, Clock, Shield,
  Zap, Target, Award, ArrowUpRight, Calculator,
  Download, IndianRupee, Users, CheckCircle2, Star
} from 'lucide-react';

// ─── Compound table data ───────────────────────────────────────────────────────
const RATE    = 0.06;
const AMOUNTS = [600, 1000, 2000, 3000, 5000, 10000, 20000, 30000, 50000];

const buildTable = (start) => {
  const rows = [];
  let inv = start;
  for (let d = 1; d <= 90; d++) {
    const profit = Math.round(inv * RATE);
    const total  = inv + profit;
    rows.push({ day: d, invest: inv, profit, total });
    inv = total;
  }
  return rows;
};

const ALL = {};
AMOUNTS.forEach(a => { ALL[a] = buildTable(a); });

const fmt  = (n) => n.toLocaleString('en-IN');
const fmtK = (a) => a >= 1000 ? `₹${a / 1000}K` : `₹${a}`;

// ─── PDF download ─────────────────────────────────────────────────────────────
const handleDownloadPDF = () => {
  const win = window.open('', '_blank');
  if (!win) return;
  const sections = AMOUNTS.map(a => {
    const rows = ALL[a];
    const body = rows.map((r, i) => `
      <tr style="background:${i % 2 === 0 ? '#0d1e30' : '#091524'}">
        <td style="color:#F5C518;padding:4px 6px;text-align:center;border:1px solid #1a3a5c;">Day ${r.day}</td>
        <td style="color:#fff;padding:4px 6px;text-align:right;border:1px solid #1a3a5c;">${fmt(r.invest)}</td>
        <td style="color:#4CAF50;padding:4px 6px;text-align:right;border:1px solid #1a3a5c;">+${fmt(r.profit)}</td>
        <td style="color:#00C8E0;padding:4px 6px;text-align:right;font-weight:bold;border:1px solid #1a3a5c;">${fmt(r.total)}</td>
      </tr>`).join('');
    return `
      <div style="margin-bottom:28px;break-inside:avoid;">
        <h3 style="color:#F5C518;margin:0 0 6px;font-size:13px;">Starting: ${fmtK(a)}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:10.5px;font-family:Arial;">
          <thead><tr style="background:#0A2744;">
            <th style="color:#00C8E0;padding:5px;border:1px solid #1a3a5c;">Day</th>
            <th style="color:#00C8E0;padding:5px;text-align:right;border:1px solid #1a3a5c;">Invest (₹)</th>
            <th style="color:#00C8E0;padding:5px;text-align:right;border:1px solid #1a3a5c;">Profit (₹)</th>
            <th style="color:#00C8E0;padding:5px;text-align:right;border:1px solid #1a3a5c;">Total (₹)</th>
          </tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
  }).join('');

  win.document.write(`<!DOCTYPE html><html><head>
    <title>TradeMint Income Chart</title>
    <style>
      body{background:#0B1929;color:#fff;font-family:Arial,sans-serif;padding:20px;}
      h1{color:#00C8E0;text-align:center;font-size:20px;margin:0 0 4px;}
      h2{color:#F5C518;text-align:center;font-size:12px;font-weight:normal;margin:0 0 20px;}
      @media print{body{background:#fff;color:#000;}h1{color:#0077aa;}h2{color:#cc8800;}}
    </style>
  </head><body>
    <h1>TradeMint — Cumulative Income Chart</h1>
    <h2>6% Daily Compound Return · Day 1 to Day 90</h2>
    ${sections}
    <p style="color:#557799;text-align:center;font-size:9px;margin-top:16px;">
      * Returns compounded daily at 6% of Total Revenue. All amounts in ₹.
    </p>
    <script>window.onload=()=>{setTimeout(()=>window.print(),400);}<\/script>
  </body></html>`);
  win.document.close();
};

// ─── Original earning plans ────────────────────────────────────────────────────
const earningPlans = [
  {
    name: 'Starter Plan',
    dailyReturn: '6%',
    duration: '30 Days',
    minDeposit: '₹600',
    maxDeposit: '₹5,000',
    color: 'from-[#00C8E0] to-cyan-400',
    shadow: 'shadow-cyan-500/20',
    icon: TrendingUp,
    tag: 'MOST POPULAR',
  },
  {
    name: 'Growth Plan',
    dailyReturn: '6%',
    duration: '60 Days',
    minDeposit: '₹5,000',
    maxDeposit: '₹20,000',
    color: 'from-emerald-500 to-green-400',
    shadow: 'shadow-emerald-500/20',
    icon: Zap,
    tag: 'BEST VALUE',
  },
  {
    name: 'Premium Plan',
    dailyReturn: '6%',
    duration: '90 Days',
    minDeposit: '₹20,001',
    maxDeposit: '₹50,000',
    color: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/20',
    icon: Award,
    tag: 'MAX RETURNS',
  },
];

const calculateEarnings = (amount, percentage) => {
  const v = parseFloat(amount);
  if (!v || isNaN(v)) return '0.00';
  return (v * percentage / 100).toFixed(2);
};

// ─── Component ─────────────────────────────────────────────────────────────────
const EarningPotential = () => {
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedAmt,      setSelectedAmt]      = useState(5000);
  const [activePart,       setActivePart]        = useState(0);

  const rows    = useMemo(() => ALL[selectedAmt], [selectedAmt]);
  const parts   = [rows.slice(0, 30), rows.slice(30, 60), rows.slice(60, 90)];
  const visible = parts[activePart];
  const d30 = rows[29], d60 = rows[59], d90 = rows[89];

  return (
    <div className='bg-[#101821] min-h-screen text-white pb-24 font-sans'>

      {/* ── Header ── */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => window.history.back()} className='p-1'>
          <ChevronLeft size={24} color="#fff" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Earning Potential</h1>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-1.5 bg-[#49bace]/15 border border-[#49bace]/40 text-[#49bace] text-[10px] font-black px-3 py-2 rounded-xl hover:bg-[#49bace]/25 transition-all"
        >
          <Download size={13} />
          PDF
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#0d2040] via-[#0f2850] to-[#0d1e3a] pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#49bace]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <TrendingUp size={28} className="text-[#49bace]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Maximize Your Earnings</h2>
              <p className="text-blue-100/70 text-xs mt-1">6% daily compound on Total Revenue</p>
            </div>
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { icon: Users,   label: '50K+ Users'   },
              { icon: Shield,  label: '100% Secure'  },
              { icon: Star,    label: '99.9% Uptime' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full">
                <b.icon size={11} className="text-[#49bace]" />
                <span className="text-[10px] text-white/80 font-bold">{b.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Daily Return', value: '6%',     icon: ArrowUpRight, color: 'text-emerald-400' },
              { label: 'Compounded',   value: 'Daily',   icon: Clock,        color: 'text-[#49bace]'  },
              { label: 'Secure',       value: '100%',    icon: Shield,       color: 'text-purple-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                <s.icon size={15} className={`${s.color} mx-auto mb-1`} />
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-gray-400 uppercase font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">

        {/* ── Calculator ── */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 bg-[#49bace]/10 rounded-xl">
              <Calculator size={22} className="text-[#49bace]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Earnings Calculator</h3>
              <p className="text-[10px] text-gray-500">See your daily return instantly</p>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2 block">
              Enter Investment Amount
            </label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="₹ 10,000"
                className="w-full bg-[#101821] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-[#49bace] focus:ring-2 focus:ring-[#49bace]/20 transition-all outline-none"
              />
            </div>
          </div>

          {investmentAmount && (
            <div className="grid grid-cols-3 gap-3 pt-4">
              {earningPlans.map((plan, index) => (
                <div key={index} className={`bg-gradient-to-br ${plan.color} p-4 rounded-2xl relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[20px]" />
                  <span className="text-[9px] text-white/80 uppercase font-bold block mb-1">{plan.name}</span>
                  <span className="text-lg font-black text-white block">
                    ₹{calculateEarnings(investmentAmount, 6)}
                  </span>
                  <span className="text-[8px] text-white/70">per day</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Earning Plans (Enhanced UI) ── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-[#49bace]/10 rounded-xl">
                <Target size={18} className="text-[#49bace]" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-widest">Quantification Plans</h3>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
              <span className="text-[9px] font-black text-emerald-400 uppercase">6% Daily Return</span>
            </div>
          </div>

          {earningPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-[#212431] to-[#1a1f2e] border border-gray-700/80 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden hover:border-gray-600 transition-all duration-300 group ${plan.shadow}`}
            >
              {/* Animated gradient border on hover */}
              <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${plan.color}`}></div>
                <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r ${plan.color}`}></div>
              </div>

              {/* Top gradient accent bar */}
              <div className="absolute top-0 left-0 w-full rounded-t-[2.5rem] overflow-hidden">
                <div className={`h-1.5 w-full bg-gradient-to-r ${plan.color}`}></div>
              </div>

              {/* Plan Tag Badge */}
              <div className={`absolute top-5 right-5 bg-gradient-to-r ${plan.color} px-3 py-1.5 rounded-full shadow-lg`}>
                <span className="text-[9px] font-black text-white tracking-wider">{plan.tag}</span>
              </div>

              {/* Header Section */}
              <div className="flex justify-between items-start mb-6 mt-2">
                <div className="flex items-center space-x-4">
                  <div className={`p-3.5 bg-gradient-to-br ${plan.color} rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300`}>
                    <plan.icon size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-1">{plan.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-gray-400 font-medium">{plan.duration}</span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                      <span className="text-[10px] text-gray-400 font-medium">Auto-Compound</span>
                    </div>
                  </div>
                </div>
                
                {/* Daily Return Badge */}
                <div className="text-right">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-[#49bace] leading-none">
                    {plan.dailyReturn}
                  </div>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <ArrowUpRight size={12} className="text-emerald-400" />
                    <span className="text-[8px] text-gray-500 uppercase font-bold">Daily Return</span>
                  </div>
                </div>
              </div>

              {/* Deposit Range Cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#101821]/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/60 group-hover:border-gray-700/60 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">Min Deposit</span>
                  </div>
                  <span className="text-base font-black text-white">{plan.minDeposit}</span>
                </div>
                <div className="bg-[#101821]/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/60 group-hover:border-gray-700/60 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">Max Deposit</span>
                  </div>
                  <span className="text-base font-black text-white">{plan.maxDeposit}</span>
                </div>
              </div>

              {/* Estimated Earnings Card */}
              <div className="bg-gradient-to-br from-[#101821]/90 to-[#0d1e30]/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20 mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                      <TrendingUp size={14} className="text-emerald-400" />
                    </div>
                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">
                      Est. after {plan.duration}
                    </span>
                  </div>
                  <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                    {(() => {
                      const rawAmt = parseInt(plan.minDeposit.replace(/[^0-9]/g, ''), 10);
                      const key    = AMOUNTS.reduce((p, c) =>
                        Math.abs(c - rawAmt) < Math.abs(p - rawAmt) ? c : p
                      );
                      const idx   = parseInt(plan.duration, 10) - 1;
                      const total = ALL[key]?.[idx]?.total;
                      return total ? `₹${fmt(total)}+` : '—';
                    })()}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate('/quantify')}
                className={`w-full py-4.5 bg-gradient-to-r ${plan.color} text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group`}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>Start Quantifying Now</span>
                  <ChevronLeft size={16} className="rotate-180" />
                </span>
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          ))}
        </div>

        {/* ── Income Chart Table ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#49bace]" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Income Chart</h3>
            </div>
            <span className="text-[9px] text-gray-500 font-bold">90-Day Compound Table</span>
          </div>

          {/* Amount pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => { setSelectedAmt(a); setActivePart(0); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  selectedAmt === a
                    ? 'bg-[#49bace] text-[#101821]'
                    : 'bg-[#212431] border border-gray-700 text-gray-400 hover:border-[#49bace]/50'
                }`}
              >
                {fmtK(a)}
              </button>
            ))}
          </div>

          {/* Milestone summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: '30 Days', val: fmt(d30.total), daily: fmt(d30.profit), color: 'text-[#49bace]' },
              { label: '60 Days', val: fmt(d60.total), daily: fmt(d60.profit), color: 'text-emerald-400' },
              { label: '90 Days', val: fmt(d90.total), daily: fmt(d90.profit), color: 'text-amber-400'  },
            ].map((m, i) => (
              <div key={i} className="bg-[#212431] border border-gray-700 rounded-2xl p-3 text-center shadow-xl">
                <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">After {m.label}</p>
                <p className={`text-sm font-black ${m.color}`}>₹{m.val}</p>
                <p className="text-[8px] text-emerald-400 mt-0.5">+₹{m.daily}/day</p>
              </div>
            ))}
          </div>

          {/* Main table */}
          <div className="bg-[#212431] border border-gray-700 rounded-[2rem] shadow-xl overflow-hidden">
            {/* Table header */}
            <div className="bg-[#0A2744] border-b border-[#49bace]/30 px-4 py-3 text-center">
              <p className="text-xs font-black text-[#49bace]">
                Starting: <span className="text-[#F5C518]">{fmtK(selectedAmt)}</span>
                <span className="text-gray-500 font-normal ml-2">· 6% Daily Compound</span>
              </p>
            </div>

            {/* Day range tabs */}
            <div className="grid grid-cols-3 border-b border-gray-700">
              {['Day 1–30', 'Day 31–60', 'Day 61–90'].map((label, i) => (
                <button
                  key={i}
                  onClick={() => setActivePart(i)}
                  className={`py-3 text-[10px] font-black uppercase tracking-wider transition-all ${
                    activePart === i
                      ? 'bg-[#0A2744] text-[#49bace] border-b-2 border-[#49bace]'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Col headers */}
            <div className="grid grid-cols-4 bg-[#182030] px-4 py-2.5">
              {['Day', 'Invest', 'Profit', 'Total'].map((h, i) => (
                <div key={i} className={`text-[9px] font-black uppercase tracking-wider text-[#49bace] ${i > 0 ? 'text-right' : ''}`}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div>
              {visible.map((row, i) => (
                <div
                  key={row.day}
                  className={`grid grid-cols-4 px-4 py-2.5 border-b border-gray-800/40 ${
                    i % 2 === 0 ? 'bg-[#141e2d]' : 'bg-[#101828]'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-400">Day {row.day}</div>
                  <div className="text-xs text-gray-300 text-right font-mono">{fmt(row.invest)}</div>
                  <div className="text-xs text-emerald-400 text-right font-bold font-mono">+{fmt(row.profit)}</div>
                  <div className="text-xs text-[#49bace] text-right font-black font-mono">{fmt(row.total)}</div>
                </div>
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex justify-between items-center px-5 py-3 border-t border-gray-700 bg-[#182030]">
              <button
                disabled={activePart === 0}
                onClick={() => setActivePart(p => p - 1)}
                className="text-[10px] text-[#49bace] font-bold disabled:opacity-30"
              >
                ← Prev 30
              </button>
              <span className="text-[9px] text-gray-600">{activePart * 30 + 1}–{Math.min(activePart * 30 + 30, 90)} of 90</span>
              <button
                disabled={activePart === 2}
                onClick={() => setActivePart(p => p + 1)}
                className="text-[10px] text-[#49bace] font-bold disabled:opacity-30"
              >
                Next 30 →
              </button>
            </div>
          </div>
        </div>

        {/* ── All amounts summary ── */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Award size={15} className="text-[#49bace]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">90-Day Snapshot — All Amounts</span>
          </div>
          <div className="grid grid-cols-4 bg-[#101821] rounded-xl px-3 py-2 mb-1">
            {['Start', '30D', '60D', '90D'].map((h, i) => (
              <div key={i} className={`text-[9px] font-black text-[#49bace] uppercase ${i > 0 ? 'text-right' : ''}`}>{h}</div>
            ))}
          </div>
          {AMOUNTS.map((a) => (
            <div
              key={a}
              onClick={() => { setSelectedAmt(a); setActivePart(0); }}
              className={`grid grid-cols-4 px-3 py-2 rounded-xl cursor-pointer transition-all mb-0.5 ${
                selectedAmt === a
                  ? 'bg-[#49bace]/10 border border-[#49bace]/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className={`text-xs font-black ${selectedAmt === a ? 'text-[#49bace]' : 'text-amber-400'}`}>{fmtK(a)}</div>
              <div className="text-[10px] text-gray-300 text-right font-mono">₹{fmt(ALL[a]?.[29]?.total || 0)}</div>
              <div className="text-[10px] text-gray-300 text-right font-mono">₹{fmt(ALL[a]?.[59]?.total || 0)}</div>
              <div className="text-[10px] text-emerald-400 text-right font-bold font-mono">₹{fmt(ALL[a]?.[89]?.total || 0)}</div>
            </div>
          ))}
        </div>

        {/* ── Why Trust ── */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 px-1">Why Choose TradeMint</h3>
          <div className="space-y-0">
            {[
              { icon: Shield,       color: 'text-purple-400', title: 'Bank-Level Security',     desc: '100% secure with SSL encryption, JWT auth & bcrypt password hashing' },
              { icon: Clock,        color: 'text-[#49bace]',  title: 'Fast Withdrawals',        desc: 'Requests processed within 10–30 minutes after approval' },
              { icon: Zap,          color: 'text-yellow-400', title: 'Automated System',        desc: 'Set it once — earnings compound automatically every midnight' },
              { icon: Users,        color: 'text-emerald-400',title: '50,000+ Happy Users',     desc: 'Trusted by traders across India with ₹2.5M+ daily volume' },
              { icon: CheckCircle2, color: 'text-green-400',  title: 'Transparent Returns',     desc: 'Every rupee tracked — no hidden fees except 4% withdrawal handling' },
            ].map((f, i, arr) => (
              <div key={i} className={`flex items-start space-x-3 py-3 ${i < arr.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <div className={`p-2.5 bg-[#101821] rounded-xl flex-shrink-0 border border-gray-800 ${f.color}`}>
                  <f.icon size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{f.title}</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Download PDF ── */}
        <button
          onClick={handleDownloadPDF}
          className="w-full py-4 bg-[#212431] border border-[#49bace]/30 text-[#49bace] rounded-[2rem] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#49bace]/10 transition-all"
        >
          <Download size={18} />
          Download Full Income Chart (PDF)
        </button>

        {/* ── CTA ── */}
        <button
          onClick={() => navigate('/deposite')}
          className="w-full py-5 bg-gradient-to-r from-emerald-500 to-[#49bace] text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start Earning Today →
        </button>

        <p className="text-[9px] text-gray-600 text-center pb-2">
          * 6% compounded daily on Total Revenue. Min ₹600 to start quantifying.
        </p>
      </div>
    </div>
  );
};

export default EarningPotential;