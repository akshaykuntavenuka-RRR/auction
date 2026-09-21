import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import { supabase, isRealSupabaseConfigured } from '../lib/supabase';

import { getRoomMembers, updateTeamChoice, setMemberReady, startRoomAuction } from '../lib/db';
import ProfileMenu from '../components/ProfileMenu';
import { useBreakpoint } from '../hooks/useBreakpoint';

const defaultLobbyTeams = [
  { name: 'Mumbai Indians', color: '#004BA0', logo: '/logos/mi.svg' },
  { name: 'Chennai Super Kings', color: '#FDB913', logo: '/logos/csk.svg' },
  { name: 'Delhi Capitals', color: '#1353AD', logo: '/logos/dc.svg' },
  { name: 'Kolkata Knight Riders', color: '#3A225D', logo: '/logos/kkr.svg' },
  { name: 'Royal Challengers Bengaluru', color: '#EC1C24', logo: '/logos/rcb.svg' },
  { name: 'Gujarat Titans', color: '#0B2265', logo: '/logos/gt.svg' },
  { name: 'Rajasthan Royals', color: '#E82E88', logo: '/logos/rr.svg' },
  { name: 'Sunrisers Hyderabad', color: '#FF822A', logo: '/logos/srh.svg' },
  { name: 'Lucknow Super Giants', color: '#4CA6A6', logo: '/logos/lsg.svg' },
  { name: 'Punjab Kings', color: '#DD1F26', logo: '/logos/pbks.svg' }
];

