import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import { joinRoom } from '../lib/db';
import ProfileMenu from '../components/ProfileMenu';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function JoinRoom() {
  const navigate = useNavigate();
  const { roomCode: paramCode } = useParams();
  const breakpoint = useBreakpoint();
  const { currentUser, signInAsGuest, setRoomCode, setIsHost, setRoomMembers } = useAuction();

  // Input states
  const [roomInput, setRoomInput] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle route param pre-fill
  useEffect(() => {
    if (paramCode) {
      setRoomInput(paramCode.toUpperCase());
    }
  }, [paramCode]);

  // Set default nickname if authenticated
  useEffect(() => {
    if (currentUser) {
      setNickname(currentUser.user_metadata?.full_name || '');
    }
  }, [currentUser]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');

    const targetCode = roomInput.trim().toUpperCase();
    const targetName = nickname.trim();

    if (!targetCode || targetCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-character Room Code!');
      return;
    }
    if (!targetName) {
      setErrorMsg('Please enter room name to join the lobby!');
      return;
    }

    setLoading(true);

    try {
      let finalUser = currentUser;
      
      // If guest has not signed in yet, perform quick sign in automatically
      if (!finalUser) {
        finalUser = signInAsGuest(targetName);
      }

      const userId = finalUser.id || 'guest-' + Date.now();
      
      // Call joinRoom API
      const { room, members } = await joinRoom(targetCode, userId, targetName, null);

      // Set context values
      setRoomCode(targetCode);
      setIsHost(userId === room.host_id);
      setRoomMembers(members);

      setLoading(false);
      navigate(`/lobby/${targetCode}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to join the room lobby.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-hidden min-h-screen w-full relative flex flex-col justify-center items-center" style={{ backgroundColor: '#141315', color: '#e6e1e5' }}>
      <style>{`
        .glass-panel {
          background: rgba(54, 52, 55, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6);
        }
        .stadium-glow {
          background: radial-gradient(circle at center, rgba(209, 191, 235, 0.08) 0%, rgba(20, 19, 21, 0) 70%);
        }
      `}</style>

      {/* Atmospheric styling */}
      <div className="absolute inset-0 stadium-glow pointer-events-none z-0" />

      {/* Navigation Header */}
      <nav className="bg-surface/80 border-b border-white/10 shadow-lg flex items-center justify-between px-6 py-3 w-full fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(20, 19, 21, 0.95)' }}>
        <div className="flex items-center gap-3">
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

      <main 
        className="relative z-10 w-full mt-16"
        style={{
          maxWidth: breakpoint.isMobile ? '100%' : '420px',
          paddingLeft: breakpoint.isMobile ? '16px' : '24px',
          paddingRight: breakpoint.isMobile ? '16px' : '24px',
        }}
      >
        <div 
          className="glass-panel p-8 flex flex-col items-center"
          style={{
            borderRadius: breakpoint.isMobile ? '0px' : '16px'
          }}
        >
          <header className="text-center mb-6">
            <h1 className="text-secondary-fixed uppercase tracking-wider font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>
              Join a Room
            </h1>
            <p className="text-xs text-on-surface-variant tracking-wider font-semibold opacity-70 mt-1 uppercase" style={{ color: '#cbc4ce' }}>
              Enter room code to play with friends
            </p>
          </header>

          <form onSubmit={handleJoin} className="w-full space-y-5">
            {/* Room ID Code Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block ml-1" style={{ color: '#cbc4ce' }}>
                Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="e.g. IPL4X9"
                className="w-full bg-[#1d1b1e] border border-white/10 hover:border-white/20 focus:border-[#ff8200] focus:ring-1 focus:ring-[#ff8200] rounded-xl px-4 py-3 text-on-surface focus:outline-none transition-all placeholder:text-on-surface-variant/20 text-center font-bold tracking-widest text-[#ff8200] text-lg uppercase"
                style={{ backgroundColor: '#1d1b1e', borderColor: 'rgba(255,255,255,0.1)', fontSize: '16px' }}
              />
            </div>

            {/* Room Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block ml-1" style={{ color: '#cbc4ce' }}>
                Room Name
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter room name..."
                className="w-full bg-[#1d1b1e] border border-white/10 hover:border-white/20 focus:border-[#ff8200] focus:ring-1 focus:ring-[#ff8200] rounded-xl px-4 py-3 text-on-surface focus:outline-none transition-all placeholder:text-on-surface-variant/20 text-sm font-semibold"
                style={{ backgroundColor: '#1d1b1e', borderColor: 'rgba(255,255,255,0.1)', fontSize: '16px' }}
              />
            </div>

            {/* Error Container */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400 font-semibold text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Submit Join */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#ff8200] text-black font-bold text-xs uppercase hover:bg-white transition-all duration-300 active:scale-95 rounded-lg flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',
                fontFamily: "'Russo One', sans-serif",
                fontSize: 'clamp(16px, 2.5vw, 22px)',
                letterSpacing: '2px',
                color: '#141315',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span className="animate-spin inline-block text-lg">⏳</span>
              ) : (
                <span>👥</span>
              )}
              {loading ? 'Joining Lobby...' : 'Join Room →'}
            </button>
          </form>

          {/* Create Room navigation */}
          <div className="mt-8 text-center border-t border-white/5 pt-5 w-full">
            <button
              onClick={() => navigate('/create-room')}
              className="text-xs text-on-surface-variant font-bold uppercase tracking-wider hover:text-white transition-colors"
              style={{ color: '#cbc4ce' }}
            >
              Create your own room <span className="text-[#ff8200]" style={{ color: '#ff8200' }}>→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
