/**
 * Premium Universal LoadingScreen component for IPL Cricket Auction.
 * Displays high-impact branding, spinning cricket animations, and dynamic progress text.
 */
export default function LoadingScreen({
  title = 'LOADING DATA...',
  subtitle = 'Fetching the latest IPL stats & roster from the network...',
  progress = null,
  fullScreen = true,
}) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-md w-full select-none">
      <style>{`
        @keyframes iplSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes iplGlowPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 12px rgba(255, 130, 0, 0.5)); }
          50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 24px rgba(255, 130, 0, 0.9)); }
        }
        @keyframes shimmerBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Glowing Spinner Centerpiece */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer pulsating glow ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 88,
            height: 88,
            background: 'radial-gradient(circle, rgba(255, 130, 0, 0.25) 0%, rgba(255, 130, 0, 0) 70%)',
            animation: 'iplGlowPulse 2s ease-in-out infinite',
          }}
        />

        {/* Dual rotating spinner rings */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '3px solid rgba(255, 130, 0, 0.15)',
            borderTopColor: '#ff8200',
            borderRightColor: '#ffa726',
            animation: 'iplSpin 0.9s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite',
          }}
        />

        {/* Inner reverse spin ring */}
        <div
          style={{
            position: 'absolute',
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: '2px dashed rgba(255, 255, 255, 0.25)',
            borderBottomColor: '#ff8200',
            animation: 'iplSpin 1.4s linear infinite reverse',
          }}
        />

        {/* Center Cricket Icon */}
        <div
          className="absolute flex items-center justify-center text-2xl"
          style={{
            animation: 'iplGlowPulse 2s ease-in-out infinite',
          }}
        >
          🏏
        </div>
      </div>

      {/* Main Title */}
      <h2
        className="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-2 text-white"
        style={{
          fontFamily: "'Russo One', sans-serif",
          color: '#ff8200',
          letterSpacing: '2px',
          textShadow: '0 0 16px rgba(255, 130, 0, 0.35)',
        }}
      >
        {title}
      </h2>

      {/* Informative Subtitle */}
      {subtitle && (
        <p
          className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xs mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {subtitle}
        </p>
      )}

      {/* Progress Bar (if provided or indeterminate animated bar) */}
      <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden relative border border-white/10">
        {typeof progress === 'number' ? (
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: 'linear-gradient(90deg, #ff8200 0%, #ffd166 100%)',
              boxShadow: '0 0 10px rgba(255, 130, 0, 0.6)',
            }}
          />
        ) : (
          <div
            className="h-full rounded-full w-1/2 absolute"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #ff8200 50%, #ffd166 80%, transparent 100%)',
              animation: 'shimmerBar 1.5s infinite linear',
            }}
          />
        )}
      </div>

      {/* Percentage text if numeric progress */}
      {typeof progress === 'number' && (
        <div className="mt-2 text-[11px] font-bold text-slate-400 tracking-wider">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );

  if (!fullScreen) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        {content}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(18, 16, 25, 0.96)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {content}
    </div>
  );
}
