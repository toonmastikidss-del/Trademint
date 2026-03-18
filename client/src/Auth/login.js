import { ChevronLeft, MailIcon, PhoneCall, Eye, EyeOff, ShieldCheck, Headset, Lock, Globe } from 'lucide-react'
import React, { useState } from 'react';
import axios from 'axios';
import AlertModal from '../components/AlertModal';
import { useNavigate } from 'react-router-dom';
import AIGLogo from '../pictures/AIGlogo.png'
import { API_CONFIG } from '../config/apiConfig';

const Login = () => {
  const [selected, setSelected] = useState('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: '' });
  const navigate = useNavigate()

  const handleSelect = (option) => {
    setSelected(option);
  }
  const handleLogin = async () => {
    try {
      // Validate phone number if phone login is selected
      if (selected === 'phone') {
        // Check if phone number is exactly 10 digits
        if (!/^[0-9]{10}$/.test(phone)) {
          setModal({ isOpen: true, message: 'Phone number must be exactly 10 digits', type: 'error' });
          return;
        }
        
        // Check if phone number starts with 1, 2, 3, 4, or 5
        if (/^[12345]/.test(phone)) {
          setModal({ isOpen: true, message: 'Phone number cannot start with 1, 2, 3, 4, or 5', type: 'error' });
          return;
        }
      }
      
      const payload = selected === 'phone' ? { phone, password } : { email, password };
      const res = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/login`, payload);
      
      setModal({ isOpen: true, message: res.data.message, type: 'success' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Wait a bit before redirecting so they see the success message
      setTimeout(() => {
        setModal({ ...modal, isOpen: false });
        navigate('/');
      }, 2000);
      
    } catch (err) {
      setModal({ 
        isOpen: true, 
        message: err.response?.data?.message || 'Login failed', 
        type: 'error' 
      });
    }
  };

  return (
    <div className='flex flex-col w-full min-h-screen bg-[#020617] pb-12 font-sans overflow-x-hidden'>
      {/* Premium Header - Modern Layered Design */}
      <div className='bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1e40af] pt-8 pb-20 rounded-b-[4rem] px-6 relative shadow-[0_20px_50px_rgba(30,64,175,0.3)]'>
        <div className='flex items-center justify-between mb-12'>
          <button onClick={() => navigate('/')} className='text-white p-2.5 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all'>
            <ChevronLeft size={22} />
          </button>
          <div className="flex flex-col items-center">
            <img src={AIGLogo} alt="AIG" className="h-10 object-contain drop-shadow-2xl" />
            <div className="h-1 w-10 bg-blue-400/40 rounded-full mt-2"></div>
          </div>
          <button className='flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10'>
            <Globe size={14} className="text-blue-400" />
            <span className='text-[11px] font-bold text-white uppercase tracking-widest'>EN</span>
          </button>
        </div>
        
        <div className='space-y-4 relative z-10 px-2'>
          <h1 className='text-4xl font-extrabold text-white tracking-tight'>Welcome Back</h1>
          <p className='text-blue-100/60 text-[12px] font-medium leading-relaxed max-w-[80%] uppercase tracking-[0.15em]'>
            Secure access to your quantification terminal
          </p>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]"></div>
      </div>

      {/* Tabs Section - Floating Card Style */}
      <div className='flex w-full px-8 -mt-10 relative z-20'>
        <div className='bg-[#0f172a]/90 backdrop-blur-3xl w-full rounded-[2.5rem] p-1.5 flex shadow-[0_25px_50px_rgba(0,0,0,0.5)] border border-white/5'>
          <button 
            onClick={() => handleSelect('phone')}
            className={`flex-1 py-4 rounded-[2rem] text-[11px] font-bold uppercase tracking-widest transition-all duration-500 flex items-center justify-center space-x-3 ${
              selected === 'phone' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <PhoneCall size={15} />
            <span>Phone</span>
          </button>
          <button 
            onClick={() => handleSelect('email')}
            className={`flex-1 py-4 rounded-[2rem] text-[11px] font-bold uppercase tracking-widest transition-all duration-500 flex items-center justify-center space-x-3 ${
              selected === 'email' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MailIcon size={15} />
            <span>Email</span>
          </button>
        </div>
      </div>

      <div className='w-full flex flex-col mt-12 px-8 space-y-8'>
        {selected === 'phone' ? (
          <div className='space-y-4'>
            <label className='block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 px-2'>Phone Number</label>
            <div className='flex space-x-3'>
              <div className='bg-[#0f172a] border border-slate-800 rounded-3xl px-5 py-5 flex items-center space-x-3 shadow-sm'>
                <span className='text-white font-bold text-sm'>+91</span>
                <ChevronLeft size={14} className='rotate-270 text-slate-600' />
              </div>
              <div className='flex-grow bg-[#0f172a] border border-slate-800 rounded-3xl px-6 py-5 flex items-center focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all shadow-sm'>
                <input
                  type='tel'
                  placeholder='00000 00000'
                  value={phone}
                  onChange={(e) => {
                    // Only allow numeric input and limit to 10 digits
                    const inputValue = e.target.value.replace(/[^0-9]/g, '').substring(0, 10);
                    setPhone(inputValue);
                  }}
                  className='bg-transparent text-white text-base font-medium w-full outline-none placeholder:text-slate-700'
                />
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <label className='block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 px-2'>Email Address</label>
            <div className='bg-[#0f172a] border border-slate-800 rounded-3xl px-6 py-5 flex items-center focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all shadow-sm'>
              <MailIcon size={18} className="text-slate-600 mr-4" />
              <input
                type='email'
                placeholder='name@company.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='bg-transparent text-white text-base font-medium w-full outline-none placeholder:text-slate-700'
              />
            </div>
          </div>
        )}

        <div className='space-y-4'>
          <label className='block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 px-2'>Security Password</label>
          <div className='bg-[#0f172a] border border-slate-800 rounded-3xl px-6 py-5 flex items-center focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all shadow-sm'>
            <Lock size={18} className="text-slate-600 mr-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='bg-transparent text-white text-base font-medium w-full outline-none placeholder:text-slate-700 tracking-[0.2em]'
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className='text-slate-600 hover:text-blue-400 transition-colors'
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className='flex items-center justify-between px-2'>
          <button 
            onClick={() => setRemember(!remember)}
            className='flex items-center space-x-3 group'
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              remember ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20' : 'border-slate-800 group-hover:border-slate-600'
            }`}>
              {remember && <ShieldCheck size={14} className='text-white' strokeWidth={3} />}
            </div>
            <span className='text-[11px] text-slate-500 font-bold uppercase tracking-widest'>Stay logged in</span>
          </button>
          <button className="text-[11px] text-blue-500 font-bold uppercase tracking-widest hover:text-blue-400 transition-colors" onClick={() => navigate('/authpass')}>Forgot?</button>
        </div>

        <div className='space-y-8 pt-4'>
          <button 
            onClick={handleLogin}
            className='w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-5 rounded-[2.5rem] font-bold text-[13px] uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(37,99,235,0.25)] hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300'
          >
            Authenticate
          </button>
          
          <div className='flex flex-col items-center space-y-4'>
            <span className='text-[11px] font-bold text-slate-600 uppercase tracking-widest'>New to the platform?</span>
            <button 
              onClick={() => navigate('/register')}
              className='text-white font-bold text-[11px] uppercase tracking-[0.2em] px-8 py-3 border border-slate-800 rounded-full hover:bg-white/5 transition-all'
            >
              Create New Account
            </button>
          </div>
        </div>

        <div className='flex justify-around items-center pt-8 border-t border-slate-900 mt-4'>
          <button onClick={() => navigate('/support')} className='flex items-center space-x-3 text-slate-500 hover:text-slate-300 transition-colors'>
            <Headset size={18} />
            <span className='text-[10px] font-bold uppercase tracking-widest'>Support</span>
          </button>
          <div className="w-px h-4 bg-slate-900"></div>
          <button className='flex items-center space-x-3 text-slate-500 hover:text-slate-300 transition-colors'>
            <ShieldCheck size={18} />
            <span className='text-[10px] font-bold uppercase tracking-widest'>Privacy</span>
          </button>
        </div>
      </div>
      <AlertModal 
        isOpen={modal.isOpen} 
        message={modal.message} 
        type={modal.type} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
      />
    </div>
  )
}

export default Login
