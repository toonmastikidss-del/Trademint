import React, { useState, useEffect } from 'react';
import { QrCode, Upload, Eye, EyeOff, Save, X, AlertCircle, CheckCircle, Table, Grid, Trash2, Copy, Banknote, CreditCard } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

const QRManagement = ({ theme, isDarkMode }) => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [qrToDelete, setQrToDelete] = useState(null);
  const [formData, setFormData] = useState({
    paymentMethod: '',
    qrImage: '',
    upiId: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    minAmount: '',
    maxAmount: '',
    paymentMode: 'qr'
  });
  const [previewImage, setPreviewImage] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'base64'
  const [formType, setFormType] = useState('qr'); // 'qr' or 'account' - Toggle between QR and Account forms

  // Fetch all QR codes
  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching QR codes from server...');
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/qr/qrcodes`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ QR codes fetched:', response.data.length, 'codes');
      console.log('QR Codes data:', response.data);
      setQrCodes(response.data);
    } catch (error) {
      console.error('❌ Error fetching QR codes:', error);
      showAlert('Failed to fetch QR codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show alert message
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showAlert(`${label} copied to clipboard!`, 'success');
    }).catch(err => {
      console.error('Failed to copy:', err);
      showAlert('Failed to copy', 'error');
    });
  };

  // Handle image upload preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        showAlert('Only JPEG, PNG, GIF images are allowed', 'error');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        showAlert('File size exceeds 5MB limit', 'error');
        e.target.value = ''; // Clear the input
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
        setFormData({ ...formData, qrImage: event.target.result });
      };
      reader.onerror = () => {
        showAlert('Error reading file', 'error');
        e.target.value = ''; // Clear the input
      };
      reader.readAsDataURL(file);
      
      // Show success message
      showAlert(`${file.name} selected successfully`, 'success');
    }
  };

  // Handle file upload - Convert to Base64 for permanent database storage
  const handleFileUpload = async (file) => {
    // console.log('🚀 handleFileUpload called with file:', file);
    if (!file) {
      showAlert('No file selected', 'error');
      return false;
    }
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      
      const base64Data = reader.result;
      
      // Send base64 data to server (not file upload)
      const adminToken = localStorage.getItem('adminToken');
      const adminData = JSON.parse(localStorage.getItem('adminData'));
      const adminId = adminData?.id || adminData?._id || adminData?.admin?._id || adminData?.admin?.id;
      
      if (!adminId) {
        showAlert('Admin authentication error. Please log in again.', 'error');
        return false;
      }
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/qr/qrcodes/update`, {
        paymentMethod: formData.paymentMethod,
        upiId: formData.upiId || '',
        qrImage: base64Data, // Base64 data directly
        adminId
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data && response.data.message) {
        showAlert(response.data.message, 'success');
      } else {
        showAlert('QR code uploaded successfully', 'success');
      }
      
      // Wait a bit before fetching to ensure server has saved
      setTimeout(() => {
        fetchQRCodes();
      }, 500);
      
      setShowEditModal(false);
      return true;
    } catch (error) {
      // console.error('❌ Error uploading file:', error);
      // console.error('Response data:', error.response?.data);
      // console.error('Response status:', error.response?.status);
      
      // Handle 429 Too Many Requests
      if (error.response?.status === 429) {
        showAlert('⚠️ Too many upload attempts. Please wait 2-3 minutes and try again.', 'error');
        return false;
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload QR code';
      showAlert(errorMessage, 'error');
      return false;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Form field changed: ${name} = ${value}`);
    setFormData({ ...formData, [name]: value });
  };

  // Open edit modal
  const openEditModal = (qrCode = null) => {
    console.log('📂 Opening edit modal with:', qrCode);
    if (qrCode) {
      setFormData({
        paymentMethod: qrCode.paymentMethod,
        qrImage: qrCode.qrImage,
        upiId: qrCode.upiId || '',
        bankName: qrCode.bankName || '',
        accountName: qrCode.accountName || '',
        accountNumber: qrCode.accountNumber || '',
        ifscCode: qrCode.ifscCode || '',
        minAmount: qrCode.minAmount || '',
        maxAmount: qrCode.maxAmount || '',
        paymentMode: qrCode.paymentMode || 'qr'
      });
      setPreviewImage(qrCode.qrImage);
      setFormType(qrCode.paymentMode || 'qr'); // Set form type based on existing data
      setSelectedQR(qrCode);
    } else {
      setFormData({
        paymentMethod: 'General',
        qrImage: '',
        upiId: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        minAmount: '',
        maxAmount: '',
        paymentMode: 'qr'
      });
      setPreviewImage('');
      setFormType('qr'); // Reset to QR form for new entries
      setSelectedQR(null);
    }
    setShowEditModal(true);
  };

  // Save QR code
  const saveQRCode = async () => {
    console.log('💾 saveQRCode called');
    console.log('📋 formData:', formData);
    console.log('📤 formType:', formType);
    
    try {
      if (!formData.paymentMethod) {
        showAlert('Payment method is required', 'error');
        return;
      }

      // Validation based on form type
      if (formType === 'qr') {
        if (!formData.upiId || formData.upiId.trim() === '') {
          showAlert('UPI ID is required. Please enter a valid UPI ID (e.g., yourname@paytm)', 'error');
          return;
        }

        const upiPattern = /^[\w.-]+@[\w.-]+$/;
        if (!upiPattern.test(formData.upiId)) {
          showAlert('Invalid UPI ID format. Example: yourname@paytm, business@phonepe', 'error');
          return;
        }

        if (uploadMethod === 'file' && !previewImage) {
          showAlert('Please upload a QR code image', 'error');
          return;
        }

        if (uploadMethod === 'base64' && !formData.qrImage) {
          showAlert('Please provide QR code image data', 'error');
          return;
        }
      } else if (formType === 'account') {
        if (!formData.bankName || formData.bankName.trim() === '') {
          showAlert('Bank Name is required', 'error');
          return;
        }
        if (!formData.accountName || formData.accountName.trim() === '') {
          showAlert('Account Holder Name is required', 'error');
          return;
        }
        if (!formData.accountNumber || formData.accountNumber.trim() === '') {
          showAlert('Account Number is required', 'error');
          return;
        }
        if (!formData.ifscCode || formData.ifscCode.trim() === '') {
          showAlert('IFSC Code is required', 'error');
          return;
        }
      }

      if (formType === 'qr' && uploadMethod === 'file') {
        // Handle file upload for QR
        const fileInput = document.getElementById('qrImageUpload');
        if (fileInput && fileInput.files[0]) {
          const success = await handleFileUpload(fileInput.files[0]);
          if (success) {
            return;
          }
        } else {
          showAlert('Please select an image file', 'error');
          return;
        }
      } else {
        // Handle base64 data or account details
        const adminToken = localStorage.getItem('adminToken');
        const adminData = JSON.parse(localStorage.getItem('adminData'));
        const adminId = adminData?.admin?._id || adminData?._id;

        const dataToSend = {
          paymentMethod: formData.paymentMethod,
          paymentMode: formType,
          adminId
        };

        // Add form-specific data
        if (formType === 'qr') {
          dataToSend.qrImage = uploadMethod === 'file' ? previewImage : formData.qrImage;
          dataToSend.upiId = formData.upiId;
        } else if (formType === 'account') {
          dataToSend.bankName = formData.bankName;
          dataToSend.accountName = formData.accountName;
          dataToSend.accountNumber = formData.accountNumber;
          dataToSend.ifscCode = formData.ifscCode;
          dataToSend.minAmount = formData.minAmount || 0;
          dataToSend.maxAmount = formData.maxAmount || 0;
        }

        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/qr/qrcodes/update`, dataToSend, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (response.data && response.data.message) {
          showAlert(response.data.message, 'success');
        } else {
          showAlert(`${formType === 'qr' ? 'QR Code' : 'Bank Account'} updated successfully`, 'success');
        }
        setShowEditModal(false);
        fetchQRCodes();
      }
    } catch (error) {
      console.error('❌ Error saving:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save';
      showAlert(errorMessage, 'error');
    }
  };

  // Toggle QR code status
  const toggleQRStatus = async (paymentMethod) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const adminData = JSON.parse(localStorage.getItem('adminData'));
      const adminId = adminData?.admin?._id || adminData?._id;

      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/qr/qrcodes/toggle-status`, {
        paymentMethod,
        adminId
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      showAlert(response.data.message, 'success');
      fetchQRCodes();
    } catch (error) {
      console.error('Error toggling QR status:', error);
      showAlert('Failed to update QR status', 'error');
    }
  };

  // Toggle payment mode (QR vs Account)
  const togglePaymentMode = async (paymentMethod) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const adminData = JSON.parse(localStorage.getItem('adminData'));
      const adminId = adminData?.admin?._id || adminData?._id;
      const currentQR = qrCodes.find(qr => qr.paymentMethod === paymentMethod);
      const newMode = currentQR?.paymentMode === 'account' ? 'qr' : 'account';

      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/qr/qrcodes/update`, {
        paymentMethod,
        paymentMode: newMode,
        adminId
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      showAlert(`Switched to ${newMode === 'account' ? 'Account Details' : 'QR Code'} mode`, 'success');
      fetchQRCodes();
    } catch (error) {
      console.error('Error toggling payment mode:', error);
      showAlert('Failed to update payment mode', 'error');
    }
  };

  // Delete QR code
  const deleteQRCode = async (paymentMethod) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const adminData = JSON.parse(localStorage.getItem('adminData'));
      const adminId = adminData?.admin?._id || adminData?._id;

      const response = await axios.delete(`${API_CONFIG.BASE_URL}/api/qr/qrcodes/${paymentMethod}`, {
        data: { adminId },
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      showAlert(response.data.message, 'success');
      fetchQRCodes();
      setShowDeleteConfirm(false);
      setQrToDelete(null);
    } catch (error) {
      console.error('Error deleting QR code:', error);
      showAlert('Failed to delete QR code', 'error');
    }
  };

  // Confirm delete QR code
  const confirmDeleteQR = (paymentMethod) => {
    setQrToDelete(paymentMethod);
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  // Payment method options
  const paymentMethods = [
    { id: 'General', name: 'General QR Code', description: 'Main QR code for all payments' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header - Responsive */}
      <div className={`${theme.cardBg} border ${theme.border} rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl sm:shadow-2xl`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold ${theme.textMain} flex items-center gap-2 sm:gap-3`}>
              <QrCode size={24} className="sm:w-7 sm:h-7 text-[#49bace]" />
              QR Code Management
            </h3>
            <p className={`text-xs sm:text-sm ${theme.textDim} mt-1 sm:mt-2`}>
              Manage payment QR codes with table and card views
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 w-full sm:w-auto">
            <div className="flex bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-[#49bace] text-white' : 'text-gray-400 hover:text-white'}`}
                title="Card View"
              >
                <Grid size={16} className="sm:w-4.5 sm:h-4.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#49bace] text-white' : 'text-gray-400 hover:text-white'}`}
                title="Table View"
              >
                <Table size={16} className="sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
            <button 
              onClick={() => openEditModal()}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-[#49bace] text-white font-black rounded-xl sm:rounded-2xl uppercase tracking-widest text-[9px] sm:text-xs hover:scale-[1.02] sm:hover:scale-105 active:scale-[0.98] sm:active:scale-95 transition-all shadow-lg shadow-[#49bace]/20 flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto"
            >
              <QrCode size={14} className="sm:w-4 sm:h-4" />
              <span className="truncate">Add New QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {alert.show && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${
          alert.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {alert.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{alert.message}</span>
        </div>
      )}

      {/* QR Codes View */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49bace]"></div>
        </div>
      ) : (
        <>
          {/* Table View - Responsive */}
          {viewMode === 'table' && (
            <div className={`${theme.cardBg} border ${theme.border} rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-4 sm:p-6 shadow-xl`}>
              <h4 className={`font-black text-base sm:text-lg ${theme.textMain} mb-3 sm:mb-4`}>QR Codes Table</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme.border}`}>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>Payment Method</th>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>Payment Mode</th>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>QR Image</th>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>UPI ID</th>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>Bank Name</th>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>Account No</th>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>IFSC</th>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>Status</th>
                      <th className={`text-left py-2 px-3 sm:py-3 sm:px-4 ${theme.textDim} text-[10px] sm:text-xs font-black uppercase`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethods.map((method) => {
                      const qrCode = qrCodes.find(qr => qr.paymentMethod === method.id);
                      return (
                        <tr key={method.id} className={`border-b ${theme.border} hover:bg-gray-500/5`}>
                          <td className="py-4 px-4">
                            <div>
                              <div className={`font-bold ${theme.textMain}`}>{method.name}</div>
                              <div className={`text-xs ${theme.textDim} mt-1`}>{method.description}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {qrCode && (
                              <button
                                onClick={() => togglePaymentMode(method.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                  qrCode.paymentMode === 'account'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {qrCode.paymentMode === 'account' ? '💳 Account' : '📱 QR Code'}
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {qrCode?.paymentMode === 'qr' && qrCode?.qrImage ? (
                              <img 
                                src={qrCode.qrImage && qrCode.qrImage.startsWith('data:') ? qrCode.qrImage : `${API_CONFIG.BASE_URL}${qrCode.qrImage}`}
                                alt={`${method.name} QR`}
                                className="w-16 h-16 object-contain border border-gray-700 rounded-lg"
                                onError={(e) => {
                                  console.error('Failed to load QR image:', qrCode.qrImage);
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                                <QrCode size={24} className="text-gray-600" />
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-sm ${qrCode?.paymentMode === 'qr' && qrCode?.upiId ? theme.textMain : theme.textDim}`}>
                              {qrCode?.paymentMode === 'qr' ? (qrCode?.upiId || 'N/A') : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-sm ${qrCode?.paymentMode === 'account' && qrCode?.bankName ? theme.textMain : theme.textDim}`}>
                              {qrCode?.paymentMode === 'account' ? (qrCode?.bankName || 'N/A') : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-sm ${qrCode?.paymentMode === 'account' && qrCode?.accountNumber ? theme.textMain : theme.textDim}`}>
                              {qrCode?.paymentMode === 'account' ? (qrCode?.accountNumber || 'N/A') : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-sm ${qrCode?.paymentMode === 'account' && qrCode?.ifscCode ? theme.textMain : theme.textDim}`}>
                              {qrCode?.paymentMode === 'account' ? (qrCode?.ifscCode || 'N/A') : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {qrCode ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                qrCode.isActive 
                                  ? 'bg-green-500/10 text-green-400' 
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {qrCode.isActive ? 'Active' : 'Inactive'}
                              </span>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400`}>
                                Not Set
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(qrCode)}
                                className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                                title="Edit QR Code"
                              >
                                <Upload size={14} />
                              </button>
                              {qrCode && (
                                <button
                                  onClick={() => toggleQRStatus(method.id)}
                                  className={`p-2 rounded-lg transition-all ${
                                    qrCode.isActive 
                                      ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' 
                                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                  }`}
                                  title={qrCode.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {qrCode.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              )}
                              {qrCode && (
                                <button
                                  onClick={() => confirmDeleteQR(method.id)}
                                  className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                                  title="Delete QR Code"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Card View - Responsive */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {paymentMethods.map((method) => {
                const qrCode = qrCodes.find(qr => qr.paymentMethod === method.id);
                return (
                  <div 
                    key={method.id} 
                    className={`${theme.cardBg} border ${theme.border} rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-4 sm:p-6 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all`}
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div>
                        <h4 className={`font-black text-base sm:text-lg ${theme.textMain}`}>{method.name}</h4>
                        <p className={`text-[10px] sm:text-xs ${theme.textDim} mt-1`}>{method.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(qrCode)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all"
                          title="Edit QR Code"
                        >
                          <Upload size={16} />
                        </button>
                        {qrCode && (
                          <button
                            onClick={() => toggleQRStatus(method.id)}
                            className={`p-2 rounded-xl transition-all ${
                              qrCode.isActive 
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' 
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            }`}
                            title={qrCode.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {qrCode.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                        {qrCode && (
                          <button
                            onClick={() => confirmDeleteQR(method.id)}
                            className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
                            title="Delete QR Code"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {qrCode ? (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <img 
                            src={qrCode.qrImage && qrCode.qrImage.startsWith('data:') ? qrCode.qrImage : `${API_CONFIG.BASE_URL}${qrCode.qrImage}`}
                            alt={`${method.name} QR`}
                            className="w-32 h-32 object-contain border-2 border-gray-700 rounded-xl"
                            onError={(e) => {
                              // console.error('Failed to load QR image:', qrCode.qrImage);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            qrCode.isActive 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {qrCode.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {qrCode.upiId && (
                          <div className="text-center">
                            <p className={`text-xs ${theme.textDim}`}>UPI ID: {qrCode.upiId}</p>
                          </div>
                        )}
                        <div className="text-center text-[10px] text-gray-500">
                          Last updated: {new Date(qrCode.lastUpdated).toLocaleString()}
                          {qrCode.lastUpdatedBy?.name && (
                            <span> by {qrCode.lastUpdatedBy.name}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <QrCode size={48} className={`${theme.textDim} mx-auto mb-3 opacity-30`} />
                        <p className={`text-sm ${theme.textDim}`}>No QR code configured</p>
                        <button
                          onClick={() => openEditModal()}
                          className="mt-3 text-[#49bace] text-xs font-bold hover:underline"
                        >
                          Add QR Code
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Edit Modal - Responsive */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className={`${theme.cardBg} border ${theme.border} rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
                {selectedQR ? (formType === 'qr' ? 'Edit QR Code' : 'Edit Bank Account') : 'Add Payment Method'}
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-500/10 rounded-lg sm:rounded-xl transition-all"
              >
                <X size={18} className={`sm:w-5 sm:h-5 ${theme.textDim}`} />
              </button>
            </div>

            {/* Toggle Switch - QR Code vs Bank Account */}
            <div className="mb-6">
              <label className={`block text-[10px] sm:text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                Payment Type
              </label>
              <div className="flex bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setFormType('qr')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    formType === 'qr' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <QrCode size={18} />
                  QR Code
                </button>
                <button
                  onClick={() => setFormType('account')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    formType === 'account' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard size={18} />
                  Bank Account
                </button>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Payment Method */}
              <div>
                <label className={`block text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1.5 sm:mb-2 ${theme.textDim}`}>
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full ${theme.innerCard} border ${theme.border} rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`}
                  disabled={!!selectedQR}
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
                <p className={`text-[10px] mt-1.5 ${theme.textDim}`}>
                  📌 Currently only "General" is supported for all payment methods
                </p>
              </div>

              {/* QR Code Form Fields */}
              {formType === 'qr' && (
                <>
                  {/* Upload Method Toggle */}
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                      Upload Method <span className="text-red-500">*</span>
                    </label>
                    <div className="flex bg-gray-800 rounded-xl p-1">
                      <button
                        onClick={() => setUploadMethod('file')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                          uploadMethod === 'file' 
                            ? 'bg-[#49bace] text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        📁 File Upload
                      </button>
                      <button
                        onClick={() => setUploadMethod('base64')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                          uploadMethod === 'base64' 
                            ? 'bg-[#49bace] text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        🔗 Base64 Data
                      </button>
                    </div>
                  </div>

                  {/* QR Image Upload */}
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                      {uploadMethod === 'file' ? 'Upload QR Code Image' : 'QR Code Image Data'} <span className="text-red-500">*</span>
                    </label>
                    
                    {uploadMethod === 'file' ? (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="qrImageUpload"
                          />
                          <label
                            htmlFor="qrImageUpload"
                            className={`block w-full ${theme.innerCard} border-2 border-dashed ${theme.border} rounded-2xl py-8 px-4 text-center cursor-pointer hover:border-[#49bace] transition-all`}
                          >
                            <Upload size={24} className={`${theme.textDim} mx-auto mb-2`} />
                            <p className={`text-sm ${theme.textDim}`}>Click to upload QR image</p>
                            <p className={`text-xs ${theme.textDim} mt-1`}>PNG, JPG, GIF up to 5MB</p>
                          </label>
                          {previewImage && (
                            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                              ✅ Image selected successfully
                            </p>
                          )}
                        </div>
                        {previewImage && (
                          <div className="w-full sm:w-48 h-48 flex-shrink-0 flex items-center justify-center bg-gray-800/50 rounded-xl p-2">
                            <img 
                              src={previewImage} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <textarea
                            name="qrImage"
                            value={formData.qrImage}
                            onChange={handleInputChange}
                            placeholder="Paste base64 image data or image URL"
                            rows="4"
                            className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-3 px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all resize-none`}
                          />
                        </div>
                        {formData.qrImage && (
                          <div className="w-full sm:w-48 h-48 flex-shrink-0 flex items-center justify-center bg-gray-800/50 rounded-xl p-2">
                            <img 
                              src={formData.qrImage} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* UPI ID */}
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                      UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="e.g., yourname@paytm, business@phonepe, name@upi"
                      required
                      className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-3 px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`}
                    />
                    <p className={`text-[10px] mt-2 ${theme.textDim}`}>
                      ⚠️ Required: This UPI ID will be displayed on payment pages
                    </p>
                  </div>
                </>
              )}

              {/* Bank Account Form Fields */}
              {formType === 'account' && (
                <>
                  {/* Bank Name */}
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="e.g., State Bank of India"
                      required
                      className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-3 px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`}
                    />
                  </div>

                  {/* Account Holder Name */}
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      placeholder="e.g., John Doe"
                      required
                      className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-3 px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`}
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 1234567890"
                      required
                      className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-3 px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`}
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      placeholder="e.g., SBIN0001234"
                      required
                      className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-3 px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`}
                    />
                  </div>

                  {/* Min & Max Amount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                        Min Amount (₹)
                      </label>
                      <input
                        type="number"
                        name="minAmount"
                        value={formData.minAmount}
                        onChange={handleInputChange}
                        placeholder="0"
                        className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-3 px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme.textDim}`}>
                        Max Amount (₹)
                      </label>
                      <input
                        type="number"
                        name="maxAmount"
                        value={formData.maxAmount}
                        onChange={handleInputChange}
                        placeholder="0"
                        className={`w-full ${theme.innerCard} border ${theme.border} rounded-2xl py-3 px-4 text-sm font-bold ${theme.textMain} focus:border-[#49bace] outline-none transition-all`}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={saveQRCode}
                  className="flex-1 py-3 sm:py-4 bg-[#49bace] text-white font-black rounded-xl sm:rounded-2xl uppercase tracking-widest text-[10px] sm:text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#49bace]/20 flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Save size={14} className="sm:w-4 sm:h-4" />
                  <span className="truncate">{selectedQR ? 'Update' : 'Save'}</span>
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 sm:py-4 bg-gray-500/10 text-gray-400 font-black rounded-xl sm:rounded-2xl uppercase tracking-widest text-[10px] sm:text-xs hover:bg-gray-500/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${theme.cardBg} border ${theme.border} rounded-[2.5rem] p-8 max-w-md w-full`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme.textMain}`}>
                Confirm Delete
              </h3>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setQrToDelete(null);
                }}
                className="p-2 hover:bg-gray-500/10 rounded-xl transition-all"
              >
                <X size={20} className={theme.textDim} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle size={24} />
                <span className="font-bold">Warning</span>
              </div>
              <p className={`text-sm ${theme.textDim}`}>
                Are you sure you want to delete the QR code for <strong>{qrToDelete}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => deleteQRCode(qrToDelete)}
                className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setQrToDelete(null);
                }}
                className="flex-1 py-4 bg-gray-500/10 text-gray-400 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-gray-500/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRManagement;