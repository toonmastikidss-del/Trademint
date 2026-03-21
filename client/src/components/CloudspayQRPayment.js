import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, QrCode, Info, Upload, X } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const CloudspayQRPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState(searchParams.get('amount') || '600'); // Get amount from URL params
  const [timer, setTimer] = useState('09:42');
  const [copied, setCopied] = useState(false);
  const [lastPaymentTime, setLastPaymentTime] = useState(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotError, setScreenshotError] = useState('');

  // Fetch QR code data
  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/qr/qrcodes`);
        const generalQr = response.data.find(qr => qr.paymentMethod === 'General');
        if (generalQr) {
          setQrCodeData(generalQr);
        }
      } catch (error) {
        console.error('Error fetching QR code:', error);
      } finally {
        setQrLoading(false);
      }
    };
    
    fetchQrCode();
  }, []);

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

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('cloudspay@merchant789');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setScreenshotError('Only JPG, PNG, GIF, and WEBP images are allowed');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setScreenshotError('File size must be less than 5MB');
        return;
      }
      
      setScreenshot(file);
      setScreenshotError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    setScreenshotError('');
    
    // Reset file input
    const fileInput = document.getElementById('screenshot-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    if (utr.length !== 12) {
      alert('Please enter a valid 12-digit UTR');
      return;
    }
    
    if (!screenshot) {
      alert('Please upload a payment screenshot');
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
      
      // Create FormData to send both text data and file
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('utrNumber', utr);
      formData.append('paymentScreenshot', screenshot);
      
      // console.log('Submitting deposit...');
      // console.log('Amount:', amount);
      // console.log('UTR:', utr);
      // console.log('Screenshot:', screenshot.name, screenshot.size, 'bytes');
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/deposit/submit`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // console.log('Deposit response:', response.data);
      
      // Redirect to success page (removed success alert)
      navigate('/payment/success');
    } catch (error) {
      console.error('Error submitting deposit:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else if (error.message) {
        alert('Error: ' + error.message);
      } else {
        alert('Error submitting payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#101821] min-h-screen text-white pb-24 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-blue-600 px-4 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/deposite')} className="p-1">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Cloudspay-QR Payment</h1>
        <button className="text-xs font-medium text-white">हिंदी</button>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Payment Summary */}
        <div className="bg-[#212431] border border-gray-700 rounded-3xl p-6 shadow-xl">
          <h2 className="text-sm text-gray-400 mb-2">The amount you need to Payable</h2>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-blue-500">₹{amount}</span>
            <span className="text-xl font-bold text-red-500">{timer}</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-[#212431] border border-gray-700 rounded-3xl p-6 shadow-xl text-center">
          <h3 className="text-lg font-bold mb-4 text-gray-300">Use Mobile Scan code to pay</h3>
          
          <div className="bg-white p-4 rounded-2xl mx-auto mb-6 w-64 h-64 flex items-center justify-center">
            {qrLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : qrCodeData && qrCodeData.qrImage ? (
              <img 
                src={`${API_CONFIG.BASE_URL}${qrCodeData.qrImage}`}
                alt="Cloudspay QR Code" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-500">
                <QrCode size={60} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No QR code available</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-left space-y-3 text-sm text-gray-400">
            <p>1. For iOS phones, long press the QR code and enter Cloudspay wallet</p>
            <p>2. For Android phones, take a screenshot and manually open Cloudspay wallet to upload the QR code</p>
            <p>3. Please do not pay for the same link repeatedly</p>
            <p>4. After payment, please fill in the 12-digit UTR below</p>
          </div>
        </div>

        {/* Manual Transfer */}
        <div className="bg-[#212431] border border-gray-700 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-4 text-gray-300">Manual transfer</h3>
          
          {/* Step 1: Copy UPI */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">1. Copy the below given Cloudspay ID</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value="cloudspay@merchant789" 
                readOnly
                className="flex-1 bg-[#1a1f2e] border border-gray-800 rounded-xl px-4 py-3 text-sm font-medium"
              />
              <button 
                onClick={handleCopyUPI}
                className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <p className="text-xs text-orange-400 mt-2">Dont save the Cloudspay ID, get new ID every time.</p>
          </div>

          {/* Step 2: Enter UTR */}
          <div>
            <p className="text-sm text-gray-400 mb-2">2. Need to enter your 12 Ref No (UTR)</p>
            <input 
              type="text" 
              placeholder="Input 12-digit here"
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="w-full bg-[#1a1f2e] border border-gray-800 rounded-xl px-4 py-3 text-sm font-medium mb-4"
            />
            
            {/* Screenshot Upload */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">3. Upload Payment Screenshot</p>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center relative">
                {!screenshotPreview ? (
                  <div>
                    <input 
                      id="screenshot-upload"
                      type="file" 
                      accept="image/*" 
                      onChange={handleScreenshotChange}
                      className="hidden" 
                    />
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-3 bg-blue-600/10 rounded-full">
                        <Upload size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Tap to upload screenshot</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                      </div>
                      <label 
                        htmlFor="screenshot-upload"
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={screenshotPreview} 
                      alt="Screenshot preview" 
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {screenshotError && (
                  <p className="text-red-400 text-xs mt-2">{screenshotError}</p>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={utr.length !== 12 || !screenshot || loading}
              className={`w-full py-3 rounded-xl font-bold text-sm ${
                utr.length === 12 && screenshot && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              } transition-colors`}
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
            <p className="text-xs text-orange-400 mt-2">
              Open your Cloudspay wallet and complete the transfer. Record your reference No. (Ref No.) after payment.
            </p>
          </div>
        </div>

        {/* Notice Section */}
        <div className="bg-[#212431] border border-gray-700 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-4 text-gray-300 flex items-center gap-2">
            <Info size={20} className="text-blue-500" />
            Notice
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Please select the payment method you need and make sure your phone has Cloudspay wallet installed.</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#212431] border border-gray-700 rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <Info size={20} />
                Payment Limit Reached
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              You can only make one payment every 30 minutes from the same channel. 
              Please wait before making another payment.
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowTimeoutModal(false)}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
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

export default CloudspayQRPayment;
