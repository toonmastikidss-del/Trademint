import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Calendar, TrendingUp, Clock, IndianRupee } from 'lucide-react';
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

const HistorySkeleton = () => (
  <>
    <style>{shimmerCSS}</style>
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[1, 2].map(i => (
        <div key={i} className="bg-[#212431] border border-gray-700 p-4 rounded-2xl space-y-2">
          <div className="sk w-24 h-3" />
          <div className="sk w-16 h-6" />
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[#212431] border border-gray-700 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="sk w-32 h-5" />
              <div className="sk w-20 h-3" />
            </div>
            <div className="sk w-20 h-6 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="bg-[#1a1f2e] rounded-xl p-3 space-y-2">
                <div className="sk w-16 h-3" />
                <div className="sk w-24 h-5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </>
);

// ─── Component ────────────────────────────────────────────────────────────────

const QuantifyHistory = () => {
  const navigate = useNavigate();

  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [pagination, setPagination] = useState({
    currentPage:  1,
    totalPages:   1,
    totalRecords: 0,
    hasNext:      false,
    hasPrev:      false,
  });

  // ── Ref flags to prevent StrictMode double-fetch ──────────────────────────
  // React StrictMode (development) intentionally runs useEffect twice to
  // detect side effects. This ref acts as a "already fetched" guard.
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // ─── Core fetch function ──────────────────────────────────────────────────
  const fetchHistory = async (page = 1, force = false) => {
    // Prevent duplicate calls
    if (isFetchingRef.current && !force) return;
    isFetchingRef.current = true;

    setLoading(true);
    setError('');

    try {
      const token     = localStorage.getItem('token');
      const savedUser = JSON.parse(localStorage.getItem('user') || 'null');

      if (!token || !savedUser) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/quantify/history?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data        = response.data;
      const currentPage = data.currentPage  || 1;
      const totalPages  = data.totalPages   || 1;

      setHistory(data.history || []);
      setPagination({
        currentPage,
        totalPages,
        totalRecords: data.totalRecords || 0,
        hasNext:      currentPage < totalPages,
        hasPrev:      currentPage > 1,
      });

    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // ── Mount — runs once, StrictMode safe ───────────────────────────────────
  useEffect(() => {
    // hasFetchedRef prevents the second StrictMode call from firing
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchHistory(1);
  }, []);

  // ── Page change ───────────────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    fetchHistory(newPage, true); // force = true bypasses isFetchingRef
  };

  // ── Field helpers — backend QuantifyHistory model fields ─────────────────
  // Backend saves: earning, endingTotalRevenue, startingBalance, isQuantifyingActive
  // Wrong old names: todayEarning, totalRevenue, balance, isQuantifying
  // Using ?? to support both old and new field names safely
  const getEarning      = (r) => r.earning            ?? r.todayEarning ?? 0;
  const getTotalRevenue = (r) => r.endingTotalRevenue  ?? r.totalRevenue ?? 0;
  const getBalance      = (r) => r.startingBalance     ?? r.balance      ?? 0;
  const getIsActive     = (r) => r.isQuantifyingActive ?? r.isQuantifying ?? false;

  const totalEarned = history.reduce((sum, r) => sum + getEarning(r), 0);

  // ── Formatters ────────────────────────────────────────────────────────────
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'Full day';
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const getStatusBadge = (record) => {
    const active = getIsActive(record);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
      }`}>
        {active ? 'ACTIVE' : 'COMPLETED'}
      </span>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => window.history.back()} className='p-1'>
          <ChevronLeft size={24} color="#fff" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Quantify History</h1>
        <div className="w-6" />
      </div>

      <div className="px-4 mt-6 space-y-6">

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center">
            <p className="text-rose-400 text-sm font-medium">{error}</p>
            <button
              onClick={() => fetchHistory(pagination.currentPage, true)}
              className="mt-2 text-xs text-[#49bace] font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Skeleton OR content */}
        {loading ? <HistorySkeleton /> : (
          <>
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
                <span className="text-xl font-black text-white">₹{totalEarned.toFixed(2)}</span>
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

                    {/* Card header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg">{formatDate(record.date)}</h3>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                            record.mode === 'current' ? 'bg-cyan-400' : 'bg-purple-400'
                          }`} />
                          {record.mode === 'current' ? 'Current Mode' : 'Continue Mode'}
                        </p>
                      </div>
                      {getStatusBadge(record)}
                    </div>

                    {/* Stats row 1 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#1a1f2e] rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <IndianRupee size={14} className="text-emerald-400" />
                          <span className="text-xs text-gray-400">Earning</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-400">
                          ₹{getEarning(record).toFixed(2)}
                        </span>
                      </div>

                      <div className="bg-[#1a1f2e] rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <TrendingUp size={14} className="text-amber-400" />
                          <span className="text-xs text-gray-400">Total Revenue</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          ₹{getTotalRevenue(record).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Stats row 2 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1a1f2e] rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock size={14} className="text-blue-400" />
                          <span className="text-xs text-gray-400">Duration</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {formatDuration(record.sessionDuration || 0)}
                        </span>
                      </div>

                      <div className="bg-[#1a1f2e] rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar size={14} className="text-purple-400" />
                          <span className="text-xs text-gray-400">Balance</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          ₹{getBalance(record).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Optional start/end time */}
                    {record.quantifyingStartTime && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="text-xs text-gray-500 space-y-1">
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
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    pagination.hasPrev
                      ? 'bg-[#49bace] text-[#101821] hover:scale-[1.02]'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>

                <span className="text-sm text-gray-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    pagination.hasNext
                      ? 'bg-[#49bace] text-[#101821] hover:scale-[1.02]'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuantifyHistory;