import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';

const iplTeamLogos = [
  { name: 'CSK', logo: '/logos/csk.svg' },
  { name: 'MI', logo: '/logos/mi.svg' },
  { name: 'RCB', logo: '/logos/rcb.svg' },
  { name: 'KKR', logo: '/logos/kkr.svg' },
  { name: 'DC', logo: '/logos/dc.svg' },
  { name: 'GT', logo: '/logos/gt.svg' },
  { name: 'RR', logo: '/logos/rr.svg' },
  { name: 'SRH', logo: '/logos/srh.svg' },
  { name: 'LSG', logo: '/logos/lsg.svg' },
  { name: 'PBKS', logo: '/logos/pbks.svg' },
];

export default function ProfileMenu() {
  const navigate = useNavigate();
  const { currentUser, logout, setCurrentUser } = useAuction();

  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toast, setToast] = useState('');

  const menuRef = useRef(null);
  const fileRef = useRef(null);


  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setEditingName(false);
        setEditingAvatar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };


  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    // Update local user metadata (works for guest & real users display)
    setCurrentUser(prev => ({
      ...prev,
      user_metadata: { ...prev.user_metadata, full_name: trimmed }
    }));
    // Persist for guests
    const guest = sessionStorage.getItem('ipl_guest_user');
    if (guest) {
      const parsed = JSON.parse(guest);
      parsed.user_metadata.full_name = trimmed;
      sessionStorage.setItem('ipl_guest_user', JSON.stringify(parsed));
    }
    localStorage.setItem('ipl_display_name', trimmed);
    setEditingName(false);
    showToast('✅ Name updated!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem('ipl_custom_avatar', dataUrl);
      setCurrentUser(prev => ({
        ...prev,
        user_metadata: { ...prev.user_metadata, avatar_url: dataUrl }
      }));
      setAvatarPreview(dataUrl);
      showToast('✅ Avatar updated!');
      setEditingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectTeamAvatar = (logoUrl) => {
    localStorage.setItem('ipl_custom_avatar', logoUrl);
    setCurrentUser(prev => ({
      ...prev,
      user_metadata: { ...prev.user_metadata, avatar_url: logoUrl }
    }));
    setAvatarPreview(logoUrl);
    showToast('✅ Avatar updated!');
    setEditingAvatar(false);
  };

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    navigate('/signin');
  };


  if (!currentUser) {
    return (
      <button
        onClick={() => navigate('/signin')}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#ff8200', color: '#141315' }}
      >
        <span>🚪</span>
        Sign In
      </button>
    );
  }

  const displayName = currentUser.user_metadata?.full_name || 'Player';
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff8200&color=141315&bold=true`;
  const avatarUrl = avatarPreview || currentUser.user_metadata?.avatar_url || fallbackUrl;

  const isGuest = 
    currentUser.role === 'guest' || 
    currentUser.user_metadata?.provider === 'guest' || 
    (currentUser.id && String(currentUser.id).startsWith('guest-'));

  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      {/* Name label */}
      <span className="text-xs font-bold uppercase tracking-wider hidden sm:block" style={{ color: '#cbc4ce', fontFamily: "'Russo One', sans-serif" }}>
        {displayName}
      </span>

      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-full border-2 overflow-hidden focus:outline-none transition-all hover:scale-110 hover:shadow-[0_0_12px_rgba(255,130,0,0.5)] cursor-pointer"
        style={{ borderColor: open ? '#ff8200' : 'rgba(255, 130, 0, 0.5)' }}
        title="Profile menu"
      >
        <img 
          alt="Profile" 
          className="w-full h-full object-cover" 
          src={avatarUrl} 
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackUrl; }}
        />
      </button>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-16 right-6 z-[999] px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-fade-in"
          style={{ backgroundColor: '#1d1b1e', border: '1px solid rgba(255,130,0,0.3)', color: '#ff8200' }}
        >
          {toast}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-12 w-72 rounded-2xl shadow-2xl z-[200] overflow-hidden"
          style={{
            backgroundColor: '#1d1b1e',
            border: '1px solid rgba(255, 130, 0, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2"
                  style={{ borderColor: '#ff8200' }}
                  src={avatarUrl}
                  onError={(e) => { e.target.onerror = null; e.target.src = fallbackUrl; }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00C853] border-2 border-[#1d1b1e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: '#ff8200' }}>{displayName}</p>
                <p className="text-[10px] opacity-50 truncate" style={{ color: '#cbc4ce' }}>
                  {currentUser.email || 'Guest Player'}
                </p>
                <span
                  className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'rgba(255,130,0,0.12)', color: '#ff8200' }}
                >
                  {isGuest ? 'Guest' : 'Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">

            {!isGuest && (
              <>
                {/* Change Name */}
                <div>
                  <button
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors text-left cursor-pointer"
                    style={{ color: '#e6e1e5' }}
                    onClick={() => { setEditingName(e => !e); setNameInput(displayName); setEditingAvatar(false); }}
                  >
                    <span className="text-base" style={{ color: '#ff8200' }}>🏷️</span>
                    Change Display Name
                    <span className="text-xs ml-auto opacity-40">
                      {editingName ? '▲' : '▶'}
                    </span>
                  </button>
                  {editingName && (
                    <div className="px-5 pb-3 flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                        placeholder="Enter your name..."
                        className="flex-1 h-9 bg-white/5 border border-white/10 focus:border-[#ff8200] rounded-lg px-3 text-xs text-white outline-none transition-colors"
                      />
                      <button
                        onClick={handleSaveName}
                        title="Save Name"
                        className="w-9 h-9 flex items-center justify-center rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                        style={{ backgroundColor: '#ff8200', color: '#141315' }}
                      >
                        <span>✓</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Change Avatar */}
                <div>
                  <button
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors text-left cursor-pointer"
                    style={{ color: '#e6e1e5' }}
                    onClick={() => { setEditingAvatar(e => !e); setEditingName(false); }}
                  >
                    <span className="text-base" style={{ color: '#00C9FF' }}>📷</span>
                    Change Avatar / Photo
                    <span className="text-xs ml-auto opacity-40">
                      {editingAvatar ? '▲' : '▶'}
                    </span>
                  </button>
                  {editingAvatar && (
                    <div className="px-5 pb-3 space-y-3">
                      {/* Upload file */}
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                        style={{ color: '#00C9FF' }}
                      >
                        <span>📤</span>
                        Upload from device
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                      {/* Select Avatar Option */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Russo One', sans-serif" }}>
                          Select Team Avatar
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {iplTeamLogos.map((team) => (
                            <button
                              key={team.name}
                              onClick={() => handleSelectTeamAvatar(team.logo)}
                              title={team.name}
                              className="w-10 h-10 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00C9FF] hover:bg-white/10 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group cursor-pointer"
                            >
                              <img
                                src={team.logo}
                                alt={team.name}
                                className="w-full h-full object-contain filter drop-shadow"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="my-1 mx-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
              </>
            )}



            {/* Logout */}
            <button
              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-red-500/10 transition-colors text-left group cursor-pointer"
              style={{ color: '#e6e1e5' }}
              onClick={handleLogout}
            >
              <span className="text-base text-red-400 group-hover:text-red-300 transition-colors">🚪</span>
              <span className="group-hover:text-red-300 transition-colors">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
