import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const AlertModal = ({ isOpen, message, type, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full ${
              type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`} />

            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`p-4 rounded-3xl ${
                type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {type === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
              </div>
              
              <div className="space-y-2">
                <h3 className={`text-xl font-bold ${
                  type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {type === 'success' ? 'Success!' : 'Oops!'}
                </h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  {message}
                </p>
              </div>

              <button
                onClick={onClose}
                className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                  type === 'success' 
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20' 
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
