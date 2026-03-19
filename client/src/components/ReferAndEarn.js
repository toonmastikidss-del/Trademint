import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Share2, Users, Gift, Trophy, ChevronLeft, CheckCircle, AlertCircle, Coins, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const ReferAndEarn = () => {
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchReferralData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get referral code and share link
      const codeResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/referral/my-code`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const frontendUrl = window.location.origin;
      const fixedShareLink = `${frontendUrl}/register?ref=${codeResponse.data.referralCode}`;

      setReferralCode(codeResponse.data.referralCode);
      setShareLink(fixedShareLink);

      // Get referral statistics
      const statsResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/referral/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats({
        totalReferrals: statsResponse.data.totalReferrals,
        completedReferrals: statsResponse.data.completedReferrals,
        pendingReferrals: statsResponse.data.pendingReferrals,
        totalRewards: statsResponse.data.totalRewards
      });

      setError('');
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Sirf ek baar fetch — mount pe
  useEffect(() => {
    fetchReferralData();
  }, [navigate]);

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
          url: shareLink
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareMessage).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        alert('Share message copied to clipboard! You can now paste it on WhatsApp, Telegram, etc.');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101821] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bace]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#101821] min-h-screen text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => navigate('/home')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Refer & Earn</h1>
        {/* ✅ Manual Refresh Button */}
        <button
          onClick={() => fetchReferralData(true)}
          disabled={refreshing}
          className="p-2 text-[#49bace] disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="px-4 pt-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <p className="text-rose-400 text-sm font-bold text-center">{error}</p>
          </div>
        )}

        {/* Reward Banner */}
        <div className="bg-gradient-to-r from-[#49bace] to-emerald-500 rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
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
                {copied ? <CheckCircle className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
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
              { step: '1', title: 'Share Your Code', description: 'Send your referral code to friends and family' },
              { step: '2', title: 'They Sign Up', description: 'Friends register using your referral code' },
              { step: '3', title: 'They Deposit', description: 'Friends make their first deposit of any amount' },
              { step: '4', title: 'You Earn ₹100', description: 'Reward automatically added to your quantify balance' }
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
      </div>
    </div>
  );
};

export default ReferAndEarn;