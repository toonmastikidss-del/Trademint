import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  onConfirm,
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-emerald-500" />;
      case 'error':
        return <AlertCircle size={24} className="text-rose-500" />;
      case 'warning':
        return <AlertCircle size={24} className="text-amber-500" />;
      default:
        return <Info size={24} className="text-blue-500" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'error':
        return 'bg-rose-500 hover:bg-rose-600';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#212431] border border-gray-700 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className={`flex ${showCancel ? 'space-x-3' : 'justify-center'}`}>
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-2xl transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-4 ${getButtonClass()} text-white font-bold rounded-2xl transition-colors hover:scale-105`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;