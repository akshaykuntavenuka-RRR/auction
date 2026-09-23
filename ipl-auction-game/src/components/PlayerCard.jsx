import { useState } from 'react';
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
export default function PlayerCard({ player, compact = false, soldFor, teamName, teamColor, countdown = null, bidTimer = 10 }) {
  const [imgError, setImgError] = useState(false);
  const breakpoint = useBreakpoint();

  if (!player) return null;

  const roleCode = player.roleCode || player.role?.substring(0, 4).toUpperCase();
  const isBAT = roleCode === 'BAT' || player.role === 'Batsman';
  const isWK = roleCode === 'WK' || player.role === 'Wicketkeeper';
  const isBOWL = roleCode === 'BOWL' || player.role === 'Bowler';
  const isAR = roleCode === 'AR' || player.role === 'All-Rounder';

  const roleLabel = isWK ? 'WK' : isBAT ? 'BAT' : isAR ? 'AR' : 'BOWL';
  const roleColor = isWK ? '#60a5fa' : isBAT ? '#4ade80' : isAR ? '#fbbf24' : '#f87171';

  const fallbackSrc = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent((player.name || 'player').toLowerCase())}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const imgSrc = imgError ? fallbackSrc : (player.image || fallbackSrc);

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
      background: '#1e1c20',
      border: '1.5px solid rgba(255,255,255,0.16)',
      borderRadius: 20,
      padding: breakpoint.isMobile ? '16px 14px' : '18px 22px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    }}>
      {/* Top badges: role + nationality */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: breakpoint.isMobile ? 8 : 10,
        marginBottom: breakpoint.isMobile ? 10 : 12,
        flexWrap: 'wrap',
      }}>
        <span style={{
          background: roleColor,
          color: '#0f0e10',
          padding: breakpoint.isMobile ? '4px 12px' : '5px 16px',
          borderRadius: 99,
          fontSize: breakpoint.isMobile ? 12 : 13,
          fontWeight: 800,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>{player.role || roleLabel}</span>

        {player.nationality && (
          <span style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#cbc4ce',
            padding: breakpoint.isMobile ? '4px 10px' : '5px 14px',
            borderRadius: 99,
            fontSize: breakpoint.isMobile ? 11 : 12,
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.16)',
          }}>{player.nationality}</span>
        )}
      </div>

      {/* Main info row: Image on left + Details on right */}
      <div style={{
        display: 'flex',
        flexDirection: breakpoint.isMobile ? 'column' : 'row',
        gap: breakpoint.isMobile ? 14 : 20,
        alignItems: 'stretch',
        width: '100%',
      }}>
        {/* Image Box ~190x215px */}
        <div style={{
          width: breakpoint.isMobile ? '100%' : '185px',
          height: breakpoint.isMobile ? '180px' : '215px',
          minWidth: breakpoint.isMobile ? '100%' : '165px',
          borderRadius: 14,
          overflow: 'hidden',
          position: 'relative',
          background: '#141316',
          border: '1px solid rgba(255,255,255,0.16)',
          flexShrink: 0,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
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
            <div style={{ fontSize: breakpoint.isMobile ? 11 : 12, color: '#ff8200', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
              {player.ipl || player.team || ''} · {player.team2026 || 'IPL FRANCHISE'}
            </div>

            <h1 style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: breakpoint.isMobile ? 'clamp(18px, 4.5vw, 24px)' : 'clamp(20px, 2.2vw, 28px)',
              letterSpacing: '1px',
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: breakpoint.isMobile ? 6 : 10,
            }}>{player.name}</h1>
          </div>

          {/* Stat Boxes: 2 columns x 2 rows */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: breakpoint.isMobile ? 6 : 10 }}>
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

      {/* Base Price Line directly below stat grid */}
      <div style={{ marginTop: breakpoint.isMobile ? 10 : 14, borderTop: '1px solid rgba(255,255,255,0.16)', paddingTop: breakpoint.isMobile ? 8 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: breakpoint.isMobile ? 11 : 13, color: '#9c8faa', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Base Price:</span>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: breakpoint.isMobile ? '20px' : '26px', color: '#ffffff', letterSpacing: '1px' }}>₹{basePriceCr} Cr</span>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 8, height: breakpoint.isMobile ? 6 : 8, background: 'rgba(255,255,255,0.14)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${bidTimer > 0 && countdown !== null ? (countdown / bidTimer) * 100 : 100}%`, 
            background: roleColor, 
            borderRadius: 99,
            boxShadow: `0 0 16px ${roleColor}`,
            transition: countdown !== null && countdown < bidTimer ? 'width 1s linear' : 'none'
          }} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, isMobile }) {
  return (
    <div style={{
      background: '#141316',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: isMobile ? 10 : 12,
      padding: isMobile ? '6px 8px' : '8px 12px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: isMobile ? 10 : 11, color: '#ff8200', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: isMobile ? '18px' : '22px', color: '#ffffff', lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}
