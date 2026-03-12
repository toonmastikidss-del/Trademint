import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, BookOpen, 
  HelpCircle, Lightbulb, Zap,
  CheckCircle2, ArrowRight
} from 'lucide-react';

const Tutorial = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Account Setup",
      desc: "Register your account and complete KYC verification to unlock all features.",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      title: "Deposit Funds",
      desc: "Go to the deposit page, select a payment method, and recharge your wallet.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
    {
      title: "Start Quantifying",
      desc: "Activate your first quantification task and start earning daily commissions.",
      icon: Lightbulb,
      color: "text-[#49bace]",
      bg: "bg-[#49bace]/10"
    },
    {
      title: "Invite & Earn",
      desc: "Share your referral link with friends and build your team for extra bonuses.",
      icon: HelpCircle,
      color: "text-rose-400",
      bg: "bg-rose-400/10"
    }
  ];

  return (
    <div className="bg-[#101821] min-h-screen text-white font-sans flex flex-col relative">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] w-full px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/mine')} className="p-1">
            <ChevronLeft size={24} className="text-gray-300" />
          </button>
          <h1 className="text-lg font-bold">Tutorial Guide</h1>
        </div>
        <div className="p-2 bg-[#49bace]/10 rounded-xl">
          <BookOpen size={20} className="text-[#49bace]" />
        </div>
      </div>

      <div className="p-4 space-y-6 pb-12">
        {/* Video Placeholder */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] overflow-hidden shadow-xl aspect-video relative group cursor-pointer">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <div className="w-16 h-16 bg-[#49bace] rounded-full flex items-center justify-center shadow-2xl shadow-[#49bace]/40 group-hover:scale-110 transition-transform">
              <Play fill="white" className="text-white ml-1" size={32} />
            </div>
          </div>
          <div className="absolute bottom-4 left-6">
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">Introductory Video</span>
          </div>
        </div>

        {/* Step by Step */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Quick Start Guide</span>
          </div>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div 
                key={i}
                className="bg-[#212431] border border-gray-700 p-6 rounded-[2.5rem] shadow-xl flex items-start space-x-5 group hover:border-[#49bace]/30 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${step.bg} group-hover:scale-105 transition-transform`}>
                  <step.icon size={28} className={step.color} />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black text-white">{step.title}</h3>
                    <span className="text-[10px] font-black text-gray-600">0{i+1}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Center CTA */}
        <div className="bg-[#1a1f2e] border border-dashed border-gray-800 p-8 rounded-[2.5rem] text-center space-y-4">
          <h4 className="text-sm font-black text-gray-300">Still have questions?</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Our support team is available 24/7</p>
          <button 
            onClick={() => navigate('/support')}
            className="inline-flex items-center space-x-2 text-[#49bace] font-black text-xs uppercase tracking-widest hover:underline"
          >
            <span>Contact Support</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;