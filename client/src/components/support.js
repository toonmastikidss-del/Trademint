import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Send, MessageCircle, Mail, ArrowRight, ShieldCheck, Clock, User, Bot, X } from 'lucide-react';
import { API_CONFIG } from '../config/apiConfig';

const Support = () => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id; // Handle both formats

  const commonProblems = [
    { label: 'Deposit Issues', value: 'Deposit' },
    { label: 'Withdrawal Delay', value: 'Withdraw' },
    { label: 'Login/Account', value: 'Account' },
    { label: 'Bonus/Rewards', value: 'Bonus' },
    { label: 'Talk to Human Admin', value: 'Admin' },
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showChat && userId) {
      fetchChatHistory();
      const interval = setInterval(fetchChatHistory, 5000); // Polling for admin replies
      return () => clearInterval(interval);
    }
  }, [showChat, userId]);

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/api/support/history/${userId}`);
      if (res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Chat fetch error", err);
    }
  };

  const handleSendMessage = async (text, isAutomated = false) => {
    if (!text.trim()) return;
    
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/api/support/message`, {
        userId,
        text,
        isAutomated
      });
      setMessages(res.data.messages);
      setInputText('');
      
      if (text === 'Admin') {
        setIsTyping(true);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            sender: 'admin', 
            text: 'I have notified our human agents. Please wait a moment while they join the chat.' 
          }]);
          setIsTyping(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Send error", err);
    }
  };

  const supportOptions = [
    { 
      id: 'live', 
      title: 'Direct Support Chat', 
      desc: 'Get instant answers from our AI or live human agents.', 
      icon: MessageCircle, 
      color: 'text-[#49bace]', 
      bgColor: 'bg-[#49bace]/10',
      action: () => setShowChat(true)
    },
    { 
      id: 'telegram', 
      title: 'Telegram Channel', 
      desc: 'Join our official channel for latest updates and signals.', 
      icon: Send, 
      color: 'text-sky-400', 
      bgColor: 'bg-sky-500/10',
      action: 'Join Now'
    },
    { 
      id: 'whatsapp', 
      title: 'WhatsApp Help', 
      desc: 'Chat directly with our 24/7 dedicated support agents.', 
      icon: MessageCircle, 
      color: 'text-emerald-400', 
      bgColor: 'bg-emerald-500/10',
      action: 'Chat Now'
    },
    { 
      id: 'email', 
      title: 'Email Support', 
      desc: 'Send us your detailed queries and get response in 24h.', 
      icon: Mail, 
      color: 'text-rose-400', 
      bgColor: 'bg-rose-500/10',
      action: 'Send Email'
    },
  ];

  return (
    <div className="bg-[#101821] min-h-screen text-white font-sans pb-10">
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center shadow-lg">
        <button onClick={() => navigate('/mine')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold ml-4">Customer Support</h1>
      </div>

      <div className="p-4 space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#49bace] to-[#2d8ba1] p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <ShieldCheck size={120} />
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">How can we help?</h2>
          <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Our team is available 24/7</p>
          
          <div className="mt-6 flex justify-center items-center space-x-3 bg-black/20 backdrop-blur-md rounded-2xl py-3 px-6 mx-auto w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Support Agents Online</span>
          </div>
        </div>

        {/* Support Grid */}
        <div className="space-y-4">
          {supportOptions.map((opt) => (
            <div 
              key={opt.id} 
              onClick={() => typeof opt.action === 'function' ? opt.action() : null}
              className="bg-[#212431] border border-gray-700 p-6 rounded-[2rem] flex items-center justify-between shadow-xl active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl ${opt.bgColor} ${opt.color} border border-white/5`}>
                  <opt.icon size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 tracking-tight">{opt.title}</h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed max-w-[180px]">{opt.desc}</p>
                </div>
              </div>
              <div className="bg-[#101821] p-2 rounded-xl group-hover:bg-[#49bace]/10 group-hover:text-[#49bace] transition-all">
                <ArrowRight size={18} className="text-gray-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Working Hours */}
        <div className="bg-[#212431]/50 border border-gray-700/50 p-6 rounded-[2rem] flex items-center space-x-4">
          <div className="p-3 bg-gray-800 rounded-2xl text-gray-400">
            <Clock size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Service Hours</h4>
            <p className="text-[10px] text-gray-500 font-medium">Monday - Sunday: 00:00 - 24:00 (IST)</p>
          </div>
        </div>
      </div>

      {/* Chat Window Overlay */}
      {showChat && (
        <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col">
          {/* Chat Header */}
          <div className="bg-[#1e3a8a] p-6 flex items-center justify-between shadow-2xl text-white">
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowChat(false)} className="p-2 bg-white/10 rounded-xl">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center border border-blue-400/30">
                  <Bot size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AIG Virtual Assistant</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white/50 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-8">
                <div className="p-6 bg-blue-500/10 rounded-full">
                  <MessageCircle size={48} className="text-blue-400" />
                </div>
                <h4 className="font-bold text-lg text-slate-300">Welcome to AIG Support</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Please select a common problem or type your query below to get help.</p>
                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  {commonProblems.map((prob) => (
                    <button 
                      key={prob.value}
                      onClick={() => handleSendMessage(prob.value, true)}
                      className="p-4 bg-[#0f172a] border border-slate-800 rounded-2xl text-[11px] font-bold text-slate-400 hover:border-blue-500/50 hover:text-blue-400 transition-all text-left flex justify-between items-center"
                    >
                      {prob.label}
                      <ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-[#1e293b] text-slate-200 border border-slate-800 rounded-tl-none shadow-xl'
                    }`}>
                      {msg.text}
                      <div className={`text-[9px] mt-2 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#1e293b] p-4 rounded-2xl rounded-tl-none flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-[#0f172a] border-t border-slate-800">
            <div className="flex items-center space-x-3 bg-[#020617] border border-slate-800 rounded-3xl px-6 py-2 shadow-inner focus-within:border-blue-500/50 transition-all">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder="Type your message..." 
                className="flex-grow bg-transparent text-white text-sm py-3 outline-none"
              />
              <button 
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-90 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
