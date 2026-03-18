import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, ShieldCheck, Heart, Award, TrendingUp, Coins, CheckCircle } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#101821] min-h-screen text-white font-sans pb-10">
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center shadow-lg">
        <button onClick={() => navigate('/mine')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold ml-4">About Us</h1>
      </div>

      <div className="p-4 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#49bace]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#49bace]/30">
            <Info size={40} className="text-[#49bace]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">About Our Platform</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
            We are a trusted financial technology platform delivering secure and innovative quantified trading solutions to our global community.
          </p>
        </div>

        {/* How It Works - Investment Details */}
        <div className="bg-gradient-to-br from-[#212431] to-[#1a1f2e] border border-gray-700 rounded-[2.5rem] p-6 shadow-2xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">How Your Money Grows</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[#101821] p-4 rounded-2xl border border-gray-800">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">1. You Deposit Money</h3>
                  <p className="text-xs text-gray-400">Add funds to your wallet via UPI, Bank Transfer, or other payment methods.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#101821] p-4 rounded-2xl border border-gray-800">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">2. We Invest Strategically</h3>
                  <p className="text-xs text-gray-400">Your money is pooled and invested across multiple low-risk instruments:</p>
                  <ul className="text-xs text-gray-500 mt-2 space-y-1 ml-4">
                    <li>• Government Bonds (40%) - Stable returns</li>
                    <li>• Blue-chip Stocks (30%) - Market leaders</li>
                    <li>• Corporate Fixed Deposits (20%) - Guaranteed income</li>
                    <li>• Liquid Funds (10%) - Easy withdrawals</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#101821] p-4 rounded-2xl border border-gray-800">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📈</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">3. Earn 6% Daily Returns</h3>
                  <p className="text-xs text-gray-400">Our diversified portfolio generates consistent returns, shared with you as 6% daily interest on your balance through our quantify system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Model */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <Coins size={18} className="text-yellow-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Revenue & Profit Distribution</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Total Portfolio Return</span>
              <span className="text-sm font-bold text-white">~8-9% / day</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-xs text-gray-400 font-medium">User Share (You)</span>
              <span className="text-sm font-bold text-emerald-400">6% / day</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Platform Maintenance</span>
              <span className="text-sm font-bold text-blue-400">1-2% / day</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Risk Reserve Fund</span>
              <span className="text-sm font-bold text-amber-400">1% / day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-medium">Company Profit</span>
              <span className="text-sm font-bold text-purple-400">~1% / day</span>
            </div>
          </div>

          <div className="mt-4 bg-[#101821] p-3 rounded-xl border border-gray-800">
            <p className="text-[10px] text-gray-500 leading-relaxed">
              💡 <strong>Example:</strong> If you have ₹10,000 in your wallet and activate quantify, you earn ₹600 daily (6% of ₹10,000). This compounds if you reinvest!
            </p>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Risk Management</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Diversified Investments</h3>
                <p className="text-xs text-gray-500">Never put all eggs in one basket - spread across 10+ asset classes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Emergency Reserve Fund</h3>
                <p className="text-xs text-gray-500">1% of daily profits set aside for market downturns</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Regulatory Compliance</h3>
                <p className="text-xs text-gray-500">All investments follow SEBI and RBI guidelines</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <Info size={18} className="text-[#49bace]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Company Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Founded</span>
              <span className="text-sm font-bold text-white">2024</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Headquarters</span>
              <span className="text-sm font-bold text-white">India</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Members</span>
              <span className="text-sm font-bold text-white">10,000+</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-medium">Services</span>
              <span className="text-sm font-bold text-white">Trading, Investment</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-br from-[#312c42] to-[#212431] p-8 rounded-[2.5rem] border border-gray-700 text-center shadow-2xl">
          <h3 className="text-lg font-black text-white mb-2 tracking-tight">Version 2.4.0</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Secure Mainframe Protocol</p>
          <div className="flex justify-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