export default function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const {
    currentUser,
    authLoading,
    setSessionId,
    setTeams,
    roomCode: ctxCode,
    setRoomCode,
    roomMembers,
    setRoomMembers,
    isHost,
    setIsHost
  } = useAuction();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [starting, setStarting] = useState(false);
  // Track initial room status so we don't auto-navigate on rooms that were already active
  const initialRoomStatusRef = React.useRef(null);

  const activeCode = roomCode || ctxCode;
  const userId = currentUser?.id;

  // Guard routing if not logged in
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) return null;

  // Synchronize room code state
  useEffect(() => {
    if (activeCode && activeCode !== ctxCode) {
      setRoomCode(activeCode);
    }
  }, [activeCode, ctxCode, setRoomCode]);

  // Fetch initial members
  useEffect(() => {
    if (!activeCode || !userId) return;

    const fetchInitialData = async () => {
      try {
        const members = await getRoomMembers(activeCode);
        setRoomMembers(members);
        
        // Determine host dynamically if not set
        const rooms = JSON.parse(localStorage.getItem('ipl_mock_rooms') || '[]');
        const mockRoom = rooms.find(r => r.room_code === activeCode);
        
        const isRealSupabase = isRealSupabaseConfigured();

          
        if (isRealSupabase) {
          const { data: dbRoom } = await supabase
            .from('rooms')
            .select('host_id, status')
            .eq('room_code', activeCode)
            .single();
          if (dbRoom) {
            setIsHost(userId === dbRoom.host_id);
            // Capture initial status to prevent auto-navigation on already-active rooms
            initialRoomStatusRef.current = dbRoom.status;
          }
        } else if (mockRoom) {
          setIsHost(userId === mockRoom.host_id);
          initialRoomStatusRef.current = mockRoom.status;
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to connect to room lobby.');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [activeCode, userId, setRoomMembers, setIsHost]);

  // Keep a reference of members for async event callbacks
  const membersRef = React.useRef(roomMembers);
  useEffect(() => {
    membersRef.current = roomMembers;
  }, [roomMembers]);

  // Supabase Realtime OR Local Interval Synchronization
  useEffect(() => {
    if (!activeCode) return;

    const isRealSupabase = isRealSupabaseConfigured();


    if (isRealSupabase) {
      // 1. Subscribe to Room Members changes
      const membersChannel = supabase
        .channel(`realtime-lobby-members-${activeCode}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'room_members',
            filter: `room_code=eq.${activeCode}`
          },
          async () => {
            const updated = await getRoomMembers(activeCode);
            setRoomMembers(updated);
          }
        )
        .subscribe();

      // 2. Subscribe to Room Status changes (detect auction starts)
      const statusChannel = supabase
        .channel(`realtime-lobby-status-${activeCode}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rooms',
            filter: `room_code=eq.${activeCode}`
          },
          async (payload) => {
            // Only navigate if room was previously waiting (not already active at load time)
            if (payload.new.status === 'active' && payload.new.session_id && initialRoomStatusRef.current === 'waiting') {
              // Get core teams loaded
              const { data: dbTeams } = await supabase
                .from('teams')
                .select('*')
                .eq('session_id', payload.new.session_id);
                
              const formattedTeams = dbTeams.map(t => ({
                id: t.id,
                name: t.name,
                color: t.color,
                budget: t.budget,
                isUser: membersRef.current.find(m => m.user_id === userId)?.team_name === t.name
              }));

              setSessionId(payload.new.session_id);
              setTeams(formattedTeams);
              navigate('/auction');
            }
          }
        )
        .subscribe();

      // 3. Polling backup (every 2 seconds) to ensure sync works even without realtime replication enabled
      const pollInterval = setInterval(async () => {
        try {
          const updated = await getRoomMembers(activeCode);
          if (JSON.stringify(updated) !== JSON.stringify(membersRef.current)) {
            setRoomMembers(updated);
          }

          const { data: dbRoom, error: roomErr } = await supabase
            .from('rooms')
            .select('status, session_id')
            .eq('room_code', activeCode)
            .single();

          if (!roomErr && dbRoom && dbRoom.status === 'active' && dbRoom.session_id && initialRoomStatusRef.current === 'waiting') {
            const { data: dbTeams } = await supabase
              .from('teams')
              .select('*')
              .eq('session_id', dbRoom.session_id);
              
            if (dbTeams) {
              const formattedTeams = dbTeams.map(t => ({
                id: t.id,
                name: t.name,
                color: t.color,
                budget: t.budget,
                isUser: membersRef.current.find(m => m.user_id === userId)?.team_name === t.name
              }));

              setSessionId(dbRoom.session_id);
              setTeams(formattedTeams);
              clearInterval(pollInterval);
              navigate('/auction');
            }
          }
        } catch (err) {
          console.warn('Sync polling fallback error:', err);
        }
      }, 2000);

      return () => {
        supabase.removeChannel(membersChannel);
        supabase.removeChannel(statusChannel);
        clearInterval(pollInterval);
      };
    } else {
      // Offline/Local mock polling (enables cross-tab synchronization locally!)
      const interval = setInterval(async () => {
        // Sync members
        const updated = await getRoomMembers(activeCode);
        setRoomMembers(updated);

        // Sync room status
        const rooms = JSON.parse(localStorage.getItem('ipl_mock_rooms') || '[]');
        const room = rooms.find(r => r.room_code === activeCode);
        if (room && room.status === 'active' && room.session_id && initialRoomStatusRef.current === 'waiting') {
          // Sync teams locally
          const formattedTeams = updated.map((m, idx) => ({
            id: `local-team-${idx + 1}`,
            name: m.team_name || `Team ${idx + 1}`,
            color: m.team_color || '#ff8200',
            budget: room.budget_cr,
            isUser: m.user_id === userId
          }));

          setSessionId(room.session_id);
          setTeams(formattedTeams);
          clearInterval(interval);
          navigate('/auction');
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [activeCode, userId, setSessionId, setTeams, setRoomMembers, navigate]);

  const handlePickTeam = async (team) => {
    try {
      await updateTeamChoice(activeCode, userId, team.name, team.color);
      // Immediately reflect choice locally
      setRoomMembers(prev => prev.map(m => m.user_id === userId ? { ...m, team_name: team.name, team_color: team.color } : m));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReady = async () => {
    const me = roomMembers.find(m => m.user_id === userId);
    if (!me?.team_name) {
      alert('Please select your franchise team first!');
      return;
    }
    try {
      await setMemberReady(activeCode, userId);
      setRoomMembers(prev => prev.map(m => m.user_id === userId ? { ...m, is_ready: true } : m));
    } catch (err) {
      alert('Failed to mark ready: ' + err.message);
    }
  };

  const handleStartAuction = async () => {
    const unready = roomMembers.find(m => !m.is_ready || !m.team_name);
    if (unready) {
      alert('All players in the lobby must pick a team and mark ready!');
      return;
    }
    setStarting(true);

    try {
      const sId = await startRoomAuction(activeCode, userId);
      
      // Load local formatted teams directly for host
      const activeFranchises = roomMembers.map((m, idx) => ({
        id: sId.startsWith('local') ? `local-team-${idx + 1}` : `db-team-${idx + 1}`,
        name: m.team_name,
        color: m.team_color,
        budget: 100, // or pull from rooms
        isUser: m.user_id === userId
      }));

      setSessionId(sId);
      setTeams(activeFranchises);
      navigate('/auction');
    } catch (err) {
      alert('Failed to start auction: ' + err.message);
      setStarting(false);
    }
  };

  const handleShareLobby = async () => {
    const inviteUrl = `${window.location.origin}/join/${activeCode}`;
    const text = `Use Room Code: ${activeCode} to join my live IPL Auction draft!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my IPL Auction Room!',
          text: text,
          url: inviteUrl
        });
      } catch (err) {
        console.log('Shared canceled/failed:', err.message);
      }
    } else {
      navigator.clipboard.writeText(inviteUrl);
      alert('Lobby invite URL copied to clipboard! Share it with your friends.');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#141315] text-[#e6e1e5] min-h-screen flex flex-col justify-center items-center font-body-md">
        <span className="text-5xl animate-spin mb-4">⏳</span>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#ff8200]">Connecting to Lobby...</h2>
      </div>
    );
  }

  const currentUserMember = roomMembers.find(m => m.user_id === userId);
  const isMeReady = currentUserMember?.is_ready || false;

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-x-hidden min-h-screen pb-32 relative" style={{ backgroundColor: '#141315', color: '#e6e1e5' }}>
      <style>{`
        .glass-panel {
          background: rgba(54, 52, 55, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .gold-glow {
          box-shadow: 0 0 15px rgba(255, 130, 0, 0.25);
        }
        .gold-gradient {
          background: linear-gradient(135deg, #ff8200 0%, #e05a00 100%);
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

        <div className="flex items-center gap-3">
          {breakpoint.isMobile ? (
            <button
              onClick={handleShareLobby}
              className="p-2 border border-white/10 hover:bg-white/10 rounded-full text-[#ff8200] flex items-center justify-center cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleShareLobby}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff8200] hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Lobby
            </button>
          )}
          <ProfileMenu />
        </div>
      </nav>

      <main 
        className="max-w-7xl mx-auto pt-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8"
        style={{
          paddingLeft: breakpoint.isMobile ? '16px' : '24px',
          paddingRight: breakpoint.isMobile ? '16px' : '24px',
          paddingBottom: breakpoint.isMobile ? '100px' : '48px',
        }}
      >
        
        {/* Left Info & Picker Side */}
        <div className="lg:col-span-7 space-y-8">
          {/* Header Box */}
          <div className="glass-panel p-6 rounded-2xl flex justify-between items-center flex-wrap gap-4 border border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff8200]">MULTIPLAYER ACTIVE</span>
              <h1 className="text-on-surface font-bold mt-1" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(24px, 5vw, 48px)', letterSpacing: '3px' }}>AUCTION LOBBY</h1>
            </div>

            {/* Room ID styled box */}
            <div className="flex items-center gap-3 bg-[#1d1b1e] border border-white/10 px-5 py-3 rounded-xl gold-glow" style={{ borderColor: 'rgba(255,130,0,0.3)' }}>
              <div className="text-right">
                <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest block" style={{ color: '#cbc4ce' }}>ROOM CODE</span>
                <span 
                  className="text-secondary-fixed font-bold tracking-widest text-[#ff8200]" 
                  style={{ 
                    fontFamily: "'Russo One', sans-serif",
                    fontSize: 'clamp(24px, 5vw, 48px)',
                    letterSpacing: '8px'
                  }}
                >
                  {activeCode}
                </span>
              </div>
              <button
                onClick={handleShareLobby}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-secondary-fixed transition-colors flex items-center gap-1.5 cursor-pointer"
                style={{ color: '#ff8200' }}
                title="Share room ID"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {!breakpoint.isMobile && <span className="text-xs font-bold uppercase tracking-wider">Share</span>}
              </button>
            </div>
          </div>

          {/* Team Selection Grid */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-on-surface uppercase font-bold text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>
              Claim Your Franchise Team
            </h2>
            <p className="text-xs text-on-surface-variant opacity-70" style={{ color: '#cbc4ce' }}>
              Select a team from the available franchises below. Each team can only be claimed once!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {defaultLobbyTeams.map(team => {
                const claimedBy = roomMembers.find(m => m.team_name === team.name);
                const isMine = claimedBy?.user_id === userId;
                const isClaimed = claimedBy && !isMine;

                return (
                  <button
                    key={team.name}
                    disabled={isClaimed}
                    onClick={() => handlePickTeam(team)}
                    className={`p-4 rounded-xl text-left border flex flex-col justify-between transition-all transform active:scale-95 duration-200 min-h-[130px] relative ${
                      isMine
                        ? 'border-[#ff8200] bg-white/5 gold-glow'
                        : isClaimed
                        ? 'border-white/5 bg-white/[0.01] opacity-35 cursor-not-allowed'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full gap-2">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1 border border-white/15 overflow-hidden flex-shrink-0">
                        {team.logo ? (
                           <img src={team.logo} alt={team.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: team.color, boxShadow: `0 0 8px ${team.color}` }} />
                        )}
                      </div>
                      {isMine && (
                        <span className="text-xs text-[#ff8200]">✅</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider truncate text-on-surface">{team.name}</h3>
                      <p className="text-[9px] opacity-60 uppercase tracking-widest mt-1 text-on-surface-variant" style={{ color: '#cbc4ce' }}>
                        {isMine ? 'YOUR TEAM' : isClaimed ? claimedBy.user_name : 'AVAILABLE'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Players Side */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 flex flex-col justify-between min-h-[420px] border border-white/10 shadow-2xl">
            <div>
              <h2 className="uppercase font-bold mb-6 text-[#ff8200] drop-shadow-[0_2px_10px_rgba(255,130,0,0.15)]" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>
                Joined Players
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {roomMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 sm:p-5 bg-[#1d1b1e]/90 hover:bg-[#252327]/90 border border-white/10 rounded-2xl transition-all duration-300 transform hover:scale-[1.01] hover:border-[#ff8200]/30 shadow-md">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Initials avatar */}
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-lg uppercase border-2 text-white transition-all duration-300 flex-shrink-0"
                        style={{
                          backgroundColor: member.team_color || '#363437',
                          borderColor: member.team_color ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                          boxShadow: member.team_color ? `0 0 15px ${member.team_color}33, inset 0 0 10px rgba(0,0,0,0.5)` : 'none'
                        }}
                      >
                        {member.user_name.substring(0, 2)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-base sm:text-lg block leading-tight text-white tracking-wide truncate">{member.user_name}</span>
                        <span className="text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-widest block truncate" style={{ color: member.team_color || '#cbc4ce' }}>
                          {member.team_name || 'No team chosen'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {member.is_ready ? (
                        <div className="bg-[#00C853]/10 text-[#00C853] px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#00C853]/40 shadow-[0_0_10px_rgba(0,200,83,0.15)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                          Ready
                        </div>
                      ) : (
                        <div className="bg-white/5 text-[#cbc4ce]/60 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/10">
                          Waiting...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside players card */}
            {breakpoint.isMobile ? (
              <div 
                className="fixed bottom-0 left-0 w-full p-3 z-50"
                style={{
                  background: '#0a0020',
                  borderTop: '1px solid rgba(255,215,0,0.1)'
                }}
              >
                {isHost ? (
                  <button
                    onClick={handleStartAuction}
                    disabled={starting}
                    className={`w-full py-4 rounded-xl gold-gradient text-black font-display-md text-2xl font-bold tracking-widest gold-glow flex items-center justify-center gap-2 cursor-pointer ${
                      starting ? 'opacity-85 cursor-wait btn-loading-shimmer' : 'active:scale-95'
                    }`}
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',
                      fontSize: 'clamp(16px, 2.5vw, 22px)',
                      letterSpacing: '2px',
                      color: '#141315',
                      boxShadow: '0 0 15px rgba(255, 130, 0, 0.3)'
                    }}
                  >
                    {starting ? (
                      <>
                        <span className="animate-spin text-lg">⏳</span>
                        <span>LAUNCHING AUCTION...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>START AUCTION</span>
                      </>
                    )}
                  </button>
                ) : isMeReady ? (
                  <div className="w-full text-center py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-on-surface-variant opacity-60">
                    Waiting for host to start...
                  </div>
                ) : (
                  <button
                    onClick={handleReady}
                    className="w-full py-4 rounded-xl bg-[#00C853] text-black font-display-md text-2xl font-bold tracking-widest flex items-center justify-center gap-2 cursor-pointer text-center"
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      backgroundColor: '#00C853',
                      fontSize: 'clamp(16px, 2.5vw, 22px)',
                      letterSpacing: '2px',
                      color: '#141315',
                      boxShadow: '0 0 15px rgba(0, 200, 83, 0.2)'
                    }}
                  >
                    <span>✅</span>
                    MARK AS READY
                  </button>
                )}
              </div>
            ) : (
              <div className="pt-6 border-t border-white/10">
                {isHost ? (
                  <button
                    onClick={handleStartAuction}
                    disabled={starting}
                    className={`w-full py-5 rounded-2xl gold-gradient text-black font-display-md text-3xl font-bold tracking-widest gold-glow hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3 cursor-pointer ${
                      starting ? 'opacity-85 cursor-wait btn-loading-shimmer' : 'active:scale-95'
                    }`}
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',
                      fontSize: 'clamp(16px, 2.5vw, 22px)',
                      letterSpacing: '2px',
                      color: '#141315',
                      boxShadow: '0 0 25px rgba(255, 130, 0, 0.4)'
                    }}
                  >
                    {starting ? (
                      <>
                        <span className="animate-spin text-xl">⏳</span>
                        <span>LAUNCHING AUCTION...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>START AUCTION</span>
                      </>
                    )}
                  </button>
                ) : isMeReady ? (
                  <div className="w-full text-center py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-wider text-on-surface-variant opacity-60">
                    Waiting for host to start...
                  </div>
                ) : (
                  <button
                    onClick={handleReady}
                    className="w-full py-5 rounded-2xl bg-[#00C853] hover:bg-green-400 text-black font-display-md text-3xl font-bold tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 cursor-pointer text-center"
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      backgroundColor: '#00C853',
                      fontSize: 'clamp(16px, 2.5vw, 22px)',
                      letterSpacing: '2px',
                      color: '#141315',
                      boxShadow: '0 0 25px rgba(0, 200, 83, 0.3)'
                    }}
                  >
                    <span>✅</span>
                    MARK AS READY
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
