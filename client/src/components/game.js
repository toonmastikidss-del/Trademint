import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Trophy, Star, TrendingUp, Users, Gamepad2, Coins } from 'lucide-react';
import { API_CONFIG } from '../config/apiConfig';

const Game = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Demo game statistics (to be replaced with real API data)
  const gameStats = [
    { icon: Trophy, label: 'Total Games', value: '0', color: 'text-amber-400' },
    { icon: Star, label: 'Win Rate', value: '0%', color: 'text-emerald-400' },
    { icon: TrendingUp, label: 'Best Streak', value: '0', color: 'text-blue-400' },
    { icon: Users, label: 'Rank', value: '--', color: 'text-purple-400' }
  ];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/game`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.games && response.data.games.length > 0) {
          setGames(response.data.games);
        } else {
          setGames([]);
          setError('No games available at the moment');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games. Please try again later.');
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Group games by popularity
  const getPopularity = (players) => {
    if (players >= 2000) return 'high';
    if (players >= 1000) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="bg-[#101821] min-h-screen text-white flex items-center justify-center">
        <p className="text-gray-400">Loading games...</p>
      </div>
    );
  }

  if (error || games.length === 0) {
    return (
      <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
          <button onClick={() => navigate('/mine')} className="p-1">
            <ChevronLeft size={24} className="text-gray-300" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Game Center</h1>
          <div className="w-6"></div>
        </div>

        <div className="flex flex-col items-center justify-center mt-32 px-4">
          <div className="w-24 h-24 bg-[#212431] rounded-full flex items-center justify-center mb-6 border border-gray-700">
            <Gamepad2 size={48} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Games Available</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            {error || 'Games are being updated. Please check back later.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-[#49bace] text-[#101821] font-bold rounded-full hover:bg-[#5ac8da] transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Group games by category
  const gamesByCategory = {
    Casual: games.filter(g => g.category === 'Casual'),
    Skill: games.filter(g => g.category === 'Skill'),
    Luck: games.filter(g => g.category === 'Luck'),
    Multiplayer: games.filter(g => g.category === 'Multiplayer')
  };

  return (
    <div className="bg-[#101821] min-h-screen text-white pb-32 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => navigate('/mine')} className="p-1">
          <ChevronLeft size={24} className="text-gray-300" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Game Statistics</h1>
        <div className="w-6"></div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Game Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {gameStats.map((stat, index) => (
            <div key={index} className="bg-[#212431] border border-gray-700 p-5 rounded-[2rem] shadow-xl">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 mb-2">
                  <stat.icon size={14} className={stat.color} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
                </div>
                <span className="text-xl font-black text-white">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Games */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <Star size={18} className="text-amber-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Popular Games</h2>
          </div>
          
          <div className="space-y-3">
            {games.map((game, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#1a1f2e] rounded-2xl">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{game.name}</h3>
                    <p className="text-xs text-gray-400">{game.totalPlayers.toLocaleString()} active players</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getPopularity(game.totalPlayers) === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                    getPopularity(game.totalPlayers) === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {getPopularity(game.totalPlayers)}
                  </span>
                  <TrendingUp size={16} className="text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Categories */}
        <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 px-2">
            <Users size={18} className="text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-200">Game Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(gamesByCategory).map(([category, categoryGames]) => 
              categoryGames.length > 0 && (
                <div key={category} className="bg-[#1a1f2e] p-4 rounded-2xl text-center">
                  <div className="text-2xl mb-2">{category === 'Luck' ? '🍀' : category === 'Skill' ? '🧠' : category === 'Casual' ? '🎮' : '👥'}</div>
                  <h3 className="text-sm font-bold text-white mb-1">{category}</h3>
                  <p className="text-xs text-gray-400">{categoryGames.length} games</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;