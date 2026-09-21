import { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function LiveTeamsPanel() {
  const { teams, soldPlayers, budgetCr, humanTeamId, maxTeamSize } = useAuction();
  const breakpoint = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);

  // Enrich the teams list with formatted and filtered players from soldPlayers
  const enrichedTeams = teams.map(t => {
    const teamSquad = soldPlayers.filter(sp => sp.team_id === t.id);
    const formattedPlayers = teamSquad.map(sp => {
      const roleCode = sp.player.roleCode || sp.player.role?.substring(0, 4).toUpperCase();
      const mappedRole = (roleCode === 'BAT' || sp.player.role === 'Batsman') ? 'BAT' :
                         (roleCode === 'WK' || sp.player.role === 'Wicketkeeper') ? 'WK' :
                         (roleCode === 'BOWL' || sp.player.role === 'Bowler') ? 'BOWL' :
                         (roleCode === 'AR' || sp.player.role === 'All-Rounder') ? 'AR' : 'BAT';
      return {
        name: sp.player.name,
        role: mappedRole,
        soldFor: sp.sold_for
      };
    });
    return {
      ...t,
      players: formattedPlayers
    };
  });

  const totalPlayersSold = enrichedTeams.reduce((sum, t) => sum + t.players.length, 0);

  if (breakpoint.isSmall) {
    return (
      <div style={{
        width: '100%',
        background: 'rgba(30, 28, 32, 0.45)',
        border: '1px solid rgba(255, 130, 0, 0.25)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(12px)',
        marginBottom: 12,
      }}>
        {/* Accordion Toggle Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '12px 16px',
            background: 'rgba(255, 130, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#ff8200', letterSpacing: '2px', fontFamily: "'Russo One', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📊 LIVE STANDINGS</span>
            <span style={{ fontSize: '10px', color: '#cbc4ce', letterSpacing: '1px', fontFamily: "'Russo One', sans-serif" }}>
              ({totalPlayersSold} sold)
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#ff8200', fontWeight: 'bold' }}>
            {isOpen ? 'COLLAPSE ▲' : 'EXPAND ▼'}
          </div>
        </div>

        {isOpen && (
          <div style={{ overflowY: 'auto', maxH: '50vh' }} className="scrollbar-hide">
            {enrichedTeams
              .slice()
              .sort((a, b) => {
                const aSpent = budgetCr - a.budget;
                const bSpent = budgetCr - b.budget;
                if (b.players.length !== a.players.length) {
                  return b.players.length - a.players.length;
                }
                return bSpent - aSpent;
              })
              .map((team, rank) => {
                const spent = parseFloat((budgetCr - team.budget).toFixed(1));
                const budgetPct = Math.round((team.budget / budgetCr) * 100);
                const isHuman = team.id === humanTeamId;
                const isAI = team.isAi;

                const byRole = {
                  BAT: team.players.filter(p => p.role === 'BAT'),
                  WK:  team.players.filter(p => p.role === 'WK'),
                  AR:  team.players.filter(p => p.role === 'AR'),
                  BOWL: team.players.filter(p => p.role === 'BOWL'),
                };

                return (
                  <TeamRow
                    key={team.id}
                    team={team}
                    rank={rank + 1}
                    spent={spent}
                    budgetPct={budgetPct}
                    byRole={byRole}
                    isHuman={isHuman}
                    isAI={isAI}
                    budgetCr={budgetCr}
                    maxTeamSize={maxTeamSize}
                  />
                );
              })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#161418',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ fontSize: '15px', color: '#ff8200', letterSpacing: '1.2px', fontFamily: "'Russo One', sans-serif" }}>
          📊 LIVE STANDINGS
        </div>
        <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
          {totalPlayersSold} {totalPlayersSold === 1 ? 'player' : 'players'} sold
        </div>
      </div>

      {/* Scrollable team list */}
      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }} className="overflow-y-auto flex-1">
        {enrichedTeams
          .slice()
          .sort((a, b) => {
            // Sort by: most players bought first, then by budget spent (ties)
            const aSpent = budgetCr - a.budget;
            const bSpent = budgetCr - b.budget;
            if (b.players.length !== a.players.length) {
              return b.players.length - a.players.length;
            }
            return bSpent - aSpent;
          })
          .map((team, rank) => {
            const spent = parseFloat((budgetCr - team.budget).toFixed(1));
            const budgetPct = Math.round((team.budget / budgetCr) * 100);
            const isHuman = team.id === humanTeamId;
            const isAI = team.isAi;

            // Group players by role
            const byRole = {
              BAT: team.players.filter(p => p.role === 'BAT'),
              WK:  team.players.filter(p => p.role === 'WK'),
              AR:  team.players.filter(p => p.role === 'AR'),
              BOWL: team.players.filter(p => p.role === 'BOWL'),
            };

            return (
              <TeamRow
                key={team.id}
                team={team}
                rank={rank + 1}
                spent={spent}
                budgetPct={budgetPct}
                byRole={byRole}
                isHuman={isHuman}
                isAI={isAI}
                budgetCr={budgetCr}
                maxTeamSize={maxTeamSize}
              />
            );
          })}
      </div>
    </div>
  );
}

