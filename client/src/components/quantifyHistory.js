import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Calendar, TrendingUp, Clock, IndianRupee } from 'lucide-react';
import { API_CONFIG } from '../config/apiConfig';

const QuantifyHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !savedUser) {
          navigate('/login');
          return;
        }

        setUser(savedUser);

        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/api/quantify/history?page=${pagination.currentPage}&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setHistory(response.data.history || []);
        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalRecords: response.data.totalRecords || 0,
          hasNext: (response.data.currentPage || 1) < (response.data.totalPages || 1),
          hasPrev: (response.data.currentPage || 1) > 1
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history data');
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate, pagination.currentPage]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (isQuantifying) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        isQuantifying 
          ? 'bg-emerald-500/20 text-emerald-400' 
          : 'bg-gray-500/20 text-gray-400'
      }`}>
        {isQuantifying ? 'ACTIVE' : 'COMPLETED'}
      </span>
    );
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  if (loading) {
    return (
      <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">
        <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
          <button onClick={() => navigate('/mine')} className="p-1">
          <button onClick={() => window.history.back()} className='p-1'>
          </button>
          <h1 className="text-lg font-bold tracking-tight">Quantify History</h1>
          <div className="w-6"></div>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bace]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => navigate('/mine')} className="p-1">
        <button onClick={() => window.history.back()} className='p-1'>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Quantify History</h1>
        <div className="w-6"></div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#212431] border border-gray-700 p-4 rounded-2xl">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-gray-400">TOTAL SESSIONS</span>
            </div>
            <span className="text-xl font-black text-white">{pagination.totalRecords}</span>
          </div>
          
          <div className="bg-[#212431] border border-gray-700 p-4 rounded-2xl">
            <div className="flex items-center space-x-2 mb-2">
              <IndianRupee size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-gray-400">TOTAL EARNED</span>
            </div>
            <span className="text-xl font-black text-white">
              ₹{history.reduce((sum, record) => sum + (record.todayEarning || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="bg-[#212431] border border-gray-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-500" />
              </div>
              <h3 className="text-white font-bold mb-2">No History Yet</h3>
              <p className="text-gray-500 text-sm">Start quantifying to see your history here</p>
            </div>
          ) : (
            history.map((record, index) => (
              <div key={index} className="bg-[#212431] border border-gray-700 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{formatDate(record.date)}</h3>
                    <p className="text-gray-400 text-sm">Session Details</p>
                  </div>
                  {getStatusBadge(record.isQuantifying)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#1a1f2e] rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <IndianRupee size={14} className="text-emerald-400" />
                      <span className="text-xs text-gray-400">Earning</span>
                    </div>
                    <span className="text-lg font-bold text-white">₹{record.todayEarning?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  <div className="bg-[#1a1f2e] rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp size={14} className="text-amber-400" />
                      <span className="text-xs text-gray-400">Total Revenue</span>
                    </div>
                    <span className="text-lg font-bold text-white">₹{record.totalRevenue?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1f2e] rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock size={14} className="text-blue-400" />
                      <span className="text-xs text-gray-400">Duration</span>
                    </div>
                    <span className="text-sm font-bold text-white">{formatDuration(record.sessionDuration || 0)}</span>
                  </div>
                  
                  <div className="bg-[#1a1f2e] rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar size={14} className="text-purple-400" />
                      <span className="text-xs text-gray-400">Balance</span>
                    </div>
                    <span className="text-sm font-bold text-white">₹{record.balance?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                {record.quantifyingStartTime && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500">
                      <p>Started: {formatTime(record.quantifyingStartTime)}</p>
                      {record.quantifyingEndTime && (
                        <p>Ended: {formatTime(record.quantifyingEndTime)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center bg-[#212431] border border-gray-700 rounded-2xl p-4">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${
                pagination.hasPrev
                  ? 'bg-[#49bace] text-[#101821] hover:scale-[1.02]'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              } transition-all`}
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${
                pagination.hasNext
                  ? 'bg-[#49bace] text-[#101821] hover:scale-[1.02]'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              } transition-all`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantifyHistory;
