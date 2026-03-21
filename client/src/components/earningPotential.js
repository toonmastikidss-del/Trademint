import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Download, TrendingUp, Shield,
  Award, Zap, Clock, Users, CheckCircle2,
  IndianRupee, ChevronDown, ChevronUp
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
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
const fmtK = (a) => a >= 1000 ? `₹${a/1000}K` : `₹${a}`;

// ─── PDF download (print-based) ───────────────────────────────────────────────
const handleDownloadPDF = () => {
  const win = window.open('', '_blank');
  if (!win) return;

  const amountLabel = (a) => a >= 1000 ? `₹${a/1000}K` : `₹${a}`;

  const sections = AMOUNTS.map(a => {
    const rows = ALL[a];
    const bodyRows = rows.map((r, i) => `
      <tr style="background:${i%2===0?'#0d1e30':'#091524'}">
        <td style="color:#F5C518;padding:4px 6px;text-align:center;border:1px solid #1a3a5c;">Day ${r.day}</td>
        <td style="color:#fff;padding:4px 6px;text-align:right;border:1px solid #1a3a5c;">${fmt(r.invest)}</td>
        <td style="color:#4CAF50;padding:4px 6px;text-align:right;border:1px solid #1a3a5c;">+${fmt(r.profit)}</td>
        <td style="color:#00C8E0;padding:4px 6px;text-align:right;border:1px solid #1a3a5c;font-weight:bold;">${fmt(r.total)}</td>
      </tr>`).join('');
    return `
      <div style="margin-bottom:30px;break-inside:avoid;">
        <h3 style="color:#F5C518;margin:0 0 6px;font-size:14px;">Starting Amount: ${amountLabel(a)}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:Arial;">
          <thead>
            <tr style="background:#0A2744;">
              <th style="color:#00C8E0;padding:6px;border:1px solid #1a3a5c;text-align:center;">Day</th>
              <th style="color:#00C8E0;padding:6px;border:1px solid #1a3a5c;text-align:right;">Invest (₹)</th>
              <th style="color:#00C8E0;padding:6px;border:1px solid #1a3a5c;text-align:right;">Profit (₹)</th>
              <th style="color:#00C8E0;padding:6px;border:1px solid #1a3a5c;text-align:right;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
  }).join('');

  win.document.write(`<!DOCTYPE html><html><head>
    <title>TradeMint — Income Chart 1-90 Days</title>
    <style>
      body{background:#0B1929;color:#fff;font-family:Arial,sans-serif;padding:20px;}
      h1{color:#00C8E0;text-align:center;font-size:22px;margin:0 0 4px;}
      h2{color:#F5C518;text-align:center;font-size:13px;font-weight:normal;margin:0 0 20px;}
      @media print{
        body{background:#fff;color:#000;}
        h1{color:#0077aa;}h2{color:#cc8800;}
        td,th{border-color:#ccc !important;}
      }
    </style>
  </head><body>
    <h1>TradeMint — Cumulative Income Chart</h1>
    <h2>6% Daily Compound Return · 1 to 90 Days</h2>
    ${sections}
    <p style="color:#557799;text-align:center;font-size:10px;margin-top:20px;">
      * Returns compounded daily at 6% of Total Revenue. All amounts in ₹ (Indian Rupees).
    </p>
    <script>window.onload=()=>{setTimeout(()=>window.print(),400);}<\/script>
  </body></html>`);
  win.document.close();
};

// ─── Component ────────────────────────────────────────────────────────────────
const EarningPotential = () => {
  const navigate = useNavigate();
  const [selected, setSelected]     = useState(5000);
  const [showFull, setShowFull]     = useState(false);
  const [activePart, setActivePart] = useState(0); // 0=Day1-30, 1=Day31-60, 2=Day61-90

  const rows    = useMemo(() => ALL[selected], [selected]);
  const parts   = [rows.slice(0,30), rows.slice(30,60), rows.slice(60,90)];
  const visible = parts[activePart];

  // Milestone summary
  const d30 = rows[29], d60 = rows[59], d90 = rows[89];

  return (
    <div className='bg-[#0B1929] min-h-screen text-white font-sans pb-24'>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d2240] px-4 py-4 flex items-center justify-between shadow-xl border-b border-[#1a3a5c]">
        <button onClick={() => window.history.back()} className='p-1'>
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-black text-white tracking-tight">Income Chart</h1>
          <p className="text-[9px] text-[#00C8E0] font-semibold uppercase tracking-widest">6% Daily Compound Return</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-1.5 bg-[#00C8E0]/10 border border-[#00C8E0]/40 text-[#00C8E0] text-[10px] font-black px-3 py-2 rounded-xl hover:bg-[#00C8E0]/20 transition-all uppercase tracking-wider"
        >
          <Download size={13} />
          PDF
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0a2040] via-[#0d2850] to-[#0a1e3a] px-5 pt-6 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00C8E0]/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-emerald-500/6 rounded-full blur-[80px]" />

        {/* Title like image */}
        <div className="relative z-10 text-center mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C8E0] mb-1">TradeMint</p>
          <h2 className="text-xl font-black text-white leading-tight">
            Cumulative Total Income of<br />
            <span className="text-[#F5C518]">User Quantitative Trading</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">From Day 1 to Day 90 · 6% Daily Compound</p>
        </div>

        {/* 3 milestone cards */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {[
            { label: 'Day 30', invest: d30.invest, profit: d30.profit, total: d30.total, color: '#00C8E0' },
            { label: 'Day 60', invest: d60.invest, profit: d60.profit, total: d60.total, color: '#4CAF50' },
            { label: 'Day 90', invest: d90.invest, profit: d90.profit, total: d90.total, color: '#F5C518' },
          ].map((m, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">{m.label}</p>
              <p className="text-xs font-black" style={{ color: m.color }}>₹{fmt(m.total)}</p>
              <p className="text-[8px] text-emerald-400 mt-0.5">+₹{fmt(m.profit)}/day</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-4 mt-4 relative z-10">
          {[
            { icon: Shield,  label: 'Secure'      },
            { icon: Users,   label: '50K+ Users'  },
            { icon: Award,   label: '99.9% Uptime'},
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <b.icon size={11} className="text-[#00C8E0]" />
              <span className="text-[9px] text-gray-400 font-bold">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">

        {/* Amount Selector */}
        <div className="bg-[#0f2236] border border-[#1a3a5c] rounded-[2rem] p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <IndianRupee size={14} className="text-[#00C8E0]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Starting Amount</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => { setSelected(a); setActivePart(0); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  selected === a
                    ? 'bg-[#00C8E0] text-[#0B1929]'
                    : 'bg-[#0B1929] border border-[#1a3a5c] text-gray-400 hover:border-[#00C8E0]/50'
                }`}
              >
                {fmtK(a)}
              </button>
            ))}
          </div>
        </div>

        {/* THE MAIN TABLE — matching image style */}
        <div className="bg-[#0f2236] border border-[#1a3a5c] rounded-[2rem] shadow-2xl overflow-hidden">

          {/* Table title */}
          <div className="bg-[#0A2744] px-5 py-3 text-center border-b border-[#1a3a5c]">
            <p className="text-sm font-black text-[#00C8E0]">
              Starting Amount: <span className="text-[#F5C518]">{fmtK(selected)}</span>
            </p>
            <p className="text-[9px] text-gray-500 mt-0.5">Cumulative · Invest Funds · Profits · Total Profit</p>
          </div>

          {/* Day range tabs */}
          <div className="grid grid-cols-3 border-b border-[#1a3a5c]">
            {['Day 1–30', 'Day 31–60', 'Day 61–90'].map((label, i) => (
              <button
                key={i}
                onClick={() => setActivePart(i)}
                className={`py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                  activePart === i
                    ? 'bg-[#0A2744] text-[#00C8E0] border-b-2 border-[#00C8E0]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-4 bg-[#0d2850] px-4 py-2.5">
            <div className="text-[9px] font-black text-[#00C8E0] uppercase tracking-wider">Cumul. Days</div>
            <div className="text-[9px] font-black text-[#00C8E0] uppercase tracking-wider text-right">Invest Funds</div>
            <div className="text-[9px] font-black text-[#00C8E0] uppercase tracking-wider text-right">Profits</div>
            <div className="text-[9px] font-black text-[#00C8E0] uppercase tracking-wider text-right">Total Profit</div>
          </div>

          {/* Table rows */}
          <div>
            {visible.map((row, i) => (
              <div
                key={row.day}
                className={`grid grid-cols-4 px-4 py-2.5 border-b border-[#1a3a5c]/40 ${
                  i % 2 === 0 ? 'bg-[#0d1e30]' : 'bg-[#091524]'
                }`}
              >
                <div className="text-xs font-bold text-[#F5C518]">Day {row.day}</div>
                <div className="text-xs text-white text-right font-mono">{fmt(row.invest)}</div>
                <div className="text-xs text-emerald-400 text-right font-bold font-mono">+{fmt(row.profit)}</div>
                <div className="text-xs text-[#00C8E0] text-right font-black font-mono">{fmt(row.total)}</div>
              </div>
            ))}
          </div>

          {/* Navigation hint */}
          <div className="flex justify-between items-center px-5 py-3 border-t border-[#1a3a5c] bg-[#0A2744]">
            <button
              disabled={activePart === 0}
              onClick={() => setActivePart(p => p - 1)}
              className="text-[10px] text-[#00C8E0] font-bold disabled:opacity-30 flex items-center gap-1"
            >
              ← Previous 30 days
            </button>
            <span className="text-[9px] text-gray-600">
              {activePart*30+1}–{Math.min(activePart*30+30, 90)} of 90
            </span>
            <button
              disabled={activePart === 2}
              onClick={() => setActivePart(p => p + 1)}
              className="text-[10px] text-[#00C8E0] font-bold disabled:opacity-30 flex items-center gap-1"
            >
              Next 30 days →
            </button>
          </div>
        </div>

        {/* All 9 amounts summary */}
        <div className="bg-[#0f2236] border border-[#1a3a5c] rounded-[2rem] p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-[#00C8E0]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">90-Day Summary — All Amounts</span>
          </div>

          {/* Header */}
          <div className="grid grid-cols-4 bg-[#0A2744] rounded-xl px-3 py-2 mb-1">
            {['Amount', 'Day 30', 'Day 60', 'Day 90'].map((h, i) => (
              <div key={i} className={`text-[9px] font-black text-[#00C8E0] uppercase ${i > 0 ? 'text-right' : ''}`}>{h}</div>
            ))}
          </div>

          {/* Summary rows */}
          {AMOUNTS.map((a, i) => {
            const t = ALL[a];
            return (
              <div
                key={a}
                onClick={() => setSelected(a)}
                className={`grid grid-cols-4 px-3 py-2 rounded-xl cursor-pointer transition-all mb-0.5 ${
                  selected === a
                    ? 'bg-[#00C8E0]/10 border border-[#00C8E0]/30'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`text-xs font-black ${selected === a ? 'text-[#00C8E0]' : 'text-[#F5C518]'}`}>{fmtK(a)}</div>
                <div className="text-[10px] text-gray-300 text-right font-mono">₹{fmt(t[29].total)}</div>
                <div className="text-[10px] text-gray-300 text-right font-mono">₹{fmt(t[59].total)}</div>
                <div className="text-[10px] text-emerald-400 text-right font-bold font-mono">₹{fmt(t[89].total)}</div>
              </div>
            );
          })}
        </div>

        {/* Why trust us */}
        <div className="bg-[#0f2236] border border-[#1a3a5c] rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-[#00C8E0]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Why Trust TradeMint</span>
          </div>
          <div className="space-y-0">
            {[
              { icon: Shield,       color: 'text-purple-400', title: 'Bank-Level Security',       desc: 'SSL encryption, JWT auth & bcrypt password protection on all accounts' },
              { icon: TrendingUp,   color: 'text-[#00C8E0]',  title: '6% Daily Compounded',       desc: 'Earnings auto-calculate on Total Revenue — not just the initial deposit' },
              { icon: Clock,        color: 'text-amber-400',  title: 'Instant to 30-min Withdrawal',desc: 'Quick processing with 4% handling fee — no hidden charges' },
              { icon: Users,        color: 'text-emerald-400',title: '50,000+ Active Users',       desc: 'Trusted traders across India with ₹2.5M+ daily trading volume' },
              { icon: CheckCircle2, color: 'text-green-400',  title: 'Transparent Returns',        desc: 'Every rupee tracked — deposit, earn, withdraw anytime after KYC' },
              { icon: Zap,          color: 'text-yellow-400', title: 'Automated System',           desc: 'Start once — earnings compound automatically every midnight reset' },
            ].map((f, i, arr) => (
              <div key={i} className={`flex items-start gap-3 py-3 ${i < arr.length-1 ? 'border-b border-[#1a3a5c]/50' : ''}`}>
                <div className={`p-2 bg-[#0B1929] rounded-xl border border-[#1a3a5c] flex-shrink-0 ${f.color}`}>
                  <f.icon size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">{f.title}</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          className="w-full py-4 bg-[#0f2236] border border-[#00C8E0]/40 text-[#00C8E0] rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 hover:bg-[#00C8E0]/10 transition-all"
        >
          <Download size={18} />
          Download Full Income Chart (PDF)
        </button>

        {/* CTA */}
        <button
          onClick={() => navigate('/quantify')}
          className="w-full py-5 bg-gradient-to-r from-[#00C8E0] to-emerald-500 text-[#0B1929] rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-[#00C8E0]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start Earning Today →
        </button>

        <p className="text-[9px] text-gray-600 text-center pb-4">
          * Returns are compounded at 6% daily on Total Revenue. Min deposit ₹600 to start quantifying.
        </p>

      </div>
    </div>
  );
};

export default EarningPotential;