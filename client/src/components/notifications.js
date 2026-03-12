import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Bell, Calendar, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { API_CONFIG } from '../config/apiConfig';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Fetch recent deposits for real notifications
        const depositRes = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit/history/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const deposits = depositRes.data.history || [];
        
        // Create notifications from real deposits (last 5)
        const depositNotifications = deposits.slice(0, 5).map((deposit, index) => ({
          id: `deposit-${deposit._id}`,
          title: deposit.status === 'approved' ? 'Deposit Successful' : 
                 deposit.status === 'pending' ? 'Deposit Pending' : 'Deposit Failed',
          desc: `₹${deposit.amount} ${deposit.status === 'approved' ? 'has been added to your wallet' : 
                deposit.status === 'pending' ? 'is under verification' : 'was not processed'}`,
          time: getTimeAgo(new Date(deposit.createdAt)),
          type: deposit.status === 'approved' ? 'success' : 
                deposit.status === 'pending' ? 'warning' : 'error',
          unread: index === 0 // First one is unread
        }));
        
        // Add system notifications
        const systemNotifications = [
          {
            id: 'system-1',
            title: 'Daily Quantify Reminder',
            desc: 'Start your daily quantify session to earn 6% returns on your balance!',
            time: '2h ago',
            type: 'reminder',
            unread: true
          },
          {
            id: 'system-2',
            title: 'Platform Update',
            desc: 'New features added! Check out the improved withdrawal process and agent program.',
            time: '1d ago',
            type: 'update',
            unread: false
          },
          {
            id: 'system-3',
            title: 'Refer & Earn',
            desc: 'Invite friends and earn ₹50 for each successful referral. Unlimited earning potential!',
            time: '3d ago',
            type: 'promo',
            unread: false
          }
        ];
        
        // Combine all notifications
        const allNotifications = [...depositNotifications, ...systemNotifications];
        setNotifications(allNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to system notifications only
        setNotifications([
          {
            id: 'system-1',
            title: 'Daily Quantify Reminder',
            desc: 'Start your daily quantify session to earn 6% returns!',
            time: '2h ago',
            type: 'reminder',
            unread: true
          },
          {
            id: 'system-2',
            title: 'Platform Update',
            desc: 'New features added! Check them out now.',
            time: '1d ago',
            type: 'update',
            unread: false
          }
        ]);
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'success': return 'text-emerald-400 bg-emerald-500/10';
      case 'warning': return 'text-amber-400 bg-amber-500/10';
      case 'error': return 'text-rose-400 bg-rose-500/10';
      case 'reminder': return 'text-[#49bace] bg-[#49bace]/10';
      case 'update': return 'text-blue-400 bg-blue-500/10';
      case 'promo': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Bell;
    }
  };

  return (
    <div className="bg-[#101821] min-h-screen text-white font-sans pb-10">
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center">
          <button onClick={() => navigate('/mine')} className="p-1">
            <ChevronLeft size={24} className="text-gray-300" />
          </button>
          <h1 className="text-lg font-bold ml-4">Notifications</h1>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-[#49bace] bg-[#49bace]/10 px-3 py-1.5 rounded-full border border-[#49bace]/20">Mark All Read</button>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        ) : (
          notifications.map((n) => {
            const IconComponent = getIcon(n.type);
            return (
              <div key={n.id} className={`bg-[#212431] border border-gray-700 p-5 rounded-[1.5rem] relative shadow-xl active:bg-[#2a2d3d] transition-all cursor-pointer ${n.unread ? 'ring-1 ring-[#49bace]/30' : ''}`}>
                {n.unread && (
                  <span className="absolute top-5 right-5 w-2 h-2 bg-[#49bace] rounded-full shadow-[0_0_8px_#49bace]"></span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl flex-shrink-0 border border-white/5 ${getIconColor(n.type)}`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-bold truncate ${n.unread ? 'text-white' : 'text-gray-400'}`}>{n.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">{n.desc}</p>
                    <div className="flex items-center text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                      <Calendar size={12} className="mr-1" />
                      {n.time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="py-8 text-center">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">End of Notifications</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
