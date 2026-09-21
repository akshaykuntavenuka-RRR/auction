import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isRealSupabaseConfigured } from '../lib/supabase';
import { useAuction } from '../context/AuctionContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function SignIn() {
  const navigate = useNavigate();
  const { currentUser, signInAsGuest } = useAuction();
  const [username, setUsername] = useState('');
  const breakpoint = useBreakpoint();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isGlowHover, setIsGlowHover] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState('choose_account'); // 'choose_account' | 'manual_login'
  const [gmailInput, setGmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const cardRef = useRef(null);

  // Loading state when transitioning to the next page
  const [loadingState, setLoadingState] = useState({
    active: false,
    progress: 0,
    title: '',
    subtitle: '',
    isGoogle: false,
  });

  useEffect(() => {
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

  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--mouse-x', `50%`);
    cardRef.current.style.setProperty('--mouse-y', `50%`);
  };

  const defaultDeviceAccounts = [
    { name: 'Akshay Kuntavenuka', email: 'akshaykuntavenuka@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Akshay+Kuntavenuka&background=107c41&color=fff' },
    { name: 'Akshay Kuntavenuka', email: 'akshayrowdy932@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Akshay+Kuntavenuka&background=e81123&color=fff' },
    { name: 'Akshay Kuntavenuka', email: 'ak.kuntavenuka@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Akshay+Kuntavenuka&background=008a00&color=fff' },
    { name: 'Akshay Kuntavenuka', email: 'kuntavenuka@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Akshay+Kuntavenuka&background=6b69d6&color=fff' },
    { name: 'Ipl auction', email: 'iauction69@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Ipl+Auction&background=5c2d91&color=fff' },
    { name: 'Kuntavenuka Bhavani', email: 'bhavanikuntavenuka@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Kuntavenuka+Bhavani&background=d13438&color=fff' },
    { name: 'Adarsh Kuntavenuka', email: 'adarshkuntavenuka9334@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Adarsh+Kuntavenuka&background=0072c6&color=fff' }
  ];

  const [deviceAccounts, setDeviceAccounts] = useState(() => {
    const saved = localStorage.getItem('ipl_google_device_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0 && parsed.some(a => a.email && a.email.includes('akshay'))) {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    localStorage.setItem('ipl_google_device_accounts', JSON.stringify(defaultDeviceAccounts));
    return defaultDeviceAccounts;
  });

  // Check URL search params for OAuth errors or callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errDesc = params.get('error_description');
    const errCode = params.get('error_code');
    if (errDesc || errCode) {
      setLoginError(decodeURIComponent(errDesc || errCode || 'Authentication error. Please try again.'));
    }
  }, []);

  // Handle mouse spotlight movement across background (SignIn page only)
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--bg-mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--bg-mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth entrance loading transition into next page
  const startEnteringTransition = ({ name, provider, email, isGoogle = false }) => {
    const finalDisplayName = name && name.trim() ? name.trim() : (isGoogle ? 'Google Owner' : 'Franchise Owner');
    setLoadingState({
      active: true,
      progress: 20,
      title: isGoogle ? 'AUTHENTICATING ACCOUNT' : 'ENTERING THE ARENA',
      subtitle: `Welcome ${finalDisplayName}! Connecting to stadium server...`,
      isGoogle
    });

    let currentProgress = 20;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 14) + 12;
      if (currentProgress >= 95) {
        currentProgress = 96;
        clearInterval(interval);
      }
      
      let nextSub = isGoogle 
        ? 'Syncing Google account & preferences...' 
        : 'Preparing Franchise Dashboard & Rules...';
      if (currentProgress > 70) {
        nextSub = 'Ready! Entering Auction Arena...';
      }

      setLoadingState(prev => ({
        ...prev,
        progress: Math.min(currentProgress, 96),
        subtitle: nextSub
      }));
    }, 130);

    setTimeout(() => {
      clearInterval(interval);
      setLoadingState(prev => ({ ...prev, progress: 100, subtitle: 'Welcome to IPL Mini Auction!' }));
      signInAsGuest(finalDisplayName, provider, email);
      setTimeout(() => {
        navigate('/play-options');
      }, 350);
    }, 1350);
  };

  const handleGoogleClick = async () => {
    if (loadingState.active) return;
    if (isRealSupabaseConfigured()) {
      try {
        setLoadingState({
          active: true,
          progress: 30,
          title: 'CONNECTING TO GOOGLE',
          subtitle: 'Redirecting to Google Authentication...',
          isGoogle: true
        });
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/play-options'
          }
        });
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Google OAuth redirected to local modal:', err);
        setLoadingState({ active: false, progress: 0, title: '', subtitle: '', isGoogle: false });
      }
    }
    setGoogleStep('choose_account');
    setLoginError('');
    setGoogleNameInput(username.trim());
    setShowGoogleModal(true);
  };

  const handleSelectAccount = (acc) => {
    setShowGoogleModal(false);
    startEnteringTransition({
      name: acc.name,
      provider: 'google',
      email: acc.email,
      isGoogle: true
    });
  };

  const handleManualGoogleSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const email = gmailInput.trim();
    const pwd = passwordInput.trim();

    if (!email) {
      setLoginError('Please enter your Gmail address');
      return;
    }
    if (!pwd) {
      setLoginError('Please enter your password');
      return;
    }

    const derivedName = googleNameInput.trim() || username.trim() || email.split('@')[0];

    // Save account to device list
    const newAcc = {
      name: derivedName,
      email: email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=4285F4&textColor=ffffff`
    };

    const updated = [newAcc, ...deviceAccounts.filter(a => a.email !== email)];
    setDeviceAccounts(updated);
    localStorage.setItem('ipl_google_device_accounts', JSON.stringify(updated));

    setShowGoogleModal(false);
    startEnteringTransition({
      name: derivedName,
      provider: 'google',
      email: email,
      isGoogle: true
    });
  };

  const handleGuestSignIn = () => {
    if (loadingState.active) return;
    const finalName = username.trim() || 'Guest Owner';
    startEnteringTransition({
      name: finalName,
      provider: 'guest',
      email: null,
      isGoogle: false
    });
  };




  return (
    <div className="bg-surface text-on-surface w-screen h-screen relative flex flex-col justify-center items-center overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, #0e172a 0%, #0a0020 60%, #030008 100%)', color: '#e6e1e5', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <style>{`
        .glass-panel {
          background: rgba(20, 30, 50, 0.45) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(20, 30, 50, 0.45) 100%) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25) !important;
        }
        .stadium-glow {
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(20, 19, 21, 0) 70%);
        }
        .geometric-lines {
          background-image: 
            linear-gradient(30deg, transparent 45%, rgba(255, 255, 255, 0.05) 48%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.05) 52%, transparent 55%),
            linear-gradient(150deg, transparent 45%, rgba(255, 255, 255, 0.05) 48%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.05) 52%, transparent 55%);
          background-size: 120px 120px;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.92); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.92); opacity: 0.8; }
        }
        @keyframes shimmer-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 2.2s linear infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer-bar 1.5s infinite;
        }
      `}</style>

      {/* Decorative Atmosphere & Stadium Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-85" 
        style={{ backgroundImage: 'url("/stadium_night_view.png")', backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh', width: '100vw', overflow: 'hidden' }} 
      />
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-[#090d16]/70 via-[#0a0020]/30 to-[#050010]/80" />
      <div className="absolute inset-0 z-5 stadium-glow pointer-events-none" />
      <div className="absolute inset-0 z-10 geometric-lines opacity-40 pointer-events-none" />
      
      {/* Ambient Glowing Orbs for Glass Transparency Blur Effect */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-white opacity-20 blur-[100px] pointer-events-none z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-white opacity-15 blur-[120px] pointer-events-none z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white opacity-15 blur-[90px] pointer-events-none z-10" />

      {/* Interactive mouse cursor glow spotlight (SignIn page only) */}
      <div className="bg-mouse-spotlight" />


      <main 
        className="relative z-30 flex flex-col items-center justify-center w-full"
        style={{
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <div 
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          className="glass-panel flex flex-col items-center transform transition-all duration-500 hover:scale-[1.01] relative overflow-hidden"
          style={{
            width: '90%',
            maxWidth: '320px',
            padding: '24px 24px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)'
          }}
        >
          {/* Card content sitting above spotlight glow */}
          <div className="relative z-10 flex flex-col items-center w-full">
            {/* Heading */}
            <div className="text-center mb-5">
              <h1
                className="text-secondary-fixed uppercase tracking-wider"
                style={{ 
                  fontFamily: "'Russo One', sans-serif", 
                  color: '#ff8200',
                  fontSize: '22px',
                  letterSpacing: '1.5px',
                  textShadow: '0 2px 12px rgba(255, 130, 0, 0.4)'
                }}
              >
                Welcome Back
              </h1>
              <p 
                className="mt-1.5 uppercase" 
                style={{ 
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
                }}
              >
                THE HAMMER AWAITS YOUR STRATEGY
              </p>
            </div>

            {/* Login Actions */}
            <div className="w-full space-y-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleClick}
                disabled={loadingState.active}
                onMouseEnter={() => setIsGlowHover(true)}
                onMouseLeave={() => setIsGlowHover(false)}
                className={`w-full h-11 bg-white hover:bg-white/95 text-surface uppercase flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 group relative overflow-hidden rounded-xl shadow-lg ${loadingState.active ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{ 
                  color: '#141315',
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '1px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loadingState.active && loadingState.isGoogle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-[#4285F4] rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Separator */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-[1px] flex-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                <span className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">or</span>
                <div className="h-[1px] flex-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
              </div>

              {/* Owner Nickname Input */}
              <div className="w-full space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider block ml-1" style={{ fontFamily: "'Russo One', sans-serif", color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '1.5px', fontSize: '9px' }}>
                  Your Owner Name
                </label>
                <input
                  type="text"
                  value={username}
                  disabled={loadingState.active}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loadingState.active) {
                      handleGuestSignIn();
                    }
                  }}
                  placeholder="Enter nickname..."
                  className="w-full rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ff8200] focus:ring-1 focus:ring-[#ff8200] transition-all placeholder:text-white/40 disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.45)', 
                    borderColor: 'rgba(255, 255, 255, 0.2)', 
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: '#ffffff', 
                    fontSize: '14px', 
                    fontFamily: "'Russo One', sans-serif",
                    backdropFilter: 'blur(8px)'
                  }}
                />
              </div>

              {/* Action Trigger */}
              <button
                onClick={handleGuestSignIn}
                disabled={loadingState.active}
                className={`w-full h-11 border text-[#ff8200] hover:bg-[#ff8200] hover:text-black uppercase transition-all duration-300 active:scale-95 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md ${loadingState.active ? 'opacity-75 cursor-not-allowed' : ''}`}
                style={{ 
                  backgroundColor: 'rgba(255, 130, 0, 0.12)',
                  borderColor: 'rgba(255, 130, 0, 0.5)',
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '1px'
                }}
              >
                {loadingState.active && !loadingState.isGoogle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#ff8200] border-t-transparent rounded-full animate-spin" />
                    <span>Entering Arena...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Continue as Guest
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[9px] leading-relaxed max-w-[240px] mx-auto text-white/60" style={{ fontFamily: "'Russo One', sans-serif" }}>
                By signing in you agree to our <span className="text-[#ff8200] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#ff8200] hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Google Sign In Account Dialog / Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-gray-900 border border-gray-100"
            style={{ fontFamily: "'Google Sans', 'Roboto', Arial, sans-serif" }}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Step 1: Account Chooser (List of device accounts) */}
            {googleStep === 'choose_account' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                </div>

                <h2 className="text-2xl font-normal text-gray-900 mb-1">Choose an account</h2>
                <p className="text-sm text-gray-600 mb-6">to continue to <strong className="text-gray-900 font-semibold">IPL Auction Game</strong></p>

                {/* Device Accounts List */}
                <div className="divide-y divide-gray-200 border-t border-b border-gray-200 my-4 max-h-72 overflow-y-auto">
                  {deviceAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAccount(acc)}
                      className="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <img src={acc.avatar} alt={acc.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{acc.name}</p>
                        <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Switch to Manual Login */}
                <button
                  onClick={() => setGoogleStep('manual_login')}
                  className="w-full flex items-center gap-4 py-3 px-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <span className="text-lg">👤</span>
                  </div>
                  <span>Use another account</span>
                </button>
              </div>
            )}


            {/* Step 2: Manual Sign In (Email + Password Input) */}
            {googleStep === 'manual_login' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-snug">Sign in</h3>
                      <p className="text-xs text-white/60">Enter your Gmail & Password</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGoogleStep('choose_account')}
                    className="text-xs text-[#4285F4] hover:underline font-semibold"
                  >
                    ← Accounts
                  </button>
                </div>

                <form onSubmit={handleManualGoogleSubmit} className="space-y-4">
                  {loginError && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                      ⚠️ {loginError}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                      Gmail or Phone
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={gmailInput}
                      onChange={(e) => setGmailInput(e.target.value)}
                      placeholder="Enter your Gmail (e.g. virat@gmail.com)"
                      className="w-full bg-[#2a2a2a] border border-white/15 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder:text-white/30"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full bg-[#2a2a2a] border border-white/15 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] rounded-xl pl-4 pr-11 py-3 text-white text-sm outline-none transition-all placeholder:text-white/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        <span className="text-sm">
                          {showPassword ? '👁️' : '🔒'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Display Name Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                      Owner Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder="e.g. King Kohli"
                      className="w-full bg-[#2a2a2a] border border-white/15 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder:text-white/30"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('choose_account')}
                      className="flex-1 py-3 border border-white/15 hover:bg-white/5 text-white/80 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      Sign In →
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay Transition Screen */}
      {loadingState.active && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div 
            className="w-full max-w-sm rounded-3xl p-7 flex flex-col items-center text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(28, 25, 45, 0.9) 0%, rgba(12, 10, 24, 0.96) 100%)',
              border: '1px solid rgba(255, 130, 0, 0.35)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 40px rgba(255, 130, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Ambient Background Glow inside the modal */}
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#ff8200]/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-[#ffd700]/15 blur-2xl pointer-events-none" />

            {/* Central Animated Loader Emblem */}
            <div className="relative w-24 h-24 mb-5 flex items-center justify-center">
              {/* Pulsing ring aura */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ff8200]/30 to-[#ffd700]/10 animate-pulse-ring" />
              
              {/* Outer rotating conic ring */}
              <div 
                className="absolute inset-0 rounded-full animate-spin-slow p-[2.5px]"
                style={{
                  background: loadingState.isGoogle 
                    ? 'conic-gradient(from 0deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4)' 
                    : 'conic-gradient(from 0deg, #ff8200, #ffd700, #ff4500, #ff8200)'
                }}
              >
                <div className="w-full h-full bg-[#0d0d16] rounded-full" />
              </div>

              {/* Inner counter-rotating ring */}
              <div 
                className="absolute inset-2 rounded-full animate-spin-reverse p-[1.5px] opacity-70"
                style={{
                  background: 'conic-gradient(from 180deg, #ffd700, transparent, #ff8200, transparent)'
                }}
              >
                <div className="w-full h-full bg-[#0d0d16] rounded-full" />
              </div>

              {/* Center icon */}
              <div className="relative z-10 text-3xl flex items-center justify-center drop-shadow-[0_0_12px_rgba(255,130,0,0.6)]">
                {loadingState.isGoogle ? (
                  <svg className="w-9 h-9" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                ) : (
                  <span className="transform hover:scale-110 transition-transform">🏏</span>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 
              className="text-lg uppercase tracking-wider mb-1 text-white"
              style={{ 
                fontFamily: "'Russo One', sans-serif",
                letterSpacing: '1.5px',
                color: loadingState.isGoogle ? '#ffffff' : '#ff8200',
                textShadow: '0 2px 10px rgba(255, 130, 0, 0.4)'
              }}
            >
              {loadingState.title}
            </h2>

            {/* Subtitle / Dynamic status message */}
            <p 
              className="text-xs text-white/70 min-h-[32px] flex items-center justify-center mb-5 px-2"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loadingState.subtitle}
            </p>

            {/* Glowing High-Tech Progress Bar */}
            <div className="w-full bg-black/60 rounded-full h-3 p-0.5 border border-white/15 relative overflow-hidden mb-2 shadow-inner">
              <div 
                className="h-full rounded-full relative overflow-hidden transition-all duration-200 ease-out"
                style={{
                  width: `${loadingState.progress}%`,
                  background: loadingState.isGoogle
                    ? 'linear-gradient(90deg, #4285F4 0%, #34A853 50%, #FBBC05 100%)'
                    : 'linear-gradient(90deg, #ff8200 0%, #ffd700 70%, #ff5500 100%)',
                  boxShadow: '0 0 12px rgba(255, 130, 0, 0.7)'
                }}
              >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Percentage & Stadium Indicator */}
            <div className="w-full flex items-center justify-between text-[11px] font-bold text-white/60 px-1" style={{ fontFamily: "'Russo One', sans-serif" }}>
              <span className="flex items-center gap-1.5 text-[#ff8200]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff8200] animate-ping" />
                STADIUM LINK
              </span>
              <span>{loadingState.progress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


