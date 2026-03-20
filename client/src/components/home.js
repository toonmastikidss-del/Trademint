import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom'
import AIGLogo from '../pictures/AIGlogo.png'
import Gift from '../pictures/gift.png'
import { NotebookText, Newspaper, Tag, ChevronRight, Volume2, Headset, User, Star } from 'lucide-react'
import Slider from './slider';
import { Link } from 'react-router-dom';
import axios from "axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const CRYPTO_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "TRXUSDT", "LTCUSDT"];

const WS_URL = `wss://stream.binance.com:9443/stream?streams=${
  CRYPTO_SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/')
}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCryptoRow = (d) => ({
  name: d.s.replace("USDT", "/USDT"),
  price: parseFloat(d.c) > 1
    ? parseFloat(d.c).toFixed(2)
    : parseFloat(d.c).toFixed(5),
  change: parseFloat(d.P).toFixed(2),
});

// ─── Static mock data ─────────────────────────────────────────────────────────

const getStockData = () => [
  { name: "AAPL",  price: (185.92 + Math.random()).toFixed(2),          change: (Math.random() * 2   - 0.5).toFixed(2)  },
  { name: "MSFT",  price: (402.15 + Math.random()).toFixed(2),          change: (Math.random() * 1.5 - 0.2).toFixed(2)  },
  { name: "GOOGL", price: (142.70 + Math.random()).toFixed(2),          change: (Math.random() * 3   - 1.5).toFixed(2)  },
  { name: "AMZN",  price: (174.45 + Math.random()).toFixed(2),          change: (Math.random() * 2   - 1).toFixed(2)    },
  { name: "TSLA",  price: (193.57 + Math.random()).toFixed(2),          change: (Math.random() * 5   - 2.5).toFixed(2)  },
];

const getForexData = () => [
  { name: "EUR/USD", price: (1.0821 + Math.random() * 0.001).toFixed(4), change: (Math.random() * 0.1  - 0.05).toFixed(3) },
  { name: "GBP/USD", price: (1.2634 + Math.random() * 0.001).toFixed(4), change: (Math.random() * 0.1  - 0.05).toFixed(3) },
  { name: "USD/JPY", price: (148.12 + Math.random() * 0.1).toFixed(2),   change: (Math.random() * 0.2  - 0.1).toFixed(2)  },
  { name: "AUD/USD", price: (0.6542 + Math.random() * 0.001).toFixed(4), change: (Math.random() * 0.1  - 0.05).toFixed(3) },
];

const getBondsData = () => [
  { name: "US 10Y", price: (4.215 + Math.random() * 0.01).toFixed(3), change: (Math.random() * 0.05 - 0.02).toFixed(2) },
  { name: "US 2Y",  price: (4.582 + Math.random() * 0.01).toFixed(3), change: (Math.random() * 0.05 - 0.02).toFixed(2) },
  { name: "US 30Y", price: (4.391 + Math.random() * 0.01).toFixed(3), change: (Math.random() * 0.05 - 0.02).toFixed(2) },
  { name: "UK 10Y", price: (3.980 + Math.random() * 0.01).toFixed(3), change: (Math.random() * 0.05 - 0.02).toFixed(2) },
];

// ─── Static lists (defined outside component — never changes, no re-render) ───

const WITH_DATA = [
  { username: "MEMBER_10001_OFT", amount: "15,000" },
  { username: "MEMBER_10002_OFT", amount: "8,500"  },
  { username: "MEMBER_10003_OFT", amount: "20,000" },
  { username: "MEMBER_10004_OFT", amount: "400"    },
  { username: "MEMBER_10005_OFT", amount: "650"    },
  { username: "MEMBER_10006_OFT", amount: "850"    },
  { username: "MEMBER_10007_OFT", amount: "950"    },
  { username: "MEMBER_10008_OFT", amount: "350"    },
  { username: "MEMBER_10009_OFT", amount: "550"    },
  { username: "MEMBER_10010_OFT", amount: "750"    },
  { username: "MEMBER_10011_OFT", amount: "450"    },
  { username: "MEMBER_10012_OFT", amount: "780"    },
  { username: "MEMBER_10013_OFT", amount: "920"    },
  { username: "MEMBER_10014_OFT", amount: "520"    },
  { username: "MEMBER_10015_OFT", amount: "680"    },
  { username: "MEMBER_10016_OFT", amount: "250"    },
  { username: "MEMBER_10017_OFT", amount: "1,350"  },
  { username: "MEMBER_10018_OFT", amount: "800"    },
  { username: "MEMBER_10019_OFT", amount: "1,750"  },
  { username: "MEMBER_10020_OFT", amount: "450"    },
  { username: "MEMBER_10021_OFT", amount: "1,050"  },
  { username: "MEMBER_10022_OFT", amount: "680"    },
  { username: "MEMBER_10023_OFT", amount: "1,550"  },
  { username: "MEMBER_10024_OFT", amount: "320"    },
  { username: "MEMBER_10025_OFT", amount: "1,200"  },
  { username: "MEMBER_10026_OFT", amount: "750"    },
  { username: "MEMBER_10027_OFT", amount: "1,850"  },
  { username: "MEMBER_10028_OFT", amount: "580"    },
  { username: "MEMBER_10029_OFT", amount: "1,450"  },
  { username: "MEMBER_10030_OFT", amount: "920"    },
  { username: "MEMBER_10031_OFT", amount: "1,600"  },
  { username: "MEMBER_10032_OFT", amount: "280"    },
  { username: "MEMBER_10033_OFT", amount: "1,150"  },
  { username: "MEMBER_10034_OFT", amount: "650"    },
  { username: "MEMBER_10035_OFT", amount: "1,950"  },
  { username: "MEMBER_10036_OFT", amount: "420"    },
  { username: "MEMBER_10037_OFT", amount: "1,300"  },
  { username: "MEMBER_10038_OFT", amount: "880"    },
  { username: "MEMBER_10039_OFT", amount: "1,700"  },
  { username: "MEMBER_10040_OFT", amount: "100"    },
];

const TESTIMONIAL_DATA = [
  { name: "Rahul Sharma", rating: 5, comment: "Best platform for quick earnings. Highly recommended!", gender: "M" },
  { name: "Priya Patel",  rating: 4, comment: "Interface is very smooth and deposit process is instant.", gender: "F" },
  { name: "Amit Gupta",   rating: 5, comment: "I received my withdrawal within 10 minutes. Trusted app!", gender: "M" },
  { name: "Sneha Reddy",  rating: 5, comment: "Very secure and reliable. I love the user experience here.", gender: "F" },
  { name: "Vikram Singh", rating: 4, comment: "Great support team and clear instructions for everything.", gender: "M" },
  { name: "Ananya Das",   rating: 5, comment: "Amazing platform! My earnings have doubled since I joined.", gender: "F" },
  { name: "Rohan Mehta",  rating: 5, comment: "Super fast withdrawals and excellent customer support.", gender: "M" },
  { name: "Divya Nair",   rating: 4, comment: "Love the transparency and security features of this app.", gender: "F" },
];

const MARKET_ITEMS = ['Stock', 'Cryptocoin', 'Bonds', 'Forex'];

// maskUsername also outside — pure function, no need inside component
const maskUsername = (username) => {
  if (username.length <= 5) return username;
  return username.slice(0, -5) + "*****";
};

// ─── Component ────────────────────────────────────────────────────────────────

const Home = () => {
  // ── 1. All hooks first — order must never change ───────────────────────────
  const navigate = useNavigate();                              // ← MOVED TO TOP

  const [marketData,        setMarketData]        = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [selectedMarket,    setSelectedMarket]    = useState('Cryptocoin');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const wsRef          = useRef(null);
  const pollIntervalRef = useRef(null);
  const cryptoCacheRef = useRef({});

  // ── 2. Derived values — after hooks, before useEffects ────────────────────
  const isLoggedIn = !!localStorage.getItem('token');         // ← MOVED UP

  // ── 3. Stable callbacks — after hooks, before useEffects ─────────────────

  const handleGlobalClick = (e) => {                          // ← MOVED UP
    if (!localStorage.getItem('token')) {
      e.preventDefault();
      e.stopPropagation();
      navigate('/login');
    }
  };

  const openCryptoWS = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    setLoading(true);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const msg  = JSON.parse(event.data);
        const tick = msg.data;

        cryptoCacheRef.current[tick.s] = formatCryptoRow(tick);

        const ordered = CRYPTO_SYMBOLS
          .map(sym => cryptoCacheRef.current[sym])
          .filter(Boolean);

        if (ordered.length > 0) {
          setMarketData(ordered);
          setLoading(false);
        }
      } catch {
        // malformed frame — ignore
      }
    };

    ws.onerror = () => { fallbackCryptoREST(); };
    ws.onclose = () => {};
  };

  const closeCryptoWS = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    cryptoCacheRef.current = {};
  };

  const fallbackCryptoREST = async () => {
    try {
      const resp = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(CRYPTO_SYMBOLS)}`
      );
      setMarketData(
        resp.data.map(q => ({
          name:   q.symbol.replace("USDT", "/USDT"),
          price:  parseFloat(q.lastPrice) > 1
                    ? parseFloat(q.lastPrice).toFixed(2)
                    : parseFloat(q.lastPrice).toFixed(5),
          change: parseFloat(q.priceChangePercent).toFixed(2),
        }))
      );
    } catch {
      setMarketData([
        { name: "BTC/USDT", price: "68409.65", change: "0.03"  },
        { name: "ETH/USDT", price: "2451.20",  change: "-0.15" },
        { name: "BNB/USDT", price: "557.83",   change: "0.01"  },
        { name: "SOL/USDT", price: "145.67",   change: "1.20"  },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startPoll = (category) => {
    const getData = () => {
      setLoading(true);
      if      (category === 'Stock') setMarketData(getStockData());
      else if (category === 'Forex') setMarketData(getForexData());
      else if (category === 'Bonds') setMarketData(getBondsData());
      setLoading(false);
    };
    getData();
    pollIntervalRef.current = setInterval(getData, 30_000);
  };

  const stopPoll = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // ── 4. useEffects last — all declarations are already initialized above ───

  // Market switching
  useEffect(() => {
    closeCryptoWS();
    stopPoll();
    setMarketData([]);

    if (selectedMarket === 'Cryptocoin') {
      openCryptoWS();
    } else {
      startPoll(selectedMarket);
    }

    return () => {
      closeCryptoWS();
      stopPoll();
    };
  }, [selectedMarket]);

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => {
        let next;
        do { next = Math.floor(Math.random() * TESTIMONIAL_DATA.length); }
        while (next === prev && TESTIMONIAL_DATA.length > 1);
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#101821] min-h-screen text-white relative" onClickCapture={handleGlobalClick}>

      {/* Top Right Icons */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        <div
          className="cursor-pointer bg-[#312c42] p-2 rounded-full shadow-lg border border-gray-600 hover:bg-[#413c52] transition-colors"
          onClick={() => navigate('/support')}
        >
          <Headset size={24} className="text-[#49bace]" />
        </div>
        {!isLoggedIn && (
          <div
            className="cursor-pointer bg-[#312c42] p-2 rounded-full shadow-lg border border-gray-600 hover:bg-[#413c52] transition-colors"
            onClick={() => navigate('/register')}
          >
            <User size={24} className="text-[#49bace]" />
          </div>
        )}
      </div>

      <div>
        <img src={AIGLogo} alt="AIG" className="mb-4 ml-3 mt-4 w-[32%]" />
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
            <button
              className="text-white bg-[#49bace] font-semibold rounded-full px-4 py-1 text-sm shadow-md hover:bg-[#3da9bd] transition-colors"
              onClick={() => navigate('/refer-earn')}
            >
              Invite Friends
            </button>
          </div>
          <img src={Gift} alt='GiftPic' className='rounded-xl mt-2 w-[50%] sm:w-[60%] z-auto' style={{ alignSelf: 'center' }} />
        </div>

        <div className="flex flex-col w-full justify-between gap-2">
          <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-2 flex items-center gap-2 p-2 transition-all" onClick={() => navigate('/platform-info')}>
            <div className='p-1 bg-[#f7db45] z-40 rounded-lg'><NotebookText size={24} color="#fff" /></div>
            <span className='text-left text-sm font-medium cursor-pointer'>Platform Information</span>
          </div>

          <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-2 flex items-center gap-2 p-2 transition-all">
            <div className='p-1 bg-[#ef865a] z-40 rounded-lg'><Newspaper size={24} color="#fff" /></div>
            <Link to="/white"><span className='text-left text-sm font-medium text-white'>White Paper</span></Link>
          </div>

          <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-2 flex items-center gap-2 p-2 transition-all" onClick={() => navigate('/download-app')}>
            <div className='p-1 bg-[#8418cd] z-40 rounded-lg'><Tag size={24} color="#fff" /></div>
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

        {/* ── Market Section ──────────────────────────────────────────── */}
        <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-5 flex flex-col p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold text-left">Market</span>
            {selectedMarket === 'Cryptocoin' && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                LIVE
              </span>
            )}
          </div>

          <div className="flex flex-row mt-2 text-zinc-400">
            {MARKET_ITEMS.map((item) => (
              <div
                key={item}
                onClick={() => setSelectedMarket(item)}
                className={`cursor-pointer border rounded-full p-1 px-3 mx-1 text-xs font-medium transition-all ${
                  selectedMarket === item
                    ? 'border-[#49bace] text-[#49bace] bg-[#49bace]/10'
                    : 'border-gray-600'
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
                <tr>
                  <th className="w-[30%] px-3 py-3 pb-0 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                  <th className="w-[35%] px-3 py-3 pb-0 text-left text-xs font-bold text-white uppercase tracking-wider">Price</th>
                  <th className="w-[35%] px-3 py-3 pb-0 text-right text-xs font-bold text-white uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 px-3 text-left text-sm font-bold text-white truncate">{item.name}</td>
                    <td className="py-3 px-3 text-left text-sm font-medium text-gray-200 truncate">{item.price}</td>
                    <td className={`py-3 px-3 text-right text-sm font-bold flex items-center justify-end whitespace-nowrap ${
                      parseFloat(item.change) >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      <span className="mr-1">{parseFloat(item.change) >= 0 ? "↑" : "↓"}</span>
                      {Math.abs(item.change)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Today's Withdrawals ─────────────────────────────────────── */}
        <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-5 flex flex-col p-5">
          <span className="text-white font-bold text-left">Today's Withdrawals</span>
          <div className="flex flex-row mt-2 text-zinc-400">
            <div className="relative h-[300px] w-full overflow-hidden text-white rounded-lg">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#212431] z-10 border-b border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 w-[50%] text-xs font-bold uppercase tracking-wider">Username</th>
                    <th className="text-right py-3 px-4 w-[50%] text-xs font-bold uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="animate-marquee1 w-full">
                  {[...WITH_DATA, ...WITH_DATA].map((item, index) => (
                    <tr key={index} className="text-left">
                      <td className="py-2.5 px-4 w-[50%] text-left text-sm font-medium text-gray-300 truncate">{maskUsername(item.username)}</td>
                      <td className="py-2.5 px-4 w-[50%] text-right text-sm font-bold text-[#49bace]">₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Testimonials ────────────────────────────────────────────── */}
        <div className="bg-[#212431] border border-gray-700 shadow-xl rounded-2xl mb-5 flex flex-col p-5 overflow-hidden">
          <span className="text-white font-bold text-left mb-4">Trusted Feedback's</span>
          <div className="relative h-[140px] sm:h-[120px]">
            {TESTIMONIAL_DATA.map((t, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full transition-all duration-700 transform ${
                  index === activeTestimonial ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
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
            {TESTIMONIAL_DATA.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeTestimonial ? "bg-[#49bace] w-3" : "bg-gray-700"}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;