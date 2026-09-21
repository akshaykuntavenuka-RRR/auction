import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isRealSupabaseConfigured } from '../lib/supabase';

import { mockPlayers, getSeededPlayers, shufflePlayers } from '../data/players';
import { loadPlayersForAuction } from '../lib/playerSync';
import { saveSoldPlayer, updateTeamBudget } from '../lib/db';

const AuctionContext = createContext();

export function AuctionProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('ipl_session_id') || null);
  const [numTeams, setNumTeams] = useState(() => Number(localStorage.getItem('ipl_num_teams')) || 6);
  const [budgetCr, setBudgetCr] = useState(() => Number(localStorage.getItem('ipl_budget_cr')) || 100);
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('ipl_teams');
    return saved ? JSON.parse(saved) : [];
  });
  const [gameMode, setGameMode] = useState(() => localStorage.getItem('ipl_game_mode') || 'solo');
  const [roomId, setRoomId] = useState(() => localStorage.getItem('ipl_room_id') || null);
  const [lobbyPlayers, setLobbyPlayers] = useState(() => {
    const saved = localStorage.getItem('ipl_lobby_players');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [roomCode, setRoomCode] = useState(() => localStorage.getItem('ipl_room_code') || '');
  const [roomMembers, setRoomMembers] = useState(() => {
    const saved = localStorage.getItem('ipl_room_members');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHost, setIsHost] = useState(() => localStorage.getItem('ipl_is_host') === 'true');

  const [isSoloMode, setIsSoloMode] = useState(() => localStorage.getItem('ipl_is_solo_mode') === 'true');
  const [humanTeamId, setHumanTeamId] = useState(() => localStorage.getItem('ipl_human_team_id') || null);
  const [aiDifficulty, setAiDifficulty] = useState(() => localStorage.getItem('ipl_ai_difficulty') || 'medium');
  const [playerOrder, setPlayerOrder] = useState(() => localStorage.getItem('ipl_player_order') || 'random');
  const [bidTimer, setBidTimer] = useState(() => Number(localStorage.getItem('ipl_bid_timer')) || 10);
  const [maxTeamSize, setMaxTeamSize] = useState(() => Number(localStorage.getItem('ipl_max_team_size')) || 11);
  const [theme, setTheme] = useState(() => localStorage.getItem('ipl_theme') || 'dark');

  // Sync theme attribute to document element
  useEffect(() => {
    localStorage.setItem('ipl_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  const [auctionRound, setAuctionRound] = useState(() => Number(localStorage.getItem('ipl_auction_round')) || 1);

  const [players, setPlayers] = useState(() => {
    const savedRound = Number(localStorage.getItem('ipl_auction_round')) || 1;
    if (savedRound === 2) {
      const savedRound2 = localStorage.getItem('ipl_round2_players');
      if (savedRound2) {
        try {
          return JSON.parse(savedRound2);
        } catch (e) {
          console.error('[AuctionContext] Failed to parse saved round 2 players:', e);
        }
      }
    }
    return mockPlayers;
  });
  const [playersLoading, setPlayersLoading] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(() => Number(localStorage.getItem('ipl_player_index')) || 0);
  const [soldPlayers, setSoldPlayers] = useState(() => {
    const saved = localStorage.getItem('ipl_sold_players');
    return saved ? JSON.parse(saved) : [];
  });
  const [unsoldPlayers, setUnsoldPlayers] = useState(() => {
    const saved = localStorage.getItem('ipl_unsold_players');
    return saved ? JSON.parse(saved) : [];
  });

  // Track user authentication status from Supabase and SessionStorage (Guest)
  useEffect(() => {
    if (!isRealSupabaseConfigured()) {
      const savedGuest = sessionStorage.getItem('ipl_guest_user');
      if (savedGuest) {
        try {
          setCurrentUser(JSON.parse(savedGuest));
        } catch (e) {
          console.error(e);
        }
      }
      setAuthLoading(false);
      return;
    }

    // Check initial Supabase session with 2s timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth getSession timeout')), 2000)
    );

    Promise.race([sessionPromise, timeoutPromise]).then(({ data }) => {
      if (data?.session) {
        setCurrentUser(data.session.user);
      } else {
        const savedGuest = sessionStorage.getItem('ipl_guest_user');
        if (savedGuest) {
          try {
            setCurrentUser(JSON.parse(savedGuest));
          } catch (e) {
            console.error(e);
          }
        }
      }
      setAuthLoading(false);
    }).catch((err) => {
      console.warn('Supabase getSession timeout or error:', err?.message || err);
      const savedGuest = sessionStorage.getItem('ipl_guest_user');
      if (savedGuest) {
        try {
          setCurrentUser(JSON.parse(savedGuest));
        } catch (e) {
          console.error(e);
        }
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser(session.user);
      } else {
        const savedGuest = sessionStorage.getItem('ipl_guest_user');
        if (savedGuest) {
          try {
            setCurrentUser(JSON.parse(savedGuest));
          } catch (e) {
            console.error(e);
          }
        } else {
          setCurrentUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  // Sync state variables to LocalStorage for full persistence on reloads
  useEffect(() => {
    if (sessionId) localStorage.setItem('ipl_session_id', sessionId);
    else localStorage.removeItem('ipl_session_id');
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('ipl_num_teams', numTeams);
  }, [numTeams]);

  useEffect(() => {
    localStorage.setItem('ipl_budget_cr', budgetCr);
  }, [budgetCr]);

  useEffect(() => {
    localStorage.setItem('ipl_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('ipl_player_index', currentPlayerIndex);
  }, [currentPlayerIndex]);

  useEffect(() => {
    localStorage.setItem('ipl_sold_players', JSON.stringify(soldPlayers));
  }, [soldPlayers]);

  useEffect(() => {
    localStorage.setItem('ipl_unsold_players', JSON.stringify(unsoldPlayers));
  }, [unsoldPlayers]);

  useEffect(() => {
    localStorage.setItem('ipl_auction_round', auctionRound);
  }, [auctionRound]);

  useEffect(() => {
    localStorage.setItem('ipl_game_mode', gameMode);
  }, [gameMode]);

  useEffect(() => {
    if (roomId) localStorage.setItem('ipl_room_id', roomId);
    else localStorage.removeItem('ipl_room_id');
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem('ipl_lobby_players', JSON.stringify(lobbyPlayers));
  }, [lobbyPlayers]);

  useEffect(() => {
    localStorage.setItem('ipl_room_code', roomCode);
  }, [roomCode]);

  useEffect(() => {
    localStorage.setItem('ipl_room_members', JSON.stringify(roomMembers));
  }, [roomMembers]);

  useEffect(() => {
    localStorage.setItem('ipl_is_host', isHost ? 'true' : 'false');
  }, [isHost]);

  useEffect(() => {
    localStorage.setItem('ipl_is_solo_mode', isSoloMode ? 'true' : 'false');
  }, [isSoloMode]);

  useEffect(() => {
    if (humanTeamId) localStorage.setItem('ipl_human_team_id', humanTeamId);
    else localStorage.removeItem('ipl_human_team_id');
  }, [humanTeamId]);

  useEffect(() => {
    localStorage.setItem('ipl_ai_difficulty', aiDifficulty);
  }, [aiDifficulty]);

  useEffect(() => {
    localStorage.setItem('ipl_player_order', playerOrder);
  }, [playerOrder]);

  useEffect(() => {
    localStorage.setItem('ipl_bid_timer', bidTimer);
  }, [bidTimer]);

  useEffect(() => {
    localStorage.setItem('ipl_max_team_size', maxTeamSize);
  }, [maxTeamSize]);


  // Helper: sort players by chosen category order
  function orderPlayers(playerList, order) {
    if (order === 'random') return [...playerList];
    const roleRank = {
      batters:       { BAT: 0, WK: 1, AR: 2, BOWL: 3 },
      wicketkeepers: { WK: 0, BAT: 1, AR: 2, BOWL: 3 },
      bowlers:       { BOWL: 0, AR: 1, BAT: 2, WK: 3 },
      allrounders:   { AR: 0, BAT: 1, WK: 2, BOWL: 3 },
    };
    const rank = roleRank[order] || {};
    return [...playerList].sort((a, b) => {
      const ra = rank[a.roleCode] ?? 4;
      const rb = rank[b.roleCode] ?? 4;
      return ra - rb;
    });
  }

  // Load players from Supabase (with local fallback) and seed using roomCode/sessionId
  useEffect(() => {
    const seed = roomCode || sessionId;
    let cancelled = false;

    async function fetchAndSeedPlayers() {
      // If we are currently in Round 2, keep the Round 2 unsold players pool
      const savedRound = Number(localStorage.getItem('ipl_auction_round')) || 1;
      if (savedRound === 2) {
        const savedRound2 = localStorage.getItem('ipl_round2_players');
        if (savedRound2) {
          try {
            setPlayers(JSON.parse(savedRound2));
            return;
          } catch (e) {
            console.error('[AuctionContext] Error loading round 2 players:', e);
          }
        }
      }

      setPlayersLoading(true);
      try {
        const allPlayers = await loadPlayersForAuction();
        if (cancelled) return;
        let ordered;
        if (seed) {
          // Seed-shuffle so all players in the same room see the same order
          let numSeed = 0;
          const seedStr = String(seed);
          for (let i = 0; i < seedStr.length; i++) numSeed += seedStr.charCodeAt(i);
          ordered = shufflePlayers(allPlayers, numSeed);
        } else {
          ordered = allPlayers;
        }
        setPlayers(orderPlayers(ordered, playerOrder));
      } catch (err) {
        console.error('[AuctionContext] Player load error:', err);
        if (!cancelled) {
          const fallback = seed ? getSeededPlayers(seed) : mockPlayers;
          setPlayers(orderPlayers(fallback, playerOrder));
        }
      } finally {
        if (!cancelled) setPlayersLoading(false);
      }
    }

    fetchAndSeedPlayers();
    return () => { cancelled = true; };
  }, [sessionId, roomCode, playerOrder]);

  // Guest / Local sign in helper
  const signInAsGuest = (username, provider = 'guest', customEmail = null) => {
    const isGoogle = provider === 'google';
    const finalEmail = customEmail && customEmail.trim()
      ? customEmail.trim()
      : `${username ? username.toLowerCase().replace(/[^a-z0-9]/g, '') : (isGoogle ? 'googleuser' : 'guest')}@gmail.com`;

    const fullName = username && username.trim() 
      ? username.trim() 
      : (customEmail ? customEmail.split('@')[0] : (isGoogle ? 'Google User' : 'Guest Owner'));

    const guestUser = {
      id: (isGoogle ? 'google-' : 'guest-') + Date.now(),
      email: finalEmail,
      user_metadata: {
        full_name: fullName,
        avatar_url: isGoogle 
          ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=4285F4&textColor=ffffff` 
          : null,
        provider: provider
      },
      role: 'authenticated'
    };
    sessionStorage.setItem('ipl_guest_user', JSON.stringify(guestUser));
    setCurrentUser(guestUser);
    return guestUser;
  };



  const logout = async () => {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    sessionStorage.removeItem('ipl_guest_user');
    localStorage.removeItem('ipl_guest_user');
    setCurrentUser(null);
    resetAuction();
  };


  // Reset helper
  const resetAuction = () => {
    setSessionId(null);
    setTeams([]);
    setCurrentPlayerIndex(0);
    setSoldPlayers([]);
    setUnsoldPlayers([]);
    setAuctionRound(1);
    setGameMode('solo');
    setRoomId(null);
    setLobbyPlayers([]);
    setRoomCode('');
    setRoomMembers([]);
    setIsHost(false);
    setIsSoloMode(false);
    setHumanTeamId(null);
    setAiDifficulty('medium');
    setPlayerOrder('random');
    setBidTimer(10);
    setMaxTeamSize(11);

    localStorage.removeItem('ipl_session_id');
    localStorage.removeItem('ipl_num_teams');
    localStorage.removeItem('ipl_budget_cr');
    localStorage.removeItem('ipl_teams');
    localStorage.removeItem('ipl_player_index');
    localStorage.removeItem('ipl_sold_players');
    localStorage.removeItem('ipl_unsold_players');
    localStorage.removeItem('ipl_auction_round');
    localStorage.removeItem('ipl_round2_players');
    localStorage.removeItem('ipl_game_mode');
    localStorage.removeItem('ipl_room_id');
    localStorage.removeItem('ipl_lobby_players');
    localStorage.removeItem('ipl_room_code');
    localStorage.removeItem('ipl_room_members');
    localStorage.removeItem('ipl_is_host');
    localStorage.removeItem('ipl_is_solo_mode');
    localStorage.removeItem('ipl_human_team_id');
    localStorage.removeItem('ipl_ai_difficulty');
    localStorage.removeItem('ipl_player_order');
    localStorage.removeItem('ipl_bid_timer');
    localStorage.removeItem('ipl_max_team_size');
  };

  // Start Round 2 for all unsold players
  const startRound2 = (customUnsoldList) => {
    const listToUse = (customUnsoldList && customUnsoldList.length > 0)
      ? customUnsoldList
      : unsoldPlayers;

    if (!listToUse || listToUse.length === 0) return false;

    const round2List = [...listToUse];
    setPlayers(round2List);
    setUnsoldPlayers([]);
    setCurrentPlayerIndex(0);
    setAuctionRound(2);

    localStorage.setItem('ipl_auction_round', '2');
    localStorage.setItem('ipl_round2_players', JSON.stringify(round2List));
    localStorage.setItem('ipl_unsold_players', JSON.stringify([]));
    localStorage.setItem('ipl_player_index', '0');

    return true;
  };

  // Mark a player as sold to a team
  const markPlayerSold = async (player, teamId, price) => {
    // 1. Calculate and update budget locally
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return { ...t, budget: Math.max(0, Number((t.budget - price).toFixed(2))) };
      }
      return t;
    });
    setTeams(updatedTeams);

    // 2. Append player to sold roster
    const newSoldEntry = {
      player: player,
      team_id: teamId,
      sold_for: price
    };
    setSoldPlayers(prev => [...prev, newSoldEntry]);

    // 3. Propagate updates to Supabase backend in parallel if session is active
    if (sessionId && isRealSupabaseConfigured() && !sessionId.startsWith('local') && !sessionId.startsWith('fallback')) {

      try {
        const teamObj = updatedTeams.find(t => t.id === teamId);
        if (teamObj) {
          await Promise.all([
            saveSoldPlayer(sessionId, teamId, player, price),
            updateTeamBudget(teamId, teamObj.budget)
          ]);
        }
      } catch (err) {
        console.info('Note: Could not sync sold player to remote Supabase:', err?.message || err);
      }
    }

    // 4. Advance player focus
    setCurrentPlayerIndex(prev => prev + 1);
  };

  // Mark a player as unsold
  const markPlayerUnsold = async (player) => {
    // Add to unsold players list
    setUnsoldPlayers(prev => [...prev, player]);

    // Advance player focus
    setCurrentPlayerIndex(prev => prev + 1);
  };

  return (
    <AuctionContext.Provider value={{
      currentUser,
      setCurrentUser,
      authLoading,
      sessionId,
      setSessionId,
      signInAsGuest,
      logout,
      numTeams,
      setNumTeams,
      budgetCr,
      setBudgetCr,
      teams,
      setTeams,
      players,
      setPlayers,
      playersLoading,
      currentPlayerIndex,
      setCurrentPlayerIndex,
      soldPlayers,
      setSoldPlayers,
      unsoldPlayers,
      setUnsoldPlayers,
      auctionRound,
      setAuctionRound,
      startRound2,
      markPlayerSold,
      markPlayerUnsold,
      resetAuction,
      logout,
      signInAsGuest,
      gameMode,
      setGameMode,
      roomId,
      setRoomId,
      lobbyPlayers,
      setLobbyPlayers,
      roomCode,
      setRoomCode,
      roomMembers,
      setRoomMembers,
      isHost,
      setIsHost,
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
      setMaxTeamSize,
      theme,
      setTheme
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  return useContext(AuctionContext);
}
