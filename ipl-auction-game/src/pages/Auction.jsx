import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import { supabase, isRealSupabaseConfigured } from '../lib/supabase';

import { getAIBid } from '../lib/aiBidder';
import ProfileMenu from '../components/ProfileMenu';
import PlayerCard from '../components/PlayerCard';
import LiveTeamsPanel from '../components/LiveTeamsPanel';
import LoadingScreen from '../components/LoadingScreen';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useNavLoading } from '../hooks/useNavLoading';

const EMOJI_LIST = [
  '🏏', '🏆', '🔥', '⚡', '💥', '💰', '🤑', '👏',
  '😂', '🤣', '😎', '🤫', '🤯', '🥳', '🫡', '💪',
  '🚀', '🎯', '👑', '💣', '🧤', '🧢', '🍿', '💸',
  '🤝', '🙌', '👍', '👎', '✅', '❌', '👀', '🤐'
];

export default function Auction() {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const { goBack, goHome } = useNavLoading();
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
    startRound2,
    markPlayerSold,
    markPlayerUnsold,
    roomCode,
    roomMembers,
    isHost: isHostFromCtx,
    isSoloMode,
    humanTeamId,
    soldPlayers,
    bidTimer,
    maxTeamSize,
    setMaxTeamSize
  } = useAuction();

  const isHost = !roomCode || isHostFromCtx;
  const isMultiplayer = Boolean(roomCode);
  const isSolo = isSoloMode && !isMultiplayer;

  // Get active player
  const player = players[currentPlayerIndex];

  // Bidding state variables
  const [currentBid, setCurrentBid] = useState(0);
  const [activeBidder, setActiveBidder] = useState(null);
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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState('back');
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

  const myMember = roomMembers?.find(m => m.user_id === currentUser?.id);
  const humanTeam = teams.find(t => t.isUser || t.id === humanTeamId || (myMember && t.name === myMember.team_name));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    let comments;
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
      let aiResponse;

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

  function handleConfirmLeave() {
    setShowLeaveConfirm(false);
    if (pendingLeaveAction === 'home') {
      goHome('/play-options', 'RETURNING TO HOME...', 'Saving auction room data and returning to main menu...');
      return;
    }

    const activeRoomCode = roomCode || localStorage.getItem('ipl_room_code') || sessionStorage.getItem('ipl_room_code');
    if (activeRoomCode) {
      goHome(`/lobby/${activeRoomCode}`, 'RETURNING TO LOBBY...', 'Saving auction progress & returning to room lobby...');
    } else {
      goHome('/setup', 'RETURNING TO SETUP...', 'Saving auction progress & returning to setup...');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, isSoloMode]);

  // Clean up timers on unmount (Hook 3)
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Intercept back navigation / browser popstate
  useEffect(() => {
    window.history.pushState({ inAuction: true }, '');
    const handlePopState = () => {
      window.history.pushState({ inAuction: true }, '');
      setPendingLeaveAction('back');
      setShowLeaveConfirm(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
          if (payload.senderUserId && currentUser?.id && payload.senderUserId === currentUser.id) {
            return;
          }
          handleReceivedState(payload);
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

      let lastTimestamp = 0;
      const stateInterval = setInterval(() => {
        const raw = localStorage.getItem(`ipl_mock_auction_${roomCode}`);
        if (raw) {
          const state = JSON.parse(raw);
          if (state.timestamp > lastTimestamp) {
            lastTimestamp = state.timestamp;
            if (!state.senderUserId || state.senderUserId !== currentUser?.id) {
              handleReceivedState(state);
            }

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, currentPlayerIndex, players]);

  // Early returns placed AFTER all Hook declarations to strictly satisfy Rules of Hooks
  if (authLoading) {
    return <LoadingScreen title="AUTHENTICATING..." subtitle="Connecting your profile to the live IPL Auction engine..." />;
  }
  if (playersLoading) {
    return <LoadingScreen title="LOADING PLAYERS..." subtitle="Loading official player database, base prices and stats..." />;
  }

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
  const safeCurrentBid = (typeof currentBid === 'number' && !isNaN(currentBid) && currentBid > 0) ? currentBid : basePriceCr;
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
    if (!roomCode) return;

    // Both host and participants can send 'bid' and 'skip'
    // Host sends administrative actions: sold, unsold, pause, resume, start_round_2, init_settings
    const isPlayerAction = action === 'bid' || action === 'skip';
    if (!isHost && !isPlayerAction) return;

    const payload = {
      action,
      currentBid: newBid,
      activeBidderId: bidderId,
      currentPlayerIndex,
      maxTeamSize,
      senderUserId: currentUser?.id,
      ...extraData
    };

    if (isRealSupabase()) {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'auction_update',
          payload
        });
      }
    } else {
      const state = { ...payload, timestamp: Date.now() };
      localStorage.setItem(`ipl_mock_auction_${roomCode}`, JSON.stringify(state));
    }
  }

  function handleReceivedState(payload) {
    if (payload.maxTeamSize) {
      setMaxTeamSize(payload.maxTeamSize);
    }
    if (payload.action === 'bid') {
      setIsPaused(false);
      const safeBid = Number(payload.currentBid);
      currentBidRef.current = safeBid;
      setCurrentBid(safeBid);

      const bidder = payload.activeBidderId
        ? (teamsRef.current.find(t => t.id === payload.activeBidderId || t.name === payload.bidderName) || {
            id: payload.activeBidderId,
            name: payload.bidderName || 'Unknown Team'
          })
        : null;
      activeBidderRef.current = bidder;
      setActiveBidder(bidder);

      if (bidder) {
        addCommentary(`💰 ${bidder.name} bid ₹${safeBid} Cr`);
      }

      // Visual flash
      const bidPanel = document.querySelector('.bid-glow-panel');
      if (bidPanel) {
        bidPanel.style.transform = 'scale(1.03)';
        setTimeout(() => {
          bidPanel.style.transform = 'scale(1)';
        }, 200);
      }

      // Reset local countdown timer
      clearAllTimers();
      setCountdown(bidTimer);
      let timeLeft = bidTimer;
      countdownIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownIntervalRef.current);
          setCountdown(null);
          if (!roomCode || isHost) {
            handleAuctionTimeout();
          }
        }
      }, 1000);
    } else if (payload.action === 'skip') {
      const skippedId = payload.activeBidderId;
      const teamName = payload.teamName || teamsRef.current.find(t => t.id === skippedId)?.name || 'A team';
      addCommentary(`⏭ ${teamName} passed`);
      setPassedTeamIds(prev => {
        const next = payload.passedTeamIds || (prev.includes(skippedId) ? prev : [...prev, skippedId]);
        passedTeamIdsRef.current = next;
        if (isHost) {
          if (!activeBidderRef.current && next.length >= teamsRef.current.length) {
            clearAllTimers();
            handleUnsoldAuto();
          }
        }
        return next;
      });
    } else if (payload.action === 'sold') {
      setIsPaused(false);
      clearAllTimers();
      const targetPlayerIndex = payload.currentPlayerIndex !== undefined ? payload.currentPlayerIndex : currentPlayerIndex;
      const activePlayer = players[targetPlayerIndex] || player;
      const bidder = teamsRef.current.find(t => t.id === payload.activeBidderId || t.name === payload.bidderName) || {
        id: payload.activeBidderId,
        name: payload.bidderName || 'Winning Team'
      };
      if (activePlayer && bidder) {
        setWinningBidder(bidder);
        setWinningPrice(payload.currentBid);
        setSoldStatus('sold');
        addCommentary(`🔨 SOLD! ${activePlayer.name} goes to ${bidder.name} for ₹${payload.currentBid} Cr`);
      }
    } else if (payload.action === 'unsold') {
      setIsPaused(false);
      clearAllTimers();
      const targetPlayerIndex = payload.currentPlayerIndex !== undefined ? payload.currentPlayerIndex : currentPlayerIndex;
      const activePlayer = players[targetPlayerIndex] || player;
      setWinningBidder(null);
      setWinningPrice(0);
      setSoldStatus('unsold');
      addCommentary(`❌ UNSOLD! ${activePlayer?.name || 'Player'} went unsold`);
    } else if (payload.action === 'pause') {
      setIsPaused(true);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (aiThinkingTimerRef.current) clearTimeout(aiThinkingTimerRef.current);
      setAiThinking(false);
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
            if (!roomCode || isHost) {
              handleAuctionTimeout();
            }
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

    if (isSolo || teamsRef.current.some(t => t.isAi)) {
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

    syncAuctionState('bid', safeBid, bidderTeam.id, {
      bidderName: bidderTeam.name,
      passedTeamIds: passedTeamIdsRef.current
    });

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
        if (!roomCode || isHost) {
          handleAuctionTimeout();
        }
      }
    }, 1000);

    // Continue the AI bidding engine
    if (isSolo || teamsRef.current.some(t => t.isAi)) {
      scheduleAIThinking(newBid, bidderTeam, passedTeamIdsRef.current);

      // AI chat commentary chance on bid placements
      if (Math.random() < 0.25) {
        const isHuman = bidderTeam.id === humanId;
        let comment;
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

    syncAuctionState('sold', bidVal, bidderObj.id, { bidderName: bidderObj.name });

    // Trigger Congratulations Modal State
    setWinningBidder(bidderObj);
    setWinningPrice(bidVal);
    setSoldStatus('sold');

    // Trigger AI reaction comment on sold
    if (isSolo) {
      const isHuman = bidderObj.id === humanId;
      let comment;
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
    if (isSolo) {
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

    if (isHost && roomCode && isRealSupabase()) {
      try {
        await supabase
          .from('rooms')
          .update({ current_player_index: currentPlayerIndex + 1 })
          .eq('room_code', roomCode);
      } catch (err) {
        console.warn('Failed to sync current_player_index to rooms:', err);
      }
    }
  }

  function handleHumanIncrementBid(amountCr) {
    if (isPaused) return;
    if (!humanTeam || !humanId) {
      alert("No team assigned to place bids!");
      return;
    }
    if (activeBidderRef.current?.id === humanId || (humanTeam && activeBidderRef.current?.name === humanTeam.name)) {
      // You are already the highest bidder! Cannot bid against yourself.
      return;
    }
    if (passedTeamIdsRef.current.includes(humanId)) {
      alert("You have already skipped this player!");
      return;
    }
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

    addCommentary(`💰 ${humanTeam?.name || 'Your Team'} (You) bid ₹${newBid} Cr`);
    placeBid(newBid, humanTeam);
  }

  function handleHumanSkip() {
    if (isPaused) return;
    if (!humanId) return;

    if (!passedTeamIdsRef.current.includes(humanId)) {
      const newPassed = [...passedTeamIdsRef.current, humanId];
      setPassedTeamIds(newPassed);
      passedTeamIdsRef.current = newPassed;
      addCommentary(`⏭ ${humanTeam?.name || 'Your Team'} (You) skipped`);

      if (roomCode) {
        syncAuctionState('skip', currentBidRef.current, humanId, {
          teamName: humanTeam?.name,
          passedTeamIds: newPassed
        });
      }

      const currentTeams = teamsRef.current;
      if (!activeBidderRef.current && newPassed.length >= currentTeams.length) {
        addCommentary(`⏭ All teams skipped ${player?.name || 'player'}!`);
        clearAllTimers();
        if (!roomCode || isHost) {
          handleUnsoldAuto();
        }
        return;
      }

      // Schedule AI thinking since human has skipped
      if (isSolo || teamsRef.current.some(t => t.isAi)) {
        scheduleAIThinking(currentBidRef.current, activeBidderRef.current, newPassed);
      }
    } else if (!activeBidder && (passedTeamIds.length >= teams.length || isHost)) {
      clearAllTimers();
      if (!roomCode || isHost) {
        handleUnsoldAuto();
      }
    }
  }

  // Incremental bid helper
  function handleRaiseBid(amountCr) {
    handleHumanIncrementBid(amountCr);
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

        if (isSolo || teamsRef.current.some(t => t.isAi)) {
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
    <div className="bg-[#121118] text-[#f1f5f9] h-screen w-screen overflow-hidden flex flex-col select-none relative" style={{ backgroundColor: '#121118', color: '#e6e1e5' }}>
      <style>{`
        .glass-card {
          background: #191726;
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

      <header className="h-11 sm:h-12 shrink-0 bg-[#161421] border-b border-[#2d293d] flex justify-between items-center px-3 sm:px-5 z-30">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              setPendingLeaveAction('back');
              setShowLeaveConfirm(true);
            }}
            title="Go Back"
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer"
            style={{ color: '#cbc4ce' }}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button
            onClick={() => {
              setPendingLeaveAction('home');
              setShowLeaveConfirm(true);
            }}
            title="Go to Home"
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-200 group cursor-pointer"
            style={{ color: '#cbc4ce' }}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <span className="text-secondary-fixed tracking-wider sm:tracking-widest uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(14px, 2vw, 18px)', letterSpacing: '3px' }}>
            {breakpoint.isMobile ? 'IPL DRAFT' : 'IPL AUCTION'}
          </span>
          <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest hidden xs:inline-block" style={{ color: '#d1bfeb' }}>
            Live Arena
          </span>
          {auctionRound === 2 ? (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm" style={{ fontFamily: "'Russo One', sans-serif" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ROUND 2 • UNSOLD
            </span>
          ) : (
            <span className="bg-white/10 text-white/70 border border-white/15 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider hidden sm:inline-block" style={{ fontFamily: "'Russo One', sans-serif" }}>
              ROUND 1
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* PAUSE and END buttons for desktop/tablet/laptop */}
          {isHost && !breakpoint.isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {/* PAUSE button */}
              <button
                onClick={handleTogglePause}
                style={{
                  background: isPaused ? 'rgba(255, 130, 0, 0.15)' : 'rgba(255,255,255,0.08)',
                  border: isPaused ? '1px solid rgba(255, 130, 0, 0.4)' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6,
                  padding: '5px 12px',
                  color: isPaused ? '#ff8200' : '#ccc',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
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
                  borderRadius: 6,
                  padding: '5px 12px',
                  color: '#FF4757',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
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

              {countdown !== null && (
                <div className="mt-2 text-[#ef4444] text-[10px] font-bold uppercase tracking-wider animate-bounce">
                  ⏳ Actions: {countdown}s / {bidTimer}s
                </div>
              )}
            </div>
          </div>

          {/* Bidding Controls Panel */}
          {!humanTeam ? (
            <div className="glass-card rounded-2xl p-4 border border-white/10 text-center font-bold text-xs uppercase tracking-widest text-slate-300 w-full py-4 flex items-center justify-center gap-2" style={{ background: 'rgba(30, 28, 32, 0.65)' }}>
              <span>👁️</span>
              <span>Spectating Live Draft...</span>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col gap-2.5 w-full justify-center" style={{ background: 'rgba(30, 28, 32, 0.65)' }}>
              {(activeBidder?.id === humanId || (humanTeam && activeBidder?.name === humanTeam.name)) && (
                <div className="w-full text-center py-1 px-2 rounded-lg bg-[#ff8200]/15 border border-[#ff8200]/40 text-[#ff8200] font-bold text-xs tracking-wider animate-pulse flex items-center justify-center gap-2">
                  <span>⭐</span>
                  <span>YOU HOLD HIGHEST BID (₹{currentBid} Cr)</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => handleHumanIncrementBid(0.25)}
                  disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || (humanTeam && activeBidder?.name === humanTeam.name) || currentBid + 0.25 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                  className="bg-[#ff8200] text-white hover:bg-[#ff8200]/90 disabled:opacity-40 disabled:cursor-not-allowed w-full h-12 rounded-xl font-bold flex items-center justify-center border border-[#ff8200]/30 shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
                  style={{ color: '#ffffff', backgroundColor: '#ff8200' }}
                >
                  <span className="text-xl sm:text-2xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+25L</span>
                </button>
                <button
                  onClick={() => handleHumanIncrementBid(0.50)}
                  disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || (humanTeam && activeBidder?.name === humanTeam.name) || currentBid + 0.50 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                  className="bg-[#ff8200] text-white hover:bg-[#ff8200]/90 disabled:opacity-40 disabled:cursor-not-allowed w-full h-12 rounded-xl font-bold flex items-center justify-center border border-[#ff8200]/30 shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
                  style={{ color: '#ffffff', backgroundColor: '#ff8200' }}
                >
                  <span className="text-xl sm:text-2xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+50L</span>
                </button>
                <button
                  onClick={() => handleHumanIncrementBid(1.00)}
                  disabled={isPaused || passedTeamIds.includes(humanId) || activeBidder?.id === humanId || (humanTeam && activeBidder?.name === humanTeam.name) || currentBid + 1.00 > (humanTeam?.budget || 0) || isTeamFull(humanId)}
                  className="bg-[#ff8200] text-white hover:bg-[#ff8200]/90 disabled:opacity-40 disabled:cursor-not-allowed w-full h-12 rounded-xl font-bold flex items-center justify-center border border-[#ff8200]/30 shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
                  style={{ color: '#ffffff', backgroundColor: '#ff8200' }}
                >
                  <span className="text-xl sm:text-2xl font-black" style={{ fontFamily: "'Russo One', sans-serif" }}>+1 CR</span>
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
            </div>
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
        <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col p-2 sm:p-2.5">
          <div className="w-full h-full flex flex-col lg:flex-row gap-2.5 lg:gap-3 items-stretch overflow-hidden">

            {/* COLUMN 1: Live Tabbed Card (Commentary & Team Chat) — left column */}
            <div className="order-2 lg:order-1 flex-1 h-full min-w-0 rounded-xl border border-white/15 flex flex-col overflow-hidden shadow-2xl" style={{
              background: 'linear-gradient(145deg, #1d1a29 0%, #13111c 100%)',
            }}>
              {/* Tabs Header */}
              <div className="flex border-b border-white/10 shrink-0 h-11">
                <button
                  onClick={() => setActiveTab('commentary')}
                  className={`flex-grow py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'commentary'
                    ? 'border-[#ff8200] text-[#ff8200] bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span>🎙️</span>
                  <span>COMMENTARY</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-grow py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 border-b-2 flex items-center justify-center gap-1.5 relative cursor-pointer ${activeTab === 'chat'
                    ? 'border-[#ff8200] text-[#ff8200] bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span>💬</span>
                  <span>TEAM CHAT</span>
                  {unreadChats > 0 && activeTab !== 'chat' && (
                    <span className="absolute top-1.5 right-3 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold animate-pulse">
                      {unreadChats}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab content */}
              {activeTab === 'commentary' ? (
                <div className="flex-grow min-h-0 p-3 sm:p-4 overflow-y-auto text-xs flex flex-col gap-2 scrollbar-hide">
                  {commentary.length > 0 ? (
                    commentary.map((log, i) => (
                      <div key={i} className={`py-1.5 border-b border-white/5 last:border-0 leading-relaxed font-semibold transition-all ${i === 0 ? 'text-[#ff8200] text-sm' : 'text-slate-300'}`}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-center py-8 text-xs">No commentary yet</div>
                  )}
                </div>
              ) : (
                <div className="flex-grow min-h-0 flex flex-col overflow-hidden p-3">
                  {/* Messages view */}
                  <div className="flex-grow min-h-0 overflow-y-auto flex flex-col gap-2 mb-2 p-1 scrollbar-hide">
                    {chatMessages.map((msg) => {
                      if (msg.isSystem) {
                        return (
                          <div key={msg.id} className="text-center text-xs text-[#ff8200] py-1 px-2.5 bg-[#ff8200]/10 rounded-lg border border-[#ff8200]/20 font-semibold tracking-wide">
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
                          className={`flex flex-col max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed transition-all ${msg.isUser
                            ? 'self-end bg-[#ff8200]/20 border border-[#ff8200]/30 text-white'
                            : 'self-start bg-white/[0.08] border border-white/15 text-white/95'
                            }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 font-bold text-[11px] tracking-wide">
                            {msg.logo && <img src={msg.logo} alt="" className="w-3.5 h-3.5 object-contain" />}
                            <span style={{ color: senderColor }}>{msg.sender}</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-auto">{msg.timestamp}</span>
                          </div>
                          <div className="font-medium text-white break-words leading-relaxed">{msg.text}</div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Emoji Picker Popover */}
                  {showEmojiPicker && (
                    <div className="bg-[#1e1c20] border border-white/20 rounded-xl p-2.5 shadow-2xl mb-2 shrink-0">
                      <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-white/10 text-xs font-bold text-[#ff8200] tracking-wider uppercase">
                        <span>🏏 EMOJI REACTIONS</span>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="text-white/50 hover:text-white text-xs px-1 hover:bg-white/10 rounded cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-1 max-h-[110px] overflow-y-auto">
                        {EMOJI_LIST.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              sendChatMessage(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-lg p-1 rounded hover:bg-white/15 transition-all flex items-center justify-center cursor-pointer active:scale-95"
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
                        className="w-full bg-[#110f18] border border-white/15 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff8200]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(prev => !prev)}
                        title="Add Emoji"
                        className="absolute right-3 text-base cursor-pointer p-0.5 rounded opacity-70 hover:opacity-100"
                      >
                        😊
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#ff8200] hover:bg-[#ff8200]/90 text-[#141315] font-bold px-3.5 py-2 rounded-xl text-xs tracking-wider transition-all active:scale-95 shrink-0 cursor-pointer"
                    >
                      SEND
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* COLUMN 2 (CENTER / MIDDLE): Player Card & Bidding Controls (Image 2) */}
            <div className="order-1 lg:order-2 w-full lg:w-[48%] xl:w-[46%] shrink-0 flex flex-col gap-2 justify-start overflow-y-auto scrollbar-hide">

              {/* Player Card (Spotlight) */}
              <div className="w-full">
                <PlayerCard player={player} countdown={countdown} bidTimer={bidTimer} />
              </div>

              {/* Bid Board - Sleek, Taller & High Impact */}
              <div className="rounded-xl p-3 sm:p-4 border border-[#ff8200]/30 transition-all duration-200 relative overflow-hidden flex items-center justify-between px-5 sm:px-6 shrink-0" style={{ background: 'linear-gradient(145deg, #1d1a29 0%, #13111c 100%)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">CURRENT BID</span>
                  <div className="text-3xl sm:text-[34px] font-normal text-[#22c55e] leading-none my-0.5" style={{ fontFamily: "'Russo One', sans-serif" }}>
                    ₹{displayBid} Cr
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {isPaused && (
                    <div className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-red-400 font-bold text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <span>⏸</span> AUCTION PAUSED
                    </div>
                  )}

                  {activeBidder ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full">
                      {activeBidder.logo ? (
                        <img src={activeBidder.logo} alt={activeBidder.name} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeBidder.color }} />
                      )}
                      <span className="text-white font-bold text-xs uppercase tracking-wider">{activeBidder.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">No active bid placed</span>
                  )}

                  {isSoloMode && aiThinking && (
                    <div className="flex items-center gap-1.5 text-[#ff8200] text-[11px] font-bold uppercase tracking-wider animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-[#ff8200] animate-ping" />
                      <span>AI Thinking...</span>
                    </div>
                  )}

                  {countdown !== null && (
                    <div className="text-red-400 text-xs font-bold uppercase tracking-wider">
                      ⏳ Timer: {countdown}s / {bidTimer}s
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Bar: +25L, +50L, +1 CR, and SKIP side-by-side (Taller, 100% visible) */}
              <div className="rounded-xl p-2 sm:p-2.5 border border-white/10 flex flex-col gap-2 w-full shrink-0" style={{ background: 'linear-gradient(145deg, #1d1a29 0%, #13111c 100%)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {!humanTeam ? (
                  <div className="text-center font-bold text-xs sm:text-sm uppercase tracking-widest text-slate-300 w-full py-2 flex items-center justify-center gap-2">
                    <span>👁️</span>
                    <span>Spectating Live Draft...</span>
                  </div>
                ) : (
                  <>
                    {(activeBidder?.id === humanId || (humanTeam && activeBidder?.name === humanTeam.name)) && (
                      <div className="w-full text-center py-1 px-2 rounded-lg bg-[#ff8200]/15 border border-[#ff8200]/40 text-[#ff8200] font-bold text-xs tracking-wider animate-pulse flex items-center justify-center gap-2">
                        <span>⭐</span>
                        <span>YOU HOLD HIGHEST BID (₹{currentBid} Cr) — WAITING FOR OTHERS</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 sm:gap-2.5 w-full">
                      <button
                        onClick={() => handleHumanIncrementBid(0.25)}
                        disabled={
                          isPaused ||
                          passedTeamIds.includes(humanId) ||
                          activeBidder?.id === humanId ||
                          (humanTeam && activeBidder?.name === humanTeam.name) ||
                          currentBid + 0.25 > (humanTeam?.budget || 0) ||
                          isTeamFull(humanId)
                        }
                        className="flex-1 h-11 sm:h-12 bg-gradient-to-r from-[#ff8200] to-[#e05a00] hover:brightness-110 text-white disabled:opacity-35 disabled:cursor-not-allowed rounded-lg font-bold text-xs sm:text-sm tracking-wider transition-all active:scale-95 flex items-center justify-center shadow-md cursor-pointer border border-[#ff8200]/40"
                      >
                        +25L
                      </button>
                      <button
                        onClick={() => handleHumanIncrementBid(0.50)}
                        disabled={
                          isPaused ||
                          passedTeamIds.includes(humanId) ||
                          activeBidder?.id === humanId ||
                          (humanTeam && activeBidder?.name === humanTeam.name) ||
                          currentBid + 0.50 > (humanTeam?.budget || 0) ||
                          isTeamFull(humanId)
                        }
                        className="flex-1 h-11 sm:h-12 bg-gradient-to-r from-[#ff8200] to-[#e05a00] hover:brightness-110 text-white disabled:opacity-35 disabled:cursor-not-allowed rounded-lg font-bold text-xs sm:text-sm tracking-wider transition-all active:scale-95 flex items-center justify-center shadow-md cursor-pointer border border-[#ff8200]/40"
                      >
                        +50L
                      </button>
                      <button
                        onClick={() => handleHumanIncrementBid(1.00)}
                        disabled={
                          isPaused ||
                          passedTeamIds.includes(humanId) ||
                          activeBidder?.id === humanId ||
                          (humanTeam && activeBidder?.name === humanTeam.name) ||
                          currentBid + 1.00 > (humanTeam?.budget || 0) ||
                          isTeamFull(humanId)
                        }
                        className="flex-1 h-11 sm:h-12 bg-gradient-to-r from-[#ff8200] to-[#e05a00] hover:brightness-110 text-white disabled:opacity-35 disabled:cursor-not-allowed rounded-lg font-bold text-xs sm:text-sm tracking-wider transition-all active:scale-95 flex items-center justify-center shadow-md cursor-pointer border border-[#ff8200]/40"
                      >
                        +1 CR
                      </button>
                      <button
                        onClick={handleHumanSkip}
                        disabled={
                          isPaused ||
                          (passedTeamIds.includes(humanId) && passedTeamIds.length < teams.length && activeBidder !== null)
                        }
                        className={`flex-1 h-11 sm:h-12 bg-white/10 hover:bg-white/20 border border-white/20 text-white disabled:opacity-35 disabled:cursor-not-allowed rounded-lg font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                          passedTeamIds.includes(humanId) ? 'border-[#ff8200] text-[#ff8200]' : ''
                        }`}
                      >
                        <span>⏭</span>
                        <span>{passedTeamIds.includes(humanId) ? 'SKIPPED' : 'SKIP'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* COLUMN 3: Live Standings Panel — right column */}
            <div className="order-3 lg:order-3 flex-1 h-full min-w-0 rounded-xl border border-white/15 flex flex-col overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(145deg, #1d1a29 0%, #13111c 100%)' }}>
              <LiveTeamsPanel />
            </div>

          </div>
        </main>
      )}

      {/* Franchise Team Cards Status Bottom Bar (Solo & Multiplayer) */}
      <div className="h-[46px] sm:h-[48px] shrink-0 w-full px-2 z-30 bg-[#161421] border-t border-[#2d293d] flex items-center shadow-lg">
        <div className="w-full max-w-[1920px] mx-auto overflow-x-auto scrollbar-hide">
          <div className={`flex items-center gap-1.5 sm:gap-2.5 min-w-max px-2 py-0.5 justify-start md:justify-center ${roomCode && !isHost ? 'opacity-95' : ''} ${isPaused ? 'opacity-50 pointer-events-none' : ''}`}>
            {teams.map(t => {
              const isActive = activeBidder?.id === t.id;
              const isHuman = t.isUser || t.id === humanTeamId;
              const isFull = isTeamFull(t.id);

              return (
                <div
                  key={t.id}
                  onClick={() => !isSoloMode && isHost && !isFull && handleSelectBidder(t)}
                  className={`glass-card p-1 sm:p-1.5 rounded-xl border min-w-[135px] sm:min-w-[155px] flex items-center gap-2 text-left transition-all duration-300 flex-shrink-0 ${
                    !isSoloMode && isHost ? 'cursor-pointer hover:border-[#ff8200]/30 hover:scale-[1.03]' : 'cursor-default'
                  } ${isActive ? 'scale-105 sm:scale-105 -translate-y-0.5 z-10 border-[#ff8200] gold-glow bg-[#ff8200]/10' : 'border-white/10 bg-white/[0.03]'
                    } ${isHuman ? 'border-[#ff8200]/50 gold-glow' : ''} ${isFull ? 'opacity-45' : ''}`}
                  style={{
                    borderColor: isActive
                      ? '#ff8200'
                      : isHuman
                        ? 'rgba(255, 130, 0, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: isActive ? '0 0 14px rgba(255, 130, 0, 0.3)' : isHuman ? '0 0 10px rgba(255, 130, 0, 0.15)' : 'none'
                  }}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                    {t.logo ? (
                      <img src={t.logo} alt={t.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[9px] sm:text-[11px] uppercase tracking-wider truncate" style={{ fontFamily: "'Russo One', sans-serif", color: isActive ? '#ff8200' : isHuman ? '#ff8200' : '#e6e1e5' }}>
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
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="font-stats-numeric text-[11px] sm:text-xs text-secondary-fixed leading-none font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ffffff' }}>
                        ₹{t.budget} Cr
                      </span>
                      <span className="text-[9px] font-bold" style={{ color: isFull ? '#ef4444' : '#cbc4ce' }}>
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

      {/* Leave / Go Back Confirmation Modal */}
      {showLeaveConfirm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div
            className="bg-[#18161b] border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] rounded-2xl sm:rounded-3xl max-w-md w-[92%] sm:w-full p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center"
            style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/15 border-2 border-amber-500/60 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-pulse">
              <span className="text-3xl sm:text-4xl text-amber-400">⚠️</span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase mb-2"
              style={{ fontFamily: "'Russo One', sans-serif" }}
            >
              Are you sure to go back?
            </h2>
            <p className="text-[#cbc4ce] text-xs sm:text-sm font-medium mb-6 leading-relaxed">
              Your live auction draft is currently in progress. If you continue, you will leave this auction session and return to the lobby.
            </p>
            <div className="flex flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff8200] hover:brightness-110 text-white font-black text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
                style={{ fontFamily: "'Russo One', sans-serif" }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Auction Confirmation Modal */}
      {showEndConfirm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div
            className="bg-[#18161b] border border-[#ff8200]/50 shadow-[0_0_50px_rgba(255,130,0,0.25)] rounded-2xl md:rounded-3xl max-w-md w-full p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center"
            style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {/* Ambient background glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#ff8200]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#ff8200]/15 border-2 border-[#ff8200]/60 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(255,130,0,0.35)] animate-pulse">
              <span className="text-3xl sm:text-4xl text-[#ff8200]">🔨</span>
            </div>

            {/* Title & Tagline */}
            <h2
              className="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase mb-1"
              style={{ fontFamily: "'Russo One', sans-serif" }}
            >
              END AUCTION?
            </h2>
            <p className="text-[#cbc4ce] text-xs sm:text-sm font-medium mb-5">
              {players.length - currentPlayerIndex - 1} players still remaining. All unsold players will be marked unsold.
            </p>

            {/* Current Player Status Card */}
            {player && (
              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 mb-3 flex items-center gap-3.5 text-left">
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

            {/* Sold Stats Badge */}
            <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 px-3.5 mb-6 text-xs text-[#cbc4ce] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>📊</span>
                <span><strong className="text-white font-bold">{soldPlayers.length}</strong> players sold</span>
              </span>
              <span className="text-white/60">
                Across <strong className="text-white font-bold">{new Set(soldPlayers.map(p => p.teamId || p.team_id || p.team)).size}</strong> teams
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3.5 px-4 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndAuction}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ff8200] to-[#ffa500] hover:brightness-110 text-[#141315] font-black text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95 cursor-pointer shadow-[0_4px_25px_rgba(255,130,0,0.4)] flex items-center justify-center gap-2"
                style={{ fontFamily: "'Russo One', sans-serif" }}
              >
                <span>🔨</span>
                <span>YES, END IT</span>
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
