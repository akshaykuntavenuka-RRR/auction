/**
 * Game History Storage & Analytics Manager
 * Tracks how many times the user has played the auction game,
 * along with detailed summaries of each game played.
 */

const STORAGE_KEY = 'ipl_auction_game_history';

/**
 * Retrieve all saved games for the current user
 * @param {string} userId - Optional user identifier
 * @returns {Array} Array of game history items, newest first
 */
export function getGameHistory(userId = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    if (!Array.isArray(all)) return [];
    
    // If userId provided, filter by user or include universal/guest items
    if (userId) {
      return all.filter(item => !item.userId || item.userId === userId);
    }
    return all;
  } catch (err) {
    console.warn('Failed to read game history:', err);
    return [];
  }
}

/**
 * Save a completed game to history
 * @param {Object} game - Game summary data
 * @param {string} userId - Current user ID
 * @returns {Array} Updated game history
 */
export function saveGameHistory(game, userId = null) {
  try {
    const existing = getGameHistory();
    
    // Prevent duplicate saves within the same minute for the same session
    if (game.sessionId && existing.some(item => item.sessionId === game.sessionId)) {
      return existing;
    }

    const newRecord = {
      id: game.id || `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: game.sessionId || `session_${Date.now()}`,
      userId: userId || game.userId || 'guest',
      userName: game.userName || 'Franchise Owner',
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      mode: game.mode || 'Solo vs AI', // 'Solo vs AI' | 'Multiplayer'
      difficulty: game.difficulty || 'medium',
      roomCode: game.roomCode || null,
      teamName: game.teamName || 'My Franchise',
      teamColor: game.teamColor || '#ff8200',
      rank: game.rank || 1,
      totalTeams: game.totalTeams || 6,
      resultTitle: game.resultTitle || 'Auction Completed',
      initialBudgetCr: game.initialBudgetCr || 100,
      spentCr: Number((game.spentCr || 0).toFixed(2)),
      remainingCr: Number((game.remainingCr || 0).toFixed(2)),
      playersCount: game.playersCount || (game.squad ? game.squad.length : 0),
      squad: Array.isArray(game.squad) ? game.squad : [],
      topPlayer: game.topPlayer || null,
      teamsLeaderboard: Array.isArray(game.teamsLeaderboard) ? game.teamsLeaderboard : [],
    };

    const updated = [newRecord, ...existing].slice(0, 50); // Keep last 50 games
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save game history:', err);
    return getGameHistory();
  }
}

/**
 * Calculate comprehensive career stats from game history
 * @param {string} userId - Optional user ID
 * @returns {Object} Career statistics summary
 */
export function getGameHistoryStats(userId = null) {
  const history = getGameHistory(userId);
  const totalPlayed = history.length;

  if (totalPlayed === 0) {
    return {
      totalPlayed: 0,
      soloPlayed: 0,
      multiplayerPlayed: 0,
      wins: 0,
      winRate: 0,
      totalSpentCr: 0,
      avgSpentCr: 0,
      totalPlayersDrafted: 0,
      recordBuy: null,
      mostPlayedTeam: null,
    };
  }

  let soloPlayed = 0;
  let multiplayerPlayed = 0;
  let wins = 0;
  let totalSpent = 0;
  let totalPlayers = 0;
  let recordBuy = null;
  const teamFrequency = {};

  history.forEach(game => {
    if (game.mode === 'Multiplayer') {
      multiplayerPlayed++;
    } else {
      soloPlayed++;
    }

    if (game.rank === 1) {
      wins++;
    }

    totalSpent += Number(game.spentCr) || 0;
    totalPlayers += Number(game.playersCount) || 0;

    if (game.teamName) {
      teamFrequency[game.teamName] = (teamFrequency[game.teamName] || 0) + 1;
    }

    if (Array.isArray(game.squad)) {
      game.squad.forEach(player => {
        const cost = Number(player.sold_for) || 0;
        if (!recordBuy || cost > recordBuy.cost) {
          recordBuy = {
            name: player.name || player.player_name || 'Star Player',
            cost,
            ipl: player.ipl || player.team || 'IPL',
            role: player.role || 'Player',
            matchDate: game.dateFormatted,
          };
        }
      });
    }
  });

  let mostPlayedTeam = null;
  let maxCount = 0;
  Object.entries(teamFrequency).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPlayedTeam = { name, count };
    }
  });

  return {
    totalPlayed,
    soloPlayed,
    multiplayerPlayed,
    wins,
    winRate: Math.round((wins / totalPlayed) * 100),
    totalSpentCr: Number(totalSpent.toFixed(2)),
    avgSpentCr: Number((totalSpent / totalPlayed).toFixed(2)),
    totalPlayersDrafted: totalPlayers,
    recordBuy,
    mostPlayedTeam,
  };
}

/**
 * Clear all saved history
 */
export function clearGameHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear game history:', err);
    return false;
  }
}
