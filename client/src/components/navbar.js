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
    if (path === '/') setActiveIcon('home');
    else if (path === '/record') setActiveIcon('record');
    else if (path === '/quantify') setActiveIcon('quantify');
    else if (path === '/task') setActiveIcon('task');
    else if (path === '/mine') setActiveIcon('account');
  }, [location.pathname]);

  const handleIconClick = (icon, path) => {
    const token = localStorage.getItem('token');

    if (!token && path !== '/') {
      navigate('/login');
      return;
    }

    if (location.pathname !== path) {
      setIsBouncing((prev) => ({ ...prev, [icon]: true }));
      setActiveIcon(icon);
      setTimeout(() => setIsBouncing((prev) => ({ ...prev, [icon]: false })), 500);
      navigate(path, { replace: true });
    }
  };

  const leftItems = [
    { key: 'home', icon: faHouse, label: 'Home', path: '/' },
    { key: 'record', icon: faBook, label: 'Record', path: '/record' },
  ];

  const rightItems = [
    { key: 'task', icon: faListCheck, label: 'Task', path: '/task' },
    { key: 'account', icon: faUser, label: 'Account', path: '/mine' },
  ];

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 w-full
        flex items-end justify-around
        py-2 bg-[#101821] border-t border-gray-800 shadow-2xl
        navbar-slide-in z-50
        ${className ?? ''}
      `}
    >
      {/* Left Items */}
      {leftItems.map(({ key, icon, label, path }) => (
        <button
          key={key}
          onClick={() => handleIconClick(key, path)}
          className={`
            flex flex-col items-center flex-1
            cursor-pointer transition-all duration-300
            bg-transparent border-none outline-none pb-1
            ${activeIcon === key ? 'text-[#49bace]' : 'text-gray-500'}
          `}
        >
          <FontAwesomeIcon
            icon={icon}
            className={`h-5 mb-1 ${isBouncing[key] ? 'animate-bounce' : ''}`}
          />
          <span className="text-[10px] font-bold uppercase tracking-wide">
            {label}
          </span>
        </button>
      ))}

      {/* Center Quantify FAB */}
      <button
        onClick={() => handleIconClick('quantify', '/quantify')}
        className={`
          flex flex-col items-center flex-1 -mt-5
          cursor-pointer transition-all duration-300
          bg-transparent border-none outline-none
          ${activeIcon === 'quantify' ? 'text-[#49bace]' : 'text-gray-500'}
        `}
      >
        <div
          className={`
            p-3 rounded-full bg-[#101821] border-2
            transition-all duration-300
            ${activeIcon === 'quantify'
              ? 'border-[#49bace] shadow-[0_0_15px_rgba(73,186,206,0.4)]'
              : 'border-gray-700'}
          `}
        >
          <FontAwesomeIcon
            icon={faIndianRupeeSign}
            className={`h-6 ${isBouncing.quantify ? 'animate-bounce' : ''}`}
          />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide mt-1">
          Quantify
        </span>
      </button>

      {/* Right Items */}
      {rightItems.map(({ key, icon, label, path }) => (
        <button
          key={key}
          onClick={() => handleIconClick(key, path)}
          className={`
            flex flex-col items-center flex-1
            cursor-pointer transition-all duration-300
            bg-transparent border-none outline-none pb-1
            ${activeIcon === key ? 'text-[#49bace]' : 'text-gray-500'}
          `}
        >
          <FontAwesomeIcon
            icon={icon}
            className={`h-5 mb-1 ${isBouncing[key] ? 'animate-bounce' : ''}`}
          />
          <span className="text-[10px] font-bold uppercase tracking-wide">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default NavBar;