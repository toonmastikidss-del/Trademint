import React, { useState, useEffect, useRef } from 'react';
import { BaggageClaimIcon, CirclePlus, Euro, HandCoins, X, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import animationVideo from '../video/animated.mp4';
import mainIco from '../pictures/mainico.png';

const Quantify = () => {
  const videoRef = useRef(null);
  const [isQuantifying, setIsQuantifying] = useState(false);
  const [balance, setBalance] = useState(0);
  const [approvedDepositAmount, setApprovedDepositAmount] = useState(0);
  const [todayEarning, setTodayEarning] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [loading, setLoading] = useState(true);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
  const [lowBalanceError, setLowBalanceError] = useState('');
  const [elevenFiftyNineCountdown, setElevenFiftyNineCountdown] = useState(0); // Countdown for 11:59 PM to 12:01 AM
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: '' });

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) {
          console.error('User not authenticated');
          return;
        }
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setBalance(data.balance);
        setApprovedDepositAmount(data.approvedDepositAmount);
        setTodayEarning(data.todayEarning);
        setTotalRevenue(data.totalRevenue);
        setIsQuantifying(data.isQuantifying);
        
        // If quantifying is active, ensure video plays
        if (data.isQuantifying && videoRef.current) {
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Handle persistent animation state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isQuantifying && videoRef.current) {
        if (document.hidden) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isQuantifying]);

  const handleStartQuantifying = async () => {
    if (isQuantifying || elevenFiftyNineCountdown > 0) return;
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        setAlertModal({ isOpen: true, message: 'Please login first', type: 'error' });
        return;
      }
      
      setLoading(true);
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/quantify/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setBalance(data.balance);
      setApprovedDepositAmount(data.approvedDepositAmount);
      setTodayEarning(data.todayEarning);
      setTotalRevenue(data.totalRevenue);
      setIsQuantifying(true);
      
      // Play animation video
      if (videoRef.current) {
        videoRef.current.play();
      }
      
      // Show success message
      setAlertModal({ isOpen: true, message: data.message, type: 'success' });
      
    } catch (error) {
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('recharge')) {
          setLowBalanceError(error.response.data.error);
          setShowLowBalanceModal(true);
        } else if (error.response.data.error.includes('already in progress')) {
          setAlertModal({ isOpen: true, message: error.response.data.error, type: 'error' });
        } else {
          setAlertModal({ isOpen: true, message: error.response.data.error, type: 'error' });
        }
      } else {
        setAlertModal({ isOpen: true, message: 'Error starting quantifying. Please try again.', type: 'error' });
      }
      console.error('Error starting quantifying:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Check for 11:59 PM to 12:01 AM countdown effect
  useEffect(() => {
    const checkForElevenFiftyNine = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Check if it's 11:59 PM (23:59) to 12:01 AM (00:01)
      if ((hours === 23 && minutes === 59) || (hours === 0 && minutes <= 1)) {
        // Start a 120-second countdown (from 11:59 PM to 12:01 AM)
        setElevenFiftyNineCountdown(120); // 2 minutes until next day properly starts
      }
    };
    
    // Check every minute
    const interval = setInterval(checkForElevenFiftyNine, 60000);
    
    // Initial check
    checkForElevenFiftyNine();
    
    return () => clearInterval(interval);
  }, []);
  
  // Countdown timer for 11:59 PM to 12:01 AM
  useEffect(() => {
    let interval = null;
    
    if (elevenFiftyNineCountdown > 0) {
      // Set quantifying to false during the countdown period
      setIsQuantifying(false);
      
      interval = setInterval(() => {
        setElevenFiftyNineCountdown(prev => prev - 1);
      }, 1000);
    } else if (elevenFiftyNineCountdown === 0) {
      // Countdown finished, refresh data
      const loadUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user'));
          
          if (!token || !user) return;
          
          const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const data = response.data;
          setBalance(data.balance);
          setApprovedDepositAmount(data.approvedDepositAmount);
          setTodayEarning(data.todayEarning); // This will be 0 after 11:59 PM reset
          setTotalRevenue(data.totalRevenue); // This preserves the previous day's total

          setIsQuantifying(data.isQuantifying);
          
          // If quantifying is active, ensure video plays
          if (data.isQuantifying && videoRef.current) {
            videoRef.current.play();
          }
        } catch (error) {
          console.error('Error loading user data after countdown:', error);
        }
      };
      
      loadUserData();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [elevenFiftyNineCountdown]);

  // Separate effect to ensure today's earning is always updated
  useEffect(() => {
    const fetchTodayEarning = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) return;
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update today's earning based on the response from backend
        // Backend handles the logic of whether to show 0 or actual earning
        setTodayEarning(response.data.todayEarning || 0);
        setTotalRevenue(response.data.totalRevenue || 0);
        setBalance(response.data.balance || 0);
        setApprovedDepositAmount(response.data.approvedDepositAmount || 0);
        
        // Update isQuantifying state as well to stay in sync
        setIsQuantifying(response.data.isQuantifying);
      } catch (error) {
        console.error('Error fetching today\'s earning:', error);
      }
    };
    
    // Fetch today's earning periodically (every 5 minutes) to ensure it's always up to date
    fetchTodayEarning();
    const earningInterval = setInterval(fetchTodayEarning, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(earningInterval);
  }, [isQuantifying]);

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center w-full px-6 pt-10 pb-24">
        <div className="w-12 h-12 border-4 border-[#49bace]/30 border-t-[#49bace] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full items-center justify-start w-full px-6 pt-10 pb-24">
        {/* 11:59 PM to 12:01 AM Countdown Overlay */}
        {elevenFiftyNineCountdown > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/10 to-purple-400/10 animate-pulse"></div>
              <div className="text-center z-10">
                <div className="text-6xl font-black text-white mb-2">{Math.floor(elevenFiftyNineCountdown / 60)}:{(elevenFiftyNineCountdown % 60).toString().padStart(2, '0')}</div>
                <div className="text-cyan-400 font-bold text-lg">COUNTDOWN</div>
              </div>
            </div>
          </div>
        )}
        
        {isQuantifying ? (
          <video
            ref={videoRef}
            src={animationVideo}
            className="mb-4 w-[100%]"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={mainIco}
            alt="Quantify Icon"
            className="mb-4 w-[100%]"
          />
        )}

        <button
          onClick={handleStartQuantifying}
          disabled={isQuantifying || loading || elevenFiftyNineCountdown > 0}
          className={`px-6 py-3 w-full text-white rounded-lg shadow-md mb-4 transition-all ${
            isQuantifying || elevenFiftyNineCountdown > 0
              ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
              : 'bg-[#52556b] hover:bg-[#62657b]'
          }`}
        >
          {isQuantifying ? 'Quantifying...' : elevenFiftyNineCountdown > 0 ? `Daily Reset... ${Math.floor(elevenFiftyNineCountdown / 60)}:${(elevenFiftyNineCountdown % 60).toString().padStart(2, '0')}` : 'Start Quantifying'}
        </button>

        <div className="w-full">
          <h2 className="text-md mt-3 mb-2 text-left text-slate-300 opacity-80">
            Quantitative Data
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-1 py-1 w-full">
          <div className="bg-[#212431] h-28 rounded-2xl text-center flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[#42bece] text-3xl font-bold">{totalRevenue.toFixed(2)}</span>
            <div className="flex text-[#adaabd] gap-2 md:gap-4 mt-2">
              <BaggageClaimIcon color="#635d73" size={25} />
              Total Revenue
            </div>
          </div>

          <div className="bg-[#212431] h-28 rounded-2xl text-center flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[#42bece] text-3xl font-bold">6%</span>
            <div className="flex text-[#adaabd] gap-2 md:gap-4 mt-2">
              <HandCoins color="#635d73" size={25} />
              Trading profit
            </div>
          </div>
          <div className="bg-[#212431] h-28 rounded-2xl text-center flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[#42bece] text-3xl font-bold">{approvedDepositAmount.toFixed(2)}</span>
            <div className="flex text-[#adaabd] gap-2 md:gap-4 mt-2">
              <Euro color="#635d73" size={25} />
              Balance
            </div>
          </div>
          <div className="bg-[#212431] h-28 rounded-2xl text-center flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[#42bece] text-3xl font-bold">{todayEarning.toFixed(2)}</span>
            <div className="flex text-[#adaabd] gap-2 md:gap-4 mt-2">
              <CirclePlus color="#635d73" size={25} />
              Today's Earning
            </div>
          </div>
        </div>

        {/* Modern What is Quantification Section */}
        <div className="w-full mt-8">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20 hover:shadow-3xl transition-all duration-500 hover:bg-white/10">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                <span className="text-2xl font-black text-cyan-400">?</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-2 tracking-tight">What is Quantification?</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Quantification is an automated trading process that generates profits based on your account balance.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => window.open('https://www.youtube.com/watch?v=example', '_blank')}
              className="w-full group relative py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </div>
                <span className="tracking-wider">WATCH VIDEO TUTORIAL</span>
              </div>
            </button>
          </div>
        </div>

        {/* Modern Quantify History Button */}
        <div className="w-full mt-6">
          <button 
            onClick={() => window.location.href = '/quantify/history'}
            className="w-full group relative py-5 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white font-black rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 border border-white/10"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            
            <div className="relative flex items-center justify-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-lg tracking-wider">VIEW QUANTIFY HISTORY</span>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Low Balance Modal */}
      {showLowBalanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#212431] border border-gray-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-800/20">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Insufficient Balance</h3>
                <button 
                  onClick={() => setShowLowBalanceModal(false)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-500/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} className="text-rose-400" />
                </div>
                <p className="text-gray-300 font-medium">{lowBalanceError}</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowLowBalanceModal(false);
                    window.location.href = '/deposite';
                  }}
                  className="w-full py-4 bg-[#49bace] text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-[#3da0bb] transition-all"
                >
                  Go to Deposit
                </button>
                
                <button 
                  onClick={() => setShowLowBalanceModal(false)}
                  className="w-full py-4 bg-gray-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AnimatePresence>
        {alertModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#212431] border border-gray-700 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full ${
                alertModal.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`} />

              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`p-4 rounded-3xl ${
                  alertModal.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {alertModal.type === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                </div>
                
                <div className="space-y-2">
                  <h3 className={`text-xl font-bold ${
                    alertModal.type === 'success' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {alertModal.type === 'success' ? 'Success!' : 'Error!'}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">
                    {alertModal.message}
                  </p>
                </div>

                <button
                  onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                  className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                    alertModal.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Quantify;
