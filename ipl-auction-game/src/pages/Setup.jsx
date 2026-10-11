import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import { createSession, createTeam } from '../lib/db';
import { isRealSupabaseConfigured } from '../lib/supabase';
import { assignAIStrategies } from '../lib/aiBidder';

import ProfileMenu from '../components/ProfileMenu';
import { useBreakpoint } from '../hooks/useBreakpoint';

const defaultAllTeams = [
  { name: 'Mumbai Indians', color: '#004BA0', logo: '/logos/mi.svg' },
  { name: 'Chennai Super Kings', color: '#FDB913', logo: '/logos/csk.svg' },
  { name: 'Delhi Capitals', color: '#1353AD', logo: '/logos/dc.svg' },
  { name: 'Kolkata Knight Riders', color: '#3A225D', logo: '/logos/kkr.svg' },
  { name: 'Royal Challengers Bengaluru', color: '#EC1C24', logo: '/logos/rcb.svg' },
  { name: 'Gujarat Titans', color: '#0B2265', logo: '/logos/gt.svg' },
  { name: 'Rajasthan Royals', color: '#E82E88', logo: '/logos/rr.svg' },
  { name: 'Sunrisers Hyderabad', color: '#FF822A', logo: '/logos/srh.svg' },
  { name: 'Lucknow Super Giants', color: '#4CA6A6', logo: '/logos/lsg.svg' },
  { name: 'Punjab Kings', color: '#DD1F26', logo: '/logos/pbks.svg' },
];

