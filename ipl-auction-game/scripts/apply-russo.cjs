const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

// Helper to replace content in a file
function updateFile(filePath, replacements) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File does not exist: ${absolutePath}`);
    return;
  }
  let content = fs.readFileSync(absolutePath, 'utf8');
  let original = content;

  for (const r of replacements) {
    if (content.includes(r.target)) {
      content = content.replace(new RegExp(escapeRegExp(r.target), 'g'), r.replacement);
      console.log(`  [REPLACED] inside ${path.basename(filePath)}`);
    } else {
      console.warn(`  [WARNING] Target string not found in ${path.basename(filePath)}: "${r.target.substring(0, 50)}..."`);
    }
  }

  if (content !== original) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`[SUCCESS] Updated ${path.basename(filePath)}`);
  } else {
    console.log(`[NO CHANGES] ${path.basename(filePath)} already clean or not matching`);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// -------------------------------------------------------------
// 1. UPDATE Setup.jsx
// -------------------------------------------------------------
const setupPath = path.join(srcDir, 'pages', 'Setup.jsx');
const setupReplacements = [
  {
    target: '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />',
    replacement: '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />'
  },
  {
    target: `<span className="font-display-md text-3xl text-secondary-fixed tracking-widest font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>IPL AUCTION</span>`,
    replacement: `<span className="text-secondary-fixed tracking-widest" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>IPL AUCTION</span>`
  },
  {
    target: `<h1 className="text-5xl md:text-6xl text-secondary-fixed font-bold leading-none mb-2 drop-shadow-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>\n            IPL AUCTION\n          </h1>`,
    replacement: `<h1 className="text-secondary-fixed mb-2 drop-shadow-2xl" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>\n            IPL AUCTION\n          </h1>`
  },
  {
    target: `<p className="text-sm sm:text-lg text-on-surface-variant tracking-wide opacity-75" style={{ color: '#cbc4ce' }}>`,
    replacement: `<p className="text-on-surface-variant opacity-75" style={{ color: '#cbc4ce', fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(12px, 1.8vw, 14px)', letterSpacing: '0.5px' }}>`
  },
  {
    target: `<h3 className="text-3xl text-on-surface font-bold mt-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>`,
    replacement: `<h3 className="text-on-surface font-bold mt-1" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>`
  },
  {
    target: `<span className="text-2xl text-secondary-fixed font-bold tracking-widest text-[#ff8200]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>`,
    replacement: `<span className="text-secondary-fixed tracking-widest text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>`
  },
  {
    target: `<h2 className="text-3xl text-[#ff8200] font-bold uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>`,
    replacement: `<h2 className="text-[#ff8200] font-bold uppercase" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>`
  },
  {
    target: `<h2 className="text-2xl text-on-surface uppercase tracking-wider font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Number of Teams</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Number of Teams</h2>`
  },
  {
    target: `<h2 className="text-2xl text-on-surface uppercase tracking-wider font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Budget per Team</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Budget per Team</h2>`
  },
  {
    target: `<div className="text-3xl text-secondary-fixed font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>\n                ₹{budgetCr} Cr\n              </div>`,
    replacement: `<div className="text-secondary-fixed font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#FFD700', fontSize: 'clamp(20px, 3.5vw, 32px)' }}>\n                ₹{budgetCr} Cr\n              </div>`
  },
  {
    target: `<h2 className="text-2xl text-on-surface uppercase tracking-wider font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>AI Managers Difficulty</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>AI Managers Difficulty</h2>`
  },
  {
    target: `<h2 className="text-2xl text-on-surface uppercase tracking-wider font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Player Auction Order</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Player Auction Order</h2>`
  },
  {
    target: `<span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: '0.1em' }}>{label}</span>`,
    replacement: `<span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(13px, 2vw, 16px)', letterSpacing: '1px' }}>{label}</span>`
  },
  {
    target: `<h2 className="text-2xl text-on-surface uppercase tracking-wider font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Bidding Timer</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Bidding Timer</h2>`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                  fontSize: 36,\n                  color: '#ff8200',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                  fontSize: 'clamp(20px, 3.5vw, 32px)',\n                  color: '#FFD700',`
  },
  {
    target: `fontSize: 12,\n                    fontFamily: "'Bebas Neue', sans-serif",\n                    letterSpacing: '0.08em',`,
    replacement: `fontSize: 12,\n                    fontFamily: "'Russo One', sans-serif",\n                    letterSpacing: '1px',`
  },
  {
    target: `<h2 className="text-2xl text-on-surface uppercase tracking-wider font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Define Team Names</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Define Team Names</h2>`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                          color: team.isUser ? '#ff8200' : '#e6e1e5',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                          color: team.isUser ? '#ff8200' : '#e6e1e5',`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                background: breakpoint.isMobile ? '#0a0020' : 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                background: breakpoint.isMobile ? '#0a0020' : 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',\n                fontSize: 'clamp(16px, 2.5vw, 22px)',\n                letterSpacing: '3px',`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                      background: isActive ? 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)' : 'transparent',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                      background: isActive ? 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)' : 'transparent',`
  }
];

