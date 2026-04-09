import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { checkBalanceChange, forceRefreshUserData } from '../utils/balanceDetection'
import { 
  ChevronLeft, RefreshCw, Landmark, 
  Wallet, Info, History, ArrowRight,
  ShieldCheck, Banknote, CreditCard, Lock,
  Plus, AlertCircle, Clock, Loader
} from 'lucide-react'
import AlertModal from './WithdrawalAlertModal'
import { API_CONFIG } from '../config/apiConfig'

// ════════════════════════════════════════════════════════════
//  💀 SKELETON LOADER COMPONENT (Same as Mine page)
// ════════════════════════════════════════════════════════════
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

const ShimmerStyle = () => (
  <style>{`
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
  `}</style>
);

const WithdrawSkeleton = () => (
  <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">
    <ShimmerStyle />
    
    {/* Header Skeleton */}
    <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
      <Skeleton className="w-6 h-6" />
      <Skeleton className="w-32 h-5 rounded-lg" />
      <Skeleton className="w-16 h-4 rounded" />
    </div>

    <div className="px-4 mt-6 space-y-6">
      
      {/* Balance Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-[#212431] border border-gray-700 p-5 rounded-[2rem] shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Skeleton className="w-3.5 h-3.5 rounded" />
              <Skeleton className="w-20 h-2.5 rounded" />
            </div>
            <Skeleton className="w-24 h-6 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Bank Selection Skeleton */}
      <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 mb-2 px-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-36 h-3 rounded" />
        </div>
        <Skeleton className="w-full h-14 rounded-2xl" />
      </div>

      {/* Withdraw Amount Skeleton */}
      <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 mb-2 px-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-32 h-3 rounded" />
        </div>
        <Skeleton className="w-full h-16 rounded-2xl" />
        <Skeleton className="w-full h-20 rounded-xl" />
      </div>

      {/* Password Skeleton */}
      <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-2 px-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-28 h-3 rounded" />
        </div>
        <Skeleton className="w-full h-12 rounded-2xl" />
      </div>

      {/* History Skeleton */}
      <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-32 h-3 rounded" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#1a1f2e] rounded-2xl p-4 border border-gray-800 mb-3">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-32 h-3 rounded" />
              </div>
              <Skeleton className="w-16 h-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Withdraw = () => {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [validationTimeout, setValidationTimeout] = useState(null)
  const [password, setPassword] = useState('')
  const [userData, setUserData] = useState({ name: 'Loading...', uid: '------', balance: 0, total_amount: 0 });
  const [userJoinDate, setUserJoinDate] = useState(null); // Track when user joined
  
  // Function to check if user is within 16-day restriction period
  const isWithinRestrictionPeriod = () => {
    if (!userJoinDate) return false;
    
    const joinDate = new Date(userJoinDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Return true if user is within 16 days of joining
    return diffDays <= 16;
  };
  
  const [balance, setBalance] = useState('0.00')
  const [approvedDepositAmount, setApprovedDepositAmount] = useState(0);
  const [totalBalance, setTotalBalance] = useState('0.00');
  const [availableBalance, setAvailableBalance] = useState('0.00');
  const [selectedBank, setSelectedBank] = useState('')
  const [userBanks, setUserBanks] = useState([])
  const [loadingBanks, setLoadingBanks] = useState(true)
  const [showAddBank, setShowAddBank] = useState(false)
  const [withdrawalHistory, setWithdrawalHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false)
  
  // ════════════════════════════════════════════════════════════
  //  ⚡ LOADING STATE - Initial page load
  // ════════════════════════════════════════════════════════════
  const [initialLoading, setInitialLoading] = useState(true);
  
  // 24-hour restriction states
  const [hasCompleted24Hours, setHasCompleted24Hours] = useState(false)
  // ── FIX 1: Store secondsRemaining in a ref for local countdown ───────────
  // Old code called check24HourRestriction() every 1 SECOND = 60 API/min!
  // New: fetch once from server → tick down locally → 0 extra API calls
  const secondsRemainingRef = useRef(0);
  const [displayCountdown, setDisplayCountdown] = useState('00:00:00');
  const [loadingRestriction, setLoadingRestriction] = useState(true)
  
  // Alert modal states
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  })
  
  // Balance change detection (like Quantify page)
  const [lastBalance, setLastBalance] = useState(0);

  // ── FIX 2: Auto-logout helper ─────────────────────────────────────────────
  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };
  
  // Detect balance changes from deposits/withdrawals
  useEffect(() => {
    // ── FIX 2: Token null check ───────────────────────────────────────────
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const detectBalanceChange = async () => {
      const result = await checkBalanceChange();
      
      if (result.detected) {
        // console.log('💰 Withdrawal page detected balance change!');
        // console.log('Old Balance:', result.oldBalance);
        // console.log('New Balance:', result.newBalance);
        
        // Show notification
        showAlert(
          'Balance Updated!',
          `Your balance has been updated: ₹${result.oldBalance.toFixed(2)} → ₹${result.newBalance.toFixed(2)} (${result.newBalance > result.oldBalance ? '+' : ''}${(result.newBalance - result.oldBalance).toFixed(2)})`,
          'success'
        );
        
        // Update last balance tracker
        setLastBalance(result.newBalance);
      }
    };
    
    // Check for balance changes every 10 seconds (optimized for server load)
    const interval = setInterval(detectBalanceChange, 10000);
    
    // Also listen for custom balance update events
    const handleBalanceUpdate = (event) => {
      // console.log('📢 Balance update event received:', event.detail);
      detectBalanceChange();
    };
    
    window.addEventListener('balance-updated', handleBalanceUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('balance-updated', handleBalanceUpdate);
    };
  }, []);

  const stats = [
    { label: 'Total Balance', value: `₹${userData.total_amount?.toFixed(2) || '0.00'}`, icon: Wallet, color: 'text-blue-400' },
    { label: 'Available', value: `₹${userData.balance?.toFixed(2) || '0.00'}`, icon: CreditCard, color: 'text-[#49bace]' },
  ];
  
  // Calculate actual receipt after 4% handling fee
  const calculateActualReceipt = () => {
    if (!amount || isNaN(amount)) return '0';
    const amountNum = parseFloat(amount);
    const fee = amountNum * 0.04;
    const actualReceipt = amountNum - fee;
    return actualReceipt.toFixed(2);
  };
  
  // Show alert modal
  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };
  
  // Close alert modal
  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      title: '',
      message: '',
      type: 'info',
      onConfirm: null
    });
  };
  
  // Check 24-hour restriction — called ONCE, then local countdown ticks
  const check24HourRestriction = async () => {
    try {
      const token = localStorage.getItem('token');
      // ── FIX 2: Token null check ──────────────────────────────────────────
      if (!token) { navigate('/login'); return; }
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/check-24hrs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { hasCompleted24Hours, hoursRemaining, secondsRemaining } = response.data;
      
      setHasCompleted24Hours(hasCompleted24Hours);
      // ── FIX 1: Store in ref so local countdown can use it ────────────────
      secondsRemainingRef.current = Math.max(0, Math.floor(secondsRemaining || 0));
      setLoadingRestriction(false);
    } catch (error) {
      console.error('Error checking restriction:', error);
      // ── FIX 2: Auto-logout on 403 ────────────────────────────────────────
      handleAuthError(error.response?.status);
      setLoadingRestriction(false);
    }
  };
  
  // Format countdown time (HH:MM:SS or MM:SS based on duration)
  const formatCountdown = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    // If more than 1 hour, show HH:MM:SS
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    // Otherwise show MM:SS
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Fetch user's bank accounts
  const fetchUserBanks = async () => {
    try {
      const token = localStorage.getItem('token');
      // ── FIX 2: Token null check ──────────────────────────────────────────
      if (!token) { navigate('/login'); return; }
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/bank/user-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.bank) {
        setUserBanks([response.data.bank]);
        // Auto-select the first verified bank
        if (response.data.bank.status === 'Verified') {
          setSelectedBank(response.data.bank._id);
        }
      }
    } catch (err) {
      console.error('Error fetching bank details:', err);
      // ── FIX 2: Auto-logout on 403 ────────────────────────────────────────
      handleAuthError(err.response?.status);
      // User has no bank accounts
      setUserBanks([]);
    } finally {
      setLoadingBanks(false);
    }
  };

  // Fetch withdrawal history
  const fetchWithdrawalHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        console.error('User not authenticated');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/withdrawal/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setWithdrawalHistory(response.data);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      // ── FIX 2: Auto-logout on 403 ────────────────────────────────────────
      handleAuthError(error.response?.status);
      setWithdrawalHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    // ── FIX 2: Token null check ───────────────────────────────────────────
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchData = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        
        if (savedUser && token) {
          // ════════════════════════════════════════════════
          //  ⚡ OPTIMIZATION: Parallel API calls (faster loading)
          //  Sabhi requests ek saath bhejo, result wait karo
          // ════════════════════════════════════════════════
          const [userRes, depositRes] = await Promise.all([
            axios.get(`${API_CONFIG.BASE_URL}/api/auth/user`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${savedUser._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: [] })) // Error handle gracefully
          ]);
          
          const user = userRes.data.user;
          
          // Check 24-hour restriction — called ONCE here
          await check24HourRestriction();
          
          const deposits = depositRes.data;
          const approvedAmount = deposits
            .filter(deposit => deposit.status === 'approved')
            .reduce((sum, deposit) => sum + deposit.amount, 0);
          
          setApprovedDepositAmount(approvedAmount);
          
          // Calculate total and available balances (matching mine page)
          const calculatedTotalBalance = (user.balance + approvedAmount).toFixed(2);
          const calculatedAvailableBalance = (user.balance + approvedAmount).toFixed(2);
          
          setTotalBalance(calculatedTotalBalance);
          setAvailableBalance(calculatedAvailableBalance);
          setBalance(user.balance.toFixed(2)); // Keep the original balance for internal calculations if needed
          
          // Calculate total balance based on the condition: if quantify > balance, show quantify; otherwise show balance
          const totalBalance = Math.max(user.balance, user.quantify || 0);
          
          // Set user data
          setUserData({
            name: user.name || 'MEMBER_NNGX',
            uid: user.phone ? user.phone.slice(-6) : '------',
            balance: user.balance,
            total_amount: totalBalance,
            quantify: user.quantify || 0
          });
          
          // Set user join date to calculate 16-day restriction
          setUserJoinDate(user.createdAt || user.createdAt);
        } else {
          // Fallback to localStorage data
          if (savedUser) {
            // Fetch deposit history to calculate approved deposit amount
            const token = localStorage.getItem('token');
            if (token && savedUser._id) {
              // ════════════════════════════════════════════════
              //  ⚡ OPTIMIZATION: Parallel API calls for fallback case
              // ════════════════════════════════════════════════
              const depositRes = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${savedUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch(() => ({ data: [] }));
              
              const deposits = depositRes.data;
              const approvedAmount = deposits
                .filter(deposit => deposit.status === 'approved')
                .reduce((sum, deposit) => sum + deposit.amount, 0);
              
              setApprovedDepositAmount(approvedAmount);
              
              // Calculate total and available balances (matching mine page)
              const calculatedTotalBalance = (savedUser.balance + approvedAmount).toFixed(2);
              const calculatedAvailableBalance = (savedUser.balance + approvedAmount).toFixed(2);
              
              setTotalBalance(calculatedTotalBalance);
              setAvailableBalance(calculatedAvailableBalance);
              setBalance(savedUser.balance.toFixed(2));
              
              // Calculate total balance based on the condition: if quantify > balance, show quantify; otherwise show balance
              const totalBalance = Math.max(savedUser.balance, savedUser.quantify || 0);
                          
              // Set user data from localStorage
              setUserData({
                name: savedUser.name || 'MEMBER_NNGX',
                uid: savedUser.phone ? savedUser.phone.slice(-6) : '------',
                balance: savedUser.balance,
                total_amount: totalBalance,
                quantify: savedUser.quantify || 0
              });
              
              // Set user join date to calculate 16-day restriction
              setUserJoinDate(savedUser.createdAt || savedUser.createdAt);
            } else {
              // Set default balances
              setTotalBalance('0.00');
              setAvailableBalance('0.00');
              setBalance('0.00');
            }
          } else {
            // Set default balances
            setTotalBalance('0.00');
            setAvailableBalance('0.00');
            setBalance('0.00');
          }
        }
      } catch (err) {
        console.error('Error in withdrawal component:', err);
        handleAuthError(err.response?.status);
        
        // Set default balances
        setTotalBalance('0.00');
        setAvailableBalance('0.00');
        setBalance('0.00');
      } finally {
        // ════════════════════════════════════════════════
        //  ⚡ LOADING COMPLETE - Show page content
        // ════════════════════════════════════════════════
        setInitialLoading(false);
      }
    };
    
    fetchData();
    fetchUserBanks();
    fetchWithdrawalHistory();
    
    // ── FIX 1: Local countdown tick — ZERO extra API calls ────────────────
    // OLD CODE (WRONG): setInterval(() => check24HourRestriction(), 1000)
    //   = 60 API calls/minute = 3600/hour = server crash + 403 errors ❌
    //
    // NEW CODE (CORRECT): tick the ref locally every second
    //   check24HourRestriction() runs ONCE above in fetchData()
    //   After that, we just count down locally — no network calls ✅
    const countdownInterval = setInterval(() => {
      if (secondsRemainingRef.current > 0) {
        secondsRemainingRef.current -= 1;
        setDisplayCountdown(formatCountdown(secondsRemainingRef.current));
        // When countdown reaches 0, mark 24hrs as completed
        if (secondsRemainingRef.current === 0) {
          setHasCompleted24Hours(true);
        }
      }
    }, 1000);
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════════════
          ⚡ SKELETON LOADER - Jab tak data load ho
          ════════════════════════════════════════════════ */}
      {initialLoading && <WithdrawSkeleton />}
      
      {/* ════════════════════════════════════════════════
          📄 PAGE CONTENT - Jab tak data load ho jaye
          ════════════════════════════════════════════════ */}
      {!initialLoading && (
        <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => navigate('/mine')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Withdraw Funds</h1>
        <button 
          onClick={() => navigate('/record')}
          className="text-xs font-medium text-gray-400 hover:text-[#49bace]"
        >
          History
        </button>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Balance Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-[#212431] border border-gray-700 p-5 rounded-[2rem] shadow-xl relative overflow-hidden group">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 mb-2">
                  <s.icon size={14} className={s.color} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{s.label}</span>
                </div>
                <span className="text-xl font-black text-white">{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bank Selection */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 mb-2 px-2">
            <Landmark size={18} className="text-[#49bace]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Withdrawal Account</h2>
          </div>
          
          {loadingBanks || loadingRestriction ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#49bace]"></div>
            </div>
          ) : userBanks.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-[#49bace]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-[#49bace]" />
              </div>
              <h3 className="text-white font-bold mb-2">No Bank Account Found</h3>
              <p className="text-gray-500 text-sm mb-4">You need to add a bank account to make withdrawals</p>
              
              {/* 24-Hour Restriction Check */}
              {!hasCompleted24Hours ? (
                <div className="relative group">
                  <button 
                    disabled
                    className="w-full bg-gray-700 text-gray-400 py-3 rounded-2xl font-bold text-sm cursor-not-allowed flex items-center justify-center space-x-2 opacity-50"
                  >
                    <Clock size={18} />
                    <span>Add Bank Account</span>
                  </button>
                  
                  {/* Tooltip on hover - Fixed overflow */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#212431] border border-gray-700 rounded-xl shadow-2xl whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-50 w-64 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="text-amber-400" />
                        <p className="text-white font-bold text-xs">Wait 24 Hours</p>
                      </div>
                      <p className="text-gray-300 text-[10px] leading-tight">Start quantifying first, then you can add bank account after 24 hours.</p>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-8 border-transparent border-t-[#212431]"></div>
                    </div>
                  </div>
                  
                  {/* ── FIX 1: displayCountdown from local ref — no API calls ── */}
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="flex items-center justify-center space-x-2 text-amber-400">
                      <Clock size={16} />
                      <span className="text-xs font-bold">
                        Time Remaining: {displayCountdown}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/bind')}
                  className="w-full bg-[#49bace] text-[#101821] py-3 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Bank Account</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative group">
                <select 
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-gray-800 rounded-2xl py-4 px-6 text-sm font-bold text-white appearance-none focus:border-[#49bace] outline-none transition-all"
                >
                  <option value="" disabled>Select Withdrawal Account</option>
                  {userBanks.map((bank) => (
                    <option 
                      key={bank._id} 
                      value={bank._id}
                      disabled={bank.status !== 'Verified'}
                    >
                      {bank.accountHolder} - {bank.ifsc} ({bank.status})
                      {bank.status !== 'Verified' && ' (Pending Verification)'}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ArrowRight size={18} className="rotate-90" />
                </div>
              </div>
              
              {selectedBank && (
                <div className="bg-[#1a1f2e]/50 border border-gray-800 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-400 uppercase">Selected Account</span>
                  </div>
                  {userBanks
                    .filter(bank => bank._id === selectedBank)
                    .map(bank => (
                      <div key={bank._id} className="space-y-1">
                        <p className="text-white font-bold text-sm">{bank.accountHolder}</p>
                        <p className="text-gray-400 text-xs">
                          Account: ****{bank.accountNumber.slice(-4)} | IFSC: {bank.ifsc}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                            bank.status === 'Verified' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : bank.status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {bank.status}
                          </span>
                          {bank.status === 'Verified' && (
                            <span className="text-[10px] text-emerald-400 font-bold">• Ready for withdrawal</span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {/* Withdraw Amount */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 mb-2 px-2">
            <Banknote size={18} className="text-[#49bace]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Withdraw Amount</h2>
          </div>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#49bace] font-black text-lg">₹</span>
            <input 
              type="text"
              inputMode="decimal"
              placeholder="Min 100 - Max 50,000"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers and decimal point
                if (/^\d*\.?\d*$/.test(value) || value === '') {
                  setAmount(value);
                  // Clear any existing timeout
                  if (validationTimeout) {
                    clearTimeout(validationTimeout);
                  }
                  // Set a new timeout to validate after user stops typing
                  if (value !== '') {
                    const newTimeout = setTimeout(() => {
                      const numValue = parseFloat(value);
                      
                      // Check if user is within 16-day restriction period
                      if (isWithinRestrictionPeriod()) {
                        // During restriction period (Day 1-16), user can only withdraw Total Balance - Available Balance
                        const restrictedMaxWithdrawal = (userData.total_amount || 0) - (userData.balance || 0);
                        
                        if (numValue > restrictedMaxWithdrawal) {
                          showAlert('Withdrawal Restriction', `During the initial 16-day period, you can only withdraw up to ₹${restrictedMaxWithdrawal.toFixed(2)}. If you withdraw now, your quantify credit will be damaged. Complete KYC to withdraw up to 50% of your Available Balance after completing 16 days of quantifying.`, 'warning');
                          return;
                        }
                      }
                      
                      if (numValue < 100) {
                        showAlert('Minimum Amount', 'Minimum withdrawal amount is ₹100', 'error');
                      } else if (numValue > 50000) {
                        showAlert('Maximum Amount', 'Maximum withdrawal amount is ₹50,000', 'error');
                      } else {
                        // Check against total balance instead of just available balance
                        const totalBalanceNum = parseFloat(userData.total_amount || 0);
                        if (numValue > totalBalanceNum) {
                          showAlert('Insufficient Balance', `Amount exceeds total balance of ₹${totalBalanceNum.toFixed(2)}`, 'error');
                        }
                      }
                    }, 2000); // 2 seconds delay
                    setValidationTimeout(newTimeout);
                  }
                }
              }}
              className="w-full bg-[#1a1f2e] border border-gray-800 rounded-2xl py-5 pl-12 pr-6 text-xl font-black text-white focus:border-[#49bace] outline-none transition-all placeholder:text-gray-700 placeholder:text-sm placeholder:font-bold [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="bg-[#1a1f2e] rounded-xl border border-amber-500/30 p-3 mt-2">
            <div className="text-center">
              <span className="text-[10px] text-amber-400 font-bold">WITHDRAWAL BREAKDOWN</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-300">Requested Amount:</span>
              <span className="text-sm font-bold text-white">₹{parseFloat(amount) || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-rose-400">Handling Fee (4%):</span>
              <span className="text-sm font-bold text-rose-500">-₹{(parseFloat(amount) * 0.04 || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-amber-500/30">
              <span className="text-sm font-bold text-amber-400">You Receive:</span>
              <span className="text-lg font-extrabold text-emerald-400">₹{calculateActualReceipt()}</span>
            </div>
          </div>
        </div>

        {/* Security Password */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 mb-2 px-2">
            <Lock size={18} className="text-[#49bace]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Security Password</h2>
          </div>
          <input 
            type="password"
            placeholder="Enter transaction password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-gray-800 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:border-[#49bace] outline-none transition-all placeholder:text-gray-700"
          />
        </div>

        {/* Instructions */}
        <div className="bg-[#212431]/50 border border-gray-700/50 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Info size={16} className="text-[#49bace]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Important Notice</span>
          </div>
          <ul className="space-y-3">
            {[
              "Today's quantifying total revenue will be available for withdrawal after 24 hours.",
              "Withdrawals are processed within 10-30 minutes.",
              "Ensure your bank details are correct to avoid failure.",
              "Minimum withdrawal amount is ₹100.",
              "Only one withdrawal request is allowed per 24 hours."
            ].map((text, i) => (
              <li key={i} className="flex items-start space-x-3 group">
                <div className="mt-1.5 w-1 h-1 rounded-full bg-gray-600 group-hover:bg-[#49bace] transition-colors" />
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Withdrawal History */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <History size={18} className="text-[#49bace]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Withdrawal History</h2>
          </div>
          
          {loadingHistory ? (
            <div className="py-8 flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#49bace]/30 border-t-[#49bace] rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Loading records...</p>
            </div>
          ) : withdrawalHistory.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {withdrawalHistory.map((request, index) => (
                <div key={request._id || index} className="bg-[#1a1f2e] rounded-2xl p-4 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">₹{request.amount}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          request.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Fee: ₹{request.handlingFee?.amount?.toFixed(2) || '0.00'} • 
                        Receipt: ₹{request.handlingFee?.actualReceipt?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-[9px] text-gray-600 mt-1">
                        To: {request.bankAccount?.accountHolder || 'Bank Account'} • 
                        ***{request.bankAccount?.accountNumber?.slice(-4) || '****'}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {new Date(request.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {request.status === 'approved' && request.processedBy?.processedAt && (
                        <p className="text-[8px] text-emerald-400 mt-1">
                          Approved: {new Date(request.processedBy.processedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#1a1f2e] rounded-full flex items-center justify-center mb-4 border border-gray-800 shadow-inner">
                <History size={32} className="text-gray-700" />
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-tighter">No records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#101821] via-[#101821] to-transparent z-50">
        <div className="md:max-w-[27rem] mx-auto w-full">
          <button 
            onClick={async () => {
              if (!selectedBank) {
                showAlert('Bank Account Required', 'Please select a withdrawal account', 'error');
                return;
              }
              
              const selectedBankData = userBanks.find(bank => bank._id === selectedBank);
              if (selectedBankData && selectedBankData.status !== 'Verified') {
                showAlert('Account Not Verified', 'Please select a verified bank account', 'error');
                return;
              }
              
              const amountNum = parseFloat(amount);
              if (!amount || isNaN(amountNum) || amountNum < 100) {
                showAlert('Invalid Amount', 'Please enter a valid amount (minimum ₹100)', 'error');
                return;
              }
              
              if (amountNum > 50000) {
                showAlert('Invalid Amount', 'Please enter a valid amount (maximum ₹50,000)', 'error');
                return;
              }
              
              // Calculate maximum allowable withdrawal based on KYC status and days since registration
              const currentDate = new Date();
              const userJoinDateObj = new Date(userData.createdAt || userJoinDate);
              const daysSinceRegistration = Math.floor((currentDate - userJoinDateObj) / (1000 * 60 * 60 * 24));
              
              // Fetch KYC status
              let kycApproved = false;
              try {
                const token = localStorage.getItem('token');
                const kycRes = await axios.get(`${API_CONFIG.BASE_URL}/api/kyc/status`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                kycApproved = kycRes.data.status === 'Approved';
              } catch (kycErr) {
                console.error('Error fetching KYC status:', kycErr);
                // ── FIX 2: Auto-logout on 403 ──────────────────────────────
                handleAuthError(kycErr.response?.status);
                kycApproved = false;
              }
              
              // Calculate the difference between Total and Available balance (quantify earnings)
              const totalBalanceNum = parseFloat(userData.total_amount || 0);
              const availableBalanceNum = parseFloat(userData.balance || 0);
              const quantifyEarnings = totalBalanceNum - availableBalanceNum;
              
              let maxWithdrawalAmount = 0;
              let restrictionMessage = '';
              
              if (!kycApproved || daysSinceRegistration < 14) {
                // Without KYC or before 14 days: Can only withdraw quantify earnings (Total - Available)
                maxWithdrawalAmount = quantifyEarnings;
                
                if (!kycApproved && daysSinceRegistration < 14) {
                  restrictionMessage = `Without KYC completion and before 14 days, you can only withdraw ₹${maxWithdrawalAmount.toFixed(2)} (your quantify earnings). Complete KYC and wait 14 days to withdraw from Available Balance.`;
                } else if (!kycApproved) {
                  restrictionMessage = `Without KYC, you can only withdraw ₹${maxWithdrawalAmount.toFixed(2)} (your quantify earnings). Complete KYC to withdraw more.`;
                } else {
                  restrictionMessage = `Before 14 days completion, you can only withdraw ₹${maxWithdrawalAmount.toFixed(2)} (your quantify earnings). Wait until day 14 to withdraw from Available Balance.`;
                }
                
                if (amountNum > maxWithdrawalAmount) {
                  showAlert('Withdrawal Restriction', restrictionMessage, 'warning');
                  return;
                }
              } else if (kycApproved && daysSinceRegistration >= 14) {
                // After KYC + 14 days: Can withdraw up to 50% of Available Balance + all quantify earnings
                const fiftyPercentOfAvailable = availableBalanceNum * 0.50;
                maxWithdrawalAmount = fiftyPercentOfAvailable + quantifyEarnings;
                
                if (amountNum > maxWithdrawalAmount) {
                  showAlert('Withdrawal Limit', `After KYC and 14 days, you can withdraw up to 50% of Available Balance plus all quantify earnings. Maximum allowed: ₹${maxWithdrawalAmount.toFixed(2)} (50% of Available: ₹${fiftyPercentOfAvailable.toFixed(2)} + Quantify Earnings: ₹${quantifyEarnings.toFixed(2)}).`, 'warning');
                  return;
                }
              }
              
              if (!password) {
                showAlert('Security Password Required', 'Please enter your security password', 'error');
                return;
              }
              
              // Submit withdrawal request
              try {
                setSubmittingWithdrawal(true);
                const token = localStorage.getItem('token');
                const response = await axios.post(`${API_CONFIG.BASE_URL}/api/withdrawal/request`, {
                  amount: parseFloat(amount),
                  password: password,
                  bankAccountId: selectedBank
                }, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                showAlert(
                  'Withdrawal Request Submitted', 
                  `Your withdrawal request of ₹${amount} has been submitted successfully. You will receive ₹${response.data.actualReceipt} after 4% handling fee (₹${response.data.fee}). Request ID: ${response.data.requestId}`,
                  'success',
                  () => {
                    // Reset form after successful submission
                    setAmount('');
                    setPassword('');
                    setSubmittingWithdrawal(false);
                    // Refresh history
                    fetchWithdrawalHistory();
                    
                    // Auto-refresh page ONCE after 5 seconds to update balances
                    setTimeout(() => {
                      window.location.reload();
                    }, 5000);
                  }
                );
              } catch (error) {
                console.error('Withdrawal error:', error);
                
                // ── FIX: Don't logout on invalid withdrawal password ──────────
                // 401 can mean TWO things:
                //   1. Invalid JWT token → logout
                //   2. Invalid withdrawal password → show error modal
                // We need to check the error message to differentiate
                
                const errorMessage = error.response?.data?.error || 'Failed to submit withdrawal request. Please try again.';
                
                // Check if it's a token authentication error (not password error)
                if (error.response?.status === 403) {
                  // 403 = Invalid/expired JWT token → logout
                  handleAuthError(403);
                  showAlert('Session Expired', 'Please login again', 'error');
                } else if (error.response?.status === 401) {
                  // 401 could be invalid password OR invalid token
                  // Check the error message to differentiate
                  if (errorMessage.toLowerCase().includes('password')) {
                    // ❌ Wrong withdrawal password → show error modal (NO logout)
                    showAlert('Invalid Password', errorMessage, 'error');
                  } else {
                    // Token authentication failed → logout
                    handleAuthError(401);
                    showAlert('Session Expired', 'Please login again', 'error');
                  }
                } else {
                  // Other errors (400, 500, etc.) → just show error
                  showAlert('Error', errorMessage, 'error');
                }
                
                setSubmittingWithdrawal(false);
              }
            }}
            disabled={!selectedBank || !amount || !password || submittingWithdrawal}
            className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center space-x-3 ${
              selectedBank && amount && password 
                ? 'bg-[#49bace] text-white hover:scale-[1.02] active:scale-95 shadow-[#49bace]/20' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submittingWithdrawal ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{selectedBank && amount && password ? 'Withdraw Now' : 'Withdraw Now'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </div>
  )}
    </>
  )
}

export default Withdraw;