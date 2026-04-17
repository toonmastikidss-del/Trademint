import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import QRManagement from './components/QRManagement';
import { 
  Users, CreditCard, Landmark, History, Search, 
  ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  LayoutDashboard, Wallet, Banknote, Settings, 
  Bell, Menu, X, MoreVertical, CheckCircle2, AlertCircle,
  Sun, Moon, MessageSquare, Send, LogOut,
  Activity, TrendingUp, DollarSign, Clock,
  QrCode, ListTodo, Plus, Edit, Trash2, Eye, Download,
  CheckCircle, Check, RefreshCw, FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [supportChats, setSupportChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const notificationRef = useRef(null);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [userQuantifyHistory, setUserQuantifyHistory] = useState([]);
  const [loadingQuantifyHistory, setLoadingQuantifyHistory] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const [actionModal, setActionModal] = useState({ isOpen: false, user: null });
  const [depositActionModal, setDepositActionModal] = useState({ isOpen: false, depositId: null, action: null });
  const [deposits, setDeposits] = useState([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loadingWithdrawalRequests, setLoadingWithdrawalRequests] = useState(false);
  const [approvedWithdrawals, setApprovedWithdrawals] = useState([]); // New state for approved withdrawals
  const [loadingApprovedWithdrawals, setLoadingApprovedWithdrawals] = useState(false); // New loading state
  const [approvedDeposits, setApprovedDeposits] = useState([]); // New state for approved deposits
  const [loadingApprovedDeposits, setLoadingApprovedDeposits] = useState(false); // New loading state
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, deposit: null });
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [chartData, setChartData] = useState({ deposits: [], withdrawals: [], banks: [], kyc: [] });
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [userTasks, setUserTasks] = useState([]);
  const [loadingUserTasks, setLoadingUserTasks] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    reward: '',
    type: 'Daily',
    category: 'other',
    targetValue: '1'
  });
  
  // Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState({
    totalDeposits: 0,
    pendingDeposits: 0,
    approvedDeposits: 0,
    rejectedDeposits: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    rejectedWithdrawals: 0,
    totalBankRequests: 0,
    verifiedBanks: 0,
    pendingBanks: 0,
    totalUsers: 0,
    activeUsers: 0,
    kycPending: 0,
    kycApproved: 0,
    kycRejected: 0
  });
  
  // KYC States
  const [kycRequests, setKycRequests] = useState([]);
  const [loadingKycRequests, setLoadingKycRequests] = useState(false);
  const [kycDetailsModal, setKycDetailsModal] = useState({ isOpen: false, kyc: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [kycActionLoading, setKycActionLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [bankRequests, setBankRequests] = useState([]);
  
  const [loadingBankRequests, setLoadingBankRequests] = useState(false);



  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/task`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      setTasks(response.data);
    } catch (error) {
      // console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch Dashboard Statistics
  const fetchDashboardStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        // console.error('No admin token found');
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${adminToken}` };
      
      // Fetch all data in parallel with better error handling
      const depositsRes = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit/all`, { headers }).catch(err => {
        // console.error('Failed to fetch deposits:', err.response?.data || err.message);
        return { data: [] };
      });
      
      const withdrawalsRes = await axios.get(`${API_CONFIG.BASE_URL}/api/withdrawal/all`, { headers }).catch(err => {
        // console.error('Failed to fetch withdrawals:', err.response?.data || err.message);
        return { data: [] };
      });
      
      const banksRes = await axios.get(`${API_CONFIG.BASE_URL}/api/bank/all`, { headers }).catch(err => {
        // console.error('Failed to fetch banks:', err.response?.data || err.message);
        return { data: [] };
      });
      
      const usersRes = await axios.get(`${API_CONFIG.BASE_URL}/api/admin/users`, { headers }).catch(err => {
        // console.error('Failed to fetch users:', err.response?.data || err.message);
        return { data: { users: [] } };
      });
      
      const kycRes = await axios.get(`${API_CONFIG.BASE_URL}/api/kyc/all`, { headers }).catch(err => {
        // console.error('Failed to fetch KYC:', err.response?.data || err.message);
        return { data: [] };
      });
      
      // Calculate deposit stats
      const deposits = depositsRes.data || [];
      const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
      const approvedDeposits = deposits.filter(d => d.status === 'approved').length;
      const rejectedDeposits = deposits.filter(d => d.status === 'rejected').length;
      const totalDepositsAmount = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
      
      // Calculate withdrawal stats
      const withdrawals = withdrawalsRes.data || [];
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
      const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved').length;
      const rejectedWithdrawals = withdrawals.filter(w => w.status === 'rejected').length;
      const totalWithdrawalsAmount = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
      
      // Calculate bank stats
      const banks = banksRes.data || [];
      const verifiedBanks = banks.filter(b => b.status === 'Verified').length;
      const pendingBanks = banks.filter(b => b.status === 'Pending' || b.status === 'pending').length;
      
      // User stats
      const users = usersRes.data?.users || [];
      const activeUsers = users.filter(u => u.isActive !== false).length;
      
      // KYC stats
      const kycs = kycRes.data || [];
      const kycPending = kycs.filter(k => k.status === 'pending').length;
      const kycApproved = kycs.filter(k => k.status === 'approved').length;
      const kycRejected = kycs.filter(k => k.status === 'rejected').length;
      
      setDashboardStats({
        totalDeposits: deposits.length,
        pendingDeposits,
        approvedDeposits,
        rejectedDeposits,
        totalDepositsAmount,
        totalWithdrawals: withdrawals.length,
        pendingWithdrawals,
        approvedWithdrawals,
        rejectedWithdrawals,
        totalWithdrawalsAmount,
        totalBankRequests: banks.length,
        verifiedBanks,
        pendingBanks,
        totalUsers: users.length,
        activeUsers,
        kycPending,
        kycApproved,
        kycRejected
      });
      
      // Also set the raw data for recent transactions
      setRecentDeposits(deposits.slice(0, 5));
      
      // Prepare chart data
      const depositStatusData = [
        { name: 'Approved', value: approvedDeposits, color: '#10b981' },
        { name: 'Pending', value: pendingDeposits, color: '#f59e0b' },
        { name: 'Rejected', value: rejectedDeposits, color: '#ef4444' }
      ];
      
      const withdrawalStatusData = [
        { name: 'Approved', value: approvedWithdrawals, color: '#10b981' },
        { name: 'Pending', value: pendingWithdrawals, color: '#f59e0b' },
        { name: 'Rejected', value: rejectedWithdrawals, color: '#ef4444' }
      ];
      
      const bankStatusData = [
        { name: 'Verified', value: verifiedBanks, color: '#06b6d4' },
        { name: 'Pending', value: pendingBanks, color: '#f59e0b' }
      ];
      
      const kycStatusData = [
        { name: 'Approved', value: kycApproved, color: '#10b981' },
        { name: 'Pending', value: kycPending, color: '#f59e0b' },
        { name: 'Rejected', value: kycRejected, color: '#ef4444' }
      ];
      
      setChartData({
        deposits: depositStatusData,
        withdrawals: withdrawalStatusData,
        banks: bankStatusData,
        kyc: kycStatusData
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error.message);
    }
  };

  // Fetch user tasks
  const fetchUserTasks = async () => {
    try {
      setLoadingUserTasks(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/task/user-tasks`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      setUserTasks(response.data);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    } finally {
      setLoadingUserTasks(false);
    }
  };


  // Fetch deposits for payment verification
  const fetchDeposits = async () => {
    try {
      setLoadingDeposits(true);
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        console.error('Admin token not found');
        // Try to get admin token from alternative location
        const storedData = localStorage.getItem('adminData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          adminToken = parsedData.token || parsedData.adminToken;
        }
        
        if (!adminToken) {
          throw new Error('Admin token not available');
        }
      }
      
      console.log('Attempting to fetch deposits with admin token...');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // Only update state if we got a successful response
      if (response && response.data) {
        setDeposits(response.data);
        console.log('Successfully fetched deposits:', response.data.length, 'records');
      } else {
        // console.warn('Empty response from deposits API');
        setDeposits([]);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error.message || error);
      if (error.response) {
        console.error('Response error status:', error.response.status);
        console.error('Response error data:', error.response.data);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('General error:', error.message);
      }
      
      // Only fallback to demo data if there's an actual error
      const demoDeposits = [
        {
          _id: 'demo1',
          userId: '1',
          userName: 'Rajesh_Kumar',
          amount: 12000,
          utrNumber: 'UTR123456789012',
          timestamp: new Date(Date.now() - 900000), // 15 minutes ago
          status: 'pending',
          action: 0
        },
        {
          _id: 'demo2',
          userId: '2',
          userName: 'Priya_Sharma',
          amount: 5500,
          utrNumber: 'UTR987654321098',
          timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
          status: 'pending',
          action: 0
        },
        {
          _id: 'demo3',
          userId: '3',
          userName: 'Amit_Patel',
          amount: 25000,
          utrNumber: 'UTR456789012345',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'approved',
          action: 1
        },
        {
          _id: 'demo4',
          userId: '4',
          userName: 'Sneha_Reddy',
          amount: 50000,
          utrNumber: 'UTR234567890123',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          status: 'rejected',
          action: 2
        }
      ];
      setDeposits(demoDeposits);
    } finally {
      setLoadingDeposits(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'payments') {
      fetchDeposits();
    } else if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'user-tasks') {
      fetchUserTasks();
    } else if (activeTab === 'approved-withdrawals') {
      fetchApprovedWithdrawals();
    } else if (activeTab === 'approved-deposits') {
      fetchApprovedDeposits();
    } else if (activeTab === 'kyc') {
      fetchKycRequests();
    }
  }, [activeTab]);

  // Fetch dashboard stats when dashboard tab is active
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  // Fetch deposits when component mounts if on payments tab
  useEffect(() => {
    if (activeTab === 'payments') {
      fetchDeposits();
    }
  }, []);

  // Fetch withdrawal requests when withdrawal tab is active
  useEffect(() => {
    if (activeTab === 'withdrawals') {
      fetchWithdrawalRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'bank') {
      fetchBankRequests();
    }
  }, [activeTab]);

  const fetchBankRequests = async () => {
    setLoadingBankRequests(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/bank/all`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (response.data && response.data.banks) {
        setBankRequests(response.data.banks);
      }
    } catch (err) {
      console.error('Error fetching bank requests:', err);
      // Fallback to empty array if API fails
      setBankRequests([]);
    } finally {
      setLoadingBankRequests(false);
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

  const [confirmAction, setConfirmAction] = useState({ show: false, bankId: null, status: null, bankName: '' });

  const updateBankStatus = async (bankId, status) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/bank/${bankId}/status`, 
        { status },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );
      
      if (response.status === 200) {
        // Update local state
        setBankRequests(bankRequests.map(request => 
          request._id === bankId 
            ? { ...request, status, action: status === 'Verified' ? 2 : status === 'Rejected' ? 3 : 0, verifiedAt: status === 'Verified' ? new Date() : request.verifiedAt }
            : request
        ));
        
        alert(`Bank request ${status.toLowerCase()} successfully!`);
        setConfirmAction({ show: false, bankId: null, status: null, bankName: '' });
      }
    } catch (err) {
      console.error('Error updating bank status:', err);
      alert('Failed to update bank status');
    }
  };

  const showConfirmPopup = (bankId, status, bankName) => {
    setConfirmAction({ show: true, bankId, status, bankName });
  };

  const closeConfirmPopup = () => {
    setConfirmAction({ show: false, bankId: null, status: null, bankName: '' });
  };

  const confirmActionUpdate = () => {
    updateBankStatus(confirmAction.bankId, confirmAction.status);
  };

  const fetchUsers = async () => {
    try {
      // Try to fetch real user data from backend
      const res = await axios.get(`${API_CONFIG.BASE_URL}/api/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Fallback to real registration data
      setUsers([
        { 
          _id: '1', 
          name: 'Rajesh_Kumar', 
          phone: '9876543210', 
          email: 'rajesh.kumar@email.com', 
          uid: '775383', 
          balance: 45200, 
          status: 'Active', 
          lastActive: new Date(),
          createdAt: new Date('2024-01-15'),
          bankDetails: {
            accountHolder: 'Rajesh Kumar Sharma',
            accountNumber: '123456789012',
            ifsc: 'HDFC0001234',
            bankName: 'HDFC Bank',
            status: 'Verified'
          },
          transactions: [
            { type: 'deposit', amount: 5000, date: new Date('2024-01-20'), status: 'Completed' },
            { type: 'withdrawal', amount: 1200, date: new Date('2024-01-18'), status: 'Pending' }
          ]
        },
        { 
          _id: '2', 
          name: 'Priya_Patel', 
          phone: '8765432109', 
          email: 'priya.patel@email.com', 
          uid: '543210', 
          balance: 12800, 
          status: 'Active', 
          lastActive: new Date(Date.now() - 3600000),
          createdAt: new Date('2024-01-10'),
          bankDetails: {
            accountHolder: 'Priya Mehta Patel',
            accountNumber: '987654321098',
            ifsc: 'ICIC0004567',
            bankName: 'ICICI Bank',
            status: 'Pending'
          },
          transactions: [
            { type: 'deposit', amount: 12000, date: new Date('2024-01-19'), status: 'Completed' }
          ]
        },
        { 
          _id: '3', 
          name: 'Amit_Gupta', 
          phone: '7654321098', 
          email: 'amit.gupta@email.com', 
          uid: '432109', 
          balance: 87500, 
          status: 'Active', 
          lastActive: new Date(Date.now() - 7200000),
          createdAt: new Date('2024-01-05'),
          bankDetails: {
            accountHolder: 'Amit Verma Gupta',
            accountNumber: '456789012345',
            ifsc: 'SBIN0009012',
            bankName: 'State Bank of India',
            status: 'Verified'
          },
          transactions: [
            { type: 'deposit', amount: 50000, date: new Date('2024-01-18'), status: 'Completed' },
            { type: 'deposit', amount: 37500, date: new Date('2024-01-12'), status: 'Completed' }
          ]
        },
        { 
          _id: '4', 
          name: 'Sneha_Reddy', 
          phone: '6543210987', 
          email: 'sneha.reddy@email.com', 
          uid: '321098', 
          balance: 1500000, 
          status: 'Admin', 
          lastActive: new Date(),
          createdAt: new Date('2024-01-01'),
          bankDetails: {
            accountHolder: 'Sneha Krishnan Reddy',
            accountNumber: '234567890123',
            ifsc: 'AXIS0003456',
            bankName: 'Axis Bank',
            status: 'Verified'
          },
          transactions: [
            { type: 'deposit', amount: 1000000, date: new Date('2024-01-15'), status: 'Completed' },
            { type: 'deposit', amount: 500000, date: new Date('2024-01-10'), status: 'Completed' }
          ]
        },
        { 
          _id: '5', 
          name: 'Vikram_Singh', 
          phone: '5432109876', 
          email: 'vikram.singh@email.com', 
          uid: '210987', 
          balance: 0, 
          status: 'Suspended', 
          lastActive: new Date(Date.now() - 259200000),
          createdAt: new Date('2023-12-20'),
          bankDetails: null,
          transactions: []
        },
        { 
          _id: '6', 
          name: 'Kavita_Desai', 
          phone: '4321098765', 
          email: 'kavita.desai@email.com', 
          uid: '109876', 
          balance: 32500, 
          status: 'Active', 
          lastActive: new Date(Date.now() - 1800000),
          createdAt: new Date('2024-01-08'),
          bankDetails: {
            accountHolder: 'Kavita Ramesh Desai',
            accountNumber: '890123456789',
            ifsc: 'KOTAK0004321',
            bankName: 'Kotak Mahindra Bank',
            status: 'Pending'
          },
          transactions: [
            { type: 'deposit', amount: 25000, date: new Date('2024-01-16'), status: 'Completed' },
            { type: 'withdrawal', amount: 7500, date: new Date('2024-01-14'), status: 'Completed' }
          ]
        },
      ]);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/api/admin/user-action`, {
        userId,
        action
      });
      
      setActionModal({ isOpen: false, user: null });
      fetchUsers(); // Refresh user list
      
      // Show success message
      alert(`User ${action}ed successfully`);
    } catch (err) {
      console.error('Error performing user action:', err);
      alert('Error performing action');
    }
  };

  const openUserDetails = async (user) => {
    try {
      // Fetch real bank details from the bank_db
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/bank/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      const realBankDetails = response.data.bank;
      
      // Fetch complete transaction history from the new endpoint
      const transactionResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/admin/user-transactions/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Create user details structure with real bank data and complete transaction history
      const userDetails = {
        ...user,
        bankDetails: realBankDetails ? {
          accountHolder: realBankDetails.accountHolder,
          accountNumber: realBankDetails.accountNumber,
          ifsc: realBankDetails.ifsc,
          bankName: 'Bank Details from bank_db',
          status: realBankDetails.status,
          submittedAt: realBankDetails.submittedAt,
          verifiedAt: realBankDetails.verifiedAt
        } : null,
        transactions: transactionResponse.data.transactions || [],
        createdAt: user.createdAt || new Date(Date.now() - 604800000) // 1 week ago
      };
      
      setShowUserDetails(userDetails);
      
      // Fetch user quantify history
      fetchUserQuantifyHistory(userDetails._id);
    } catch (err) {
      console.error('Error fetching user details:', err);
      // Fallback to existing logic with demo data if API fails
      const userDetails = {
        ...user,
        bankDetails: user.bankDetails || {
          accountHolder: user.name || 'Demo User',
          accountNumber: '123456789012',
          ifsc: 'DEMO0001234',
          bankName: 'Demo Bank Ltd'
        },
        transactions: user.transactions && user.transactions.length > 0 
          ? user.transactions 
          : [
              {
                type: 'deposit',
                amount: 5000,
                date: new Date(Date.now() - 86400000),
                status: 'Completed'
              },
              {
                type: 'withdrawal',
                amount: 2000,
                date: new Date(Date.now() - 172800000),
                status: 'Completed'
              },
              {
                type: 'deposit',
                amount: 10000,
                date: new Date(Date.now() - 259200000),
                status: 'Pending'
              }
            ],
        createdAt: user.createdAt || new Date(Date.now() - 604800000)
      };
      
      setShowUserDetails(userDetails);
    }
  };

  const openActionModal = (user) => {
    setActionModal({ isOpen: true, user });
  };

  // Fetch user quantify history
  const fetchUserQuantifyHistory = async (userId) => {
    try {
      setLoadingQuantifyHistory(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quantify/admin/history/${userId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      setUserQuantifyHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching user quantify history:', error);
      setUserQuantifyHistory([]);
    } finally {
      setLoadingQuantifyHistory(false);
    }
  };

  // Task management functions
  const handleCreateTask = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/task`, taskForm, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setTasks([response.data.task, ...tasks]);
      setShowTaskModal(false);
      resetTaskForm();
      alert('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/task/${editingTask._id}`, taskForm, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setTasks(tasks.map(task => task._id === editingTask._id ? response.data.task : task));
      setShowTaskModal(false);
      setEditingTask(null);
      resetTaskForm();
      alert('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axios.delete(`${API_CONFIG.BASE_URL}/api/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      setTasks(tasks.filter(task => task._id !== taskId));
      alert('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleToggleTaskStatus = async (taskId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/task/${taskId}/toggle`, {}, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      setTasks(tasks.map(task => task._id === taskId ? response.data.task : task));
      alert(`Task ${response.data.task.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling task status:', error);
      alert('Failed to update task status');
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      reward: '',
      type: 'Daily',
      category: 'other',
      targetValue: '1'
    });
  };

  const openTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        reward: task.reward,
        type: task.type,
        category: task.category,
        targetValue: task.targetValue
      });
    } else {
      setEditingTask(null);
      resetTaskForm();
    }
    setShowTaskModal(true);
  };

  // Handle deposit action (approve/reject)
  const handleDepositAction = async (depositId, action) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/deposit/status/${depositId}`, 
        { action }, 
        { 
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Close the modal
      setDepositActionModal({ isOpen: false, depositId: null, action: null });
      
      // Update the deposit status in the local state
      setDeposits(prevDeposits => 
        prevDeposits.map(deposit => 
          deposit._id === depositId 
            ? { ...deposit, status: action === 1 ? 'approved' : 'rejected', action } 
            : deposit
        )
      );
      
      // Refresh the user details to show updated status
      if (showUserDetails) {
        openUserDetails(showUserDetails);
      }
      
      alert(`Deposit ${action === 1 ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating deposit status:', error);
      alert(`Failed to ${action === 1 ? 'approve' : 'reject'} deposit`);
    }
  };

  // Fetch withdrawal requests
  const fetchWithdrawalRequests = async () => {
    try {
      setLoadingWithdrawalRequests(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/withdrawal/all`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      setWithdrawalRequests(response.data);
    } catch (err) {
      console.error('Error fetching withdrawal requests:', err);
      setWithdrawalRequests([]);
    } finally {
      setLoadingWithdrawalRequests(false);
    }
  };

  // Fetch approved withdrawals
  const fetchApprovedWithdrawals = async () => {
    try {
      setLoadingApprovedWithdrawals(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/withdrawal/all`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Filter for approved withdrawals
      const approved = response.data.filter(request => request.status === 'approved');
      setApprovedWithdrawals(approved);
    } catch (err) {
      console.error('Error fetching approved withdrawals:', err);
      setApprovedWithdrawals([]);
    } finally {
      setLoadingApprovedWithdrawals(false);
    }
  };

  // Fetch KYC requests
  const fetchKycRequests = async () => {
    try {
      setLoadingKycRequests(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/kyc/pending`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      setKycRequests(response.data);
    } catch (err) {
      console.error('Error fetching KYC requests:', err);
      setKycRequests([]);
    } finally {
      setLoadingKycRequests(false);
    }
  };
  
  // Fetch approved deposits
  const fetchApprovedDeposits = async () => {
    try {
      setLoadingApprovedDeposits(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Filter for approved deposits
      const approved = response.data.filter(deposit => deposit.status === 'approved');
      setApprovedDeposits(approved);
    } catch (err) {
      console.error('Error fetching approved deposits:', err);
      setApprovedDeposits([]);
    } finally {
      setLoadingApprovedDeposits(false);
    }
  };

  // Handle KYC action (approve/reject)
  const handleKycAction = async (kycId, action) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (action === 'reject' && !rejectionReason.trim()) {
        alert('Please provide a rejection reason');
        return;
      }
      
      const endpoint = action === 'approve' 
        ? `${API_CONFIG.BASE_URL}/api/kyc/approve/${kycId}`
        : `${API_CONFIG.BASE_URL}/api/kyc/reject/${kycId}`;
      
      const payload = action === 'reject' 
        ? { rejectionReason }
        : {};
      
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Close modal and reset reason
      setKycDetailsModal({ isOpen: false, kyc: null });
      setRejectionReason('');
      
      // Refresh KYC requests
      fetchKycRequests();
      
      alert(`KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error(`Error ${action === 'approve' ? 'approving' : 'rejecting'} KYC:`, error);
      alert(`Failed to ${action === 'approve' ? 'approve' : 'reject'} KYC`);
    }
  };
  
  // Open KYC details modal
  const openKycDetails = (kyc) => {
    setKycDetailsModal({ isOpen: true, kyc });
  };
  
  // Close KYC details modal
  const closeKycDetails = () => {
    setKycDetailsModal({ isOpen: false, kyc: null });
    setRejectionReason('');
  };
  
  // Handle withdrawal action (approve/reject)
  const handleWithdrawalAction = async (requestId, action) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/withdrawal/status/${requestId}`, 
        { action }, 
        { 
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Update the request status in the local state
      setWithdrawalRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: action === 1 ? 'approved' : 'rejected', action } 
            : request
        )
      );
      
      // Refresh the approved withdrawals list if approved
      if (action === 1) {
        fetchApprovedWithdrawals();
      }
      
      alert(`Withdrawal request ${action === 1 ? 'approved' : 'rejected'} successfully`);
      
      // Refresh the list after 1 second
      setTimeout(() => {
        fetchWithdrawalRequests();
      }, 1000);
    } catch (error) {
      console.error('Error updating withdrawal request:', error);
      alert(`Failed to ${action === 1 ? 'approve' : 'reject'} withdrawal request`);
    }
  };
  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        setActiveDropdown(null);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && activeDropdown !== null) {
        setActiveDropdown(null);
      }
    };

    const handleArrowKeys = (event) => {
      if (activeDropdown !== null && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        const dropdown = dropdownRefs.current[activeDropdown];
        if (dropdown) {
          const buttons = dropdown.querySelectorAll('button[role="menuitem"]');
          const currentIndex = Array.from(buttons).findIndex(btn => btn === document.activeElement);
          
          if (event.key === 'ArrowDown') {
            const nextIndex = (currentIndex + 1) % buttons.length;
            buttons[nextIndex].focus();
          } else {
            const prevIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
            buttons[prevIndex].focus();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleArrowKeys);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [activeDropdown]);

  // Open deposit action modal
  const openDepositActionModal = (depositId, action) => {
    setDepositActionModal({ 
      isOpen: true, 
      depositId, 
      action 
    });
  };


  
  const handleDirectDepositAction = async (depositId, action, deposit) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/deposit/status/${depositId}`, 
        { action },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );
      
      // Update the deposit status in the UI
      setDeposits(prevDeposits => 
        prevDeposits.map(d => 
          d._id === depositId 
            ? { ...d, status: action === 1 ? 'approved' : 'rejected', action }
            : d
        )
      );
      
      console.log(`${action === 1 ? 'Approved' : 'Rejected'} deposit successfully`);
      alert(`Deposit ${action === 1 ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error(`Error ${action === 1 ? 'approving' : 'rejecting'} deposit:`, error);
      alert(`Error ${action === 1 ? 'verifying' : 'rejecting'} deposit. Please try again.`);
    }
  };

  const closeModal = () => {
    setShowUserDetails(null);
    setActionModal({ isOpen: false, user: null });
  };

  useEffect(() => {
    if (activeTab === 'support') {
      fetchActiveChats();
      const interval = setInterval(fetchActiveChats, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchActiveChats = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/api/support/admin/active`);
      setSupportChats(res.data);
      // Update selected chat if it exists
      if (selectedChat) {
        const updated = res.data.find(c => c._id === selectedChat._id);
        if (updated) setSelectedChat(updated);
      }
    } catch (err) {
      console.error("Fetch chats error", err);
    }
  };

  const handleAdminReply = async () => {
    if (!replyText.trim() || !selectedChat) return;
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/api/support/admin/reply`, {
        chatId: selectedChat._id,
        text: replyText
      });
      setSelectedChat(res.data);
      setReplyText('');
    } catch (err) {
      console.error("Reply error", err);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, type: 'Payment', title: 'New Payment Verification', desc: 'UID 882193 uploaded receipt', time: '5m ago', status: 'unread' },
    { id: 2, type: 'Deposit', title: 'Large Deposit Alert', desc: '₹50,000 pending approval', time: '12m ago', status: 'unread' },
    { id: 3, type: 'Withdrawal', title: 'Withdrawal Request', desc: 'Member_X requested ₹5,000', time: '1h ago', status: 'read' },
    { id: 4, type: 'Payment', title: 'Bank Bind Request', desc: 'New bank details verification', time: '3h ago', status: 'read' },
  ];

  // Theme-based style constants
  const theme = {
    pageBg: isDarkMode ? 'bg-[#0a0f16]' : 'bg-[#f1f5f9]',
    cardBg: isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white',
    sidebarBg: isDarkMode ? 'bg-[#101821]' : 'bg-white shadow-xl',
    textMain: isDarkMode ? 'text-white' : 'text-slate-800',
    textDim: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    border: isDarkMode ? 'border-gray-800/50' : 'border-slate-200',
    headerBg: isDarkMode ? 'bg-[#0a0f16]/80' : 'bg-white/80',
    innerCard: isDarkMode ? 'bg-[#101821]' : 'bg-slate-50',
    dropdownMenu: isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white',
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck },
    { id: 'payments', label: 'Payment Verification', icon: CreditCard },
    { id: 'deposits', label: 'Deposits', icon: ArrowUpRight },
    { id: 'withdrawals', label: 'Withdrawal Approval', icon: CheckCircle2 },
    { id: 'approved-withdrawals', label: 'Approved Withdrawals', icon: CheckCircle },
    { id: 'approved-deposits', label: 'Approved Deposits', icon: Check },
    { id: 'support', label: 'Support Chats', icon: MessageSquare },
    { id: 'quantify', label: 'Quantify History', icon: Activity },
    { id: 'bank', label: 'Bank Details', icon: Landmark },
    { id: 'recharge', label: 'Wallet Recharge', icon: Wallet },
    { id: 'gifts', label: 'Gift Cards', icon: Banknote },
    { id: 'tasks', label: 'Task Management', icon: ListTodo },
    { id: 'user-tasks', label: 'User Task Tracking', icon: ListTodo },
    { id: 'qr-management', label: 'QR Update', icon: QrCode },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { 
      label: 'Total Deposits', 
      value: `₹${(dashboardStats.totalDepositsAmount / 100000).toFixed(2)}L`, 
      change: `${dashboardStats.approvedDeposits} Approved`, 
      icon: ArrowUpRight, 
      trend: 'up' 
    },
    { 
      label: 'Total Withdrawals', 
      value: `₹${(dashboardStats.totalWithdrawalsAmount / 100000).toFixed(2)}L`, 
      change: `${dashboardStats.approvedWithdrawals} Approved`, 
      icon: ArrowDownLeft, 
      trend: dashboardStats.approvedWithdrawals > 0 ? 'up' : 'neutral'
    },
    { 
      label: 'Pending Requests', 
      value: dashboardStats.pendingDeposits + dashboardStats.pendingWithdrawals, 
      change: `${dashboardStats.pendingDeposits} Dep, ${dashboardStats.pendingWithdrawals} With`, 
      icon: Bell, 
      trend: 'down' 
    },
    { 
      label: 'Active Users', 
      value: dashboardStats.activeUsers.toString(), 
      change: `${dashboardStats.totalUsers} Total`, 
      icon: Users, 
      trend: 'up' 
    },
  ];

  const renderRecharge = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>Direct Wallet Recharge</h3>
          <p className={`text-xs ${theme.textDim} font-bold uppercase tracking-widest`}>Admin Master Control</p>
        </div>
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Target User UID</label>
            <input type="text" placeholder="Enter UID (e.g. 882193)" className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-4 px-6 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`} />
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Recharge Amount (INR)</label>
            <input type="number" placeholder="0.00" className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-4 px-6 text-2xl font-black ${theme.textMain} focus:border-[#49bace] outline-none transition-all`} />
          </div>
          <button className="w-full py-5 bg-[#49bace] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-[#49bace]/20 hover:scale-[1.02] active:scale-95 transition-all">Execute Recharge</button>
          <p className="text-[10px] text-center text-rose-500 font-bold uppercase">Note: This action is irreversible and logged in the audit protocol.</p>
        </div>
      </div>
    </div>
  );
    
  const renderTasks = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-3xl p-8 shadow-xl">
      
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-white">Task Management</h3>
        <button 
          onClick={() => openTaskModal()}
          className="px-6 py-3 bg-[#49bace] text-[#101821] font-bold rounded-2xl flex items-center space-x-2 hover:scale-105 transition-all shadow-lg shadow-[#49bace]/20"
        >
          <Plus size={20} />
          <span>Add New Task</span>
        </button>
      </div>

      {loadingTasks ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bace]"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-[#49bace]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ListTodo size={40} className="text-[#49bace]" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Data Not Found</h4>
          <p className="text-gray-500">No tasks available to display.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task._id} 
              className="bg-[#212431] border border-gray-700 rounded-2xl p-6 hover:border-[#49bace]/50 transition-all"
            >
              <div className="flex justify-between items-start">
                
                <div className="flex-1">
                  
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-bold text-white">{task.title}</h4>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        task.type === 'Daily'
                          ? 'bg-blue-500/20 text-blue-400'
                          : task.type === 'Weekly'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {task.type}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        task.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {task.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-gray-400 text-sm mb-3">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-6 text-sm">
                    
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-[#49bace]" />
                      <span className="text-[#49bace] font-bold">
                        ₹{task.reward}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Category:</span>
                      <span className="text-white font-medium capitalize">
                        {task.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Target:</span>
                      <span className="text-white font-medium">
                        {task.targetValue}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  
                  <button 
                    onClick={() => openTaskModal(task)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                    title="Edit Task"
                  >
                    <Edit size={18} className="text-white" />
                  </button>

                  <button 
                    onClick={() => handleToggleTaskStatus(task._id)}
                    className={`p-2 rounded-xl transition-colors ${
                      task.isActive
                        ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                    }`}
                    title={task.isActive ? "Deactivate Task" : "Activate Task"}
                  >
                    <Eye size={18} />
                  </button>

                  <button 
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
  
  // Render approved withdrawals list
  const renderApprovedWithdrawals = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>Approved Withdrawals</h3>
          <button 
            onClick={fetchApprovedWithdrawals}
            className="px-4 py-2 bg-emerald-500 text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all"
          >
            Refresh
          </button>
        </div>
          
        {loadingApprovedWithdrawals ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedWithdrawals.length > 0 ? (
              approvedWithdrawals.map((request, i) => (
                <div key={request._id} className={`p-6 ${theme.innerCard} border ${theme.border} rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 hover:border-emerald-500/30 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10`}>
                  {/* User Info Section - Left Column */}
                  <div className="flex flex-col md:col-span-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{request.userName}</p>
                        <p className={`text-[10px] ${theme.textDim} uppercase`}>
                          UID: {request.userPhone?.slice(-6) || 'N/A'}
                        </p>
                      </div>
                    </div>
                      
                    {/* Bank Details Card */}
                    <div className="bg-[#101821]/70 border border-emerald-500/20 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Bank Account Details</span>
                      </div>
                        
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-gray-500 uppercase font-bold">Bank Name:</span>
                          <span className="text-[9px] font-bold text-white">{request.bankAccount?.bankName || 'N/A'}</span>
                        </div>
                          
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-gray-500 uppercase font-bold">Account Holder:</span>
                          <span className="text-[9px] font-bold text-white">{request.bankAccount?.accountHolder || 'N/A'}</span>
                        </div>
                          
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-gray-500 uppercase font-bold">Account Number:</span>
                          <span className="text-[9px] font-black text-emerald-400">
                            {request.bankAccount?.accountNumber || 'N/A'}
                          </span>
                        </div>
                          
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-gray-500 uppercase font-bold">IFSC Code:</span>
                          <span className="text-[9px] font-bold text-white">{request.bankAccount?.ifsc || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                    
                  {/* Amount Section - Middle Column */}
                  <div className="flex flex-col justify-center md:col-span-1">
                    <div className="flex justify-between items-center mb-2">
                      <p className={`text-lg font-black text-emerald-400`}>₹{request.handlingFee?.actualReceipt?.toFixed(2) || '0.00'}</p>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ml-2 bg-emerald-500/10 text-emerald-400`}>
                        {request.status}
                      </span>
                    </div>
                      
                    {/* Financial Details */}
                    <div className="text-[9px] text-gray-400 space-y-1 bg-[#101821]/50 p-3 rounded-xl border border-gray-800/30 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Withdrawal Amount:</span>
                        <span className="font-medium text-rose-400">₹{request.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Handling Fee (4%):</span>
                        <span className="font-medium text-rose-400">₹{request.handlingFee?.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-emerald-500/20">
                        <span className="font-bold text-white text-sm">AMOUNT PAID:</span>
                        <span className="font-black text-emerald-400 text-lg">₹{request.handlingFee?.actualReceipt?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                    
                  {/* Approval Info - Right Column */}
                  <div className="flex flex-col items-end md:col-span-1">
                    <div className="text-[9px] text-gray-400 space-y-1 bg-[#101821]/30 p-3 rounded-xl border border-gray-700/30">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Approved By:</span>
                        <span className="font-medium">{request.processedBy?.adminName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Approved On:</span>
                        <span className="font-medium">
                          {request.processedBy?.processedAt 
                            ? new Date(request.processedBy.processedAt).toLocaleString() 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Requested On:</span>
                        <span className="font-medium">
                          {new Date(request.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-gray-500" />
                </div>
                <p className={`text-lg font-bold ${theme.textMain} mb-2`}>Data Not Found</p>
                <p className={`${theme.textDim} text-sm`}>No approved withdrawals available to display.</p>
              </div>
            )}
          </div>
        )}
      </div>
        
      {/* Statistics Summary */}
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <h4 className={`text-xl font-bold ${theme.textMain} mb-6`}>Approved Withdrawals Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Approved', value: approvedWithdrawals.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Total Amount', value: `₹${approvedWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0).toLocaleString()}`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Total Paid', value: `₹${approvedWithdrawals.reduce((sum, w) => sum + (w.handlingFee?.actualReceipt || 0), 0).toLocaleString()}`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Total Fees', value: `₹${approvedWithdrawals.reduce((sum, w) => sum + (w.handlingFee?.amount || 0), 0).toLocaleString()}`, color: 'text-amber-400', bg: 'bg-amber-500/10' }
          ].map((stat, i) => (
            <div key={i} className={`p-4 ${theme.innerCard} border ${theme.border} rounded-2xl text-center`}>
              <div className={`text-2xl font-black ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className={`text-[10px] ${theme.textDim} uppercase font-bold`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Render approved deposits list
  const renderApprovedDeposits = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>Approved Deposits</h3>
          <button 
            onClick={fetchApprovedDeposits}
            className="px-4 py-2 bg-blue-500 text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all"
          >
            Refresh
          </button>
        </div>
          
        {loadingApprovedDeposits ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedDeposits.length > 0 ? (
              approvedDeposits.map((deposit, i) => (
                <div key={deposit._id} className={`p-6 ${theme.innerCard} border ${theme.border} rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500/20 transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                      <Check size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${theme.textMain}`}>{deposit.userName}</p>
                      <p className={`text-[10px] ${theme.textDim} uppercase`}>UTR: {deposit.utrNumber}</p>
                      <p className={`text-[10px] ${theme.textDim}`}>
                        {new Date(deposit.timestamp).toLocaleString()}
                      </p>
                      <p className={`text-[10px] text-green-400 font-bold`}>
                        Approved
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className={`text-lg font-black ${theme.textMain}`}>₹{deposit.amount.toLocaleString()}</p>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 bg-emerald-500/10 text-emerald-400`}>
                      Approved
                    </span>
                  </div>
                  <div className="flex flex-col md:items-end text-[9px] text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Approved By:</span>
                      <span className="font-medium">{deposit.processedBy?.adminName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Approved On:</span>
                      <span className="font-medium">
                        {deposit.processedBy?.processedAt 
                          ? new Date(deposit.processedBy.processedAt).toLocaleString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-gray-500" />
                </div>
                <p className={`text-lg font-bold ${theme.textMain} mb-2`}>Data Not Found</p>
                <p className={`${theme.textDim} text-sm`}>No approved deposits available to display.</p>
              </div>
            )}
          </div>
        )}
      </div>
        
      {/* Statistics Summary */}
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <h4 className={`text-xl font-bold ${theme.textMain} mb-6`}>Approved Deposits Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Approved', value: approvedDeposits.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Total Amount', value: `₹${approvedDeposits.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Average Amount', value: approvedDeposits.length > 0 ? `₹${(approvedDeposits.reduce((sum, d) => sum + (d.amount || 0), 0) / approvedDeposits.length).toFixed(0)}` : '₹0', color: 'text-purple-400', bg: 'bg-purple-500/10' }
          ].map((stat, i) => (
            <div key={i} className={`p-4 ${theme.innerCard} border ${theme.border} rounded-2xl text-center`}>
              <div className={`text-2xl font-black ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className={`text-[10px] ${theme.textDim} uppercase font-bold`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderGifts = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>Gift Card Management</h3>
          <button className="px-6 py-2 bg-[#49bace] text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all">Generate New Code</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { code: 'AIG-X921-KF', value: '₹500', status: 'Active' },
            { code: 'AIG-B220-LP', value: '₹1,000', status: 'Redeemed' },
            { code: 'AIG-M001-QZ', value: '₹5,000', status: 'Expired' },
          ].map((g, i) => (
            <div key={i} className={`p-6 ${theme.innerCard} border ${theme.border} rounded-3xl`}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Banknote size={20} />
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  g.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 
                  g.status === 'Redeemed' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {g.status}
                </span>
              </div>
              <p className={`text-sm font-black ${theme.textMain} mb-1 tracking-wider`}>{g.code}</p>
              <p className={`text-2xl font-black text-[#49bace]`}>{g.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserTasks = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>User Task Completions</h3>
          <button 
            onClick={fetchUserTasks}
            className="px-4 py-2 bg-[#49bace] text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all"
          >
            Refresh
          </button>
        </div>
        
        {loadingUserTasks ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49bace]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {userTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`border-b ${theme.border}`}>
                      <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>User</th>
                      <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Task</th>
                      <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Progress</th>
                      <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Status</th>
                      <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Created</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/30' : 'divide-slate-100'}`}>
                    {userTasks.map((userTask, i) => (
                      <tr key={userTask._id} className="hover:bg-gray-500/[0.02] transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className={`text-sm font-bold ${theme.textMain}`}>
                              {userTask.userId?.name || 'Unknown User'}
                            </p>
                            <p className={`text-[10px] ${theme.textDim}`}>
                              {userTask.userId?.phone || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className={`text-sm font-bold ${theme.textMain}`}>
                              {userTask.taskId?.title || 'Unknown Task'}
                            </p>
                            <p className={`text-[10px] ${theme.textDim}`}>
                              Reward: ₹{userTask.taskId?.reward || '0'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className={`text-sm font-bold ${theme.textMain}`}>
                              {userTask.progress || 0}%
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                            userTask.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                            userTask.status === 'claimed' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {userTask.status}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-xs font-bold ${theme.textDim}`}>
                          {new Date(userTask.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ListTodo size={32} className="text-gray-500" />
                </div>
                <p className={`text-lg font-bold ${theme.textMain} mb-2`}>Data Not Found</p>
                <p className={`${theme.textDim} text-sm`}>No user task records available to display.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );



  const renderBankDetails = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>Bank Bind Requests</h3>
          <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full uppercase tracking-widest">
            {loadingBankRequests ? 'Loading...' : `${bankRequests.length} Requests`}
          </span>
        </div>
        
        {loadingBankRequests ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bace]"></div>
          </div>
        ) : bankRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#49bace]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Landmark size={40} className="text-[#49bace]" />
            </div>
            <h4 className={`text-xl font-bold ${theme.textMain} mb-2`}>Data Not Found</h4>
            <p className={`${theme.textDim}`}>No bank requests available to display.</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankRequests.map((request, index) => (
            <div key={request._id} className={`p-6 ${theme.innerCard} border ${theme.border} rounded-3xl space-y-4 hover:border-[#49bace]/30 transition-all`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <Landmark size={24} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${theme.textMain}`}>{request.userId?.name || 'Unknown User'}</p>
                  <p className={`text-[10px] ${theme.textDim}`}>UID: {request.userId?._id?.slice(-6) || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-2 py-2 border-y border-gray-800/10">
                <div className="flex justify-between">
                  <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Account Holder</span>
                  <span className={`text-xs font-bold ${theme.textMain}`}>{request.accountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Account Number</span>
                  <span className={`text-xs font-bold ${theme.textMain}`}>****{request.accountNumber?.slice(-4) || '****'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>IFSC Code</span>
                  <span className={`text-xs font-bold ${theme.textMain}`}>{request.ifsc || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Bank Name</span>
                  <span className={`text-xs font-bold ${theme.textMain}`}>{request.bankName || 'Bank Details'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Action</span>
                  <span className={`text-xs font-bold ${
                    request.action === 2 ? 'text-emerald-400' :
                    request.action === 3 ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {request.action === 0 ? 'Pending' : request.action === 2 ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${
                  request.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' :
                  request.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {request.status || 'Pending'}
                </span>
                <span className={`text-[10px] ${theme.textDim}`}>
                  {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <div className="flex gap-2 pt-2">
                {request.status !== 'Verified' && (
                  <button 
                    onClick={() => showConfirmPopup(request._id, 'Verified', request.bankName || 'Bank Details')}
                    className="flex-grow py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-600 transition-all"
                  >
                    Verify & Bind
                  </button>
                )}
                {request.status === 'Verified' && (
                  <button className="flex-grow py-2.5 bg-gray-500/10 text-gray-400 text-[10px] font-black uppercase rounded-xl cursor-not-allowed" disabled>
                    Already Verified
                  </button>
                )}
                {request.status !== 'Verified' && (
                  <button 
                    onClick={() => showConfirmPopup(request._id, 'Rejected', request.bankName || 'Bank Details')}
                    className="px-4 py-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Statistics Summary */}
        <div className="mt-8 pt-8 border-t border-gray-800/20">
          <h4 className={`text-lg font-bold ${theme.textMain} mb-6`}>Request Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: bankRequests.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Pending', value: bankRequests.filter(r => r.status === 'Pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Verified', value: bankRequests.filter(r => r.status === 'Verified').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Rejected', value: bankRequests.filter(r => r.status === 'Rejected').length, color: 'text-rose-400', bg: 'bg-rose-500/10' }
            ].map((stat, i) => (
              <div key={i} className={`p-4 ${theme.innerCard} border ${theme.border} rounded-2xl text-center`}>
                <div className={`text-2xl font-black ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className={`text-[10px] ${theme.textDim} uppercase font-bold`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>

      {/* Confirmation Popup */}
      {confirmAction.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.cardBg} border ${theme.border} rounded-2xl p-6 w-full max-w-md shadow-2xl`}>
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-xl ${
                confirmAction.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {confirmAction.status === 'Verified' ? <CheckCircle2 size={24} /> : <X size={24} />}
              </div>
              <h3 className={`text-lg font-bold ${theme.textMain} ml-3`}>
                {confirmAction.status === 'Verified' ? 'Verify Bank Request' : 'Reject Bank Request'}
              </h3>
            </div>
            
            <p className={`${theme.textMain} mb-6`}>
              Are you sure you want to {confirmAction.status.toLowerCase()} the bank request for 
              <span className="font-bold text-[#49bace]"> {confirmAction.bankName}</span>?
              This action cannot be undone.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={closeConfirmPopup}
                className={`flex-1 py-3 ${theme.innerCard} border ${theme.border} ${theme.textMain} font-bold rounded-xl hover:bg-gray-500/10 transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={confirmActionUpdate}
                className={`flex-1 py-3 ${
                  confirmAction.status === 'Verified' 
                    ? 'bg-emerald-500 hover:bg-emerald-600' 
                    : 'bg-rose-500 hover:bg-rose-600'
                } text-white font-bold rounded-xl transition-all`}
              >
                {confirmAction.status === 'Verified' ? 'Verify & Bind' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWithdrawalVerify = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>Pending Withdrawals</h3>
          <div className="flex gap-2">
            <span className="text-[10px] font-black bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full uppercase tracking-widest">
              {loadingWithdrawalRequests ? 'Loading...' : `${withdrawalRequests.filter(r => r.status === 'pending').length} Pending`}
            </span>
            <button 
              onClick={fetchWithdrawalRequests}
              className="px-4 py-2 bg-[#49bace] text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {loadingWithdrawalRequests ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49bace]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawalRequests.length > 0 ? (
              withdrawalRequests
                .filter(request => request.status === 'pending')
                .map((request, i) => (
                  <div key={request._id} className={`p-6 ${theme.innerCard} border ${theme.border} rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 hover:border-emerald-500/30 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10`}>
                    {/* User Info Section - Left Column */}
                    <div className="flex flex-col md:col-span-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                          <ArrowDownLeft size={24} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${theme.textMain}`}>{request.userName}</p>
                          <p className={`text-[10px] ${theme.textDim} uppercase`}>
                            UID: {request.userPhone?.slice(-6) || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Bank Details Card - Prominently Displayed */}
                      <div className="bg-[#101821]/70 border border-amber-500/20 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Bank Account Details</span>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-gray-500 uppercase font-bold">Bank Name:</span>
                            <span className="text-[9px] font-bold text-white">{request.bankAccount?.bankName || 'N/A'}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-gray-500 uppercase font-bold">Account Holder:</span>
                            <span className="text-[9px] font-bold text-white">{request.bankAccount?.accountHolder || 'N/A'}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-gray-500 uppercase font-bold">Account Number:</span>
                            <span className="text-[9px] font-black text-emerald-400">
                              {request.bankAccount?.accountNumber || 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-gray-500 uppercase font-bold">IFSC Code:</span>
                            <span className="text-[9px] font-bold text-white">{request.bankAccount?.ifsc || 'N/A'}</span>
                          </div>
                          
                          {request.bankAccount?.upiId && (
                            <div className="flex justify-between items-center pt-1 border-t border-gray-800/30 mt-1">
                              <span className="text-[9px] text-gray-500 uppercase font-bold">UPI ID:</span>
                              <span className="text-[9px] font-bold text-cyan-400">{request.bankAccount.upiId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Amount Section - Middle Column */}
                    <div className="flex flex-col justify-center md:col-span-1">
                      <div className="flex justify-between items-center mb-2">
                        <p className={`text-lg font-black text-emerald-400`}>₹{request.handlingFee?.actualReceipt?.toFixed(2) || '0.00'}</p>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ml-2 ${
                          request.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      
                      {/* Complete Financial Details */}
                      <div className="text-[9px] text-gray-400 space-y-1 bg-[#101821]/50 p-3 rounded-xl border border-gray-800/30 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Balance:</span>
                          <span className="font-medium">₹{request.userFinancialData.totalBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Available Balance:</span>
                          <span className="font-medium">₹{request.userFinancialData.availableBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Approved Deposits:</span>
                          <span className="font-medium">₹{request.userFinancialData.approvedDepositAmount.toLocaleString()}</span>
                        </div>
                        {request.userFinancialData.quantifyData && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Quantify Revenue:</span>
                              <span className="font-medium">₹{request.userFinancialData.quantifyData.totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Today's Earning:</span>
                              <span className="font-medium">₹{request.userFinancialData.quantifyData.todayEarning.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        <div className="border-t border-gray-800/30 pt-1 mt-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Withdrawal Request:</span>
                            <span className="font-bold text-rose-400">₹{request.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Handling Fee (4%):</span>
                            <span className="font-medium text-rose-400">₹{request.handlingFee?.amount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between mt-2 pt-2 border-t border-emerald-500/20">
                            <span className="font-bold text-white text-sm">AMOUNT TO PAY USER:</span>
                            <span className="font-black text-emerald-400 text-lg">₹{request.handlingFee?.actualReceipt?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* User Details Section */}
                      {request.userDetails && (
                        <div className="text-[9px] text-gray-400 space-y-1 bg-[#101821]/30 p-3 rounded-xl border border-gray-700/30 mt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last Login:</span>
                            <span className="font-medium">
                              {request.userDetails.lastLoginDate 
                                ? new Date(request.userDetails.lastLoginDate).toLocaleDateString() 
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Registration:</span>
                            <span className="font-medium">
                              {request.userDetails.registrationDate 
                                ? new Date(request.userDetails.registrationDate).toLocaleDateString() 
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Requests:</span>
                            <span className="font-medium">{request.userDetails.totalWithdrawalRequests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Approved:</span>
                            <span className="font-medium text-emerald-400">{request.userDetails.totalApprovedRequests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Rejected:</span>
                            <span className="font-medium text-rose-400">{request.userDetails.totalRejectedRequests}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons - Right Column */}
                    <div className="flex items-center justify-end md:justify-center md:col-span-1">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleWithdrawalAction(request._id, 1)}
                          className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-600 transition-all whitespace-nowrap"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleWithdrawalAction(request._id, 2)}
                          className="px-4 py-2 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase rounded-xl hover:bg-rose-500/20 transition-all whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ArrowDownLeft size={32} className="text-gray-500" />
                </div>
                <p className={`text-lg font-bold ${theme.textMain} mb-2`}>Data Not Found</p>
                <p className={`${theme.textDim} text-sm`}>No withdrawal requests available to display.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Statistics Summary */}
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <h4 className={`text-xl font-bold ${theme.textMain} mb-6`}>Withdrawal Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: withdrawalRequests.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Pending', value: withdrawalRequests.filter(r => r.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Approved', value: withdrawalRequests.filter(r => r.status === 'approved').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Rejected', value: withdrawalRequests.filter(r => r.status === 'rejected').length, color: 'text-rose-400', bg: 'bg-rose-500/10' }
          ].map((stat, i) => (
            <div key={i} className={`p-4 ${theme.innerCard} border ${theme.border} rounded-2xl text-center`}>
              <div className={`text-2xl font-black ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className={`text-[10px] ${theme.textDim} uppercase font-bold`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );



  const renderPayments = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>Payment Receipt Verification</h3>
          <button 
            onClick={fetchDeposits}
            className="px-4 py-2 bg-[#49bace] text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all"
          >
            Refresh
          </button>
        </div>
        
        {loadingDeposits ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49bace]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {deposits.length > 0 ? (
              deposits.map((deposit, i) => (
                <div key={deposit._id} className={`p-6 ${theme.innerCard} border ${theme.border} rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#49bace]/20 transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${theme.textMain}`}>{deposit.userName}</p>
                      <p className={`text-[10px] ${theme.textDim} uppercase`}>UTR: {deposit.utrNumber}</p>
                      <p className={`text-[10px] ${theme.textDim}`}>
                        {new Date(deposit.timestamp).toLocaleString()}
                      </p>
                      <p className={`text-[10px] ${(deposit.paymentScreenshot ? 'text-green-400' : 'text-amber-400')} font-bold`}>
                        {deposit.paymentScreenshot ? 'Screenshot Uploaded' : 'No Screenshot'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className={`text-lg font-black ${theme.textMain}`}>₹{deposit.amount.toLocaleString()}</p>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${{
                      'pending': 'bg-amber-500/10 text-amber-400',
                      'approved': 'bg-emerald-500/10 text-emerald-400',
                      'rejected': 'bg-rose-500/10 text-rose-400'
                    }[deposit.status] || 'bg-gray-500/10 text-gray-400'}`}>
                      {deposit.status}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      className={`px-6 py-2.5 ${theme.cardBg} border ${theme.border} ${theme.textMain} text-[10px] font-black uppercase rounded-xl hover:bg-[#49bace] hover:text-white transition-all`}
                      onClick={() => {
                        setReceiptModal({ isOpen: true, deposit });
                      }}
                    >
                      View Receipt
                    </button>
                    {deposit.status === 'pending' && (
                      <>
                        <button 
                          className="px-6 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 hover:bg-emerald-600 transition-all"
                          onClick={() => handleDirectDepositAction(deposit._id, 1, deposit)}
                        >
                          Verify
                        </button>
                        <button 
                          className="px-6 py-2.5 bg-rose-500 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-rose-500/20 hover:scale-105 hover:bg-rose-600 transition-all"
                          onClick={() => handleDirectDepositAction(deposit._id, 2, deposit)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {deposit.status === 'approved' && (
                      <button 
                        className="px-6 py-2.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-xl cursor-not-allowed"
                        disabled
                      >
                        Verified
                      </button>
                    )}
                    {deposit.status === 'rejected' && (
                      <button 
                        className="px-6 py-2.5 bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase rounded-xl cursor-not-allowed"
                        disabled
                      >
                        Rejected
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={32} className="text-gray-500" />
                </div>
                <p className={`text-lg font-bold ${theme.textMain} mb-2`}>Data Not Found</p>
                <p className={`${theme.textDim} text-sm`}>No deposit requests available to display.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Receipt modal for viewing deposit details
  const ReceiptModal = () => {
    if (!receiptModal.isOpen || !receiptModal.deposit) return null;
    
    const { deposit } = receiptModal;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300`}>
          <div className="p-8 border-b border-gray-800/20 flex justify-between items-center">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>Deposit Receipt Details</h3>
            <button 
              onClick={() => setReceiptModal({ isOpen: false, deposit: null })}
              className={`p-2 ${theme.textDim} hover:text-white hover:bg-gray-500/10 rounded-lg transition-all`}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Transaction Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>User</span>
                    <span className={`text-sm font-bold ${theme.textMain}`}>{deposit.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>UTR Number</span>
                    <span className={`text-sm font-bold ${theme.textMain}`}>{deposit.utrNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Amount</span>
                    <span className={`text-sm font-bold ${theme.textMain}`}>₹{deposit.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Status</span>
                    <span className={`text-sm font-bold ${{
                      'pending': theme.textDim,
                      'approved': 'text-emerald-400',
                      'rejected': 'text-rose-400'
                    }[deposit.status]}`}>
                      {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Date</span>
                    <span className={`text-sm font-bold ${theme.textMain}`}>
                      {new Date(deposit.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Receipt Preview</h4>
                {deposit.paymentScreenshot ? (
                  <div className="flex flex-col items-center justify-center">
                    <img 
                      src={`${API_CONFIG.BASE_URL}${deposit.paymentScreenshot}`} 
                      alt="Payment receipt" 
                      className="max-h-64 max-w-full rounded-lg object-contain border border-gray-700"
                    />
                    <a 
                      href={`${API_CONFIG.BASE_URL}${deposit.paymentScreenshot}`} 
                      download
                      className="mt-4 px-4 py-2 bg-[#49bace] text-white text-xs font-bold rounded-xl hover:bg-[#3da0bb] transition-colors flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download Receipt
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-gray-500/5 rounded-2xl border-2 border-dashed border-gray-700/50 p-6">
                    <div className="w-12 h-12 bg-[#49bace]/10 rounded-2xl flex items-center justify-center text-[#49bace] mb-3">
                      <CreditCard size={24} />
                    </div>
                    <p className={`text-sm font-bold ${theme.textMain} text-center mb-2`}>No Receipt Uploaded</p>
                    <p className={`text-[10px] ${theme.textDim} text-center`}>User did not upload a payment screenshot</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setReceiptModal({ isOpen: false, deposit: null })}
                className={`px-6 py-3 ${theme.cardBg} border ${theme.border} ${theme.textMain} text-sm font-black uppercase rounded-xl hover:bg-gray-500/10 transition-all`}
              >
                Close
              </button>
              {deposit.status === 'pending' && (
                <>
                  <button
                    onClick={async () => {
                      await handleDirectDepositAction(deposit._id, 2, deposit); // Reject
                      setReceiptModal({ isOpen: false, deposit: null });
                    }}
                    className="px-6 py-3 bg-rose-500 text-white text-sm font-black uppercase rounded-xl shadow-lg shadow-rose-500/20 hover:scale-105 hover:bg-rose-600 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={async () => {
                      await handleDirectDepositAction(deposit._id, 1, deposit); // Approve
                      setReceiptModal({ isOpen: false, deposit: null });
                    }}
                    className="px-6 py-3 bg-emerald-500 text-white text-sm font-black uppercase rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 hover:bg-emerald-600 transition-all"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h3 className={`text-xl font-bold ${theme.textMain}`}>Member Database</h3>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="px-6 py-2 bg-[#49bace] text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all">Add New User</button>
            <button className={`px-6 py-2 ${theme.innerCard} border ${theme.border} ${theme.textMain} text-xs font-black uppercase rounded-xl hover:bg-gray-500/10 transition-all`}>Export CSV</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${theme.border}`}>
                <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>User Identity</th>
                <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Contact</th>
                <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Wallet Balance</th>
                <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Bank Status</th>
                <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Status</th>
                <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Last Active</th>
                <th className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/30' : 'divide-slate-100'}`}>
              {users.map((user, i) => (
                <tr key={user._id} className="hover:bg-gray-500/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#49bace]/10 flex items-center justify-center text-[#49bace] font-bold">{user.name[0]}</div>
                      <div>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{user.name}</p>
                        <p className={`text-[10px] ${theme.textDim} uppercase tracking-tight`}>UID: {user.uid}</p>
                        <p className={`text-[9px] ${theme.textDim}`}>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className={`text-xs ${theme.textMain}`}>{user.phone}</p>
                      <p className={`text-[10px] ${theme.textDim}`}>{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className={`text-sm font-black ${theme.textMain}`}>₹{user.balance.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${user.bankDetails ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {user.bankDetails ? 'Bound' : 'Not Bound'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                      user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 
                      user.status === 'Suspended' ? 'bg-rose-500/10 text-rose-400' : 'bg-[#49bace]/10 text-[#49bace]'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-xs font-bold ${theme.textDim}`}>
                    {new Date(user.lastActive).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openUserDetails(user)}
                        className={`p-2 hover:bg-gray-500/10 rounded-lg ${theme.textDim} hover:text-[#49bace] transition-all`}
                        title="View Details"
                      >
                        <History size={18} />
                      </button>
                      <button 
                        onClick={() => openActionModal(user)}
                        className={`p-2 hover:bg-gray-500/10 rounded-lg ${theme.textDim} hover:text-rose-400 transition-all`}
                        title="User Actions"
                      >
                        <Settings size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="p-8 border-b border-gray-800/20 flex justify-between items-center">
              <h3 className={`text-xl font-bold ${theme.textMain}`}>User Details - {showUserDetails.name}</h3>
              <button 
                onClick={closeModal}
                className={`p-2 ${theme.textDim} hover:text-white hover:bg-gray-500/10 rounded-lg transition-all`}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Info */}
                <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                  <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Personal Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Name</span>
                      <span className={`text-sm font-bold ${theme.textMain}`}>{showUserDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>UID</span>
                      <span className={`text-sm font-bold ${theme.textMain}`}>{showUserDetails.uid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Phone</span>
                      <span className={`text-sm font-bold ${theme.textMain}`}>{showUserDetails.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Email</span>
                      <span className={`text-sm font-bold ${theme.textMain}`}>{showUserDetails.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Status</span>
                      <span className={`text-sm font-bold ${
                        showUserDetails.status === 'Active' ? 'text-emerald-400' : 
                        showUserDetails.status === 'Suspended' ? 'text-rose-400' : 'text-[#49bace]'
                      }`}>
                        {showUserDetails.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Joined</span>
                      <span className={`text-sm font-bold ${theme.textMain}`}>
                        {new Date(showUserDetails.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                  <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Bank Information</h4>
                  {showUserDetails.bankDetails ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Account Holder</span>
                        <span className={`text-sm font-bold ${theme.textMain}`}>
                          {showUserDetails.bankDetails.accountHolder || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Account Number</span>
                        <span className={`text-sm font-bold ${theme.textMain}`}>
                          {showUserDetails.bankDetails.accountNumber 
                            ? `****${showUserDetails.bankDetails.accountNumber.slice(-4)}`
                            : 'Not available'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>IFSC Code</span>
                        <span className={`text-sm font-bold ${theme.textMain}`}>
                          {showUserDetails.bankDetails.ifsc || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Bank Name</span>
                        <span className={`text-sm font-bold ${theme.textMain}`}>
                          {showUserDetails.bankDetails.bankName || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Status</span>
                        <span className={`text-sm font-bold ${
                          showUserDetails.bankDetails.status === 'Verified' ? 'text-emerald-400' :
                          showUserDetails.bankDetails.status === 'Pending' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {showUserDetails.bankDetails.status || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Submitted At</span>
                        <span className={`text-sm font-bold ${theme.textMain}`}>
                          {showUserDetails.bankDetails.submittedAt 
                            ? new Date(showUserDetails.bankDetails.submittedAt).toLocaleDateString()
                            : 'Not available'
                          }
                        </span>
                      </div>
                      {showUserDetails.bankDetails.verifiedAt && (
                        <div className="flex justify-between">
                          <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Verified At</span>
                          <span className={`text-sm font-bold text-emerald-400`}>
                            {new Date(showUserDetails.bankDetails.verifiedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className={`text-sm ${theme.textDim} text-center py-8`}>
                      No bank details bound
                    </p>
                  )}
                </div>

                {/* Quantify History */}
                <div className="md:col-span-2">
                  <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                    <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Transaction History</h4>
                    {showUserDetails.transactions && showUserDetails.transactions.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {showUserDetails.transactions.map((txn, i) => (
                          <div key={i} className={`flex justify-between items-center p-3 rounded-2xl ${theme.cardBg} border ${theme.border}`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${
                                txn.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {txn.type === 'deposit' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                              </div>
                              <div>
                                <p className={`text-sm font-bold ${theme.textMain} capitalize`}>
                                  {txn.type || 'Unknown'}
                                </p>
                                <p className={`text-[10px] ${theme.textDim}`}>
                                  {txn.date ? new Date(txn.date).toLocaleString() : 'Date not available'}
                                </p>
                                {txn.utrNumber && (
                                  <p className={`text-[9px] ${theme.textDim}`}>
                                    UTR: {txn.utrNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className={`text-sm font-black ${
                                  txn.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {txn.type === 'deposit' ? '+' : '-'}
                                  ₹{txn.amount ? txn.amount.toLocaleString() : '0'}
                                </p>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  txn.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                                  txn.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                                  txn.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                                  txn.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'
                                }`}>
                                  {txn.status || 'Unknown'}
                                </span>
                              </div>
                              
                              {/* 3 dots menu for deposit transactions */}
                              {(txn.source === 'deposit_submission' || txn.type === 'deposit') && (
                                <div className="relative">
                                  <button 
                                    onClick={() => toggleDropdown(i)}
                                    className="p-2 rounded-lg hover:bg-gray-700/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#49bace]/50"
                                    aria-label="Transaction actions"
                                    aria-expanded={activeDropdown === i}
                                  >
                                    <MoreVertical size={18} className={`${theme.textDim} hover:text-white`} />
                                  </button>
                                  
                                  {activeDropdown === i && (
                                    <div 
                                      ref={(el) => (dropdownRefs.current[i] = el)}
                                      className={`${theme.dropdownMenu} ${theme.border} absolute right-0 mt-2 w-48 z-50 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200`}
                                      role="menu"
                                      aria-orientation="vertical"
                                      aria-labelledby="transaction-actions-menu"
                                    >
                                      <button
                                        onClick={async () => {
                                          await handleDirectDepositAction(txn._id, 1, txn); // approve
                                          setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-emerald-500/15 hover:text-emerald-400 flex items-center gap-3 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl focus:outline-none focus:bg-emerald-500/20 focus:ring-2 focus:ring-emerald-500/30"
                                        role="menuitem"
                                        tabIndex={activeDropdown === i ? 0 : -1}
                                      >
                                        <CheckCircle2 size={16} className="flex-shrink-0" />
                                        <span>Approve Transaction</span>
                                      </button>
                                      <button
                                        onClick={async () => {
                                          await handleDirectDepositAction(txn._id, 2, txn); // reject
                                          setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-rose-500/15 hover:text-rose-400 flex items-center gap-3 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl focus:outline-none focus:bg-rose-500/20 focus:ring-2 focus:ring-rose-500/30"
                                        role="menuitem"
                                        tabIndex={activeDropdown === i ? 0 : -1}
                                      >
                                        <AlertCircle size={16} className="flex-shrink-0" />
                                        <span>Reject Transaction</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${theme.textDim} text-center py-8`}>
                        No transaction history available
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantify History Section */}
                <div className="md:col-span-2">
                  <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className={`text-lg font-bold ${theme.textMain}`}>Quantify History</h4>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${theme.textDim} bg-gray-500/10`}>
                          Sessions: {userQuantifyHistory.length}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full text-emerald-400 bg-emerald-500/10`}>
                          Total Earned: ₹{userQuantifyHistory.reduce((sum, record) => sum + (record.todayEarning || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {loadingQuantifyHistory ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#49bace]"></div>
                      </div>
                    ) : userQuantifyHistory.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {userQuantifyHistory.map((record, index) => (
                          <div key={index} className={`flex justify-between items-center p-3 rounded-2xl ${theme.cardBg} border ${theme.border}`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${record.isQuantifying ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                <Activity size={16} />
                              </div>
                              <div>
                                <p className={`text-sm font-bold ${theme.textMain}`}>
                                  {new Date(record.date).toLocaleDateString('en-IN', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                <p className={`text-[10px] ${theme.textDim}`}>
                                  {record.quantifyingStartTime ? 
                                    `Started: ${new Date(record.quantifyingStartTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 
                                    'Session completed'}
                                </p>
                                {record.quantifyingEndTime && (
                                  <p className={`text-[9px] ${theme.textDim}`}>
                                    Ended: {new Date(record.quantifyingEndTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className={`text-sm font-black text-emerald-400`}>
                                  +₹{record.todayEarning?.toFixed(2) || '0.00'}
                                </p>
                                <p className={`text-[10px] ${theme.textDim}`}>
                                  Total: ₹{record.totalRevenue?.toFixed(2) || '0.00'}
                                </p>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  record.isQuantifying ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                                }`}>
                                  {record.isQuantifying ? 'ACTIVE' : 'COMPLETED'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${theme.textDim} text-center py-8`}>
                        No quantify history available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="p-8 border-b border-gray-800/20">
              <h3 className={`text-xl font-bold ${theme.textMain}`}>User Actions</h3>
              <p className={`text-sm ${theme.textDim} mt-1`}>
                Manage {actionModal.user?.name}'s account
              </p>
            </div>
            
            <div className="p-8 space-y-4">
              <button 
                onClick={() => handleUserAction(actionModal.user._id, 'block')}
                className="w-full py-4 bg-rose-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
              >
                <X size={16} />
                Block User
              </button>
              
              <button 
                onClick={() => handleUserAction(actionModal.user._id, 'suspend')}
                className="w-full py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
              >
                <AlertCircle size={16} />
                Suspend User
              </button>
              
              <button 
                onClick={() => handleUserAction(actionModal.user._id, 'unsuspend')}
                className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Unsuspend User
              </button>
              
              <button 
                onClick={closeModal}
                className={`w-full py-4 ${theme.innerCard} border ${theme.border} ${theme.textMain} font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-500/10 transition-all mt-6`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSupportChats = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px] animate-in fade-in duration-500">
      {/* Chat List */}
      <div className={`${theme.cardBg} border ${theme.border} rounded-[2rem] overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-gray-800/20">
          <h3 className={`text-sm font-black uppercase tracking-widest ${theme.textMain}`}>Active Chats</h3>
        </div>
        <div className="flex-grow overflow-y-auto">
          {supportChats.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare size={32} className="mx-auto text-gray-700 mb-4" />
              <p className={`text-xs ${theme.textDim} font-bold`}>No active support requests</p>
            </div>
          ) : (
            supportChats.map((chat) => (
              <div 
                key={chat._id} 
                onClick={() => setSelectedChat(chat)}
                className={`p-5 border-b ${theme.border} cursor-pointer transition-all ${selectedChat?._id === chat._id ? 'bg-[#49bace]/10 border-l-4 border-l-[#49bace]' : 'hover:bg-white/[0.02]'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold ${theme.textMain}`}>{chat.userPhone}</span>
                  <span className={`text-[9px] ${theme.textDim}`}>{new Date(chat.lastMessageAt).toLocaleTimeString()}</span>
                </div>
                <p className={`text-xs ${theme.textDim} truncate`}>{chat.messages[chat.messages.length - 1]?.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`lg:col-span-2 ${theme.cardBg} border ${theme.border} rounded-[2rem] overflow-hidden flex flex-col shadow-2xl`}>
        {selectedChat ? (
          <>
            <div className="p-6 border-b border-gray-800/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#49bace]/10 rounded-full flex items-center justify-center text-[#49bace] font-bold">U</div>
                <div>
                  <h4 className={`text-sm font-bold ${theme.textMain}`}>{selectedChat.userPhone}</h4>
                  <p className={`text-[10px] ${theme.textDim} uppercase font-bold tracking-tighter`}>Live Session Active</p>
                </div>
              </div>
              <button onClick={() => setSelectedChat(null)} className={`p-2 ${theme.textDim} hover:text-white`}><X size={20} /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-6 flex flex-col">
              {selectedChat.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                    msg.sender === 'admin' 
                    ? 'bg-[#49bace] text-white rounded-tr-none shadow-lg shadow-[#49bace]/20' 
                    : `${theme.innerCard} ${theme.textMain} border ${theme.border} rounded-tl-none`
                  }`}>
                    {msg.text}
                    <div className={`text-[8px] mt-2 opacity-50 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-800/20">
              <div className={`flex items-center gap-3 ${theme.innerCard} border ${theme.border} rounded-2xl px-6 py-2`}>
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminReply()}
                  placeholder="Type your official reply..." 
                  className={`flex-grow bg-transparent ${theme.textMain} text-sm py-3 outline-none`}
                />
                <button 
                  onClick={handleAdminReply}
                  disabled={!replyText.trim()}
                  className="p-2.5 bg-[#49bace] text-white rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
            <div className="p-8 bg-[#49bace]/5 rounded-full mb-6">
              <MessageSquare size={64} className="text-[#49bace] opacity-20" />
            </div>
            <h3 className={`text-xl font-black ${theme.textMain} mb-2 uppercase tracking-tight`}>Support Mainframe</h3>
            <p className={`${theme.textDim} text-sm font-medium max-w-xs`}>Select an active conversation from the sidebar to begin responding to user queries.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderKYC = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className={`${theme.cardBg} border ${theme.border} rounded-3xl p-6`}>        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-black ${theme.textMain}`}>KYC Verification Requests</h2>
            <p className={`text-sm ${theme.textDim} mt-1`}>Review and approve user identity documents</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm px-3 py-1 rounded-full ${theme.textDim} bg-gray-500/10`}>
              Pending: {kycRequests.length}
            </span>
            <button 
              onClick={fetchKycRequests}
              className="p-2 bg-[#49bace]/10 text-[#49bace] rounded-xl hover:bg-[#49bace]/20 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        
        {loadingKycRequests ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#49bace]"></div>
          </div>
        ) : kycRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme.border} border-b`}>
                  <th className={`py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>User</th>
                  <th className={`py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Documents</th>
                  <th className={`py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Submitted</th>
                  <th className={`py-4 px-4 text-right text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme.border}`}>
                {kycRequests.map((kyc) => (
                  <tr key={kyc._id} className="hover:bg-gray-500/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#49bace]/10 flex items-center justify-center text-[#49bace] font-bold">
                          {kyc.userId?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${theme.textMain}`}>{kyc.userId?.name || kyc.fullName}</p>
                          <p className={`text-[10px] ${theme.textDim} uppercase tracking-tight`}>ID: {kyc._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[9px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400`}>
                          Aadhar
                        </span>
                        <span className={`text-[9px] px-2 py-1 rounded-full bg-green-500/10 text-green-400`}>
                          PAN
                        </span>
                        <span className={`text-[9px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400`}>
                          Bank
                        </span>
                        <span className={`text-[9px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400`}>
                          Photo
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className={`text-sm ${theme.textMain}`}>
                        {new Date(kyc.submittedAt).toLocaleDateString()}
                      </p>
                      <p className={`text-[10px] ${theme.textDim}`}>
                        {new Date(kyc.submittedAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => openKycDetails(kyc)}
                        className="px-4 py-2 bg-[#49bace] text-white text-xs font-black rounded-xl hover:bg-[#49bace]/80 transition-all flex items-center gap-2"
                      >
                        <Eye size={14} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-6 bg-[#49bace]/5 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <FileText size={32} className="text-[#49bace] opacity-50" />
            </div>
            <h3 className={`text-lg font-black ${theme.textMain} mb-2`}>No Pending KYC Requests</h3>
            <p className={`text-sm ${theme.textDim}`}>All KYC verifications are up to date</p>
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
          <div key={i} className={`${theme.cardBg} border ${theme.border} rounded-3xl p-6 shadow-xl hover:border-[#49bace]/30 transition-all group`}>
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
            <p className={`${theme.textDim} text-xs font-bold uppercase tracking-widest`}>{s.label}</p>
            <p className={`text-3xl font-black ${theme.textMain} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Statistics */}
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>Deposit Overview</h3>
            <ArrowUpRight size={24} className="text-emerald-400" />
          </div>
          <div className="space-y-4">
            <div className={`${theme.innerCard} rounded-2xl p-4 border ${theme.border}`}>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Total Deposits</span>
                <span className={`text-lg font-black ${theme.textMain}`}>{dashboardStats.totalDeposits}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className={`${theme.innerCard} rounded-2xl p-4 border border-amber-500/20`}>
                <p className={`text-[9px] ${theme.textDim} uppercase font-bold mb-1`}>Pending</p>
                <p className="text-2xl font-black text-amber-400">{dashboardStats.pendingDeposits}</p>
              </div>
              <div className={`${theme.innerCard} rounded-2xl p-4 border border-emerald-500/20`}>
                <p className={`text-[9px] ${theme.textDim} uppercase font-bold mb-1`}>Approved</p>
                <p className="text-2xl font-black text-emerald-400">{dashboardStats.approvedDeposits}</p>
              </div>
              <div className={`${theme.innerCard} rounded-2xl p-4 border border-rose-500/20`}>
                <p className={`text-[9px] ${theme.textDim} uppercase font-bold mb-1`}>Rejected</p>
                <p className="text-2xl font-black text-rose-400">{dashboardStats.rejectedDeposits}</p>
              </div>
            </div>
            <div className={`${theme.innerCard} rounded-2xl p-4 border ${theme.border}`}>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Total Amount</span>
                <span className={`text-lg font-black ${theme.textMain}`}>₹{(dashboardStats.totalDepositsAmount / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Statistics */}
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>Withdrawal Overview</h3>
            <ArrowDownLeft size={24} className="text-rose-400" />
          </div>
          <div className="space-y-4">
            <div className={`${theme.innerCard} rounded-2xl p-4 border ${theme.border}`}>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Total Withdrawals</span>
                <span className={`text-lg font-black ${theme.textMain}`}>{dashboardStats.totalWithdrawals}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className={`${theme.innerCard} rounded-2xl p-4 border border-amber-500/20`}>
                <p className={`text-[9px] ${theme.textDim} uppercase font-bold mb-1`}>Pending</p>
                <p className="text-2xl font-black text-amber-400">{dashboardStats.pendingWithdrawals}</p>
              </div>
              <div className={`${theme.innerCard} rounded-2xl p-4 border border-emerald-500/20`}>
                <p className={`text-[9px] ${theme.textDim} uppercase font-bold mb-1`}>Approved</p>
                <p className="text-2xl font-black text-emerald-400">{dashboardStats.approvedWithdrawals}</p>
              </div>
              <div className={`${theme.innerCard} rounded-2xl p-4 border border-rose-500/20`}>
                <p className={`text-[9px] ${theme.textDim} uppercase font-bold mb-1`}>Rejected</p>
                <p className="text-2xl font-black text-rose-400">{dashboardStats.rejectedWithdrawals}</p>
              </div>
            </div>
            <div className={`${theme.innerCard} rounded-2xl p-4 border ${theme.border}`}>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Total Amount</span>
                <span className={`text-lg font-black ${theme.textMain}`}>₹{(dashboardStats.totalWithdrawalsAmount / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank & KYC Statistics */}
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>Bank & KYC Status</h3>
            <ShieldCheck size={24} className="text-[#49bace]" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Bank Requests</h4>
              <div className={`${theme.innerCard} rounded-2xl p-4 border ${theme.border}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[9px] ${theme.textDim}`}>Total</span>
                  <span className={`text-lg font-black ${theme.textMain}`}>{dashboardStats.totalBankRequests}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full font-bold">Verified: {dashboardStats.verifiedBanks}</span>
                  <span className="text-[8px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full font-bold">Pending: {dashboardStats.pendingBanks}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className={`text-[10px] ${theme.textDim} uppercase font-bold`}>KYC Verification</h4>
              <div className={`${theme.innerCard} rounded-2xl p-4 border ${theme.border}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[9px] ${theme.textDim}`}>Total</span>
                  <span className={`text-lg font-black ${theme.textMain}`}>{dashboardStats.kycPending + dashboardStats.kycApproved + dashboardStats.kycRejected}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-[8px] text-emerald-400 font-bold">✓ {dashboardStats.kycApproved}</span>
                    <span className="text-[8px] text-amber-400 font-bold">⏳ {dashboardStats.kycPending}</span>
                    <span className="text-[8px] text-rose-400 font-bold">✗ {dashboardStats.kycRejected}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>User Analytics</h3>
            <Users size={24} className="text-blue-400" />
          </div>
          <div className="space-y-4">
            <div className={`${theme.innerCard} rounded-2xl p-6 border ${theme.border}`}>
              <div className="flex justify-between items-center mb-4">
                <span className={`text-[10px] ${theme.textDim} uppercase font-bold`}>Total Users</span>
                <span className={`text-3xl font-black ${theme.textMain}`}>{dashboardStats.totalUsers}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#49bace] to-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${dashboardStats.totalUsers > 0 ? (dashboardStats.activeUsers / dashboardStats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-[9px] text-emerald-400 font-bold">Active: {dashboardStats.activeUsers}</span>
                <span className="text-[9px] text-gray-400 font-bold">Inactive: {dashboardStats.totalUsers - dashboardStats.activeUsers}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${theme.innerCard} rounded-2xl p-4 border border-emerald-500/20`}>
                <p className={`text-[9px] ${theme.textDim} uppercase font-bold mb-1`}>Active Rate</p>
                <p className="text-2xl font-black text-emerald-400">
                  {dashboardStats.totalUsers > 0 ? ((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className={`${theme.innerCard} rounded-2xl p-4 border border-blue-500/20`}>
                <p className={`text-[9px] ${theme.textDim} uppercase font-bold mb-1`}>Platform Growth</p>
                <p className="text-2xl font-black text-blue-400">+{Math.floor(dashboardStats.totalUsers / 10)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Status Chart */}
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>Deposit Status Distribution</h3>
            <ArrowUpRight size={24} className="text-emerald-400" />
          </div>
          {chartData.deposits.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.deposits}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.deposits.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1a1f2e' : '#ffffff', 
                    border: `1px solid ${isDarkMode ? '#2d3748' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className={`${theme.textDim} text-sm`}>No deposit data available</p>
            </div>
          )}
        </div>

        {/* Withdrawal Status Chart */}
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>Withdrawal Status Distribution</h3>
            <ArrowDownLeft size={24} className="text-rose-400" />
          </div>
          {chartData.withdrawals.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.withdrawals}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.withdrawals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1a1f2e' : '#ffffff', 
                    border: `1px solid ${isDarkMode ? '#2d3748' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className={`${theme.textDim} text-sm`}>No withdrawal data available</p>
            </div>
          )}
        </div>

        {/* Bank & KYC Bar Charts */}
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>Bank Verification Status</h3>
            <Landmark size={24} className="text-cyan-400" />
          </div>
          {chartData.banks.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.banks}>
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1a1f2e' : '#ffffff', 
                    border: `1px solid ${isDarkMode ? '#2d3748' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className={`${theme.textDim} text-sm`}>No bank data available</p>
            </div>
          )}
        </div>

        {/* KYC Status Chart */}
        <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>KYC Verification Status</h3>
            <ShieldCheck size={24} className="text-blue-400" />
          </div>
          {chartData.kyc.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.kyc}>
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1a1f2e' : '#ffffff', 
                    border: `1px solid ${isDarkMode ? '#2d3748' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className={`${theme.textDim} text-sm`}>Data Not Found - No KYC data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart/Table Area */}
        <div className={`lg:col-span-2 ${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-xl font-bold ${theme.textMain}`}>Recent Transactions</h3>
            <button className="text-[#49bace] text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {[
              { uid: '775383', user: 'Member_X', type: 'Deposit', amount: '₹5,000', status: 'Completed', time: '12:45 PM' },
              { uid: '775384', user: 'Trader_A', type: 'Withdraw', amount: '₹1,200', status: 'Pending', time: '01:10 PM' },
              { uid: '775385', user: 'Crypto_K', type: 'Deposit', amount: '₹10,000', status: 'Processing', time: '01:30 PM' },
            ].map((t, i) => (
              <div key={i} className={`flex items-center justify-between p-4 ${theme.innerCard} rounded-3xl border ${theme.border} hover:border-[#49bace]/20 transition-all`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${t.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {t.type === 'Deposit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${theme.textMain}`}>{t.user}</p>
                    <p className={`text-[10px] ${theme.textDim} uppercase font-medium`}>UID: {t.uid} â€¢ {t.time}</p>
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

          <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl`}>
            <h4 className={`font-bold ${theme.textMain} mb-6`}>Pending Verifications</h4>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className={`flex items-center justify-between p-4 ${theme.innerCard} rounded-2xl border ${theme.border}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#49bace]/10 rounded-full flex items-center justify-center text-[#49bace] font-bold">U</div>
                    <div>
                      <p className={`text-xs font-bold ${theme.textMain}`}>KYC Verification</p>
                      <p className={`text-[9px] ${theme.textDim} uppercase`}>UID: 882193</p>
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
    <div className={`flex flex-col min-h-screen ${theme.pageBg} font-sans transition-colors duration-500`}>
      <div className="flex flex-grow overflow-hidden">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Desktop & Mobile */}
        <aside className={`fixed lg:relative z-50 w-[280px] sm:w-[300px] lg:w-[23%] flex-shrink-0 ${theme.sidebarBg} border-r ${theme.border} transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header - Fixed */}
            <div className="p-4 sm:p-6 md:p-8 flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-8 md:mb-12">
                <div className="p-2 bg-[#49bace] rounded-xl sm:rounded-2xl shadow-[0_0_15px_rgba(73,186,206,0.3)] sm:shadow-[0_0_20px_rgba(73,186,206,0.4)]">
                  <ShieldCheck size={28} className={isDarkMode ? 'text-[#101821]' : 'text-white'} />
                </div>
                <div>
                  <h1 className={`text-lg sm:text-xl font-black ${theme.textMain} leading-tight uppercase tracking-tighter`}>Admin<br/><span className="text-[#49bace]">CORE</span></h1>
                </div>
              </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-grow overflow-y-auto px-4 sm:px-6 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 sm:space-x-4 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all group ${
                    activeTab === item.id 
                    ? 'bg-gradient-to-r from-[#49bace]/15 to-[#49bace]/5 text-[#49bace] shadow-md sm:shadow-lg shadow-black/20 border-l-2 border-[#49bace]' 
                    : `${theme.textDim} hover:text-[#49bace] hover:bg-[#49bace]/5 border-l-2 border-transparent`
                  }`}
                >
                  <item.icon size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Footer - Fixed */}
            <div className="p-4 sm:p-6 flex-shrink-0 mt-auto">
              <div className={`${theme.innerCard} rounded-2xl sm:rounded-[2rem] border ${theme.border}`}>
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 p-4 sm:p-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#49bace] rounded-full flex items-center justify-center font-black text-white text-xs sm:text-sm">AD</div>
                  <div>
                    <p className={`text-[10px] sm:text-xs font-bold ${theme.textMain} uppercase`}>Root Admin</p>
                    <p className={`text-[8px] sm:text-[10px] ${theme.textDim}`}>System Secure</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    // Remove admin-related tokens
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('isAdmin');
                    localStorage.removeItem('adminData');
                    
                    // Navigate to admin login
                    window.location.href = '/c/login';
                  }}
                  className="w-full py-2 sm:py-2.5 bg-rose-500/10 text-rose-500 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1 sm:gap-2 border-t border-gray-800/20"
                >
                  <LogOut size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="truncate">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Responsive */}
        <main className="flex-grow flex flex-col h-full overflow-auto lg:ml-0">
          {/* Top Navigation - Responsive & Enhanced */}
          <header className={`sticky top-0 z-30 ${theme.headerBg} backdrop-blur-xl border-b ${theme.border} px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 transition-colors shadow-lg`}>
            <div className="flex items-center space-x-4 sm:space-x-6 flex-grow w-full">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className={`p-2.5 ${theme.cardBg} ${theme.textDim} hover:text-[#49bace] hover:bg-[#49bace]/10 rounded-xl transition-all lg:hidden shadow-sm border ${theme.border}`}
              >
                <Menu size={20} className="sm:w-6 sm:h-6" />
              </button>
              
              {/* Logo for Mobile */}
              <div className="lg:hidden flex items-center space-x-2">
                <div className="p-2 bg-[#49bace] rounded-xl shadow-[0_0_10px_rgba(73,186,206,0.3)]">
                  <ShieldCheck size={20} className={isDarkMode ? 'text-[#101821]' : 'text-white'} />
                </div>
                <h1 className={`text-base font-black ${theme.textMain} leading-tight uppercase tracking-tighter`}>Admin<br/><span className="text-[#49bace]">CORE</span></h1>
              </div>
              
              <div className="flex-grow relative group max-w-2xl">
                <Search
                  size={16}
                  className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 sm:w-4.5 sm:h-4.5 ${theme.textDim} group-focus-within:text-[#49bace] transition-colors`}
                />
                <input 
                  type="text" 
                  placeholder="Search (UID, TXID, Phone)..." 
                  className={`w-full ${theme.cardBg} border ${theme.border} rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#49bace]/50 focus:ring-2 focus:ring-[#49bace]/10 transition-all placeholder:text-gray-600 ${theme.textMain}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 sm:p-3 ${theme.cardBg} ${theme.textDim} hover:text-[#49bace] hover:bg-[#49bace]/10 rounded-xl sm:rounded-2xl border ${theme.border} transition-all shadow-sm hover:scale-105`}
              >
                {isDarkMode ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
              </button>
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 sm:p-3 ${theme.cardBg} ${theme.textDim} hover:text-[#49bace] hover:bg-[#49bace]/10 rounded-xl sm:rounded-2xl border ${theme.border} relative transition-all shadow-sm hover:scale-105`}
                >
                  <Bell size={18} className="sm:w-5 sm:h-5" />
                  <span className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#49bace] rounded-full shadow-[0_0_8px_#49bace] animate-pulse"></span>
                </button>
              
                {showNotifications && (
                  <div className={`absolute right-0 mt-4 w-80 md:w-96 ${theme.cardBg} border ${theme.border} rounded-[2rem] shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300 overflow-hidden`}>
                    <div className="p-6 border-b border-gray-800/20 flex justify-between items-center">
                      <h3 className={`font-black uppercase tracking-widest text-xs ${theme.textMain}`}>Notifications</h3>
                      <span className="text-[10px] font-bold text-[#49bace] bg-[#49bace]/10 px-2 py-0.5 rounded-full">4 New</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-5 border-b ${theme.border} hover:bg-gray-500/[0.03] transition-colors cursor-pointer group`}>
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-xl flex-shrink-0 ${
                              n.type === 'Payment' ? 'bg-blue-500/10 text-blue-400' :
                              n.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {n.type === 'Payment' ? <ShieldCheck size={18} /> : 
                               n.type === 'Deposit' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                                  n.type === 'Payment' ? 'text-blue-400' :
                                  n.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'
                                }`}>{n.type}</span>
                                <span className={`text-[9px] ${theme.textDim}`}>{n.time}</span>
                              </div>
                              <p className={`text-sm font-bold ${theme.textMain} truncate mb-0.5`}>{n.title}</p>
                              <p className={`text-xs ${theme.textDim} line-clamp-1`}>{n.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className={`w-full py-4 text-[10px] font-black uppercase tracking-widest ${theme.textDim} hover:text-[#49bace] transition-colors border-t ${theme.border}`}>
                      Clear All Notifications
                    </button>
                  </div>
                )}
              </div>
              <div className="h-10 w-[1px] ${theme.border} mx-2"></div>
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="text-right hidden md:block">
                  <p className={`text-[10px] sm:text-xs font-bold ${theme.textMain} group-hover:text-[#49bace] transition-colors whitespace-nowrap`}>Super User</p>
                  <p className={`text-[8px] sm:text-[10px] ${theme.textDim} uppercase tracking-tighter whitespace-nowrap`}>Master Key Active</p>
                </div>
                <MoreVertical size={20} className={`${theme.textDim} hover:text-[#49bace] transition-colors`} />
              </div>
            </div>
          </header>

          {/* Content Container - Responsive */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full pb-16 sm:pb-20 md:pb-24">
            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#49bace] mb-1 sm:mb-2">Internal Management</h2>
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black ${theme.textMain} capitalize tracking-tighter`}>
                System <span className="text-[#49bace] opacity-50">/</span> {activeTab}
              </h1>
            </div>

            {activeTab === 'dashboard' ? renderDashboard() : 
            activeTab === 'users' ? renderUsers() : 
            activeTab === 'payments' ? renderPayments() :
            activeTab === 'kyc' ? renderKYC() : 
            activeTab === 'withdrawals' ? renderWithdrawalVerify() : 
            activeTab === 'approved-withdrawals' ? renderApprovedWithdrawals() : 
            activeTab === 'approved-deposits' ? renderApprovedDeposits() : 
            activeTab === 'support' ? renderSupportChats() :

            activeTab === 'bank' ? renderBankDetails() :
            activeTab === 'recharge' ? renderRecharge() :
            activeTab === 'gifts' ? renderGifts() :
            activeTab === 'tasks' ? renderTasks() :
            activeTab === 'user-tasks' ? renderUserTasks() :
            activeTab === 'qr-management' ? <QRManagement theme={theme} isDarkMode={isDarkMode} /> : (
              <div className={`${theme.cardBg} border ${theme.border} rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 text-center shadow-xl sm:shadow-2xl animate-in slide-in-from-bottom-4 duration-500`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#49bace]/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <AlertCircle size={32} className="sm:w-10 sm:h-10 text-[#49bace]" />
                </div>
                <h2 className={`text-xl sm:text-2xl font-black ${theme.textMain} mb-2 uppercase tracking-tight`}>{activeTab} View</h2>
                <p className={`${theme.textDim} text-sm font-medium mb-6 sm:mb-8 max-w-xs sm:max-w-sm mx-auto`}>This module is currently initializing. Visual components and data streams will be connected shortly.</p>
                <button onClick={() => setActiveTab('dashboard')} className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#49bace] text-white font-black rounded-xl sm:rounded-2xl uppercase tracking-widest text-[10px] sm:text-xs hover:scale-[1.02] sm:hover:scale-105 active:scale-[0.98] sm:active:scale-95 transition-all shadow-lg shadow-[#49bace]/20">Return to CORE</button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Full-Width Footer */}
      <footer className={`px-12 py-8 border-t ${theme.border} ${theme.headerBg} backdrop-blur-md z-50`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#49bace] rounded-lg">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${theme.textMain}`}>
              Admin<span className="text-[#49bace]">CORE</span> <span className={`${theme.textDim} ml-2 font-bold`}>v2.4.0 Secure Engine</span>
            </p>
          </div>
          
          <div className="flex gap-8">
            {['System Logs', 'Documentation', 'Audit Protocol', 'Support'].map((link) => (
              <button key={link} className={`text-[10px] font-black uppercase tracking-widest ${theme.textDim} hover:text-[#49bace] transition-colors`}>
                {link}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${theme.textDim}`}>Mainframe Online</p>
          </div>
        </div>
      </footer>

      {/* Render modals */}
      <ReceiptModal />

      {/* Deposit Action Confirmation Modal - inline rendering */}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${theme.cardBg} border ${theme.border} rounded-2xl w-full max-w-md sm:max-w-lg p-6 shadow-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button 
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  resetTaskForm();
                }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#49bace] transition-colors`}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#49bace] transition-colors resize-none`}
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Reward * (₹)</label>
                  <input
                    type="number"
                    value={taskForm.reward}
                    onChange={(e) => setTaskForm({...taskForm, reward: e.target.value})}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#49bace] transition-colors`}
                    placeholder="Enter reward amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Value</label>
                  <input
                    type="number"
                    value={taskForm.targetValue}
                    onChange={(e) => setTaskForm({...taskForm, targetValue: e.target.value})}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#49bace] transition-colors`}
                    placeholder="Enter target value"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                  <select
                    value={taskForm.type}
                    onChange={(e) => setTaskForm({...taskForm, type: e.target.value})}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#49bace] transition-colors`}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({...taskForm, category: e.target.value})}
                    className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#49bace] transition-colors`}
                  >
                    <option value="deposit">Deposit</option>
                    <option value="transaction">Transaction</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => {
                  if (editingTask) {
                    handleUpdateTask();
                  } else {
                    handleCreateTask();
                  }
                }}
                disabled={!taskForm.title || !taskForm.reward}
                className="flex-1 py-3 bg-[#49bace] text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  resetTaskForm();
                }}
                className="py-3 px-6 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-500 transition-colors sm:ml-0"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Details Modal */}
      {kycDetailsModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="p-8 border-b border-gray-800/20 flex justify-between items-center">
              <h3 className={`text-xl font-bold ${theme.textMain}`}>KYC Verification Details</h3>
              <button 
                onClick={closeKycDetails}
                className={`p-2 ${theme.textDim} hover:text-white hover:bg-gray-500/10 rounded-lg transition-all`}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh]">
              {kycDetailsModal.kyc && (
                <div className="space-y-8">
                  {/* User Information */}
                  <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                    <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>User Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Full Name</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.fullName}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Mobile Number</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.mobileNumber}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Email Address</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.emailAddress}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Submitted Date</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>
                          {new Date(kycDetailsModal.kyc.submittedAt).toLocaleDateString()} at {new Date(kycDetailsModal.kyc.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Details */}
                  <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                    <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Document Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Aadhar Number</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.aadharNumber}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>PAN Number</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.panNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address Details */}
                  <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                    <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Address Information</h4>
                    <div>
                      <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Full Address</p>
                      <p className={`text-sm font-bold ${theme.textMain}`}>
                        {kycDetailsModal.kyc.address}, {kycDetailsModal.kyc.city}, {kycDetailsModal.kyc.state} - {kycDetailsModal.kyc.pinCode}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bank Details */}
                  <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                    <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Bank Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Bank Name</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.bankName}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Account Number</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.accountNumber}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>IFSC Code</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.ifscCode}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${theme.textDim} uppercase font-bold mb-1`}>Branch Name</p>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{kycDetailsModal.kyc.branchName}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Images */}
                  <div className={`${theme.innerCard} border ${theme.border} rounded-3xl p-6`}>
                    <h4 className={`text-lg font-bold ${theme.textMain} mb-4`}>Uploaded Documents</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { name: 'Aadhar Front', image: kycDetailsModal.kyc.aadharFront },
                        { name: 'Aadhar Back', image: kycDetailsModal.kyc.aadharBack },
                        { name: 'PAN Card', image: kycDetailsModal.kyc.panCard },
                        { name: 'Bank Passbook', image: kycDetailsModal.kyc.bankPassbook },
                        { name: 'User Photo', image: kycDetailsModal.kyc.userPhoto }
                      ].map((doc, index) => (
                        <div key={index} className="space-y-2">
                          <p className={`text-[10px] ${theme.textDim} uppercase font-bold text-center`}>{doc.name}</p>
                          {doc.image ? (
                            <div className="relative group">
                              <img 
                                src={`data:image/jpeg;base64,${doc.image}`} 
                                alt={doc.name}
                                className="w-full h-32 object-cover rounded-lg border border-gray-700"
                              />
                              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye size={20} className="text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gray-700/50 rounded-lg flex items-center justify-center border border-gray-700">
                              <FileText size={24} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-800/20">
                    <button
                      onClick={() => handleKycAction(kycDetailsModal.kyc._id, 'approve')}
                      disabled={kycActionLoading}
                      className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {kycActionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check size={20} />
                          Approve KYC
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        const reason = prompt('Please enter rejection reason:');
                        if (reason) {
                          setRejectionReason(reason);
                          handleKycAction(kycDetailsModal.kyc._id, 'reject');
                        }
                      }}
                      disabled={kycActionLoading}
                      className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {kycActionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <X size={20} />
                          Reject KYC
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-500"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
  

}
export default AdminPanel;
