import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, Check, Search, Languages, ArrowRight } from 'lucide-react';

const Language = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');

  const languages = [
    { name: 'English', native: 'English', code: 'EN', popular: true },
    { name: 'Hindi', native: 'हिन्दी', code: 'HI', popular: true },
    { name: 'Spanish', native: 'Español', code: 'ES', popular: true },
    { name: 'French', native: 'Français', code: 'FR', popular: false },
    { name: 'Arabic', native: 'العربية', code: 'AR', popular: false },
    { name: 'German', native: 'Deutsch', code: 'DE', popular: false },
    { name: 'Chinese', native: '中文', code: 'ZH', popular: false },
    { name: 'Japanese', native: '日本語', code: 'JA', popular: false },
    { name: 'Russian', native: 'Русский', code: 'RU', popular: false },
  ];

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lang.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularLanguages = languages.filter(lang => lang.popular);

  return (
    <div className="bg-[#101821] min-h-screen w-full text-white font-sans flex flex-col relative">
      {/* Premium Header */}
      <div className="sticky top-0 z-50 bg-[#312c42] w-full px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/mine')} className="p-1">
            <ChevronLeft size={24} className="text-gray-300" />
          </button>
          <h1 className="text-lg font-bold">Select Language</h1>
        </div>
        <div className="p-2 bg-[#49bace]/10 rounded-xl">
          <Languages size={20} className="text-[#49bace]" />
        </div>
      </div>

      <div className="p-4 space-y-8 flex-grow">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#49bace] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#212431] border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-[#49bace] outline-none transition-all placeholder:text-gray-600 shadow-xl"
          />
        </div>

        {!searchQuery && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Popular</h2>
            <div className="grid grid-cols-2 gap-4">
              {popularLanguages.map((lang) => (
                <div 
                  key={lang.name}
                  onClick={() => setSelected(lang.name)}
                  className={`p-5 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                    selected === lang.name 
                    ? 'bg-[#49bace]/10 border-[#49bace] shadow-lg shadow-[#49bace]/10 scale-[1.02]' 
                    : 'bg-[#212431] border-gray-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                    selected === lang.name ? 'bg-[#49bace] text-white' : 'bg-[#101821] text-gray-500'
                  }`}>
                    {lang.code}
                  </div>
                  <span className={`text-xs font-black tracking-tight ${selected === lang.name ? 'text-[#49bace]' : 'text-gray-400'}`}>{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Languages List */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
            {searchQuery ? `Search Results (${filteredLanguages.length})` : 'All Languages'}
          </h2>
          <div className="bg-[#212431] border border-gray-700 rounded-[2.5rem] overflow-hidden shadow-2xl mb-24">
            {filteredLanguages.map((lang, i) => (
              <div 
                key={lang.name}
                onClick={() => setSelected(lang.name)}
                className={`flex items-center justify-between px-6 py-5 cursor-pointer active:bg-white/5 transition-all ${
                  i !== filteredLanguages.length - 1 ? 'border-b border-gray-700/50' : ''
                } ${selected === lang.name ? 'bg-[#49bace]/5' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-xl border ${
                    selected === lang.name ? 'bg-[#49bace]/10 border-[#49bace]/30' : 'bg-[#101821] border-gray-800'
                  }`}>
                    <Globe size={18} className={selected === lang.name ? 'text-[#49bace]' : 'text-gray-600'} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${selected === lang.name ? 'text-white' : 'text-gray-300'}`}>{lang.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{lang.native}</p>
                  </div>
                </div>
                {selected === lang.name ? (
                  <div className="bg-[#49bace] rounded-full p-1.5 shadow-lg shadow-[#49bace]/20">
                    <Check size={12} className="text-white" strokeWidth={4} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Apply Button */}
      <div className="sticky bottom-0 p-6 bg-gradient-to-t from-[#101821] via-[#101821] to-transparent z-50">
        <button 
          onClick={() => {
            alert(`Language set to ${selected}`);
            navigate('/mine');
          }}
          className="w-full bg-[#49bace] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.1em] shadow-2xl shadow-[#49bace]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
        >
          <span>Apply {selected} Settings</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Language;
