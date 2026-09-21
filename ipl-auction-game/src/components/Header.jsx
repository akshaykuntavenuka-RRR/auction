import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const linkStyle = (path) => ({
    color: location.pathname === path ? 'var(--gold)' : 'var(--text-muted)',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    background: location.pathname === path ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
    transition: 'all 0.2s ease',
  });

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'var(--bg-mid)',
      borderBottom: '2px solid rgba(255, 215, 0, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>🏏</span>
        <Link to="/" style={{
          color: 'var(--gold)',
          textDecoration: 'none',
          fontSize: '1.4rem',
          fontWeight: '800',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          IPL Auction
        </Link>
      </div>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/auction" style={linkStyle('/auction')}>Auction</Link>
        <Link to="/results" style={linkStyle('/results')}>Results</Link>
      </nav>
    </header>
  );
}
