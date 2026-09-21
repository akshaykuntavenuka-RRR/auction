/**
 * playerSync.js - Syncs IPL player data to Supabase `players` table.
 * Falls back to localStorage if Supabase is unavailable.
 */

import { supabase, isRealSupabaseConfigured } from './supabase';
import { mockPlayers } from '../data/players';

const IS_REAL_SUPABASE = isRealSupabaseConfigured();


/**
 * Map player roleCode to a normalized role string for storage
 */
function mapRole(roleCode) {
  const roles = { BAT: 'BAT', WK: 'WK', AR: 'AR', BOWL: 'BOWL' };
  return roles[roleCode] || 'BAT';
}

/**
 * Determine base price in crores based on player rating/tier
 */
function getBasePrice(player) {
  return player.base || 0.5;
}

// Client-side cache to avoid repeated network overhead and server load
const PLAYERS_CACHE_KEY = 'ipl_players_cache_v1';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

let memoryPlayersCache = null;
let memoryCacheTimestamp = 0;

/**
 * Pre-fetches auction details (players, teams) and verifies cache status without overloading the server.
 * Returns metadata indicating whether cached data was served.
 */
export async function prefetchAuctionDetails(forceRefresh = false) {
  const now = Date.now();

  // 1. Check in-memory cache (0ms latency, zero server queries)
  if (!forceRefresh && memoryPlayersCache && (now - memoryCacheTimestamp < CACHE_TTL_MS)) {
    return { players: memoryPlayersCache, fromCache: true, source: 'memory' };
  }

  // 2. Check sessionStorage cache
  if (!forceRefresh) {
    try {
      const stored = sessionStorage.getItem(PLAYERS_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.players?.length && (now - parsed.timestamp < CACHE_TTL_MS)) {
          memoryPlayersCache = parsed.players;
          memoryCacheTimestamp = parsed.timestamp;
          return { players: parsed.players, fromCache: true, source: 'sessionStorage' };
        }
      }
    } catch (e) {
      console.warn('[playerSync] Cache read error:', e);
    }
  }

  // 3. Load from Supabase (or mock fallback) safely with 2s timeout
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Prefetch timeout')), 2000)
    );
    const players = await Promise.race([loadPlayersForAuction(forceRefresh), timeoutPromise]);
    return { players, fromCache: false, source: 'network' };
  } catch (err) {
    console.warn('[playerSync] Prefetch fallback to local roster:', err?.message || err);
    memoryPlayersCache = mockPlayers;
    memoryCacheTimestamp = now;
    return { players: mockPlayers, fromCache: true, source: 'local_fallback' };
  }
}

/**
 * Load players from Supabase or fall back to local mockPlayers
 * Returns the player array ready for auction use.
 * Employs client cache to prevent putting load on the server.
 */
