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
    <div className="bg-surface text-on-surface min-h-screen flex flex-col justify-center items-center px-6 relative" style={{ backgroundColor: '#141315', color: '#e6e1e5' }}>
      <style>{`
        .glass-card {
          background: rgba(20, 20, 30, 0.35) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
        }
        .stadium-glow {
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.12) 0%, rgba(20, 19, 21, 0) 70%);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.92); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.92); opacity: 0.8; }
        }
        @keyframes shimmer-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 2.2s linear infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer-bar 1.5s infinite;
        }
      `}</style>

      {/* Atmospheric Background & Glow */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-50" 
        style={{ backgroundImage: 'url("/stadium_night_view.png")', backgroundSize: 'cover', backgroundPosition: 'center' }} 
      />
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-[#090d16]/80 via-[#0a0020]/60 to-[#050010]/90" />
      <div className="absolute inset-0 stadium-glow pointer-events-none z-2" />

      {/* Navigation Header */}
      <nav className="bg-surface/80 border-b border-white/10 shadow-lg flex items-center justify-between px-6 py-3 w-full fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(20, 19, 21, 0.95)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={!!loadingMode}
            title="Go Back"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer disabled:opacity-50"
            style={{ color: '#cbc4ce' }}
          >
            <svg className="w-5 h-5 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/')}
            disabled={!!loadingMode}
            title="Go to Home"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer disabled:opacity-50"
            style={{ color: '#cbc4ce' }}
          >
            <svg className="w-5 h-5 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <span className="text-2xl">🏏</span>
          <span className="font-bold uppercase" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>IPL AUCTION</span>
        </div>
        <ProfileMenu />
      </nav>

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center mt-16 px-4 sm:px-6">
        <header className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-6xl animate-bounce">🏏</span>
          </div>
          <h1 className="text-secondary-fixed font-bold leading-none mb-3" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>
            SELECT GAME MODE
          </h1>
          <p className="text-on-surface-variant opacity-75 uppercase" style={{ color: '#cbc4ce', fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(12px, 1.8vw, 14px)', letterSpacing: '0.5px' }}>
            Choose how you want to build your dream squad
          </p>
        </header>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* Card 1: Play Solo vs AI */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className={`glass-card p-6 sm:p-8 hover:border-[#ff8200] group transition-all transform hover:scale-[1.02] hover:-translate-y-1 duration-300 relative overflow-hidden flex flex-col justify-between ${loadingMode && loadingMode !== 'solo' ? 'opacity-50 pointer-events-none' : ''}`}
            style={{ 
              backgroundColor: 'rgba(20, 20, 30, 0.35)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 140, 40, 0.25)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              minHeight: breakpoint.isMobile ? '140px' : '200px'
            }}
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#ff8200]/5 blur-2xl rounded-full group-hover:bg-[#ff8200]/10 transition-colors pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ff8200]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-[#ff8200]/25">
                <span className="text-3xl sm:text-4xl">🤖</span>
              </div>
              <h2 
                className="text-on-surface font-bold uppercase tracking-wider mb-2" 
                style={{ 
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: 'clamp(16px, 2.5vw, 22px)',
                  letterSpacing: '1.5px'
                }}
              >
                Solo vs AI Bidders
              </h2>
              <p className="opacity-75 text-on-surface-variant mb-4" style={{ color: '#cbc4ce', fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(12px, 1.8vw, 14px)', letterSpacing: '0.5px' }}>
                Confront active AI managers equipped with dynamic bidding personalities. Select a difficulty tier and draft your ultimate IPL dream franchise:
              </p>

              {/* Difficulty pills */}
              <div className="flex items-center gap-2 mb-6">
                {['easy', 'medium', 'hard'].map((level) => {
                  const isActive = aiDifficulty === level;
                  const colors = {
                    easy: { bg: 'rgba(0, 245, 160, 0.15)', border: 'rgba(0, 245, 160, 0.5)', text: '#00F5A0' },
                    medium: { bg: 'rgba(0, 201, 255, 0.15)', border: 'rgba(0, 201, 255, 0.5)', text: '#00C9FF' },
                    hard: { bg: 'rgba(255, 60, 172, 0.15)', border: 'rgba(255, 60, 172, 0.5)', text: '#FF3CAC' },
                  };
                  return (
                    <button
                      key={level}
                      onClick={() => setAiDifficulty(level)}
                      disabled={!!loadingMode}
                      className={`px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        isActive 
                          ? 'scale-105 shadow-lg font-bold' 
                          : 'opacity-50 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isActive ? colors[level].bg : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isActive ? colors[level].text : 'rgba(255, 255, 255, 0.1)',
                        color: colors[level].text,
                        fontFamily: "'Russo One', sans-serif",
                        fontSize: '10px',
                        letterSpacing: '1px'
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
              className={`relative z-10 w-full py-3 bg-[#ff8200] text-[#141315] hover:bg-[#ff8200]/90 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${loadingMode === 'solo' ? 'opacity-90' : ''} ${loadingMode && loadingMode !== 'solo' ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                color: '#141315', 
                backgroundColor: '#ff8200', 
                fontFamily: "'Russo One', sans-serif",
                fontSize: 'clamp(13px, 2vw, 16px)',
                letterSpacing: '1px'
              }}
            >
              {loadingMode === 'solo' ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#141315] border-t-transparent rounded-full animate-spin" />
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
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className={`glass-card p-6 sm:p-8 hover:border-[#d1bfeb] group transition-all transform hover:scale-[1.02] hover:-translate-y-1 duration-300 relative overflow-hidden flex flex-col justify-between ${loadingMode && loadingMode !== 'multiplayer' ? 'opacity-50 pointer-events-none' : ''}`}
            style={{ 
              backgroundColor: 'rgba(20, 20, 30, 0.35)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              minHeight: breakpoint.isMobile ? '140px' : '200px'
            }}
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#d1bfeb]/5 blur-2xl rounded-full group-hover:bg-[#d1bfeb]/10 transition-colors pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#d1bfeb]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-[#d1bfeb]/25">
                <span className="text-3xl sm:text-4xl">👥</span>
              </div>
              <h2 
                className="text-on-surface font-bold uppercase tracking-wider mb-2" 
                style={{ 
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: 'clamp(16px, 2.5vw, 22px)',
                  letterSpacing: '1.5px'
                }}
              >
                Play Online with Friends
              </h2>
              <p className="opacity-75 text-on-surface-variant mb-6" style={{ color: '#cbc4ce', fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(12px, 1.8vw, 14px)', letterSpacing: '0.5px' }}>
                Host a multiplayer room or enter a friend's room code to bid side-by-side in real-time. Pick your team and sync the draft!
              </p>
            </div>
            
            <button
              onClick={handleSelectOnline}
              disabled={!!loadingMode}
              className={`relative z-10 w-full py-3 bg-[#d1bfeb] text-[#141315] hover:bg-[#d1bfeb]/90 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${loadingMode === 'multiplayer' ? 'opacity-90' : ''} ${loadingMode && loadingMode !== 'multiplayer' ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                color: '#141315', 
                backgroundColor: '#d1bfeb',
                fontFamily: "'Russo One', sans-serif",
                fontSize: 'clamp(13px, 2vw, 16px)',
                letterSpacing: '1px'
              }}
            >
              {loadingMode === 'multiplayer' ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#141315] border-t-transparent rounded-full animate-spin" />
                  <span>Loading Multiplayer...</span>
                </>
              ) : (
                <>
                  <span>Go to multiplayer</span>
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
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          className={`glass-card mt-6 w-full relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 group cursor-pointer ${loadingMode && loadingMode !== 'join' ? 'opacity-50 pointer-events-none' : ''}`}
          style={{ 
            backgroundColor: 'rgba(20, 20, 30, 0.35)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
          onClick={() => !loadingMode && handleSelectJoin()}
        >
          {/* Glow blob */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00C9FF]/5 blur-2xl rounded-full group-hover:bg-[#00C9FF]/10 transition-colors pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:px-8 sm:py-6 gap-4 sm:gap-6">
            {/* Left: icon + text */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00C9FF]/10 rounded-xl flex items-center justify-center border border-[#00C9FF]/25 flex-shrink-0">
                <span className="text-2xl">🔑</span>
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest mb-0.5 opacity-60" style={{ color: '#00C9FF', fontFamily: "'Russo One', sans-serif", fontSize: '10px' }}>
                  Already have a room code?
                </p>
                <h3 className="font-bold uppercase tracking-wider" style={{ fontFamily: "'Russo One', sans-serif", color: '#e6e1e5', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>
                  Join a Room
                </h3>
                <p className="opacity-60 mt-0.5" style={{ color: '#cbc4ce', fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(12px, 1.8vw, 14px)', letterSpacing: '0.5px' }}>
                  Enter a friend's 6-digit code and jump straight into the auction
                </p>
              </div>
            </div>

            {/* Right: arrow button */}
            <button
              onClick={(e) => { e.stopPropagation(); if (!loadingMode) handleSelectJoin(); }}
              disabled={!!loadingMode}
              className={`w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer ${loadingMode === 'join' ? 'opacity-90' : ''}`}
              style={{ 
                backgroundColor: 'rgba(0, 201, 255, 0.15)', 
                color: '#00C9FF', 
                border: '1px solid rgba(0, 201, 255, 0.3)',
                fontFamily: "'Russo One', sans-serif",
                fontSize: 'clamp(13px, 2vw, 16px)',
                letterSpacing: '1px'
              }}
            >
              {loadingMode === 'join' ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#00C9FF] border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Join</span>
                  <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
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
