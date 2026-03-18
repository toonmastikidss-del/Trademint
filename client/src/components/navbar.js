import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faHouse, faUser, faListCheck, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar = ({ className }) => {
  const [isBouncing, setIsBouncing] = useState({
    home: false,
    record: false,
    quantify: false,
    task: false,
    account: false,
  });

  const [activeIcon, setActiveIcon] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveIcon('home');
    } else if (path === '/record') {
      setActiveIcon('record');
    } else if (path === '/quantify') {
      setActiveIcon('quantify');
    } else if (path === '/task') {
      setActiveIcon('task');
    } else if (path === '/mine') {
      setActiveIcon('account');
    }
  }, [location.pathname]);

  const handleIconClick = (icon, path) => {
    const token = localStorage.getItem('token');
    
    // Allow home but redirect everything else if no token
    if (!token && path !== '/') {
      navigate('/login');
      return;
    }

    if (location.pathname !== path) {
      setIsBouncing({ ...isBouncing, [icon]: true });
      setActiveIcon(icon);
      setTimeout(() => setIsBouncing({ ...isBouncing, [icon]: false }), 500);
      navigate(path, { replace: true });
    }
  };

  return (
    <div className={`flex justify-around py-3 bg-[#101821] border-t border-gray-800 shadow-2xl navbar-slide-in z-50 ${className}`}>
      <div className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${activeIcon === 'home' ? 'text-[#49bace]' : 'text-gray-500'}`} onClick={() => handleIconClick('home', '/')}>
        <FontAwesomeIcon 
          icon={faHouse}
          title="Home"
          className={`h-5 mb-1 ${isBouncing.home ? 'animate-bounce' : ''}`} 
        />
        <div className="text-[10px] font-bold uppercase tracking-wide">Home</div>
      </div>
      <div className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${activeIcon === 'record' ? 'text-[#49bace]' : 'text-gray-500'}`} onClick={() => handleIconClick('record', '/record')}>
        <FontAwesomeIcon 
          icon={faBook}
          title="Record"
          className={`h-5 mb-1 ${isBouncing.record ? 'animate-bounce' : ''}`} 
        />
        <div className="text-[10px] font-bold uppercase tracking-wide">Record</div>
      </div>
      <div className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${activeIcon === 'quantify' ? 'text-[#49bace]' : 'text-gray-500'}`} onClick={() => handleIconClick('quantify', '/quantify')}>
        <div className={`p-2 rounded-full -mt-6 bg-[#101821] border-2 ${activeIcon === 'quantify' ? 'border-[#49bace] shadow-[0_0_15px_rgba(73,186,206,0.4)]' : 'border-gray-800'}`}>
          <FontAwesomeIcon 
            icon={faIndianRupeeSign}
            title="Quantify"
            className={`h-6 ${isBouncing.quantify ? 'animate-bounce' : ''}`} 
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wide mt-1">Quantify</div>
      </div>

      <div className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${activeIcon === 'task' ? 'text-[#49bace]' : 'text-gray-500'}`} onClick={() => handleIconClick('task', '/task')}>
        <FontAwesomeIcon 
          icon={faListCheck}
          title="Task"
          className={`h-5 mb-1 ${isBouncing.task ? 'animate-bounce' : ''}`} 
        />
        <div className="text-[10px] font-bold uppercase tracking-wide">Task</div>
      </div>
      <div className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${activeIcon === 'account' ? 'text-[#49bace]' : 'text-gray-500'}`} onClick={() => handleIconClick('account', '/mine')}>
        <FontAwesomeIcon 
          icon={faUser}
          title="Account"
          className={`h-5 mb-1 ${isBouncing.account ? 'animate-bounce' : ''}`} 
        />
        <div className="text-[10px] font-bold uppercase tracking-wide">Account</div>
      </div>
    </div>
  );
};

export default NavBar;