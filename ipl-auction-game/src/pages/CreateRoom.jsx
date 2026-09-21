import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import { createRoom, updateTeamChoice } from '../lib/db';
import { isRealSupabaseConfigured } from '../lib/supabase';

import ProfileMenu from '../components/ProfileMenu';
import { useBreakpoint } from '../hooks/useBreakpoint';

const teamColors = [
  { name: 'Blue', hex: '#004BA0' },
  { name: 'Gold', hex: '#FDB913' },
  { name: 'Red', hex: '#EC1C24' },
  { name: 'Purple', hex: '#3A225D' },
  { name: 'Navy', hex: '#0B2265' },
  { name: 'Pink', hex: '#E82E88' },
  { name: 'Orange', hex: '#FF822A' },
  { name: 'Sky Blue', hex: '#1353AD' },
  { name: 'Teal', hex: '#4CA6A6' },
  { name: 'Red-Silver', hex: '#DD1F26' }
];

export default function CreateRoom() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    authLoading, 
    setRoomCode, 
    setIsHost, 
    setRoomMembers,
    bidTimer,
    setBidTimer,
    maxTeamSize,
    setMaxTeamSize,
    playerOrder,
    setPlayerOrder
  } = useAuction();
  const breakpoint = useBreakpoint();
  const isInitializedRef = useRef(false);

  // Settings states
  const [numTeams, setNumTeams] = useState(6);
  const [budgetCr, setBudgetCr] = useState(100);
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState(teamColors[0].hex);
  const [loading, setLoading] = useState(false);

  // Redirection guard if not logged in
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/signin');
    } else if (currentUser && !isInitializedRef.current) {
      // Default team name personalization (only pre-fill ONCE)
      setTeamName('Super Kings');
      isInitializedRef.current = true;
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) return null;

  const handleCreate = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name to play!');
      return;
    }
    setLoading(true);

    try {
      const hostId = currentUser.id || 'host-' + Date.now();
      const hostName = currentUser.user_metadata?.full_name || 'Room Host';
      
      // 1. Create room on db (or local sandbox fallback)
      const res = await createRoom(hostId, hostName, numTeams, budgetCr);
      const code = res && typeof res === 'object' ? res.roomCode : res;

      // 2. Set context states
      setRoomCode(code);
      setIsHost(true);
      
      // Update local context members list with the host
      const hostMember = {
        room_code: code,
        user_id: hostId,
        user_name: hostName,
        team_name: teamName.trim(),
        team_color: selectedColor,
        is_ready: true
      };
      
      // Store choices inside lobby players state
      setRoomMembers([hostMember]);

      // 3. Pre-select choice on mock database if sandbox is active
      const isRealSupabase = isRealSupabaseConfigured();

      if (!isRealSupabase) {
        const allMembers = JSON.parse(localStorage.getItem('ipl_mock_room_members') || '[]');
        const updated = allMembers.map(m => {
          if (m.room_code === code && m.user_id === hostId) {
            return { ...m, team_name: teamName.trim(), team_color: selectedColor };
          }
          return m;
        });
        localStorage.setItem('ipl_mock_room_members', JSON.stringify(updated));
      } else {
        // Suppress initial choice trigger on remote db (Lobby screen handles online sync)
        await updateTeamChoice(code, hostId, teamName.trim(), selectedColor);
      }

      setLoading(false);
      navigate(`/lobby/${code}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create room: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md overflow-x-hidden relative pb-32" style={{ backgroundColor: '#141315', color: '#e6e1e5' }}>
      <style>{`
        .glass-panel {
          background: rgba(54, 52, 55, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gold-glow {
          box-shadow: 0 0 15px rgba(255, 130, 0, 0.3);
        }
        .gold-gradient {
          background: linear-gradient(135deg, #ff8200 0%, #e05a00 100%);
        }
        .inner-glow-gold {
          box-shadow: inset 0 0 4px rgba(255, 130, 0, 0.5);
        }
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          background: transparent;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-runnable-track {
          background: #363437;
          height: 6px;
          border-radius: 9999px;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -9px;
          width: 24px;
          height: 24px;
          background-image: url('/cricket-ball.svg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          background-color: transparent;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255, 130, 0, 0.6);
          transition: transform 0.15s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.25) rotate(15deg);
        }
        input[type='range']::-moz-range-track {
          background: #363437;
          height: 6px;
          border-radius: 9999px;
        }
        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background-image: url('/cricket-ball.svg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          background-color: transparent;
          border-radius: 50%;
          border: none;
          box-shadow: 0 0 10px rgba(255, 130, 0, 0.6);
          transition: transform 0.15s ease;
        }
        input[type='range']::-moz-range-thumb:hover {
          transform: scale(1.25) rotate(15deg);
        }
        .order-btn {
          flex: 1;
          padding: 14px 8px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          transition: all 0.22s cubic-bezier(.4,0,.2,1);
          border: 1.5px solid rgba(255,255,255,0.1);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: #cbc4ce;
        }
        .order-btn.active {
          border-color: #ff8200;
          background: rgba(255,130,0,0.12);
          color: #ff8200;
          box-shadow: 0 0 16px rgba(255,130,0,0.2);
          transform: scale(1.04);
        }
        .order-btn:hover:not(.active) {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
          transform: scale(1.02);
        }
      `}</style>

      {/* Navigation Header */}
      <nav className="bg-surface/80 border-b border-white/10 shadow-lg flex justify-between items-center px-6 py-3 w-full fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(20, 19, 21, 0.95)' }}>
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            title="Go Back"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer"
            style={{ color: '#cbc4ce' }}
          >
            <svg className="w-5 h-5 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          {/* Home button */}
          <button
            onClick={() => navigate('/play-options')}
            title="Go to Home"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer"
            style={{ color: '#cbc4ce' }}
          >
            <svg className="w-5 h-5 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <span className="text-2xl">🏏</span>
          <span className="text-secondary-fixed tracking-widest" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>IPL AUCTION</span>
        </div>
        <ProfileMenu />
      </nav>

      {/* Main Container matching Setup.jsx layout */}
      <main 
        className="mx-auto pt-24"
        style={{
          maxWidth: '720px',
          width: '100%',
          paddingLeft: breakpoint.isMobile ? '16px' : '24px',
          paddingRight: breakpoint.isMobile ? '16px' : '24px',
          paddingBottom: breakpoint.isMobile ? '120px' : '48px'
        }}
      >
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-5xl animate-bounce">🏏</span>
          </div>
          <h1 className="text-secondary-fixed mb-2 drop-shadow-2xl uppercase" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>
            CREATE A ROOM
          </h1>
          <p className="text-on-surface-variant opacity-75" style={{ color: '#cbc4ce', fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(12px, 1.8vw, 14px)', letterSpacing: '0.5px' }}>
            Set the lobby rules, pick your team, and invite your friends
          </p>
        </header>

        <section className="space-y-12">
          {/* Claim Your Team Name */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">✏️</span>
              <h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Claim Your Team Name</h2>
            </div>
            <div className="relative">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Super Kings"
                className="w-full bg-[#1d1b1e] border border-white/10 rounded-xl pl-4 pr-10 py-4 text-on-surface focus:outline-none focus:border-[#ff8200] transition-all placeholder:text-white/20 font-bold text-base"
                style={{ backgroundColor: '#1d1b1e', borderColor: 'rgba(255,255,255,0.1)' }}
              />
              {teamName && (
                <button
                  type="button"
                  onClick={() => setTeamName('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10"
                  title="Clear Team Name"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Number of Teams */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Number of Teams</h2>
            </div>
            <div className="flex gap-4 flex-wrap">
              {[4, 6, 8, 10].map(n => {
                const isActive = numTeams === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumTeams(n)}
                    className={`flex-1 py-4 rounded-xl font-display-md text-3xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
                      isActive
                        ? 'gold-gradient text-inverse-on-surface gold-glow inner-glow-gold'
                        : 'border border-white/10 text-on-surface-variant/60 hover:bg-white/5'
                    }`}
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      background: isActive ? 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)' : 'transparent',
                      color: isActive ? '#323033' : '#cbc4ce'
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Auction Order */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔀</span>
              <h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Player Auction Order</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'batters',       label: 'BATTERS',        icon: '🏏' },
                { key: 'wicketkeepers', label: 'WKS',            icon: '🧤' },
                { key: 'bowlers',       label: 'BOWLERS',        icon: '🎳' },
                { key: 'allrounders',   label: 'ALL-ROUNDERS',   icon: '⚡' },
                { key: 'random',        label: 'RANDOM',         icon: '🎲' },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPlayerOrder(key)}
                  className={`order-btn${playerOrder === key ? ' active' : ''} flex-1 min-w-[100px]`}
                >
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(12px, 1.8vw, 15px)', letterSpacing: '1px' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bidding Timer */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <span className="text-xl">⏱️</span>
                <h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Bidding Timer</h2>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-secondary-fixed font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ffffff', fontSize: 'clamp(20px, 3.5vw, 32px)' }}>
                  {bidTimer}s
                </span>
                <span className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: '#cbc4ce' }}>/ bid</span>
              </div>
            </div>
            <div className="relative pt-4">
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={bidTimer}
                onChange={(e) => setBidTimer(Number(e.target.value))}
                className="w-full appearance-none cursor-pointer"
                style={{ background: 'transparent' }}
              />
              <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: '#cbc4ce' }}>
                <span>5S</span>
                <span>30S</span>
              </div>
            </div>
          </div>

          {/* Budget per Team */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <span className="text-xl">💰</span>
                <h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Budget per Team</h2>
              </div>
              <div className="text-secondary-fixed font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ffffff', fontSize: 'clamp(20px, 3.5vw, 32px)' }}>
                ₹{budgetCr} Cr
              </div>
            </div>
            <div className="relative pt-4">
              <input
                type="range"
                min="50"
                max="200"
                step="10"
                value={budgetCr}
                onChange={(e) => setBudgetCr(Number(e.target.value))}
                className="w-full appearance-none cursor-pointer"
                style={{ background: 'transparent' }}
              />
              <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: '#cbc4ce' }}>
                <span>₹50 CR</span>
                <span>₹200 CR</span>
              </div>
            </div>
          </div>

          {/* Team Capacity Setup */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <span className="text-xl">👥</span>
                <h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Team Roster Capacity</h2>
              </div>
              <div className="text-secondary-fixed font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ffffff', fontSize: 'clamp(20px, 3.5vw, 32px)' }}>
                {maxTeamSize} Players
              </div>
            </div>
            <div className="relative pt-4">
              <input
                type="range"
                min="11"
                max="25"
                step="1"
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                className="w-full appearance-none cursor-pointer"
                style={{ background: 'transparent' }}
              />
              <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: '#cbc4ce' }}>
                <span>11 PLAYERS</span>
                <span>25 PLAYERS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Button */}
        {breakpoint.isMobile ? (
          <div 
            className="fixed bottom-0 left-0 w-full p-3 z-50"
            style={{
              background: '#0a0020',
              borderTop: '1px solid rgba(255,215,0,0.1)'
            }}
          >
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-4 rounded-xl gold-gradient text-black font-display-md text-2xl font-bold tracking-widest gold-glow flex items-center justify-center gap-2 cursor-pointer"
              style={{
                fontFamily: "'Russo One', sans-serif",
                background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',
                fontSize: 'clamp(16px, 2.5vw, 22px)',
                letterSpacing: '2px',
                color: '#141315',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? (
                <span className="animate-spin inline-block text-lg">⏳</span>
              ) : (
                <span className="animate-pulse">🎲</span>
              )}
              {loading ? 'CREATING LOBBY...' : 'CREATE ROOM'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-5 mt-12 rounded-2xl gold-gradient text-black font-display-md text-3xl font-bold tracking-widest gold-glow transform hover:scale-[1.01] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 cursor-pointer"
            style={{
              fontFamily: "'Russo One', sans-serif",
              background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              letterSpacing: '2px',
              color: '#141315',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? (
              <span className="animate-spin inline-block mr-2 text-2xl">⏳</span>
            ) : (
              <span className="animate-pulse">🎲</span>
            )}
            {loading ? 'CREATING LOBBY...' : 'CREATE ROOM & GET CODE'}
          </button>
        )}
      </main>
    </div>
  );
}
