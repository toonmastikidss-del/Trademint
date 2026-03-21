import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, DollarSign, Clock, Shield, Zap, Target, Award, ArrowUpRight, Calculator } from 'lucide-react';

const EarningPotential = () => {
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState('');

  // Calculate earnings based on different plans
  const calculateEarnings = (amount, percentage) => {
    return (parseFloat(amount) * percentage / 100).toFixed(2);
  };

  const earningPlans = [
    {
      name: 'Basic Plan',
      dailyReturn: '3%',
      duration: '30 Days',
      minDeposit: '₹500',
      maxDeposit: '₹5,000',
      color: 'from-blue-500 to-cyan-500',
      icon: TrendingUp
    },
    {
      name: 'Standard Plan',
      dailyReturn: '4.5%',
      duration: '60 Days',
      minDeposit: '₹5,001',
      maxDeposit: '₹20,000',
      color: 'from-emerald-500 to-green-500',
      icon: Zap
    },
    {
      name: 'Premium Plan',
      dailyReturn: '6%',
      duration: '90 Days',
      minDeposit: '₹20,001',
      maxDeposit: '₹1,00,000',
      color: 'from-purple-500 to-pink-500',
      icon: Award
    }
  ];

  return (
    <div className='bg-[#101821] min-h-screen text-white pb-24 font-sans'>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => window.history.back()} className='p-1'>
          <ChevronLeft size={24} color="#fff" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Earning Potential</h1>
        <div className="w-6"></div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <TrendingUp size={28} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Maximize Your Earnings</h2>
              <p className="text-blue-100/70 text-xs mt-1">Smart quantification strategies</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowUpRight size={16} className="text-emerald-400" />
                <span className="text-[10px] text-gray-400 uppercase">Daily</span>
              </div>
              <span className="text-xl font-black text-emerald-400">3-6%</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={16} className="text-blue-400" />
                <span className="text-[10px] text-gray-400 uppercase">Duration</span>
              </div>
              <span className="text-xl font-black text-blue-400">30-90D</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <Shield size={16} className="text-purple-400" />
                <span className="text-[10px] text-gray-400 uppercase">Secure</span>
              </div>
              <span className="text-xl font-black text-purple-400">100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Earning Calculator */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-[#49bace]/10 rounded-xl">
              <Calculator size={22} className="text-[#49bace]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Earnings Calculator</h3>
              <p className="text-[10px] text-gray-500">Calculate your potential returns</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2 block">Enter Investment Amount</label>
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
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[20px]"></div>
                    <span className="text-[9px] text-white/80 uppercase font-bold block mb-1">{plan.name}</span>
                    <span className="text-lg font-black text-white block mb-1">{calculateEarnings(investmentAmount, parseFloat(plan.dailyReturn))}</span>
                    <span className="text-[8px] text-white/70">daily</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Earning Plans */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-2 px-2">
            <Target size={18} className="text-[#49bace]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Quantification Plans</h3>
          </div>

          {earningPlans.map((plan, index) => (
            <div key={index} className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-gray-600 transition-all">
              {/* Gradient Background Accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.color}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 bg-gradient-to-br ${plan.color} rounded-2xl shadow-lg`}>
                    <plan.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{plan.duration} Plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {plan.dailyReturn}
                  </div>
                  <span className="text-[9px] text-gray-500 uppercase font-bold">Daily Return</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#101821] rounded-xl p-3 border border-gray-800">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Min Deposit</span>
                  <span className="text-sm font-bold text-white">{plan.minDeposit}</span>
                </div>
                <div className="bg-[#101821] rounded-xl p-3 border border-gray-800">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Max Deposit</span>
                  <span className="text-sm font-bold text-white">{plan.maxDeposit}</span>
                </div>
              </div>

              <div className="bg-[#101821]/50 rounded-xl p-3 border border-gray-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-500 uppercase font-bold">Total Return after {plan.duration}</span>
                  <span className="text-sm font-black text-emerald-400">
                    +{calculateEarnings(parseFloat(plan.minDeposit.replace(/[^0-9]/g, '')), parseFloat(plan.dailyReturn) * parseInt(plan.duration))}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/quantify')}
                className={`w-full mt-4 py-4 bg-gradient-to-r ${plan.color} text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all`}
              >
                Start Quantifying Now
              </button>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 px-2">Why Choose Our Platform</h3>
          
          <div className="space-y-4">
            {[
              { icon: Shield, title: 'Secure & Transparent', desc: '100% secure quantification with real-time tracking' },
              { icon: Clock, title: 'Instant Withdrawals', desc: 'Withdraw your earnings anytime, anywhere' },
              { icon: Zap, title: 'Automated System', desc: 'Set it and forget it - fully automated earnings' },
              { icon: Award, title: 'Proven Track Record', desc: 'Trusted by 10,000+ users worldwide' }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                <div className="p-2.5 bg-[#49bace]/10 rounded-xl flex-shrink-0">
                  <feature.icon size={20} className="text-[#49bace]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/deposite')}
          className="w-full py-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-[2.5rem] font-bold text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start Earning Today
        </button>
      </div>
    </div>
  );
};

export default EarningPotential;
