import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, QrCode, Info, Copy, AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const UPIQRPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [refNo, setRefNo] = useState('');
  const [amount, setAmount] = useState(searchParams.get('amount') || '200.00');
  const [timer, setTimer] = useState('14:49');
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [lastPaymentTime, setLastPaymentTime] = useState(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotError, setScreenshotError] = useState('');
  const [dynamicUpiId, setDynamicUpiId] = useState('');

  const upiId = 'rebatiranjabhowmik@rbl';

  // Fetch QR code data
  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        console.log('🔄 Fetching QR code data...');
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/qr/qrcodes`);
        console.log('📦 QR codes response:', response.data);
        
        const generalQr = response.data.find(qr => qr.paymentMethod === 'General');
        if (generalQr) {
          console.log('✅ General QR found:', generalQr);
          setQrCodeData(generalQr);
          // Set dynamic UPI ID from QR code data
          if (generalQr.upiId) {
            console.log('🎯 UPI ID from database:', generalQr.upiId);
            setDynamicUpiId(generalQr.upiId);
          } else {
            console.log('⚠️ No UPI ID in database, using fallback');
            setDynamicUpiId('rebatiranjabhowmik@rbl'); // Fallback
          }
        } else {
          console.log('⚠️ No General QR code found in response');
          setDynamicUpiId('rebatiranjabhowmik@rbl'); // Fallback
        }
      } catch (error) {
        console.error('❌ Error fetching QR code:', error);
        console.error('Error details:', error.response?.data || error.message);
        setDynamicUpiId('rebatiranjabhowmik@rbl'); // Fallback on error
      } finally {
        setQrLoading(false);
      }
    };

    fetchQrCode();
  }, []);

  // Keep screenshot in localStorage to prevent loss on re-render
  useEffect(() => {
    if (screenshotPreview) {
      localStorage.setItem('paymentScreenshotPreview', screenshotPreview);
      localStorage.setItem('paymentScreenshotTime', Date.now().toString());
    }
  }, [screenshotPreview]);

  // Load screenshot preview from localStorage on mount
  useEffect(() => {
    const savedPreview = localStorage.getItem('paymentScreenshotPreview');
    const savedTime = localStorage.getItem('paymentScreenshotTime');
    
    // Only load if screenshot is less than 30 minutes old (1800000 ms)
    if (savedPreview && savedTime) {
      const age = Date.now() - parseInt(savedTime);
      if (age < 1800000) {
        console.log('✅ Restored screenshot from localStorage, age:', Math.round(age/1000), 'seconds');
        setScreenshotPreview(savedPreview);
      } else {
        console.log('⚠️ Screenshot expired, clearing from localStorage');
        localStorage.removeItem('paymentScreenshotPreview');
        localStorage.removeItem('paymentScreenshotTime');
      }
    }
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

  // Scanning animation effect
  useEffect(() => {
    if (isScanning) {
      const scanInterval = setInterval(() => {
        setIsScanning(prev => !prev);
      }, 800);
      return () => clearInterval(scanInterval);
    }
  }, [isScanning]);

  const handleCopy = () => {
    const upiIdToCopy = dynamicUpiId || 'rebatiranjabhowmik@rbl';
    navigator.clipboard.writeText(upiIdToCopy);
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

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const startScanning = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const handleSubmit = async () => {
    if (refNo.length !== 12) {
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

      if (!token) {
        alert('Please login again');
        navigate('/login');
        return;
      }

      // Create FormData to send both text data and file
      const formData = new FormData();
      formData.append('amount', amount.toString());
      formData.append('utrNumber', refNo.toString());
      formData.append('paymentScreenshot', screenshot);

      // console.log('=== DEPOSIT DEBUG INFO ===');
      // console.log('Token exists:', !!token);
      // console.log('Amount:', amount);
      // console.log('UTR:', refNo);
      // console.log('File name:', screenshot.name);
      // console.log('File size:', screenshot.size);
      // console.log('File type:', screenshot.type);
      // console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        // console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      }

      // console.log('Sending request to server...');

      // Use fetch instead of axios for better FormData handling
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/deposit/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // console.log('Response status:', response.status);
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get response as text first to see what we're getting
      const responseText = await response.text();
      // console.log('Raw response:', responseText.substring(0, 500));

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid JSON: ' + responseText.substring(0, 200));
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit deposit');
      }

      // console.log('✅ Success:', responseData);

      // Redirect to success page
      navigate('/payment/success');
    } catch (error) {
      // console.error('❌ Error submitting deposit:', error);
      // console.error('Error response:', error.response?.data);
      // console.error('Error status:', error.response?.status);
      // console.error('Error headers:', error.response?.headers);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}


      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-6 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 flex items-center">
          <button
            onClick={() => navigate('/deposite')}
            className="mr-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-center text-2xl font-semibold tracking-wide flex-grow">payment</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Amount Section */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm mb-2">Amount Payable</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-purple-600">₹{amount}</span>
          </div>
          <p className="text-red-500 text-sm font-medium mt-1">{timer}</p>
          <p className="text-gray-600 text-sm mt-4">Use Mobile Scan code to pay</p>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow-sm border border-gray-100">
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg p-4 flex items-center justify-center border-2 border-gray-200">
              {qrLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : qrCodeData && qrCodeData.qrImage ? (
                <img
                  key={qrCodeData.qrImage} // Force re-render when QR changes
                  src={qrCodeData.qrImage.startsWith('data:') ? qrCodeData.qrImage : `${API_CONFIG.BASE_URL}${qrCodeData.qrImage}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('❌ QR Image failed to load:', `${API_CONFIG.BASE_URL}${qrCodeData.qrImage}`);
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="text-center text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto mb-2 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><p class="text-sm">Failed to load QR</p></div>';
                  }}
                  onLoad={() => {
                    console.log('✅ QR Image loaded successfully:', `${API_CONFIG.BASE_URL}${qrCodeData.qrImage}`);
                  }}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No QR code available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-100">
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-semibold text-gray-900 min-w-fit">1.</span>
              <span>For IOS phones, please long-press the QR code and enter the wallet for payment.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-gray-900 min-w-fit">2.</span>
              <span>For Android phones, please take a screenshot and manually open the wallet to upload the QR code for payment.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-gray-900 min-w-fit">3.</span>
              <span>Please avoid making duplicate payments.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-gray-900 min-w-fit">4.</span>
              <span>After completing the payment, please fill in the 12-digit UTR below.</span>
            </li>
          </ol>
        </div>

        {/* Manual Transfer Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Manual transfer</h2>

          {/* UPI Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-purple-600 mb-3">1. Copy the below given UPI</h3>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={dynamicUpiId || 'Loading...'}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700"
              />
              <button
                onClick={handleCopy}
                disabled={!dynamicUpiId}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-semibold transition-colors duration-200 min-w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <p className="text-orange-500 text-xs mt-2">
              Tip: Dont save the UPI, get new UPI every time.
            </p>
          </div>

          {/* Reference No Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-purple-600 mb-3">2. Need to enter your 12 Ref No (UTR)</h3>
            <input
              type="text"
              placeholder="Ref No is required"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 placeholder-gray-400"
            />
            <p className="text-orange-500 text-xs mt-2">
              Tip: Open your UPI wallet and complete the transfer Record your reference No. (Ref No.) after payment.
            </p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-bold ${refNo.length === 12 ? 'text-green-600' : 'text-yellow-600'}`}>
                {refNo.length}/12 digits entered
              </span>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-purple-600 mb-3">3. Upload Payment Screenshot</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
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
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Upload size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Tap to upload screenshot</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                    </div>
                    <label
                      htmlFor="screenshot-upload"
                      className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
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
                <p className="text-red-500 text-xs mt-2">{screenshotError}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={refNo.length !== 12 || !screenshot}
            className={`w-full py-4 rounded font-semibold text-lg transition-all duration-200 shadow-sm hover:shadow-md ${refNo.length === 12 && screenshot
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
          >
            Submit
          </button>
        </div>

        {/* Warnings */}
        <div className="mt-6 space-y-2 text-sm">
          <p className="text-red-500 font-semibold">1. Please make sure you have installed the app</p>
          <p className="text-red-500 font-semibold">2. Don't pay for the same link repeatedly</p>
        </div>

        {/* Notice Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Notice:</h3>
          <p className="text-sm text-gray-700">
            Please select the payment method you need and make sure your phone has the corresponding wallet software installed.
          </p>
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
}

export default UPIQRPayment;
