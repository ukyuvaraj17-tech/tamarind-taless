import React from 'react';
import { Link } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';

export default function Footer() {
  const { brand } = useBrand();
  return (
    <footer style={{ background: 'var(--nav)', borderTop: '1px solid var(--line)', padding: 'clamp(2.5rem,5vw,3.5rem) clamp(1.5rem,4vw,3rem) 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }} className="footer-grid-r">

          {/* BRAND */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              {brand.logo_url && (
                <img src={brand.logo_url} alt={brand.brand_name} style={{ height: 34, objectFit: 'contain', maxWidth: 100, flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'var(--iv)', marginBottom: 3 }}>{brand.brand_name || 'Tamarind Taless'}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '5.5px', letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--gd)' }}>{brand.tagline || 'Heritage Curators'}</div>
              </div>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(248,236,216,.88)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 14 }}>
              Rare artefacts curated with devotion.<br />Made in India, for the world.
            </p>
            <a href="https://instagram.com/tamarindtaless" target="_blank" rel="noreferrer" style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '.2em', color: 'var(--gd)', textDecoration: 'none' }}>@tamarindtaless</a>
          </div>

          {/* SHOP */}
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '6.5px', letterSpacing: '.28em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 14 }}>Shop</div>
            {[['Shop All', '/shop'], ['Bronze', '/shop?cat=bronze'], ['Wooden Art', '/shop?cat=wooden'], ['Paintings', '/shop?cat=paintings'], ['Brass', '/shop?cat=brass'], ['Miniatures', '/shop?cat=miniatures']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(248,236,216,.88)', marginBottom: 7, textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--iv50)'}
              >{l}</Link>
            ))}
          </div>

          {/* EXPLORE */}
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '6.5px', letterSpacing: '.28em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 14 }}>Explore</div>
            {[['About Us', '/about'], ['Our Services', '/services'], ['Stories', '/stories'], ['Care Guide', '/care'], ['Blog', '/blog'], ['Contact', '/contact']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(248,236,216,.88)', marginBottom: 7, textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--iv50)'}
              >{l}</Link>
            ))}
          </div>

          {/* HELP */}
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '6.5px', letterSpacing: '.28em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 14 }}>Help</div>
            {[['My Account', '/account'], ['Track Order', '/account'], ['Refund Policy', '/refund-policy'], ['Shipping Policy', '/shipping-policy'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(248,236,216,.88)', marginBottom: 7, textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--iv50)'}
              >{l}</Link>
            ))}
          </div>
        </div>

        <hr className="hairline-full" aria-hidden="true" style={{ marginBottom: '1.25rem' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: 'rgba(248,236,216,.72)', fontStyle: 'italic' }}>
              &copy; {new Date().getFullYear()} Tamarind Taless. All rights reserved.
            </span>
            {[['Terms', '/terms'], ['Privacy', '/privacy-policy'], ['Refunds', '/refund-policy'], ['Shipping', '/shipping-policy']].map(([l, p]) => (
              <Link key={l} to={p} style={{ fontFamily: "'Cinzel', serif", fontSize: '6px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(212,160,64,.80)', textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gd)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,160,64,.80)'}
              >{l}</Link>
            ))}
          </div>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '6px', letterSpacing: '.28em', color: 'rgba(212,160,64,.80)', textTransform: 'uppercase' }}>
            Heritage — Craft — Culture
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-grid-r { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 580px) { .footer-grid-r { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
