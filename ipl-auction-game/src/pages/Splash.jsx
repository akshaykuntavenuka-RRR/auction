import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Splash() {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);
  const breakpoint = useBreakpoint();

  // Generate floating background particles dynamically
  useEffect(() => {
    const generated = Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 4 + 2;
      return {
        id: i,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 5 + 5,
        opacity: Math.random(),
      };
    });
    setParticles(generated);
  }, []);

  const handleBegin = () => {
    // Add screen flash transition effect
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-white z-[100] transition-opacity duration-300 pointer-events-none opacity-30';
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.classList.remove('opacity-30');
      flash.classList.add('opacity-0');
      setTimeout(() => {
        flash.remove();
        navigate('/signin');
      }, 300);
    }, 150);
  };

  return (
    <div 
      className="bg-primary-container min-h-screen flex flex-col items-center justify-center overflow-hidden relative" 
      style={{ 
        backgroundColor: '#0a0020',
        padding: breakpoint.isMobile ? '20px' : '40px'
      }}
    >
      {/* CSS styles */}
      <style>{`
        .glass-glow {
          background: rgba(255, 215, 0, 0.05);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 215, 0, 0.2);
          box-shadow: inset 0 0 20px rgba(255, 215, 0, 0.1);
        }

        .animate-pulse-gold {
          animation: pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse-gold {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
          }
        }

        .stadium-lights {
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(102, 87, 126, 0.1) 0%, transparent 40%);
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      {/* Background Floating Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-30 stadium-lights">
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#ff8200',
              borderRadius: '50%',
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: p.opacity,
              animation: `float-particle ${p.duration}s infinite ease-in-out`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg text-center">
        {/* App Logo */}
        <div 
          className="mb-6 animate-pulse flex items-center justify-center"
          style={{
            width: breakpoint.isMobile ? '85px' : breakpoint.isTablet ? '110px' : '140px',
            height: breakpoint.isMobile ? '85px' : breakpoint.isTablet ? '110px' : '140px',
          }}
        >
          <img
            alt="IPL Auction Logo"
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS2rpJnbQDjbe6PvAmw19AkrrUP8uSixmpQ0fkSGjavyORB5KuBqAiB4SrlpSzC_rF31JEkKjYsB1ABQ9RarUEM_8gNCvUBJrgmgB740X0NOedQtaunL-WjWc2hGudq5MTeVA6FbRr2D2z2rKIuxRKReFNYUEDid-U5QqCpAmggbrgxb12W1ww6fN1LNyf-ROtfNbcptPWAXuWoTMgrivmHkKyoTeT5jIPZnC5Yovil22DPituZBzlLoJFZZ-1qG3f91aAeeQZnEmo"
          />
        </div>

        {/* Branding */}
        <div className="space-y-3 w-full">
          <h1 
            className="drop-shadow-lg uppercase" 
            style={{ 
              fontFamily: "'Russo One', sans-serif", 
              color: '#ffffff',
              fontSize: 'clamp(24px, 5vw, 48px)',
              letterSpacing: '3px',
              lineHeight: '1.2'
            }}
          >
            IPL MINI AUCTION
          </h1>
          <p 
            className="max-w-xs mx-auto" 
            style={{ 
              fontFamily: "'Russo One', sans-serif", 
              color: 'rgba(255,255,255,0.5)',
              fontSize: 'clamp(12px, 1.8vw, 14px)',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}
          >
            The Ultimate Friends Auction Experience
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-12 w-full px-4 flex flex-col items-center">
          <button
            onClick={handleBegin}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-primary-container bg-secondary-fixed rounded-full shadow-lg shadow-secondary-fixed/20 transition-all duration-300 active:scale-95 animate-pulse-gold overflow-hidden"
            style={{ 
              fontFamily: "'Russo One', sans-serif", 
              backgroundColor: '#ff8200', 
              color: '#0a0020',
              fontSize: 'clamp(13px, 2vw, 16px)',
              letterSpacing: '3px',
              width: breakpoint.isMobile ? '100%' : 'auto'
            }}
          >
            <span className="relative z-10">TAP TO BEGIN</span>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </button>

          <div 
            className="mt-6 flex items-center justify-center gap-2 text-on-primary-container opacity-50 font-label-caps text-xs tracking-widest uppercase" 
            style={{ color: '#cfbdfe', fontSize: '10px' }}
          >
            <span>🏏</span>
            LIVE FROM THE ARENA
          </div>
        </div>
      </main>

      {/* Decorative Lighting */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-fixed/5 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255, 130, 0, 0.05)' }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(207, 189, 254, 0.05)' }} />
      </div>

      <style>{`
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-300px) translateX(50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