function TeamRow({ team, rank, spent, budgetPct, byRole, isHuman, isAI, budgetCr, maxTeamSize }) {
  const [expanded, setExpanded] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevCountRef = useRef(team.players.length);

  useEffect(() => {
    if (team.players.length > prevCountRef.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1500);
      prevCountRef.current = team.players.length;
      return () => clearTimeout(timer);
    } else {
      prevCountRef.current = team.players.length;
    }
  }, [team.players.length]);

  // Budget bar color based on remaining %
  const barColor = budgetPct > 50 ? '#4eff91'
    : budgetPct > 25 ? '#ff8200'
    : '#FF4757';

  return (
    <div 
      className={flash ? "team-row-flash" : ""}
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: isHuman ? 'rgba(255, 130, 0, 0.08)' : 'transparent',
        transition: 'background 0.2s ease',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Main team row - always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '14px 16px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Team name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          {/* Rank badge */}
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: rank === 1 ? '#ff8200' : 'rgba(255, 255, 255, 0.12)',
            color: rank === 1 ? '#12003a' : '#cbd5e1',
            fontSize: 12, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontFamily: "'Inter', sans-serif",
          }}>{rank}</div>

          {/* Color dot */}
          <div style={{
            width: 11, height: 11, borderRadius: '50%',
            background: team.color, flexShrink: 0,
            boxShadow: `0 0 8px ${team.color}`,
          }}/>

          {/* Team name */}
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: isHuman ? '#ff9e3b' : '#f8fafc',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '0.2px',
            fontFamily: "'Inter', sans-serif",
          }}>
            {team.name}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
            {isHuman && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 8,
                background: '#ff8200', color: '#141315', fontWeight: 800,
                letterSpacing: 0.5, fontFamily: "'Inter', sans-serif",
              }}>YOU</span>
            )}
            {isAI && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
              }}>🤖 AI</span>
            )}
          </div>

          {/* Expand arrow */}
          <div style={{
            fontSize: 12, color: '#cbd5e1',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>▼</div>
        </div>

        {/* Budget bar — line with dot */}
        <div style={{ position: 'relative', height: 16, marginBottom: 6, display: 'flex', alignItems: 'center' }}>
          {/* Track line */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            height: 3, borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.12)',
          }}>
            {/* Filled portion */}
            <div style={{
              height: '100%', borderRadius: 9999,
              background: barColor,
              width: budgetPct + '%',
              transition: 'width 0.4s ease',
            }}/>
          </div>
          {/* Dot indicator */}
          <div style={{
            position: 'absolute',
            left: `calc(${budgetPct}% - 6px)`,
            width: 12, height: 12,
            borderRadius: '50%',
            background: barColor,
            boxShadow: `0 0 8px ${barColor}`,
            transition: 'left 0.4s ease',
            pointerEvents: 'none',
          }}/>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 13,
          alignItems: 'center',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.2px',
        }}>
          <span style={{ color: barColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
            ₹{team.budget.toFixed(1)} Cr left
            {team.budget < 10 && (
              <span style={{
                color: '#FF4757',
                fontSize: 9,
                fontWeight: 800,
                background: 'rgba(255, 71, 87, 0.2)',
                border: '1px solid rgba(255, 71, 87, 0.4)',
                padding: '1px 5px',
                borderRadius: 4,
                letterSpacing: 0.5,
              }}>⚠️ LOW</span>
            )}
          </span>
          <span style={{ color: '#cbd5e1', opacity: 0.9 }}>
            Spent ₹{spent} Cr
          </span>
          <span style={{ color: '#ff9e3b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
            {team.players.length}/{maxTeamSize} 🏏
            {team.players.length >= maxTeamSize && (
              <span className="animate-pulse" style={{
                color: '#FF4757',
                fontSize: 9,
                fontWeight: 800,
                background: 'rgba(255, 71, 87, 0.2)',
                border: '1px solid rgba(255, 71, 87, 0.4)',
                padding: '1px 5px',
                borderRadius: 4,
                letterSpacing: 0.5,
              }}>FULL</span>
            )}
          </span>
        </div>

        {/* Role pill counts */}
        <div style={{
          display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap',
        }}>
          {[
            { role:'BAT', label:'BAT', bg:'#FAEEDA', color:'#854F0B' },
            { role:'WK',  label:'WK',  bg:'#FBEAF0', color:'#993556' },
            { role:'AR',  label:'AR',  bg:'#E1F5EE', color:'#0F6E56' },
            { role:'BOWL',label:'BOWL',bg:'#E6F1FB', color:'#185FA5' },
          ].map(({ role, label, bg, color }) => (
            byRole[role].length > 0 && (
              <span key={role} style={{
                fontSize: 11, padding: '3px 9px', borderRadius: 8,
                background: bg, color, fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
              }}>
                {label} {byRole[role].length}
              </span>
            )
          ))}
          {team.players.length === 0 && (
            <span style={{ fontSize: 12, color: '#94a3b8' }}>No players yet</span>
          )}
        </div>
      </div>

      {/* Expanded: full squad list */}
      {expanded && (
        <div style={{
          background: '#0f0e11',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 16px 12px',
          maxHeight: 250,
          overflowY: 'auto',
          fontFamily: "'Inter', sans-serif",
        }}>
          {team.players.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94a3b8', padding: '6px 0' }}>
              No players purchased yet
            </div>
          ) : (
            team.players.map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '6px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 6,
                    background: getRoleBg(p.role), color: getRoleColor(p.role),
                    fontWeight: 700, flexShrink: 0,
                  }}>{p.role}</span>
                  <span style={{
                    fontSize: 14, color: '#f8fafc', fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: 160,
                  }}>{p.name}</span>
                </div>
                <span style={{
                  fontSize: 14, color: '#4eff91', fontWeight: 700, flexShrink: 0,
                }}>₹{p.soldFor} Cr</span>
              </div>
            ))
          )}

          {/* Squad total */}
          {team.players.length > 0 && (
            <div style={{
              marginTop: 10, paddingTop: 8,
              borderTop: '1px solid rgba(255, 130, 0, 0.35)',
              display: 'flex', justifyContent: 'space-between',
              fontSize: 13, fontWeight: 700,
            }}>
              <span style={{ color: '#cbd5e1' }}>
                {team.players.length} players
              </span>
              <span style={{ color: '#ff9e3b' }}>
                Total: ₹{team.players.reduce((s, p) => s + p.soldFor, 0).toFixed(1)} Cr
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getRoleBg(role) {
  return { BAT:'#FAEEDA', BOWL:'#E6F1FB', AR:'#E1F5EE', WK:'#FBEAF0' }[role] || '#fff';
}
function getRoleColor(role) {
  return { BAT:'#854F0B', BOWL:'#185FA5', AR:'#0F6E56', WK:'#993556' }[role] || '#000';
}