export async function loadPlayersForAuction(forceRefresh = false) {
  const now = Date.now();

  // Return cached result if fresh and not forced
  if (!forceRefresh && memoryPlayersCache && (now - memoryCacheTimestamp < CACHE_TTL_MS)) {
    return memoryPlayersCache;
  }

  if (!forceRefresh) {
    try {
      const stored = sessionStorage.getItem(PLAYERS_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.players?.length && (now - parsed.timestamp < CACHE_TTL_MS)) {
          memoryPlayersCache = parsed.players;
          memoryCacheTimestamp = parsed.timestamp;
          return parsed.players;
        }
      }
    } catch (e) {
      // Ignore sessionStorage parsing error
    }
  }

  if (!IS_REAL_SUPABASE) {
    console.info('[playerSync] Using local mockPlayers (no real Supabase).');
    memoryPlayersCache = mockPlayers;
    memoryCacheTimestamp = now;
    return mockPlayers;
  }

  try {
    const fetchPromise = supabase
      .from('players')
      .select('*')
      .order('base_price', { ascending: false });

    // Enforce 2.5s maximum timeout so the app is NEVER stuck waiting on slow/unreachable Supabase
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timeout')), 2500)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) throw error;

    if (!data || data.length === 0) {
      console.info('[playerSync] Supabase players table is empty, using local data.');
      memoryPlayersCache = mockPlayers;
      memoryCacheTimestamp = now;
      return mockPlayers;
    }

    // Map Supabase player rows to the app's player object shape
    const formattedPlayers = data.map((row, idx) => ({
      id: row.id ? String(row.id) : String(idx + 1),
      name: row.name,
      role: row.role === 'BAT' ? 'Batsman'
          : row.role === 'WK' ? 'Wicketkeeper'
          : row.role === 'AR' ? 'All-Rounder'
          : 'Bowler',
      roleCode: row.role,
      ipl: row.ipl_team || '',
      team: row.ipl_team || '',
      nationality: row.nationality || 'India',
      age: Number(row.age) || 0,
      battingStyle: row.batting_style || '',
      bowlingStyle: row.bowling_style || '',
      base: typeof row.base_price === 'number' && !isNaN(row.base_price)
        ? (row.base_price > 10000 ? row.base_price / 10000000 : row.base_price)
        : 0.5,
      basePrice: typeof row.base_price === 'number' && !isNaN(row.base_price)
        ? (row.base_price > 10000 ? Math.round(row.base_price) : Math.round(row.base_price * 10000000))
        : 5000000,
      image: row.image_id || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(row.name.toLowerCase())}&backgroundColor=b6e3f4,c0aede`,
      matches: Number(row.t20_matches) || 0,
      // Verified player stats strictly loaded from Supabase backend
      stats: {
        matches: Number(row.t20_matches) || 0,
        runs: Number(row.t20_runs) || 0,
        average: Number(row.t20_average) || 0,
        strikeRate: Number(row.t20_strike_rate) || 0,
        wickets: Number(row.t20_wickets) || 0,
        economy: Number(row.t20_economy) || 0,
        bestFigures: row.t20_best_figures || '-',
      },
      batting: (row.role === 'BAT' || row.role === 'WK' || row.role === 'AR') ? {
        runs: Number(row.t20_runs) || 0,
        average: Number(row.t20_average) || 0,
        strikeRate: Number(row.t20_strike_rate) || 0,
      } : null,
      bowling: (row.role === 'BOWL' || row.role === 'AR') ? {
        wickets: Number(row.t20_wickets) || 0,
        economy: Number(row.t20_economy) || 0,
        bestFigures: row.t20_best_figures || '-',
      } : null,
    }));

    // Cache results in memory and session
    memoryPlayersCache = formattedPlayers;
    memoryCacheTimestamp = now;
    try {
      sessionStorage.setItem(PLAYERS_CACHE_KEY, JSON.stringify({ players: formattedPlayers, timestamp: now }));
    } catch (e) {}

    return formattedPlayers;
  } catch (err) {
    console.info('[playerSync] Failed to load from Supabase, using local data:', err?.message || err);
    memoryPlayersCache = mockPlayers;
    memoryCacheTimestamp = now;
    return mockPlayers;
  }
}

/**
 * Sync all local IPL players to the Supabase `players` table.
 * This is called from the AdminSync page.
 * Yields progress updates via the onProgress callback.
 */
export async function syncAllIPLPlayersToSupabase(onProgress) {
  if (!IS_REAL_SUPABASE) {
    onProgress?.({ type: 'warn', message: '⚠️ No real Supabase config found. Players saved to localStorage instead.' });
    // Save to localStorage as fallback
    localStorage.setItem('ipl_synced_players', JSON.stringify(mockPlayers));
    onProgress?.({ type: 'success', message: `✅ Saved ${mockPlayers.length} players to localStorage (offline mode).` });
    return { success: true, count: mockPlayers.length };
  }

  onProgress?.({ type: 'info', message: `🔄 Starting sync of ${mockPlayers.length} players to Supabase...` });

  const BATCH_SIZE = 20;
  let successCount = 0;
  let errorCount = 0;

  // Process in batches to avoid rate limits
  for (let i = 0; i < mockPlayers.length; i += BATCH_SIZE) {
    const batch = mockPlayers.slice(i, i + BATCH_SIZE);

    const rows = batch.map(p => ({
      id: String(p.id),
      name: p.name,
      ipl_team: p.ipl || p.team || '',
      role: p.roleCode || mapRole(p.role),
      nationality: p.nationality || 'India',
      age: p.age || 0,
      batting_style: p.battingStyle || '',
      bowling_style: p.bowlingStyle || '',
      image_id: p.image || null,
      t20_matches: p.stats?.matches || p.matches || 0,
      t20_runs: p.stats?.runs || p.batting?.runs || 0,
      t20_average: p.stats?.average || p.batting?.average || 0,
      t20_strike_rate: p.stats?.strikeRate || p.batting?.strikeRate || 0,
      t20_wickets: p.stats?.wickets || p.bowling?.wickets || 0,
      t20_economy: p.stats?.economy || p.bowling?.economy || 0,
      t20_best_figures: p.stats?.bestFigures || p.bowling?.bestFigures || '-',
      base_price: getBasePrice(p),
      updated_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase
        .from('players')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        errorCount += batch.length;
        onProgress?.({ type: 'error', message: `❌ Batch ${Math.ceil(i / BATCH_SIZE) + 1} failed: ${error.message}` });
      } else {
        successCount += batch.length;
        onProgress?.({
          type: 'success',
          message: `✅ Batch ${Math.ceil(i / BATCH_SIZE) + 1} synced (${successCount}/${mockPlayers.length} players)`,
        });
      }
    } catch (err) {
      errorCount += batch.length;
      onProgress?.({ type: 'error', message: `❌ Batch error: ${err.message}` });
    }

    // Small delay between batches to avoid hammering the API
    await new Promise(r => setTimeout(r, 300));
  }

  const finalMsg = `🏏 Sync complete! ${successCount} players synced, ${errorCount} errors.`;
  onProgress?.({ type: successCount > 0 ? 'success' : 'error', message: finalMsg });

  return { success: errorCount === 0, count: successCount, errors: errorCount };
}
