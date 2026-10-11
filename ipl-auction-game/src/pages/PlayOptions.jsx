import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import { prefetchAuctionDetails } from '../lib/playerSync';
import ProfileMenu from '../components/ProfileMenu';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function PlayOptions() {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const { 
    currentUser, 
    authLoading,
    setGameMode, 
    resetAuction, 
    isSoloMode, 
    setIsSoloMode, 
    aiDifficulty, 
    setAiDifficulty 
  } = useAuction();

  // Mode loading states with server protection
  const [loadingMode, setLoadingMode] = useState(null); // 'solo' | 'multiplayer' | 'join' | null
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState('');
  const [isCachedSource, setIsCachedSource] = useState(true);

  // Route back to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) return null;

  const handleSelectSolo = async () => {
    if (loadingMode) return;
    setLoadingMode('solo');
    setLoadingProgress(18);
    setLoadingDetail('Checking local player roster cache (zero server load)...');

    try {
      // Fetch details using client-side cache to avoid server load
      const result = await prefetchAuctionDetails();
      setIsCachedSource(result.fromCache);
      
      setLoadingProgress(55);
      setLoadingDetail(result.fromCache 
        ? 'Loaded from local cache (0% server load) • Initializing AI bidders...' 
        : 'Player roster verified • Initializing AI bidders...');
      
      setTimeout(() => {
        setLoadingProgress(90);
        setLoadingDetail('Roster ready! Opening Setup Deck...');
        resetAuction();
        setIsSoloMode(true);
        setGameMode('solo');

        setTimeout(() => {
          setLoadingProgress(100);
          navigate('/setup');
        }, 220);
      }, 350);
    } catch (err) {
      console.warn('Solo prefetch fallback:', err);
      resetAuction();
      setIsSoloMode(true);
      setGameMode('solo');
      navigate('/setup');
    }
  };

  const handleSelectOnline = async () => {
    if (loadingMode) return;
    setLoadingMode('multiplayer');
    setLoadingProgress(20);
    setLoadingDetail('Verifying multiplayer network & checking roster cache...');

    try {
      // Check cache to avoid hitting Supabase repeatedly
      const result = await prefetchAuctionDetails();
      setIsCachedSource(result.fromCache);

      setLoadingProgress(60);
      setLoadingDetail(result.fromCache 
        ? 'Roster loaded from local cache • Zero server load • Checking room engine...' 
        : 'Multiplayer connection active • Preparing Room Creator...');

      setTimeout(() => {
        setLoadingProgress(92);
        setLoadingDetail('Ready! Launching Multiplayer Room Creation...');
        resetAuction();
        setIsSoloMode(false);
        setGameMode('multiplayer');

        setTimeout(() => {
          setLoadingProgress(100);
          navigate('/create-room');
        }, 220);
      }, 350);
    } catch (err) {
      console.warn('Multiplayer prefetch fallback:', err);
      resetAuction();
      setIsSoloMode(false);
      setGameMode('multiplayer');
      navigate('/create-room');
    }
  };

  const handleSelectJoin = async () => {
    if (loadingMode) return;
    setLoadingMode('join');
    setLoadingProgress(25);
    setLoadingDetail('Connecting to Matchmaking Network & verifying cache...');

    try {
      const result = await prefetchAuctionDetails();
      setIsCachedSource(result.fromCache);

      setLoadingProgress(70);
      setLoadingDetail('Network ready • Client cache verified • Opening Join Portal...');

      setTimeout(() => {
        setLoadingProgress(100);
        navigate('/join');
      }, 300);
    } catch (err) {
      console.warn('Join prefetch fallback:', err);
      navigate('/join');
    }
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCardMouseLeave = (e) => {
    e.currentTarget.style.setProperty('--mouse-x', `50%`);
    e.currentTarget.style.setProperty('--mouse-y', `50%`);
  };

  return (
    <div className="bg-[#0c0a14] text-white h-screen w-screen overflow-hidden flex flex-col justify-between items-center relative" style={{ color: '#ffffff' }}>
      <style>{`
        .game-mode-card {
          background: linear-gradient(145deg, #1d1a29 0%, #13111c 100%);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 18px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .game-mode-card:hover {
          border-color: rgba(255, 130, 0, 0.5);
          box-shadow: 0 16px 44px rgba(0, 0, 0, 0.65), 0 0 20px rgba(255, 130, 0, 0.15);
        }
      `}</style>

      {/* Atmospheric Background & Glow */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40" 
        style={{ backgroundImage: 'url("/stadium_night_view.png")', backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh', width: '100vw' }} 
      />
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-[#090d16]/90 via-[#0a0020]/80 to-[#050010]/95" />

      {/* Navigation Header */}
      <nav className="border-b border-white/10 shadow-lg flex items-center justify-between px-6 py-3 w-full fixed top-0 left-0 right-0 z-50 h-14" style={{ backgroundColor: '#13111c' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={!!loadingMode}
            title="Go Back"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer disabled:opacity-50 text-slate-300"
          >
            <svg className="w-4 h-4 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/')}
            disabled={!!loadingMode}
            title="Go to Home"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer disabled:opacity-50 text-slate-300"
          >
            <svg className="w-4 h-4 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <div className="w-px h-5 bg-white/15 mx-1" />
          <span className="text-xl">🏏</span>
          <span className="font-normal uppercase tracking-wider" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: '18px' }}>IPL AUCTION</span>
        </div>
        <ProfileMenu />
      </nav>

      {/* Main Content Area - Fully contained inside viewport */}
      <main className="relative z-10 w-full max-w-4xl flex-1 flex flex-col justify-center items-center px-4 sm:px-6 pt-16 pb-4">
        <header className="text-center mb-5">
          <div className="inline-flex items-center justify-center mb-2">
            <span className="text-4xl animate-bounce">🏏</span>
          </div>
          <h1 className="font-normal leading-none mb-2 text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(22px, 3vw, 30px)' }}>
            SELECT GAME MODE
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-300 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
            Choose how you want to build your dream squad
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {/* Card 1: Play Solo vs AI */}
          <div
            className={`game-mode-card p-5 sm:p-6 flex flex-col justify-between ${loadingMode && loadingMode !== 'solo' ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div>
              <div className="w-12 h-12 bg-[#ff8200]/15 rounded-xl flex items-center justify-center mb-3 border border-[#ff8200]/30 shadow-md">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 
                className="text-white font-normal uppercase tracking-wider mb-2" 
                style={{ fontFamily: "'Russo One', sans-serif", fontSize: '18px' }}
              >
                Solo vs AI Bidders
              </h2>
              <p className="text-xs text-slate-300 font-medium mb-4 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                Confront active AI managers equipped with dynamic bidding personalities. Select a difficulty tier and draft your dream franchise:
              </p>

              {/* Difficulty pills */}
              <div className="flex items-center gap-2 mb-4">
                {['easy', 'medium', 'hard'].map((level) => {
                  const isActive = aiDifficulty === level;
                  const colors = {
                    easy: { bg: 'rgba(0, 245, 160, 0.18)', border: '#00F5A0', text: '#00F5A0' },
                    medium: { bg: 'rgba(0, 201, 255, 0.18)', border: '#00C9FF', text: '#00C9FF' },
                    hard: { bg: 'rgba(255, 60, 172, 0.18)', border: '#FF3CAC', text: '#FF3CAC' },
                  };
                  return (
                    <button
                      key={level}
                      onClick={() => setAiDifficulty(level)}
                      disabled={!!loadingMode}
                      className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-all border cursor-pointer text-xs ${
                        isActive 
                          ? 'scale-105 shadow-md' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isActive ? colors[level].bg : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isActive ? colors[level].border : 'rgba(255, 255, 255, 0.15)',
                        color: colors[level].text,
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      {level === 'easy' ? 'Easy 🛡️' : level === 'medium' ? 'Medium ⚖️' : 'Hard 🔥'}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button
              onClick={handleSelectSolo}
              disabled={!!loadingMode}
              className={`w-full py-3 bg-gradient-to-r from-[#ff8200] to-[#e05a00] hover:brightness-110 text-white rounded-xl font-bold uppercase tracking-wider hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs ${loadingMode === 'solo' ? 'opacity-90' : ''} ${loadingMode && loadingMode !== 'solo' ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loadingMode === 'solo' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading Solo...</span>
                </>
              ) : (
                <>
                  <span>Start Solo Game</span>
                  <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Play Online with Friends */}
          <div
            className={`game-mode-card p-5 sm:p-6 flex flex-col justify-between ${loadingMode && loadingMode !== 'multiplayer' ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div>
              <div className="w-12 h-12 bg-[#cfbdfe]/15 rounded-xl flex items-center justify-center mb-3 border border-[#cfbdfe]/30 shadow-md">
                <span className="text-2xl">👥</span>
              </div>
              <h2 
                className="text-white font-normal uppercase tracking-wider mb-2" 
                style={{ fontFamily: "'Russo One', sans-serif", fontSize: '18px' }}
              >
                Play Online with Friends
              </h2>
              <p className="text-xs text-slate-300 font-medium mb-4 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                Host a multiplayer room or enter a friend's room code to bid side-by-side in real-time. Pick your team and sync the draft!
              </p>
            </div>
            
            <button
              onClick={handleSelectOnline}
              disabled={!!loadingMode}
              className={`w-full py-3 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] hover:brightness-110 text-white rounded-xl font-bold uppercase tracking-wider hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs ${loadingMode === 'multiplayer' ? 'opacity-90' : ''} ${loadingMode && loadingMode !== 'multiplayer' ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loadingMode === 'multiplayer' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading Multiplayer...</span>
                </>
              ) : (
                <>
                  <span>Go to Multiplayer</span>
                  <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Join Room Card */}
        <div
          className={`game-mode-card mt-4 w-full cursor-pointer p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${loadingMode && loadingMode !== 'join' ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => !loadingMode && handleSelectJoin()}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#00C9FF]/15 rounded-xl flex items-center justify-center border border-[#00C9FF]/30 flex-shrink-0">
              <span className="text-xl">🔑</span>
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-[#00C9FF] text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Already have a room code?
              </p>
              <h3 className="font-normal uppercase tracking-wider text-white text-base" style={{ fontFamily: "'Russo One', sans-serif" }}>
                Join a Room
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                Enter a friend's 6-digit code and jump straight into the auction
              </p>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); if (!loadingMode) handleSelectJoin(); }}
            disabled={!!loadingMode}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs text-[#00C9FF] border border-[#00C9FF]/40 bg-[#00C9FF]/10 ${loadingMode === 'join' ? 'opacity-90' : ''}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Enter Code →
          </button>
        </div>
      </main>

      {/* Mode Loading & Caching Transition Overlay */}
      {loadingMode && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div 
            className="w-full max-w-sm rounded-3xl p-7 flex flex-col items-center text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(28, 25, 45, 0.92) 0%, rgba(12, 10, 24, 0.98) 100%)',
              border: `1px solid ${
                loadingMode === 'solo' ? 'rgba(255, 130, 0, 0.4)' 
                : loadingMode === 'multiplayer' ? 'rgba(209, 191, 235, 0.4)' 
                : 'rgba(0, 201, 255, 0.4)'
              }`,
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px ${
                loadingMode === 'solo' ? 'rgba(255, 130, 0, 0.25)' 
                : loadingMode === 'multiplayer' ? 'rgba(209, 191, 235, 0.25)' 
                : 'rgba(0, 201, 255, 0.25)'
              }`
            }}
          >
            {/* Ambient Background Glow inside the modal */}
            <div 
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none"
              style={{
                backgroundColor: loadingMode === 'solo' ? 'rgba(255, 130, 0, 0.2)' 
                  : loadingMode === 'multiplayer' ? 'rgba(209, 191, 235, 0.2)' 
                  : 'rgba(0, 201, 255, 0.2)'
              }}
            />

            {/* Central Animated Loader Emblem */}
            <div className="relative w-24 h-24 mb-5 flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full animate-pulse-ring"
                style={{
                  backgroundColor: loadingMode === 'solo' ? 'rgba(255, 130, 0, 0.25)' 
                    : loadingMode === 'multiplayer' ? 'rgba(209, 191, 235, 0.25)' 
                    : 'rgba(0, 201, 255, 0.25)'
                }}
              />
              
              {/* Outer rotating conic ring */}
              <div 
                className="absolute inset-0 rounded-full animate-spin-slow p-[2.5px]"
                style={{
                  background: loadingMode === 'solo' 
                    ? 'conic-gradient(from 0deg, #ff8200, #ffd700, #ff4500, #ff8200)' 
                    : loadingMode === 'multiplayer'
                    ? 'conic-gradient(from 0deg, #d1bfeb, #a78bfa, #8b5cf6, #d1bfeb)'
                    : 'conic-gradient(from 0deg, #00C9FF, #00F5A0, #0072c6, #00C9FF)'
                }}
              >
                <div className="w-full h-full bg-[#0d0d16] rounded-full" />
              </div>

              {/* Inner counter-rotating ring */}
              <div 
                className="absolute inset-2 rounded-full animate-spin-reverse p-[1.5px] opacity-70"
                style={{
                  background: 'conic-gradient(from 180deg, rgba(255,255,255,0.7), transparent, rgba(255,255,255,0.2), transparent)'
                }}
              >
                <div className="w-full h-full bg-[#0d0d16] rounded-full" />
              </div>

              {/* Center icon */}
              <div className="relative z-10 text-3xl flex items-center justify-center drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                {loadingMode === 'solo' ? '🤖' : loadingMode === 'multiplayer' ? '👥' : '🔑'}
              </div>
            </div>

            {/* Title */}
            <h2 
              className="text-lg uppercase tracking-wider mb-1 text-white"
              style={{ 
                fontFamily: "'Russo One', sans-serif",
                letterSpacing: '1.5px',
                color: loadingMode === 'solo' ? '#ff8200' 
                  : loadingMode === 'multiplayer' ? '#d1bfeb' 
                  : '#00C9FF',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              {loadingMode === 'solo' ? 'PREPARING SOLO ARENA' 
                : loadingMode === 'multiplayer' ? 'INITIALIZING MULTIPLAYER' 
                : 'CONNECTING TO NETWORK'}
            </h2>

            {/* Dynamic Status / Server Protection Detail */}
            <p 
              className="text-xs text-white/70 min-h-[32px] flex items-center justify-center mb-5 px-2"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loadingDetail}
            </p>

            {/* Glowing High-Tech Progress Bar */}
            <div className="w-full bg-black/60 rounded-full h-3 p-0.5 border border-white/15 relative overflow-hidden mb-2 shadow-inner">
              <div 
                className="h-full rounded-full relative overflow-hidden transition-all duration-200 ease-out"
                style={{
                  width: `${loadingProgress}%`,
                  background: loadingMode === 'solo'
                    ? 'linear-gradient(90deg, #ff8200 0%, #ffd700 70%, #ff5500 100%)'
                    : loadingMode === 'multiplayer'
                    ? 'linear-gradient(90deg, #d1bfeb 0%, #a78bfa 70%, #c084fc 100%)'
                    : 'linear-gradient(90deg, #00C9FF 0%, #00F5A0 100%)',
                  boxShadow: `0 0 12px ${
                    loadingMode === 'solo' ? 'rgba(255, 130, 0, 0.7)' 
                    : loadingMode === 'multiplayer' ? 'rgba(209, 191, 235, 0.7)' 
                    : 'rgba(0, 201, 255, 0.7)'
                  }`
                }}
              >
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Telemetry Indicator */}
            <div className="w-full flex items-center justify-between text-[11px] font-bold text-white/60 px-1" style={{ fontFamily: "'Russo One', sans-serif" }}>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SERVER LOAD: 0% (CACHED)
              </span>
              <span>{loadingProgress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
