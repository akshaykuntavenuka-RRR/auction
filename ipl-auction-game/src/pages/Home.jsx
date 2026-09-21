import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ color: 'var(--gold)', fontSize: '3rem', marginBottom: '1rem' }}>
        IPL Cricket Auction Game
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2rem' }}>
        Experience the thrill of the IPL Auction! Build your dream team, bid strategically against opponents, and claim the championship trophy.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/auction" style={{
          background: 'var(--gold)',
          color: 'var(--bg-deep)',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          transition: 'transform 0.2s',
        }}>
          Enter Auction
        </Link>
        <Link to="/results" style={{
          border: '1px solid var(--gold)',
          color: 'var(--gold)',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          transition: 'transform 0.2s',
        }}>
          View Results
        </Link>
      </div>
    </div>
  );
}
