import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, QrCode, Info, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const UPIQRPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState(searchParams.get('amount') || '100.00');
  const [timer, setTimer] = useState('14:49');
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [lastPaymentTime, setLastPaymentTime] = useState(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        const [minutes, seconds] = prev.split(':').map(Number);
        if (minutes === 0 && seconds === 0) {
          clearInterval(interval);
          return '00:00';
        }
        if (seconds === 0) {
          return `${minutes - 1}:59`;
        }
        return `${minutes}:${seconds - 1 < 10 ? '0' : ''}${seconds - 1}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Scanning animation effect
  useEffect(() => {
    if (isScanning) {
      const scanInterval = setInterval(() => {
        setIsScanning(prev => !prev);
      }, 800);
      return () => clearInterval(scanInterval);
    }
  }, [isScanning]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('8252462523@ptyes');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const startScanning = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const handleSubmit = async () => {
    if (utr.length !== 12) {
      alert('Please enter a valid 12-digit UTR');
      return;
    }
    
    // Check if last payment was within 30 minutes
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000); // 30 minutes in milliseconds
    
    if (lastPaymentTime && lastPaymentTime > thirtyMinutesAgo) {
      setShowTimeoutModal(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/deposit/submit`, {
        amount: parseFloat(amount),
        utrNumber: utr
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Redirect to success page
      navigate('/payment/success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Error submitting payment. Please try again.');
      }
      console.error('Error submitting deposit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen text-white pb-24 font-sans overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-gray-800">
        <button 
          onClick={() => navigate('/deposite')} 
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300"
        >
          <ChevronLeft size={20} className="text-cyan-400" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            ArUpiPay
          </h1>
        </div>
        <button className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-black rounded-full hover:scale-105 transition-transform">
          CUSTOMER SERVICE
        </button>
      </div>

      <div className="px-4 mt-6 space-y-8 relative z-10">
        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-sm text-gray-400 font-bold uppercase tracking-widest">Amount Payable</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-black text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                  {timer}
                </span>
              </div>
            </div>
            <div className="flex items-end space-x-3">
              <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ₹{amount}
              </span>
              <Copy 
                size={20} 
                className="text-gray-500 hover:text-cyan-400 cursor-pointer transition-colors mb-1" 
                onClick={() => navigator.clipboard.writeText(amount)}
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-center text-gray-300 uppercase tracking-widest">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handlePaymentMethodSelect('paytm')}
              className={`p-6 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 ${
                paymentMethod === 'paytm' 
                  ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-black text-lg">P</span>
                </div>
                <div>
                  <p className="text-white font-black text-lg">Paytm</p>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Wake up support</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handlePaymentMethodSelect('phonepe')}
              className={`p-6 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 ${
                paymentMethod === 'phonepe' 
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-purple-400'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-black text-lg">Pe</span>
                </div>
                <div>
                  <p className="text-white font-black text-lg">PhonePe</p>
                  <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">Wake up support</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* QR Code Section - Futuristic Design */}
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-300 flex items-center gap-2">
                <QrCode size={24} className="text-cyan-400" />
                SCAN TO PAY
              </h3>
              <button 
                onClick={startScanning}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-black rounded-full hover:scale-105 transition-transform flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Scanning...
                  </>
                ) : 'START SCAN'}
              </button>
            </div>
            
            {/* QR Code with Futuristic Frame */}
            <div className="relative mx-auto mb-8 max-w-xs">
              <div className={`bg-gray-900 p-6 rounded-3xl border-4 transition-all duration-500 ${
                isScanning ? 'border-cyan-400 shadow-2xl shadow-cyan-400/50 animate-pulse' : 'border-gray-700'
              }`}>
                <div className="bg-white p-4 rounded-2xl flex items-center justify-center w-64 h-64 mx-auto">
                  <div className="text-center">
                    <QrCode size={120} className="text-gray-800 mb-2" />
                    <p className="text-xs text-gray-600 font-bold">QR CODE</p>
                  </div>
                </div>
              </div>
              
              {/* Scan Animation Effect */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-1 bg-cyan-400 rounded-full animate-scan"></div>
                </div>
              )}
            </div>

            {/* Instructions Card */}
            <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="font-bold">Please use another device to scan the QR code with your payment app</p>
                  <p>If you scan the QR code from this device's...</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-black rounded-xl transition-all border border-gray-700">
                Cancel
              </button>
              <button 
                disabled={!utr}
                className={`flex-1 py-3 rounded-xl font-black transition-all ${
                  utr ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:scale-105' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {utr ? 'Submit' : 'Submit (UTR not entered)'}
              </button>
            </div>
          </div>
        </div>

        {/* UTR Input Section - Futuristic Design */}
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5"></div>
          <div className="relative">
            <h3 className="text-xl font-black mb-6 text-gray-300 flex items-center gap-2">
              <Info size={24} className="text-purple-400" />
              INPUT UTR / PASTE UTR
            </h3>
            
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start space-x-3">
              <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300 font-bold">
                If you do not back fill UTR / paste UTR, 100% will fail.
              </p>
            </div>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Input 12 digits here"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                className="w-full bg-gray-900 border-2 border-gray-700 rounded-2xl px-6 py-4 text-lg font-black text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
              />
              <button 
                onClick={() => navigator.clipboard.readText().then(text => {
                  if (text && text.length === 12 && /^\d+$/.test(text)) {
                    setUtr(text);
                  }
                })}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl hover:scale-105 transition-transform"
              >
                PASTE
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {utr.length === 12 ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : (
                  <AlertCircle size={20} className="text-yellow-400" />
                )}
                <span className={`text-sm font-bold ${utr.length === 12 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {utr.length}/12 digits entered
                </span>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={utr.length !== 12}
                className={`px-8 py-3 rounded-2xl font-black transition-all transform hover:scale-105 ${
                  utr.length === 12 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                SUBMIT
              </button>
            </div>
            
            <p className="text-xs text-orange-400 font-bold bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
              Open your UP wallet and complete the transfer. Record your reference No. (Ref No.) after payment.
            </p>
          </div>
        </div>

        {/* Important Reminders - Futuristic Design */}
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl border-2 border-red-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="text-xl font-black text-red-400 uppercase tracking-widest">Important Reminder</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-red-300 font-bold">Do not pay for the same link repeatedly!</span>
              </li>
              <li className="flex items-start space-x-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <span className="text-2xl font-black text-purple-400">✓</span>
                <span className="text-purple-300 font-bold">Paytm is wake up support!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-red-400 flex items-center gap-2">
                <AlertCircle size={24} />
                Payment Limit Reached
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              You can only make one payment every 30 minutes from the same channel. 
              Please wait before making another payment.
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowTimeoutModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black rounded-xl hover:scale-105 transition-transform"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UPIQRPayment;