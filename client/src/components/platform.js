import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, BarChart3, Users, ShieldCheck, DollarSign, TrendingUp, Award, Clock, Globe } from 'lucide-react';

const PlatformInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#101821] min-h-screen text-white font-sans pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center shadow-lg">
        <button onClick={() => navigate('/')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold ml-4">Platform Information</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#49bace]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#49bace]/30">
            <BarChart3 size={40} className="text-[#49bace]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Platform Overview</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
            Advanced quantified trading platform with real-time market data and secure transactions
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Users', value: '50,000+', icon: Users, color: 'bg-blue-500' },
            { label: 'Daily Volume', value: '₹2.5M+', icon: DollarSign, color: 'bg-emerald-500' },
            { label: 'Success Rate', value: '99.9%', icon: Award, color: 'bg-amber-500' },
            { label: 'Countries', value: '15+', icon: Globe, color: 'bg-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#212431] border border-gray-700 p-4 rounded-2xl flex flex-col items-center justify-center shadow-xl">
              <div className={`${stat.color} p-2 rounded-lg mb-2`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className="text-lg font-black text-white">{stat.value}</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Platform Features */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <TrendingUp size={18} className="text-[#49bace]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Platform Features</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'Real-Time Market Data', desc: 'Live prices for Crypto, Stocks, Forex, and Bonds', icon: TrendingUp, color: 'text-green-400' },
              { title: 'Quantified Trading', desc: 'AI-powered trading algorithms for optimal returns', icon: BarChart3, color: 'text-blue-400' },
              { title: 'Secure Transactions', desc: 'Bank-level encryption for all deposits and withdrawals', icon: ShieldCheck, color: 'text-purple-400' },
              { title: '24/7 Support', desc: 'Round-the-clock customer assistance', icon: Clock, color: 'text-orange-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3 pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                <div className={`p-2 bg-[#101821] rounded-xl ${item.color} border border-gray-800 flex-shrink-0`}>
                  <item.icon size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-white mb-0.5 uppercase tracking-wider">{item.title}</h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Coverage */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <Globe size={18} className="text-[#49bace]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Market Coverage</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Cryptocurrency', items: 'BTC, ETH, BNB, SOL, TRX, LTC' },
              { name: 'Stocks', items: 'AAPL, MSFT, GOOGL, AMZN, TSLA' },
              { name: 'Forex', items: 'EUR/USD, GBP/USD, USD/JPY, AUD/USD' },
              { name: 'Bonds', items: 'US 10Y, US 2Y, US 30Y, UK 10Y' },
            ].map((market, i) => (
              <div key={i} className="bg-[#1a1f2e] p-3 rounded-xl border border-gray-800">
                <h3 className="text-xs font-bold text-white mb-1">{market.name}</h3>
                <p className="text-[9px] text-gray-500 leading-tight">{market.items}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Info Cards */}
        <div className="space-y-3">
          {[
            { title: 'Trading Hours', desc: '24/7 for Crypto | Market hours for Stocks & Forex', icon: Clock, color: 'text-cyan-400' },
            { title: 'Minimum Deposit', desc: '₹100 for all payment methods', icon: DollarSign, color: 'text-green-400' },
            { title: 'Withdrawal Time', desc: 'Instant to 30 minutes processing', icon: TrendingUp, color: 'text-yellow-400' },
            { title: 'Security Protocol', desc: 'SSL Encryption + 2FA Authentication', icon: ShieldCheck, color: 'text-red-400' },
          ].map((item, i) => (
            <div key={i} className="bg-[#212431] border border-gray-700 p-4 rounded-2xl flex items-start space-x-4 shadow-xl">
              <div className={`p-2 bg-[#101821] rounded-xl ${item.color} border border-gray-800`}>
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{item.title}</h3>
                <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-br from-[#49bace]/20 to-[#212431] p-6 rounded-[2.5rem] border border-[#49bace]/30 text-center shadow-2xl">
          <h3 className="text-base font-black text-white mb-2 tracking-tight">Trusted by 50,000+ Users</h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-4">Join India's Leading Trading Platform</p>
          <div className="flex justify-center items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformInfo;
