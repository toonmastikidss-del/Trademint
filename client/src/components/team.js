import React, { useState, useEffect } from 'react'
import { Slash, ChevronLeft, Users, TrendingUp, Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_CONFIG } from '../config/apiConfig'

const Team = () => {
  const [selected, setSelected] = useState('L1');
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0
  });

  // Fetch referrals and stats
  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Fetching referral stats...');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/referral/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Referral stats:', response.data);
      
      setReferrals(response.data.referrals || []);
      setStats({
        totalReferrals: response.data.totalReferrals || 0,
        activeReferrals: response.data.completedReferrals || 0,
        totalEarnings: response.data.totalRewards || 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching referrals:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
    
    // Auto-refresh every 3 seconds for real-time updates
    const interval = setInterval(fetchReferrals, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
  }

  // Filter referrals based on selected level (L1, L2, L3)
  const filteredReferrals = referrals.filter(ref => {
    if (selected === 'L1') return true; // Direct referrals
    if (selected === 'L2') return false; // Level 2 (not implemented yet)
    if (selected === 'L3') return false; // Level 3 (not implemented yet)
    return true;
  });

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#101821] pb-24">
      <div className='sticky top-0 z-50 w-full'>
        <div className='h-14 bg-[#312c42] flex justify-center items-center'>
          <span className='text-xl opacity-65 text-white'>Team</span>
        </div>
        <div className='absolute top-4 left-5 cursor-pointer text-white' onClick={() => { navigate(-1) }}>
          <ChevronLeft className='opacity-65' />
        </div>
      </div>

      <div className='mx-5 w-[90%]'>
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-[#49bace] to-emerald-500 rounded-2xl p-4 mb-4 mt-5 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-white" />
              <div>
                <p className="text-white/80 text-xs font-bold">TOTAL TEAM</p>
                <p className="text-white text-2xl font-black">{stats.totalReferrals}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-white" />
              <div>
                <p className="text-white/80 text-xs font-bold">ACTIVE</p>
                <p className="text-white text-2xl font-black">{stats.activeReferrals}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Gift className="w-6 h-6 text-white" />
              <div>
                <p className="text-white/80 text-xs font-bold">EARNINGS</p>
                <p className="text-white text-xl font-black">₹{stats.totalEarnings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Selector */}
        <div className='bg-slate-800 py-5 rounded-xl w-full flex flex-row justify-around mt-5'>
        <div
          className="text-center text-white p-2">
          <Slash color='skyblue' className="mb-2 -rotate-12" />  L1
        </div>
        <div
          className="text-center text-white p-2">
          <Slash color='skyblue' className="mb-2 -rotate-12" /> L2
        </div>
        <div
          className="text-center text-white p-2">
          <Slash color='skyblue' className="mb-2 -rotate-12" /> L3
        </div>
      </div>

      <div className='flex w-full justify-around px-2 mt-6'>
        <div
          className={`px-12 h-10 flex items-center rounded-xl ${selected === 'L1' ? 'bg-[#183439] text-[#49bace] outline-[#49bace]' : 'text-slate-200'}`}
          style={selected === 'L1' ? { outline: '2px solid #49bace' } : {}}
          onClick={() => handleSelect('L1')}
        >
          L1</div>
        <div
          className={`px-12 h-10 flex items-center rounded-xl ${selected === 'L2' ? 'bg-[#183439] text-[#49bace]' : 'text-slate-200'}`}
          style={selected === 'L2' ? { outline: '2px solid #49bace' } : {}}
          onClick={() => handleSelect('L2')}
        >
          L2</div>
        <div
          className={`px-12 h-10 flex items-center rounded-xl ${selected === 'L3' ? 'bg-[#183439] text-[#49bace]' : 'text-slate-200'}`}
          style={selected === 'L3' ? { outline: '2px solid #49bace' } : {}}
          onClick={() => handleSelect('L3')}
        >
          L3</div>
      </div>

      {/* Referral List */}
      <div className="w-full mt-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bace]"></div>
          </div>
        ) : filteredReferrals.length > 0 ? (
          filteredReferrals.map((ref, index) => (
            <div key={index} className="bg-[#212431] border border-gray-700 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#49bace] to-emerald-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{ref.refereeId?.name || `User ${ref.refereeId?._id?.slice(-4) || 'Unknown'}`}</p>
                    <p className="text-gray-400 text-xs">{ref.refereeId?.phone || 'Joined via referral'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ref.status === 'rewarded' || ref.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {ref.status === 'rewarded' ? 'COMPLETED' : ref.status === 'completed' ? 'ACTIVE' : 'PENDING'}
                  </div>
                  {ref.rewardGiven && (
                    <p className="text-[#49bace] text-xs font-bold mt-1">+₹{ref.rewardAmount}</p>
                  )}
                  <p className="text-gray-500 text-[10px] mt-1">
                    {new Date(ref.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#212431] border border-gray-700 rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-bold mb-2">No team members yet</p>
            <p className="text-gray-500 text-sm">Share your referral code to build your team!</p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default Team