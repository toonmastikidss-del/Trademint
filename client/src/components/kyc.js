import React, { useState, useEffect } from 'react';
import { Camera, Upload, User, Calendar, Phone, Mail, MapPin, CreditCard, Building, FileText, CheckCircle, XCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';

const KYC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    emailAddress: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    
    // Document Details
    aadharNumber: '',
    panNumber: '',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: ''
  });
  
  const [images, setImages] = useState({
    aadharFront: null,
    aadharBack: null,
    panCard: null,
    bankPassbook: null,
    userPhoto: null
  });
  
  const [previewImages, setPreviewImages] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check KYC status on component mount
  useEffect(() => {
    const checkKYCStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setKycStatus(response.data);
      } catch (error) {
        console.error('Error checking KYC status:', error);
      }
    };
    
    checkKYCStatus();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }
    
    // Validate file size (5MB max before compression)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }
    
    setImages({
      ...images,
      [fieldName]: file
    });
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImages({
        ...previewImages,
        [fieldName]: e.target.result
      });
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }
      
      // Validate all fields
      const requiredFields = Object.keys(formData).filter(key => 
        key !== 'dateOfBirth' || formData[key] !== ''
      );
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          setLoading(false);
          return;
        }
      }
      
      // Validate all images
      const requiredImages = ['aadharFront', 'aadharBack', 'panCard', 'bankPassbook', 'userPhoto'];
      for (const imageField of requiredImages) {
        if (!images[imageField]) {
          setError(`Please upload ${imageField.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          setLoading(false);
          return;
        }
      }
      
      // Create FormData for file uploads
      const formDataObj = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      
      // Add image files
      Object.keys(images).forEach(key => {
        formDataObj.append(key, images[key]);
      });
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/kyc/submit`, formDataObj, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('KYC submitted successfully! Approval will take 2-3 working days.');
      setKycStatus({ status: 'Pending' });
      
      // Reset form
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        mobileNumber: '',
        emailAddress: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        aadharNumber: '',
        panNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: ''
      });
      
      setImages({
        aadharFront: null,
        aadharBack: null,
        panCard: null,
        bankPassbook: null,
        userPhoto: null
      });
      
      setPreviewImages({});
      
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Error submitting KYC. Please try again.');
      }
      console.error('KYC submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // If KYC is already submitted
  if (kycStatus && kycStatus.status !== 'Not Submitted') {
    return (
      <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
          <button onClick={() => navigate('/mine')} className="p-1">
            <ChevronLeft size={24} className="text-gray-300" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">KYC Verification</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <div className="px-4 pt-20 max-w-2xl mx-auto">
          <div className="bg-[#212431] border border-gray-700 rounded-[2rem] shadow-2xl p-8 text-center">
            {kycStatus.status === 'Pending' && (
              <>
                <div className="w-20 h-20 bg-[#212431] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-500/30">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-amber-400 mb-4">KYC Under Review</h2>
                <p className="text-gray-400 mb-6">
                  Your KYC documents are currently under review. Please wait for approval.
                </p>
                <div className="text-sm text-gray-500">
                  Submitted on: {new Date(kycStatus.submittedAt).toLocaleDateString()}
                </div>
              </>
            )}
            
            {kycStatus.status === 'Approved' && (
              <>
                <div className="w-20 h-20 bg-[#212431] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/30">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-500 mb-4">KYC Approved!</h2>
                <p className="text-gray-400 mb-6">
                  Your KYC verification has been successfully approved.
                </p>
                <div className="text-sm text-gray-500">
                  Approved on: {new Date(kycStatus.approvedAt).toLocaleDateString()}
                </div>
              </>
            )}
            
            {kycStatus.status === 'Rejected' && (
              <>
                <div className="w-20 h-20 bg-[#212431] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-red-500 mb-4">KYC Rejected</h2>
                <p className="text-gray-400 mb-4">
                  Your KYC documents were rejected. Please review the reason below and resubmit.
                </p>
                <div className="bg-[#212431] border border-red-500/50 rounded-xl p-4 mb-6">
                  <p className="text-red-400 text-sm">{kycStatus.rejectionReason}</p>
                </div>
                <button 
                  onClick={() => {
                    setKycStatus({ status: 'Not Submitted' });
                  }}
                  className="w-full py-4 bg-[#49bace] text-white font-bold rounded-xl shadow-lg hover:bg-[#3da9bd] transition-all"
                >
                  Resubmit KYC
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => navigate('/mine')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">KYC Verification</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <div className="px-4 pt-20 max-w-4xl mx-auto">
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] shadow-2xl p-6 md:p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-6 hidden">KYC Verification</h1>
          
          {error && (
            <div className="bg-[#212431] border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-400 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </p>
            </div>
          )}
          
          {success && (
            <div className="bg-[#212431] border border-emerald-500/50 rounded-xl p-4 mb-6">
              <p className="text-emerald-400 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {success}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details Section */}
            <div className="bg-[#212431] border border-gray-700 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#49bace]" />
                Personal Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className="w-full bg-[#101821] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      className="w-full bg-[#101821] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-[#101821] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                      placeholder="Full address"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">PIN Code *</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    placeholder="6-digit PIN code"
                    maxLength="6"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Document Details Section */}
            <div className="bg-[#212431] border border-gray-700 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#49bace]" />
                Document Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Aadhar Number *</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    placeholder="12-digit Aadhar number"
                    maxLength="12"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">PAN Number *</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    placeholder="10-character PAN number"
                    maxLength="10"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Document Upload Section */}
            <div className="bg-[#212431] border border-gray-700 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-[#49bace]" />
                Document Upload
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'aadharFront', label: 'Aadhar Front', icon: FileText },
                  { name: 'aadharBack', label: 'Aadhar Back', icon: FileText },
                  { name: 'panCard', label: 'PAN Card', icon: CreditCard },
                  { name: 'bankPassbook', label: 'Bank Passbook', icon: Building },
                  { name: 'userPhoto', label: 'Your Photo', icon: Camera }
                ].map((doc) => (
                  <div key={doc.name} className="space-y-3">
                    <label className="block text-gray-400 mb-2 flex items-center text-sm font-medium">
                      <doc.icon className="w-5 h-5 mr-2 text-gray-500" />
                      {doc.label} *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, doc.name)}
                        className="hidden"
                        id={doc.name}
                      />
                      <label
                        htmlFor={doc.name}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-[#49bace] transition-colors bg-[#101821]"
                      >
                        {previewImages[doc.name] ? (
                          <img 
                            src={previewImages[doc.name]} 
                            alt={doc.label}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-500 mb-2" />
                            <span className="text-gray-500 text-sm">Click to upload</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bank Details Section */}
            <div className="bg-[#212431] border border-gray-700 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-[#49bace]" />
                Bank Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">IFSC Code *</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    placeholder="11-character IFSC code"
                    maxLength="11"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">Branch Name *</label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    className="w-full bg-[#101821] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#49bace] focus:border-[#49bace]"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#49bace] text-white font-bold rounded-xl shadow-lg hover:bg-[#3da9bd] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit KYC'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KYC;