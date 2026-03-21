import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, Landmark, History, Search, 
  ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  LayoutDashboard, Wallet, Banknote, Settings, 
  Bell, Menu, X, MoreVertical, CheckCircle2, AlertCircle, 
  Clock, DollarSign, Activity, TrendingUp 
} from 'lucide-react';
import { API_CONFIG } from '../config/apiConfig';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bankDetails, setBankDetails] = useState([]);
  const [quantifyHistory, setQuantifyHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate demo bank data
  const generateDemoBankData = () => {
    const demoData = [
      {
        _id: 'demo1',
        userId: { name: 'Rajesh Kumar', phone: '+91 98765 43210' },
        accountHolder: 'Rajesh Kumar',
        accountNumber: '123456789012',
        ifsc: 'HDFC0001234',
        bankName: 'HDFC Bank',
        status: 'Verified',
        submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        verifiedAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
      },
      {
        _id: 'demo2',
        userId: { name: 'Priya Sharma', phone: '+91 87654 32109' },
        accountHolder: 'Priya Sharma',
        accountNumber: '987654321098',
        ifsc: 'ICIC0005678',
        bankName: 'ICICI Bank',
        status: 'Pending',
        submittedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        _id: 'demo3',
        userId: { name: 'Amit Patel', phone: '+91 76543 21098' },
        accountHolder: 'Amit Patel',
        accountNumber: '456789012345',
        ifsc: 'SBIN0009012',
        bankName: 'State Bank of India',
        status: 'Rejected',
        submittedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        verifiedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        _id: 'demo4',
        userId: { name: 'Sneha Gupta', phone: '+91 65432 10987' },
        accountHolder: 'Sneha Gupta',
        accountNumber: '234567890123',
        ifsc: 'AXIS0003456',
        bankName: 'Axis Bank',
        status: 'Pending',
        submittedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        _id: 'demo5',
        userId: { name: 'Vikram Singh', phone: '+91 54321 09876' },
        accountHolder: 'Vikram Singh',
        accountNumber: '678901234567',
        ifsc: 'PNB0007890',
        bankName: 'Punjab National Bank',
        status: 'Verified',
        submittedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        verifiedAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ];
    return demoData;
  };

  // Clear bank details manually (show demo data instead)
  const clearBankDetails = () => {
    setBankDetails(generateDemoBankData());
    // console.log('Bank details reset to demo data');
  };

  // Fetch bank details when bank tab is active
  useEffect(() => {
    if (activeTab === 'bank') {
      // console.log('Bank tab activated, fetching data...');
      fetchBankDetails();
    }
  }, [activeTab]);

  // Fetch quantify history when quantify tab is active
  useEffect(() => {
    if (activeTab === 'quantify') {
      // console.log('Quantify tab activated, fetching data...');
      fetchQuantifyHistory();
    }
  }, [activeTab]);

  // Also fetch on component mount if already on bank tab
  useEffect(() => {
    if (activeTab === 'bank') {
      // console.log('Component mounted on bank tab, fetching data...');
      fetchBankDetails();
    }
  }, []);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      // Try to get admin token from localStorage
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // Check if we have a valid token
      if (!token) {
        console.error('No admin token found');
        // Use demo data when no token
        setBankDetails(generateDemoBankData());
        setLoading(false);
        return;
      }
      
      // console.log('Fetching bank details with token:', token.substring(0, 10) + '...');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/bank/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // console.log('Response status:', response.status);
      const data = await response.json();
      // console.log('Received data:', data);
      
      if(response.status === 403) {
        console.error('Access denied - admin privileges required. Showing demo data instead.');
        // Use demo data when access denied
        setBankDetails(generateDemoBankData());
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        const banks = data.banks || [];
        if (banks.length === 0) {
          // No real data, use demo data
          // console.log('No real bank data found, showing demo data');
          setBankDetails(generateDemoBankData());
        } else {
          setBankDetails(banks);
          // console.log('Bank details set to real data:', banks);
        }
      } else {
        console.error('API Error:', data.message);
        // Use demo data on API error
        setBankDetails(generateDemoBankData());
      }
    } catch (err) {
      console.error('Network Error fetching bank details:', err);
      // Use demo data on network error
      setBankDetails(generateDemoBankData());
    } finally {
      setLoading(false);
    }
  };

  const fetchQuantifyHistory = async () => {
    setLoading(true);
    try {
      // Try to get admin token from localStorage
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // Check if we have a valid token
      if (!token) {
        console.error('No admin token found');
        // Use demo data when no token
        setQuantifyHistory(generateDemoQuantifyData());
        setLoading(false);
        return;
      }
      
      // console.log('Fetching quantify history with token:', token.substring(0, 10) + '...');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quantify/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // console.log('Response status:', response.status);
      const data = await response.json();
      // console.log('Received quantify data:', data);
      
      if(response.status === 403) {
        console.error('Access denied - admin privileges required. Showing demo data instead.');
        // Use demo data when access denied
        setQuantifyHistory(generateDemoQuantifyData());
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        const history = data.history || [];
        if (history.length === 0) {
          // No real data, use demo data
          // console.log('No real quantify data found, showing demo data');
          setQuantifyHistory(generateDemoQuantifyData());
        } else {
          setQuantifyHistory(history);
          // console.log('Quantify history set to real data:', history);
        }
      } else {
        console.error('API Error:', data.message);
        // Use demo data on API error
        setQuantifyHistory(generateDemoQuantifyData());
      }
    } catch (err) {
      console.error('Network Error fetching quantify history:', err);
      // Use demo data on network error
      setQuantifyHistory(generateDemoQuantifyData());
    } finally {
      setLoading(false);
    }
  };

  // Generate demo quantify data
  const generateDemoQuantifyData = () => {
    const demoData = [
      {
        _id: 'demo1',
        userId: { name: 'Rajesh Kumar', phone: '+91 98765 43210' },
        balance: 5000,
        approvedDepositAmount: 10000,
        todayEarning: 900,
        totalRevenue: 15900,
        isQuantifying: true,
        quantifyingStartTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        lastUpdated: new Date().toISOString()
      },
      {
        _id: 'demo2',
        userId: { name: 'Priya Sharma', phone: '+91 87654 32109' },
        balance: 3000,
        approvedDepositAmount: 7500,
        todayEarning: 630,
        totalRevenue: 11130,
        isQuantifying: false,
        quantifyingStartTime: null,
        lastUpdated: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        _id: 'demo3',
        userId: { name: 'Amit Patel', phone: '+91 76543 21098' },
        balance: 8000,
        approvedDepositAmount: 15000,
        todayEarning: 1380,
        totalRevenue: 24380,
        isQuantifying: true,
        quantifyingStartTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        lastUpdated: new Date().toISOString()
      },
      {
        _id: 'demo4',
        userId: { name: 'Sneha Gupta', phone: '+91 65432 10987' },
        balance: 2500,
        approvedDepositAmount: 5000,
        todayEarning: 450,
        totalRevenue: 7950,
        isQuantifying: false,
        quantifyingStartTime: null,
        lastUpdated: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];
    return demoData;
  };

  const updateBankStatus = async (bankId, status) => {
    try {
      const token = localStorage.getItem('adminToken') || 'your_admin_token_here';
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/bank/${bankId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        // Update local state
        setBankDetails(bankDetails.map(bank => 
          bank._id === bankId ? { ...bank, status, verifiedAt: status === 'Verified' ? new Date() : bank.verifiedAt } : bank
        ));
      } else {
        console.error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating bank status:', err);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'deposits', label: 'Deposits', icon: ArrowUpRight },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownLeft },
    { id: 'quantify', label: 'Quantify History', icon: Activity },
    { id: 'bank', label: 'Bank Details', icon: Landmark },
    { id: 'recharge', label: 'Wallet Recharge', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Platform Volume', value: '₹12.8M', change: '+14%', icon: Banknote, trend: 'up' },
    { label: 'Active Users', value: '8,432', change: '+2.5%', icon: Users, trend: 'up' },
    { label: 'Pending Requests', value: '42', change: '-5', icon: Bell, trend: 'down' },
    { label: 'System Health', value: '99.9%', change: 'Optimal', icon: ShieldCheck, trend: 'neutral' },
  ];

  const renderQuantifyHistory = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-3xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white">Quantify History</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setQuantifyHistory(generateDemoQuantifyData())}
              className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all"
            >
              Load Demo Data
            </button>
            <button 
              onClick={fetchQuantifyHistory}
              className="px-4 py-2 bg-[#49bace] text-[#101821] font-bold rounded-xl text-sm hover:scale-105 transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bace]"></div>
          </div>
        ) : quantifyHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#49bace]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Activity size={40} className="text-[#49bace]" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">No Data Available</h4>
            <p className="text-gray-500">Unable to load quantify history. Please try again.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Balance</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Deposit Amount</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Today's Earning</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Total Revenue</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {quantifyHistory.map((record) => (
                  <tr key={record._id} className="border-b border-gray-800/50 hover:bg-[#101821]/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white font-medium">{record.userId?.name || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">{record.userId?.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white">₹{record.balance?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 px-4 text-white">₹{record.approvedDepositAmount?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 px-4 text-emerald-400 font-bold">₹{record.todayEarning?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 px-4 text-cyan-400 font-bold">₹{record.totalRevenue?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        record.isQuantifying ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {record.isQuantifying ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {record.lastUpdated ? new Date(record.lastUpdated).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-3xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white">Bank Details Management</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setBankDetails(generateDemoBankData())}
              className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all"
            >
              Load Demo Data
            </button>
            <button 
              onClick={clearBankDetails}
              className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all"
            >
              Reset Data
            </button>
            <button 
              onClick={fetchBankDetails}
              className="px-4 py-2 bg-[#49bace] text-[#101821] font-bold rounded-xl text-sm hover:scale-105 transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bace]"></div>
          </div>
        ) : bankDetails.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#49bace]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Landmark size={40} className="text-[#49bace]" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">No Data Available</h4>
            <p className="text-gray-500">Unable to load bank details. Please try again.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Account Holder</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Bank Name</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Account Number</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">IFSC</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Submitted</th>
                  <th className="text-left py-4 px-4 text-gray-500 font-bold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bankDetails.map((bank) => (
                  <tr key={bank._id} className="border-b border-gray-800/50 hover:bg-[#101821]/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white font-medium">{bank.userId?.name || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">{bank.userId?.phone || bank.userId?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white">{bank.accountHolder}</td>
                    <td className="py-4 px-4 text-white">{bank.bankName || 'N/A'}</td>
                    <td className="py-4 px-4 text-white">
                      {bank.accountNumber.replace(/.(?=.{4})/g, '*')}
                    </td>
                    <td className="py-4 px-4 text-white">{bank.ifsc}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        bank.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' :
                        bank.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {bank.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {new Date(bank.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        {bank.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => updateBankStatus(bank._id, 'Verified')}
                              className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"
                              title="Verify"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button 
                              onClick={() => updateBankStatus(bank._id, 'Rejected')}
                              className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {bank.status === 'Verified' && (
                          <span className="text-emerald-400 text-sm font-bold">Verified</span>
                        )}
                        {bank.status === 'Rejected' && (
                          <span className="text-rose-400 text-sm font-bold">Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#1a1f2e] border border-gray-800/50 rounded-3xl p-6 shadow-xl hover:border-[#49bace]/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#49bace]/10 rounded-2xl group-hover:bg-[#49bace]/20 transition-colors">
                <s.icon size={24} className="text-[#49bace]" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                s.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
                s.trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-500/10 text-gray-400'
              }`}>
                {s.change}
              </span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart/Table Area */}
        <div className="lg:col-span-2 bg-[#1a1f2e] border border-gray-800/50 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
            <button className="text-[#49bace] text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {[
              { uid: '775383', user: 'Member_X', type: 'Deposit', amount: '₹5,000', status: 'Completed', time: '12:45 PM' },
              { uid: '775384', user: 'Trader_A', type: 'Withdraw', amount: '₹1,200', status: 'Pending', time: '01:10 PM' },
              { uid: '775385', user: 'Crypto_K', type: 'Deposit', amount: '₹10,000', status: 'Processing', time: '01:30 PM' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#101821] rounded-3xl border border-gray-800/30 hover:border-[#49bace]/20 transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${t.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {t.type === 'Deposit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.user}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">UID: {t.uid} • {t.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${t.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.type === 'Deposit' ? '+' : '-'}{t.amount}</p>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                    t.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Info Cards */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-[#49bace] to-[#2a8ba1] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <ShieldCheck size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <h4 className="text-lg font-bold mb-2">Security Audit</h4>
            <p className="text-sm text-white/80 mb-6 font-medium leading-relaxed">System scan completed. All 128 nodes are verified and encrypted.</p>
            <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all">Generate Report</button>
          </div>

          <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-[2.5rem] p-8 shadow-2xl">
            <h4 className="font-bold text-white mb-6">Pending Verifications</h4>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#101821] rounded-2xl border border-gray-800/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#49bace] font-bold">U</div>
                    <div>
                      <p className="text-xs font-bold text-white">KYC Verification</p>
                      <p className="text-[9px] text-gray-500 uppercase">UID: 882193</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><CheckCircle2 size={16} /></button>
                    <button className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg"><X size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0f16] font-sans">
      {/* Sidebar - Desktop */}
      <aside className={`fixed lg:relative z-50 w-72 h-screen bg-[#101821] border-r border-gray-800/50 transition-all duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center space-x-3 mb-12">
            <div className="p-2.5 bg-[#49bace] rounded-2xl shadow-[0_0_20px_rgba(73,186,206,0.4)]">
              <ShieldCheck size={28} className="text-[#101821]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">Admin<br/><span className="text-[#49bace]">CORE</span></h1>
            </div>
          </div>

          <nav className="flex-grow space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                  ? 'bg-[#49bace]/10 text-[#49bace] shadow-lg shadow-black/20' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-6 bg-[#1a1f2e] rounded-[2rem] border border-gray-800/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#49bace] rounded-full flex items-center justify-center font-black text-[#101821]">AD</div>
              <div>
                <p className="text-xs font-bold text-white uppercase">Root Admin</p>
                <p className="text-[10px] text-gray-500">System Secure</p>
              </div>
            </div>
            <button className="w-full py-2.5 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all">Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-screen overflow-auto">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 bg-[#0a0f16]/80 backdrop-blur-xl border-b border-gray-800/50 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-6 flex-grow max-w-2xl">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex-grow relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#49bace] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Global System Search (UID, TXID, Phone)..." 
                className="w-full bg-[#1a1f2e] border border-gray-800/50 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#49bace]/50 transition-all placeholder:text-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-8">
            <button className="p-3 bg-[#1a1f2e] text-gray-400 hover:text-white rounded-2xl border border-gray-800/50 relative transition-all">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-[#49bace] rounded-full shadow-[0_0_10px_#49bace]"></span>
            </button>
            <div className="h-10 w-[1px] bg-gray-800 mx-2"></div>
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white group-hover:text-[#49bace] transition-colors">Super User</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Master Key Active</p>
              </div>
              <MoreVertical size={20} className="text-gray-500" />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full pb-24">
          <div className="mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#49bace] mb-2">Internal Management</h2>
            <h1 className="text-4xl font-black text-white capitalize tracking-tighter">
              System <span className="text-[#49bace] opacity-50">/</span> {activeTab}
            </h1>
          </div>

          {activeTab === 'dashboard' ? renderDashboard() : 
           activeTab === 'bank' ? renderBankDetails() : 
           activeTab === 'quantify' ? renderQuantifyHistory() : (
            <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-[2.5rem] p-12 text-center shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-[#49bace]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-[#49bace]" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{activeTab} View</h2>
              <p className="text-gray-500 text-sm font-medium mb-8 max-w-sm mx-auto">This module is currently initializing. Visual components and data streams will be connected shortly.</p>
              <button onClick={() => setActiveTab('dashboard')} className="px-8 py-3 bg-[#49bace] text-[#101821] font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#49bace]/20">Return to CORE</button>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-500"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminPanel;

