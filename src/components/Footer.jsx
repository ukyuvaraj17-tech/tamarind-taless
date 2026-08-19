import React from 'react';
import { Link } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';
import { COLLECTOR_LABEL } from '../data/products';
import { InstagramIcon, PinterestIcon } from './SocialIcons';

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/tamarindtaless', Icon: InstagramIcon },
  { label: 'Pinterest', href: 'https://in.pinterest.com/tamarindtaless/', Icon: PinterestIcon },
];

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
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'var(--iv)', marginBottom: 3 }}>{brand.brand_name || 'Tamarind Taless'}</div>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(106,99,80,.88)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 14 }}>
              Rare artefacts curated with devotion.<br />Made in India, for the world.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" title={label} aria-label={label}
                  className="footer-social-icon"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--gd)', color: 'var(--text-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .2s, transform .2s', cursor: 'none',
                  }}
                >
                  <Icon width={15} height={15} />
                </a>
              ))}
            </div>
          </div>

          {/* SHOP */}
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '9.5px', letterSpacing: '.28em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 14 }}>Shop</div>
            {[['Shop All', '/shop'], ['Bronze', '/shop?category=Bronze'], ['Wooden', '/shop?category=Wooden'], ['Brass', '/shop?category=Brass'], ['Miniatures', '/shop?category=Miniatures'], [COLLECTOR_LABEL, `/shop?collection=${encodeURIComponent(COLLECTOR_LABEL)}`]].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(106,99,80,.88)', marginBottom: 7, textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--iv50)'}
              >{l}</Link>
            ))}
          </div>

          {/* EXPLORE */}
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '9.5px', letterSpacing: '.28em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 14 }}>Explore</div>
            {[['About Us', '/about'], ['Our Services', '/services'], ['Stories', '/stories'], ['Care Guide', '/care'], ['Contact', '/contact']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(106,99,80,.88)', marginBottom: 7, textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--iv50)'}
              >{l}</Link>
            ))}
          </div>

          {/* HELP */}
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '9.5px', letterSpacing: '.28em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 14 }}>Help</div>
            {[['My Account', '/account'], ['Track Order', '/account'], ['Refund Policy', '/refund-policy'], ['Shipping Policy', '/shipping-policy'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(106,99,80,.88)', marginBottom: 7, textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--iv50)'}
              >{l}</Link>
            ))}
          </div>
        </div>

        <hr className="hairline-full" aria-hidden="true" style={{ marginBottom: '1.25rem' }} />

        {brand.registered_office && (
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(106,99,80,.85)', marginBottom: '1rem', lineHeight: 1.6 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gd)', marginRight: 10 }}>Registered Office</span>
            {brand.registered_office}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: 'rgba(106,99,80,.72)', fontStyle: 'italic' }}>
              &copy; {new Date().getFullYear()} Tamarind Taless. All rights reserved.
            </span>
            {[['Terms', '/terms'], ['Privacy', '/privacy-policy'], ['Refunds', '/refund-policy'], ['Shipping', '/shipping-policy']].map(([l, p]) => (
              <Link key={l} to={p} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '9px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(33,29,20,.80)', textDecoration: 'none', transition: 'color .2s', cursor: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gd)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(33,29,20,.80)'}
              >{l}</Link>
            ))}
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '9px', letterSpacing: '.28em', color: 'rgba(33,29,20,.80)', textTransform: 'uppercase' }}>
            Heritage • Craft • Culture
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-grid-r { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 340px) { .footer-grid-r { grid-template-columns: 1fr !important; } }
        @media (hover: hover) and (pointer: fine) {
          .footer-social-icon:hover { background: var(--gl) !important; transform: translateY(-2px); }
        }
      `}</style>
    </footer>
  );
}
