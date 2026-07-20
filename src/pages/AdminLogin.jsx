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
    width: '100%', padding: '12px 0', background: 'rgba(30,27,20,0.08)',
    border: 'none', borderBottom: '1px solid rgba(33,29,20,0.35)',
    color: 'var(--iv)', fontFamily: "'Cormorant Garamond', serif",
    fontSize: 15, outline: 'none', transition: 'border-color 0.3s, background 0.3s'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F2EFE4 0%, #E2DCC8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 15%, rgba(33,29,20,0.06), transparent 26%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 420, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: 'var(--iv)', fontWeight: 300, textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}>Tamarind Taless</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, color: 'var(--gd)', letterSpacing: '0.42em', marginTop: 8, textTransform: 'uppercase' }}>Admin Portal</div>
          <div style={{ width: 52, height: 1, background: 'var(--gd)', margin: '18px auto 0', opacity: 0.7 }} />
        </div>

        <div style={{ background: 'rgba(30,27,20,0.08)', border: '1px solid rgba(33,29,20,0.24)', padding: '42px 36px', borderRadius: 24, boxShadow: '0 40px 90px rgba(0,0,0,0.25)', backdropFilter: 'blur(16px)' }}>
          {error && (
            <div style={{ background: 'rgba(154,95,69,0.1)', borderLeft: '3px solid var(--error)', padding: '10px 14px', marginBottom: 20, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'var(--error)', lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', color: 'rgba(106,99,80,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Admin Email
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pc1@uktex.net"
                style={inp}
                onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(33,29,20,0.3)'}
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', color: 'rgba(106,99,80,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                style={inp}
                onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(33,29,20,0.3)'}
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: 16, background: loading ? 'rgba(33,29,20,0.55)' : 'var(--gd)', border: 'none', color: 'var(--bg)', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 999, boxShadow: loading ? 'none' : '0 18px 38px rgba(33,29,20,0.24)'}}
            >
              {loading
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(242,239,228,0.4)', borderTopColor: 'var(--br)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : 'Enter Admin Panel'
              }
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', color: 'rgba(33,29,20,0.75)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.25s' }}
            onMouseEnter={e => e.target.style.color = 'var(--gl)'}
            onMouseLeave={e => e.target.style.color = 'rgba(33,29,20,0.75)'}
          >
            Return to Website
          </a>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
