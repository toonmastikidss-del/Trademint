import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Copy, Share2,
  Users, Trophy, IndianRupee, TrendingUp,
  ShieldCheck, Star, CheckCircle2, AlertCircle, Clock
} from 'lucide-react'
import axios from 'axios'
import { API_CONFIG } from '../config/apiConfig'

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

const MissionSkeleton = () => (
  <>
    <style>{shimmerCSS}</style>
    <div className="p-4 space-y-4">
      <div className="sk w-full rounded-[2rem]" style={{ height: 140 }} />
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="sk rounded-2xl" style={{ height: 90 }} />)}
      </div>
      <div className="sk w-full rounded-2xl" style={{ height: 52 }} />
      <div className="sk w-full rounded-2xl" style={{ height: 52 }} />
      <div className="sk w-full rounded-[2rem]" style={{ height: 180 }} />
    </div>
  </>
);

// ─── Component ────────────────────────────────────────────────────────────────

const Mission = () => {
  const navigate = useNavigate()
  const [loading,           setLoading]           = useState(true)
  const [referralData,      setReferralData]       = useState({
    totalReferrals: 0, completedReferrals: 0,
    pendingReferrals: 0, totalRewards: 0, referrals: []
  })
  const [myReferralCode,    setMyReferralCode]     = useState('')
  const [shareLink,         setShareLink]          = useState('')
  const [yesterdayCommission, setYesterdayCommission] = useState(0)
  const [showAgentModal,    setShowAgentModal]     = useState(false)
  const [applyingForAgent,  setApplyingForAgent]   = useState(false)
  const [toast,             setToast]              = useState({ show: false, message: '', type: '' })

  // StrictMode guard
  const hasFetchedRef = useRef(false)

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  // Fetch referral data
  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }

        const [statsRes, codeRes] = await Promise.allSettled([
          axios.get(`${API_CONFIG.BASE_URL}/api/referral/stats`,   { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_CONFIG.BASE_URL}/api/referral/my-code`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        if (statsRes.status === 'fulfilled') {
          setReferralData(statsRes.value.data)

          // Calculate yesterday's commission
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          yesterday.setHours(0, 0, 0, 0)
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() - 1)
          tomorrow.setHours(23, 59, 59, 999)

          const yReferrals = statsRes.value.data.referrals.filter(r => {
            const d = r.completedAt ? new Date(r.completedAt) : null
            return d && d >= yesterday && d <= tomorrow
          })
          setYesterdayCommission(yReferrals.reduce((s, r) => s + (r.rewardAmount || 0), 0))
        }

        if (codeRes.status === 'fulfilled') {
          setMyReferralCode(codeRes.value.data.referralCode)
          setShareLink(codeRes.value.data.shareLink)
        }
      } catch (error) {
        console.error('Error fetching referral data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  const copyReferralCode = () => {
    navigator.clipboard.writeText(myReferralCode)
    showToast('Referral code copied!')
  }

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TradeMint',
          text: `Join me on TradeMint! Use my referral code: ${myReferralCode}`,
          url: shareLink
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(shareLink)
      showToast('Share link copied!')
    }
  }

  const applyForAgent = async () => {
    try {
      setApplyingForAgent(true)
      const token = localStorage.getItem('token')
      if (!token) { showToast('Please login first', 'error'); return }

      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user?.balance) { showToast('User data not found', 'error'); return }
      if (user.balance < 500) {
        showToast(`Insufficient balance. Need ₹500. Current: ₹${user.balance.toFixed(2)}`, 'error')
        return
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/referral/apply-agent`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 200) {
        showToast('🎉 You are now an Agent!')
        setShowAgentModal(false)
        user.balance -= 500
        localStorage.setItem('user', JSON.stringify(user))
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to apply. Please try again.', 'error')
    } finally {
      setApplyingForAgent(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-[#101821] text-white font-sans pb-10">

      {/* Header */}
      <div className='sticky top-0 z-50 w-full'>
        <div className='h-14 bg-[#312c42] flex justify-center items-center shadow-lg'>
          <span className='text-lg font-bold opacity-80 text-white'>Mission Center</span>
        </div>
        <div className='absolute top-4 left-5 cursor-pointer text-white' onClick={() => navigate('/home')}>
          <ChevronLeft className='opacity-65' size={22} />
        </div>
      </div>

      {loading ? <MissionSkeleton /> : (
        <div className="p-4 space-y-4">

          {/* Commission Banner */}
          <div className="bg-gradient-to-br from-[#49bace]/20 to-[#212431] rounded-[2rem] border border-[#49bace]/25 p-6 shadow-xl">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Agency</p>
              <div className="text-4xl font-black text-white">₹{yesterdayCommission.toFixed(2)}</div>
              <p className="text-sm text-[#49bace] font-semibold">Yesterday's Commission</p>
              <p className="text-[10px] text-gray-500">Upgrade level to increase commission income</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Referrals',   value: referralData.totalReferrals,     icon: Users,        color: 'text-[#49bace]' },
              { label: 'Completed',          value: referralData.completedReferrals, icon: Trophy,       color: 'text-emerald-400' },
              { label: 'Pending',            value: referralData.pendingReferrals,   icon: Clock,        color: 'text-amber-400' },
              { label: 'Total Rewards',      value: `₹${referralData.totalRewards}`, icon: IndianRupee,  color: 'text-yellow-400' },
            ].map((s, i) => (
              <div key={i} className="bg-[#212431] border border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-xl">
                <s.icon size={20} className={s.color} />
                <span className="text-xl font-black text-white">{s.value}</span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider text-center">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Subordinates Card */}
          <div className="bg-[#212431] border border-gray-700 rounded-[2rem] shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              <TrendingUp size={15} className="text-[#49bace]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Team Overview</span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-700/60">
              {['Direct', 'Team'].map((label) => (
                <div key={label} className="p-4 space-y-3">
                  <p className="text-xs font-black text-[#49bace] uppercase tracking-wider">{label} Subordinates</p>
                  {[
                    { val: referralData.totalReferrals,                             sub: 'Total Registered'     },
                    { val: referralData.completedReferrals, color: 'text-emerald-400', sub: 'Made Deposit'     },
                    { val: `₹${(referralData.completedReferrals * 100).toFixed(0)}`, sub: 'Deposit Amount'     },
                    { val: referralData.completedReferrals,                          sub: 'First Deposit Users' },
                  ].map((row, i) => (
                    <div key={i}>
                      <p className={`text-sm font-bold ${row.color || 'text-white'}`}>{row.val}</p>
                      <p className="text-[10px] text-gray-500">{row.sub}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={shareReferralLink}
            className="w-full bg-gradient-to-r from-[#49bace] to-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg shadow-[#49bace]/20"
          >
            <Share2 size={18} />
            <span>Refer & Earn ₹100</span>
          </button>

          <button
            onClick={() => setShowAgentModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg shadow-purple-500/20"
          >
            <ShieldCheck size={18} />
            <span>Become an Agent · ₹500</span>
          </button>

          {/* Info Rows */}
          <div className="bg-[#212431] border border-gray-700 rounded-[2rem] shadow-xl overflow-hidden">
            {/* Partner Rewards Row */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#49bace]/15 border border-[#49bace]/25 flex items-center justify-center">
                  <Star size={16} className="text-[#49bace]" />
                </div>
                <p className="text-sm font-bold text-white">Partner Rewards</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#49bace]">₹{referralData.totalRewards.toFixed(2)}</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </div>

            {/* Copy Code Row */}
            <div
              onClick={copyReferralCode}
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#2a2d3e] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                  <Copy size={16} className="text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white">Copy Invitation Code</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-300 font-mono">{myReferralCode || '---'}</span>
                <Copy size={14} className="text-gray-500" />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#212431] rounded-[2rem] p-6 w-full max-w-md border border-gray-700 shadow-2xl">

            {/* Modal Header */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-white">Become an Agent</h2>
              <p className="text-gray-400 text-xs mt-1">Unlock exclusive benefits and earn more</p>
            </div>

            {/* Benefits */}
            <div className="bg-[#1a1f2e] rounded-2xl p-4 mb-4 space-y-2">
              <p className="text-xs font-black text-white uppercase tracking-wider mb-2">Agent Benefits:</p>
              {[
                'Higher commission rates (up to 20%)',
                'Priority customer support',
                'Exclusive monthly bonuses',
                'Special agent badge & recognition',
                'Advanced analytics dashboard',
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-300">{b}</p>
                </div>
              ))}
            </div>

            {/* Fee */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-semibold">One-time Fee</span>
                <span className="text-xl font-black text-white">₹500</span>
              </div>
              <p className="text-[10px] text-amber-300/70 mt-1">Will be deducted from your balance</p>
            </div>

            {/* Requirements */}
            <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4 mb-5">
              <p className="text-xs font-black text-blue-400 mb-2">Requirements:</p>
              {[
                'Minimum balance of ₹500',
                'At least 5 successful referrals',
                'Account must be 7+ days old',
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2 mb-1">
                  <AlertCircle size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-gray-300">{r}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAgentModal(false)}
                disabled={applyingForAgent}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={applyForAgent}
                disabled={applyingForAgent}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applyingForAgent ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Pay ₹500 & Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 transition-all ${
          toast.type === 'error'
            ? 'bg-rose-900/90 border border-rose-500/50 text-rose-100'
            : 'bg-emerald-900/90 border border-emerald-500/50 text-emerald-100'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Mission