import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, BarChart3, Users, ShieldCheck,
  TrendingUp, Award, Clock, Globe, Zap,
  IndianRupee, BadgeCheck, Cpu, Headset,
  Lock, CandlestickChart, Building2, ArrowRight
} from 'lucide-react';

const PlatformInfo = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Users',   value: '50,000+', icon: Users,          color: 'bg-[#49bace]'  },
    { label: 'Daily Volume',   value: '₹2.5M+',  icon: IndianRupee,    color: 'bg-emerald-500' },
    { label: 'Uptime',         value: '99.9%',   icon: Award,           color: 'bg-amber-500'  },
    { label: 'Countries',      value: '15+',     icon: Globe,           color: 'bg-purple-500' },
  ];

  const features = [
    {
      icon: CandlestickChart, color: 'text-[#49bace]',
      title: 'Live Market Data',
      desc: 'Real-time prices for Crypto, Stocks, Forex & Bonds via Binance WebSocket',
    },
    {
      icon: Cpu, color: 'text-blue-400',
      title: 'Quantified Trading',
      desc: 'Automated 6% daily returns calculated on your total revenue',
    },
    {
      icon: ShieldCheck, color: 'text-purple-400',
      title: 'Bank-Level Security',
      desc: 'SSL encryption, bcrypt password hashing & JWT authentication',
    },
    {
      icon: Headset, color: 'text-orange-400',
      title: '24/7 Support',
      desc: 'Round-the-clock customer assistance via our support portal',
    },
    {
      icon: Zap, color: 'text-yellow-400',
      title: 'Instant Processing',
      desc: 'Deposits reflect within minutes; withdrawals processed in 10–30 min',
    },
    {
      icon: BadgeCheck, color: 'text-green-400',
      title: 'KYC Verification',
      desc: 'Verified accounts unlock higher withdrawal limits after 14 days',
    },
  ];

  const markets = [
    { name: 'Cryptocurrency', badge: '🔴 LIVE', items: 'BTC · ETH · BNB · SOL · TRX · LTC' },
    { name: 'Stocks',         badge: 'Simulated',  items: 'AAPL · MSFT · GOOGL · AMZN · TSLA' },
    { name: 'Forex',          badge: 'Simulated',  items: 'EUR/USD · GBP/USD · USD/JPY · AUD/USD' },
    { name: 'Bonds',          badge: 'Simulated',  items: 'US 10Y · US 2Y · US 30Y · UK 10Y' },
  ];

  const infoCards = [
    { icon: Clock,        color: 'text-[#49bace]',  title: 'Trading Hours',     desc: '24/7 for Crypto · Market hours for Stocks & Forex' },
    { icon: IndianRupee, color: 'text-green-400',   title: 'Minimum Deposit',   desc: '₹100 minimum · UPI, Bank Transfer accepted' },
    { icon: IndianRupee, color: 'text-amber-400',   title: 'Minimum Withdrawal',desc: '₹100 minimum · 4% handling fee applies' },
    { icon: TrendingUp,  color: 'text-emerald-400', title: 'Daily Returns',     desc: '6% per day on Total Revenue (compounded)' },
    { icon: Lock,        color: 'text-purple-400',  title: 'Withdrawal Rules',  desc: 'KYC + 14 days to unlock 50% of Available Balance' },
    { icon: Building2,   color: 'text-blue-400',    title: 'Infrastructure',    desc: 'Hosted on Railway · MongoDB Atlas · Binance WebSocket' },
  ];

  return (
    <div className="bg-[#101821] min-h-screen text-white font-sans pb-10">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center shadow-lg">
        <button onClick={() => navigate('/')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold ml-4">Platform Information</h1>
      </div>

      <div className="p-4 space-y-5">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#49bace]/15 to-[#212431] rounded-[2rem] border border-[#49bace]/25 p-6 text-center space-y-3 shadow-xl">
          <div className="w-16 h-16 bg-[#49bace]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#49bace]/30">
            <BarChart3 size={32} className="text-[#49bace]" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">TradeMint Platform</h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            India's growing quantified trading platform with live market data,
            automated returns & secure transactions.
          </p>
          <div className="flex justify-center items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">All Systems Operational</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-[#212431] border border-gray-700 p-4 rounded-2xl flex flex-col items-center justify-center shadow-xl gap-1">
              <div className={`${s.color} p-2 rounded-xl mb-1`}>
                <s.icon size={18} className="text-white" />
              </div>
              <span className="text-xl font-black text-white">{s.value}</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 px-1">
            <TrendingUp size={16} className="text-[#49bace]" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Platform Features</h2>
          </div>
          <div className="space-y-0">
            {features.map((f, i) => (
              <div key={i} className={`flex items-start gap-3 py-3 ${i < features.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <div className={`p-2 bg-[#101821] rounded-xl border border-gray-800 flex-shrink-0 ${f.color}`}>
                  <f.icon size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-0.5">{f.title}</h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Coverage */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Globe size={16} className="text-[#49bace]" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Market Coverage</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {markets.map((m, i) => (
              <div key={i} className="bg-[#1a1f2e] p-3 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-white">{m.name}</h3>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                    m.badge.includes('LIVE')
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {m.badge}
                  </span>
                </div>
                <p className="text-[9px] text-gray-500 leading-relaxed">{m.items}</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-gray-600 text-center mt-3">
            * Only Cryptocurrency uses real-time Binance data. Others are simulated for display.
          </p>
        </div>

        {/* Info Cards */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 px-1">
            <ShieldCheck size={16} className="text-[#49bace]" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Platform Details</h2>
          </div>
          <div className="space-y-0">
            {infoCards.map((c, i) => (
              <div key={i} className={`flex items-start gap-3 py-3 ${i < infoCards.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <div className={`p-2 bg-[#101821] rounded-xl border border-gray-800 flex-shrink-0 ${c.color}`}>
                  <c.icon size={16} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-white mb-0.5">{c.title}</h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Cpu size={16} className="text-[#49bace]" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-300">How Quantify Works</h2>
          </div>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Deposit minimum ₹600 to start quantifying' },
              { step: '2', text: 'Press "Start Quantifying" to activate 6% daily return' },
              { step: '3', text: 'Earnings compound daily on your Total Revenue' },
              { step: '4', text: 'Daily reset at midnight — start again next day' },
              { step: '5', text: 'Withdraw earnings after completing KYC & 14 days' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#49bace] flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white">
                  {s.step}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pt-0.5">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-[#49bace]/20 to-[#212431] p-6 rounded-[2rem] border border-[#49bace]/30 text-center shadow-2xl">
          <h3 className="text-base font-black text-white mb-1 tracking-tight">Trusted by 50,000+ Users</h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-4">
            Join India's Growing Trading Platform
          </p>
          <button
            onClick={() => navigate('/refer-earn')}
            className="inline-flex items-center gap-2 bg-[#49bace] text-[#101821] font-black text-xs px-5 py-2.5 rounded-full hover:scale-[1.03] transition-all"
          >
            Invite & Earn ₹100 <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PlatformInfo;