// -------------------------------------------------------------
// 2. UPDATE CreateRoom.jsx
// -------------------------------------------------------------
const createRoomPath = path.join(srcDir, 'pages', 'CreateRoom.jsx');
const createRoomReplacements = [
  {
    target: '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />',
    replacement: '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />'
  },
  {
    target: `<span className="font-display-md text-3xl text-secondary-fixed tracking-widest font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>IPL AUCTION</span>`,
    replacement: `<span className="text-secondary-fixed tracking-widest" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>IPL AUCTION</span>`
  },
  {
    target: `<h1 className="text-4xl sm:text-5xl md:text-6xl text-secondary-fixed font-bold leading-none mb-2 drop-shadow-2xl uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>\n            Create a Room\n          </h1>`,
    replacement: `<h1 className="text-secondary-fixed mb-2 drop-shadow-2xl uppercase" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>\n            Create a Room\n          </h1>`
  },
  {
    target: `<h2 className="text-lg text-on-surface uppercase font-bold tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Claim Your Team Name</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Claim Your Team Name</h2>`
  },
  {
    target: `<h2 className="text-lg text-on-surface uppercase font-bold tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Choose Team Color</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Choose Team Color</h2>`
  },
  {
    target: `<h2 className="text-lg text-on-surface uppercase font-bold tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Max Teams in Lobby</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Max Teams in Lobby</h2>`
  },
  {
    target: `<h2 className="text-lg text-on-surface uppercase font-bold tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Player Budget Limit</h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#9980c8' }}>Player Budget Limit</h2>`
  },
  {
    target: `<div className="text-xl text-secondary-fixed font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>\n                ₹{budgetCr} Cr\n              </div>`,
    replacement: `<div className="text-secondary-fixed font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#FFD700', fontSize: 'clamp(20px, 3.5vw, 32px)' }}>\n                ₹{budgetCr} Cr\n              </div>`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                      background: isActive ? 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)' : 'transparent',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                      background: isActive ? 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)' : 'transparent',`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',\n                fontSize: 'clamp(16px, 2.5vw, 22px)',\n                letterSpacing: '2px',`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n              background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n              background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',\n              fontSize: 'clamp(16px, 2.5vw, 22px)',\n              letterSpacing: '2px',`
  }
];

// -------------------------------------------------------------
// 3. UPDATE JoinRoom.jsx
// -------------------------------------------------------------
const joinRoomPath = path.join(srcDir, 'pages', 'JoinRoom.jsx');
const joinRoomReplacements = [
  {
    target: '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />',
    replacement: '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />'
  },
  {
    target: `<span className="font-bold text-3xl tracking-widest uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>IPL AUCTION</span>`,
    replacement: `<span className="text-secondary-fixed tracking-widest" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>IPL AUCTION</span>`
  },
  {
    target: `<h1 className="text-3xl text-secondary-fixed uppercase tracking-wider font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>\n              Join a Room\n            </h1>`,
    replacement: `<h1 className="text-secondary-fixed uppercase tracking-wider font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(20px, 3.5vw, 32px)', letterSpacing: '2px' }}>\n              Join a Room\n            </h1>`
  },
  {
    target: `background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',`,
    replacement: `background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',\n                fontFamily: "'Russo One', sans-serif",\n                fontSize: 'clamp(16px, 2.5vw, 22px)',\n                letterSpacing: '2px',`
  }
];

