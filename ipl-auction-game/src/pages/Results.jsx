import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import ProfileMenu from '../components/ProfileMenu';
import PlayerCard from '../components/PlayerCard';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Results() {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const { 
    currentUser,
    authLoading,
    teams, 
    soldPlayers, 
    unsoldPlayers, 
    budgetCr, 
    resetAuction,
    auctionRound,
    startRound2,
    isSoloMode,
    humanTeamId
  } = useAuction();
  const [confetti, setConfetti] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});

  // Auth guard
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) return null;

  // Premium confetti visual effect on mount
  useEffect(() => {
    const colors = ['#ff8200', '#e05a00', '#ffffff', '#cfbdfe', '#cfbdfe'];
    const generated = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      size: Math.random() * 8 + 6,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }));
    setConfetti(generated);
  }, []);

  const handleNewAuction = () => {
    resetAuction();
    navigate('/play-options');
  };

  const toggleExpand = (teamId) => {
    setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  let evaluationTitle = "";
  let evaluationDesc = "";
  let evaluationColor = "";
  
  if (isSoloMode) {
    const teamValuations = teams.map(t => {
      const teamSquad = soldPlayers.filter(sp => sp.team_id === t.id);
      const totalSquadValue = teamSquad.reduce((sum, p) => sum + p.sold_for, 0);
      return {
        teamId: t.id,
        isHuman: t.isUser || t.id === humanTeamId,
        value: totalSquadValue
      };
    }).sort((a, b) => b.value - a.value);

    const humanRank = teamValuations.findIndex(t => t.isHuman) + 1;
    const totalRanked = teamValuations.length;

    if (humanRank === 1) {
      evaluationTitle = "🏆 You Won! Amazing auction!";
      evaluationDesc = "Your franchise finished 1st in total spent squad valuation! You absolutely outsmarted the bidding bots!";
      evaluationColor = "linear-gradient(135deg, rgba(255, 130, 0, 0.2) 0%, rgba(224, 90, 0, 0.1) 100%)";
    } else if (humanRank <= Math.ceil(totalRanked / 2)) {
      evaluationTitle = "👍 Good Game! Keep practicing!";
      evaluationDesc = `Your franchise finished at rank #${humanRank} out of ${totalRanked} teams. A competitive showing, but there's room to improve!`;
      evaluationColor = "linear-gradient(135deg, rgba(0, 201, 255, 0.2) 0%, rgba(0, 150, 255, 0.1) 100%)";
    } else {
      evaluationTitle = "😅 The AI outsmarted you this time!";
      evaluationDesc = `Your franchise finished at rank #${humanRank} out of ${totalRanked} teams. The AI managers drafted more aggressively! Try again!`;
      evaluationColor = "linear-gradient(135deg, rgba(255, 60, 172, 0.15) 0%, rgba(20, 19, 21, 0) 100%)";
    }
  }

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-x-hidden min-h-screen pb-32 relative" style={{ backgroundColor: '#141315', color: '#e6e1e5' }}>
      <style>{`
        .glass-card {
          background: rgba(54, 52, 55, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gold-glow {
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
        }
        .sparkle-container {
          position: relative;
        }
        .sparkle-container::after {
          content: '✨';
          position: absolute;
          top: -10px;
          right: -25px;
          font-size: 24px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* Confetti generator */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confetti.map(c => (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              width: `${c.size}px`,
              height: `${c.size}px`,
              backgroundColor: c.color,
              borderRadius: '50%',
              left: `${c.left}vw`,
              top: '-20px',
              animation: `confetti-fall ${c.duration}s infinite linear`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      <header className="bg-surface/80 backdrop-blur-xl border-b border-white/20 shadow-lg flex justify-between items-center px-6 py-3 w-full fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(20, 19, 21, 0.8)' }}>
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
          <h1 className="text-secondary-fixed tracking-widest uppercase" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>
            IPL AUCTION
          </h1>
        </div>
        <ProfileMenu />
      </header>

      {/* Hero content header */}
      <main className="max-w-7xl mx-auto px-6 pt-24">
        <section className="text-center mb-12">
          <div className="inline-block sparkle-container">
            <h2 className="text-secondary-fixed-dim drop-shadow-[0_0_15px_rgba(255,130,0,0.4)] mb-2 uppercase" style={{ fontFamily: "'Russo One', sans-serif", color: '#ffffff', fontSize: 'clamp(24px, 5vw, 48px)', letterSpacing: '3px' }}>
              {auctionRound === 2 
                ? '🏆 Final Auction Complete!' 
                : (unsoldPlayers.length > 0 ? '🏏 Round 1 Complete!' : '🏆 Auction Complete!')}
            </h2>
          </div>
          <p className="text-on-surface-variant text-lg font-medium opacity-75" style={{ color: '#cbc4ce' }}>
            {auctionRound === 2
              ? 'Both Round 1 and Round 2 are finished. Here are your final squads for the season.'
              : (unsoldPlayers.length > 0
                ? `${unsoldPlayers.length} players went unsold. You can launch Round 2 or finalize your squads below.`
                : 'The gavel has fallen. Here are your final squads for the season.')}
          </p>
        </section>

        {/* Solo Mode Evaluation Banner */}
        {isSoloMode && (
          <div 
            className="w-full glass-card p-6 rounded-2xl border mb-12 flex flex-col items-center text-center animate-fade-in gold-glow" 
            style={{ 
              background: evaluationColor,
              borderColor: 'rgba(255, 130, 0, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
            }}
          >
            <h3 className="text-3xl font-bold uppercase tracking-wider mb-2 text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif" }}>
              {evaluationTitle}
            </h3>
            <p className="text-sm opacity-90 text-on-surface-variant max-w-2xl" style={{ color: '#cbc4ce' }}>
              {evaluationDesc}
            </p>
          </div>
        )}

        {/* Squad list cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map(team => {
            // Find all sold players purchased by this team
            const teamSquad = soldPlayers.filter(sp => sp.team_id === team.id);
            const totalSpent = teamSquad.reduce((sum, p) => sum + p.sold_for, 0);
            const remainingBudget = Number((budgetCr - totalSpent).toFixed(2));
            const progressPct = Math.min(100, (totalSpent / budgetCr) * 100);

            const isHuman = team.isUser || team.id === humanTeamId;

            return (
              <div 
                key={team.id} 
                className={`glass-card rounded-xl overflow-hidden flex flex-col border transition-all hover:ring-1 hover:ring-secondary-fixed/30 group hover:scale-[1.01] ${
                  isHuman ? 'border-[#ff8200]/50 gold-glow' : 'border-white/5'
                }`}
                style={{
                  borderColor: isHuman ? 'rgba(255, 130, 0, 0.5)' : 'rgba(255, 255, 255, 0.05)',
                  boxShadow: isHuman ? '0 0 20px rgba(255, 130, 0, 0.15)' : 'none'
                }}
              >
                {/* Accent team strip at the top */}
                <div className="h-2 w-full" style={{ backgroundColor: team.color }} />
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <div className="flex items-center gap-3">
                        {team.logo && (
                          <div className="w-12 h-12 rounded-lg bg-white/10 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-on-surface font-bold uppercase tracking-wider leading-none" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>{team.name}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: isHuman ? '#ff8200' : '#cbc4ce', opacity: isHuman ? 1 : 0.6 }}>
                            {isSoloMode 
                              ? (isHuman ? '👑 OWNER: YOU (HUMAN)' : `🤖 AI BOT (${team.aiStrategy || 'balanced'})`) 
                              : (team.isUser ? 'OWNER: YOU' : 'OWNER: BOT MANAGER')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-stats-numeric text-secondary-fixed" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>
                          {teamSquad.length}
                        </span>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 whitespace-nowrap">SQUAD SIZE</p>
                      </div>
                    </div>

                    {/* Spent bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#cbc4ce' }}>
                        <span>SPENT: ₹{totalSpent.toFixed(2)} Cr</span>
                        <span>REMAINING: ₹{remainingBudget} Cr</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden" style={{ backgroundColor: '#363437' }}>
                        <div
                          className="h-full bg-secondary-fixed shadow-[0_0_10px_rgba(255,130,0,0.5)]"
                          style={{
                            width: `${progressPct}%`,
                            backgroundColor: '#ff8200',
                            boxShadow: '0 0 10px rgba(255, 130, 0, 0.5)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Bought Players Roster */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        flexDirection: breakpoint.isMobile ? 'row' : 'column', 
                        gap: 8, 
                        marginBottom: 16,
                        overflowX: breakpoint.isMobile ? 'auto' : 'visible',
                        paddingBottom: breakpoint.isMobile ? '8px' : '0'
                      }}
                      className="scrollbar-hide"
                    >
                      {teamSquad.length === 0 ? (
                        <div className="text-xs text-on-surface-variant opacity-40 italic py-4 text-center w-full">
                          No players bought in this session
                        </div>
                      ) : (
                        teamSquad.slice(0, 3).map((sp, idx) => (
                          <div key={idx} className="flex-shrink-0 w-[220px] sm:w-auto">
                            <PlayerCard
                              player={sp.player}
                              compact={true}
                              soldFor={sp.sold_for}
                              teamColor={team.color}
                            />
                          </div>
                        ))
                      )}

                      {/* Expandable hidden squad members list */}
                      {teamSquad.length > 3 && (
                        <>
                          <button
                            onClick={() => toggleExpand(team.id)}
                            className={`py-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase text-on-surface-variant hover:text-secondary-fixed transition-colors mt-2 ${breakpoint.isMobile ? 'flex-shrink-0 w-24' : 'w-full'}`}
                            style={{ color: '#cbc4ce' }}
                          >
                            {expandedTeams[team.id] ? 'HIDE' : `MORE (+${teamSquad.length - 3})`}
                            <span>{expandedTeams[team.id] ? '▲' : '▼'}</span>
                          </button>
                          
                          {expandedTeams[team.id] && (
                            breakpoint.isMobile ? (
                              teamSquad.slice(3).map((sp, idx) => (
                                <div key={idx} className="flex-shrink-0 w-[220px]">
                                  <PlayerCard
                                    player={sp.player}
                                    compact={true}
                                    soldFor={sp.sold_for}
                                    teamColor={team.color}
                                  />
                                </div>
                              ))
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                {teamSquad.slice(3).map((sp, idx) => (
                                  <PlayerCard
                                    key={idx}
                                    player={sp.player}
                                    compact={true}
                                    soldFor={sp.sold_for}
                                    teamColor={team.color}
                                  />
                                ))}
                              </div>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Round 2 Opportunity Banner (if in Round 1 and unsold players exist) */}
        {auctionRound === 1 && unsoldPlayers.length > 0 && (
          <div 
            className="w-full glass-card p-6 sm:p-8 rounded-2xl border mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 gold-glow animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 130, 0, 0.2) 0%, rgba(20, 19, 21, 0.95) 100%)',
              borderColor: 'rgba(255, 130, 0, 0.45)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 130, 0, 0.2)'
            }}
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl flex-shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider" style={{ fontFamily: "'Russo One', sans-serif" }}>
                    Second Chance
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-white" style={{ fontFamily: "'Russo One', sans-serif" }}>
                    Conduct Round 2 for Unsold Players?
                  </h3>
                </div>
                <p className="text-xs sm:text-sm opacity-85 text-on-surface-variant max-w-2xl" style={{ color: '#cbc4ce' }}>
                  Missed out on star players in Round 1? Give all teams one more opportunity to bid on the <span className="text-[#ff8200] font-bold">{unsoldPlayers.length} unsold players</span> to complete their squads!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                startRound2();
                navigate('/auction');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              style={{
                fontFamily: "'Russo One', sans-serif",
                boxShadow: '0 0 20px rgba(255, 130, 0, 0.5)'
              }}
            >
              <span>⚡</span>
              Start Round 2 ({unsoldPlayers.length} Players)
            </button>
          </div>
        )}

        {/* Unsold players badge lists */}
        <section className="mt-16 mb-20">
          <h3 className="text-secondary-fixed mb-6 uppercase border-l-4 border-secondary-fixed pl-4 font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', borderColor: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)' }}>
            Unsold Players ({unsoldPlayers.length})
          </h3>
          <div className="glass-card p-5 rounded-xl border border-white/5">
            {unsoldPlayers.length === 0 ? (
              <p className="text-sm text-on-surface-variant opacity-50 italic text-center py-4">
                Congratulations! Every single player has been successfully sold!
              </p>
            ) : (
              <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-3 flex-wrap sm:flex-nowrap" style={{ flexWrap: breakpoint.isMobile ? 'nowrap' : 'wrap' }}>
                {unsoldPlayers.map((p, idx) => (
                  <div key={idx} className="px-4 py-2 bg-surface-container-low rounded-full border border-white/10 flex items-center gap-2 flex-shrink-0" style={{ backgroundColor: '#1d1b1e', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffb4ab' }} />
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-[9px] font-bold uppercase opacity-50 tracking-wider">
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Restart Action Call to Action */}
        <div className={breakpoint.isMobile 
          ? "fixed bottom-0 left-0 w-full p-4 bg-surface-container-highest/90 backdrop-blur-xl border-t border-white/10 z-[60] flex flex-col sm:flex-row justify-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.4)]"
          : "flex justify-center items-center gap-4 mb-10 flex-wrap"
        }
        style={breakpoint.isMobile ? { backgroundColor: 'rgba(10, 0, 32, 0.95)' } : {}}
        >
          {auctionRound === 1 && unsoldPlayers.length > 0 && (
            <button
              onClick={() => {
                startRound2();
                navigate('/auction');
              }}
              className={`bg-gradient-to-r from-secondary-fixed to-secondary-container text-surface px-8 py-4 rounded-full font-display-md text-xl font-bold gold-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase shadow-lg cursor-pointer ${breakpoint.isMobile ? 'w-full py-2.5 text-base h-12' : ''}`}
              style={{
                fontFamily: "'Russo One', sans-serif",
                backgroundImage: 'linear-gradient(to right, #ff8200, #ff9d47)',
                fontSize: 'clamp(14px, 2vw, 18px)',
                letterSpacing: '2px',
                color: '#141315'
              }}
            >
              <span>⚡</span>
              Start Round 2 ({unsoldPlayers.length} Unsold)
            </button>
          )}

          <button
            onClick={handleNewAuction}
            className={`${auctionRound === 1 && unsoldPlayers.length > 0 ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-gradient-to-r from-secondary-fixed to-secondary-container text-surface gold-glow hover:scale-105'} px-8 py-4 rounded-full font-display-md text-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2 uppercase shadow-lg cursor-pointer ${breakpoint.isMobile ? 'w-full py-2.5 text-base h-12' : ''}`}
            style={{
              fontFamily: "'Russo One', sans-serif",
              backgroundImage: (auctionRound === 1 && unsoldPlayers.length > 0) ? 'none' : 'linear-gradient(to right, #ff8200, #ff9d47)',
              fontSize: 'clamp(14px, 2vw, 18px)',
              letterSpacing: '2px',
              color: (auctionRound === 1 && unsoldPlayers.length > 0) ? '#ffffff' : '#141315'
            }}
          >
            <span>🔄</span>
            New Auction
          </button>
        </div>
      </main>

      {/* Ambient background glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-fixed/5 blur-[120px] rounded-full pointer-events-none -z-10" style={{ backgroundColor: 'rgba(255, 215, 0, 0.03)' }} />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" style={{ backgroundColor: 'rgba(209, 191, 235, 0.05)' }} />
    </div>
  );
}
