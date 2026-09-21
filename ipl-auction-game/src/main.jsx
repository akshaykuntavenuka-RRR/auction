import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Security Shield: Mask API keys, tokens, and sensitive information in browser inspect console
(function hideConsoleSecrets() {
  const SECRET_PATTERNS = [
    /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, // JWT / Supabase Anon keys
    /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, // UUID API keys (CricAPI, etc.)
    /https:\/\/[a-z0-9]+\.supabase\.co/gi, // Supabase URLs
  ];

  function sanitize(arg) {
    if (typeof arg === 'string') {
      let cleaned = arg;
      SECRET_PATTERNS.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '[PROTECTED_KEY]');
      });
      return cleaned;
    }
    if (typeof arg === 'object' && arg !== null) {
      try {
        const json = JSON.stringify(arg);
        let cleaned = json;
        SECRET_PATTERNS.forEach(pattern => {
          cleaned = cleaned.replace(pattern, '[PROTECTED_KEY]');
        });
        return JSON.parse(cleaned);
      } catch (e) {
        return arg;
      }
    }
    return arg;
  }

  ['log', 'info', 'warn', 'error', 'debug', 'dir'].forEach(method => {
    const original = console[method];
    if (original) {
      console[method] = function (...args) {
        const firstArg = args[0];
        if (typeof firstArg === 'string' && (firstArg.includes('cdn.tailwindcss.com') || firstArg.includes('tailwindcss'))) {
          return;
        }
        const sanitizedArgs = args.map(sanitize);
        original.apply(console, sanitizedArgs);
      };
    }
  });
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
