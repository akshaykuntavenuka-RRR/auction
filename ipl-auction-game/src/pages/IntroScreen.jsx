import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function IntroScreen() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  const handleBegin = () => {
    navigate('/signin');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      <style>{`
        .glow-button {
          color: #E8941A;
          border: 2px solid #E8941A;
          background: rgba(232, 148, 26, 0.05);
          text-shadow: 0 0 8px rgba(232, 148, 26, 0.5);
          box-shadow: 0 0 15px rgba(232, 148, 26, 0.3);
          transition: all 0.3s ease-in-out;
          font-family: 'Russo One', sans-serif;
        }

        .glow-button:hover {
          background: #E8941A;
          color: #000;
          box-shadow: 0 0 30px rgba(232, 148, 26, 0.9);
          text-shadow: none;
        }

        .animate-pulse-glow {
          animation: pulse-glow-kf 2s infinite ease-in-out;
        }

        @keyframes pulse-glow-kf {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(232, 148, 26, 0.4);
          }
          50% {
            transform: scale(1.06);
            box-shadow: 0 0 35px rgba(232, 148, 26, 0.8);
          }
        }
      `}</style>

      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/videos/cricket-promo.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Subtle Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      />

      {/* TAP TO BEGIN Button Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <button
          onClick={handleBegin}
          className="glow-button animate-pulse-glow px-10 py-5 rounded-full text-xl font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-95"
        >
          TAP TO BEGIN
        </button>
      </div>
    </div>
  );
}
