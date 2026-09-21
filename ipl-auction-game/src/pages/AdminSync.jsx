import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { syncAllIPLPlayersToSupabase } from '../lib/playerSync';
import { supabase } from '../lib/supabase';
import { mockPlayers } from '../data/players';

export default function AdminSync() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [supabaseStats, setSupabaseStats] = useState({
    total: 0,
    batsmen: 0,
    wicketkeepers: 0,
    allRounders: 0,
    bowlers: 0,
    loaded: false,
  });
  const logEndRef = useRef(null);

  useEffect(() => {
    async function fetchDbStats() {
      try {
        const { data, error } = await supabase.from('players').select('role');
        if (!error && data && data.length > 0) {
          const bat = data.filter(p => p.role === 'BAT').length;
          const wk = data.filter(p => p.role === 'WK').length;
          const ar = data.filter(p => p.role === 'AR').length;
          const bowl = data.filter(p => p.role === 'BOWL').length;
          setSupabaseStats({
            total: data.length,
            batsmen: bat,
            wicketkeepers: wk,
            allRounders: ar,
            bowlers: bowl,
            loaded: true,
          });
        }
      } catch (e) {
        console.warn('Failed to load live Supabase player stats:', e);
      }
    }
    fetchDbStats();
  }, [done]);

  const totalPlayers = supabaseStats.loaded ? supabaseStats.total : mockPlayers.length;

  function addLog(entry) {
    setLogs(prev => {
      const next = [...prev, { ...entry, ts: Date.now() }];
      return next;
    });
    // Scroll log to bottom
    setTimeout(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setDone(false);
    setProgress(0);
    setLogs([]);

    let synced = 0;

    await syncAllIPLPlayersToSupabase((entry) => {
      addLog(entry);
      if (entry.type === 'success') {
        // Extract count from message like "✅ Batch 3 synced (60/135 players)"
        const match = entry.message.match(/\((\d+)\/(\d+)/);
        if (match) {
          const current = parseInt(match[1], 10);
          const total = parseInt(match[2], 10);
          setProgress(Math.round((current / total) * 100));
          synced = current;
        }
      }
    });

    setProgress(100);
    setSyncing(false);
    setDone(true);
  }

  function getLogColor(type) {
    if (type === 'success') return '#4ade80';
    if (type === 'error') return '#f87171';
    if (type === 'warn') return '#fbbf24';
    return '#94a3b8';
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 20%, #1a0533 0%, #0f0e10 60%, #141315 100%)',
      color: '#e6e1e5',
      fontFamily: "'Russo One', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'rgba(14,13,15,0.8)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbc4ce',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          <svg className="w-5 h-5 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div>
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', letterSpacing: '2px', color: '#ff8200' }}>
            🏏 IPL PLAYER SYNC
          </div>
          <div style={{ fontSize: 11, color: '#9c8faa', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
            Admin Panel · Data Management
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', flex: 1, width: '100%' }}>
        
        {/* Stats Card */}
        <div style={{
          background: 'rgba(54,52,55,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '24px 32px',
          marginBottom: 24,
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 'clamp(24px, 5vw, 48px)', color: '#ff8200', lineHeight: 1, fontFamily: "'Russo One', sans-serif", letterSpacing: '3px' }}>
              {totalPlayers}
            </div>
            <div style={{ fontSize: 12, color: '#9c8faa', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginTop: 4 }}>
              Real IPL Players Ready
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Batsmen', count: supabaseStats.loaded ? supabaseStats.batsmen : mockPlayers.filter(p => p.roleCode === 'BAT' || p.role === 'Batsman').length, color: '#4ade80' },
              { label: 'Wicketkeepers', count: supabaseStats.loaded ? supabaseStats.wicketkeepers : mockPlayers.filter(p => p.roleCode === 'WK' || p.role === 'Wicketkeeper').length, color: '#60a5fa' },
              { label: 'All-Rounders', count: supabaseStats.loaded ? supabaseStats.allRounders : mockPlayers.filter(p => p.roleCode === 'AR' || p.role === 'All-Rounder').length, color: '#fbbf24' },
              { label: 'Bowlers', count: supabaseStats.loaded ? supabaseStats.bowlers : mockPlayers.filter(p => p.roleCode === 'BOWL' || p.role === 'Bowler').length, color: '#f87171' },
            ].map(item => (
              <div key={item.label} style={{
                textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 10,
                padding: '10px 16px',
                border: `1px solid ${item.color}33`,
              }}>
                <div style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: item.color, fontFamily: "'Russo One', sans-serif" }}>{item.count}</div>
                <div style={{ fontSize: 9, color: '#9c8faa', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SQL Instructions Card */}
        <div style={{
          background: 'rgba(255,130,0,0.05)',
          border: '1px solid rgba(255,130,0,0.3)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#ff8200', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Run this SQL in Supabase first
            </span>
          </div>
          <pre style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 11,
            color: '#94f5a4',
            overflow: 'auto',
            margin: 0,
            fontFamily: 'monospace',
            lineHeight: 1.7,
          }}>{`-- Recreate table with full career stats & enable public read/write
drop table if exists players cascade;

create table players (
  id text primary key,
  name text not null,
  ipl_team text,
  role text default 'BAT',
  nationality text default 'India',
  age int,
  batting_style text,
  bowling_style text,
  image_id text,
  t20_matches int default 0,
  t20_runs int default 0,
  t20_average numeric default 0,
  t20_strike_rate numeric default 0,
  t20_wickets int default 0,
  t20_economy numeric default 0,
  t20_best_figures text default '-',
  base_price numeric default 1,
  updated_at timestamptz default now()
);

alter table players enable row level security;
drop policy if exists "Allow all" on players;
create policy "Allow all" on players for all using (true) with check (true);`}</pre>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            width: '100%',
            padding: '18px 32px',
            background: syncing ? 'rgba(255,130,0,0.2)' : done ? 'rgba(74,222,128,0.2)' : '#ff8200',
            color: syncing || done ? (done ? '#4ade80' : '#ff8200') : '#0f0e10',
            border: syncing ? '1px solid rgba(255,130,0,0.4)' : done ? '1px solid rgba(74,222,128,0.4)' : 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: 'uppercase',
            cursor: syncing ? 'not-allowed' : 'pointer',
            marginBottom: 24,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
          onMouseOver={e => { if (!syncing && !done) e.currentTarget.style.background = '#ff9d47'; }}
          onMouseOut={e => { if (!syncing && !done) e.currentTarget.style.background = '#ff8200'; }}
        >
          <span style={{ fontSize: 20, animation: syncing ? 'spin 1s linear infinite' : 'none' }}>
            {done ? '✅' : syncing ? '⏳' : '☁️'}
          </span>
          {done ? `✅ Sync Complete — ${totalPlayers} Players` : syncing ? `Syncing Players... (${progress}%)` : `Sync ${totalPlayers} IPL Players to Supabase`}
        </button>

        {/* Progress Bar */}
        {(syncing || done) && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9c8faa', marginBottom: 6, fontWeight: 700 }}>
              <span>SYNC PROGRESS</span>
              <span>{progress}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: done ? '#4ade80' : 'linear-gradient(90deg, #ff8200, #ff9f43)',
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Log Console */}
        {logs.length > 0 && (
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '16px',
            maxHeight: 320,
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: 12,
          }}>
            <div style={{ color: '#9c8faa', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
              📋 SYNC LOG
            </div>
            {logs.map((log, i) => (
              <div key={i} style={{
                padding: '4px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                color: getLogColor(log.type),
                lineHeight: 1.6,
              }}>
                <span style={{ color: '#4a4562', marginRight: 8 }}>
                  {new Date(log.ts).toLocaleTimeString()}
                </span>
                {log.message}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}

        {/* Note about offline mode */}
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          background: 'rgba(96,165,250,0.07)',
          border: '1px solid rgba(96,165,250,0.2)',
          borderRadius: 10,
          fontSize: 12,
          color: '#93c5fd',
          lineHeight: 1.7,
        }}>
          <strong>💡 Offline Mode:</strong> If you don't have Supabase configured, the app will automatically use all {totalPlayers} local player records with DiceBear avatars. 
          The sync button above will save players to localStorage in that case. Your auction will still work perfectly!
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    </div>
  );
}
