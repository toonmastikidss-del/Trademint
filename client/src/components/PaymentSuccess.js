import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/deposite');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Success Icon */}
      <div className="mb-8">
        <CheckCircle2 size={80} className="text-green-500" />
      </div>
      
      {/* Success Message */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Cloudspay-qr</h1>
        <p className="text-green-700 text-base leading-relaxed">
          Success! We have received your payment, if it has not arrived, please find the payment UTR and contact the account manager, we will process your request as soon as possible.
        </p>
      </div>
      
      {/* Redirect Message */}
      <div className="text-center">
        <p className="text-green-600">
          Redirecting to deposit page in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;