import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './components/home';
import Mine from './components/mine';
import Quantify from './components/quantify';
import QuantifyHistory from './components/quantifyHistory';
import Record from './components/record';
import Task from './components/task';
import NavBar from './components/navbar';
import Bind from './components/bind';
import Login from './Auth/login';
import Register from './Auth/register';
// import AuthIcon from './Auth/AuthIcon';
import './App.css';
import Withdraw from './components/Withdraw';
import Password from './components/password';
import Mission from './components/mission';
import White from './components/white';
import Deposite from './components/deposite';
import Transcation from './components/transcation';
import Authpass from './components/authpass';
import AdminPanel from './admin/AdminPanel';
import AdminLogin from './admin/AdminLogin';
import Language from './components/language';
import About from './components/about';
import Notifications from './components/notifications';
import Support from './components/support';
import Feedback from './components/feedback';
import Tutorial from './components/tutorial';
import Game from './components/game';
import UPIQRPayment from './components/UPIQRPayment';
import UmoneyQRPayment from './components/UmoneyQRPayment';
import SuperQRPayment from './components/SuperQRPayment';
import CloudspayQRPayment from './components/CloudspayQRPayment';
import PaymentSuccess from './components/PaymentSuccess';
import KYC from './components/kyc';
import Team from './components/team';
import ReferAndEarn from './components/ReferAndEarn';
import PlatformInfo from './components/platform';
import AppDownload from './components/AppDownload';
import EarningPotential from './components/earningPotential';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/c/');
  
  const hideNavBar = location.pathname === '/login' || 
  location.pathname === '/register' || 
  location.pathname === '/withdraw' || 
  location.pathname === '/password' || 
  location.pathname === '/bind' ||
  location.pathname === '/deposite' ||
  location.pathname === '/language' ||
  location.pathname === '/about' ||
  location.pathname === '/notifications' ||
  location.pathname === '/support' ||
  location.pathname === '/feedback' ||
  location.pathname === '/tutorial' ||
  location.pathname === '/kyc' ||
  location.pathname === '/team' ||
  location.pathname === '/refer-earn' ||
  location.pathname === '/platform-info' ||
  location.pathname === '/download-app' ||
  location.pathname.startsWith('/payment/') || // Hide navbar for all payment pages
  isAdminPath;

  const MainApp = (
    <div className='flex flex-col h-full w-full relative'>
      <div className={`w-full overflow-auto ${hideNavBar ? '' : 'pb-20'}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/mine' element={<ProtectedRoute><Mine /></ProtectedRoute>} />
          <Route path='/quantify' element={<ProtectedRoute><Quantify /></ProtectedRoute>} />
          <Route path='/quantify/history' element={<ProtectedRoute><QuantifyHistory /></ProtectedRoute>} />
          <Route path='/record' element={<ProtectedRoute><Record /></ProtectedRoute>} />
          <Route path='/task' element={<ProtectedRoute><Task /></ProtectedRoute>} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/withdraw' element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
          <Route path='/password' element={<ProtectedRoute><Password /></ProtectedRoute>} />
          <Route path='/bind' element={<ProtectedRoute><Bind /></ProtectedRoute>} />
          <Route path="/mission" element={<ProtectedRoute><Mission /></ProtectedRoute>} />
          <Route path="/white" element={<ProtectedRoute><White /></ProtectedRoute>} />
          <Route path="/deposite" element={<ProtectedRoute><Deposite /></ProtectedRoute>} />
          <Route path="/transcation" element={<ProtectedRoute><Transcation /></ProtectedRoute>} />
          <Route path="/authpass" element={<ProtectedRoute><Authpass /></ProtectedRoute>} />
          <Route path="/language" element={<ProtectedRoute><Language /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/tutorial" element={<ProtectedRoute><Tutorial /></ProtectedRoute>} />
          <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/payment/upi-qr" element={<ProtectedRoute><UPIQRPayment /></ProtectedRoute>} />
          <Route path="/payment/umoney-qr" element={<ProtectedRoute><UmoneyQRPayment /></ProtectedRoute>} />
          <Route path="/payment/super-qr" element={<ProtectedRoute><SuperQRPayment /></ProtectedRoute>} />
          <Route path="/payment/cloudspay-qr" element={<ProtectedRoute><CloudspayQRPayment /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          <Route path="/refer-earn" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
          <Route path="/platform-info" element={<ProtectedRoute><PlatformInfo /></ProtectedRoute>} />
          <Route path="/download-app" element={<AppDownload />} />
          <Route path="/earning-potential" element={<ProtectedRoute><EarningPotential /></ProtectedRoute>} />
          <Route path='/c/login' element={<AdminLogin />} />
          <Route path='*' element={<ProtectedRoute><Home /></ProtectedRoute>} />
        </Routes>
      </div>
      {!hideNavBar && (
        <div className="fixed bottom-0 w-full z-50">
          <NavBar />
        </div>
      )}
    </div>
  );

  if (isAdminPath) {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminToken = localStorage.getItem('adminToken');
    
    if (!isAdmin || !adminToken) {
      return <AdminLogin />;
    }
    
    return (
      <Routes>
        <Route path="/c/69805d29-3bcc-8323-a9b3-74765bdecb80" element={<AdminPanel />} />
        <Route path="/c/login" element={<AdminLogin />} />
        <Route path="/c/*" element={<AdminLogin />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f16]">
      <div className="bg-[#101821] w-full md:max-w-[27rem] min-h-screen md:min-h-[90vh] md:rounded-[3rem] shadow-2xl overflow-hidden relative border-gray-800 md:border">
        {MainApp}
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <div className='App'>
        <App />
      </div>
    </Router>
  );
}

export default AppWrapper;