// -------------------------------------------------------------
// 4. UPDATE Lobby.jsx
// -------------------------------------------------------------
const lobbyPath = path.join(srcDir, 'pages', 'Lobby.jsx');
const lobbyReplacements = [
  {
    target: '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />',
    replacement: '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />'
  },
  {
    target: `<span className="font-display-md text-3xl text-secondary-fixed tracking-widest font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>IPL AUCTION</span>`,
    replacement: `<span className="text-secondary-fixed tracking-widest" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>IPL AUCTION</span>`
  },
  {
    target: `<h1 className="text-4xl text-on-surface font-bold mt-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>AUCTION LOBBY</h1>`,
    replacement: `<h1 className="text-on-surface font-bold mt-1" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(24px, 5vw, 48px)', letterSpacing: '3px' }}>AUCTION LOBBY</h1>`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                    fontSize: breakpoint.isMobile ? '24px' : '32px'`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                    fontSize: 'clamp(24px, 5vw, 48px)',\n                    letterSpacing: '8px'`
  },
  {
    target: `<h2 className="text-xl uppercase font-bold tracking-wider text-[#ff8200]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>\n              Claim Your Franchise Team\n            </h2>`,
    replacement: `<h2 className="text-on-surface uppercase font-bold text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>\n              Claim Your Franchise Team\n            </h2>`
  },
  {
    target: `<h2 className="text-3xl uppercase font-bold tracking-widest mb-6 text-[#ff8200] drop-shadow-[0_2px_10px_rgba(255,130,0,0.15)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>\n                Joined Players\n              </h2>`,
    replacement: `<h2 className="uppercase font-bold mb-6 text-[#ff8200] drop-shadow-[0_2px_10px_rgba(255,130,0,0.15)]" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>\n                Joined Players\n              </h2>`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                      background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                      background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',\n                      fontSize: 'clamp(16px, 2.5vw, 22px)',\n                      letterSpacing: '2px',`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                      backgroundColor: '#00C853',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                      backgroundColor: '#00C853',\n                      fontSize: 'clamp(16px, 2.5vw, 22px)',\n                      letterSpacing: '2px',`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                      background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',\n                      color: '#141315',\n                      opacity: starting ? 0.6 : 1,\n                      boxShadow: '0 0 25px rgba(255, 130, 0, 0.4)'`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                      background: 'linear-gradient(135deg, #ff8200 0%, #e05a00 100%)',\n                      color: '#141315',\n                      opacity: starting ? 0.6 : 1,\n                      fontSize: 'clamp(16px, 2.5vw, 22px)',\n                      letterSpacing: '2px',\n                      boxShadow: '0 0 25px rgba(255, 130, 0, 0.4)'`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n                      backgroundColor: '#00C853',\n                      color: '#141315',\n                      boxShadow: '0 0 25px rgba(0, 200, 83, 0.3)'`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n                      backgroundColor: '#00C853',\n                      color: '#141315',\n                      fontSize: 'clamp(16px, 2.5vw, 22px)',\n                      letterSpacing: '2px',\n                      boxShadow: '0 0 25px rgba(0, 200, 83, 0.3)'`
  }
];

// -------------------------------------------------------------
// 5. UPDATE PlayerCard.jsx
// -------------------------------------------------------------
const playerCardPath = path.join(srcDir, 'components', 'PlayerCard.jsx');
const playerCardReplacements = [
  {
    target: `div style={{ fontSize: 14, fontWeight: 800, color: '#4ade80', fontFamily: "'Bebas Neue', sans-serif" }}`,
    replacement: `div style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#4ade80', fontFamily: "'Russo One', sans-serif" }}`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n            fontSize: breakpoint.isMobile ? '18px' : breakpoint.isTablet ? '22px' : '26px',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n            fontSize: 'clamp(20px, 3.5vw, 32px)',\n            letterSpacing: '2px',`
  },
  {
    target: `span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#e6e1e5' }}`,
    replacement: `span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#FFD700', letterSpacing: '1.5px' }}`
  },
  {
    target: `div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#ff8200', lineHeight: 1 }}`,
    replacement: `div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#FFD700', lineHeight: 1, letterSpacing: '1.5px' }}`
  }
];

