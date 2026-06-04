'use client';
import { useState, useEffect } from 'react';

const PASSWORD = 'sber2026';
const KEY = 'pg_auth';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAuth(sessionStorage.getItem(KEY) === '1');
  }, []);

  if (auth === null) return null;
  if (auth) return <>{children}</>;

  const submit = () => {
    if (input === PASSWORD) {
      sessionStorage.setItem(KEY, '1');
      setAuth(true);
    } else {
      setError('Неверный пароль');
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 24,
        animation: shake ? 'pg-shake 400ms ease' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            background: 'linear-gradient(145deg, #212226, #141415)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
              <path d="M10 1L1 6l9 4.5L19 6 10 1zM1 14l9 5 9-5M1 10l9 5 9-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Case Management
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: '#141415', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '32px 36px', width: 340,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Вход</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="password"
              placeholder="Пароль"
              value={input}
              autoFocus
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={{
                height: 44, borderRadius: 10, padding: '0 14px',
                fontSize: 14, fontWeight: 500, color: '#fff',
                background: '#212226', border: `1px solid ${error ? '#DC3535' : 'rgba(255,255,255,0.1)'}`,
                outline: 'none', width: '100%', boxSizing: 'border-box',
                fontFamily: 'inherit', transition: 'border-color 150ms',
              }}
            />
            {error && (
              <span style={{ fontSize: 12, color: '#DC3535' }}>{error}</span>
            )}
          </div>

          <button
            onClick={submit}
            style={{
              height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#00B24B', color: '#000', fontSize: 14, fontWeight: 600,
              fontFamily: 'inherit', transition: 'opacity 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Войти
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pg-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
