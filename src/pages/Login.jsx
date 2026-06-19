import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]     = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { loginWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';

  async function handleEmail(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true); setError('');
    try {
      await loginWithEmail(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your details.');
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setGLoading(true); setError('');
    try { await loginWithGoogle(); }
    catch (err) { setError('Google sign-in failed.'); setGLoading(false); }
  }

  async function handleReset() {
    if (!email) { setError('Enter your email above to reset password.'); return; }
    try { await resetPassword(email); setResetSent(true); toast.success('Reset email sent.'); }
    catch { setError('Could not send reset email.'); }
  }

  const inp = {
    width: '100%', padding: '11px 0', border: 'none',
    borderBottom: '1px solid rgba(212,160,64,.80)',
    background: 'transparent',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 15, color: 'var(--iv)',
    outline: 'none', transition: 'border-color 0.3s',
    caretColor: 'var(--gd)',
  };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <hr className="hairline" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: 'var(--iv)', fontWeight: 400 }}>Tamarind Taless</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: '6.5px', letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--gd)', marginTop: 4 }}>Collector Login</div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '32px 28px' }}>
          {error && <div style={{ background: 'var(--cr08)', borderLeft: '3px solid var(--crimson)', padding: '10px 14px', marginBottom: 20, fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'var(--crimson)', lineHeight: 1.5 }}>{error}</div>}
          {resetSent && <div style={{ background: 'rgba(70,130,80,.1)', borderLeft: '3px solid #3A7A3A', padding: '10px 14px', marginBottom: 20, fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#6AD08A' }}>Password reset email sent. Check your inbox.</div>}

          {/* GOOGLE */}
          <button onClick={handleGoogle} disabled={gLoading} style={{ width: '100%', padding: 12, border: '1px solid var(--line)', background: 'rgba(255,255,255,.03)', fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(248,236,216,.88)', cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, marginBottom: 22, transition: 'border-color .25s, color .25s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold50)'; e.currentTarget.style.color = 'var(--iv)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--iv50)'; }}
          >
            {gLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.14em', color: 'rgba(248,236,216,.88)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
          </div>

          <form onSubmit={handleEmail}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(248,236,216,.88)', display: 'block', marginBottom: 7 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inp}
                onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(212,160,64,.80)'}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(248,236,216,.88)', display: 'block', marginBottom: 7 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" style={inp}
                onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(212,160,64,.80)'}
              />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 22 }}>
              <span onClick={handleReset} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: 'var(--gd)', cursor: 'none', fontStyle: 'italic' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >Forgot Password?</span>
            </div>
            <button type="submit" className="btn btn-dark btn-full" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 18, fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(248,236,216,.88)' }}>
            New collector? <Link to="/register" style={{ color: 'var(--gd)', fontStyle: 'italic', cursor: 'none', textDecoration: 'none' }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
