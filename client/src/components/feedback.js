import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Star, Send, 
  MessageSquare, User, Mail, 
  CheckCircle2, Image as ImageIcon 
} from 'lucide-react';

const Feedback = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/mine');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="bg-[#101821] min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-white">Thank You!</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your feedback has been received. We appreciate your contribution to making our platform better.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#101821] min-h-screen text-white font-sans flex flex-col relative">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] w-full px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/mine')} className="p-1">
            <ChevronLeft size={24} className="text-gray-300" />
          </button>
          <h1 className="text-lg font-bold">Feedback & Reviews</h1>
        </div>
        <div className="p-2 bg-[#49bace]/10 rounded-xl">
          <MessageSquare size={20} className="text-[#49bace]" />
        </div>
      </div>

      <div className="p-4 space-y-6 pb-32">
        {/* Intro Card */}
        <div className="bg-gradient-to-br from-[#49bace] to-[#2d8ba1] p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <MessageSquare size={120} />
          </div>
          <h2 className="text-xl font-black mb-2">Help us Improve</h2>
          <p className="text-white/80 text-xs leading-relaxed font-medium">
            Your experience matters. Share your thoughts, report issues, or suggest new features.
          </p>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-4">Rate your experience</span>
            <div className="flex justify-center space-x-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    size={32} 
                    fill={star <= rating ? "#f7db45" : "none"} 
                    className={star <= rating ? "text-[#f7db45]" : "text-gray-700"} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="text"
                placeholder="Your Name"
                required
                className="w-full bg-[#1a1f2e] border border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:border-[#49bace] outline-none transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-4 top-6 text-gray-600" size={18} />
              <textarea 
                placeholder="Describe your experience..."
                required
                rows={5}
                className="w-full bg-[#1a1f2e] border border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:border-[#49bace] outline-none transition-all placeholder:text-gray-700 resize-none"
              ></textarea>
            </div>

            <button 
              type="button"
              className="w-full bg-[#1a1f2e] border-2 border-dashed border-gray-800 rounded-2xl py-6 flex flex-col items-center justify-center space-y-2 hover:border-[#49bace]/50 transition-colors"
            >
              <ImageIcon className="text-gray-600" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Upload Screenshot (Optional)</span>
            </button>
          </div>

          {/* Submit Button Container */}
          <div className="sticky bottom-6 left-0 right-0 z-50">
            <button 
              type="submit"
              className="w-full bg-[#49bace] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-[#49bace]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
            >
              <span>Submit Feedback</span>
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;