import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Smartphone, CheckCircle, AlertCircle, Share, Plus, MoreVertical } from 'lucide-react';

const AppDownload = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deviceType, setDeviceType] = useState('unknown');

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else {
      setDeviceType('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallGuide(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Install error:', error);
      setShowInstallGuide(true);
    }
  };

  const getInstallInstructions = () => {
    if (deviceType === 'ios') {
      return {
        title: 'Install on iPhone/iPad',
        steps: [
          'Tap the Share button below',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right corner',
          'App will be installed on your home screen'
        ],
        icon: '🍎'
      };
    } else if (deviceType === 'android') {
      return {
        title: 'Install on Android',
        steps: [
          'Tap the three-dot menu (⋮) in your browser',
          'Select "Install app" or "Add to Home screen"',
          'Confirm by tapping "Install"',
          'App icon will appear on your home screen'
        ],
        icon: '🤖'
      };
    } else {
      return {
        title: 'Install on Desktop',
        steps: [
          'Click the install button in the address bar',
          'Or click the three-dot menu',
          'Select "Install TradeMint"',
          'App will open in a new window'
        ],
        icon: '💻'
      };
    }
  };

  const instructions = getInstallInstructions();

  return (
    <div className="bg-[#101821] min-h-screen text-white font-sans pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center shadow-lg">
        <button onClick={() => navigate('/')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold ml-4">Download App</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4 mt-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[#49bace] to-[#3da9bd] rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border-4 border-gray-800">
            <Smartphone size={64} className="text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight uppercase">TradeMint App</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
            Install our app for the best experience - Fast, Secure & Always Available
          </p>
        </div>

        {/* Install Status */}
        {isInstalled && (
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3">
            <CheckCircle size={24} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">App is Installed!</p>
              <p className="text-xs text-gray-400">You're ready to trade on the go</p>
            </div>
          </div>
        )}

        {/* Main Install Button */}
        {!isInstalled && (
          <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-[#49bace]/10 rounded-full flex items-center justify-center">
                <Download size={40} className="text-[#49bace]" />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-black text-white mb-1">Install Now</h3>
                <p className="text-xs text-gray-400">Get instant access to all features</p>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-[#49bace] to-[#3da9bd] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-[#3da9bd] hover:to-[#49bace] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {deferredPrompt ? 'Install App' : 'Add to Home Screen'}
              </button>

              {deviceType === 'ios' && (
                <button
                  onClick={() => setShowInstallGuide(!showInstallGuide)}
                  className="w-full bg-[#1a1f2e] border border-gray-700 text-gray-300 font-semibold py-3 px-6 rounded-xl hover:bg-[#212431] transition-all flex items-center justify-center space-x-2"
                >
                  <Share size={18} />
                  <span>Show Install Instructions</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <CheckCircle size={18} className="text-[#49bace]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Why Install the App?</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { title: 'Lightning Fast', desc: 'Optimized performance for mobile devices', icon: '⚡' },
              { title: 'Offline Access', desc: 'Access key features even without internet', icon: '📶' },
              { title: 'Instant Notifications', desc: 'Never miss important updates and alerts', icon: '🔔' },
              { title: 'One-Tap Access', desc: 'Open app directly from home screen', icon: '👆' },
              { title: 'Secure & Safe', desc: 'Biometric authentication support', icon: '🔒' },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3 pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Install Guide Modal */}
        {showInstallGuide && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setShowInstallGuide(false)}>
            <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl">{instructions.icon}</span>
                  <h3 className="text-lg font-bold text-white">{instructions.title}</h3>
                </div>
                <button onClick={() => setShowInstallGuide(false)} className="text-gray-400 hover:text-white">
                  <AlertCircle size={24} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#49bace] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>

              {deviceType === 'ios' && (
                <div className="bg-[#1a1f2e] border border-gray-800 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Share size={32} className="text-[#49bace]" />
                    <Plus size={32} className="text-[#49bace]" />
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-2">Look for these icons in Safari</p>
                </div>
              )}

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full bg-[#49bace] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#3da9bd] transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-gradient-to-br from-[#49bace]/10 to-[#212431] rounded-[2rem] border border-[#49bace]/30 p-6 shadow-xl">
          <div className="text-center mb-4">
            <h3 className="text-base font-black text-white mb-1">What is PWA?</h3>
            <p className="text-xs text-gray-400">Progressive Web App Technology</p>
          </div>
          
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              Our app uses PWA technology to give you a native app experience without downloading from app stores.
            </p>
            <p>
              <strong className="text-white">Benefits:</strong> No storage space needed, automatic updates, works on all devices.
            </p>
            <p>
              <strong className="text-white">Privacy:</strong> Your data remains secure with bank-level encryption.
            </p>
          </div>
        </div>

        {/* Support Info */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle size={18} className="text-[#49bace]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Need Help?</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            If you're having trouble installing the app, please contact our support team. We're available 24/7 to assist you.
          </p>
          <button
            onClick={() => navigate('/support')}
            className="mt-3 text-[#49bace] text-xs font-bold hover:underline"
          >
            Contact Support →
          </button>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-6 rounded-[2.5rem] border border-emerald-500/30 text-center shadow-2xl">
          <h3 className="text-lg font-black text-white mb-2 tracking-tight">Join 50,000+ Happy Users</h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-4">Start Trading Smarter Today</p>
          <div className="flex justify-center items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Trusted Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;
