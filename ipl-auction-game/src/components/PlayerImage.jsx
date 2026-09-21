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
 *
 * Priority:
 *   1. /players/{slug}.png  — IPL jersey image (downloaded by scripts/download-ipl-jerseys.mjs)
 *   2. Wikipedia Pageimages API — real photo
 *   3. UI Avatars initials — stylised fallback
 */
export default function PlayerImage({ playerName, role, size = 'full', style = {} }) {
  const slug = nameToSlug(playerName || 'player');
  const localUrl = `/players/${slug}.png`;

  const [photoSrc, setPhotoSrc] = useState(localUrl);  // Try local first
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
    <>
      <style>{`
        @keyframes playerShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Shimmer shown behind image while it loads */}
      {!imgLoaded && (
        <div
          style={{
            ...baseStyle,
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #1a1820 25%, #2a2632 50%, #1a1820 75%)',
            backgroundSize: '200% 100%',
            animation: 'playerShimmer 1.5s infinite',
          }}
        />
      )}

      <img
        src={photoSrc}
        alt={playerName}
        onLoad={() => setImgLoaded(true)}
        onError={handleError}
        style={{
          ...baseStyle,
          opacity: imgLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
    </>
  );
}
