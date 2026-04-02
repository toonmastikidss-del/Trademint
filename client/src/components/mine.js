import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { faCircleUser, faHandHoldingDollar, faHandHoldingHeart, faLanguage, faMoneyBillTrendUp, faShieldHalved, faUsers, faWallet, faReceipt, faIdCard, faHeadset, faLock, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Copy, CopyCheckIcon, ChevronLeft, User, RefreshCw, LogOut, ShieldCheck, Globe, Headset, Users, BookOpen, Info, MessageSquare, Heart, Bell, Lock, Wallet, QrCode, AlertCircle, CheckCircle2, X, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_CONFIG } from '../config/apiConfig';

// ✅ Shimmer wave skeleton component
const Skeleton = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden bg-[#2a2d3e] rounded-xl ${className}`}
  >
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  </div>
);

// ✅ Shimmer keyframe inject (ek baar)
const ShimmerStyle = () => (
  <style>{`
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
  `}</style>
);

// ✅ Full skeleton layout matching Mine page
const MineSkeleton = () => (
  <div className='w-full bg-[#101821] min-h-screen pb-24'>
    <ShimmerStyle />

    {/* Header Skeleton */}
    <div className='bg-[#312c42] pt-10 pb-16 rounded-b-[40px] relative px-6'>
      <div className='flex items-center space-x-4'>
        {/* Avatar */}
        <Skeleton className='w-[74px] h-[74px] rounded-full flex-shrink-0' />
        <div className='flex flex-col gap-2 flex-1'>
          <Skeleton className='h-5 w-36 rounded-lg' />
          <Skeleton className='h-4 w-28 rounded-lg' />
          <Skeleton className='h-3 w-44 rounded-lg' />
        </div>
      </div>
    </div>

    <div className='px-4 mt-4 space-y-6'>

      {/* Wallet Card Skeleton */}
      <div className='bg-[#212431] border border-gray-700/40 rounded-[2rem] p-6 mt-8'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-3 w-20 rounded' />
            <Skeleton className='h-7 w-32 rounded-lg' />
          </div>
          <Skeleton className='h-9 w-28 rounded-full' />
        </div>
        <div className='grid grid-cols-4 gap-2'>
          {[1,2,3,4].map(i => (
            <div key={i} className='flex flex-col items-center gap-2'>
              <Skeleton className='w-11 h-11 rounded-2xl' />
              <Skeleton className='h-3 w-12 rounded' />
            </div>
          ))}
        </div>
      </div>

      {/* 2x2 Grid Skeleton */}
      <div className='grid grid-cols-2 gap-3'>
        {[1,2,3,4].map(i => (
          <div key={i} className='bg-[#212431] border border-gray-700/40 p-4 rounded-[1.5rem] flex items-center space-x-3'>
            <Skeleton className='w-10 h-10 rounded-xl flex-shrink-0' />
            <div className='flex flex-col gap-2 flex-1'>
              <Skeleton className='h-3 w-20 rounded' />
              <Skeleton className='h-2 w-16 rounded' />
            </div>
          </div>
        ))}
      </div>

      {/* List Items Skeleton */}
      <div className='bg-[#212431] border border-gray-700/40 rounded-[1.5rem] overflow-hidden'>
        {[1,2,3].map((i) => (
          <div key={i} className={`flex items-center px-5 py-4 gap-3 ${i !== 3 ? 'border-b border-gray-700/50' : ''}`}>
            <Skeleton className='w-6 h-6 rounded-lg flex-shrink-0' />
            <Skeleton className='h-4 w-28 rounded' />
            <div className='ml-auto'>
              <Skeleton className='h-4 w-16 rounded' />
            </div>
          </div>
        ))}
      </div>

      {/* Service Center Skeleton */}
      <div className='bg-[#212431] border border-gray-700/40 rounded-[2rem] p-6'>
        <Skeleton className='h-4 w-32 rounded mb-8' />
        <div className='grid grid-cols-4 gap-y-8'>
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className='flex flex-col items-center gap-2'>
              <Skeleton className='w-14 h-14 rounded-2xl' />
              <Skeleton className='h-2.5 w-12 rounded' />
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Skeleton */}
      <div className='bg-[#212431] border border-gray-700/40 rounded-[2rem] p-6'>
        <Skeleton className='h-4 w-40 rounded mb-6' />
        <div className='grid grid-cols-2 gap-4'>
          {[1,2].map(i => (
            <div key={i} className='bg-[#101821] border border-gray-800 p-4 rounded-2xl flex items-center gap-3'>
              <Skeleton className='w-10 h-10 rounded-xl flex-shrink-0' />
              <div className='flex flex-col gap-2 flex-1'>
                <Skeleton className='h-3 w-16 rounded' />
                <Skeleton className='h-2 w-20 rounded' />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Details Skeleton */}
      <div className='bg-[#212431] border border-gray-700/40 rounded-[2rem] overflow-hidden'>
        <div className='px-6 py-5 bg-[#312c42]/50 border-b border-gray-700/50 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <Skeleton className='w-9 h-9 rounded-lg' />
            <Skeleton className='h-4 w-32 rounded' />
          </div>
          <Skeleton className='h-3 w-20 rounded' />
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-2 gap-6'>
            {[1,2,3,4].map(i => (
              <div key={i} className='bg-[#101821] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-2'>
                <Skeleton className='h-2.5 w-20 rounded' />
                <Skeleton className='h-6 w-24 rounded-lg' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Button Skeleton */}
      <Skeleton className='mt-6 mb-12 w-full h-14 rounded-2xl' />

    </div>
  </div>
);

const Mine = () => {
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState({ name: 'Loading...', uid: '------', balance: 0 });
  const [approvedDepositAmount, setApprovedDepositAmount] = useState(0);
  const [quantifyData, setQuantifyData] = useState({ totalRevenue: 0, todayEarning: 0 });
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedUserStr = localStorage.getItem('user');
        let savedUser = null;
        try {
          savedUser = savedUserStr && savedUserStr !== 'undefined' && savedUserStr !== 'null'
            ? JSON.parse(savedUserStr)
            : null;
        } catch (e) {
          localStorage.removeItem('user');
        }
        const token = localStorage.getItem('token');

        if (savedUser && token) {
          // ════════════════════════════════════════════════
          //  ⚡ OPTIMIZATION: Parallel API calls (faster loading)
          //  Sabhi requests ek saath bhejo, result wait karo
          // ════════════════════════════════════════════════
          const [userRes, depositRes, quantifyRes] = await Promise.all([
            axios.get(`${API_CONFIG.BASE_URL}/api/auth/user`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${savedUser._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: [] })), // Error handle gracefully
            axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${savedUser._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: { totalRevenue: 0, todayEarning: 0 } })) // Error handle gracefully
          ]);

          const user = userRes.data?.user || savedUser;

          let calculatedUid = '------';
          if (user.phone) {
            calculatedUid = user.phone.slice(-6);
          } else if (user.email) {
            calculatedUid = Math.abs(user.email.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a
            }, 0)).toString().slice(-6);
          }

          const totalBalance = Math.max(user.balance ?? 0, user.quantify ?? 0);

          setUserData({
            name: user.name || 'MEMBER_NNGX',
            uid: calculatedUid,
            balance: user.balance ?? 0,
            total_amount: totalBalance,
            quantify: user.quantify ?? 0
          });

          if (user && typeof user === 'object') {
            localStorage.setItem('user', JSON.stringify(user));
          }

          const deposits = depositRes.data;
          const approvedAmount = deposits
            .filter(deposit => deposit.status === 'approved')
            .reduce((sum, deposit) => sum + deposit.amount, 0);

          setApprovedDepositAmount(approvedAmount);

          setQuantifyData({
            totalRevenue: quantifyRes.data.totalRevenue,
            todayEarning: quantifyRes.data.todayEarning
          });
        } else {
          let calculatedUid = '775383';
          if (savedUser?.phone) {
            calculatedUid = savedUser.phone.slice(-6);
          } else if (savedUser?.email) {
            calculatedUid = Math.abs(savedUser.email.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a
            }, 0)).toString().slice(-6);
          }

          setUserData({
            name: savedUser?.name || 'MEMBER_NNGX',
            uid: calculatedUid,
            balance: savedUser?.balance ?? 0,
            total_amount: savedUser?.total_amount ?? 0
          });

          const token = localStorage.getItem('token');
          if (token && savedUser?._id) {
            // ════════════════════════════════════════════════
            //  ⚡ OPTIMIZATION: Parallel API calls for fallback case
            // ════════════════════════════════════════════════
            const [depositRes, quantifyRes] = await Promise.all([
              axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${savedUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch(() => ({ data: [] })),
              axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${savedUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch(() => ({ data: { totalRevenue: 0, todayEarning: 0 } }))
            ]);

            const deposits = depositRes.data;
            const approvedAmount = deposits
              .filter(deposit => deposit.status === 'approved')
              .reduce((sum, deposit) => sum + deposit.amount, 0);

            setApprovedDepositAmount(approvedAmount);

            setQuantifyData({
              totalRevenue: quantifyRes.data.totalRevenue,
              todayEarning: quantifyRes.data.todayEarning
            });
          }
        }
      } catch (err) {
        const savedUserStr = localStorage.getItem('user');
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : {};
        let calculatedUid = '775383';
        if (savedUser?.phone) {
          calculatedUid = savedUser.phone.slice(-6);
        } else if (savedUser?.email) {
          calculatedUid = Math.abs(savedUser.email.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
          }, 0)).toString().slice(-6);
        }

        const totalBalance = Math.max(savedUser?.balance ?? 0, savedUser?.quantify ?? 0);

        setUserData({
          name: savedUser?.name || 'MEMBER_NNGX',
          uid: calculatedUid,
          balance: savedUser?.balance ?? 0,
          total_amount: totalBalance,
          quantify: savedUser?.quantify ?? 0
        });

        const token = localStorage.getItem('token');
        if (token && savedUser?._id) {
          // ════════════════════════════════════════════════
          //  ⚡ OPTIMIZATION: Parallel API calls for error recovery
          // ════════════════════════════════════════════════
          const [depositRes, quantifyRes] = await Promise.all([
            axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${savedUser._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: [] })),
            axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${savedUser._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: { totalRevenue: 0, todayEarning: 0 } }))
          ]);

          const deposits = depositRes.data;
          const approvedAmount = deposits
            .filter(deposit => deposit.status === 'approved')
            .reduce((sum, deposit) => sum + deposit.amount, 0);

          setApprovedDepositAmount(approvedAmount);

          setQuantifyData({
            totalRevenue: quantifyRes.data.totalRevenue,
            todayEarning: quantifyRes.data.todayEarning
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(userData.uid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ✅ Skeleton dikhao jab tak data load ho
  if (loading) return <MineSkeleton />;

  return (
    <div className='w-full bg-[#101821] min-h-screen pb-24'>
      {/* Top Profile Header */}
      <div className='bg-[#312c42] pt-10 pb-16 rounded-b-[40px] relative px-6 shadow-xl'>
        <div className='flex items-center space-x-4'>
          <div className='bg-[#212431] p-1 rounded-full border-2 border-[#49bace] shadow-[0_0_15px_rgba(73,186,206,0.3)]'>
            <div className='bg-[#101821] rounded-full w-16 h-16 flex items-center justify-center overflow-hidden'>
              <User size={40} className='text-[#49bace]' />
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='flex items-center space-x-2'>
              <span className='text-white font-bold text-lg'>{userData.name}</span>
              <span className='bg-[#49bace]/20 text-[#49bace] text-[10px] px-2 py-0.5 rounded-full border border-[#49bace]/40'>VIP0</span>
            </div>
            <div className='flex items-center space-x-2 text-gray-300 text-sm mt-0.5'>
              <span>UID | {userData.uid}</span>
              <span className='cursor-pointer text-[#49bace]' onClick={handleCopy}>
                {copied ? <CopyCheckIcon size={14} /> : <Copy size={14} />}
              </span>
            </div>
            <div className='text-gray-400 text-[11px] mt-1 italic'>
              Last login: 2026-02-02 16:12:47
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping Content Container */}
      <div className='px-4 mt-4 space-y-6'>

        {/* Wallet Section */}
        <div className='bg-[#212431] border border-gray-700 rounded-[2rem] shadow-2xl p-6 mt-8'>
          <div className='flex justify-between items-center mb-6'>
            <div className='flex flex-col'>
              <span className='text-gray-400 text-xs uppercase tracking-wider mb-1'>Total balance</span>
              <div className='flex items-center space-x-3'>
                <span className='text-2xl font-bold text-white tracking-tight'>₹{userData.total_amount?.toFixed(2) || '0.00'}</span>
                <RefreshCw size={18} className='text-[#49bace] cursor-pointer active:rotate-180 transition-transform duration-500' />
              </div>
            </div>
            <button className='bg-[#49bace] text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg active:scale-95 transition-all' onClick={() => navigate('/bind')}>
              Enter wallet
            </button>
          </div>

          <div className='grid grid-cols-4 gap-2'>
            {[
              { label: 'Deposit', icon: faMoneyBillTrendUp, path: '/deposite' },
              { label: 'Withdraw', icon: faHandHoldingDollar, path: '/withdraw' },
              { label: 'Bind card', icon: faIdCard, path: '/bind' },
              { label: 'Fund', icon: faReceipt, path: '/record' },
            ].map((item, i) => (
              <div key={i} className='flex flex-col items-center space-y-2' onClick={() => navigate(item.path)}>
                <div className='p-2.5 bg-[#101821] rounded-2xl border border-gray-700/50'>
                  <FontAwesomeIcon icon={item.icon} className='text-[#49bace] text-lg' />
                </div>
                <span className='text-[10px] text-gray-300 font-medium'>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2x2 History Grid */}
        <div className='grid grid-cols-2 gap-3'>
          {[
            { title: 'Quantify History', sub: 'My Quantify history', icon: faGlobe, color: 'text-blue-400', path: '/record' },
            { title: 'Transaction', sub: 'My transaction history', icon: faReceipt, color: 'text-emerald-400', path: '/record' },
            { title: 'Deposit', sub: 'My deposit history', icon: faMoneyBillTrendUp, color: 'text-rose-400', path: '/record' },
            { title: 'Withdraw', sub: 'My withdraw history', icon: faHandHoldingDollar, color: 'text-orange-400', path: '/record' },
          ].map((item, i) => (
            <div key={i} className='bg-[#212431] border border-gray-700 p-4 rounded-[1.5rem] flex items-center space-x-3 active:scale-95 transition-all cursor-pointer' onClick={() => navigate(item.path)}>
              <div className={`p-2 bg-[#101821] rounded-xl ${item.color}`}>
                <FontAwesomeIcon icon={item.icon} size="lg" />
              </div>
              <div className='flex flex-col'>
                <span className='text-xs font-bold text-white'>{item.title}</span>
                <span className='text-[9px] text-gray-500 truncate'>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* List Items */}
        <div className='bg-[#212431] border border-gray-700 rounded-[1.5rem] overflow-hidden'>
          {[
            { label: 'Notification', icon: Bell, path: '/notifications', extra: <span className='bg-red-500 text-white text-[10px] px-1.5 rounded-full ml-auto mr-2'>2</span> },
            { label: 'Game statistics', icon: Globe, path: '/game', extra: <span className='ml-auto mr-2 text-xs text-gray-400'>Play now</span> },
            { label: 'Refer & Earn', icon: Users, path: '/refer-earn', extra: <span className='ml-auto mr-2 text-xs text-emerald-400'>Invite friends</span> },
          ].map((item, i) => (
            <div key={i} className={`flex items-center px-5 py-4 cursor-pointer active:bg-white/5 ${i !== 2 ? 'border-b border-gray-700/50' : ''}`} onClick={() => item.path !== '#' && navigate(item.path)}>
              <item.icon size={20} className='text-[#49bace] mr-3' />
              <span className='text-sm text-gray-200 font-medium'>{item.label}</span>
              {item.extra}
              <ChevronLeft size={18} className='text-gray-600 rotate-180' />
            </div>
          ))}
        </div>

        {/* Service Center Grid */}
        <div className='bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl'>
          <div className='flex items-center space-x-2 mb-8 px-2'>
            <div className='w-1 h-4 bg-[#49bace] rounded-full'></div>
            <h3 className='text-gray-200 text-xs font-black uppercase tracking-widest'>Service Center</h3>
          </div>
          <div className='grid grid-cols-4 gap-y-8'>
            {[
              { label: 'Password', icon: Lock, path: '/password' },
              { label: 'Language', icon: Globe, path: '/language' },
              { label: 'Support', icon: Headset, path: '/support' },
              { label: 'My Team', icon: Users, path: '/team' },
              { label: 'Tutorial', icon: BookOpen, path: '/tutorial' },
              { label: 'About', icon: Info, path: '/about' },
              { label: 'KYC', icon: FileText, path: '/kyc' },
              { label: 'White Paper', icon: FileText, path: '/white' },
            ].map((item, i) => (
              <div key={i} className='flex flex-col items-center space-y-2.5 cursor-pointer group' onClick={() => item.path !== '#' && navigate(item.path)}>
                <div className='w-14 h-14 bg-[#101821] rounded-2xl border border-gray-800 flex items-center justify-center shadow-lg group-active:scale-90 transition-all group-hover:border-[#49bace]/30 group-hover:bg-[#49bace]/5'>
                  <item.icon size={22} className='text-[#49bace]' />
                </div>
                <span className='text-[10px] font-bold text-gray-500 uppercase tracking-tighter group-hover:text-gray-300 transition-colors'>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className='bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl'>
          <div className='flex items-center space-x-2 mb-6 px-2'>
            <div className='w-1 h-4 bg-emerald-500 rounded-full'></div>
            <h3 className='text-gray-200 text-xs font-black uppercase tracking-widest'>Feedback & Reviews</h3>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div
              onClick={() => navigate('/feedback')}
              className='bg-[#101821] border border-gray-800 p-4 rounded-2xl flex items-center space-x-3 active:scale-95 transition-all cursor-pointer group hover:border-emerald-500/30'
            >
              <div className='p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500'>
                <MessageSquare size={20} />
              </div>
              <div className='flex flex-col'>
                <span className='text-xs font-bold text-white uppercase tracking-tight'>Feedback</span>
                <span className='text-[9px] text-gray-500'>Share experience</span>
              </div>
            </div>
            <div
              onClick={() => navigate('/feedback')}
              className='bg-[#101821] border border-gray-800 p-4 rounded-2xl flex items-center space-x-3 active:scale-95 transition-all cursor-pointer group hover:border-rose-500/30'
            >
              <div className='p-2.5 bg-rose-500/10 rounded-xl text-rose-500'>
                <Heart size={20} />
              </div>
              <div className='flex flex-col'>
                <span className='text-xs font-bold text-white uppercase tracking-tight'>Ratings</span>
                <span className='text-[9px] text-gray-500'>Rate our App</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className='bg-[#212431] border border-gray-700 rounded-[2rem] overflow-hidden shadow-2xl'>
          <div className='w-full flex items-center justify-between px-6 py-5 bg-[#312c42]/50 border-b border-gray-700/50'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-[#49bace]/10 rounded-lg'>
                <Wallet size={18} className='text-[#49bace]' />
              </div>
              <span className='font-black text-xs uppercase tracking-widest text-white'>Account Details</span>
            </div>
            <span className='text-[10px] text-[#49bace] font-bold uppercase'>Real-time Sync</span>
          </div>

          <div className='p-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div className='bg-[#101821] p-4 rounded-2xl border border-gray-800/50'>
                <span className='text-gray-500 text-[10px] uppercase font-bold tracking-tighter mb-1 block'>Total Balance</span>
                <span className='text-lg font-black text-white'>₹ {userData.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className='bg-[#101821] p-4 rounded-2xl border border-gray-800/50'>
                <span className='text-gray-500 text-[10px] uppercase font-bold tracking-tighter mb-1 block'>Available</span>
                <span className='text-lg font-black text-[#49bace]'>₹ {userData.balance?.toFixed(2) || '0.00'}</span>
              </div>
              <div className='bg-[#101821] p-4 rounded-2xl border border-gray-800/50'>
                <span className='text-gray-500 text-[10px] uppercase font-bold tracking-tighter mb-1 block'>Monthly Salary</span>
                <span className='text-lg font-black text-emerald-500'>₹ 0.00</span>
              </div>
              <div className='bg-[#101821] p-4 rounded-2xl border border-gray-800/50'>
                <span className='text-gray-500 text-[10px] uppercase font-bold tracking-tighter mb-1 block'>Commission</span>
                <span className='text-lg font-black text-amber-500'>₹ 0.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          className="mt-6 mb-12 w-full py-4 bg-[#101821] border border-[#49bace]/30 text-[#49bace] font-bold rounded-2xl shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-all hover:bg-[#49bace]/5"
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut size={20} />
          <span className='uppercase tracking-widest text-sm'>Log out</span>
        </button>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-[#212431] border border-gray-700 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
              >
                <div className="absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full bg-rose-500/20" />

                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500">
                    <AlertCircle size={40} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-rose-500">
                      Confirm Logout
                    </h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      Are you sure you want to logout from your account?
                    </p>
                  </div>

                  <div className="flex space-x-3 w-full">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-gray-700 hover:bg-gray-600 text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('quantifyAnimationActive');
                        localStorage.removeItem('quantifyAnimationStartTime');
                        localStorage.removeItem('quantifyData');
                        setShowLogoutModal(false);
                        navigate('/login');
                      }}
                      className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Mine