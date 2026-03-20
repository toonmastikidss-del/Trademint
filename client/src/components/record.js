import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

// ─── Skeleton shimmer components ─────────────────────────────────────────────
const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const Skeleton = ({ w = '100%', h = 14, r = 8, className = '' }) => (
  <div
    className={className}
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background: 'linear-gradient(90deg, #1e2535 25%, #2a3347 50%, #1e2535 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite linear',
    }}
  />
);

const SkeletonCard = () => (
  <>
    <style>{shimmerStyle}</style>
    <div className="space-y-4">
      <div className="bg-[#212431] rounded-3xl p-5 border border-gray-800 shadow-2xl">
        {[1, 2, 3, 4].map((_, i) => (
          <div
            key={i}
            className={`${i !== 0 ? 'border-t border-gray-700/50 mt-4 pt-4' : ''}`}
          >
            {/* Row 1: type label + badge + amount */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Skeleton w={80} h={16} r={6} />
                <Skeleton w={44} h={16} r={20} />
              </div>
              <Skeleton w={70} h={18} r={6} />
            </div>
            {/* Row 2: date */}
            <Skeleton w={160} h={11} r={5} />
            {/* Row 3: sub info (alternate rows) */}
            {i % 2 === 0 && (
              <div className="mt-2">
                <Skeleton w={200} h={10} r={5} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center text-gray-600 text-sm py-8">
        Loading transactions...
      </div>
    </div>
  </>
);
// ─────────────────────────────────────────────────────────────────────────────

const Record = () => {
  const [selected, setSelected] = useState('All');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch real transaction data
  const fetchTransactionData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');
      
      // Safely parse user data with error handling
      let savedUser = null;
      if (savedUserStr) {
        try {
          savedUser = JSON.parse(savedUserStr);
        } catch (parseError) {
          // console.error('Error parsing user data from localStorage:', parseError);
          savedUser = null;
        }
      }
      
      if (!token || !savedUser) {
        // console.error('User not authenticated');
        setTransactions([]); // Ensure transactions is an empty array
        return;
      }
      
      setUser(savedUser);
      
      // Fetch withdrawal requests with safety check
      let withdrawalData = [];
      try {
        const withdrawalRes = await axios.get(`${API_CONFIG.BASE_URL}/api/withdrawal/user/${savedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        withdrawalData = Array.isArray(withdrawalRes.data) ? withdrawalRes.data : [];
      } catch (error) {
        // console.error('Error fetching withdrawals:', error);
        withdrawalData = [];
      }
      
      // Fetch deposit records with safety check
      let depositData = [];
      try {
        const depositRes = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${savedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        depositData = Array.isArray(depositRes.data) ? depositRes.data : [];
      } catch (error) {
        // console.error('Error fetching deposits:', error);
        depositData = [];
      }
      
      // Fetch reward history (user tasks with rewards)
      let rewardHistory = [];
      try {
        const rewardRes = await axios.get(`${API_CONFIG.BASE_URL}/api/task/rewards/${savedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        rewardHistory = rewardRes.data.rewards || [];
        // console.log('Fetched task reward history records:', rewardHistory.length);
      } catch (err) {
        // console.log('Task reward history not available');
      }
      
      // Fetch referral reward history
      let referralRewards = [];
      try {
        const referralStatsRes = await axios.get(`${API_CONFIG.BASE_URL}/api/referral/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const referrals = referralStatsRes.data.referrals || [];
        
        // Convert referrals to reward format
        referralRewards = referrals
          .filter(ref => ref.rewardGiven && (ref.status === 'completed' || ref.status === 'rewarded'))
          .map(ref => ({
            amount: ref.rewardAmount,
            completedAt: new Date(ref.createdAt),
            refereeName: ref.refereeId?.name || 'Friend',
            refereePhone: ref.refereeId?.phone || 'N/A'
          }));
        
        // console.log('Fetched referral reward records:', referralRewards.length);
      } catch (err) {
        // console.log('Referral rewards not available');
      }
      
      // ─── FIX: /history/daily route does not exist in backend ─────────────────
      // Correct route is /api/quantify/history (works for current user)
      // /history/daily was giving 404 error
      let tradeHistory = [];
      try {
        const historyRes = await axios.get(
          `${API_CONFIG.BASE_URL}/api/quantify/history?page=1&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        tradeHistory = historyRes.data.history || [];
        // console.log('Fetched trade history records:', tradeHistory.length);
      } catch (err) {
        // console.log('Quantify history not available');
      }
      
      // Process and combine all transaction data
      const allTransactions = [];
      
      // Add withdrawal requests
      withdrawalData.forEach(request => {
        allTransactions.push({
          type: 'Withdraw',
          amount: `-${request.amount.toFixed(2)}`,
          date: new Date(request.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          status: request.status,
          source: 'withdrawal',
          fee: request.handlingFee?.amount || 0,
          actualReceipt: request.handlingFee?.actualReceipt || 0
        });
      });
      
      // Add deposit records
      depositData.forEach(deposit => {
        allTransactions.push({
          type: 'Recharge',
          amount: `+${deposit.amount.toFixed(2)}`,
          date: new Date(deposit.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          status: deposit.status,
          source: 'deposit',
          utr: deposit.utrNumber
        });
      });
      
      // Add historical trade records from quantify history
      tradeHistory.forEach(record => {
        if (record.todayEarning > 0) {
          allTransactions.push({
            type: 'Trade',
            amount: `+${record.todayEarning.toFixed(2)}`,
            date: new Date(record.date).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }),
            status: 'completed',
            source: 'quantify',
            description: `Daily Quantify Earning - ${new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          });
        }
      });
      
      // Add reward records from tasks
      rewardHistory.forEach(reward => {
        allTransactions.push({
          type: 'Reward',
          amount: `+${reward.amount.toFixed(2)}`,
          date: new Date(reward.completedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          status: 'completed',
          source: 'task',
          description: `${reward.taskTitle} - ${reward.taskType} Task`
        });
      });
      
      // Add referral reward records
      referralRewards.forEach(referral => {
        allTransactions.push({
          type: 'Reward',
          amount: `+${referral.amount.toFixed(2)}`,
          date: referral.completedAt.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          status: 'completed',
          source: 'referral',
          description: `Referral Reward - ${referral.refereeName} (${referral.refereePhone})`
        });
      });
      
      // Also add today's earning if quantifying is currently active
      let todayEarning = 0;
      try {
        const quantifyRes = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/user/${savedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        todayEarning = quantifyRes.data.todayEarning || 0;
        const isQuantifying = quantifyRes.data.isQuantifying || false;
        
        // Add today's earning if quantifying is active and not already in history
        if (isQuantifying && todayEarning > 0) {
          const today = new Date().toDateString();
          const hasTodayRecord = tradeHistory.some(record => 
            new Date(record.date).toDateString() === today
          );
          
          // Only add if today's record doesn't already exist in history
          if (!hasTodayRecord) {
            allTransactions.push({
              type: 'Trade',
              amount: `+${todayEarning.toFixed(2)}`,
              date: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }),
              status: 'completed',
              source: 'quantify',
              description: "Today's Active Quantify Earning"
            });
          }
        }
      } catch (err) {
        // console.log('Current quantify data not available');
      }
      
      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTransactions(allTransactions);
      
    } catch (error) {
      // console.error('Error fetching transaction data:', error);
      // Fallback to demo data on error
      setTransactions(getDemoData());
    } finally {
      setLoading(false);
    }
  }, []);

  // Demo data as fallback
  const getDemoData = () => {
    return [
      { type: 'Withdraw', amount: '-426.91', date: 'Nov 11 2024 07:03:50 am', status: 'pending', source: 'withdrawal' },
      { type: 'Recharge', amount: '+1000.00', date: 'Nov 10 2024 02:15:20 pm', status: 'approved', source: 'deposit' },
      { type: 'Withdraw', amount: '-900.40', date: 'Nov 07 2024 08:27:20 am', status: 'approved', source: 'withdrawal' },
      { type: 'Trade', amount: '+50.25', date: 'Nov 05 2024 11:45:10 am', status: 'completed', source: 'quantify' },
    ];
  };

  const handleSelect = (option) => {
    setSelected(option);
  };

  // Filter transactions based on selected tab
  const filteredTransactions = Array.isArray(transactions) 
    ? (selected === 'All' 
      ? transactions 
      : transactions.filter(transaction => 
          selected === 'Withdraw' ? transaction.type === 'Withdraw' :
          selected === 'Recharge' ? transaction.type === 'Recharge' :
          selected === 'Trade' ? transaction.type === 'Trade' :
          selected === 'Reward' ? transaction.type === 'Reward' : false
        ))
    : [];

  useEffect(() => {
    fetchTransactionData();
  }, [fetchTransactionData]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#101821]">
      <div className='sticky top-0 z-50 w-full'>
        <div className='h-14 bg-[#312c42] flex justify-center items-center'>
          <span className='text-xl opacity-65 text-white'>Fund</span>
        </div>
        <div className='absolute top-4 left-5 cursor-pointer text-white' onClick={() => { navigate(-1) }}>
          <ChevronLeft className='opacity-65' />
        </div>
      </div>

      <div className='w-full px-4'>
        <div className='flex flex-row justify-between mt-6 mb-8 overflow-x-auto no-scrollbar gap-1'>
          {['All', 'Trade', 'Reward', 'Withdraw', 'Recharge'].map((tab) => (
            <div
              key={tab}
              onClick={() => handleSelect(tab)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selected === tab 
                ? 'bg-[#183439] text-[#49bace] ring-2 ring-[#49bace]' 
                : 'text-slate-400'
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* ── SKELETON replaces spinner ── */}
        {loading ? (
          <SkeletonCard />
        ) : (
          <div className="space-y-4">
            <div className="bg-[#212431] rounded-3xl p-5 border border-gray-800 shadow-2xl">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item, index) => (
                  <div key={index} className={`${index !== 0 ? 'border-t border-gray-700/50 mt-4 pt-4' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-lg font-medium">{item.type}</span>
                        {item.source === 'withdrawal' && (
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                            item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            item.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {item.status}
                          </span>
                        )}
                        {item.source === 'deposit' && (
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                            item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            item.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      <span className={`text-lg font-bold ${item.amount.startsWith('+') ? 'text-green-500' : 'text-gray-400'}`}>
                        {item.amount}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {item.date}
                    </div>
                    {item.source === 'withdrawal' && (
                      <div className="text-[10px] text-gray-600 mt-1">
                        Fee: ₹{item.fee?.toFixed(2) || '0.00'} • Receipt: ₹{item.actualReceipt?.toFixed(2) || '0.00'}
                      </div>
                    )}
                    {item.source === 'deposit' && item.utr && (
                      <div className="text-[10px] text-gray-600 mt-1">
                        UTR: {item.utr}
                      </div>
                    )}
                    {item.source === 'quantify' && item.description && (
                      <div className="text-[10px] text-gray-600 mt-1">
                        {item.description}
                      </div>
                    )}
                    {item.source === 'task' && item.description && (
                      <div className="text-[10px] text-gray-600 mt-1">
                        {item.description}
                      </div>
                    )}
                    {item.source === 'referral' && item.description && (
                      <div className="text-[10px] text-emerald-600 mt-1 font-medium">
                        🎉 {item.description}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm mb-2">No {selected.toLowerCase()} records found</div>
                  <div className="text-xs">Make your first transaction to see it here</div>
                </div>
              )}
            </div>
            <div className="text-center text-gray-600 text-sm py-8">
              {transactions.length > 0 ? 'No more records' : 'No transaction history yet'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Record;