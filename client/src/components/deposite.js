import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, RefreshCw, CreditCard, 
  Smartphone, Wallet, Info, ArrowRight,
  History, CheckCircle2
} from 'lucide-react'
import axios from 'axios'
import { checkBalanceChange } from '../utils/balanceDetection'
import { API_CONFIG } from '../config/apiConfig'

// UPI Icons
import InnateUPI from '../upi/payNameIcon_20250715163200mv1v.png'
import UPIPay from '../upi/payNameIcon_20250715163221enbg.png'
import PaytmQR from '../upi/payNameIcon_20250715163233qp5w.png'
import UPIQR from '../upi/payNameIcon2_202507151632105oei.png'
import USDTLogo from '../upi/payNameIcon_20240717174902o85p.png'
import ARPayLogo from '../upi/payNameIcon_20241029231521emi6.png'

const Deposit = () => {
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState('UPI-QR')
  const [selectedChannel, setSelectedChannel] = useState('UPI-QR (600-50K)')
  const [amount, setAmount] = useState('600')
  const [userData, setUserData] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      balance: (savedUser?.balance ?? 0),
      total_amount: (savedUser?.total_amount ?? 0)
    };
  });
  const [balance, setBalance] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return (savedUser?.balance ?? 0).toFixed(2);
  })
  const [approvedDepositAmount, setApprovedDepositAmount] = useState(0);
  const [depositHistory, setDepositHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Single function to refresh data (called manually after deposit/withdrawal)
  const refreshUserData = async () => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const userResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const user = userResponse.data.user;
        setBalance(user.balance.toFixed(2));
        setUserData({
          balance: user.balance,
          total_amount: user.total_amount
        });
        localStorage.setItem('user', JSON.stringify(user));
        
        // Calculate approved deposit amount
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const deposits = response.data;
        const approvedAmount = deposits
          .filter(deposit => deposit.status === 'approved')
          .reduce((sum, deposit) => sum + deposit.amount, 0);
        
        setApprovedDepositAmount(approvedAmount);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  // Balance change detection state
  const [lastBalanceCheck, setLastBalanceCheck] = useState(0);
  
  // Detect balance changes (like Quantify page)
  useEffect(() => {
    const detectBalanceChange = async () => {
      const result = await checkBalanceChange();
      
      if (result.detected) {
        console.log('💰 Deposit page detected balance change!');
        console.log('Old Balance:', result.oldBalance);
        console.log('New Balance:', result.newBalance);
        
        // Update displayed balance
        setBalance(result.newBalance.toFixed(2));
        setUserData({
          balance: result.newBalance,
          total_amount: result.newBalance + (result.newQuantify || 0)
        });
        
        // Show visual feedback (optional - can be removed if not needed)
        console.log('✅ Balance updated on Deposit page');
        
        setLastBalanceCheck(result.newBalance);
      }
    };
    
    // Check for balance changes every 10 seconds (optimized for server load)
    const interval = setInterval(detectBalanceChange, 10000);
    
    // Also listen for custom balance update events
    const handleBalanceUpdate = (event) => {
      console.log('📢 Balance update event received on Deposit page:', event.detail);
      detectBalanceChange();
    };
    
    window.addEventListener('balance-updated', handleBalanceUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('balance-updated', handleBalanceUpdate);
    };
  }, []);

  // Initial load only - no continuous updates
  useEffect(() => {
    // Load initial data once
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser) {
      setBalance((savedUser?.balance ?? 0).toFixed(2));
      setUserData({
        balance: (savedUser?.balance ?? 0),
        total_amount: (savedUser?.total_amount ?? 0)
      });
      setLastBalanceCheck(savedUser?.balance ?? 0);
    }
    
    fetchDepositHistory();
  }, []);

  // Fetch deposit history on component mount
  useEffect(() => {
    fetchDepositHistory();
  }, []);

  // Calculate approved deposit amount whenever depositHistory changes
  useEffect(() => {
    // Ensure depositHistory is an array before calling map/filter
    if (Array.isArray(depositHistory)) {
      const approvedAmount = depositHistory
        .filter(deposit => deposit.status === 'approved')
        .reduce((sum, deposit) => sum + deposit.amount, 0);
      setApprovedDepositAmount(approvedAmount);
    } else {
      setApprovedDepositAmount(0);
    }
  }, [depositHistory]);

  const fetchDepositHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        console.error('User not authenticated');
        return;
      }

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Ensure response.data is always an array
      if (Array.isArray(response.data)) {
        setDepositHistory(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setDepositHistory([]); // Fallback to empty array
      }
    } catch (error) {
      console.error('Error fetching deposit history:', error);
      setDepositHistory([]); // Ensure it's an empty array on error
    } finally {
      setLoadingHistory(false);
    }
  };

  const paymentMethods = [
    { id: 'UPI-QR', name: 'Innate UPI-QR', img: InnateUPI },
    { id: 'UPI-PAY', name: 'UPI-QR PAY', img: UPIPay },
    { id: 'PAYTM', name: 'PAYTM-QR', img: PaytmQR },
    { id: 'UPI-QR-2', name: 'UPI-QR', img: UPIQR },
    { id: 'USDT', name: 'USDT', img: USDTLogo, bonus: '+2%' },
    { id: 'ARPay', name: 'ARPay', img: ARPayLogo, bonus: '+2%' },
  ]

  const channels = [
    { id: 'UPI-QR (600-50K)', name: 'UPI-QR', range: 'Balance:600 - 50K', path: '/payment/upi-qr' },
    { id: 'Umoney-QR', name: 'Umoney-QR', range: 'Balance:600 - 10K', path: '/payment/umoney-qr' },
    { id: 'Super-QR', name: 'Super-QR', range: 'Balance:600 - 50K', path: '/payment/super-qr' },
    { id: 'Cloudspay-QR', name: 'Cloudspay-QR', range: 'Balance:600 - 50K', path: '/payment/cloudspay-qr' },
    { id: 'RuJia-QR', name: 'RuJia-QR', range: 'Balance:600 - 50K' },
    { id: '7Days-QR', name: '7Days-QR', range: 'Balance:600 - 50K' },
    { id: 'YayaPay-QR', name: 'YayaPay-QR', range: 'Balance:600 - 50K' },
    { id: 'WPay-QR', name: 'WPay-QR', range: 'Balance:600 - 50K' },
  ]

  const amounts = ['600', '1K', '2K', '3K', '5K', '10K', '20K', '30K', '50K']

  const handleAmountClick = (val) => {
    let numericVal = val
    if (val === '1K') numericVal = '1000'
    if (val === '2K') numericVal = '2000'
    if (val === '3K') numericVal = '3000'
    if (val === '5K') numericVal = '5000'
    if (val === '10K') numericVal = '10000'
    if (val === '20K') numericVal = '20000'
    if (val === '30K') numericVal = '30000'
    if (val === '50K') numericVal = '50000'
    setAmount(numericVal)
  }

  return (
    <div className="bg-[#101821] min-h-screen text-white pb-24 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#101821] px-4 py-4 flex items-center justify-between border-b border-gray-800">
        <button onClick={() => navigate('/mine')} className="p-1">
          <ChevronLeft size={24} className="text-gray-400" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Deposit</h1>
        <button className="text-xs font-medium text-gray-400 hover:text-[#49bace]">Deposit history</button>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-[#49bace] to-[#2d8ba1] rounded-3xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
            <Wallet size={120} />
          </div>
          <div className="flex items-center space-x-2 text-white/80 mb-1">
            <Wallet size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Balance</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-black">₹{balance || '0.00'}</span>
            <button 
              onClick={() => {
                // Manual refresh - fetches data once from server
                refreshUserData();
              }}
              className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Refresh balance (manual)"
            >
              <RefreshCw size={16} className="text-white" />
            </button>
          </div>
          {/* <div className="text-xs text-white/70 mt-1">
            User Balance: ₹{balance}
          </div> */}
        </div>



        {/* Payment Methods Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {paymentMethods.map((m) => (
            <div 
              key={m.id} 
              onClick={() => setSelectedMethod(m.id)}
              className="flex flex-col items-center space-y-1.5 cursor-pointer group"
            >
              <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                selectedMethod === m.id 
                ? 'bg-[#49bace] shadow-lg shadow-[#49bace]/20 scale-105' 
                : 'bg-white border border-gray-200 hover:border-[#49bace]/50'
              }`}>
                {m.img ? (
                  <img src={m.img} alt={m.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg" />
                ) : (
                  <m.icon size={20} className={`sm:w-6 sm:h-6 ${selectedMethod === m.id ? 'text-white' : 'text-gray-400'}`} />
                )}
                {m.bonus && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-[7px] sm:text-[8px] font-black px-1 sm:px-1.5 py-0.5 rounded-md shadow-sm">
                    {m.bonus}
                  </span>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-bold text-center leading-tight ${
                selectedMethod === m.id ? 'text-[#49bace]' : 'text-gray-500'
              }`}>
                {m.name}
              </span>
            </div>
          ))}
        </div>

        {/* Select Channel */}
        <div className="bg-[#212431] border border-gray-700 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Smartphone size={18} className="text-[#49bace]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-200">Select channel</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {channels.map((c) => (
              <div 
                key={c.id}
                onClick={() => setSelectedChannel(c.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedChannel === c.id 
                  ? 'bg-[#49bace]/10 border-[#49bace] shadow-sm' 
                  : 'bg-[#1a1f2e] border-gray-800 hover:border-gray-600'
                }`}
              >
                <p className={`text-[11px] font-black ${selectedChannel === c.id ? 'text-[#49bace]' : 'text-gray-300'}`}>{c.name}</p>
                <p className={`text-[9px] mt-0.5 ${selectedChannel === c.id ? 'text-[#49bace]/70' : 'text-gray-500'}`}>{c.range}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Deposit Amount */}
        <div className="bg-[#212431] border border-gray-700 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard size={18} className="text-[#49bace]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-200">Deposit amount</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {amounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleAmountClick(amt)}
                className={`py-3 rounded-xl text-sm font-black transition-all ${
                  (amount === amt || (amt === '1K' && amount === '1000') || (amt === '2K' && amount === '2000') || (amt === '3K' && amount === '3000') || (amt === '5K' && amount === '5000') || (amt === '10K' && amount === '10000') || (amt === '20K' && amount === '20000') || (amt === '30K' && amount === '30000') || (amt === '50K' && amount === '50000'))
                  ? 'bg-[#49bace] text-white shadow-lg shadow-[#49bace]/20'
                  : 'bg-[#1a1f2e] border border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {amt.includes('K') ? amt : `₹${amt}`}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[#49bace] font-bold text-lg">₹</span>
            <span className="text-xl font-black text-white">{amount}</span>
          </div>
        </div>

        {/* Recharge Instructions */}
        <div className="bg-[#212431] border border-gray-700 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Info size={18} className="text-[#49bace]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-200">Recharge instructions</h2>
          </div>
          <ul className="space-y-3">
            {[
              "If the transfer time is up, please fill out the deposit form again.",
              "The transfer amount must match the order you created, otherwise the money cannot be credited successfully.",
              "If you transfer the wrong amount, our company will not be responsible for the lost amount!",
              "Note: do not cancel the deposit order after the money has been transferred."
            ].map((text, i) => (
              <li key={i} className="flex items-start space-x-3 group">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#49bace] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Deposit History */}
        <div className="bg-[#212431] border border-gray-700 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <History size={18} className="text-[#49bace]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-200">Deposit history</h2>
          </div>
          
          {loadingHistory ? (
            <div className="py-8 flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#49bace]/30 border-t-[#49bace] rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Loading records...</p>
            </div>
          ) : Array.isArray(depositHistory) && depositHistory.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {depositHistory.map((deposit, index) => (
                <div key={deposit._id || index} className="bg-[#1a1f2e] rounded-2xl p-4 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">₹{deposit.amount}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          deposit.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          deposit.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {deposit.status || 'pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{deposit.utrNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(deposit.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {new Date(deposit.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
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

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#101821]/80 backdrop-blur-xl border-t border-gray-800 px-4 py-4 md:max-w-[27rem] mx-auto flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Recharge Method:</span>
          <span className="text-xs font-black text-[#49bace] uppercase">{selectedMethod}</span>
        </div>
        <button 
          className="bg-[#49bace] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-[#49bace]/20 hover:scale-105 active:scale-95 transition-all"
          onClick={() => {
            // Check which channel is selected and navigate accordingly
            if (selectedChannel === 'UPI-QR (600-50K)') {
              navigate(`/payment/upi-qr?amount=${amount}`);
            } else if (selectedChannel === 'Umoney-QR') {
              navigate(`/payment/umoney-qr?amount=${amount}`);
            } else if (selectedChannel === 'Super-QR') {
              navigate(`/payment/super-qr?amount=${amount}`);
            } else if (selectedChannel === 'Cloudspay-QR') {
              navigate(`/payment/cloudspay-qr?amount=${amount}`);
            } else if (selectedChannel === 'RuJia-QR' || selectedChannel === '7Days-QR' || selectedChannel === 'YayaPay-QR' || selectedChannel === 'WPay-QR') {
              // For these 4 channels, redirect to random payment page with the selected amount
              const paymentPages = [`/payment/upi-qr?amount=${amount}`, `/payment/umoney-qr?amount=${amount}`, `/payment/super-qr?amount=${amount}`, `/payment/cloudspay-qr?amount=${amount}`];
              const randomPage = paymentPages[Math.floor(Math.random() * paymentPages.length)];
              navigate(randomPage);
            } else {
              // For any other channels, show alert
              alert(`Initiating deposit of ₹${amount}`);
            }
          }}
        >
          Deposit ₹{amount}
        </button>
      </div>
    </div>
  )
}

export default Deposit;
