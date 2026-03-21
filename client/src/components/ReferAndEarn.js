import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Share2, Users, Gift, Trophy, ChevronLeft, CheckCircle, AlertCircle, Coins, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

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

const ReferSkeleton = () => (
  <>
    <style>{shimmerCSS}</style>
    {/* Banner skeleton */}
    <div className="sk rounded-2xl mb-6" style={{ height: 160 }} />
    {/* Stats grid skeleton */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[#212431] border border-gray-700 rounded-2xl p-4 space-y-2">
          <div className="sk w-20 h-3" />
          <div className="sk w-12 h-7" />
        </div>
      ))}
    </div>
    {/* Code section skeleton */}
    <div className="bg-[#212431] border border-gray-700 rounded-2xl p-6 mb-6 space-y-4">
      <div className="sk w-40 h-5 mx-auto" />
      <div className="sk w-full h-14 rounded-xl" />
      <div className="sk w-full h-12 rounded-xl" />
      <div className="sk w-full h-12 rounded-xl" />
    </div>
  </>
);

// ─── Component ────────────────────────────────────────────────────────────────

const ReferAndEarn = () => {
  const navigate = useNavigate();

  const [referralCode, setReferralCode] = useState('');
  const [shareLink,    setShareLink]    = useState('');
  const [copied,       setCopied]       = useState(false);
  const [stats,        setStats]        = useState({
    totalReferrals:     0,
    completedReferrals: 0,
    pendingReferrals:   0,
    totalRewards:       0,
  });
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

  // StrictMode guard — prevent double fetch in development
  const hasFetchedRef = useRef(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchReferralData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);

      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      // Fetch both in parallel
      const [codeRes, statsRes] = await Promise.allSettled([
        axios.get(`${API_CONFIG.BASE_URL}/api/referral/my-code`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_CONFIG.BASE_URL}/api/referral/stats`,
          { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // ── Referral code ──────────────────────────────────────────────────────
      if (codeRes.status === 'fulfilled') {
        const code = codeRes.value.data.referralCode;
        setReferralCode(code);
        setShareLink(`${window.location.origin}/register?ref=${code}`);
      }

      // ── Stats — debug log + multiple field name fallbacks ──────────────────
      if (statsRes.status === 'fulfilled') {
        const d = statsRes.value.data;

        // 🔍 DEBUG: Dekho console mein kya aa raha hai backend se
        // console.log('📊 Referral Stats API Response:', d);
        // console.log('Keys:', Object.keys(d));

        // Backend alag alag naam se bhej sakta hai — sab cover karte hain
        const completed = 
          d.completedReferrals  ??  // standard
          d.completed           ??  // short form
          d.successfulReferrals ??  // another common name
          // Manual count from referrals array if available
          (Array.isArray(d.referrals)
            ? d.referrals.filter(r =>
                r.status === 'completed' ||
                r.status === 'rewarded'  ||
                r.rewardGiven === true
              ).length
            : 0);

        const rewards =
          d.totalRewards        ??  // standard
          d.totalRewardAmount   ??  // another common name
          d.rewardsEarned       ??  // another
          d.totalEarned         ??  // another
          // Manual sum from referrals array if available
          (Array.isArray(d.referrals)
            ? d.referrals
                .filter(r => r.rewardGiven === true)
                .reduce((sum, r) => sum + (r.rewardAmount || 0), 0)
            : 0);

        // console.log('✅ Resolved completed:', completed);
        // console.log('✅ Resolved rewards:', rewards);

        setStats({
          totalReferrals:     d.totalReferrals     ?? d.total        ?? 0,
          completedReferrals: completed,
          pendingReferrals:   d.pendingReferrals   ?? d.pending      ?? 0,
          totalRewards:       rewards,
        });
      }

      setError('');
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mount — runs once, StrictMode safe
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchReferralData();
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    const shareMessage =
      `🎉 Join TradeMint with my referral code: ${referralCode}\n\n` +
      `💰 Get 6% DAILY INTEREST on your investments!\n` +
      `✅ NO WITHDRAWAL LIMIT - Withdraw anytime!\n` +
      `🚀 Start earning passive income now!\n\n` +
      `Register here: ${shareLink}\n\n` +
      `Use code: ${referralCode} for bonus rewards! 🔥`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TradeMint - Earn 6% Daily!',
          text: shareMessage,
          url: shareLink,
        });
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    } else {
      navigator.clipboard.writeText(shareMessage).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        alert('Share message copied! Paste it on WhatsApp, Telegram, etc.');
      });
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#101821] min-h-screen text-white pb-24">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => navigate('/home')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Refer & Earn</h1>
        <button
          onClick={() => fetchReferralData(true)}
          disabled={refreshing}
          className="p-2 text-[#49bace] disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="px-4 pt-6">

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <p className="text-rose-400 text-sm font-bold text-center">{error}</p>
          </div>
        )}

        {/* Skeleton OR content */}
        {loading ? <ReferSkeleton /> : (
          <>
            {/* Reward Banner */}
            <div className="bg-gradient-to-r from-[#49bace] to-emerald-500 rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Gift className="w-8 h-8 text-white" />
                    <h2 className="text-2xl font-bold text-white">₹100 + 6% Daily!</h2>
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-black">NO WITHDRAWAL LIMIT</span>
                  </div>
                </div>
                <p className="text-white/90 text-sm mb-4">
                  Earn ₹100 for every friend + They get 6% DAILY INTEREST forever!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/20 rounded-xl p-3">
                    <p className="text-white text-xs font-bold mb-1">🎁 INSTANT BONUS</p>
                    <p className="text-white/90 text-xs">₹100 per referral</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3">
                    <p className="text-white text-xs font-bold mb-1">📈 PASSIVE INCOME</p>
                    <p className="text-white/90 text-xs">6% daily for your friends</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#212431] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-[#49bace]" />
                  <span className="text-gray-400 text-xs font-bold">TOTAL</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
              </div>

              <div className="bg-[#212431] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-400 text-xs font-bold">COMPLETED</span>
                </div>
                <p className="text-2xl font-bold text-emerald-500">{stats.completedReferrals}</p>
              </div>

              <div className="bg-[#212431] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-gray-400 text-xs font-bold">PENDING</span>
                </div>
                <p className="text-2xl font-bold text-amber-500">{stats.pendingReferrals}</p>
              </div>

              <div className="bg-[#212431] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-400 text-xs font-bold">REWARDS</span>
                </div>
                <p className="text-2xl font-bold text-yellow-500">₹{stats.totalRewards}</p>
              </div>
            </div>

            {/* Referral Code Section */}
            <div className="bg-[#212431] border border-gray-700 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-bold text-lg mb-4 text-center">Your Referral Code</h3>

              <div className="bg-[#101821] rounded-xl p-4 mb-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-[#49bace] tracking-wider">
                    {referralCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-[#49bace] rounded-lg hover:bg-[#3da9bd] transition-colors"
                  >
                    {copied
                      ? <CheckCircle className="w-5 h-5 text-white" />
                      : <Copy className="w-5 h-5 text-white" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-[#49bace] to-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform mb-4"
              >
                <Share2 className="w-5 h-5" />
                <span>Share with Friends</span>
              </button>

              <button
                onClick={() => navigate('/team')}
                className="w-full bg-[#212431] border border-gray-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#2a2d3a] transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>View My Team</span>
              </button>
            </div>

            {/* How to Earn Section */}
            <div className="bg-[#212431] border border-gray-700 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 text-center">How to Earn More</h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Share Your Code',  description: 'Send your referral code to friends and family' },
                  { step: '2', title: 'They Sign Up',     description: 'Friends register using your referral code' },
                  { step: '3', title: 'They Deposit',     description: 'Friends make their first deposit of any amount' },
                  { step: '4', title: 'You Earn ₹100',    description: 'Reward automatically added to your quantify balance' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#49bace] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 bg-[#212431]/50 border border-gray-700/50 rounded-xl p-4">
              <p className="text-gray-500 text-xs text-center">
                * Rewards are added to your quantify balance and can be used for trading
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferAndEarn;