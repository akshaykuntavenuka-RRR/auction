/**
 * aiBidder.js - Human-Like "GOATED Team Builder" AI Bidding Engine
 * 
 * Features:
 * 1. Deep Statistical Analysis: Differentiates legends (200 matches, 6000 runs)
 *    from fringe/backup players (25 matches, 325 runs) across BAT, BOWL, AR, and WK.
 * 2. Strict Player Tiers (Tier 1 Marquee down to Tier 4 Fringe).
 * 3. GOATED Squad Balance: Enforces optimal role distribution (3-4 BAT, 3-4 BOWL, 2-3 AR, 1-2 WK)
 *    and hard caps on Wicketkeepers (max 2) and Overseas players (max 4).
 * 4. Dynamic Purse Management & Marquee War Chest: Analyzes remaining unauctioned players
 *    and preserves purse for upcoming superstars instead of overspending on small players.
 */

export const AI_STRATEGIES = {
  aggressive: {
    label: 'Aggressive 🔥',
    color: '#FF3CAC',
    bidMultiplier: 1.15,
    maxBudgetPercent: 0.35,
    targetRoles: ['Batsman', 'All-Rounder', 'BAT', 'AR'],
    bluffChance: 0.2,
  },
  balanced: {
    label: 'Balanced ⚖️',
    color: '#00C9FF',
    bidMultiplier: 1.0,
    maxBudgetPercent: 0.28,
    targetRoles: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper', 'BAT', 'BOWL', 'AR', 'WK'],
    bluffChance: 0.1,
  },
  conservative: {
    label: 'Conservative 🛡️',
    color: '#00F5A0',
    bidMultiplier: 0.88,
    maxBudgetPercent: 0.22,
    targetRoles: ['Bowler', 'Wicketkeeper', 'BOWL', 'WK'],
    bluffChance: 0.0,
  },
};

/**
 * 1. STATISTICAL RATING ENGINE (50 - 99)
 * Empirically assesses player calibre based on volume (career matches, total runs/wickets)
 * and efficiency (average, strike rate, economy, centuries/fifties).
 */
export function calculatePlayerRating(player) {
  if (!player) return 50;
  const stats = player.stats || {};
  const role = player.roleCode || (
    player.role === 'Batsman' ? 'BAT' :
    player.role === 'Wicketkeeper' ? 'WK' :
    player.role === 'All-Rounder' ? 'AR' : 'BOWL'
  );
  const matches = Number(stats.matches || 0);

  let rating = 50;

  if (role === 'BAT' || role === 'WK') {
    const runs = Number(stats.runs || 0);
    const average = Number(stats.average || 15);
    const strikeRate = Number(stats.strikeRate || stats.strike_rate || 110);
    const hundreds = Number(stats.hundreds || 0);
    const fifties = Number(stats.fifties || 0);

    // 1. Volume & Experience Score (0 - 35 points)
    // 5000+ runs = 35 pts, 3500+ = 28 pts, 2000+ = 20 pts, 1000+ = 12 pts, 325 runs = ~5 pts
    let volumeScore = 0;
    if (runs >= 5000) volumeScore = 35;
    else if (runs >= 3500) volumeScore = 28 + ((runs - 3500) / 1500) * 7;
    else if (runs >= 2000) volumeScore = 20 + ((runs - 2000) / 1500) * 8;
    else if (runs >= 1000) volumeScore = 12 + ((runs - 1000) / 1000) * 8;
    else if (runs >= 400) volumeScore = 6 + ((runs - 400) / 600) * 6;
    else volumeScore = Math.min(6, (runs / 400) * 6);

    // 2. Efficiency: Average (0 - 30 points)
    // 38+ avg = 30 pts, 30 avg = 20 pts, 22 avg = 12 pts, <15 avg = <5 pts
    const avgScore = Math.max(0, Math.min(30, ((average - 12) / (38 - 12)) * 30));

    // 3. Efficiency: Strike Rate (0 - 25 points)
    // 150+ SR = 25 pts, 135 SR = 18 pts, 120 SR = 10 pts, <105 = 0 pts
    const srScore = Math.max(0, Math.min(25, ((strikeRate - 105) / (155 - 105)) * 25));

    // 4. Milestone pedigree bonus (0 - 10 points)
    const milestoneScore = Math.min(10, hundreds * 2.5 + fifties * 0.3);

    // Raw total (0 - 100)
    rating = volumeScore + avgScore + srScore + milestoneScore;

    // Small-sample penalty: Players with few matches (<30) and modest runs (<600)
    // (e.g. 25 matches, 325 runs) cannot be rated above 63
    if (matches < 30 && runs < 600) {
      rating = Math.min(63, rating);
    } else if (matches < 50 && runs < 1200) {
      rating = Math.min(76, rating);
    }

  } else if (role === 'BOWL') {
    const wickets = Number(stats.wickets || 0);
    const economy = Number(stats.economy || stats.economyRate || stats.economy_rate || 8.6);
    const strikeRate = Number(stats.strikeRate || stats.strike_rate || 24);

    // 1. Volume & Experience Score (0 - 35 points)
    // 150+ wickets = 35 pts, 100+ = 27 pts, 50+ = 18 pts, 20+ = 9 pts, <10 = <4 pts
    let volumeScore = 0;
    if (wickets >= 150) volumeScore = 35;
    else if (wickets >= 100) volumeScore = 27 + ((wickets - 100) / 50) * 8;
    else if (wickets >= 50) volumeScore = 18 + ((wickets - 50) / 50) * 9;
    else if (wickets >= 20) volumeScore = 9 + ((wickets - 20) / 30) * 9;
    else volumeScore = Math.min(9, (wickets / 20) * 9);

    // 2. Economy Score (0 - 35 points)
    // Economy <= 7.0 = 35 pts, 7.8 = 25 pts, 8.5 = 15 pts, 9.8+ = 0 pts
    const econScore = Math.max(0, Math.min(35, ((9.8 - economy) / (9.8 - 7.0)) * 35));

    // 3. Strike Rate (Balls per wicket) (0 - 25 points)
    // <= 16 balls = 25 pts, 20 = 18 pts, 26 = 10 pts, >32 = 0 pts
    const srScore = Math.max(0, Math.min(25, ((32 - strikeRate) / (32 - 16)) * 25));

    // 4. Experience bonus (0 - 5 points)
    const matchScore = Math.min(5, (matches / 100) * 5);

    rating = volumeScore + econScore + srScore + matchScore;

    // Small-sample penalty
    if (matches < 25 && wickets < 25) {
      rating = Math.min(63, rating);
    } else if (matches < 45 && wickets < 45) {
      rating = Math.min(76, rating);
    }

  } else if (role === 'AR') {
    // All-Rounder dual impact
    const runs = Number(stats.runs || 0);
    const wickets = Number(stats.wickets || 0);
    const average = Number(stats.average || 15);
    const strikeRate = Number(stats.strikeRate || 115);
    const economy = Number(stats.economy || 8.6);

    // Batting contribution (0 - 45 points)
    const batVol = Math.min(20, (runs / 2000) * 20);
    const batAvg = Math.max(0, Math.min(15, ((average - 15) / 20) * 15));
    const batSr = Math.max(0, Math.min(10, ((strikeRate - 110) / 35) * 10));
    const batScore = batVol + batAvg + batSr;

    // Bowling contribution (0 - 45 points)
    const bowlVol = Math.min(20, (wickets / 80) * 20);
    const bowlEcon = Math.max(0, Math.min(15, ((9.8 - economy) / 2.6) * 15));
    const bowlScore = bowlVol + bowlEcon + Math.min(10, (matches / 80) * 10);

    // Dual-impact synergy bonus (0 - 10 points)
    let synergy = 0;
    if (runs >= 1000 && wickets >= 40) synergy = 10;
    else if (runs >= 500 && wickets >= 20) synergy = 6;

    rating = (batScore * 0.5) + (bowlScore * 0.5) + synergy;

    if (matches < 25 && runs < 300 && wickets < 15) {
      rating = Math.min(62, rating);
    } else if (matches < 45 && runs < 700 && wickets < 30) {
      rating = Math.min(76, rating);
    }
  }

  // Elite Marquee guarantee: Base price 2 Cr + veteran experience (80+ matches)
  if (player.base >= 2.0 && matches >= 80) {
    rating = Math.max(88, rating);
  }

  return Math.max(50, Math.min(99, Math.round(rating)));
}

/**
 * 2. PLAYER TIER CLASSIFIER
 * Classifies players into 4 clear market tiers.
 */
export function getPlayerTier(player, rating = null) {
  const r = rating ?? calculatePlayerRating(player);
  if (r >= 90) return 1; // Tier 1: Marquee / Legendary Match-Winner (Kohli, Bumrah, Rohit, Dhoni, Hardik, etc.)
  if (r >= 80) return 2; // Tier 2: Established Core Starters
  if (r >= 70) return 3; // Tier 3: Promising / Role Players
  return 4;              // Tier 4: Fringe / Domestic Backup
}

/**
 * 3. PERCEIVED VALUE ENGINE
 * Converts rating and tier into realistic market value (in Crores).
 * - Tier 1: ₹13.0 Cr – ₹20.0 Cr
 * - Tier 2: ₹5.0 Cr – ₹10.0 Cr
 * - Tier 3: ₹1.8 Cr – ₹4.5 Cr
 * - Tier 4: ₹0.3 Cr – ₹1.2 Cr (Fringe players NEVER exceed 1.2 Cr!)
 */
export function calculatePerceivedValue(player, rating = null) {
  const r = rating ?? calculatePlayerRating(player);
  const tier = getPlayerTier(player, r);

  const basePriceCr = typeof player.base === 'number' && !isNaN(player.base) && player.base > 0
    ? player.base
    : (player.basePrice ? (player.basePrice > 10000 ? player.basePrice / 10000000 : player.basePrice) : 0.5);

  let perceivedValue = basePriceCr;

  if (tier === 1) {
    // Tier 1 Marquee: ₹13.0 Cr - ₹20.0 Cr
    perceivedValue = 13.0 + ((r - 90) / 9) * 7.0;
  } else if (tier === 2) {
    // Tier 2 Core: ₹5.0 Cr - ₹10.0 Cr
    perceivedValue = 5.0 + ((r - 80) / 9) * 5.0;
  } else if (tier === 3) {
    // Tier 3 Role Player: ₹1.8 Cr - ₹4.5 Cr
    perceivedValue = 1.8 + ((r - 70) / 9) * 2.7;
  } else {
    // Tier 4 Fringe / Domestic Backup: ₹0.3 Cr - ₹1.2 Cr max!
    // Example: 25 matches, 325 runs -> r ~56 -> perceivedValue ~0.64 Cr
    perceivedValue = Math.min(1.2, Math.max(basePriceCr, 0.4 + ((r - 50) / 20) * 0.7));
  }

  perceivedValue = Math.max(perceivedValue, basePriceCr);
  return Number(perceivedValue.toFixed(2));
}

/**
 * 4. GOATED SQUAD COMPOSITION & SQUAD NEEDS ENGINE
 * Enforces ideal 11-player squad balance:
 * - 3 to 4 Specialist Batsmen (BAT)
 * - 3 to 4 Specialist Bowlers (BOWL)
 * - 2 to 3 All-Rounders (AR)
 * - 1 to 2 Wicketkeepers (WK) - strictly max 2!
 * - Maximum 4 Overseas Players (IPL Playing XI rule)
 */
export function adjustValueForSquadNeeds(perceivedValue, aiTeam, player, soldPlayers, maxTeamSize = 11) {
  if (!aiTeam || !player) return 0;

  const role = player.roleCode || (
    player.role === 'Batsman' ? 'BAT' :
    player.role === 'Wicketkeeper' ? 'WK' :
    player.role === 'All-Rounder' ? 'AR' : 'BOWL'
  );
  const isOverseas = player.nationality && player.nationality.toLowerCase() !== 'india';

  // Count AI team's current acquired roster
  const aiSoldList = soldPlayers.filter(sp => sp.team_id === aiTeam.id).map(sp => sp.player);
  const aiPlayerCount = aiSoldList.length;

  if (aiPlayerCount >= maxTeamSize) {
    return 0; // Squad is already FULL
  }

  const numBatsmen = aiSoldList.filter(p => p.roleCode === 'BAT' || p.role === 'Batsman').length;
  const numWicketkeepers = aiSoldList.filter(p => p.roleCode === 'WK' || p.role === 'Wicketkeeper').length;
  const numAllRounders = aiSoldList.filter(p => p.roleCode === 'AR' || p.role === 'All-Rounder').length;
  const numBowlers = aiSoldList.filter(p => p.roleCode === 'BOWL' || p.role === 'Bowler').length;
  const numOverseas = aiSoldList.filter(p => p.nationality && p.nationality.toLowerCase() !== 'india').length;

  const remainingSlots = maxTeamSize - aiPlayerCount;

  // 1. OVERSEAS HARD CAP: Max 4 in squad
  if (isOverseas) {
    if (numOverseas >= 4) {
      return 0; // HARD STOP: Already have 4 overseas players
    } else if (numOverseas === 3) {
      // 4th overseas player: Only buy if genuine Tier 1 or Tier 2 star
      const r = calculatePlayerRating(player);
      if (r < 80) return 0; // Ignore fringe overseas players
    }
  }

  // 2. WICKETKEEPER HARD CAP: Max 2 in squad
  if (role === 'WK') {
    if (numWicketkeepers >= 2) {
      return 0; // HARD STOP: Already have 2 wicketkeepers
    }
    if (numWicketkeepers === 1) {
      // Already have a primary keeper: strictly treat second WK as cheap backup
      return Math.min(perceivedValue * 0.25, 1.0);
    }
    // No wicketkeeper yet: Urgency increases as slots decrease
    if (numWicketkeepers === 0) {
      if (remainingSlots <= 4) return Number((perceivedValue * 1.45).toFixed(2));
      return Number((perceivedValue * 1.25).toFixed(2));
    }
  }

  // 3. ROLE TARGETS FOR GOATED SQUAD (scaled to maxTeamSize)
  // Target: ~3-4 BAT, ~3-4 BOWL, ~2-3 AR
  const targetBat = Math.max(3, Math.round(maxTeamSize * 0.32));
  const targetBowl = Math.max(3, Math.round(maxTeamSize * 0.32));
  const targetAr = Math.max(2, Math.round(maxTeamSize * 0.22));

  let multiplier = 1.0;

  if (role === 'BAT') {
    if (numBatsmen >= targetBat) {
      // Role already satisfied: drastically reduce valuation (token depth bid only)
      return Math.min(perceivedValue * 0.15, 1.0);
    } else if (numBatsmen === 0 && remainingSlots <= 5) {
      multiplier = 1.35; // Urgently need top-order batsmen
    }
  }

  if (role === 'BOWL') {
    if (numBowlers >= targetBowl) {
      // Bowling attack already complete
      return Math.min(perceivedValue * 0.15, 1.0);
    } else if (numBowlers === 0 && remainingSlots <= 5) {
      multiplier = 1.4; // Urgently need specialist bowlers
    }
  }

  if (role === 'AR') {
    if (numAllRounders >= targetAr) {
      return Math.min(perceivedValue * 0.2, 1.2);
    } else if (numAllRounders === 0 && remainingSlots <= 5) {
      multiplier = 1.3;
    }
  }

  return Number((perceivedValue * multiplier).toFixed(2));
}

/**
 * 5. DYNAMIC PURSE MANAGER & AI BIDDING DECISION ENGINE
 * - Scans remaining unauctioned player cards.
 * - If marquee superstars remain in future rounds, sets aside a Marquee War Chest.
 * - Caps fringe/backup players tightly so AI never blows budget early.
 */
export function decideAIBid(
  aiTeam,
  player,
  currentBid,
  allTeams,
  soldPlayers,
  maxTeamSize = 11,
  allAuctionPlayers = [],
  currentPlayerIndex = 0
) {
  if (!player || !aiTeam || aiTeam.budget < 0.2) return null;

  const basePriceCr = typeof player.base === 'number' && !isNaN(player.base) && player.base > 0
    ? player.base
    : (player.basePrice ? (player.basePrice > 10000 ? player.basePrice / 10000000 : player.basePrice) : 0.5);

  const safeCurrentBid = (typeof currentBid === 'number' && !isNaN(currentBid) && currentBid > 0)
    ? currentBid
    : basePriceCr;

  const strategy = AI_STRATEGIES[aiTeam.aiStrategy || 'balanced'] || AI_STRATEGIES.balanced;

  // 1. Calculate player rating and tier
  const rating = calculatePlayerRating(player);
  const tier = getPlayerTier(player, rating);

  // 2. Base perceived value
  const baseValue = calculatePerceivedValue(player, rating);

  // 3. Squad needs adjustment
  const adjustedValue = adjustValueForSquadNeeds(baseValue, aiTeam, player, soldPlayers, maxTeamSize);
  if (adjustedValue <= 0) return null;

  // 4. Team roster status
  const aiSoldList = soldPlayers.filter(sp => sp.team_id === aiTeam.id);
  const aiPlayerCount = aiSoldList.length;
  const slotsNeeded = maxTeamSize - aiPlayerCount;
  if (slotsNeeded <= 0) return null;

  // Safety floor: At least 0.75 Cr per remaining future slot so the squad can always finish
  const safetyFloor = (slotsNeeded - 1) * 0.75;
  const absoluteMaxAffordable = Math.max(0, Math.round((aiTeam.budget - safetyFloor) * 10) / 10);
  if (absoluteMaxAffordable < 0.2) return null;

  // 5. UNPACK FUTURE DECK: Count upcoming Marquee players still unauctioned
  const upcomingPlayers = allAuctionPlayers.slice(currentPlayerIndex + 1);
  let remainingMarquees = 0;
  for (const p of upcomingPlayers) {
    if (p.base >= 2.0 || getPlayerTier(p) === 1) {
      remainingMarquees++;
    }
  }

  // 6. PURSE ALLOCATION LOGIC
  const avgBudgetPerSlot = aiTeam.budget / slotsNeeded;
  let maxSpendForThisPlayer = adjustedValue;

  if (tier === 1) {
    // Current player IS a Marquee match-winner:
    // AI deploys war chest, willing to spend up to affordable limit
    const willingness = strategy.bidMultiplier || 1.0;
    maxSpendForThisPlayer = Math.min(
      absoluteMaxAffordable,
      Math.round(adjustedValue * willingness * (0.95 + Math.random() * 0.1) * 10) / 10
    );
  } else if (tier === 2) {
    // Established Core starter:
    // Allow healthy bid (5-10 Cr) but keep marquee reserve if legends are still ahead
    const marqueeReserve = remainingMarquees > 0 && slotsNeeded > 2 ? Math.min(14.0, remainingMarquees * 6.0) : 0;
    const ceiling = Math.max(2.0, (aiTeam.budget - marqueeReserve - safetyFloor));
    maxSpendForThisPlayer = Math.min(adjustedValue, ceiling, Math.max(4.0, avgBudgetPerSlot * 1.6));
  } else if (tier === 3) {
    // Promising / Role player:
    // Strictly capped to 1.8 - 4.0 Cr max, never blow huge purse
    const regularCeiling = Math.min(3.8, Math.max(1.8, avgBudgetPerSlot * 1.1));
    maxSpendForThisPlayer = Math.min(adjustedValue, regularCeiling, absoluteMaxAffordable);
  } else {
    // Tier 4: Fringe / Domestic Backup (e.g. 25 matches, 325 runs)
    // NEVER spend more than 1.2 Cr on a small player!
    const fringeCeiling = Math.min(1.2, Math.max(basePriceCr, avgBudgetPerSlot * 0.6));
    maxSpendForThisPlayer = Math.min(adjustedValue, fringeCeiling, absoluteMaxAffordable);
  }

  // Final Max Bid Limit for this AI
  const maxBidLimit = Math.min(absoluteMaxAffordable, Math.round(maxSpendForThisPlayer * 10) / 10);

  // If current bid is already at or above our limit, drop out
  if (safeCurrentBid >= maxBidLimit) {
    return null;
  }

  // 7. IPL-STYLE BID INCREMENTS
  // Small players (Tier 3 & 4) only move in disciplined 0.25 Cr steps
  // Stars can jump 0.5 or 1.0 Cr to deter competitors
  const undervalueGap = maxBidLimit - safeCurrentBid;
  let chosenIncrement = 0.25;

  if (tier <= 2 && undervalueGap >= 2.5 && aiTeam.aiStrategy === 'aggressive' && Math.random() < 0.6) {
    chosenIncrement = 1.0;
  } else if (tier <= 2 && undervalueGap >= 1.5 && Math.random() < 0.5) {
    chosenIncrement = 0.5;
  } else {
    chosenIncrement = 0.25;
  }

  let nextBid = safeCurrentBid + chosenIncrement;
  nextBid = Math.round(nextBid * 4) / 4;

  if (nextBid > maxBidLimit) {
    // Step down to minimal 0.25 increment if possible
    nextBid = safeCurrentBid + 0.25;
    nextBid = Math.round(nextBid * 4) / 4;
    if (nextBid > maxBidLimit) {
      return null;
    }
  }

  if (nextBid <= safeCurrentBid) {
    return null;
  }

  return nextBid;
}

/**
 * Calculates whether an AI team wants to bid and what their bid amount should be.
 */
export function getAIBid(
  aiTeam,
  player,
  currentBid,
  allTeams,
  soldPlayers,
  maxTeamSize = 11,
  allAuctionPlayers = [],
  currentPlayerIndex = 0
) {
  return decideAIBid(
    aiTeam,
    player,
    currentBid,
    allTeams,
    soldPlayers,
    maxTeamSize,
    allAuctionPlayers,
    currentPlayerIndex
  );
}

/**
 * Distributes AI strategies evenly across teams
 */
export function assignAIStrategies(numAITeams) {
  const strategies = [];
  if (numAITeams >= 1) strategies.push('aggressive');
  if (numAITeams >= 2) strategies.push('conservative');
  for (let i = strategies.length; i < numAITeams; i++) {
    strategies.push('balanced');
  }
  return strategies.sort(() => Math.random() - 0.5);
}
