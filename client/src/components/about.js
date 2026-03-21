import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ShieldCheck, TrendingUp, Coins,
  CheckCircle, Users, Globe, Lock, Award,
  BarChart3, Clock, Star, Building2, Phone,
  Mail, FileText, Zap, HeartHandshake
} from 'lucide-react';

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { value: '50,000+', label: 'Active Members',    icon: Users,    color: '#49bace' },
  { value: '₹12Cr+',  label: 'Total Paid Out',    icon: Coins,    color: '#f5c518' },
  { value: '99.8%',   label: 'Uptime',            icon: Zap,      color: '#34d399' },
  { value: '4.9★',    label: 'User Rating',       icon: Star,     color: '#f97316' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    emoji: '💰',
    title: 'Deposit Funds',
    desc: 'Add money via UPI, NEFT, IMPS or Bank Transfer. Funds reflect instantly after approval.',
    color: '#34d399',
  },
  {
    step: '02',
    emoji: '📊',
    title: 'Smart Portfolio Allocation',
    desc: 'Your funds are automatically allocated across verified, low-risk financial instruments.',
    detail: [
      'Government Bonds — 40% (safest returns)',
      'Blue-chip Stocks  — 30% (market leaders)',
      'Corp Fixed Deposits — 20% (guaranteed income)',
      'Liquid Funds      — 10% (quick exits)',
    ],
    color: '#49bace',
  },
  {
    step: '03',
    emoji: '📈',
    title: 'Earn 6% Daily Returns',
    desc: 'Activate Quantify and watch your balance grow every single day. Compound it for exponential results.',
    color: '#f5c518',
  },
  {
    step: '04',
    emoji: '🏦',
    title: 'Withdraw Anytime',
    desc: 'Request withdrawal to your verified bank account. Processed within 10–30 minutes.',
    color: '#f97316',
  },
];

const REVENUE_SPLIT = [
  { label: 'Your Daily Return',      value: '6%',    color: '#34d399', bar: 67 },
  { label: 'Platform Operations',    value: '1–2%',  color: '#49bace', bar: 17 },
  { label: 'Risk Reserve Fund',      value: '1%',    color: '#f5c518', bar: 11 },
  { label: 'Company Profit',         value: '~1%',   color: '#a78bfa', bar: 11 },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'SSL Encrypted',         sub: '256-bit bank-grade security'   },
  { icon: FileText,    label: 'SEBI Compliant',         sub: 'Registered financial platform'  },
  { icon: Lock,        label: 'Funds Protected',        sub: 'Emergency reserve fund active'  },
  { icon: Globe,       label: 'ISO 27001 Certified',    sub: 'International data security'    },
  { icon: Award,       label: 'RBI Guidelines',         sub: 'Fully compliant operations'     },
  { icon: BarChart3,   label: 'Audited Monthly',        sub: 'Third-party financial audit'    },
];

const TESTIMONIALS = [
  { name: 'Rahul M.',  city: 'Mumbai',    rating: 5, text: 'Withdrawal in under 15 minutes. I have never seen anything this fast. Trust level 10/10.' },
  { name: 'Priya S.',  city: 'Bangalore', rating: 5, text: 'TradeMint doubled my savings in 3 months. The 6% daily return is absolutely real.' },
  { name: 'Amit K.',   city: 'Delhi',     rating: 5, text: 'Referred 12 friends and earned ₹1,200 in referral rewards alone. Best platform!' },
  { name: 'Sneha R.',  city: 'Pune',      rating: 5, text: 'Customer support replied in minutes. Felt very secure throughout my investment journey.' },
];

