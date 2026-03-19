import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import AIGLogo from '../pictures/AIGlogo.png'
import Gift from '../pictures/gift.png'
import { NotebookText, Newspaper, Tag, ChevronRight, Volume2, Headset, User, ShieldCheck, Star } from 'lucide-react'
import Slider from './slider';
import { Link } from 'react-router-dom';
import axios from "axios";
const Home = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('Cryptocoin'); // Changed default to Crypto for better live data

  const fetchMarketData = async (category) => {
    setLoading(true);
    try {
      let data = [];
      if (category === 'Cryptocoin') {
        const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "TRXUSDT", "LTCUSDT"];
        try {
          const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`);
          data = response.data.map(q => ({
            name: q.symbol.replace("USDT", "/USDT"),
            price: parseFloat(q.lastPrice) > 1 ? parseFloat(q.lastPrice).toFixed(2) : parseFloat(q.lastPrice).toFixed(5),
            change: parseFloat(q.priceChangePercent).toFixed(2)
          }));
        } catch (err) {
          // Fallback if Binance fails
          data = [
            { name: "BTC/USDT", price: "68409.65", change: "0.00031" },
            { name: "ETH/USDT", price: "2451.20", change: "-0.15" },
            { name: "BNB/USDT", price: "557.83", change: "0.00014" },
            { name: "SOL/USDT", price: "145.67", change: "1.20" }
          ];
        }
      } else if (category === 'Stock') {
        // Stocks often require keys that expire. Providing high-quality live-simulated data for Demo stability.
        data = [
          { name: "AAPL", price: (185.92 + Math.random()).toFixed(2), change: (Math.random() * 2 - 0.5).toFixed(2) },
          { name: "MSFT", price: (402.15 + Math.random()).toFixed(2), change: (Math.random() * 1.5 - 0.2).toFixed(2) },
          { name: "GOOGL", price: (142.70 + Math.random()).toFixed(2), change: (Math.random() * 3 - 1.5).toFixed(2) },
          { name: "AMZN", price: (174.45 + Math.random()).toFixed(2), change: (Math.random() * 2 - 1).toFixed(2) },
          { name: "TSLA", price: (193.57 + Math.random()).toFixed(2), change: (Math.random() * 5 - 2.5).toFixed(2) }
        ];
      } else if (category === 'Forex') {
        data = [
          { name: "EUR/USD", price: (1.0821 + Math.random() * 0.001).toFixed(4), change: (Math.random() * 0.1 - 0.05).toFixed(3) },
          { name: "GBP/USD", price: (1.2634 + Math.random() * 0.001).toFixed(4), change: (Math.random() * 0.1 - 0.05).toFixed(3) },
          { name: "USD/JPY", price: (148.12 + Math.random() * 0.1).toFixed(2), change: (Math.random() * 0.2 - 0.1).toFixed(2) },
          { name: "AUD/USD", price: (0.6542 + Math.random() * 0.001).toFixed(4), change: (Math.random() * 0.1 - 0.05).toFixed(3) }
        ];
      } else if (category === 'Bonds') {
        data = [
          { name: "US 10Y", price: (4.215 + Math.random() * 0.01).toFixed(3), change: (Math.random() * 0.05 - 0.02).toFixed(2) },
          { name: "US 2Y", price: (4.582 + Math.random() * 0.01).toFixed(3), change: (Math.random() * 0.05 - 0.02).toFixed(2) },
          { name: "US 30Y", price: (4.391 + Math.random() * 0.01).toFixed(3), change: (Math.random() * 0.05 - 0.02).toFixed(2) },
          { name: "UK 10Y", price: (3.980 + Math.random() * 0.01).toFixed(3), change: (Math.random() * 0.05 - 0.02).toFixed(2) }
        ];
      }
      setMarketData(data);
    } catch (error) {
      console.error("Critical error fetching market data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMarketData(selectedMarket);
    const interval = setInterval(() => fetchMarketData(selectedMarket), 10000); // Faster updates for "Live" feel
    return () => clearInterval(interval);
  }, [selectedMarket]);

  const withData = [
    { username: "MEMBER_10001_OFT", phone: "98765*****", amount: "15,000" },
    { username: "MEMBER_10002_OFT", phone: "87654*****", amount: "8,500" },
    { username: "MEMBER_10003_OFT", phone: "76543*****", amount: "20,000" },
    { username: "MEMBER_10004_OFT", phone: "95432*****", amount: "400" },
    { username: "MEMBER_10005_OFT", phone: "84321*****", amount: "650" },
    { username: "MEMBER_10006_OFT", phone: "73210*****", amount: "850" },
    { username: "MEMBER_10007_OFT", phone: "92108*****", amount: "950" },
    { username: "MEMBER_10008_OFT", phone: "81097*****", amount: "350" },
    { username: "MEMBER_10009_OFT", phone: "70986*****", amount: "550" },
    { username: "MEMBER_10010_OFT", phone: "89875*****", amount: "750" },
    { username: "MEMBER_10011_OFT", phone: "78764*****", amount: "450" },
    { username: "MEMBER_10012_OFT", phone: "67653*****", amount: "780" },
    { username: "MEMBER_10013_OFT", phone: "96542*****", amount: "920" },
    { username: "MEMBER_10014_OFT", phone: "85431*****", amount: "520" },
    { username: "MEMBER_10015_OFT", phone: "74320*****", amount: "680" },
    { username: "MEMBER_10016_OFT", phone: "63219*****", amount: "250" },
    { username: "MEMBER_10017_OFT", phone: "52108*****", amount: "1,350" },
    { username: "MEMBER_10018_OFT", phone: "91097*****", amount: "800" },
    { username: "MEMBER_10019_OFT", phone: "80986*****", amount: "1,750" },
    { username: "MEMBER_10020_OFT", phone: "69875*****", amount: "450" },
    { username: "MEMBER_10021_OFT", phone: "58764*****", amount: "1,050" },
    { username: "MEMBER_10022_OFT", phone: "47653*****", amount: "680" },
    { username: "MEMBER_10023_OFT", phone: "36542*****", amount: "1,550" },
    { username: "MEMBER_10024_OFT", phone: "25431*****", amount: "320" },
    { username: "MEMBER_10025_OFT", phone: "14320*****", amount: "1,200" },
    { username: "MEMBER_10026_OFT", phone: "93219*****", amount: "750" },
    { username: "MEMBER_10027_OFT", phone: "82108*****", amount: "1,850" },
    { username: "MEMBER_10028_OFT", phone: "71097*****", amount: "580" },
    { username: "MEMBER_10029_OFT", phone: "60986*****", amount: "1,450" },
    { username: "MEMBER_10030_OFT", phone: "59875*****", amount: "920" },
    { username: "MEMBER_10031_OFT", phone: "48764*****", amount: "1,600" },
    { username: "MEMBER_10032_OFT", phone: "37653*****", amount: "280" },
    { username: "MEMBER_10033_OFT", phone: "26542*****", amount: "1,150" },
    { username: "MEMBER_10034_OFT", phone: "15431*****", amount: "650" },
    { username: "MEMBER_10035_OFT", phone: "94320*****", amount: "1,950" },
    { username: "MEMBER_10036_OFT", phone: "83219*****", amount: "420" },
    { username: "MEMBER_10037_OFT", phone: "72108*****", amount: "1,300" },
    { username: "MEMBER_10038_OFT", phone: "61097*****", amount: "880" },
    { username: "MEMBER_10039_OFT", phone: "50986*****", amount: "1,700" },
    { username: "MEMBER_10040_OFT", phone: "49875*****", amount: "100" },
  ];

  const testimonialData = [
    { name: "Rahul Sharma", rating: 5, comment: "Best platform for quick earnings. Highly recommended!", gender: "M" },
    { name: "Priya Patel", rating: 4, comment: "Interface is very smooth and deposit process is instant.", gender: "F" },
    { name: "Amit Gupta", rating: 5, comment: "I received my withdrawal within 10 minutes. Trusted app!", gender: "M" },
    { name: "Sneha Reddy", rating: 5, comment: "Very secure and reliable. I love the user experience here.", gender: "F" },
    { name: "Vikram Singh", rating: 4, comment: "Great support team and clear instructions for everything.", gender: "M" },
    { name: "Ananya Das", rating: 5, comment: "Amazing platform! My earnings have doubled since I joined.", gender: "F" },
    { name: "Rohan Mehta", rating: 5, comment: "Super fast withdrawals and excellent customer support.", gender: "M" },
    { name: "Divya Nair", rating: 4, comment: "Love the transparency and security features of this app.", gender: "F" },
  ];

  const data = [
    { name: "Product A", price: "$20", change: "Increase" },
    { name: "Product B", price: "$35", change: "Decrease" },
    { name: "Product C", price: "$50", change: "Increase" },
    { name: "Product D", price: "$15", change: "Decrease" },
  ];
 
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random index instead of sequential
      setActiveTestimonial((prev) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * testimonialData.length);
        } while (newIndex === prev && testimonialData.length > 1);
        return newIndex;
      });
    }, 8000); // Changed from 30000ms to 8000ms for faster rotation
    return () => clearInterval(interval);
  }, [testimonialData.length]);


  const navigate = useNavigate();

  const handleGlobalClick = (e) => {
    const token = localStorage.getItem('token');
    if (!token) {
      e.preventDefault();
      e.stopPropagation();
      navigate('/login');
    }
  };

  const isLoggedIn = !!localStorage.getItem('token');

  const marketItems = ['Stock', 'Cryptocoin', 'Bonds', 'Forex'];

  return (
    <div className="bg-[#101821] min-h-screen text-white relative" onClickCapture={handleGlobalClick}>
      {/* Top Right Icons (Support & User) */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        {/* Customer Support Icon */}
        <div 
          className="cursor-pointer bg-[#312c42] p-2 rounded-full shadow-lg border border-gray-600 hover:bg-[#413c52] transition-colors"
          onClick={() => navigate('/support')}
        >
          <Headset size={24} className="text-[#49bace]" />
        </div>
        
        {/* User Icon - Only show if not logged in */}
        {!isLoggedIn && (
          <div className="cursor-pointer bg-[#312c42] p-2 rounded-full shadow-lg border border-gray-600 hover:bg-[#413c52] transition-colors" onClick={() => navigate('/register')}>
            <User size={24} className="text-[#49bace]" />
          </div>
        )}
      </div>

      <div>
        <img
          src={AIGLogo}
          alt="AIG"
          className="mb-4 ml-3 mt-4 w-[32%]"
        />
        <Slider />
        {/* Notification Bar */}
        <div className="mx-auto w-[92%] mt-4 bg-[#212431] rounded-full flex items-center px-4 py-2 border border-gray-700 shadow-xl">
          <Volume2 className="text-[#49bace]" size={20} />
          
          <div className="flex-grow overflow-hidden h-6 mx-2 relative flex items-center">
            <div className="animate-marquee-vertical text-white text-[11px] font-medium w-full text-center">
              All players registered on this platform must bind their bank data.
            </div>
          </div>

          <button className="bg-[#49bace] text-white px-4 py-1 rounded-full text-[12px] font-bold shadow-md hover:bg-[#3da9bd] transition-colors">
            Detail
          </button>
        </div>
      </div>

      <div className="flex flex-row px-5 py-4 gap-4">
        <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-3xl flex flex-col justify-start items-center p-4 w-full">
            <div className="flex flex-col items-start w-full space-y-1">
              <span className='font-sans font-semibold'>Win Rewards</span>
              <button className="text-white bg-[#49bace] font-semibold rounded-full px-4 py-1 text-sm shadow-md hover:bg-[#3da9bd] transition-colors" onClick={() => { navigate('/refer-earn') }}>Invite Friends</button>
            </div>
            <img 
              src={Gift}
              alt='GiftPic'
              className='rounded-xl mt-2 w-[50%] sm:w-[60%] z-auto' 
              style={{ alignSelf: 'center' }} 
            />
        </div>

        <div className="flex flex-col w-full justify-between gap-2">
            <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-2 flex items-center gap-2 p-2 transition-all" onClick={() => navigate('/platform-info')}>
              <div className='p-1 bg-[#f7db45] z-40 rounded-lg'>
                <NotebookText size={24} color="#fff" />
              </div>
              <span className='text-left text-sm font-medium cursor-pointer'>Platform Information</span>
            </div>

            <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-2 flex items-center gap-2 p-2 transition-all">
              <div className='p-1 bg-[#ef865a] z-40 rounded-lg'>
                <Newspaper size={24} color="#fff" />
              </div>
              <Link to="/white">
              <span className='text-left text-sm font-medium text-white'>White Paper</span>
              </Link>
            </div>

            <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-2 flex items-center gap-2 p-2 transition-all" onClick={() => navigate('/download-app')}>
              <div className='p-1 bg-[#8418cd] z-40 rounded-lg'>
                <Tag size={24} color="#fff" />
              </div>
              <span className='text-left text-sm font-medium cursor-pointer'>APP Download</span>
            </div>
        </div>
      </div>

    <div className='mx-5'>
    <Link to="/mission">
      <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-5 flex items-center gap-2 px-5 py-4 justify-between text-md hover:bg-[#2a2d3d] transition-all">
      <span className="font-medium">Mission Center</span>
      <ChevronRight size={24} />
      </div>
      </Link>


      <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-5 flex flex-col p-5">
        <span className="text-white font-bold text-left">Market</span>
        <div className="flex flex-row mt-2 text-zinc-400">
          {marketItems.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedMarket(item)}
              className={`cursor-pointer border rounded-full p-1 px-3 mx-1 text-xs font-medium transition-all ${
                selectedMarket === item ? 'border-[#49bace] text-[#49bace] bg-[#49bace]/10' : 'border-gray-600' 
              }`}
            >
              {item}
            </div>
          ))}
           
        </div>
        <div className="relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#212431]/50 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#49bace]"></div>
            </div>
          )}
            <table className="w-full mt-4 table-fixed">
                <thead>
                  <tr className="">
                    <th className="w-[30%] px-3 py-3 pb-0 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                    <th className="w-[35%] px-3 py-3 pb-0 text-left text-xs font-bold text-white uppercase tracking-wider">Price</th>
                    <th className="w-[35%] px-3 py-3 pb-0 text-right text-xs font-bold text-white uppercase tracking-wider">Increase or decrease</th>
                  </tr>
                </thead>
                <tbody>
                {marketData.map((item, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 px-3 text-left text-sm font-bold text-white truncate">{item.name}</td>
                  <td className="py-3 px-3 text-left text-sm font-medium text-gray-200 truncate">{item.price}</td>
                  <td
                    className={`py-3 px-3 text-right text-sm font-bold flex items-center justify-end whitespace-nowrap ${
                      parseFloat(item.change) >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <span className="mr-1">{parseFloat(item.change) >= 0 ? "↑" : "↓"}</span>
                    {Math.abs(item.change)}%
                  </td>
                </tr>
              ))}
                </tbody>
              </table>
        </div>
      </div>

      <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-5 flex flex-col p-5">
        <span className="text-white font-bold text-left">Today's Withdrawals</span>
        <div className="flex flex-row mt-2 text-zinc-400">
          <div className="relative h-[300px] w-full overflow-hidden text-white rounded-lg">
          <table className="w-full">
        {/* Fixed Header */}
        <thead className="sticky top-0 bg-[#212431] z-10 border-b border-gray-700">
          <tr>
            <th className="text-left py-3 px-4 w-[50%] text-xs font-bold uppercase tracking-wider">Username</th>
            <th className="text-right py-3 px-4 w-[50%] text-xs font-bold uppercase tracking-wider">Amount</th>
          </tr>
        </thead>

        {/* Scrolling Content */}
        <tbody className="animate-marquee1 w-full">
          {withData.map((item, index) => {
            // Mask last 5 characters of username
            const maskUsername = (username) => {
              if (username.length <= 5) return username;
              const visiblePart = username.slice(0, -5);
              return visiblePart + "*****";
            };
            
            return (
              <tr key={index} className="text-left">
                <td className="py-2.5 px-4 w-[50%] text-left text-sm font-medium text-gray-300 truncate">{maskUsername(item.username)}</td>
                <td className="py-2.5 px-4 w-[50%] text-right text-sm font-bold text-[#49bace]">₹{item.amount}</td>
              </tr>
            );
          })}
          {/* Duplicate Rows for Smooth Animation */}
          {withData.map((item, index) => {
            // Mask last 5 characters of username
            const maskUsername = (username) => {
              if (username.length <= 5) return username;
              const visiblePart = username.slice(0, -5);
              return visiblePart + "*****";
            };
            
            return (
              <tr key={`duplicate-${index}`} className="text-left">
                <td className="py-2.5 px-4 w-[50%] text-left text-sm font-medium text-gray-300 truncate">{maskUsername(item.username)}</td>
                <td className="py-2.5 px-4 w-[50%] text-right text-sm font-bold text-[#49bace]">₹{item.amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
            </div>
          </div>
        </div>
      

      <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-5 flex flex-col p-5 overflow-hidden">
        <span className="text-white font-bold text-left mb-4">Trusted Feedback's</span>
        <div className="relative h-[140px] sm:h-[120px]">
          {testimonialData.map((t, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 w-full transition-all duration-700 transform ${
                index === activeTestimonial 
                ? "translate-x-0 opacity-100" 
                : "translate-x-full opacity-0"
              }`}
            >
              <div className="bg-[#1a1f2e] p-4 rounded-xl border border-gray-800 shadow-md h-full overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${t.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-none">{t.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < t.rating ? "#f7db45" : "none"} className={i < t.rating ? "text-[#f7db45]" : "text-gray-600"} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 italic line-clamp-3 sm:line-clamp-2 leading-relaxed">"{t.comment}"</p>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {testimonialData.map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeTestimonial ? "bg-[#49bace] w-3" : "bg-gray-700"}`}
            />
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

export default Home;



