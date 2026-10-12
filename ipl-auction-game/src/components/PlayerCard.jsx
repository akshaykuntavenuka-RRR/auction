import PlayerImage from './PlayerImage';
import { useBreakpoint } from '../hooks/useBreakpoint';

/**
 * PlayerCard - Beautiful card component showing a real IPL player.
 * Props:
 *   player   - player object from mockPlayers
 *   compact  - if true, renders a smaller version (for Results page)
 *   soldFor  - if provided, shows the sold price banner
 *   teamName - team the player was sold to
 *   teamColor- color of the team
 */
export default function PlayerCard({ player, compact = false, soldFor, teamName: _teamName, teamColor, countdown = null, bidTimer = 10 }) {
  const breakpoint = useBreakpoint();

  if (!player) return null;

  const roleCode = player.roleCode || player.role?.substring(0, 4).toUpperCase();
  const isBAT = roleCode === 'BAT' || player.role === 'Batsman';
  const isWK = roleCode === 'WK' || player.role === 'Wicketkeeper';
  const isBOWL = roleCode === 'BOWL' || player.role === 'Bowler';
  const isAR = roleCode === 'AR' || player.role === 'All-Rounder';

  const roleLabel = isWK ? 'WK' : isBAT ? 'BAT' : isAR ? 'AR' : 'BOWL';
  const roleColor = isWK ? '#60a5fa' : isBAT ? '#4ade80' : isAR ? '#fbbf24' : '#f87171';

  const basePriceCr = (() => {
    if (typeof player.base === 'number' && !isNaN(player.base) && player.base > 0) return player.base.toFixed(1);
    if (typeof player.basePrice === 'number' && !isNaN(player.basePrice) && player.basePrice > 0) {
      return (player.basePrice > 10000 ? player.basePrice / 10000000 : player.basePrice).toFixed(1);
    }
    return '0.5';
  })();

  if (compact) {
    return (
      <div style={{
        background: 'rgba(30,28,32,0.85)',
        border: `1px solid ${teamColor ? teamColor + '44' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseOver={e => e.currentTarget.style.borderColor = (teamColor || '#ff8200') + '88'}
      onMouseOut={e => e.currentTarget.style.borderColor = (teamColor ? teamColor + '44' : 'rgba(255,255,255,0.1)')}
      >
        {/* Avatar */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2px solid ${roleColor}44`,
          flexShrink: 0,
          background: '#1f1d22',
        }}>
          <PlayerImage
            playerName={player.name}
            role={roleCode}
            size="thumb"
            style={{ borderRadius: '50%' }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#e6e1e5',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{player.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              color: roleColor,
              background: roleColor + '22',
              padding: '1px 6px',
              borderRadius: 4,
              letterSpacing: 1,
            }}>{roleLabel}</span>
            <span style={{ fontSize: 10, color: '#9c8faa' }}>{player.ipl || player.team || ''}</span>
          </div>
        </div>

        {/* Price */}
        {soldFor !== undefined && (
          <div style={{
            textAlign: 'right',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#4ade80', fontFamily: "'Russo One', sans-serif" }}>
              ₹{soldFor} Cr
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full card (for spotlight in Auction.jsx)
  return (
    <div style={{
      background: 'linear-gradient(145deg, #1b1924 0%, #121019 100%)',
      border: '1px solid rgba(255, 255, 255, 0.16)',
      borderRadius: 14,
      padding: breakpoint.isMobile ? '12px 14px' : '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Header: Role badge, Nationality badge, and Base Price */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: roleColor,
            color: '#0f0e10',
            padding: '3px 12px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}>{player.role || roleLabel}</span>

          {player.nationality && (
            <span style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.16)',
            }}>{player.nationality}</span>
          )}
        </div>

        {/* Base Price Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>BASE PRICE:</span>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: '18px', color: '#ffffff', letterSpacing: '0.5px' }}>₹{basePriceCr} Cr</span>
        </div>
      </div>

      {/* Main info row: Image on left + Details on right */}
      <div style={{
        display: 'flex',
        flexDirection: breakpoint.isMobile ? 'column' : 'row',
        gap: 16,
        alignItems: 'stretch',
        width: '100%',
      }}>
        {/* Spotlight Image Box */}
        <div style={{
          width: breakpoint.isMobile ? '100%' : '175px',
          height: breakpoint.isMobile ? '180px' : '190px',
          minWidth: breakpoint.isMobile ? '100%' : '175px',
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
          background: '#13111a',
          border: '1px solid rgba(255,255,255,0.16)',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        }}>
          <PlayerImage
            playerName={player.name}
            role={roleCode}
            size="full"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Right Details: Team tag, Player Name, 2x2 Stat Grid */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#ff8200', fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 }}>
              {player.ipl || player.team || ''} · {player.team2026 || 'IPL FRANCHISE'}
            </div>

            <h1 style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: breakpoint.isMobile ? '20px' : '24px',
              letterSpacing: '0.5px',
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: 8,
              fontWeight: 400
            }}>{player.name}</h1>
          </div>

          {/* Stat Boxes: 2 columns x 2 rows */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(isBAT || isWK) && <>
              <StatBox label="IPL Matches" value={player.stats?.matches ?? '-'} isMobile={breakpoint.isMobile} />
              <StatBox label="IPL Runs" value={player.stats?.runs ?? '-'} isMobile={breakpoint.isMobile} />
              <StatBox label="Average" value={
                typeof (player.stats?.average) === 'number'
                  ? player.stats.average.toFixed(2)
                  : (player.stats?.average ?? '-')
              } isMobile={breakpoint.isMobile} />
              <StatBox label="Strike Rate" value={
                typeof (player.stats?.strikeRate) === 'number'
                  ? player.stats.strikeRate.toFixed(2)
                  : (player.stats?.strikeRate ?? '-')
              } isMobile={breakpoint.isMobile} />
            </>}

            {isBOWL && <>
              <StatBox label="IPL Matches" value={player.stats?.matches ?? '-'} isMobile={breakpoint.isMobile} />
              <StatBox label="Wickets" value={player.stats?.wickets ?? '-'} isMobile={breakpoint.isMobile} />
              <StatBox label="Economy" value={
                typeof (player.stats?.economy) === 'number'
                  ? player.stats.economy.toFixed(2)
                  : (player.stats?.economy ?? '-')
              } isMobile={breakpoint.isMobile} />
              <StatBox label="Best" value={player.stats?.bestFigures ?? '-'} isMobile={breakpoint.isMobile} />
            </>}

            {isAR && <>
              <StatBox label="IPL Matches" value={player.stats?.matches ?? '-'} isMobile={breakpoint.isMobile} />
              <StatBox label="Runs" value={player.stats?.runs ?? '-'} isMobile={breakpoint.isMobile} />
              <StatBox label="Wickets" value={player.stats?.wickets ?? '-'} isMobile={breakpoint.isMobile} />
              <StatBox label="Economy" value={
                typeof (player.stats?.economy) === 'number'
                  ? player.stats.economy.toFixed(2)
                  : (player.stats?.economy ?? '-')
              } isMobile={breakpoint.isMobile} />
            </>}
          </div>
        </div>
      </div>

      {/* Progress Bar directly at bottom of card */}
      <div style={{ marginTop: 12, height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${bidTimer > 0 && countdown !== null ? (countdown / bidTimer) * 100 : 100}%`, 
          background: roleColor, 
          borderRadius: 99,
          boxShadow: `0 0 10px ${roleColor}`,
          transition: countdown !== null && countdown < bidTimer ? 'width 1s linear' : 'none'
        }} />
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{
      background: '#121019',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8,
      padding: '8px 10px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 9.5, color: '#ff9d47', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: '16px', color: '#ffffff', lineHeight: 1, fontWeight: 400 }}>{value}</div>
    </div>
  );
}
