import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithEmail, currentUser } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, go to admin panel
  useEffect(() => {
    if (currentUser && currentUser.email === process.env.REACT_APP_ADMIN_EMAIL) {
      navigate('/admin');
    }
  }, [currentUser]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }

    // Check admin email before even trying
    if (email !== process.env.REACT_APP_ADMIN_EMAIL) {
      setError('This email does not have admin access.');
      return;
    }

    setLoading(true); setError('');
    try {
      await loginWithEmail(email, password);
      // navigate happens in useEffect above when currentUser updates
    } catch (err) {
      setError(err.message || 'Login failed. Check your email and password.');
      setLoading(false);
    }
  }

  const inp = {
    width: '100%', padding: '11px 0', background: 'transparent',
    border: 'none', borderBottom: '1px solid rgba(200,169,110,0.3)',
    color: 'var(--iv)', fontFamily: "'Cormorant Garamond', serif",
    fontSize: 15, outline: 'none', transition: 'border-color 0.3s'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(200,169,110,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 400, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: 'var(--iv)', fontWeight: 300 }}>Tamarind Tales</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, color: 'var(--gd)', letterSpacing: '0.4em', marginTop: 6, textTransform: 'uppercase' }}>Admin Portal</div>
          <div style={{ width: 40, height: 1, background: 'var(--gd)', margin: '16px auto 0', opacity: 0.5 }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,169,110,0.2)', padding: '36px 32px' }}>
          {error && (
            <div style={{ background: 'rgba(139,61,42,0.2)', borderLeft: '3px solid var(--tr)', padding: '10px 14px', marginBottom: 20, fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#E8A0A0', lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.18em', color: 'rgba(245,237,216,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Admin Email
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pc1@uktex.net"
                style={inp}
                onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(200,169,110,0.3)'}
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.18em', color: 'rgba(245,237,216,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                style={inp}
                onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(200,169,110,0.3)'}
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: 14, background: loading ? 'rgba(200,169,110,0.5)' : 'var(--gd)', border: 'none', color: 'var(--iv)', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              {loading
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(26,15,8,0.3)', borderTopColor: 'var(--br)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : 'Enter Admin Panel'
              }
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '0.2em', color: 'rgba(200,169,110,0.4)', textDecoration: 'none', textTransform: 'uppercase' }}
            onMouseEnter={e => e.target.style.color = 'var(--gd)'}
            onMouseLeave={e => e.target.style.color = 'rgba(200,169,110,0.4)'}
          >
            Return to Website
          </a>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