// -------------------------------------------------------------
// 6. UPDATE LiveTeamsPanel.jsx
// -------------------------------------------------------------
const liveTeamsPath = path.join(srcDir, 'components', 'LiveTeamsPanel.jsx');
const liveTeamsReplacements = [
  {
    target: `div style={{ fontSize: 13, fontWeight: 700, color: '#ff8200', letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}`,
    replacement: `div style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#ff8200', letterSpacing: '2px', fontFamily: "'Russo One', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}`
  },
  {
    target: `div style={{ fontSize: 12, fontWeight: 700, color: '#ff8200', letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif" }}`,
    replacement: `div style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#ff8200', letterSpacing: '2px', fontFamily: "'Russo One', sans-serif" }}`
  }
];

// -------------------------------------------------------------
// 7. UPDATE Results.jsx
// -------------------------------------------------------------
const resultsPath = path.join(srcDir, 'pages', 'Results.jsx');
const resultsReplacements = [
  {
    target: '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />',
    replacement: '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />'
  },
  {
    target: `<h1 className="font-display-md text-3xl text-secondary-fixed tracking-widest uppercase font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>\n            IPL\n          </h1>`,
    replacement: `<h1 className="text-secondary-fixed tracking-widest uppercase" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>\n            IPL AUCTION\n          </h1>`
  },
  {
    target: `<h2 className="text-5xl md:text-7xl text-secondary-fixed-dim drop-shadow-[0_0_15px_rgba(255,130,0,0.4)] mb-2 uppercase font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#e05a00' }}>\n              🏆 Auction Complete!\n            </h2>`,
    replacement: `<h2 className="text-secondary-fixed-dim drop-shadow-[0_0_15px_rgba(255,130,0,0.4)] mb-2 uppercase" style={{ fontFamily: "'Russo One', sans-serif", color: '#FFD700', fontSize: 'clamp(24px, 5vw, 48px)', letterSpacing: '3px' }}>\n              🏆 Auction Complete!\n            </h2>`
  },
  {
    target: `<h3 className="text-3xl font-bold uppercase tracking-wider mb-2 text-[#ff8200]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>`,
    replacement: `<h3 className="text-3xl font-bold uppercase tracking-wider mb-2 text-[#ff8200]" style={{ fontFamily: "'Russo One', sans-serif" }}>`
  },
  {
    target: `<h3 className="text-2xl text-on-surface font-bold uppercase tracking-wider leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{team.name}</h3>`,
    replacement: `<h3 className="text-on-surface font-bold uppercase tracking-wider leading-none" style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>{team.name}</h3>`
  },
  {
    target: `fontFamily: "'Bebas Neue', sans-serif",\n              backgroundImage: 'linear-gradient(to right, #ff8200, #ff9d47)',`,
    replacement: `fontFamily: "'Russo One', sans-serif",\n              backgroundImage: 'linear-gradient(to right, #ff8200, #ff9d47)',\n              fontSize: 'clamp(16px, 2.5vw, 22px)',\n              letterSpacing: '3px',`
  },
  {
    target: `<h3 className="text-2xl text-secondary-fixed mb-6 uppercase border-l-4 border-secondary-fixed pl-4 font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200', borderColor: '#ff8200' }}>`,
    replacement: `<h3 className="text-secondary-fixed mb-6 uppercase border-l-4 border-secondary-fixed pl-4 font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', borderColor: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)' }}>`
  },
  {
    target: `<h1 className="font-display-md text-3xl text-secondary-fixed tracking-widest uppercase font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>\n            IPL AUCTION\n          </h1>`,
    replacement: `<h1 className="text-secondary-fixed tracking-widest uppercase" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>\n            IPL AUCTION\n          </h1>`
  },
  {
    target: `<span className="font-stats-numeric text-3xl text-secondary-fixed font-semibold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>\n                          {teamSquad.length}\n                        </span>`,
    replacement: `<span className="font-stats-numeric text-secondary-fixed" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '1.5px' }}>\n                          {teamSquad.length}\n                        </span>`
  }
];

