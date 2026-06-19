import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBrand } from '../context/BrandContext';

const COLLECTIONS = [
  { label: 'All Pieces', path: '/shop' },
  { label: 'Bronze', path: '/shop?cat=bronze' },
  { label: 'Wooden Art', path: '/shop?cat=wooden' },
  { label: 'Paintings', path: '/shop?cat=paintings' },
  { label: 'Brass', path: '/shop?cat=brass' },
  { label: 'Miniatures', path: '/shop?cat=miniatures' },
];

const MORE_LINKS = [
  { label: 'Stories', path: '/stories', desc: 'Artisan journeys & heritage notes' },
  { label: 'Care Guide', path: '/care', desc: 'How to preserve your pieces' },
  { label: 'Blog', path: '/blog', desc: 'Heritage knowledge & guides' },
  { label: 'Our Services', path: '/services', desc: 'Curation, styling & commissions' },
  { label: 'Instagram', path: 'https://instagram.com/tamarindtaless', external: true, desc: '@tamarindtaless' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDd, setOpenDd] = useState(null);
  const { currentUser, logout } = useAuth();
  const { cartCount } = useCart();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const location = useLocation();
  const ddRef = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMenuOpen(false); setOpenDd(null); }, [location]);

  useEffect(() => {
    if (!openDd) return;
    const close = (e) => { if (!e.target.closest('.tt-nav-dd')) setOpenDd(null); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openDd]);

  const toggleDd = (name) => setOpenDd(p => p === name ? null : name);

  const linkS = { fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.17em', textTransform: 'uppercase', color: 'rgba(248,236,216,.48)', transition: 'color .2s', textDecoration: 'none', cursor: 'none', whiteSpace: 'nowrap', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 5, height: 64, padding: '0 16px' };

  const ddItemS = { display: 'block', padding: '12px 18px', fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(248,236,216,.5)', textDecoration: 'none', borderBottom: '1px solid rgba(96,16,32,.28)', transition: 'color .2s, background .2s', cursor: 'none' };

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 64, background: scrolled ? 'rgba(20,8,16,.97)' : 'var(--nav)', borderBottom: '1px solid var(--line)', backdropFilter: scrolled ? 'blur(14px)' : 'none', padding: '0 clamp(1rem,3vw,2.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background .35s', gap: 8 }}>

        {/* WORDMARK */}
        <Link to="/" style={{ cursor: 'none', textDecoration: 'none', lineHeight: 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          {brand.logo_url && (
            <img src={brand.logo_url} alt={brand.brand_name} style={{ height: 42, objectFit: 'contain', maxWidth: 120, flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'var(--iv)', letterSpacing: '.05em', lineHeight: 1.1 }}>{brand.brand_name || 'Tamarind Taless'}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', color: 'var(--gd)', letterSpacing: '.4em', textTransform: 'uppercase', marginTop: 3 }}>{brand.tagline || 'Heritage Curators'}</div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }} className="nav-desktop">

          {/* SHOP ALL */}
          <Link to="/shop" style={linkS}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,236,216,.48)'}
          >Shop All</Link>

          {/* BY COLLECTION */}
          <div className="tt-nav-dd" style={{ position: 'relative', height: 64, display: 'flex', alignItems: 'center' }}>
            <button onClick={() => toggleDd('col')} style={{ ...linkS, cursor: 'none', color: openDd === 'col' ? 'var(--iv)' : 'rgba(248,236,216,.48)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
              onMouseLeave={e => { if (openDd !== 'col') e.currentTarget.style.color = 'rgba(248,236,216,.48)'; }}
            >
              By Collection
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openDd === 'col' ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openDd === 'col' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--nav)', border: '1px solid var(--line)', minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,.5)', animation: 'fadeIn .15s ease', zIndex: 200 }}>
                {COLLECTIONS.map(({ label, path }) => (
                  <Link key={label} to={path} style={ddItemS}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--gd)'; e.currentTarget.style.background = 'rgba(212,160,64,.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,236,216,.5)'; e.currentTarget.style.background = 'transparent'; }}
                  >{label}</Link>
                ))}
              </div>
            )}
          </div>

          {/* MORE */}
          <div className="tt-nav-dd" style={{ position: 'relative', height: 64, display: 'flex', alignItems: 'center' }}>
            <button onClick={() => toggleDd('more')} style={{ ...linkS, cursor: 'none', color: openDd === 'more' ? 'var(--iv)' : 'rgba(248,236,216,.48)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
              onMouseLeave={e => { if (openDd !== 'more') e.currentTarget.style.color = 'rgba(248,236,216,.48)'; }}
            >
              More
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openDd === 'more' ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openDd === 'more' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--nav)', border: '1px solid var(--line)', minWidth: 220, boxShadow: '0 12px 40px rgba(0,0,0,.5)', animation: 'fadeIn .15s ease', zIndex: 200 }}>
                {MORE_LINKS.map(({ label, path, external, desc }) =>
                  external ? (
                    <a key={label} href={path} target="_blank" rel="noreferrer" style={{ ...ddItemS, display: 'block' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--gd)'; e.currentTarget.style.background = 'rgba(212,160,64,.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,236,216,.5)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{label}</span>
                        <span style={{ fontSize: 10, opacity: .4 }}>↗</span>
                      </div>
                      {desc && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, fontStyle: 'italic', color: 'rgba(248,236,216,.88)', marginTop: 2, textTransform: 'none', letterSpacing: 0 }}>{desc}</div>}
                    </a>
                  ) : (
                    <Link key={label} to={path} style={{ ...ddItemS, display: 'block' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--gd)'; e.currentTarget.style.background = 'rgba(212,160,64,.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,236,216,.5)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      {label}
                      {desc && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, fontStyle: 'italic', color: 'rgba(248,236,216,.85)', marginTop: 2, textTransform: 'none', letterSpacing: 0 }}>{desc}</div>}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, flexShrink: 0 }}>
          <div onClick={() => navigate('/account?tab=wishlist')} style={{ cursor: 'none', color: 'rgba(248,236,216,.4)', lineHeight: 0, transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gd)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,236,216,.4)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          <div onClick={() => navigate('/cart')} style={{ cursor: 'none', color: 'rgba(248,236,216,.4)', position: 'relative', lineHeight: 0, transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gd)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,236,216,.4)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 15, height: 15, background: 'var(--crimson)', color: 'var(--iv)', borderRadius: 10, fontFamily: "'Cinzel',serif", fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{cartCount}</span>}
          </div>
          <div onClick={() => navigate(currentUser ? '/account' : '/login')} style={{ cursor: 'none', color: 'rgba(248,236,216,.4)', lineHeight: 0, transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gd)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,236,216,.4)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <Link to="/contact" className="nav-enquire-pill" style={{ fontFamily: "'Cinzel',serif", fontSize: '7px', letterSpacing: '.17em', textTransform: 'uppercase', background: 'var(--crimson)', color: 'var(--iv)', padding: '7px 14px', borderRadius: 100, cursor: 'none', textDecoration: 'none', transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cr-h)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--crimson)'}
          >Enquire</Link>
          <button onClick={() => setMenuOpen(o => !o)} className="nav-hamburger" style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'none', padding: 4 }}>
            <span style={{ width: 21, height: 1, background: 'rgba(248,236,216,.5)', display: 'block' }}></span>
            <span style={{ width: 21, height: 1, background: 'rgba(248,236,216,.5)', display: 'block' }}></span>
            <span style={{ width: 21, height: 1, background: 'rgba(248,236,216,.5)', display: 'block' }}></span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div style={{ position: 'fixed', top: 64, left: 0, right: 0, background: 'var(--nav)', zIndex: 999, borderBottom: '1px solid var(--line)', transform: menuOpen ? 'translateY(0)' : 'translateY(-110%)', opacity: menuOpen ? 1 : 0, transition: 'transform .35s cubic-bezier(.25,.46,.45,.94), opacity .3s', maxHeight: '80vh', overflowY: 'auto' }}>
        {[['Shop All','/shop'],['Bronze','/shop'],['Wooden Art','/shop'],['Paintings','/shop'],['About','/about'],['Services','/services'],['Stories','/stories'],['Care Guide','/care'],['Blog','/blog'],['Contact','/contact'],[currentUser?'My Account':'Login',currentUser?'/account':'/login'],[`Cart (${cartCount})`,'/cart']].map(([l,p]) => (
          <Link key={l+p} to={p} style={{ display: 'block', fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.17em', textTransform: 'uppercase', color: 'rgba(248,236,216,.5)', padding: '13px 22px', borderBottom: '1px solid rgba(96,16,32,.3)', cursor: 'none', textDecoration: 'none' }}>{l}</Link>
        ))}
        <a href="https://instagram.com/tamarindtaless" target="_blank" rel="noreferrer" style={{ display: 'block', fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.17em', textTransform: 'uppercase', color: 'rgba(248,236,216,.5)', padding: '13px 22px', borderBottom: '1px solid rgba(96,16,32,.3)', cursor: 'none', textDecoration: 'none' }}>Instagram ↗</a>
        {currentUser && <div onClick={() => { logout(); navigate('/'); }} style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.17em', textTransform: 'uppercase', color: 'var(--crimson)', padding: '13px 22px', cursor: 'none' }}>Sign Out</div>}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0;transform:translateY(-4px); } to { opacity:1;transform:translateY(0); } }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-enquire-pill { display: none !important; }
        }
      `}</style>
    </>
  );
}
