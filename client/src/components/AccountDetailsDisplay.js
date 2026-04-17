import React from 'react';
import { Landmark, User, Hash, CreditCard, Banknote, Copy, CheckCircle } from 'lucide-react';

const AccountDetailsDisplay = ({ qrCodeData, copiedField, onCopy }) => {
  if (!qrCodeData || qrCodeData.paymentMode !== 'account') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Landmark className="text-purple-600" size={24} />
        <h3 className="text-xl font-bold text-gray-900">Bank Account Details</h3>
      </div>

      {/* Bank Name */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <Landmark size={16} className="text-purple-600" />
          <span className="text-xs font-semibold text-gray-600 uppercase">Bank Name</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{qrCodeData.bankName || 'N/A'}</span>
          <button
            onClick={() => onCopy(qrCodeData.bankName, 'bankName')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          >
            {copiedField === 'bankName' ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copiedField === 'bankName' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Account Holder */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <User size={16} className="text-blue-600" />
          <span className="text-xs font-semibold text-gray-600 uppercase">Account Holder</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{qrCodeData.accountName || 'N/A'}</span>
          <button
            onClick={() => onCopy(qrCodeData.accountName, 'accountName')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          >
            {copiedField === 'accountName' ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copiedField === 'accountName' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Account Number */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
        <div className="flex items-center gap-2 mb-2">
          <Hash size={16} className="text-green-600" />
          <span className="text-xs font-semibold text-gray-600 uppercase">Account Number</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 tracking-wider">{qrCodeData.accountNumber || 'N/A'}</span>
          <button
            onClick={() => onCopy(qrCodeData.accountNumber, 'accountNumber')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          >
            {copiedField === 'accountNumber' ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copiedField === 'accountNumber' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* IFSC Code */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={16} className="text-orange-600" />
          <span className="text-xs font-semibold text-gray-600 uppercase">IFSC Code</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{qrCodeData.ifscCode || 'N/A'}</span>
          <button
            onClick={() => onCopy(qrCodeData.ifscCode, 'ifscCode')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          >
            {copiedField === 'ifscCode' ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copiedField === 'ifscCode' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Amount Limits */}
      {(qrCodeData.minAmount || qrCodeData.maxAmount) && (
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Banknote size={16} className="text-gray-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Transaction Limits</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Minimum Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{qrCodeData.minAmount || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Maximum Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹{qrCodeData.maxAmount || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetailsDisplay;
