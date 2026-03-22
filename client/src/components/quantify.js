import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BaggageClaimIcon, CirclePlus, Euro, HandCoins, X, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import animationVideo from '../video/animated.mp4';
import mainIco from '../pictures/mainico.png';
import { checkBalanceChange } from '../utils/balanceDetection';
import { API_CONFIG } from '../config/apiConfig';

const preloadedImg    = new Image();
preloadedImg.src      = mainIco;

const preloadLink     = document.createElement('link');
preloadLink.rel       = 'preload';
preloadLink.as        = 'video';
preloadLink.href      = animationVideo;
document.head.appendChild(preloadLink);

let serverTimeOffset = 0; 

const refreshServerOffset = async () => {
  try {
    const t0         = Date.now();
    const res        = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/time`);
    const t1         = Date.now();
    const rtt        = t1 - t0;
    serverTimeOffset = new Date(res.data.serverTime).getTime() - (t0 + rtt / 2);
  } catch {
    // Keep last known offset — do not fall back to device time
  }
};

// Always returns server-corrected current time
const getServerNow = () => new Date(Date.now() + serverTimeOffset);

// ─── Skeleton shimmer ─────────────────────────────────────────────────────────
const shimmerCSS = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .sk {
    background: linear-gradient(90deg, #1e2535 25%, #2a3347 50%, #1e2535 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 8px;
  }
`;

const Sk = ({ w = '100%', h = 16, r = 8, style = {} }) => (
  <div className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const QuantifySkeleton = () => (
  <>
    <style>{shimmerCSS}</style>
    <div className="flex flex-col h-full items-center justify-start w-full px-6 pt-10 pb-24 gap-4">

      {/* Image placeholder */}
      <div className="sk w-full rounded-2xl mb-4" style={{ height: 220 }} />

      {/* Button placeholder */}
      <div className="sk w-full rounded-2xl" style={{ height: 56 }} />

      {/* Mode indicator placeholder */}
      <div className="sk w-full rounded-xl" style={{ height: 48 }} />

      {/* Section title */}
      <div className="w-full">
        <Sk w={160} h={14} r={6} />
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 gap-4 px-1 py-2 w-full">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#212431] to-[#2a2d3e] h-32 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-xl border border-white/5 px-4"
          >
            <Sk w="70%" h={28} r={6} />
            <Sk w="80%" h={14} r={5} />
          </div>
        ))}
      </div>

      {/* Info section placeholder */}
      <div className="w-full mt-4">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <Sk w={48} h={48} r={12} style={{ flexShrink: 0 }} />
            <div className="flex flex-col gap-2 flex-1">
              <Sk w="60%" h={18} r={6} />
              <Sk w="100%" h={12} r={5} />
              <Sk w="80%" h={12} r={5} />
            </div>
          </div>
          <Sk w="100%" h={52} r={14} />
        </div>
      </div>

      {/* History button placeholder */}
      <div className="w-full mt-2">
        <Sk w="100%" h={68} r={24} />
      </div>
    </div>
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Quantify = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [isQuantifying,            setIsQuantifying]            = useState(false);
  const [balance,                  setBalance]                  = useState(0);
  const [todayEarning,             setTodayEarning]             = useState(0);
  const [totalRevenue,             setTotalRevenue]             = useState(0);
  const [loading,                  setLoading]                  = useState(true);
  const [showLowBalanceModal,      setShowLowBalanceModal]      = useState(false);
  const [lowBalanceError,          setLowBalanceError]          = useState('');

  // ── FIX 1: -1 instead of 0 ───────────────────────────────────────────────
  // OLD: useState(0) → on mount useEffect(countdown) immediately saw 0
  //      → called performMidnightReset() on page load every time!
  // NEW: -1 = "not started", 0 = "countdown just finished", >0 = "running"
  const [elevenFiftyNineCountdown, setElevenFiftyNineCountdown] = useState(-1);

  const [alertModal,               setAlertModal]               = useState({ isOpen: false, message: '', type: '' });
  const [mode,                     setMode]                     = useState('current');
  const [lastBalance,              setLastBalance]              = useState(0);

  // ── FIX 2: Ref to prevent multiple midnight reset calls ───────────────────
  // OLD BUG: checkForMidnight ran every 10s during 23:59-00:01 window
  //   → setElevenFiftyNineCountdown(remainingSeconds) every 10s
  //   → countdown kept restarting → hit 0 multiple times
  //   → performMidnightReset called 3-4 times → data corrupted from day 2
  // FIX: midnightResetDoneRef = true after first reset → blocks all subsequent calls
  const midnightResetDoneRef = useRef(false);

  // ── Load user data ───────────────────────────────────────────────────────────
  const loadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const user  = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        console.error('User not authenticated');
        return;
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/quantify/user/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;

      // Detect balance change (deposit / withdrawal happened)
      if (lastBalance > 0 && data.balance !== lastBalance) {
        setBalance(data.balance || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setTodayEarning(data.todayEarning || 0);

        const earningChanged = data.todayEarning > 0;
        setAlertModal({
          isOpen: true,
          message: `Balance updated! ${data.balance > lastBalance ? '+' : ''}${(data.balance - lastBalance).toFixed(2)} | ${earningChanged ? '✅ Earnings auto-calculated!' : 'Total Revenue updated'}`,
          type: 'success',
        });
      } else {
        setBalance(data.balance || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setTodayEarning(data.todayEarning || 0);
      }

      setIsQuantifying(data.isQuantifying || false);
      setMode(data.mode || 'current');
      setLastBalance(data.balance || 0);

      if (data.isQuantifying && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [lastBalance]);

  // ── Mount: fetch server time offset + initial data load ──────────────────────
  useEffect(() => {
    // Fetch server time offset first, then load data
    refreshServerOffset().then(() => loadUserData());

    // Refresh server time offset every 60s silently
    const clockSync = setInterval(refreshServerOffset, 60_000);

    return () => clearInterval(clockSync);
  }, []);

  // ── Polling: 30s interval, PAUSED when tab is hidden (Page Visibility API) ───
  useEffect(() => {
    let interval = null;

    const startPolling = () => {
      if (interval) return;
      interval = setInterval(loadUserData, 30_000);
    };

    const stopPolling = () => {
      clearInterval(interval);
      interval = null;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        loadUserData(); // immediate refresh when user returns to tab
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadUserData]);

  // ── Midnight check — uses getServerNow() (server time, not device time) ──────
  useEffect(() => {
    const checkForMidnight = () => {
      // ── FIX 3: Use functional updater — never override a running countdown ──
      // OLD BUG: setElevenFiftyNineCountdown(remainingSeconds) every 10s
      //   = countdown kept getting reset: 1:59 → 10s → 1:49 → 10s → 1:39...
      //   = hit 0 multiple times per midnight window → multiple resets
      // NEW FIX: functional updater checks prev — only sets if not already running
      setElevenFiftyNineCountdown(prev => {
        // If countdown already running → do NOT override it
        if (prev > 0) return prev;
        // If midnight reset already done for this window → skip
        if (midnightResetDoneRef.current) return prev;

        const currentTime = getServerNow();
        const hours       = currentTime.getHours();
        const minutes     = currentTime.getMinutes();
        const seconds     = currentTime.getSeconds();

        if ((hours === 23 && minutes === 59) || (hours === 0 && minutes <= 1)) {

          let remainingSeconds = 120;
          if (hours === 23 && minutes === 59) {
            remainingSeconds = (60 - seconds) + 60;
          } else if (hours === 0 && minutes === 0) {
            remainingSeconds = 60 - seconds;
          } else if (hours === 0 && minutes === 1) {
            remainingSeconds = 10;
          }

          return remainingSeconds; // Start countdown — only happens once
        }

        return prev; // Not midnight window — no change
      });
    };

    // Check every 10s — plenty for a 2-minute midnight window
    const interval = setInterval(checkForMidnight, 10_000);
    checkForMidnight();
    return () => clearInterval(interval);
  }, []); // No dependency on serverTime state — reads offset directly via getServerNow()

  // ── Midnight countdown tick + reset ──────────────────────────────────────────
  useEffect(() => {
    let interval = null;

    if (elevenFiftyNineCountdown > 0) {

      // Disable quantifying during midnight break
      setIsQuantifying(false);

      interval = setInterval(() => {
        setElevenFiftyNineCountdown(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);

    } else if (elevenFiftyNineCountdown === 0) {

      // ── FIX 4: midnightResetDoneRef guard — reset runs EXACTLY ONCE ─────
      // OLD BUG: elevenFiftyNineCountdown hit 0 → performMidnightReset()
      //   But checkForMidnight was restarting countdown during 00:00-00:01
      //   → countdown hit 0 again → reset called again (2-3 times per midnight)
      // NEW FIX: ref check ensures reset never called twice
      if (!midnightResetDoneRef.current) {
        midnightResetDoneRef.current = true; // Lock before async call
        performMidnightReset();
      }
      // Set -1 so checkForMidnight stops trying to restart countdown
      setElevenFiftyNineCountdown(-1);
    }
    // -1 case: intentionally no action

    return () => { if (interval) clearInterval(interval); };
  }, [elevenFiftyNineCountdown]);

  // ── Reset midnightResetDoneRef at 6 AM each day ───────────────────────────
  // So next midnight gets a fresh start
  useEffect(() => {
    const checkReset = () => {
      const hour = getServerNow().getHours();
      if (hour === 6) {
        midnightResetDoneRef.current = false;
      }
    };
    const interval = setInterval(checkReset, 5 * 60_000); // every 5 min
    return () => clearInterval(interval);
  }, []);

  // ── Midnight reset (called exactly once per midnight) ─────────────────────
  const performMidnightReset = async () => {
    try {
      const token = localStorage.getItem('token');
      const user  = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        console.warn('⚠️ User not authenticated, skipping reset');
        return;
      }

      // Use server time (via offset) — not device time
      const currentTime        = getServerNow();
      const hours              = currentTime.getHours();
      const minutes            = currentTime.getMinutes();
      const isActuallyMidnight = (hours === 23 && minutes === 59) || (hours === 0 && minutes <= 1);

      if (!isActuallyMidnight) {
        return;
      }

      await axios.post(
        `${API_CONFIG.BASE_URL}/api/quantify/midnight-reset`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/quantify/user/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      setBalance(data.balance || 0);
      setTotalRevenue(data.totalRevenue || 0);
      setTodayEarning(0);
      setIsQuantifying(false);
      setMode(data.mode || 'continue');

      setAlertModal({
        isOpen: true,
        message: 'New day started! Click "Start Quantifying" to continue.',
        type: 'success',
      });

    } catch (error) {
      console.error('❌ Error in midnight reset:', error);
    }
  };

  // ── Start quantifying ─────────────────────────────────────────────────────────
  const handleStartQuantifying = async () => {
    if (isQuantifying || elevenFiftyNineCountdown > 0) return;

    try {
      const token = localStorage.getItem('token');
      const user  = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        setAlertModal({ isOpen: true, message: 'Please login first', type: 'error' });
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/quantify/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      setBalance(data.balance || 0);
      setTotalRevenue(data.totalRevenue || 0);
      setTodayEarning(data.todayEarning || 0);
      setIsQuantifying(true);
      setMode(data.mode || 'current');

      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }

      setAlertModal({
        isOpen: true,
        message: `${data.mode === 'current' ? 'Current' : 'Continue'} mode activated! Earning started.`,
        type: 'success',
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

  // ── Skeleton loader (replaces spinner) ───────────────────────────────────────
  if (loading) return <QuantifySkeleton />;

  // ─── Render ──────────────────────────────────────────────────────────────────

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
            preload="auto"
          />
        ) : (
          <img
            src={mainIco}
            alt="Quantify Icon"
            className="mb-4 w-[100%] rounded-2xl shadow-2xl"
            loading="eager"
            decoding="async"
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