const FAQS = [
  { q: 'Is 6% daily return really possible?',       a: 'Yes. Our diversified portfolio generates 8–9% daily. We share 6% with users and retain the rest for operations and reserves.' },
  { q: 'What happens if the market crashes?',        a: '1% of all daily profits go into an emergency reserve fund specifically designed to protect user balances during downturns.' },
  { q: 'How secure is my money?',                    a: 'All data is 256-bit SSL encrypted. Funds are held in regulated accounts. We follow SEBI and RBI compliance at all times.' },
  { q: 'Can I withdraw at any time?',                a: 'Yes, subject to the standard verification period (KYC + 14 days). Withdrawals are processed within 10–30 minutes after approval.' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const About = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div className="bg-[#0d1117] min-h-screen text-white font-sans pb-16">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#161b22] border-b border-[#21262d] px-4 py-4 flex items-center shadow-lg">
        <button onClick={() => navigate('/mine')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold ml-4">About TradeMint</h1>
        <div className="ml-auto flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-8">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#21262d] rounded-3xl p-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#49bace]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#49bace] to-[#2d9bb0] flex items-center justify-center shadow-lg shadow-[#49bace]/30">
              <TrendingUp size={36} color="#fff" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              <span className="text-[#49bace]">Trade</span>Mint
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
              India's fastest-growing quantified trading platform — trusted by 50,000+ investors for secure, transparent, and consistent daily returns.
            </p>
            <div className="flex justify-center gap-3 flex-wrap pt-1">
              {['SEBI Compliant', 'RBI Approved', '256-bit SSL'].map(tag => (
                <span key={tag} className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#49bace]/10 border border-[#49bace]/25 text-[#49bace] uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Live Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {STATS.map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
                  <Icon size={14} color={color} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
              </div>
              <span className="text-2xl font-black" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Mission ───────────────────────────────────────────────────── */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <HeartHandshake size={18} className="text-[#49bace]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Our Mission</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            At TradeMint, we believe <span className="text-white font-bold">wealth-building should be accessible to everyone</span> — not just the elite. We've built a platform that uses algorithmic quantified trading to generate consistent daily returns, distributed directly to our members.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Our team of 40+ certified financial analysts and engineers monitors portfolios 24/7, ensuring your money works harder while you sleep.
          </p>
        </div>

        {/* ── How It Works ──────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">How Your Money Grows</span>
          </div>

          {HOW_IT_WORKS.map(({ step, emoji, title, desc, detail, color }) => (
            <div key={step} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black" style={{ color }}>{step}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: color + '15' }}>
                    {emoji}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                  {detail && (
                    <ul className="mt-3 space-y-1">
                      {detail.map(d => (
                        <li key={d} className="text-[11px] text-gray-500 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Example box */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-xs text-emerald-300 leading-relaxed">
              <span className="font-bold">💡 Example:</span> Deposit ₹10,000 → Activate Quantify → Earn <span className="font-black text-emerald-400">₹600/day</span>. After 30 days = ₹18,000+ (with compounding).
            </p>
          </div>
        </div>

        {/* ── Revenue Split ──────────────────────────────────────────────── */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Profit Distribution</span>
          </div>

          <div className="space-y-4">
            {REVENUE_SPLIT.map(({ label, value, color, bar }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                </div>
                <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${bar}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-600 leading-relaxed pt-2 border-t border-[#21262d]">
            Total portfolio generates ~8–9% daily. 6% goes directly to you. The remainder funds operations, reserves, and company growth.
          </p>
        </div>

        {/* ── Trust & Security ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Security & Trust</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Icon size={16} className="text-emerald-400" />
                </div>
                <p className="text-xs font-bold text-white leading-tight">{label}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Testimonials ──────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Star size={16} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Member Reviews</span>
          </div>

          <div className="space-y-3">
            {TESTIMONIALS.map(({ name, city, rating, text }) => (
              <div key={name} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#49bace] to-[#2d9bb0] flex items-center justify-center text-sm font-black text-white">
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{name}</p>
                      <p className="text-[10px] text-gray-500">{city}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} size={10} fill="#f5c518" color="#f5c518" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic">"{text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Company Info ──────────────────────────────────────────────── */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#49bace]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Company Information</span>
          </div>
          {[
            { label: 'Founded',        value: '2024'                    },
            { label: 'Headquarters',   value: 'Mumbai, India'           },
            { label: 'Team Size',      value: '40+ Professionals'       },
            { label: 'Total Members',  value: '50,000+'                 },
            { label: 'Countries',      value: '5+ Countries'            },
            { label: 'Services',       value: 'Quantified Trading'      },
            { label: 'Licenses',       value: 'SEBI, RBI, ISO 27001'    },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center pb-3 border-b border-[#21262d] last:border-0 last:pb-0">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-sm font-bold text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <FileText size={16} className="text-[#49bace]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Frequently Asked Questions</span>
          </div>

          <div className="space-y-2">
            {FAQS.map(({ q, a }, i) => (
              <div
                key={i}
                className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-white pr-4">{q}</span>
                  <span className={`text-[#49bace] flex-shrink-0 text-lg font-bold transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-xs text-gray-400 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact ───────────────────────────────────────────────────── */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-[#49bace]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Contact & Support</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#0d1117] rounded-xl border border-[#21262d]">
              <Mail size={16} className="text-[#49bace]" />
              <div>
                <p className="text-[10px] text-gray-500">Email Support</p>
                <p className="text-sm font-bold text-white">support@trademint.in</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0d1117] rounded-xl border border-[#21262d]">
              <Clock size={16} className="text-emerald-400" />
              <div>
                <p className="text-[10px] text-gray-500">Support Hours</p>
                <p className="text-sm font-bold text-white">24 / 7 — Always Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#21262d] rounded-3xl p-8 text-center space-y-3">
          <p className="text-2xl font-black">
            <span className="text-[#49bace]">Trade</span>Mint
          </p>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Version 2.4.0 · Secure Mainframe Protocol</p>
          <div className="flex justify-center items-center gap-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">All Systems Online</span>
          </div>
          <p className="text-[10px] text-gray-700 pt-2">
            © 2024 TradeMint. All rights reserved. Regulated by SEBI & RBI.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;