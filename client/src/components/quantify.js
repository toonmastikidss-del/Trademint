import React, { useState, useEffect, useRef } from 'react';
import { BaggageClaimIcon, CirclePlus, Euro, HandCoins, X, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import animationVideo from '../video/animated.mp4';
import mainIco from '../pictures/mainico.png';
import { checkBalanceChange } from '../utils/balanceDetection';
import { API_CONFIG } from '../config/apiConfig';

const Quantify = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isQuantifying, setIsQuantifying] = useState(false);
  const [balance, setBalance] = useState(0);
  const [todayEarning, setTodayEarning] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
  const [lowBalanceError, setLowBalanceError] = useState('');
  const [elevenFiftyNineCountdown, setElevenFiftyNineCountdown] = useState(0);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: '' });
  const [serverTime, setServerTime] = useState(null);
  const [mode, setMode] = useState('current'); // 'current' or 'continue'
  const [lastBalance, setLastBalance] = useState(0); // Track balance changes

  // Fetch server time
  const fetchServerTime = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/time`);
      const serverTimeObj = new Date(response.data.serverTime);
      setServerTime(serverTimeObj);
    } catch (error) {
      console.error('Error fetching server time:', error);
      const clientTime = new Date();
      setServerTime(clientTime);
    }
  };

  // Load user data on component mount and periodically
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) {
          console.error('User not authenticated');
          return;
        }
        
        await fetchServerTime();
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setBalance(data.balance || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setTodayEarning(data.todayEarning || 0);
        setIsQuantifying(data.isQuantifying || false);
        setMode(data.mode || 'current');
        
        // Detect balance change (deposit/withdrawal happened)
        if (lastBalance > 0 && data.balance !== lastBalance) {
          console.log('💰 BALANCE CHANGED DETECTED!');
          console.log('Old Balance:', lastBalance);
          console.log('New Balance:', data.balance);
          console.log('Difference:', data.balance - lastBalance);
          console.log('Backend sent - Today Earning:', data.todayEarning, '| Total Revenue:', data.totalRevenue);
          
          // Use the values from backend (they already calculated it if quantifying was active)
          setBalance(data.balance || 0);
          setTotalRevenue(data.totalRevenue || 0);
          setTodayEarning(data.todayEarning || 0);
          
          // Show notification
          const earningChanged = data.todayEarning > 0;
          setAlertModal({
            isOpen: true,
            message: `Balance updated! ${data.balance > lastBalance ? '+' : ''}${(data.balance - lastBalance).toFixed(2)} | ${earningChanged ? '✅ Earnings auto-calculated!' : 'Total Revenue updated'}`,
            type: 'success'
          });
        } else {
          // Normal update (no balance change)
          setBalance(data.balance || 0);
          setTotalRevenue(data.totalRevenue || 0);
          setTodayEarning(data.todayEarning || 0);
        }
        
        // Update last balance tracker
        setLastBalance(data.balance || 0);
        
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
    
    // Refresh data every 10 seconds (optimized from 5s to reduce server load)
    // Balance changes will still show quickly enough without overloading server
    const interval = setInterval(loadUserData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Midnight countdown check (11:59 PM to 12:01 AM) - IMPROVED
  useEffect(() => {
    const checkForMidnight = () => {
      // Always use server time for consistency
      const currentTime = serverTime || new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const seconds = currentTime.getSeconds();
      
      console.log('🕐 Checking midnight:', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      // Check if it's between 11:59:00 PM (23:59:00) and 12:01:00 AM (00:01:00)
      // More precise check with seconds
      if ((hours === 23 && minutes === 59) || (hours === 0 && minutes <= 1)) {
        console.log('⏰ MIDNIGHT DETECTED! Starting countdown...');
        // Calculate remaining seconds in the 2-minute window
        let remainingSeconds = 120; // Default 2 minutes
        
        if (hours === 23 && minutes === 59) {
          // In 11:59 PM, count down from (60 - seconds) + 60 seconds for 12:00-12:01
          remainingSeconds = (60 - seconds) + 60;
        } else if (hours === 0 && minutes === 0) {
          // In 12:00 AM, count down from (60 - seconds)
          remainingSeconds = 60 - seconds;
        } else if (hours === 0 && minutes === 1) {
          // In 12:01 AM, just show few seconds
          remainingSeconds = 10;
        }
        
        setElevenFiftyNineCountdown(remainingSeconds);
      }
    };
    
    // Check every 5 seconds for more responsive detection
    const interval = setInterval(checkForMidnight, 5000);
    checkForMidnight(); // Initial check
    
    return () => clearInterval(interval);
  }, [serverTime]);

  // Midnight countdown timer - IMPROVED
  useEffect(() => {
    let interval = null;
    
    if (elevenFiftyNineCountdown > 0) {
      console.log('⏳ Countdown running:', elevenFiftyNineCountdown, 'seconds remaining');
      
      // Disable quantifying during midnight break
      setIsQuantifying(false);
      
      interval = setInterval(() => {
        setElevenFiftyNineCountdown(prev => {
          if (prev <= 1) {
            console.log('✅ Countdown finished!');
            return 0; // Will trigger reset
          }
          return prev - 1;
        });
      }, 1000);
    } else if (elevenFiftyNineCountdown === 0 && elevenFiftyNineCountdown !== -1) {
      // Only run reset if countdown just finished (not on every page refresh)
      // Set to -1 after running to prevent re-running on refresh
      console.log('🔄 Performing midnight reset...');
      
      const performMidnightReset = async () => {
        try {
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user'));
          
          if (!token || !user) {
            console.warn('⚠️ User not authenticated, skipping reset');
            setElevenFiftyNineCountdown(-1); // Mark as complete
            return;
          }
          
          // Check current server time - only reset if actually in midnight window
          const currentTime = serverTime || new Date();
          const hours = currentTime.getHours();
          const minutes = currentTime.getMinutes();
          const isActuallyMidnight = (hours === 23 && minutes === 59) || 
                                     (hours === 0 && minutes <= 1);
          
          if (!isActuallyMidnight) {
            // Not actually midnight - don't reset, just mark countdown as done
            console.log('ℹ️ Not midnight time, skipping reset');
            setElevenFiftyNineCountdown(-1);
            return;
          }
          
          console.log('✨ Calling backend midnight reset API...');
          
          // Call backend midnight reset
          await axios.post(`${API_CONFIG.BASE_URL}/api/quantify/midnight-reset`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Backend reset successful!');
          
          // Reload data after reset
          const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const data = response.data;
          setBalance(data.balance || 0);
          setTotalRevenue(data.totalRevenue || 0);
          setTodayEarning(0); // Reset today's earning
          setIsQuantifying(false);
          setMode(data.mode || 'continue'); // Switch to continue mode
          
          console.log('📊 New day data loaded:', data);
          
          // Show success message
          setAlertModal({ 
            isOpen: true, 
            message: 'New day started! Click "Start Quantifying" to continue.', 
            type: 'success' 
          });
          
          // Mark as complete
          setElevenFiftyNineCountdown(-1);
        } catch (error) {
          console.error('❌ Error in midnight reset:', error);
          setElevenFiftyNineCountdown(-1);
        }
      };
      
      performMidnightReset();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [elevenFiftyNineCountdown, serverTime]);

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
      setBalance(data.balance || 0);
      setTotalRevenue(data.totalRevenue || 0);
      setTodayEarning(data.todayEarning || 0);
      setIsQuantifying(true);
      setMode(data.mode || 'current');
      
      // Play animation video
      if (videoRef.current) {
        videoRef.current.play();
      }
      
      // Show success message
      setAlertModal({ 
        isOpen: true, 
        message: `${data.mode === 'current' ? 'Current' : 'Continue'} mode activated! Earning started.`, 
        type: 'success' 
      });
      
    } catch (error) {
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('recharge')) {
          setLowBalanceError(error.response.data.error);
          setShowLowBalanceModal(true);
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
        {/* Midnight Countdown Overlay with Glassmorphism */}
        {elevenFiftyNineCountdown > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl"></div>
            
            {/* Animated Gradient Border */}
            <div className="relative w-72 h-72 rounded-full bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30 flex items-center justify-center border-2 border-white/20 animate-pulse">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 animate-spin"></div>
              
              {/* Countdown Display */}
              <div className="text-center z-10">
                <div className="text-7xl font-black text-white mb-3 drop-shadow-lg">
                  {Math.floor(elevenFiftyNineCountdown / 60)}:{(elevenFiftyNineCountdown % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-cyan-300 font-bold text-lg tracking-widest drop-shadow-md">DAILY RESET</div>
                <div className="text-purple-300 text-sm mt-2 font-medium">Please wait for new day</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Video or Image Display */}
        {isQuantifying ? (
          <video
            ref={videoRef}
            src={animationVideo}
            className="mb-4 w-[100%] rounded-2xl shadow-2xl"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={mainIco}
            alt="Quantify Icon"
            className="mb-4 w-[100%] rounded-2xl shadow-2xl"
          />
        )}

        {/* Start Quantifying Button */}
        <button
          onClick={handleStartQuantifying}
          disabled={isQuantifying || loading || elevenFiftyNineCountdown > 0}
          className={`px-6 py-4 w-full text-white rounded-2xl shadow-lg mb-6 transition-all duration-300 transform ${
            isQuantifying || elevenFiftyNineCountdown > 0
              ? 'bg-gray-700 opacity-60 cursor-not-allowed scale-100' 
              : 'bg-gradient-to-r from-[#52556b] to-[#62657b] hover:from-[#62657b] hover:to-[#72758b] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isQuantifying ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Quantifying...
            </span>
          ) : elevenFiftyNineCountdown > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Daily Reset in Progress...
            </span>
          ) : (
            'Start Quantifying'
          )}
        </button>

        {/* Mode Indicator */}
        {!isQuantifying && elevenFiftyNineCountdown === 0 && (
          <div className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-semibold text-sm">Current Mode:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                mode === 'current' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}>
                {mode === 'current' ? '📊 Current (Balance Based)' : '🔄 Continue (Revenue Based)'}
              </span>
            </div>
          </div>
        )}

        {/* Quantitative Data Section */}
        <div className="w-full">
          <h2 className="text-md mb-4 text-left text-slate-300 opacity-80 font-semibold">
            Quantitative Data
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 gap-4 px-1 py-2 w-full">
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-[#212431] to-[#2a2d3e] h-32 rounded-2xl text-center flex flex-col items-center justify-center shadow-xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
            <span className="text-[#42bece] text-3xl font-bold">{totalRevenue.toFixed(2)}</span>
            <div className="flex text-[#adaabd] gap-2 mt-2 items-center">
              <BaggageClaimIcon color="#635d73" size={22} />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
          </div>

          {/* Trading Profit Card */}
          <div className="bg-gradient-to-br from-[#212431] to-[#2a2d3e] h-32 rounded-2xl text-center flex flex-col items-center justify-center shadow-xl border border-white/5 hover:border-green-500/20 transition-all duration-300">
            <span className="text-[#42bece] text-3xl font-bold">6%</span>
            <div className="flex text-[#adaabd] gap-2 mt-2 items-center">
              <HandCoins color="#635d73" size={22} />
              <span className="text-sm font-medium">Trading Profit</span>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#212431] to-[#2a2d3e] h-32 rounded-2xl text-center flex flex-col items-center justify-center shadow-xl border border-white/5 hover:border-blue-500/20 transition-all duration-300">
            <span className="text-[#42bece] text-3xl font-bold">{balance.toFixed(2)}</span>
            <div className="flex text-[#adaabd] gap-2 mt-2 items-center">
              <Euro color="#635d73" size={22} />
              <span className="text-sm font-medium">Balance</span>
            </div>
          </div>
          
          {/* Today's Earning Card */}
          <div className="bg-gradient-to-br from-[#212431] to-[#2a2d3e] h-32 rounded-2xl text-center flex flex-col items-center justify-center shadow-xl border border-white/5 hover:border-yellow-500/20 transition-all duration-300">
            <span className="text-[#42bece] text-3xl font-bold">{todayEarning.toFixed(2)}</span>
            <div className="flex text-[#adaabd] gap-2 mt-2 items-center">
              <CirclePlus color="#635d73" size={22} />
              <span className="text-sm font-medium">Today's Earning</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full mt-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                <span className="text-2xl font-black text-cyan-400">?</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-2">What is Quantification?</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Automated trading that generates 6% profit based on your balance or total revenue.
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
                <span className="tracking-wider">WATCH TUTORIAL</span>
              </div>
            </button>
          </div>
        </div>

        {/* History Button */}
        <div className="w-full mt-6">
          <button 
            onClick={() => navigate('/quantify/history')}
            className="w-full group relative py-5 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white font-black rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative flex items-center justify-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-lg tracking-wider">VIEW HISTORY</span>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Low Balance Modal */}
      {showLowBalanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#212431] border border-gray-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800/20">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Insufficient Balance</h3>
                <button 
                  onClick={() => setShowLowBalanceModal(false)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-500/10 rounded-lg"
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
