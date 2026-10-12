import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameHistory, getGameHistoryStats, clearGameHistory } from '../lib/gameHistory';
import { useAuction } from '../context/AuctionContext';

export default function GameHistoryModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUser } = useAuction();
  const userId = currentUser?.id || 'guest';

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'solo' | 'multiplayer'
  const [expandedGameId, setExpandedGameId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const records = getGameHistory(userId);
      setHistory(records);
      setStats(getGameHistoryStats(userId));
      setExpandedGameId(null);
      setShowClearConfirm(false);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleClear = () => {
    clearGameHistory();
    setHistory([]);
    setStats(getGameHistoryStats(userId));
    setShowClearConfirm(false);
  };

  const handlePlayNow = () => {
    onClose();
    navigate('/play-options');
  };

  const filteredHistory = history.filter(item => {
    if (filterMode === 'solo') return item.mode !== 'Multiplayer';
    if (filterMode === 'multiplayer') return item.mode === 'Multiplayer';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div 
        className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-[#14121a] border border-[#ff8200]/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-[#f1f5f9]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#191622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff8200]/15 border border-[#ff8200]/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,130,0,0.25)]">
              📜
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif" }}>
                Game History & Summaries
              </h2>
              <p className="text-xs text-slate-400">
                You have played <strong className="text-white font-mono">{stats?.totalPlayed || 0}</strong> {stats?.totalPlayed === 1 ? 'game' : 'games'} in total. Review your past auction results and team squads.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close History"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          
          {/* Top Analytics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Played */}
            <div className="p-4 rounded-2xl bg-[#1d1b26] border border-white/10 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff8200] block mb-1">
                Times Played
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "'Russo One', sans-serif" }}>
                {stats?.totalPlayed || 0}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                {stats?.soloPlayed || 0} Solo • {stats?.multiplayerPlayed || 0} Online
              </span>
            </div>

            {/* Wins & Rank */}
            <div className="p-4 rounded-2xl bg-[#1d1b26] border border-white/10 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#00F5A0] block mb-1">
                Trophies Won
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#00F5A0]" style={{ fontFamily: "'Russo One', sans-serif" }}>
                {stats?.wins || 0}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                {stats?.winRate || 0}% Win Rate
              </span>
            </div>

            {/* Total Budget Spent */}
            <div className="p-4 rounded-2xl bg-[#1d1b26] border border-white/10 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C9FF] block mb-1">
                Total Money Spent
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#00C9FF]" style={{ fontFamily: "'Russo One', sans-serif" }}>
                ₹{stats?.totalSpentCr || 0} Cr
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Avg ₹{stats?.avgSpentCr || 0} Cr / game
              </span>
            </div>

            {/* Total Players Drafted */}
            <div className="p-4 rounded-2xl bg-[#1d1b26] border border-white/10 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF3CAC] block mb-1">
                Players Drafted
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#FF3CAC]" style={{ fontFamily: "'Russo One', sans-serif" }}>
                {stats?.totalPlayersDrafted || 0}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1 truncate">
                {stats?.recordBuy ? `Top: ${stats.recordBuy.name}` : 'Across all drafts'}
              </span>
            </div>
          </div>

          {/* Controls / Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 p-1 bg-[#191622] rounded-xl border border-white/10">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-[#ff8200] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Games ({history.length})
              </button>
              <button
                onClick={() => setFilterMode('solo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterMode === 'solo'
                    ? 'bg-[#ff8200] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Solo vs AI ({stats?.soloPlayed || 0})
              </button>
              <button
                onClick={() => setFilterMode('multiplayer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterMode === 'multiplayer'
                    ? 'bg-[#ff8200] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Multiplayer ({stats?.multiplayerPlayed || 0})
              </button>
            </div>

            {history.length > 0 && (
              <div>
                {showClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400 font-semibold">Clear all history?</span>
                    <button
                      onClick={handleClear}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>🗑️</span>
                    Clear History
                  </button>
                )}
              </div>
            )}
          </div>

          {/* History List or Empty State */}
          {filteredHistory.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#191622]/60 border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#ff8200]/10 border border-[#ff8200]/30 flex items-center justify-center text-3xl">
                🏏
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Russo One', sans-serif" }}>
                  {history.length === 0 ? 'No Auction Matches Recorded Yet' : 'No Games in This Category'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                  {history.length === 0
                    ? 'Every time you play and finish an auction, your franchise draft summary, squad list, spent purse, and rank will be recorded here.'
                    : 'No matches found matching your current filter option.'}
                </p>
              </div>
              <button
                onClick={handlePlayNow}
                className="px-6 py-2.5 rounded-xl bg-[#ff8200] hover:bg-white text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,130,0,0.3)] cursor-pointer"
                style={{ fontFamily: "'Russo One', sans-serif" }}
              >
                Play an Auction Game Now →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((game, index) => {
                const isExpanded = expandedGameId === game.id;
                const isWinner = game.rank === 1;

                return (
                  <div
                    key={game.id || index}
                    className="rounded-2xl bg-[#191622] border border-white/10 hover:border-[#ff8200]/40 transition-all duration-200 overflow-hidden shadow-lg"
                  >
                    {/* Game Card Header Bar */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        {/* Team Color Pill */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white uppercase text-lg border-2 shadow-md flex-shrink-0"
                          style={{
                            backgroundColor: game.teamColor || '#363437',
                            borderColor: 'rgba(255,255,255,0.2)',
                          }}
                        >
                          {(game.teamName || 'T').substring(0, 2)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-white/10 text-slate-300">
                              {game.mode === 'Multiplayer' ? `👥 Room: ${game.roomCode || 'Online'}` : `🤖 Solo (${(game.difficulty || 'medium').toUpperCase()})`}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {game.dateFormatted}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-white tracking-wide truncate" style={{ fontFamily: "'Russo One', sans-serif" }}>
                            {game.teamName}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {game.resultTitle || 'Auction Completed'}
                          </p>
                        </div>
                      </div>

                      {/* Rank & Action */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            isWinner
                              ? 'bg-[#00F5A0]/15 text-[#00F5A0] border-[#00F5A0]/40 shadow-[0_0_12px_rgba(0,245,160,0.2)]'
                              : 'bg-white/5 text-slate-300 border-white/10'
                          }`}
                        >
                          {isWinner ? '🏆 1st Place' : `Rank #${game.rank || '-'} of ${game.totalTeams || 6}`}
                        </div>

                        <button
                          onClick={() => setExpandedGameId(isExpanded ? null : game.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#ff8200] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Summary' : 'View Summary'}</span>
                          <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-3 border-t border-white/5 bg-[#14121a]/80 px-5 py-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Spent Purse</span>
                        <span className="font-bold text-white text-sm">₹{game.spentCr} Cr</span>
                        <span className="text-[10px] text-slate-400"> of ₹{game.initialBudgetCr || 100} Cr</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Remaining Purse</span>
                        <span className="font-bold text-[#00F5A0] text-sm">₹{game.remainingCr} Cr</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Squad Drafted</span>
                        <span className="font-bold text-[#ff8200] text-sm">{game.playersCount || (game.squad ? game.squad.length : 0)} Players</span>
                      </div>
                    </div>

                    {/* Collapsible Detailed Squad Breakdown */}
                    {isExpanded && (
                      <div className="p-5 border-t border-white/10 bg-[#121017] space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif" }}>
                            Squad Draft Roster ({game.squad?.length || 0} Players)
                          </h5>
                          {game.topPlayer && (
                            <span className="text-xs text-slate-400">
                              ⭐ Star Buy: <strong className="text-white">{game.topPlayer.name}</strong> (₹{game.topPlayer.sold_for} Cr)
                            </span>
                          )}
                        </div>

                        {(!game.squad || game.squad.length === 0) ? (
                          <p className="text-xs text-slate-400 italic">No players recorded for this squad.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {game.squad.map((player, pIdx) => {
                              const pName = player.name || player.player_name || 'Player';
                              const pRole = player.role || player.roleCode || 'BAT';
                              const pCost = player.sold_for || 0;
                              const pTeam = player.ipl || player.team || 'IPL';

                              return (
                                <div
                                  key={pIdx}
                                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-white block truncate">{pName}</span>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase">
                                      <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono font-semibold">{pRole}</span>
                                      <span>• {pTeam}</span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-[#ff8200] font-mono flex-shrink-0">
                                    ₹{pCost} Cr
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#191622] flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-400">
            IPL Cricket Mini Auction • Career Records
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