export default function Setup() {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const {
    currentUser,
    authLoading,
    setSessionId,
    numTeams,
    setNumTeams,
    budgetCr,
    setBudgetCr,
    setTeams,
    resetAuction,
    gameMode,
    setGameMode,
    roomId,
    setRoomId,
    lobbyPlayers,
    setLobbyPlayers,
    isSoloMode,
    setIsSoloMode,
    humanTeamId,
    setHumanTeamId,
    aiDifficulty,
    setAiDifficulty,
    playerOrder,
    setPlayerOrder,
    bidTimer,
    setBidTimer,
    maxTeamSize,
    setMaxTeamSize
  } = useAuction();
  const [teamNames, setTeamNames] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const isLobbyHost = gameMode === 'solo' || (lobbyPlayers[0]?.isHost && lobbyPlayers[0]?.name === (currentUser?.user_metadata?.full_name || 'Guest Owner'));
  const isMultiplayerGuest = gameMode === 'multiplayer' && !isLobbyHost;

  // Resolve active teams dynamically based on selected numTeams and user team choice
  const userTeam = teamNames.find(t => t.isUser);
  const otherTeams = teamNames.filter(t => !t.isUser);
  const activeTeamsList = userTeam 
    ? [userTeam, ...otherTeams.slice(0, numTeams - 1)] 
    : teamNames.slice(0, numTeams);
  const isActiveTeam = (team) => activeTeamsList.some(at => at.logo === team.logo);

  // Ensure user is signed in
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, authLoading, navigate]);

  // Simulate friends joining the multiplayer room lobby in real-time
  useEffect(() => {
    if (gameMode !== 'multiplayer' || !roomId || lobbyPlayers.length > 1) return;
    
    const isHost = lobbyPlayers[0]?.isHost && lobbyPlayers[0]?.name === (currentUser?.user_metadata?.full_name || 'Guest Owner');
    if (!isHost) return;

    const friendsList = [
      { name: 'Rahul', color: '#1353AD', isHost: false },
      { name: 'Amit', color: '#3A225D', isHost: false },
      { name: 'Vikram', color: '#E82E88', isHost: false },
      { name: 'Karan', color: '#0B2265', isHost: false },
      { name: 'Simran', color: '#FF822A', isHost: false }
    ];

    const timeouts = [];
    friendsList.slice(0, numTeams - 1).forEach((friend, idx) => {
      const t = setTimeout(() => {
        setLobbyPlayers(prev => {
          if (prev.some(p => p.name === friend.name)) return prev;
          return [...prev, friend];
        });
      }, 2500 * (idx + 1));
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [gameMode, roomId, numTeams, currentUser, lobbyPlayers, setLobbyPlayers]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert(`Room ID "${roomId}" copied to clipboard! Share it with your friends.`);
  };

  // Initialize teamNames with all 10 default teams on setup init (or when currentUser changes)
  useEffect(() => {
    setTeamNames(prev => {
      if (prev && prev.length === 10) {
        return prev;
      }
      return defaultAllTeams.map((t, idx) => {
        // Mark team 2 (CSK) as yours by default (idx === 1)
        return {
          ...t,
          isUser: idx === 1
        };
      });
    });
  }, [currentUser]);

  // Early return AFTER all hooks — safe per Rules of Hooks
  if (authLoading) return null;


  const handleTeamNameChange = (index, value) => {
    setTeamNames(prev => prev.map((t, i) => i === index ? { ...t, name: value } : t));
  };

  const handleSelectUserTeam = (selectedIndex) => {
    setTeamNames(prev => prev.map((team, idx) => {
      const isSelected = idx === selectedIndex;
      const baseTeam = defaultAllTeams[idx];
      
      if (isSelected) {
        let newName = team.name;
        const defaultName = baseTeam.name;
        
        // Keep the full original franchise name, don't prepend personal name
        newName = baseTeam.name;
        
        return {
          ...team,
          name: newName,
          isUser: true
        };
      }
      
      if (team.isUser) {
        // Restore default name for the previous user team
        return {
          ...team,
          name: baseTeam.name,
          isUser: false
        };
      }
      
      return team;
    }));
  };

  const handleStartAuction = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const currentIsSolo = isSoloMode;
    const currentDifficulty = aiDifficulty;
    const currentPlayerOrder = playerOrder;
    const currentMaxTeamSize = maxTeamSize;

    resetAuction(); // clean past storage

    
    // Restore preserved solo variables
    if (currentIsSolo) {
      setIsSoloMode(true);
      setAiDifficulty(currentDifficulty);
    }
    // Restore player order and bid timer
    setPlayerOrder(currentPlayerOrder);
    setMaxTeamSize(currentMaxTeamSize);


    const baseActiveTeams = activeTeamsList.map((t, idx) => ({
      name: t.name.trim() || `Team ${idx + 1}`,
      color: t.color,
      logo: t.logo,
      isUser: t.isUser,
      budget: budgetCr
    }));

    // Distribute AI strategies
    const aiTeamsCount = baseActiveTeams.filter(t => !t.isUser).length;
    let aiStrategies = [];
    if (currentDifficulty === 'easy') {
      aiStrategies = Array(aiTeamsCount).fill('conservative');
    } else if (currentDifficulty === 'hard') {
      aiStrategies = Array(aiTeamsCount).fill('aggressive');
    } else {
      aiStrategies = assignAIStrategies(aiTeamsCount);
    }

    let aiIdx = 0;
    const activeTeams = baseActiveTeams.map(t => {
      if (currentIsSolo) {
        if (t.isUser) {
          return { ...t, isAi: false, aiStrategy: null };
        } else {
          return { ...t, isAi: true, aiStrategy: aiStrategies[aiIdx++] };
        }
      } else {
        return { ...t, isAi: false, aiStrategy: null };
      }
    });

    try {
      const hasRealKeys = isRealSupabaseConfigured();


      if (hasRealKeys) {
        // Create session in Supabase
        const sId = await createSession(numTeams, budgetCr);
        setSessionId(sId);
        
        // Create all teams in Supabase
        const savedTeams = [];
        for (const t of activeTeams) {
          const tId = await createTeam(sId, t.name, t.color, t.budget, t.isAi, t.aiStrategy);
          savedTeams.push({ ...t, id: tId });
        }
        setTeams(savedTeams);

        if (currentIsSolo) {
          const human = savedTeams.find(t => t.isUser);
          if (human) setHumanTeamId(human.id);
        }
      } else {
        // Fallback for sandboxed local testing without real keys
        const mockSessionId = 'local-' + Date.now();
        setSessionId(mockSessionId);
        const savedTeams = activeTeams.map((t, idx) => ({ 
          ...t, 
          id: `local-team-${idx + 1}` 
        }));
        setTeams(savedTeams);

        if (currentIsSolo) {
          const human = savedTeams.find(t => t.isUser);
          if (human) setHumanTeamId(human.id);
        }
      }
      navigate('/auction');
    } catch (err) {
      console.warn('Supabase session creation failed. Falling back to local offline mode.', err);
      // Seamless guest sandbox fallback
      const mockSessionId = 'fallback-' + Date.now();
      setSessionId(mockSessionId);
      const savedTeams = activeTeams.map((t, idx) => ({ 
        ...t, 
        id: `fallback-team-${idx + 1}` 
      }));
      setTeams(savedTeams);
      
      if (currentIsSolo) {
        const human = savedTeams.find(t => t.isUser);
        if (human) setHumanTeamId(human.id);
      }
      navigate('/auction');
    }
    } catch (outerErr) {
      console.error('Error starting auction:', outerErr);
      setIsStarting(false);
    }
  };

  return (
    <div className="bg-[#121118] text-[#f1f5f9] h-screen w-screen overflow-hidden flex flex-col relative select-none">
      <style>{`
        .glass-panel {
          background: #191726;
          border: 1px solid #2e2b3e;
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
        @keyframes btnShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .btn-loading-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-loading-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          animation: btnShimmer 1.2s infinite ease-in-out;
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
          background-image: url('/cricket-ball-white.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
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
          background-image: url('/cricket-ball-white.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
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
        .timer-track {
          position: relative;
          height: 2px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.12);
          margin: 0 4px;
        }
        .timer-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(90deg, #ff8200, #e05a00);
          transition: width 0.2s;
        }
        .glass-nav-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }
        .glass-nav-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .glass-nav-btn-home:hover {
          background: rgba(255, 130, 0, 0.15);
          border-color: rgba(255, 130, 0, 0.3);
        }
      `}</style>

      {/* Navigation Header */}
      <nav className="h-14 bg-[#161421] border-b border-[#2d293d] flex justify-between items-center px-4 sm:px-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            title="Go Back"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          {/* Home button */}
          <button
            onClick={() => navigate('/play-options')}
            title="Go to Home"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <span className="text-xl">🏏</span>
          <span style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: '18px', letterSpacing: '2px' }}>IPL AUCTION</span>
        </div>
        <div className="flex items-center gap-4">
          <ProfileMenu />
        </div>
      </nav>

      {/* Setup configuration container */}
      <main 
        className="flex-1 overflow-y-auto min-h-0 w-full"
        style={{
          paddingLeft: breakpoint.isMobile ? '16px' : '24px',
          paddingRight: breakpoint.isMobile ? '16px' : '24px',
          paddingTop: '20px',
          paddingBottom: '24px'
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <header className="text-center mb-6">
            <h1 style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: '26px', letterSpacing: '2px' }} className="mb-1">
              AUCTION ROOM SETUP
            </h1>
            <p className="text-slate-300 font-sans text-xs font-medium">
              Configure franchises, auction purse, and bidding rules
            </p>
          </header>

          <section className="space-y-8">
          {/* Multiplayer Room Lobby Info Panel */}
          {gameMode === 'multiplayer' && (
            <div className="glass-panel p-6 rounded-xl border border-[#ff8200]/30 space-y-6 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#ff8200] text-black text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                Multiplayer Lobby
              </div>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff8200]">ACTIVE ROOM LOBBY</span>
                  <h3 className="text-on-surface font-bold mt-1" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>
                    {isLobbyHost ? 'HOST LOBBY' : 'GUEST LOBBY'}
                  </h3>
                </div>
                <div className="flex items-center gap-3 bg-[#1d1b1e] border border-white/10 px-5 py-3 rounded-xl">
                  <div className="text-right">
                    <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest block">ROOM ID</span>
                    <span className="text-secondary-fixed tracking-widest text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>
                      {roomId || 'IPL-7788'}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyRoomId}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-secondary-fixed transition-colors text-lg flex items-center justify-center cursor-pointer"
                    style={{ color: '#ff8200' }}
                    title="Copy Room ID"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Lobby Status list */}
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                    Connected Players ({lobbyPlayers.length}/{numTeams})
                  </span>
                  {isLobbyHost ? (
                    <span className="text-xs text-secondary-fixed animate-pulse font-bold" style={{ color: '#ff8200' }}>
                      WAITING FOR FRIENDS...
                    </span>
                  ) : (
                    <span className="text-xs text-[#00C853] animate-pulse font-bold">
                      WAITING FOR HOST TO START...
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lobbyPlayers.map((player, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs uppercase" style={{ color: player.color || '#ff8200' }}>
                          {player.name.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-sm block">{player.name}</span>
                          <span className="text-[9px] opacity-60 uppercase tracking-wider">
                            {player.isHost ? 'Room Host (Owner)' : 'Bidding Competitor'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#00C853] text-[10px] font-bold uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-ping" />
                        Ready
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, numTeams - lobbyPlayers.length) }).map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-dashed border-white/10 px-4 py-3 rounded-lg opacity-40">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">👤</span>
                        <span className="text-xs italic">Waiting for friend...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isMultiplayerGuest ? (
            /* Guest Waiting Screen Details */
            <div className="glass-panel p-8 rounded-xl border border-white/10 text-center space-y-6 py-12">
              <span className="text-6xl animate-spin inline-block">⏳</span>
              <h2 className="text-[#ff8200] font-bold uppercase" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>
                Waiting for host to begin the draft
              </h2>
              <p className="text-sm opacity-70 max-w-md mx-auto">
                Host is currently editing session rules, budget constraints, and active IPL franchises. Sit back and plan your bidding strategy!
              </p>
            </div>
          ) : (
            /* Host or Solo Configuration Panels */
            <>
          {/* Number of Teams */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff9d47] font-sans">Number of Teams</h2>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[4, 6, 8, 10].map(n => {
                const isActive = numTeams === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumTeams(n)}
                    className={`flex-1 py-3 rounded-xl font-display-md text-2xl font-bold transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                      isActive
                        ? 'gold-gradient text-inverse-on-surface gold-glow inner-glow-gold'
                        : 'border border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      background: isActive ? 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)' : '#191726',
                      color: isActive ? '#141315' : '#cbd5e1'
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Setup */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff9d47] font-sans">Budget per Team</h2>
              </div>
              <div className="font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ffffff', fontSize: '22px' }}>
                ₹{budgetCr} Cr
              </div>
            </div>
            <div className="relative pt-2">
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
              <div className="flex justify-between mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
                <span>₹50 CR</span>
                <span>₹200 CR</span>
              </div>
            </div>
          </div>

          {/* Team Capacity Setup */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff9d47] font-sans">Team Roster Capacity</h2>
              </div>
              <div className="font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ffffff', fontSize: '22px' }}>
                {maxTeamSize} Players
              </div>
            </div>
            <div className="relative pt-2">
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
              <div className="flex justify-between mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
                <span>11 PLAYERS</span>
                <span>25 PLAYERS</span>
              </div>
            </div>
          </div>

          {/* AI Difficulty Selector (Solo mode only) */}
          {isSoloMode && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff9d47] font-sans">AI Managers Difficulty</h2>
              </div>
              <div className="flex gap-3 flex-wrap">
                {['easy', 'medium', 'hard'].map(level => {
                  const isActive = aiDifficulty === level;
                  const label = level === 'easy' ? 'Easy (Conservative) 🛡️' : level === 'medium' ? 'Medium (Balanced) ⚖️' : 'Hard (Aggressive) 🔥';
                  const colors = {
                    easy: { bg: 'rgba(0, 245, 160, 0.15)', text: '#00F5A0', border: '#00F5A0' },
                    medium: { bg: 'rgba(0, 201, 255, 0.15)', text: '#00C9FF', border: '#00C9FF' },
                    hard: { bg: 'rgba(255, 60, 172, 0.15)', text: '#FF3CAC', border: '#FF3CAC' },
                  };
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setAiDifficulty(level)}
                      className={`flex-1 py-3 rounded-xl font-bold font-sans text-sm transition-all transform hover:scale-105 active:scale-95 border cursor-pointer ${
                        isActive
                          ? 'shadow-lg'
                          : 'border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                      style={{
                        backgroundColor: isActive ? colors[level].bg : '#191726',
                        borderColor: isActive ? colors[level].border : 'rgba(255,255,255,0.1)',
                        color: isActive ? colors[level].text : '#94a3b8',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Player Auction Order */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔀</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff9d47] font-sans">Player Auction Order</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { key: 'batters',       label: 'Batters',        icon: '🏏', desc: 'BAT → WK → AR → BOWL' },
                { key: 'wicketkeepers', label: 'WKs',            icon: '🧤', desc: 'WK → BAT → AR → BOWL' },
                { key: 'bowlers',       label: 'Bowlers',        icon: '🎳', desc: 'BOWL → AR → BAT → WK' },
                { key: 'allrounders',   label: 'All-Rounders',   icon: '⚡', desc: 'AR → BAT → WK → BOWL' },
                { key: 'random',        label: 'Random',         icon: '🎲', desc: 'Fully shuffled' },
              ].map(({ key, label, icon, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPlayerOrder(key)}
                  className={`order-btn${playerOrder === key ? ' active' : ''} flex-1 min-w-[90px] py-2.5 px-2`}
                  style={{ background: playerOrder === key ? 'rgba(255,130,0,0.15)' : '#191726' }}
                >
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: '13px', letterSpacing: '0.5px' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bidding Timer */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff9d47] font-sans">Bidding Timer</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: '22px',
                  color: '#ffffff',
                  lineHeight: 1,
                  textAlign: 'right'
                }}>{bidTimer}s</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>/ bid</span>
              </div>
            </div>
            <div
              style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const steps = [5, 10, 15, 20, 25, 30];
                const raw = 5 + pct * 25;
                const closest = steps.reduce((a, b) => Math.abs(b - raw) < Math.abs(a - raw) ? b : a);
                setBidTimer(closest);
              }}
            >
              {/* Track line */}
              <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.15)' }}>
                {/* Filled portion */}
                <div style={{
                  position: 'absolute',
                  left: 0, top: 0, height: '100%',
                  borderRadius: 9999,
                  background: 'linear-gradient(90deg, #ff8200, #e05a00)',
                  width: `${((bidTimer - 5) / 25) * 100}%`,
                  transition: 'width 0.2s'
                }} />
              </div>
              {/* White IPL Cricket Ball thumb */}
              <div style={{
                position: 'absolute',
                left: `calc(${((bidTimer - 5) / 25) * 100}% - 12px)`,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundImage: "url('/cricket-ball-white.jpg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
                transition: 'left 0.2s, transform 0.15s ease',
                pointerEvents: 'none'
              }} />
            </div>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {[5, 10, 15, 20, 25, 30].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setBidTimer(s)}
                  className="w-full flex items-center justify-center font-sans font-bold"
                  style={{
                    height: 36,
                    borderRadius: 8,
                    border: bidTimer === s ? '1.5px solid #ff8200' : '1px solid rgba(255,255,255,0.1)',
                    background: bidTimer === s ? 'rgba(255,130,0,0.15)' : '#191726',
                    color: bidTimer === s ? '#ff8200' : '#cbd5e1',
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.18s'
                  }}
                >{s}s</button>
              ))}
            </div>
          </div>

          {/* Define Team Names */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✏️</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff9d47] font-sans">Define Franchise Teams</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {teamNames.map((team, idx) => {
                const active = isActiveTeam(team);
                return (
                  <div
                    key={idx}
                    className={`glass-panel p-3.5 rounded-xl flex flex-col justify-between gap-2.5 border transition-all ${
                      team.isUser 
                        ? 'border-[#ff8200] gold-glow' 
                        : active 
                          ? 'border-[#00C9FF]/50' 
                          : 'border-white/10 opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: '#191726',
                      borderColor: team.isUser 
                        ? '#ff8200' 
                        : active 
                          ? 'rgba(0, 201, 255, 0.4)' 
                          : 'rgba(255, 255, 255, 0.1)' 
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center p-1 border border-white/15 overflow-hidden flex-shrink-0">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: team.color }} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-sans" style={{ color: team.isUser ? '#ff8200' : active ? '#00C9FF' : '#94a3b8' }}>
                            TEAM {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          {team.isUser ? (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#ff8200]/20 text-[#ff8200] border border-[#ff8200]/40 flex-shrink-0 font-sans">YOU</span>
                          ) : active ? (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00C9FF]/20 text-[#00C9FF] border border-[#00C9FF]/40 flex-shrink-0 font-sans">ACTIVE</span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 flex-shrink-0 font-sans">IDLE</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={team.name}
                          onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 font-sans font-bold text-sm text-white outline-none truncate"
                        />
                      </div>
                    </div>
                    
                    <div className="w-full pt-2 border-t border-white/10 flex justify-end">
                      {team.isUser ? (
                        <div className="flex items-center gap-1 text-[#ff8200] text-[10px] font-bold tracking-wider uppercase font-sans">
                          <span>✅</span>
                          YOUR TEAM
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectUserTeam(idx)}
                          className="w-full bg-white/10 hover:bg-[#ff8200] hover:text-black border border-white/10 hover:border-[#ff8200] py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-colors text-slate-200 cursor-pointer font-sans"
                        >
                          PLAY AS
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </>
          )}
        </section>
        </div>
      </main>

      {/* Sticky Bottom Actions footer */}
      {!isMultiplayerGuest && (
        <footer 
          className="h-18 border-t border-[#2e2b3e] bg-[#161421] px-4 sm:px-6 flex items-center justify-center flex-shrink-0 z-30"
          style={{ height: '72px' }}
        >
          <div className="w-full max-w-md">
            <button
              onClick={handleStartAuction}
              disabled={isStarting}
              className={`w-full py-3 rounded-xl font-display-md text-xl font-bold tracking-widest gold-glow inner-glow-gold transform transition-all shadow-xl flex items-center justify-center gap-3 group cursor-pointer ${
                isStarting ? 'opacity-85 cursor-wait btn-loading-shimmer' : 'active:scale-95 hover:scale-[1.01]'
              }`}
              style={{
                fontFamily: "'Russo One', sans-serif",
                background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',
                letterSpacing: '2px',
                color: '#141315'
              }}
            >
              {isStarting ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                  </svg>
                  <span>STARTING AUCTION...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>START AUCTION</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