// -------------------------------------------------------------
// 8. UPDATE Auction.jsx
// -------------------------------------------------------------
const auctionPath = path.join(srcDir, 'pages', 'Auction.jsx');
const auctionReplacements = [
  {
    target: `style={{ fontFamily: "'Bebas Neue', sans-serif" }}`,
    replacement: `style={{ fontFamily: "'Russo One', sans-serif" }}`
  },
  {
    target: `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />`,
    replacement: `<!-- Russo One is loaded globally -->`
  },
  {
    target: `style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#ff8200', letterSpacing: 4 }}`,
    replacement: `style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#ff8200', letterSpacing: '2px' }}`
  },
  {
    target: `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />`,
    replacement: `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />`
  },
  {
    target: `<span className="font-display-md text-xl sm:text-3xl text-secondary-fixed tracking-wider sm:tracking-widest uppercase font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>`,
    replacement: `<span className="text-secondary-fixed tracking-wider sm:tracking-widest uppercase font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#ff8200', fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '4px' }}>`
  },
  {
    target: `<span className="font-stats-numeric text-base sm:text-lg text-secondary-fixed leading-none font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ff8200' }}>`,
    replacement: `<span className="font-stats-numeric text-base sm:text-lg text-secondary-fixed leading-none font-bold" style={{ fontFamily: "'Russo One', sans-serif", color: '#FFD700', fontSize: '12px' }}>`
  }
];

// -------------------------------------------------------------
// 9. UPDATE AdminSync.jsx
// -------------------------------------------------------------
const adminSyncPath = path.join(srcDir, 'pages', 'AdminSync.jsx');
const adminSyncReplacements = [
  {
    target: '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />',
    replacement: '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />'
  },
  {
    target: `fontFamily: "'Manrope', sans-serif"`,
    replacement: `fontFamily: "'Russo One', sans-serif"`
  },
  {
    target: `style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 4, color: '#ff8200' }}`,
    replacement: `style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '2px', color: '#ff8200' }}`
  },
  {
    target: `style={{ fontSize: 48, fontWeight: 800, color: '#ff8200', lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif" }}`,
    replacement: `style={{ fontSize: 'clamp(24px, 5vw, 48px)', color: '#ff8200', lineHeight: 1, fontFamily: "'Russo One', sans-serif", letterSpacing: '3px' }}`
  },
  {
    target: `style={{ fontSize: 22, fontWeight: 800, color: item.color, fontFamily: "'Bebas Neue', sans-serif" }}`,
    replacement: `style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: item.color, fontFamily: "'Russo One', sans-serif" }}`
  }
];

console.log("Processing Setup.jsx...");
updateFile(setupPath, setupReplacements);

console.log("Processing CreateRoom.jsx...");
updateFile(createRoomPath, createRoomReplacements);

console.log("Processing JoinRoom.jsx...");
updateFile(joinRoomPath, joinRoomReplacements);

console.log("Processing Lobby.jsx...");
updateFile(lobbyPath, lobbyReplacements);

console.log("Processing PlayerCard.jsx...");
updateFile(playerCardPath, playerCardReplacements);

console.log("Processing LiveTeamsPanel.jsx...");
updateFile(liveTeamsPath, liveTeamsReplacements);

console.log("Processing Results.jsx...");
updateFile(resultsPath, resultsReplacements);

console.log("Processing Auction.jsx...");
updateFile(auctionPath, auctionReplacements);

console.log("Processing AdminSync.jsx...");
updateFile(adminSyncPath, adminSyncReplacements);

console.log("Substitutions Script complete.");
