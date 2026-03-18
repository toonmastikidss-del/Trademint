import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { API_CONFIG } from '../config/apiConfig';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/c/login`, {
        username,
        password
      });
      
      // Store admin session
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminData', JSON.stringify(res.data.admin));
      
      // Redirect to admin dashboard
      navigate('/c/69805d29-3bcc-8323-a9b3-74765bdecb80');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f16] via-[#101821] to-[#1a1f2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Main</span>
        </button>

        {/* Login Card */}
        <div className="bg-[#1a1f2e] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#49bace] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#49bace]/30">
              <ShieldCheck size={32} className="text-[#101821]" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
              Admin <span className="text-[#49bace]">Access</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Secure administrative portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <p className="text-rose-400 text-sm font-bold text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Admin Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#101821] border border-gray-700 rounded-2xl py-4 px-6 pl-12 text-white font-medium focus:outline-none focus:border-[#49bace] transition-all placeholder:text-gray-600"
                  placeholder="Enter admin username"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101821] border border-gray-700 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-[#49bace] transition-all placeholder:text-gray-600"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#49bace] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#49bace] text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-[#49bace]/20 hover:bg-[#3da9bd] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-gray-800/20 rounded-2xl border border-gray-700/50">
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-[#49bace] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#49bace] mb-1">
                  Security Protocol
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  This portal requires administrative privileges. All access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-600 font-medium">
            © 2024 AdminCORE System • Secure Access Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;