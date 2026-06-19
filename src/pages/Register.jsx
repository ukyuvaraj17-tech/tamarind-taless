import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone number required';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await registerWithEmail(form.name, form.email, form.password, form.phone);
      toast.success(`Welcome, ${form.name}!`);
      navigate('/account');
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setErrors(e => ({ ...e, email: 'An account with this email already exists.' }));
      } else { toast.error(err.message || 'Registration failed.'); }
    } finally { setLoading(false); }
  }

  const inp = (field) => ({
    width: '100%', padding: '11px 0', border: 'none',
    borderBottom: `1px solid ${errors[field] ? 'var(--crimson)' : 'rgba(212,160,64,.80)'}`,
    background: 'transparent',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 15, color: 'var(--iv)', outline: 'none',
    caretColor: 'var(--gd)',
  });

  const lbl = { fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(248,236,216,.88)', display: 'block', marginBottom: 7 };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <hr className="hairline" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: 'var(--iv)', fontWeight: 400 }}>Tamarind Taless</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: '6.5px', letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--gd)', marginTop: 4 }}>Join the Collection</div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '32px 28px' }}>
          {/* GOOGLE */}
          <button onClick={loginWithGoogle} style={{ width: '100%', padding: 12, border: '1px solid var(--line)', background: 'rgba(255,255,255,.03)', fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(248,236,216,.88)', cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, marginBottom: 22, transition: 'border-color .25s, color .25s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold50)'; e.currentTarget.style.color = 'var(--iv)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--iv50)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.14em', color: 'rgba(248,236,216,.88)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
          </div>

          <form onSubmit={handleRegister}>
            {[
              { label: 'Full Name', key: 'name',     type: 'text',     ph: 'Your full name' },
              { label: 'Email',     key: 'email',    type: 'email',    ph: 'your@email.com' },
              { label: 'Phone',     key: 'phone',    type: 'tel',      ph: '+91 XXXXX XXXXX' },
              { label: 'Password',  key: 'password', type: 'password', ph: 'At least 6 characters' },
              { label: 'Confirm Password', key: 'confirm', type: 'password', ph: 'Repeat your password' },
            ].map(({ label, key, type, ph }) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <label style={lbl}>{label}</label>
                <input type={type} value={form[key]} placeholder={ph} onChange={e => set(key, e.target.value)} style={inp(key)}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                  onBlur={e => e.target.style.borderBottomColor = errors[key] ? 'var(--crimson)' : 'rgba(212,160,64,.80)'}
                />
                {errors[key] && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: 'var(--crimson)', marginTop: 4 }}>{errors[key]}</div>}
              </div>
            ))}
            <button type="submit" className="btn btn-dark btn-full" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 18, fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(248,236,216,.88)' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--gd)', fontStyle: 'italic', cursor: 'none', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
