import { useState, useEffect, useRef } from 'react';
import { fetchPlayerPhotoFromWikipedia, getPlayerFallback } from '../lib/cricapi';

/**
 * Converts a player name to a URL slug for the local /players/ directory.
 * e.g. "MS Dhoni" → "ms-dhoni", "KL Rahul" → "kl-rahul"
 */
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/\./g, '')       // Remove dots (T. Natarajan → t natarajan)
    .trim()
    .replace(/\s+/g, '-');    // Spaces to hyphens
}

/**
 * PlayerImage — shows official IPL jersey headshot (from local /players/ folder).
 * Falls back to Wikipedia photo, then coloured initials avatar.
 * Includes smooth loading animation and instant placeholder feedback.
 */
export default function PlayerImage({ playerName, role, size = 'full', style = {} }) {
  const slug = nameToSlug(playerName || 'player');
  const localUrl = `/players/${slug}.png`;

  const [photoSrc, setPhotoSrc] = useState(localUrl);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [triedLocal, setTriedLocal] = useState(false);
  const [triedWiki, setTriedWiki] = useState(false);
  const prevPlayerRef = useRef(null);

  // Reset state when player changes
  useEffect(() => {
    if (prevPlayerRef.current === playerName) return;
    prevPlayerRef.current = playerName;
    const newSlug = nameToSlug(playerName || 'player');
    setPhotoSrc(`/players/${newSlug}.png`);
    setImgLoaded(false);
    setTriedLocal(false);
    setTriedWiki(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName]);

  const isThumb = size === 'thumb';
  const baseStyle = {
    width: isThumb ? 52 : '100%',
    height: isThumb ? 52 : '100%',
    objectFit: 'cover',
    objectPosition: 'top center',
    borderRadius: isThumb ? '50%' : 0,
    display: 'block',
    ...style,
  };

  // Called when the current image fails to load
  const handleError = () => {
    if (!triedLocal) {
      // Local IPL jersey image failed → try Wikipedia
      setTriedLocal(true);
      setImgLoaded(false);
      let cancelled = false;
      fetchPlayerPhotoFromWikipedia(playerName).then(url => {
        if (cancelled) return;
        if (url) {
          setPhotoSrc(url);
        } else {
          setTriedWiki(true);
          setPhotoSrc(getPlayerFallback(playerName, role));
        }
      });
      return () => { cancelled = true; };
    }
    if (!triedWiki) {
      // Wikipedia also failed → use initials fallback
      setTriedWiki(true);
      setPhotoSrc(getPlayerFallback(playerName, role));
    }
  };

  return (
    <div style={{ position: 'relative', width: baseStyle.width, height: baseStyle.height, overflow: 'hidden', borderRadius: baseStyle.borderRadius }}>
      <style>{`
        @keyframes playerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes playerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>

      {/* Sleek Loading Animation shown while image is loading */}
      {!imgLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #261f36 0%, #131217 100%)',
            zIndex: 1,
          }}
        >
          {/* Subtle animated light sweep across the card */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255, 130, 0, 0.12), transparent)',
              animation: 'playerSweep 1.8s infinite ease-in-out',
            }}
          />

          {/* Central spinner ring with cricket icon */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: isThumb ? 28 : 42,
                height: isThumb ? 28 : 42,
                borderRadius: '50%',
                border: '2.5px solid rgba(255, 130, 0, 0.18)',
                borderTopColor: '#ff8200',
                borderRightColor: '#d1bfeb',
                animation: 'playerSpin 0.9s infinite linear',
              }}
            />
            <span
              style={{
                position: 'absolute',
                fontSize: isThumb ? 13 : 18,
                animation: 'pulseGlow 1.4s infinite ease-in-out',
              }}
            >
              🏏
            </span>
          </div>

          {!isThumb && (
            <div
              style={{
                marginTop: 10,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: '#ff8200',
                textTransform: 'uppercase',
                fontFamily: "'Russo One', sans-serif",
                opacity: 0.9,
                position: 'relative',
              }}
            >
              Loading Photo...
            </div>
          )}
        </div>
      )}

      {/* Actual Player Image (smoothly fades in once loaded) */}
      <img
        src={photoSrc}
        alt={playerName}
        onLoad={() => setImgLoaded(true)}
        onError={handleError}
        style={{
          ...baseStyle,
          position: 'absolute',
          inset: 0,
          opacity: imgLoaded ? 1 : 0,
          transition: 'opacity 0.35s ease-out',
        }}
      />
    </div>
  );
}
