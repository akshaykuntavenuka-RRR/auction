import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import { supabase, isRealSupabaseConfigured } from '../lib/supabase';

import { getAIBid } from '../lib/aiBidder';
import ProfileMenu from '../components/ProfileMenu';
import PlayerCard from '../components/PlayerCard';
import LiveTeamsPanel from '../components/LiveTeamsPanel';
import { useBreakpoint } from '../hooks/useBreakpoint';

const EMOJI_LIST = [
  '🏏', '🏆', '🔥', '⚡', '💥', '💰', '🤑', '👏',
  '😂', '🤣', '😎', '🤫', '🤯', '🥳', '🫡', '💪',
  '🚀', '🎯', '👑', '💣', '🧤', '🧢', '🍿', '💸',
  '🤝', '🙌', '👍', '👎', '✅', '❌', '👀', '🤐'
];

export default function Auction() {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const {
    currentUser,
    authLoading,
    sessionId,
    teams,
    setTeams,
    players,
    playersLoading,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    unsoldPlayers,
    setUnsoldPlayers,
    auctionRound,
    setAuctionRound,
    startRound2,
    markPlayerSold,
    markPlayerUnsold,
    roomCode,
    isHost: isHostFromCtx,
    isSoloMode,
    humanTeamId,
    soldPlayers,
    bidTimer,
    maxTeamSize,
    setMaxTeamSize
  } = useAuction();

  const isHost = !roomCode || isHostFromCtx;

  // Get active player
  const player = players[currentPlayerIndex];

  // Bidding state variables
  const [currentBid, setCurrentBid] = useState(0);
  const [activeBidder, setActiveBidder] = useState(null);
  const [customBidInput, setCustomBidInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Solo Mode Bidding loop states
  const [aiThinking, setAiThinking] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [passedTeamIds, setPassedTeamIds] = useState([]);
  const [commentary, setCommentary] = useState([]);

  // Congratulations modal / Transaction states
  const [soldStatus, setSoldStatus] = useState(null); // 'sold', 'unsold', or null
  const [winningBidder, setWinningBidder] = useState(null);
  const [winningPrice, setWinningPrice] = useState(0);

  // Skip, End Auction, and Round 2 control states
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showRound1CompleteModal, setShowRound1CompleteModal] = useState(false);
  const [toast, setToast] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Chat feature state variables
  const [activeTab, setActiveTab] = useState('commentary'); // 'commentary' or 'chat'
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = sessionStorage.getItem('ipl_auction_chats');
    return saved ? JSON.parse(saved) : [
      {
        id: 'system-welcome',
        sender: 'Auction Host',
        text: 'Welcome to the Live Auction Arena! Good luck bidding!',
        color: '#ff8200',
        logo: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
        isSystem: true
      }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);

  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Sync chats to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('ipl_auction_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Handle unread counts when user is on chat tab
  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadChats(0);
    }
  }, [activeTab]);

  const addChatMessage = (msg) => {
    setChatMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      if (activeTabRef.current !== 'chat') {
        setUnreadChats(u => u + 1);
      }
      return [...prev, msg];
    });
  };

  const idleTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const aiThinkingTimerRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Preload upcoming player photos into memory to completely eliminate loading lag
  useEffect(() => {
    if (!players || players.length === 0) return;
    const nextLimit = Math.min(players.length, currentPlayerIndex + 5);
    for (let i = currentPlayerIndex + 1; i < nextLimit; i++) {
      const p = players[i];
      if (p?.name) {
        const slug = p.name.toLowerCase().replace(/\./g, '').trim().replace(/\s+/g, '-');
        const img = new Image();
        img.src = `/players/${slug}.png`;
      }
    }
  }, [currentPlayerIndex, players]);

  const humanTeam = teams.find(t => t.isUser || t.id === humanTeamId);
  const humanId = humanTeam?.id;

  const getTeamRosterSize = (teamId) => {
    return soldPlayers.filter(sp => sp.team_id === teamId).length;
  };
  const isTeamFull = (teamId) => {
    return getTeamRosterSize(teamId) >= maxTeamSize;
  };


  // Refs to track latest state values in async timer callbacks (closures)
  const currentBidRef = useRef(currentBid);
  const activeBidderRef = useRef(activeBidder);
  const passedTeamIdsRef = useRef(passedTeamIds);
  const teamsRef = useRef(teams);

  // Sync refs with latest state updates
  useEffect(() => { currentBidRef.current = currentBid; }, [currentBid]);
  useEffect(() => { activeBidderRef.current = activeBidder; }, [activeBidder]);
  useEffect(() => { passedTeamIdsRef.current = passedTeamIds; }, [passedTeamIds]);
  useEffect(() => { teamsRef.current = teams; }, [teams]);

  // Refs for modal states to ensure correct asynchronous callbacks
  const soldStatusRef = useRef(soldStatus);
  const winningBidderRef = useRef(winningBidder);
  const winningPriceRef = useRef(winningPrice);

  useEffect(() => { soldStatusRef.current = soldStatus; }, [soldStatus]);
  useEffect(() => { winningBidderRef.current = winningBidder; }, [winningBidder]);
  useEffect(() => { winningPriceRef.current = winningPrice; }, [winningPrice]);

  // Auto-advance modal timer
  useEffect(() => {
    if (soldStatus) {
      const timer = setTimeout(() => {
        handleProceedNext();
      }, 3500); // 3.5 seconds delay
      return () => clearTimeout(timer);
    }
  }, [soldStatus]);

  const gavelSoundRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Hoisted helper functions
  function getPlayerBaseCr(p) {
    if (!p) return 0.5;
    if (typeof p.base === 'number' && !isNaN(p.base) && p.base > 0) return p.base;
    if (typeof p.basePrice === 'number' && !isNaN(p.basePrice) && p.basePrice > 0) {
      return p.basePrice > 10000 ? p.basePrice / 10000000 : p.basePrice;
    }
    return 0.5;
  }

  function addCommentary(text) {
    setCommentary(prev => [text, ...prev].slice(0, 4));
  }

  // Trigger a simulated chat from a random AI team owner in Solo Mode
  function triggerAIChat(text, delay = 1000) {
    if (!isSoloMode) return;

    // Choose a random AI team
    const aiTeams = teamsRef.current.filter(t => t.isAi && t.id !== humanId);
    if (aiTeams.length === 0) return;

    const randomTeam = aiTeams[Math.floor(Math.random() * aiTeams.length)];

    setTimeout(() => {
      const aiMessage = {
        id: `msg-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: randomTeam.name,
        text: text,
        color: randomTeam.color,
        logo: randomTeam.logo || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false
      };
      addChatMessage(aiMessage);
    }, delay);
  }

  function triggerAICommentaryOnPlayer(playerObj) {
    if (!isSoloMode || !playerObj) return;

    let comments = [];
    const role = playerObj.roleCode || playerObj.role || 'BAT';

    if (role === 'BAT' || role === 'WK') {
      comments = [
        `A solid batsman, we definitely need him!`,
        `His batting stats are incredible.`,
        `Let's see who bids for ${playerObj.name}.`,
        `We need a high impact player like ${playerObj.name}!`,
        `A destructive player, would love to have him.`
      ];
    } else if (role === 'BOWL') {
      comments = [
        `A wicket-taking bowler, highly valuable!`,
        `Perfect bowler for death overs.`,
        `He's going to go for a big price.`,
        `We need to strengthen our bowling attack with him.`,
        `His economy rate is excellent.`
      ];
    } else if (role === 'AR') {
      comments = [
        `A versatile all-rounder, matches are won by players like him!`,
        `A true match-winner.`,
        `He will bring great balance to our team.`,
        `An all-rounder of his caliber is a must-buy.`,
        `He can win it with both bat and ball!`
      ];
    } else {
      comments = [
        `Interesting option in this set.`,
        `Let's see if anyone bids.`,
        `${playerObj.name} is on the block!`,
        `A reliable player.`
      ];
    }

    const randomComment = comments[Math.floor(Math.random() * comments.length)];
    triggerAIChat(randomComment, 1200);
  }

  // Handle sending a chat message (user types a message)
  function sendChatMessage(text) {
    if (!text.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: humanTeam?.name || currentUser?.user_metadata?.full_name || 'CSK Owner',
      text: text.trim(),
      color: humanTeam?.color || '#ff8200',
      logo: humanTeam?.logo || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };

    addChatMessage(newMessage);
    setChatInput('');

    // Broadcast in multiplayer
    if (roomCode) {
      if (isRealSupabase()) {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.send({
            type: 'broadcast',
            event: 'chat_message',
            payload: {
              ...newMessage,
              isUser: false // For other clients, it's not their user
            }
          });
        }
      } else {
        // Offline multiplayer mock sync
        const currentChats = JSON.parse(localStorage.getItem(`ipl_mock_chat_${roomCode}`) || '[]');
        currentChats.push({
          ...newMessage,
          isUser: false
        });
        localStorage.setItem(`ipl_mock_chat_${roomCode}`, JSON.stringify(currentChats));
      }
    }

    // AI bot reactions in Solo mode
    if (isSoloMode) {
      const userText = text.toLowerCase();
      let aiResponse = "";

      if (userText.includes('bid') || userText.includes('buy') || userText.includes('want')) {
        const responses = [
          "Not if we bid first! 😉",
          "Let's see if you have the budget!",
          "He'd look better in our colors!",
          "We are also interested, watch out!",
          "Get ready to pay a high price then!"
        ];
        aiResponse = responses[Math.floor(Math.random() * responses.length)];
      } else if (userText.includes('skip') || userText.includes('pass') || userText.includes('expensive')) {
        const responses = [
          "Agreed, budget management is key.",
          "Yeah, saving up for others.",
          "Good decision, let others fight for him.",
          "Smart pass.",
          "We might take him if he is cheap!"
        ];
        aiResponse = responses[Math.floor(Math.random() * responses.length)];
      } else if (userText.includes('win') || userText.includes('easy') || userText.includes('champion')) {
        const responses = [
          "Don't count your chickens yet!",
          "The auction is long, my friend.",
          "We'll see at the end!",
          "Our squad is much better than yours!",
          "Bold claim! Let's see your team."
        ];
        aiResponse = responses[Math.floor(Math.random() * responses.length)];
      } else {
        const responses = [
          "Let's see who wins this auction!",
          "May the best team win!",
          "Our squad is looking solid.",
          "Looking forward to the next set.",
          "We need a good batsman next.",
          "Any thoughts on this player?",
          "We're playing the long game here.",
          "Quality players are rare today!"
        ];
        aiResponse = responses[Math.floor(Math.random() * responses.length)];
      }

      triggerAIChat(aiResponse, 1200);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleSkipPlayer() {
    if (!isHost) return;

    const skippedPlayer = players[currentPlayerIndex];
    if (!skippedPlayer) return;

    // Add to unsold list
    setUnsoldPlayers(prev => [...prev, skippedPlayer]);

    // Show toast
    showToast(`⏭ Skipped ${skippedPlayer.name}`);

    // If this was the last player, check if Round 2 is available
    if (currentPlayerIndex >= players.length - 1) {
      if (auctionRound === 1) {
        setShowRound1CompleteModal(true);
        return;
      }
      navigate('/results');
      return;
    }

    // Advance to next player
    setCurrentPlayerIndex(i => i + 1);
    const nextPlayer = players[currentPlayerIndex + 1];
    const nextBaseCr = getPlayerBaseCr(nextPlayer);
    setCurrentBid(nextBaseCr);
    setActiveBidder(null);
    setCustomBidInput('');

    // If multiplayer — update Supabase so all friends skip too
    if (roomCode) {
      if (isRealSupabase()) {
        await supabase
          .from('rooms')
          .update({ current_player_index: currentPlayerIndex + 1 })
          .eq('room_code', roomCode);
      } else {
        const mockState = JSON.parse(localStorage.getItem(`ipl_mock_auction_${roomCode}`) || '{}');
        mockState.current_player_index = currentPlayerIndex + 1;
        mockState.timestamp = Date.now();
        localStorage.setItem(`ipl_mock_auction_${roomCode}`, JSON.stringify(mockState));
      }
    }
  }

  // START ROUND 2 for unsold players
  function handleStartRound2() {
    clearAllTimers();
    const currentUnsold = [...unsoldPlayers];
    if (currentUnsold.length === 0) {
      showToast('⚠️ No unsold players available for Round 2');
      navigate('/results');
      return;
    }

    const ok = startRound2(currentUnsold);
    if (ok) {
      setShowRound1CompleteModal(false);
      showToast(`⚡ Round 2 Activated! ${currentUnsold.length} Unsold Players on block`);
      syncAuctionState('start_round_2', 0, null, { round2Players: currentUnsold });
    } else {
      navigate('/results');
    }
  }

  async function handleEndAuction() {
    if (!isHost) return;
    setShowEndConfirm(false);

    // Mark all remaining players as unsold
    const remaining = players.slice(currentPlayerIndex);
    setUnsoldPlayers(prev => [...prev, ...remaining]);

    // Update session status to completed in Supabase
    if (sessionId) {
      if (isRealSupabase()) {
        await supabase
          .from('sessions')
          .update({ status: 'completed' })
          .eq('id', sessionId);
      }
    }

    // If multiplayer — update room status so all friends redirect
    if (roomCode) {
      if (isRealSupabase()) {
        await supabase
          .from('rooms')
          .update({ status: 'completed' })
          .eq('room_code', roomCode);
      } else {
        const mockState = JSON.parse(localStorage.getItem(`ipl_mock_auction_${roomCode}`) || '{}');
        mockState.status = 'completed';
        mockState.timestamp = Date.now();
        localStorage.setItem(`ipl_mock_auction_${roomCode}`, JSON.stringify(mockState));
      }
    }

    showToast('🏆 Auction ended! Showing results...');

    // Short delay for toast to show then navigate
    setTimeout(() => navigate('/results'), 1200);
  }

  function clearAllTimers() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (aiThinkingTimerRef.current) clearTimeout(aiThinkingTimerRef.current);
    setCountdown(null);
    setAiThinking(false);
  }

  // Redirection guard if game is finished or user is not logged in (Hook 1)
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/signin');
      return;
    }
    if (currentPlayerIndex >= players.length && players.length > 0) {
      if (auctionRound === 1 && (unsoldPlayers.length > 0 || !player)) {
        setShowRound1CompleteModal(true);
      } else {
        navigate('/results');
      }
    }
  }, [currentUser, authLoading, currentPlayerIndex, players, auctionRound, unsoldPlayers, player, navigate]);

  // Reset bidding states when player transitions (Hook 2)
  useEffect(() => {
    if (player) {
      const baseCr = getPlayerBaseCr(player);
      startNewAuctionRound(baseCr);
    }
  }, [player, isSoloMode]);

  // Clean up timers on unmount (Hook 3)
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Supabase Realtime Channel Subscription for live budget sync (Hook 4)
  useEffect(() => {
    if (!sessionId || sessionId.startsWith('local') || sessionId.startsWith('fallback')) return;

    const channel = supabase
      .channel(`realtime-teams-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setTeams(prev => prev.map(t => t.id === payload.new.id ? { ...t, budget: payload.new.budget } : t));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, setTeams]);

  // Peer-to-peer sync (Hook 5)
  useEffect(() => {
    if (!roomCode) return;

    if (isRealSupabase()) {
      const channel = supabase.channel(`auction-sync-${roomCode}`);
      broadcastChannelRef.current = channel;

      channel
        .on('broadcast', { event: 'auction_update' }, ({ payload }) => {
          if (!isHost) handleReceivedState(payload);
        })
        .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
          addChatMessage(payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && isHost) {
            setTimeout(() => {
              syncAuctionState('init_settings', currentBidRef.current, activeBidderRef.current?.id);
            }, 1000);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Offline local storage mock sync for chat
      const chatInterval = setInterval(() => {
        const raw = localStorage.getItem(`ipl_mock_chat_${roomCode}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.forEach(msg => {
            const isFromUs = msg.sender === (humanTeam?.name || currentUser?.user_metadata?.full_name || 'CSK Owner');
            addChatMessage({
              ...msg,
              isUser: isFromUs
            });
          });
        }
      }, 1000);

      if (!isHost) {
        let lastTimestamp = 0;
        const stateInterval = setInterval(() => {
          const raw = localStorage.getItem(`ipl_mock_auction_${roomCode}`);
          if (raw) {
            const state = JSON.parse(raw);
            if (state.timestamp > lastTimestamp) {
              lastTimestamp = state.timestamp;
              handleReceivedState(state);

              // Offline mock sync for skipped player
              if (state.current_player_index !== undefined && state.current_player_index !== null && state.current_player_index !== currentPlayerIndex) {
                setCurrentPlayerIndex(state.current_player_index);
                const nextPl = players[state.current_player_index];
                const nextBid = getPlayerBaseCr(nextPl);
                setCurrentBid(nextBid);
                setActiveBidder(null);
              }
              // Offline mock sync for ended auction
              if (state.status === 'completed') {
                showToast('🏆 Host ended the auction!');
                setTimeout(() => navigate('/results'), 1000);
              }
            }
          }
        }, 1000);
        return () => {
          clearInterval(chatInterval);
          clearInterval(stateInterval);
        };
      } else {
        return () => {
          clearInterval(chatInterval);
        };
      }
    }
  }, [roomCode, isHost, teams, players, currentPlayerIndex, humanTeam, currentUser]);

  // Sync SKIP and END to all players via rooms table updates (Hook 6)
  useEffect(() => {
    if (!roomCode || !isRealSupabase()) return;

    const channel = supabase
      .channel('room-controls')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `room_code=eq.${roomCode}`,
      }, (payload) => {
        // Host ended the auction — redirect everyone
        if (payload.new.status === 'completed') {
          showToast('🏆 Host ended the auction!');
          setTimeout(() => navigate('/results'), 1000);
        }
        // Host skipped a player — sync index for all players
        if (payload.new.current_player_index !== undefined && payload.new.current_player_index !== null && payload.new.current_player_index !== currentPlayerIndex) {
          setCurrentPlayerIndex(payload.new.current_player_index);
          const nextPl = players[payload.new.current_player_index];
          const nextBid = getPlayerBaseCr(nextPl);
          setCurrentBid(nextBid);
          setActiveBidder(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, currentPlayerIndex, players]);

  // Early returns placed AFTER all Hook declarations to strictly satisfy Rules of Hooks
  if (authLoading) return null;
  if (playersLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#141315', flexDirection: 'column', gap: 16 }}>
      {/* Russo One is loaded globally */}
      <div style={{ width: 60, height: 60, border: '3px solid rgba(255,130,0,0.2)', borderTop: '3px solid #ff8200', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#ff8200', letterSpacing: '2px' }}>LOADING PLAYERS...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  function renderRound1CompleteModal() {
    const unsoldList = unsoldPlayers || [];
    const activeTeamsWithPurse = teams.filter(t => !isTeamFull(t.id) && t.budget >= 0.2);

    return (
      <div className="min-h-screen bg-[#141315] text-[#e6e1e5] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ff8200]/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div 
          className="max-w-2xl w-full glass-card p-6 sm:p-8 rounded-2xl border border-white/10 relative z-10 shadow-2xl flex flex-col items-center text-center animate-fade-in"
          style={{
            background: 'rgba(28, 25, 32, 0.9)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(255,130,0,0.15)'
          }}
        >
          {/* Header Icon & Title */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-500/40 flex items-center justify-center text-4xl mb-4 shadow-inner">
            🏏
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: "'Russo One', sans-serif" }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ROUND 1 COMPLETE
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-wide text-white mb-2" style={{ fontFamily: "'Russo One', sans-serif" }}>
            ALL PLAYERS AUCTIONED!
          </h2>
          <p className="text-xs sm:text-sm text-[#cbc4ce] opacity-80 max-w-lg mb-6 leading-relaxed">
            All players from the initial pool have crossed the auction block. Franchises now get an exciting second chance in <span className="text-[#ff8200] font-bold">Round 2</span> to bid on all unsold players!
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400" style={{ fontFamily: "'Russo One', sans-serif" }}>
                {soldPlayers.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mt-1">Players Sold</span>
            </div>
            <div className="bg-white/5 border border-amber-500/30 rounded-xl p-3 flex flex-col items-center bg-amber-500/5">
              <span className="text-xl sm:text-2xl font-bold text-amber-400" style={{ fontFamily: "'Russo One', sans-serif" }}>
                {unsoldList.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-300/70 tracking-wider mt-1">Unsold Pool</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-bold text-sky-400" style={{ fontFamily: "'Russo One', sans-serif" }}>
                {activeTeamsWithPurse.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mt-1">Teams with Purse</span>
            </div>
          </div>

          {/* Unsold Players Preview */}
          {unsoldList.length > 0 && (
            <div className="w-full bg-black/30 border border-white/5 rounded-xl p-4 mb-6 text-left">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  Unsold Players Entering Round 2 ({unsoldList.length})
                </span>
                <span className="text-[10px] text-white/50">Base prices apply</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {unsoldList.slice(0, 10).map((p, idx) => (
                  <div key={idx} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-white">{p.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ff8200]/20 text-[#ff8200] font-bold">
                      {p.roleCode || p.role || 'CRIC'}
                    </span>
                    <span className="text-[10px] text-white/60">₹{getPlayerBaseCr(p)} Cr</span>
                  </div>
                ))}
                {unsoldList.length > 10 && (
                  <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex items-center text-xs text-white/60 font-bold">
                    +{unsoldList.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {unsoldList.length > 0 && (
              <button
                onClick={handleStartRound2}
                className="flex-1 py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  fontFamily: "'Russo One', sans-serif",
                  background: 'linear-gradient(135deg, #ff8200 0%, #ff9d47 100%)',
                  boxShadow: '0 0 20px rgba(255, 130, 0, 0.4)'
                }}
              >
                <span>⚡</span>
                START ROUND 2 ({unsoldList.length} PLAYERS)
              </button>
            )}
            <button
              onClick={() => navigate('/results')}
              className="py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-white/80 border border-white/15 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
              style={{ fontFamily: "'Russo One', sans-serif" }}
            >
              <span>📊</span>
              View Final Squads
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showRound1CompleteModal) {
    return renderRound1CompleteModal();
  }
  if (!player) return null;

  // Constants computed during render when player is guaranteed to be defined
  const basePriceCr = getPlayerBaseCr(player);
  // Standard single-tap BID button increment: always 25 Lakh (0.25 Cr)
  const nextIncrement = 0.25;
  const safeCurrentBid = (typeof currentBid === 'number' && !isNaN(currentBid) && currentBid > 0) ? currentBid : basePriceCr;
  const nextBidVal = Math.round((safeCurrentBid + nextIncrement) * 4) / 4;
  const displayBid = safeCurrentBid;

  function isRealSupabase() {
    return isRealSupabaseConfigured();
  }


  // Visual audio logs
  if (gavelSoundRef.current) {
    // Suppress unused ref warning
    console.debug('Gavel sound ref initialized');
  }

  function syncAuctionState(action, newBid, bidderId, extraData = {}) {
    if (!roomCode || !isHost) return;

    if (isRealSupabase()) {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'auction_update',
          payload: { action, currentBid: newBid, activeBidderId: bidderId, currentPlayerIndex, maxTeamSize, ...extraData }
        });
      }
    } else {
      const state = { action, currentBid: newBid, activeBidderId: bidderId, currentPlayerIndex, maxTeamSize, ...extraData, timestamp: Date.now() };
      localStorage.setItem(`ipl_mock_auction_${roomCode}`, JSON.stringify(state));
    }
  }

  function handleReceivedState(payload) {
    if (payload.maxTeamSize) {
      setMaxTeamSize(payload.maxTeamSize);
    }
    if (payload.action === 'bid') {
      setIsPaused(false);
      setCurrentBid(payload.currentBid);
      const bidder = payload.activeBidderId
        ? teams.find(t => t.id === payload.activeBidderId)
        : null;
      setActiveBidder(bidder);

      // Reset client's local countdown timer when a bid sync is received
      clearAllTimers();
      setCountdown(bidTimer);
      let timeLeft = bidTimer;
      countdownIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownIntervalRef.current);
          setCountdown(null);
          handleAuctionTimeout();
        }
      }, 1000);
    } else if (payload.action === 'sold') {
      setIsPaused(false);
      const activePlayer = players[payload.currentPlayerIndex];
      if (activePlayer && payload.activeBidderId) {
        markPlayerSold(activePlayer, payload.activeBidderId, payload.currentBid);
      }
    } else if (payload.action === 'unsold') {
      setIsPaused(false);
      const activePlayer = players[payload.currentPlayerIndex];
      if (activePlayer) {
        markPlayerUnsold(activePlayer);
      }
    } else if (payload.action === 'pause') {
      setIsPaused(true);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    } else if (payload.action === 'resume') {
      setIsPaused(false);
      if (payload.countdown !== null && payload.countdown > 0) {
        setCountdown(payload.countdown);
        let timeLeft = payload.countdown;
        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(countdownIntervalRef.current);
            setCountdown(null);
            handleAuctionTimeout();
          }
        }, 1000);
      }
    } else if (payload.action === 'start_round_2') {
      setIsPaused(false);
      if (payload.round2Players && payload.round2Players.length > 0) {
        startRound2(payload.round2Players);
      } else {
        startRound2();
      }
      setShowRound1CompleteModal(false);
      showToast('⚡ Round 2 has begun! Bidding on unsold players');
    }
  }

  // START a completely new auction round for the current player on block
  function startNewAuctionRound(baseCr) {
    clearAllTimers();
    setIsPaused(false);

    const safeBase = (typeof baseCr === 'number' && !isNaN(baseCr) && baseCr > 0)
      ? baseCr
      : getPlayerBaseCr(players[currentPlayerIndex]);

    currentBidRef.current = safeBase;
    activeBidderRef.current = null;
    
    const initialPassed = teamsRef.current.filter(t => isTeamFull(t.id)).map(t => t.id);
    passedTeamIdsRef.current = initialPassed;

    setCurrentBid(safeBase);
    setActiveBidder(null);
    setCustomBidInput('');
    setPassedTeamIds(initialPassed);
    setSoldStatus(null);
    setWinningBidder(null);
    setWinningPrice(0);
    const pName = players[currentPlayerIndex]?.name || 'Player';
    setCommentary([`📢 ${pName} is on the block! Base Price: ₹${safeBase} Cr`]);

    setCountdown(bidTimer);
    let timeLeft = bidTimer;
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        setCountdown(null);
        handleAuctionTimeout();
      }
    }, 1000);

    if (isSoloMode || isHost) {
      scheduleAIThinking(safeBase, null, initialPassed);
      if (players[currentPlayerIndex]) {
        triggerAICommentaryOnPlayer(players[currentPlayerIndex]);
      }
    }
  }

  // SCHEDULE AI to think about making a bid during the active countdown
  function scheduleAIThinking(bidVal, activeBidderObj, passedList) {
    if (aiThinkingTimerRef.current) clearTimeout(aiThinkingTimerRef.current);

    const isHumanPassed = passedList.includes(humanId);

    // AI bids faster if human has passed to minimize waiting, otherwise natural pace
    const delay = isHumanPassed
      ? Math.floor(Math.random() * 500) + 600    // 0.6s - 1.1s
      : Math.floor(Math.random() * 1000) + 1800; // 1.8s - 2.8s

    setAiThinking(true);

    aiThinkingTimerRef.current = setTimeout(() => {
      setAiThinking(false);
      runAIBiddingDecision(bidVal, activeBidderObj, passedList);
    }, delay);
  }

  // AI BIDDING DECISION ENGINE triggered while timer ticks
  function runAIBiddingDecision(bidVal, activeBidderObj, passedList) {
    const currentTeams = teamsRef.current;
    const activeTeamsCount = currentTeams.filter(t => !passedList.includes(t.id) && t.budget >= 0.2 && !isTeamFull(t.id)).length;

    // If only one team is left active and they hold the current bid, let the timer tick down
    if (activeTeamsCount <= 1 && activeBidderObj) {
      return;
    }

    if (activeTeamsCount === 0 && !activeBidderObj) {
      return;
    }

    const candidates = [];
    const updatedPassed = [...passedList];
    const playerOnBlock = players[currentPlayerIndex];
    if (!playerOnBlock) return;

    const safeBase = getPlayerBaseCr(playerOnBlock);
    const safeBidVal = (typeof bidVal === 'number' && !isNaN(bidVal) && bidVal > 0) ? bidVal : safeBase;

    for (const t of currentTeams) {
      if (t.isAi && t.id !== activeBidderObj?.id && !updatedPassed.includes(t.id)) {
        if (t.budget < 0.2 || isTeamFull(t.id)) {
          updatedPassed.push(t.id);
          continue;
        }

        const bid = getAIBid(t, playerOnBlock, safeBidVal, currentTeams, soldPlayers, maxTeamSize, players, currentPlayerIndex);
        const isHigherOrOpening = (!activeBidderObj && bid >= safeBidVal) || (bid > safeBidVal);
        if (bid !== null && !isNaN(bid) && isHigherOrOpening && bid <= t.budget) {
          candidates.push({ team: t, bid: bid });
        } else {
          updatedPassed.push(t.id);
          addCommentary(`🛡️ ${t.name} passed`);
        }
      }
    }

    setPassedTeamIds(updatedPassed);
    passedTeamIdsRef.current = updatedPassed;

    if (candidates.length > 0) {
      // Pick a random candidate team from those who chose to bid
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      const newBid = chosen.bid;

      addCommentary(`🤖 ${chosen.team.name} bids ₹${newBid} Cr`);
      placeBid(newBid, chosen.team);
    } else if (!activeBidderObj && updatedPassed.length >= currentTeams.length) {
      // ALL teams have skipped/passed and no bids were placed — skip player
      addCommentary(`⏭ All teams skipped ${playerOnBlock.name}!`);
      clearAllTimers();
      handleUnsoldAuto();
    }
  }

  // REGISTER a bid (User or AI) and reset the timer back to full 8 seconds
  function placeBid(newBid, bidderTeam) {
    const safeBid = (typeof newBid === 'number' && !isNaN(newBid) && newBid > 0)
      ? newBid
      : getPlayerBaseCr(player);
    currentBidRef.current = safeBid;
    activeBidderRef.current = bidderTeam;
    setCurrentBid(safeBid);
    setActiveBidder(bidderTeam);

    // Clear active ticking and thinking
    clearAllTimers();

    syncAuctionState('bid', safeBid, bidderTeam.id);

    // Trigger visual sound / flash effect
    const bidPanel = document.querySelector('.bid-glow-panel');
    if (bidPanel) {
      bidPanel.style.transform = 'scale(1.03)';
      setTimeout(() => {
        bidPanel.style.transform = 'scale(1)';
      }, 200);
    }

    // Reset countdown back to bidTimer seconds
    setCountdown(bidTimer);
    let timeLeft = bidTimer;
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        setCountdown(null);
        handleAuctionTimeout();
      }
    }, 1000);

    // Continue the AI bidding engine
    if (isSoloMode || isHost) {
      scheduleAIThinking(newBid, bidderTeam, passedTeamIdsRef.current);

      // AI chat commentary chance on bid placements
      if (Math.random() < 0.25) {
        const isHuman = bidderTeam.id === humanId;
        let comment = "";
        if (isHuman) {
          const comments = [
            `Going strong, CSK!`,
            `Not letting you have him that easily!`,
            `A challenge? Let's see!`,
            `You really want him, don't you?`,
            `A bold bid.`
          ];
          comment = comments[Math.floor(Math.random() * comments.length)];
        } else {
          const comments = [
            `We want ${player.name}!`,
            `Bidding continues!`,
            `Not backing down.`,
            `Making our move.`,
            `We are in for the fight!`
          ];
          comment = comments[Math.floor(Math.random() * comments.length)];
        }
        triggerAIChat(comment, 1500);
      }
    }
  }

  // TIMEOUT HANDLER when countdown reaches 0s
  function handleAuctionTimeout() {
    clearAllTimers();
    const finalBid = currentBidRef.current;
    const finalBidder = activeBidderRef.current;

    if (finalBidder) {
      handleSoldAuto(finalBid, finalBidder);
    } else {
      handleUnsoldAuto();
    }
  }

  function handleSoldAuto(bidVal, bidderObj) {
    addCommentary(`🔨 SOLD! ${player.name} goes to ${bidderObj.name} for ₹${bidVal} Cr`);

    const bidPanel = document.querySelector('.bid-glow-panel');
    if (bidPanel) {
      bidPanel.style.backgroundColor = 'rgba(0, 200, 83, 0.35)';
      setTimeout(() => {
        bidPanel.style.backgroundColor = 'rgba(54, 52, 55, 0.4)';
      }, 500);
    }

    syncAuctionState('sold', bidVal, bidderObj.id);

    // Trigger Congratulations Modal State
    setWinningBidder(bidderObj);
    setWinningPrice(bidVal);
    setSoldStatus('sold');

    // Trigger AI reaction comment on sold
    if (isSoloMode) {
      const isHuman = bidderObj.id === humanId;
      let comment = "";
      if (isHuman) {
        const comments = [
          `Congratulations! That's a good buy.`,
          `Overpaid slightly, but ${player.name} is worth it.`,
          `Nice buy, CSK! He'll fit well.`,
          `A solid addition to your squad, congrats!`,
          `You got him cheap, great business!`
        ];
        comment = comments[Math.floor(Math.random() * comments.length)];
      } else {
        const comments = [
          `Yes! Glad we secured ${player.name}.`,
          `A great addition to our squad!`,
          `He fits perfectly into our team plans.`,
          `Budget well spent, extremely happy!`,
          `We got our target player!`
        ];
        comment = comments[Math.floor(Math.random() * comments.length)];
        if (Math.random() > 0.5) {
          const otherComments = [
            `Congrats to ${bidderObj.name}, good signing.`,
            `A bit overpriced, but a strong player.`,
            `${bidderObj.name} is building a strong squad!`,
            `We missed out on a good one, congrats.`
          ];
          comment = otherComments[Math.floor(Math.random() * otherComments.length)];
        }
      }
      triggerAIChat(comment, 1000);
    }
  }

  function handleUnsoldAuto() {
    addCommentary(`❌ UNSOLD! ${player.name} went unsold`);

    const bidPanel = document.querySelector('.bid-glow-panel');
    if (bidPanel) {
      bidPanel.style.backgroundColor = 'rgba(239, 68, 68, 0.35)';
      setTimeout(() => {
        bidPanel.style.backgroundColor = 'rgba(54, 52, 55, 0.4)';
      }, 500);
    }

    syncAuctionState('unsold', currentBidRef.current, null);

    // Trigger Unsold Modal State
    setWinningBidder(null);
    setWinningPrice(0);
    setSoldStatus('unsold');

    // Trigger AI reaction comment on unsold
    if (isSoloMode) {
      const comments = [
        `Surprised nobody wanted ${player.name}.`,
        `His base price was a bit high.`,
        `Decent player, but too risky at that price.`,
        `We might look at him in the accelerated round later.`,
        `Passed on this one, saving budget.`
      ];
      const comment = comments[Math.floor(Math.random() * comments.length)];
      triggerAIChat(comment, 1000);
    }
  }



  // Executed to proceed to the next player card
  async function handleProceedNext() {
    const status = soldStatusRef.current;
    const bidder = winningBidderRef.current;
    const price = winningPriceRef.current;

    setSoldStatus(null);
    setWinningBidder(null);
    setWinningPrice(0);

    if (status === 'sold' && bidder) {
      await markPlayerSold(player, bidder.id, price);
    } else {
      await markPlayerUnsold(player);
    }
  }



  function handleHumanBid() {
    if (isPaused) return;
    if (!humanId) return;
    if (passedTeamIdsRef.current.includes(humanId)) return;
    if (isTeamFull(humanId)) {
      alert("Your team roster is FULL! Cannot place more bids.");
      return;
    }

    const newBid = nextBidVal;

    if (newBid > (humanTeam?.budget || 0)) {
      alert(`Insufficient funds! Your team only has ₹${humanTeam?.budget} Cr remaining.`);
      return;
    }

    addCommentary(`💰 ${humanTeam?.name || 'CSK'} (You) bid ₹${newBid} Cr`);
    placeBid(newBid, humanTeam);
  }

  function handleHumanIncrementBid(amountCr) {
    if (isPaused) return;
    if (!humanId) return;
    if (passedTeamIdsRef.current.includes(humanId)) return;
    if (isTeamFull(humanId)) {
      alert("Your team roster is FULL! Cannot place more bids.");
      return;
    }

    const safeCurrent = (typeof currentBid === 'number' && !isNaN(currentBid) && currentBid > 0) ? currentBid : basePriceCr;
    const newBid = Number((safeCurrent + amountCr).toFixed(2));

    if (newBid > (humanTeam?.budget || 0)) {
      alert(`Insufficient funds! Your team only has ₹${humanTeam?.budget} Cr remaining.`);
      return;
    }

    addCommentary(`💰 ${humanTeam?.name || 'CSK'} (You) bid ₹${newBid} Cr`);
    placeBid(newBid, humanTeam);
  }

  function handleHumanSkip() {
    if (isPaused) return;
    if (!humanId) return;

    if (!passedTeamIdsRef.current.includes(humanId)) {
      const newPassed = [...passedTeamIdsRef.current, humanId];
      setPassedTeamIds(newPassed);
      passedTeamIdsRef.current = newPassed;
      addCommentary(`⏭ ${humanTeam?.name || 'CSK'} (You) skipped`);

      const currentTeams = teamsRef.current;
      if (!activeBidderRef.current && newPassed.length >= currentTeams.length) {
        addCommentary(`⏭ All teams skipped ${player?.name || 'player'}!`);
        clearAllTimers();
        handleUnsoldAuto();
        return;
      }

      // Schedule AI thinking since human has skipped
      if (isSoloMode || isHost) {
        scheduleAIThinking(currentBidRef.current, activeBidderRef.current, newPassed);
      }
    } else if (!activeBidder && (passedTeamIds.length >= teams.length || isHost)) {
      clearAllTimers();
      handleUnsoldAuto();
    }
  }

  const handleHumanPass = handleHumanSkip;

  // Incremental bid helper
  function handleRaiseBid(amountCr) {
    if (isPaused) return;
    if (!humanTeam) {
      alert("No human team found!");
      return;
    }
    if (isTeamFull(humanId)) {
      alert("Your team roster is FULL! Cannot place more bids.");
      return;
    }
    const safeCurrent = (typeof currentBid === 'number' && !isNaN(currentBid) && currentBid > 0) ? currentBid : basePriceCr;
    const newBid = Number((safeCurrent + amountCr).toFixed(2));
    placeBid(newBid, humanTeam);
  }

  function handleCustomBid(e) {
    e.preventDefault();
    if (isPaused) return;
    if (!humanTeam) {
      alert("No human team found!");
      return;
    }
    if (isTeamFull(humanId)) {
      alert("Your team roster is FULL! Cannot place more bids.");
      return;
    }
    const parsed = parseFloat(customBidInput);
    if (!isNaN(parsed) && parsed >= basePriceCr) {
      const newBid = Number(parsed.toFixed(2));
      placeBid(newBid, humanTeam);
    } else {
      alert(`Please enter a bid of at least the base price of ₹${basePriceCr} Cr`);
    }
  }

  function handleSelectBidder(t) {
    if (isPaused) return;
    if (roomCode && !isHost) return;
    if (isTeamFull(t.id)) {
      alert(`${t.name} roster is FULL! Cannot place more bids.`);
      return;
    }
    const safeCurrent = (typeof currentBid === 'number' && !isNaN(currentBid) && currentBid > 0) ? currentBid : basePriceCr;
    placeBid(safeCurrent, t);
  }

  function handleTogglePause() {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      if (countdown !== null && countdown > 0) {
        let timeLeft = countdown;
        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(countdownIntervalRef.current);
            setCountdown(null);
            handleAuctionTimeout();
          }
        }, 1000);

        if (isSoloMode || isHost) {
          scheduleAIThinking(currentBidRef.current, activeBidderRef.current, passedTeamIdsRef.current);
        }
      }
      syncAuctionState('resume', currentBid, activeBidder?.id, { countdown });
    } else {
      // Pause
      setIsPaused(true);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (aiThinkingTimerRef.current) clearTimeout(aiThinkingTimerRef.current);
      setAiThinking(false);
      syncAuctionState('pause', currentBid, activeBidder?.id);
    }
  }

  // Perform transaction of selling the player (manual button trigger)
  async function handleSold() {
    if (!activeBidder) {
      alert('Please select an Active Bidder from the team cards below first!');
      return;
    }

    if (currentBid > activeBidder.budget) {
      alert(`Insufficient funds! ${activeBidder.name} only has ₹${activeBidder.budget} Cr remaining.`);
      return;
    }

    clearAllTimers(); // Stop any active countdown ticking
    const bidPanel = document.querySelector('.bid-glow-panel');
    if (bidPanel) {
      bidPanel.style.backgroundColor = 'rgba(0, 200, 83, 0.3)';
      setTimeout(() => {
        bidPanel.style.backgroundColor = 'rgba(54, 52, 55, 0.4)';
      }, 400);
    }

    syncAuctionState('sold', currentBid, activeBidder.id);
    setWinningBidder(activeBidder);
    setWinningPrice(currentBid);
    setSoldStatus('sold');

    // Trigger manual sold AI reaction
    if (isSoloMode) {
      const isHuman = activeBidder.id === humanId;
      let comment = "";
      if (isHuman) {
        const comments = [
          `Congratulations! That's a good buy.`,
          `Nice buy, CSK! He'll fit well.`,
          `A solid addition to your squad, congrats!`,
          `You got him cheap, great business!`
        ];
        comment = comments[Math.floor(Math.random() * comments.length)];
      } else {
        const comments = [
          `Yes! Glad we secured ${player.name}.`,
          `A great addition to our squad!`,
          `He fits perfectly into our team plans.`,
          `We got our target player!`
        ];
        comment = comments[Math.floor(Math.random() * comments.length)];
      }
      triggerAIChat(comment, 1000);
    }
  }

  async function handleUnsold() {
    clearAllTimers(); // Stop any active countdown ticking
    const bidPanel = document.querySelector('.bid-glow-panel');
    if (bidPanel) {
      bidPanel.style.backgroundColor = 'rgba(239, 68, 68, 0.35)';
      setTimeout(() => {
        bidPanel.style.backgroundColor = 'rgba(54, 52, 55, 0.4)';
      }, 400);
    }
    syncAuctionState('unsold', currentBid, null);
    setWinningBidder(null);
    setWinningPrice(0);
    setSoldStatus('unsold');

    // Trigger manual unsold AI reaction
    if (isSoloMode) {
      const comments = [
        `Surprised nobody wanted ${player.name}.`,
        `His base price was a bit high.`,
        `Decent player, but too risky at that price.`,
        `Passed on this one, saving budget.`
      ];
      const comment = comments[Math.floor(Math.random() * comments.length)];
      triggerAIChat(comment, 1000);
    }
  }

  // Generate confetti items dynamically for the congratulations screen
  const confettiColors = ['#ff8200', '#00C853', '#60a5fa', '#f87171', '#ff9d47', '#e05a00', '#d1bfeb'];
  const confettiElements = Array.from({ length: 45 }).map((_, idx) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 4;
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const size = Math.random() * 8 + 6;
    return (
      <div
        key={idx}
        className="confetti-particle"
        style={{
          left: `${left}%`,
          animationDelay: `${delay}s`,
          backgroundColor: color,
          width: size,
          height: size,
          top: '-20px',
        }}
      />
    );
  });

  return (
    <div className="bg-background text-on-background auction-gradient min-h-screen flex flex-col font-body-md overflow-x-hidden" style={{ backgroundColor: '#141315', color: '#e6e1e5', background: 'radial-gradient(circle at center, #211437 0%, #141315 100%)' }}>
      <style>{`
        .glass-card {
          background: rgba(54, 52, 55, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gold-glow {
          box-shadow: 0 0 20px rgba(255, 130, 0, 0.2), inset 0 0 1px 0.5px rgba(255, 130, 0, 0.5);
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.01); }
        }
        .animate-bid-pulse {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .confetti-particle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: confetti-fall 4s linear infinite;
          pointer-events: none;
          z-index: 105;
        }
        @keyframes leaderSlideUp {
          0% { transform: translateY(16px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes goldGlowFlash {
          0% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); }
          40% { box-shadow: 0 0 30px rgba(255, 130, 0, 0.7), inset 0 0 15px rgba(255, 130, 0, 0.3); }
          100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 130, 0, 0.25); }
        }
      `}</style>

      <header className="bg-surface/80 backdrop-blur-xl border-b border-white/20 shadow-lg flex justify-between items-center px-4 sm:px-6 py-2 sm:py-3 w-full fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(20, 19, 21, 0.8)' }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(-1)}
            title="Go Back"
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer"
            style={{ color: '#cbc4ce' }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/play-options')}
            title="Go to Home"
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer"
            style={{ color: '#cbc4ce' }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <span className="text-secondary-fixed tracking-wider sm:tracking-widest uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>
            {breakpoint.isMobile ? 'IPL DRAFT' : 'IPL AUCTION'}
          </span>
          <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 sm:px-3 sm:py-1 rounded text-[10px] sm:text-xs font-semibold uppercase tracking-widest hidden xs:inline-block" style={{ color: '#d1bfeb' }}>
            Live Arena
          </span>
          {auctionRound === 2 ? (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm" style={{ fontFamily: "'Russo One', sans-serif" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ROUND 2 • UNSOLD
            </span>
          ) : (
            <span className="bg-white/10 text-white/70 border border-white/15 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block" style={{ fontFamily: "'Russo One', sans-serif" }}>
              ROUND 1
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* PAUSE and END buttons for desktop/tablet/laptop */}
          {isHost && !breakpoint.isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              {/* PAUSE button */}
              <button
                onClick={handleTogglePause}
                style={{
                  background: isPaused ? 'rgba(255, 130, 0, 0.15)' : 'rgba(255,255,255,0.08)',
                  border: isPaused ? '1px solid rgba(255, 130, 0, 0.4)' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  padding: '7px 16px',
                  color: isPaused ? '#ff8200' : '#ccc',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = isPaused ? 'rgba(255, 130, 0, 0.3)' : 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.color = isPaused ? '#ff8200' : '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isPaused ? 'rgba(255, 130, 0, 0.15)' : 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = isPaused ? '#ff8200' : '#ccc'
                }}
              >
                {isPaused ? '▶️ RESUME' : '⏸ PAUSE'}
              </button>

              {/* END AUCTION button */}
              <button
                onClick={() => setShowEndConfirm(true)}
                style={{
                  background: 'rgba(255,71,87,0.15)',
                  border: '1px solid rgba(255,71,87,0.4)',
                  borderRadius: 8,
                  padding: '7px 16px',
                  color: '#FF4757',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,71,87,0.3)'
                  e.currentTarget.style.borderColor = '#FF4757'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,71,87,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(255,71,87,0.4)'
                }}
              >
                🔴 END AUCTION
              </button>
            </div>
          )}

          {/* Gears menu dropdown button for mobile host */}
          {isHost && breakpoint.isMobile && (
            <div className="relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white bg-white/5 hover:bg-white/10"
              >
                <span className="text-sm">⚙️</span>
              </button>
              {showMobileMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-[#1d1b1e] border border-white/15 rounded-xl shadow-xl z-[100] p-2 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleTogglePause();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
                  >
                    {isPaused ? '▶️ RESUME AUCTION' : '⏸ PAUSE AUCTION'}
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowEndConfirm(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-[#FF4757] hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                  >
                    🔴 END AUCTION
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="text-right text-[10px] md:text-xs font-label-caps tracking-widest hidden sm:block">
            <div className="opacity-50">{auctionRound === 2 ? 'ROUND 2: UNSOLD PLAYERS' : 'PLAYERS ON THE BLOCK'}</div>
            <div className="font-bold text-secondary-fixed text-xs md:text-sm" style={{ color: '#ff8200' }}>{currentPlayerIndex + 1} / {players.length}</div>
          </div>

          {breakpoint.isMobile && (
            <div className="text-right text-[10px] font-bold" style={{ color: '#ff8200' }}>
              {auctionRound === 2 && <span className="text-amber-400 mr-1">R2</span>}
              {currentPlayerIndex + 1}/{players.length}
            </div>
          )}

          {/* Small gold crown host badge */}
          {isHost && (
            <span style={{
              fontSize: 9,
              background: '#FFD700',
              color: '#12003a',
              padding: '2px 6px',
              borderRadius: 10,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
            }}>
              👑
            </span>
          )}

          <ProfileMenu />
        </div>
      </header>

      {/* Primary Grid Area */}
      {breakpoint.isMobile ? (
        <main className="flex-grow flex flex-col pt-16 p-4 gap-4 pb-24 w-full">
          {/* Spotlight Player Card */}
          <PlayerCard player={player} countdown={countdown} bidTimer={bidTimer} />

          {/* Live Bid Board */}
          <div className="glass-card rounded-xl p-5 border border-secondary-fixed/40 bid-glow-panel gold-glow animate-bid-pulse transition-all duration-300 relative overflow-hidden flex flex-col justify-center items-center w-full" style={{ borderColor: 'rgba(255, 130, 0, 0.4)', background: 'rgba(30, 28, 32, 0.65)' }}>
            <div className="flex flex-col items-center text-center">
              <span className="text-on-surface-variant font-bold text-[10px] tracking-widest mb-1 opacity-75">CURRENT BID</span>
              <div className="text-5xl font-bold text-[#00C853] mb-1 animate-pulse" style={{ fontFamily: "'Russo One', sans-serif" }}>₹{displayBid} Cr</div>

              {isPaused && (
                <div className="mb-2 px-3 py-1 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded-full text-[#ef4444] font-extrabold text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="text-[11px] leading-none">⏸</span>
                  AUCTION PAUSED
                </div>
              )}

              {activeBidder ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#d1bfeb]/10 border border-[#d1bfeb]/20 rounded-full">
                  {activeBidder.logo ? (
                    <img src={activeBidder.logo} alt={activeBidder.name} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeBidder.color }} />
                  )}
                  <span className="text-primary font-bold text-[10px] uppercase tracking-wider">{activeBidder.name}</span>
                </div>
              ) : (
                <div className="text-[10px] text-on-surface-variant opacity-50 uppercase tracking-widest font-bold">
                  No active bid placed
                </div>
              )}

              {isSoloMode && aiThinking && (
                <div className="mt-2 flex items-center gap-2 text-[#ff8200] text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 bg-[#ff8200] rounded-full animate-ping" />
                  🤖 AI is thinking...
                </div>
              )}

              {isSoloMode && countdown !== null && (
                <div className="mt-2 text-[#ef4444] text-[10px] font-bold uppercase tracking-wider animate-bounce">
                  ⏳ Actions: {countdown}s / {bidTimer}s
                </div>
              )}
            </div>
          </div>

          {/* Bidding Controls Panel */}
          {isSoloMode ? (
            <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col gap-3 w-full justify-center" style={{ background: 'rgba(30, 28, 32, 0.65)' }}>
              <button
                onClick={() => handleHumanIncrementBid(0.25)}
                disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || currentBid + 0.25 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                className="bg-[#ff8200] text-white hover:bg-[#ff8200]/90 disabled:opacity-40 disabled:cursor-not-allowed w-full h-12 rounded-xl font-bold flex items-center justify-center border border-[#ff8200]/30 shadow-md transition-all active:scale-95 duration-150"
                style={{ color: '#ffffff', backgroundColor: '#ff8200' }}
              >
                <span className="text-2xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+25 LAKH</span>
              </button>
              <button
                onClick={() => handleHumanIncrementBid(0.50)}
                disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || currentBid + 0.50 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                className="bg-[#ff8200] text-white hover:bg-[#ff8200]/90 disabled:opacity-40 disabled:cursor-not-allowed w-full h-12 rounded-xl font-bold flex items-center justify-center border border-[#ff8200]/30 shadow-md transition-all active:scale-95 duration-150"
                style={{ color: '#ffffff', backgroundColor: '#ff8200' }}
              >
                <span className="text-2xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+50 LAKH</span>
              </button>
              <button
                onClick={() => handleHumanIncrementBid(1.00)}
                disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || currentBid + 1.00 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                className="bg-[#ff8200] text-white hover:bg-[#ff8200]/90 disabled:opacity-40 disabled:cursor-not-allowed w-full h-12 rounded-xl font-bold flex items-center justify-center border border-[#ff8200]/30 shadow-md transition-all active:scale-95 duration-150"
                style={{ color: '#ffffff', backgroundColor: '#ff8200' }}
              >
                <span className="text-2xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+1 CRORE</span>
              </button>
              <button
                onClick={handleHumanSkip}
                disabled={isPaused || (passedTeamIds.includes(humanId) && passedTeamIds.length < teams.length && activeBidder !== null)}
                className={`w-full h-12 bg-white/10 hover:bg-white/20 border border-white/25 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 duration-150 cursor-pointer ${
                  passedTeamIds.includes(humanId) ? 'border-[#ff8200]/50 text-[#ff8200]' : ''
                }`}
              >
                <span className="text-sm leading-none">⏭</span>
                <span>{passedTeamIds.includes(humanId) ? (passedTeamIds.length >= teams.length ? 'ALL SKIPPED (NEXT)' : 'SKIPPED') : 'SKIP'}</span>
              </button>
            </div>
          ) : (
            /* Host Manual Controls for mobile */
            isHost && (
              <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col gap-3 w-full justify-center" style={{ background: 'rgba(30, 28, 32, 0.65)' }}>
                <label className="font-bold text-[10px] tracking-widest text-[#d1bfeb] opacity-80 uppercase text-center">Raise Current Bid (Admin)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button disabled={isPaused || isTeamFull(humanId)} onClick={() => handleRaiseBid(0.25)} className="h-12 bg-[#ff8200] hover:bg-[#ff8200]/90 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold flex items-center justify-center shadow-md">
                    <span className="text-xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+25L</span>
                  </button>
                  <button disabled={isPaused || isTeamFull(humanId)} onClick={() => handleRaiseBid(0.50)} className="h-12 bg-[#ff8200] hover:bg-[#ff8200]/90 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold flex items-center justify-center shadow-md">
                    <span className="text-xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+50L</span>
                  </button>
                  <button disabled={isPaused || isTeamFull(humanId)} onClick={() => handleRaiseBid(1.00)} className="h-12 bg-[#ff8200] hover:bg-[#ff8200]/90 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold flex items-center justify-center shadow-md">
                    <span className="text-xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+1 CR</span>
                  </button>
                </div>
              </div>
            )
          )}

          {/* Team cards claim/bid grid (scrolling cards 2x2 grid for mobile) */}
          {!isSoloMode && (
            <div className="glass-card rounded-xl p-4 border border-white/10 flex flex-col gap-2">
              <span className="text-[9px] font-bold tracking-widest text-on-surface-variant opacity-60 uppercase text-center">
                SELECT BIDDING TEAM (CLICK TO BID)
              </span>
              <div className={`grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto scrollbar-hide ${roomCode && !isHost ? 'opacity-90 pointer-events-none' : ''} ${isPaused ? 'opacity-50 pointer-events-none' : ''}`}>
                {teams.map(t => {
                  const isActive = activeBidder?.id === t.id;
                  const isHuman = t.isUser || t.id === humanTeamId;
                  const isFull = isTeamFull(t.id);

                  return (
                    <div
                      key={t.id}
                      onClick={() => !isFull && handleSelectBidder(t)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-300 cursor-pointer hover:scale-[1.02] ${isActive ? 'scale-105 z-10 border-[#ff8200] bg-[#ff8200]/15 gold-glow' : 'border-white/5 bg-white/5'
                        } ${isFull ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                      <div className="w-6 h-6 rounded bg-white/10 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {t.logo ? (
                          <img src={t.logo} alt={t.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[10px] text-white truncate flex items-center gap-1">
                          {t.name}
                          {isHuman && <span className="text-[7px] text-[#ff8200]">👤</span>}
                          {isFull && <span className="text-[8px] bg-[#FF4757]/20 text-[#FF4757] px-1 rounded font-black tracking-widest">FULL</span>}
                        </div>
                        <div className="font-bold text-[11px] text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif" }}>
                          ₹{t.budget} Cr
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Standings + Commentary/Chat side by side on mobile */}
          <div className="flex gap-5 w-full items-stretch">

            {/* Live Tabbed Card (Commentary & Chat) — left column */}
            <div className="flex-1 min-w-0 glass-card rounded-xl border border-white/10 flex flex-col transition-all duration-300" style={{
              minHeight: '300px',
              background: 'rgba(30, 28, 32, 0.45)',
              boxShadow: activeTab === 'chat' ? '0 8px 32px rgba(255, 130, 0, 0.05)' : 'none'
            }}>
              {/* Tabs Header */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('commentary')}
                  className={`flex-1 py-2 text-[9px] font-bold tracking-wider uppercase transition-all duration-200 border-b-2 flex items-center justify-center gap-0.5 ${activeTab === 'commentary'
                    ? 'border-[#ff8200] text-[#ff8200] bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="text-xs">🎙️</span>
                  Live
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 text-[9px] font-bold tracking-wider uppercase transition-all duration-200 border-b-2 flex items-center justify-center gap-0.5 relative ${activeTab === 'chat'
                    ? 'border-[#ff8200] text-[#ff8200] bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="text-xs">💬</span>
                  Chat
                  {unreadChats > 0 && activeTab !== 'chat' && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] animate-pulse">
                      {unreadChats}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab content */}
              {activeTab === 'commentary' ? (
                <div className="flex-grow p-2.5 overflow-y-auto scrollbar-hide text-[9px] flex flex-col gap-1.5">
                  {commentary.length > 0 ? (
                    commentary.map((log, i) => (
                      <div key={i} className={`py-1 border-b border-white/5 last:border-0 font-semibold leading-relaxed transition-all ${i === 0 ? 'text-[#ff8200] text-[10px]' : 'text-on-surface-variant opacity-60'}`}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-white/40 text-center py-4 text-[9px]">No commentary yet</div>
                  )}
                </div>
              ) : (
                <div className="flex-grow flex flex-col overflow-hidden p-2">
                  {/* Messages view */}
                  <div
                    className="flex-grow overflow-y-auto scrollbar-hide flex flex-col gap-1.5 mb-2 p-0.5"
                  >
                    {chatMessages.map((msg) => {
                      if (msg.isSystem) {
                        return (
                          <div key={msg.id} className="text-center text-[8px] text-[#ff8200] py-0.5 bg-[#ff8200]/5 rounded border border-[#ff8200]/10 font-medium">
                            {msg.text}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[90%] rounded-lg p-1.5 text-[9px] leading-tight ${msg.isUser
                            ? 'self-end bg-[#ff8200]/20 border border-[#ff8200]/30 text-white'
                            : 'self-start bg-white/5 border border-white/10 text-white/90'
                            }`}
                        >
                          <div className="flex items-center gap-0.5 mb-0.5 font-black text-[8px]">
                            {msg.logo && <img src={msg.logo} alt="" className="w-2 h-2 object-contain" />}
                            <span style={{ color: msg.isUser ? '#ff8200' : (msg.color || '#fff') }} className="truncate max-w-[70px]">{msg.sender}</span>
                            <span className="text-[7px] text-white/30 font-normal ml-auto shrink-0">{msg.timestamp}</span>
                          </div>
                          <div className="font-semibold break-words">{msg.text}</div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Emoji Picker Popover (Mobile) */}
                  {showEmojiPicker && (
                    <div className="bg-[#1e1c20]/95 border border-white/20 rounded-lg p-2 shadow-2xl mb-1.5 backdrop-blur-xl shrink-0">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10 text-[8px] font-bold text-[#ff8200] tracking-wider uppercase">
                        <span>🏏 EMOJI REACTIONS</span>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="text-white/50 hover:text-white text-[10px] px-1"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-0.5 max-h-[90px] overflow-y-auto">
                        {EMOJI_LIST.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              sendChatMessage(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-sm p-0.5 rounded hover:bg-white/15 flex items-center justify-center active:scale-95 cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendChatMessage(chatInput);
                      setShowEmojiPicker(false);
                    }}
                    className="flex gap-1 items-center w-full relative shrink-0"
                  >
                    <div className="relative flex-grow flex items-center min-w-0">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Message with emojis..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-2 pr-7 py-1 text-[9px] text-white placeholder-white/30 focus:outline-none focus:border-[#ff8200]/50 min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(prev => !prev)}
                        title="Add Emoji"
                        className="absolute right-1 text-xs opacity-70 hover:opacity-100 p-0.5"
                      >
                        😊
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#ff8200] hover:bg-[#ff8200]/80 text-[#141315] font-extrabold px-2 py-1 rounded-lg text-[8px] transition-all flex items-center justify-center active:scale-95 shrink-0 cursor-pointer"
                    >
                      SEND
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Live Standings Accordion — right column */}
            <div className="flex-[1.1] min-w-0">
              <LiveTeamsPanel />
            </div>

          </div>

          {/* Sticky bottom Action Controls for Mobile Host */}
          {isHost && !isSoloMode && (
            <div className="fixed bottom-0 left-0 w-full p-2 bg-[#0a0020] border-t border-white/10 z-[120] flex gap-2 justify-center shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
              <button
                onClick={handleSkipPlayer}
                className="w-28 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all"
              >
                ⏭ SKIP
              </button>
              <button
                onClick={handleTogglePause}
                className={`w-28 h-10 ${isPaused ? 'bg-[#ff8200]/25 text-[#ff8200] border border-[#ff8200]/40' : 'bg-white/10 text-white'} hover:bg-white/20 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all`}
              >
                {isPaused ? '▶️ RESUME' : '⏸ PAUSE'}
              </button>
            </div>
          )}
        </main>
      ) : (
        <main className={`flex-grow flex flex-col pt-13 sm:pt-14 px-2 sm:px-4 lg:px-6 w-full ${isSoloMode ? 'pb-20 lg:pb-20' : 'pb-24 lg:pb-24'}`}>
          <div className="w-full flex flex-col lg:flex-row gap-3 lg:gap-4 xl:gap-5 items-start flex-grow">

            {/* COLUMN 1: Player Card & Bidding Block (Top-aligned, zero empty space) */}
            <div className="w-full lg:w-[50%] xl:w-[48%] 2xl:w-[50%] shrink-0 flex flex-col gap-2.5 sm:gap-3 justify-start">

              {/* Player Card (Spotlight) */}
              <div className="w-full">
                <PlayerCard player={player} countdown={countdown} bidTimer={bidTimer} />
              </div>

              {/* Bid Board */}
              <div className="glass-card rounded-2xl p-2.5 sm:p-3 border border-[#ff8200]/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-center items-center w-full">
                <div className="flex flex-col items-center text-center">
                  <span className="text-on-surface-variant font-bold text-[9px] sm:text-[10px] tracking-widest mb-0.5 opacity-75">CURRENT BID</span>
                  <div className="text-3xl sm:text-4xl font-black text-[#00C853] mb-0.5 leading-none" style={{ fontFamily: "'Russo One', sans-serif" }}>₹{displayBid} Cr</div>

                  {isPaused && (
                    <div className="mb-1 px-2.5 py-0.5 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded-full text-[#ef4444] font-extrabold text-[9px] uppercase tracking-widest animate-pulse flex items-center gap-1">
                      <span className="text-xs leading-none">⏸</span>
                      AUCTION PAUSED
                    </div>
                  )}

                  {activeBidder ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#d1bfeb]/10 border border-[#d1bfeb]/20 rounded-full">
                      {activeBidder.logo ? (
                        <img src={activeBidder.logo} alt={activeBidder.name} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeBidder.color }} />
                      )}
                      <span className="text-primary font-bold text-xs uppercase tracking-widest">{activeBidder.name}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-on-surface-variant opacity-50 uppercase tracking-widest font-bold">
                      No active bid placed
                    </div>
                  )}

                  {isSoloMode && aiThinking && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[#ff8200] text-[11px] font-bold uppercase tracking-widest animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff8200] animate-ping" />
                      🤖 AI is thinking...
                    </div>
                  )}

                  {isSoloMode && countdown !== null && (
                    <div className="mt-1 text-[#ef4444] text-[11px] font-bold uppercase tracking-widest animate-bounce">
                      ⏳ Actions: {countdown}s / {bidTimer}s
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              {isSoloMode ? (
                <div className="glass-card rounded-2xl p-2.5 sm:p-3 border border-white/10 flex flex-col gap-2 w-full justify-center shadow-lg">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs tracking-widest text-[#d1bfeb] opacity-90 uppercase flex items-center gap-1.5">
                      <span className="text-sm">🔨</span>
                      Raise Bid
                    </label>
                    <span className="text-[10px] text-[#cbc4ce] opacity-60 font-semibold tracking-wider uppercase">Quick Increment</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 w-full">
                    <button
                      onClick={() => handleHumanIncrementBid(0.25)}
                      disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || currentBid + 0.25 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                      className="flex-1 max-w-[220px] h-11 sm:h-12 bg-gradient-to-b from-[#ff9a30] via-[#ff8200] to-[#e05a00] hover:brightness-110 text-[#141315] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black tracking-wider transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center border border-[#ff8200]/40 shadow-xl cursor-pointer"
                    >
                      <span className="text-lg sm:text-xl font-black leading-none" style={{ fontFamily: "'Russo One', sans-serif" }}>+25L</span>
                    </button>
                    <button
                      onClick={() => handleHumanIncrementBid(0.50)}
                      disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || currentBid + 0.50 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                      className="flex-1 max-w-[220px] h-11 sm:h-12 bg-gradient-to-b from-[#ff9a30] via-[#ff8200] to-[#e05a00] hover:brightness-110 text-[#141315] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black tracking-wider transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center border border-[#ff8200]/40 shadow-xl cursor-pointer"
                    >
                      <span className="text-lg sm:text-xl font-black leading-none" style={{ fontFamily: "'Russo One', sans-serif" }}>+50L</span>
                    </button>
                    <button
                      onClick={() => handleHumanIncrementBid(1.00)}
                      disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || currentBid + 1.00 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                      className="flex-1 max-w-[220px] h-11 sm:h-12 bg-gradient-to-b from-[#ff9a30] via-[#ff8200] to-[#e05a00] hover:brightness-110 text-[#141315] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black tracking-wider transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center border border-[#ff8200]/40 shadow-xl cursor-pointer"
                    >
                      <span className="text-lg sm:text-xl font-black leading-none" style={{ fontFamily: "'Russo One', sans-serif" }}>+1 CR</span>
                    </button>
                  </div>
                </div>
              ) : roomCode && !isHost ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center font-bold text-xs uppercase tracking-widest opacity-60 w-full flex items-center justify-center min-h-[70px]">
                  📣 Host is conducting the hammer draft...
                </div>
              ) : (
                /* Host Controls */
                <div className="glass-card rounded-2xl p-2.5 sm:p-3 border border-white/10 flex flex-col gap-2 w-full justify-center shadow-lg">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs tracking-widest text-[#d1bfeb] opacity-90 uppercase flex items-center gap-1.5">
                      <span className="text-sm">🔨</span>
                      Raise Bid
                    </label>
                    <span className="text-[10px] text-[#cbc4ce] opacity-60 font-semibold tracking-wider uppercase">Quick Increment</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 w-full">
                    <button disabled={isPaused || isTeamFull(humanId)} onClick={() => handleRaiseBid(0.25)} className="flex-1 max-w-[220px] h-11 sm:h-12 bg-gradient-to-b from-[#ff9a30] via-[#ff8200] to-[#e05a00] hover:brightness-110 text-[#141315] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black tracking-wider transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center border border-[#ff8200]/40 shadow-xl cursor-pointer">
                      <span className="text-lg sm:text-xl font-black leading-none text-[#141315]" style={{ fontFamily: "'Russo One', sans-serif" }}>+25L</span>
                    </button>
                    <button disabled={isPaused || isTeamFull(humanId)} onClick={() => handleRaiseBid(0.50)} className="flex-1 max-w-[220px] h-11 sm:h-12 bg-gradient-to-b from-[#ff9a30] via-[#ff8200] to-[#e05a00] hover:brightness-110 text-[#141315] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black tracking-wider transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center border border-[#ff8200]/40 shadow-xl cursor-pointer">
                      <span className="text-lg sm:text-xl font-black leading-none text-[#141315]" style={{ fontFamily: "'Russo One', sans-serif" }}>+50L</span>
                    </button>
                    <button disabled={isPaused || isTeamFull(humanId)} onClick={() => handleRaiseBid(1.00)} className="flex-1 max-w-[220px] h-11 sm:h-12 bg-gradient-to-b from-[#ff9a30] via-[#ff8200] to-[#e05a00] hover:brightness-110 text-[#141315] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black tracking-wider transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center border border-[#ff8200]/40 shadow-xl cursor-pointer">
                      <span className="text-lg sm:text-xl font-black leading-none text-[#141315]" style={{ fontFamily: "'Russo One', sans-serif" }}>+1 CR</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: 2 Balanced Columns side-by-side (Commentary & Live Standings) */}
            <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-2 justify-between flex-grow">
              {/* Panels row: Commentary + Live Standings side by side */}
              <div className="flex flex-col md:flex-row gap-3 lg:gap-4 items-stretch w-full min-h-[380px] md:h-[480px] lg:h-[500px] xl:h-[540px]">

                {/* COLUMN 2: Live Tabbed Card (Commentary & Chat) */}
                <div className="w-full md:w-1/2 lg:flex-1 min-w-0 glass-card rounded-2xl border border-white/10 flex flex-col overflow-hidden transition-all duration-300 shadow-2xl h-full min-h-0" style={{
                  background: 'rgba(30, 28, 32, 0.55)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: activeTab === 'chat' ? '0 12px 40px rgba(255, 130, 0, 0.08)' : '0 8px 32px rgba(0,0,0,0.3)',
                }}>
                  {/* Tabs Header */}
                  <div className="flex border-b border-white/10 shrink-0">
                    <button
                      onClick={() => setActiveTab('commentary')}
                      className={`flex-grow py-3.5 text-xs sm:text-sm font-black tracking-widest uppercase transition-all duration-200 border-b-2 flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'commentary'
                        ? 'border-[#ff8200] text-[#ff8200] bg-white/5'
                        : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <span className="text-lg sm:text-xl">🎙️</span>
                      COMMENTARY
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`flex-grow py-3.5 text-xs sm:text-sm font-black tracking-widest uppercase transition-all duration-200 border-b-2 flex items-center justify-center gap-2 relative cursor-pointer ${activeTab === 'chat'
                        ? 'border-[#ff8200] text-[#ff8200] bg-white/5'
                        : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <span className="text-lg sm:text-xl">💬</span>
                      TEAM CHAT
                      {unreadChats > 0 && activeTab !== 'chat' && (
                        <span className="absolute top-2 right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black animate-pulse">
                          {unreadChats}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Tab content */}
                  {activeTab === 'commentary' ? (
                    <div className="flex-grow min-h-0 p-4 sm:p-5 overflow-y-auto text-sm sm:text-base flex flex-col gap-3">
                      {commentary.length > 0 ? (
                        commentary.map((log, i) => (
                          <div key={i} className={`py-2 border-b border-white/5 last:border-0 leading-relaxed font-bold transition-all ${i === 0 ? 'text-[#ff8200] text-base sm:text-lg scale-100' : 'text-on-surface-variant opacity-75'}`}>
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-white/40 text-center py-10 text-sm">No commentary yet</div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-grow min-h-0 flex flex-col overflow-hidden p-3.5 sm:p-4">
                      {/* Messages view */}
                      <div className="flex-grow min-h-0 overflow-y-auto flex flex-col gap-3 mb-3 p-1">
                        {chatMessages.map((msg) => {
                          if (msg.isSystem) {
                            return (
                              <div key={msg.id} className="text-center text-xs sm:text-sm text-[#ff8200] py-1.5 px-3 bg-[#ff8200]/10 rounded-xl border border-[#ff8200]/20 font-bold tracking-wide">
                                {msg.text}
                              </div>
                            );
                          }
                          const senderColor = msg.isUser
                            ? '#ff8200'
                            : msg.sender?.includes('Kolkata') ? '#c084fc'
                            : msg.sender?.includes('Mumbai') ? '#38bdf8'
                            : msg.sender?.includes('Delhi') ? '#60a5fa'
                            : msg.sender?.includes('Gujarat') ? '#2dd4bf'
                            : msg.sender?.includes('Chennai') ? '#facc15'
                            : msg.sender?.includes('Bengaluru') || msg.sender?.includes('Punjab') ? '#f87171'
                            : msg.sender?.includes('Sunrisers') ? '#fb923c'
                            : msg.sender?.includes('Lucknow') ? '#38bdf8'
                            : msg.sender?.includes('Rajasthan') ? '#f472b6'
                            : (msg.color || '#38bdf8');

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[88%] rounded-2xl px-4 py-2.5 text-sm sm:text-base leading-relaxed transition-all ${msg.isUser
                                ? 'self-end bg-[#ff8200]/20 border border-[#ff8200]/30 text-white shadow-md shadow-[#ff8200]/5'
                                : 'self-start bg-white/[0.08] border border-white/15 text-white/95 shadow-sm'
                                }`}
                            >
                              <div className="flex items-center gap-2 mb-1 font-bold text-xs sm:text-sm tracking-wide">
                                {msg.logo && <img src={msg.logo} alt="" className="w-4 h-4 object-contain" />}
                                <span style={{ color: senderColor }}>{msg.sender}</span>
                                <span className="text-[10px] sm:text-xs text-white/50 font-normal ml-auto">{msg.timestamp}</span>
                              </div>
                              <div className="font-medium text-white/95 break-words leading-relaxed">{msg.text}</div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Emoji Picker Popover */}
                      {showEmojiPicker && (
                        <div className="bg-[#1e1c20]/95 border border-white/20 rounded-xl p-3 shadow-2xl mb-2 backdrop-blur-xl shrink-0">
                          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 text-xs font-bold text-[#ff8200] tracking-wider uppercase">
                            <span className="flex items-center gap-1.5">
                              <span className="text-sm">🏏</span> EMOJI REACTIONS
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(false)}
                              className="text-white/50 hover:text-white text-sm px-1.5 hover:bg-white/10 rounded cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="grid grid-cols-8 gap-1.5 max-h-[130px] overflow-y-auto pr-0.5">
                            {EMOJI_LIST.map((emoji, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  sendChatMessage(emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="text-xl p-1.5 rounded-lg hover:bg-white/15 hover:scale-125 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Input Bar */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendChatMessage(chatInput);
                          setShowEmojiPicker(false);
                        }}
                        className="flex gap-2 items-center w-full relative shrink-0"
                      >
                        <div className="relative flex-grow flex items-center">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Say something with emojis..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-[#ff8200]/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(prev => !prev)}
                            title="Add Emoji"
                            className={`absolute right-3 text-lg transition-all hover:scale-110 active:scale-90 cursor-pointer p-0.5 rounded ${showEmojiPicker ? 'opacity-100 scale-110' : 'opacity-70 hover:opacity-100'}`}
                          >
                            😊
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="bg-[#ff8200] hover:bg-[#ff8200]/80 text-[#141315] font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm tracking-widest transition-all flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-[#ff8200]/10 shrink-0 cursor-pointer"
                        >
                          SEND
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* COLUMN 3: Live Standings Panel */}
                <div className="w-full md:w-1/2 lg:flex-1 min-w-0 h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-0">
                  <LiveTeamsPanel />
                </div>

              </div>{/* end inner panels row */}

              {/* SKIP BUTTON — below both right panels */}
              <div className="flex justify-end items-center gap-3 w-full mt-1">
                <button
                  onClick={handleHumanSkip}
                  disabled={isPaused || (passedTeamIds.includes(humanId) && passedTeamIds.length < teams.length && activeBidder !== null)}
                  className={`w-36 sm:w-40 h-9 sm:h-10 bg-white/10 hover:bg-white/20 border border-white/25 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
                    passedTeamIds.includes(humanId) ? 'border-[#ff8200]/50 text-[#ff8200]' : ''
                  }`}
                  style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
                >
                  <span className="text-sm leading-none">⏭</span>
                  <span>{passedTeamIds.includes(humanId) ? (passedTeamIds.length >= teams.length ? 'ALL SKIPPED' : 'SKIPPED') : 'SKIP'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Franchise Team Cards Status Bottom Bar (Solo & Multiplayer) */}
          <div className="fixed bottom-0 left-0 w-full p-2 sm:p-3 z-[60] bg-[#141315]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
            <div className="w-full max-w-[1920px] mx-auto overflow-x-auto scrollbar-hide">
              <div className={`flex items-center gap-2 sm:gap-3 min-w-max px-2 sm:px-4 py-1 justify-start md:justify-center ${roomCode && !isHost ? 'opacity-95' : ''} ${isPaused ? 'opacity-50 pointer-events-none' : ''}`}>
                {teams.map(t => {
                  const isActive = activeBidder?.id === t.id;
                  const isHuman = t.isUser || t.id === humanTeamId;
                  const isFull = isTeamFull(t.id);

                  return (
                    <div
                      key={t.id}
                      onClick={() => !isSoloMode && isHost && !isFull && handleSelectBidder(t)}
                      className={`glass-card p-2 sm:p-2.5 rounded-xl border min-w-[155px] sm:min-w-[185px] flex items-center gap-2.5 text-left transition-all duration-300 flex-shrink-0 ${
                        !isSoloMode && isHost ? 'cursor-pointer hover:border-[#ff8200]/30 hover:scale-[1.03]' : 'cursor-default'
                      } ${isActive ? 'scale-105 sm:scale-105 -translate-y-1 z-10 border-[#ff8200] gold-glow bg-[#ff8200]/10' : 'border-white/10 bg-white/[0.03]'
                        } ${isHuman ? 'border-[#ff8200]/50 gold-glow' : ''} ${isFull ? 'opacity-45' : ''}`}
                      style={{
                        borderColor: isActive
                          ? '#ff8200'
                          : isHuman
                            ? 'rgba(255, 130, 0, 0.5)'
                            : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: isActive ? '0 0 16px rgba(255, 130, 0, 0.3)' : isHuman ? '0 0 12px rgba(255, 130, 0, 0.15)' : 'none'
                      }}
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                        {t.logo ? (
                          <img src={t.logo} alt={t.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color, boxShadow: `0 0 10px ${t.color}` }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider truncate" style={{ fontFamily: "'Russo One', sans-serif", color: isActive ? '#ff8200' : isHuman ? '#ff8200' : '#e6e1e5' }}>
                            {t.name}
                          </span>
                          {isHuman && (
                            <span className="bg-[#ff8200] text-black px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-wider flex-shrink-0">
                              YOU
                            </span>
                          )}
                          {isFull && (
                            <span className="bg-red-600/20 text-red-500 px-1 py-0.2 rounded text-[7px] font-bold uppercase tracking-wider flex-shrink-0">
                              FULL
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="font-stats-numeric text-xs sm:text-sm text-secondary-fixed leading-none font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ffffff' }}>
                            ₹{t.budget} Cr
                          </span>
                          <span className="text-[10px] font-bold" style={{ color: isFull ? '#ef4444' : '#cbc4ce' }}>
                            {isFull ? 'FULL' : `${getTeamRosterSize(t.id)}/${maxTeamSize}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}



      {/* Congratulations Modal Overlay */}
      {soldStatus && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 8, 12, 0.85)',
          backdropFilter: 'blur(16px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {soldStatus === 'sold' && confettiElements}

          <div className="glass-card rounded-3xl p-5 sm:p-8 max-w-lg w-[92%] sm:w-full text-center relative border-2" style={{
            borderColor: soldStatus === 'sold' ? '#ff8200' : 'rgba(239, 68, 68, 0.4)',
            boxShadow: soldStatus === 'sold'
              ? '0 0 50px rgba(255, 130, 0, 0.25), inset 0 0 20px rgba(255, 130, 0, 0.1)'
              : '0 0 50px rgba(239, 68, 68, 0.15)',
            background: 'linear-gradient(135deg, #251b35 0%, #151318 100%)',
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>

            {soldStatus === 'sold' ? (
              <>
                {/* SOLD Congratulatory Screen */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                  <span className="text-4xl sm:text-5xl text-[#00C853]">🏆</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-[#ff8200] mb-1 tracking-widest uppercase" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  CONGRATULATIONS!
                </h2>

                <p className="text-[#cbc4ce] text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-4 sm:mb-6">
                  Draft Deal Completed Successfully
                </p>

                {/* Player Spotlight in Modal */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10 mb-4 sm:mb-6">
                  {/* Player Image Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#ff8200] shadow-lg flex-shrink-0 bg-[#0f0e10]">
                    <img
                      src={`/players/${player.name.toLowerCase().replace(/\./g, '').trim().replace(/\s+/g, '-')}.png`}
                      alt={player.name}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(player.name.toLowerCase())}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">{player.name}</h3>
                    <p className="text-[10px] sm:text-xs text-[#d1bfeb] font-bold uppercase tracking-wider mt-1">
                      {player.role} · {player.nationality}
                    </p>
                  </div>
                </div>

                {/* Selling details */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                  <div className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-widest opacity-60 font-bold">SOLD TO</div>
                  <div className="flex items-center gap-2 sm:gap-3 px-5 py-1.5 sm:px-6 sm:py-2 bg-white/5 border border-white/10 rounded-full">
                    {winningBidder?.logo ? (
                      <img src={winningBidder.logo} alt={winningBidder.name} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    ) : (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: winningBidder?.color }} />
                    )}
                    <span className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider">{winningBidder?.name}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-widest opacity-60 font-bold mt-1 sm:mt-2">FOR THE WINNING BID OF</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#00C853]" style={{ fontFamily: "'Russo One', sans-serif" }}>
                    ₹{winningPrice} Crore
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* UNSOLD Screen */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-4xl sm:text-5xl text-[#ef4444]">❌</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-[#ef4444] mb-1 tracking-widest uppercase" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  PLAYER UNSOLD
                </h2>

                <p className="text-[#cbc4ce] text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-4 sm:mb-6">
                  No Bids Placed For This Card
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10 mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#ef4444]/40 flex-shrink-0 bg-[#0f0e10]">
                    <img
                      src={`/players/${player.name.toLowerCase().replace(/\./g, '').trim().replace(/\s+/g, '-')}.png`}
                      alt={player.name}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(player.name.toLowerCase())}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{player.name}</h3>
                    <p className="text-[10px] sm:text-xs text-[#cbc4ce]/60 font-bold uppercase tracking-wider mt-1">
                      {player.role} · Base Price: ₹{basePriceCr} Cr
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Action button */}
            <button
              onClick={handleProceedNext}
              className="w-full bg-[#ff8200] text-[#141315] hover:bg-white font-extrabold uppercase py-3 sm:py-4 rounded-xl text-[10px] sm:text-xs tracking-widest transition-all duration-200 cursor-pointer shadow-lg hover:scale-[1.03] active:scale-[0.97]"
              style={{ color: '#141315', backgroundColor: '#ff8200' }}
            >
              PROCEED TO NEXT PLAYER
            </button>
          </div>
        </div>
      )}

      {/* Paused Modal Popup */}
      {isPaused && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[995]"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div className="bg-[#18161b] border border-[#ff8200]/50 shadow-[0_0_50px_rgba(255,130,0,0.25)] rounded-2xl md:rounded-3xl max-w-md w-full p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center">
            {/* Ambient background glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#ff8200]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Pause Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ff8200]/15 border-2 border-[#ff8200]/60 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(255,130,0,0.35)] animate-pulse">
              <span className="text-4xl sm:text-5xl text-[#ff8200]">⏸</span>
            </div>

            {/* Title & Tagline */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase mb-1" style={{ fontFamily: "'Russo One', sans-serif" }}>
              AUCTION PAUSED
            </h2>
            <p className="text-[#cbc4ce] text-xs sm:text-sm font-medium mb-5">
              The live bidding clock and player actions are on hold.
            </p>

            {/* Current Player Card Status */}
            {player && (
              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 mb-6 flex items-center gap-3.5 text-left">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-[#ff8200]/50 bg-[#0f0e10] flex-shrink-0">
                  <img
                    src={`/players/${player.name.toLowerCase().replace(/\./g, '').trim().replace(/\s+/g, '-')}.png`}
                    alt={player.name}
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(player.name.toLowerCase())}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-[10px] text-[#ff8200] font-bold uppercase tracking-wider">ON THE BLOCK</div>
                  <h4 className="text-white font-bold text-sm truncate">{player.name}</h4>
                  <div className="text-xs text-[#cbc4ce]/80 flex items-center gap-2 mt-0.5">
                    <span>Bid: <strong className="text-[#00C853] font-extrabold">₹{currentBid} Cr</strong></span>
                    {activeBidder && (
                      <span className="text-[11px] text-[#d1bfeb] truncate">• {activeBidder.name}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Resume Button */}
            {isHost ? (
              <button
                onClick={handleTogglePause}
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-[#ff8200] to-[#ffa500] text-[#141315] font-black text-sm sm:text-base uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_25px_rgba(255,130,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                style={{ fontFamily: "'Russo One', sans-serif" }}
              >
                <span className="text-xl">▶️</span>
                RESUME AUCTION
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#ff8200] font-bold bg-[#ff8200]/10 border border-[#ff8200]/30 rounded-xl py-3 px-4 w-full justify-center">
                <span className="animate-spin text-sm">⏳</span> Waiting for host to resume...
              </div>
            )}
          </div>
        </div>
      )}

      {/* End Auction Confirmation Modal */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}>
          <div style={{
            background: '#1a0050',
            border: '1px solid rgba(255,71,87,0.4)',
            borderRadius: 16,
            padding: breakpoint.isMobile ? '20px 24px' : '28px 32px',
            maxWidth: 380,
            width: '90%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔴</div>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 8,
            }}>
              End Auction?
            </div>
            <div style={{
              fontSize: 13,
              color: '#9980c8',
              marginBottom: 8,
              lineHeight: 1.6,
            }}>
              {players.length - currentPlayerIndex - 1} players still remaining.
              All unsold players will be marked unsold.
            </div>
            <div style={{
              fontSize: 12,
              color: '#9980c8',
              marginBottom: 24,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 8,
            }}>
              📊 {soldPlayers.length} players sold across{' '}
              {new Set(soldPlayers.map(p => p.teamId || p.team_id || p.team)).size} teams
            </div>
            <div style={{ display: 'flex', flexDirection: breakpoint.isMobile ? 'column' : 'row', gap: 10 }}>
              {/* Cancel */}
              <button
                onClick={() => setShowEndConfirm(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#ccc',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 40,
                }}
              >
                Cancel
              </button>
              {/* Confirm End */}
              <button
                onClick={handleEndAuction}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(90deg, #FF4757, #FF3CAC)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: 40,
                }}
              >
                Yes, End It 🔨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: breakpoint.isMobile ? 70 : 24,
          left: breakpoint.isMobile ? '50%' : 'auto',
          right: breakpoint.isMobile ? 'auto' : 24,
          transform: breakpoint.isMobile ? 'translateX(-50%)' : 'none',
          background: '#ff8200',
          color: '#141315',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(255, 130, 0, 0.25)',
          fontFamily: "'Russo One', sans-serif",
          fontSize: 'clamp(12px, 1.8vw, 14px)',
          letterSpacing: '0.5px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
