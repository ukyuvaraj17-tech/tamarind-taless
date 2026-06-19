import React from 'react';

// Reusable hero banner with optional Cloudinary background image + dark overlay
// Used on Shop, About, Services, Stories, Care page headers
export default function PageHero({ image, eyebrow, title, subtitle, minHeight = 280 }) {
  return (
    <div style={{
      position: 'relative',
      minHeight,
      background: 'var(--nav)',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      paddingTop: 64,
    }}>
      {image && (
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          zIndex: 0,
        }} />
      )}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: image
          ? 'linear-gradient(to bottom, rgba(8,4,8,.78) 0%, rgba(8,4,8,.62) 60%, rgba(8,4,8,.82) 100%)'
          : 'radial-gradient(ellipse 60% 70% at 80% 50%, rgba(96,16,32,.18) 0%, transparent 65%)',
      }} />
      <div className="container" style={{ position: 'relative', zIndex: 2, padding: '52px 44px 48px' }}>
        <hr className="hairline" style={{ marginBottom: 14 }} aria-hidden="true" />
        {eyebrow && <p className="eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</p>}
        <h1 style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 'clamp(38px,6vw,68px)',
          fontWeight: 300, color: '#FFFFFF',
          lineHeight: .98,
          textShadow: image ? '0 2px 20px rgba(0,0,0,.85), 0 0 40px rgba(0,0,0,.6)' : 'none',
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 17, fontStyle: 'italic', color: '#FFFFFF',
            opacity: .92, marginTop: 16, maxWidth: 560, lineHeight: 1.7,
            textShadow: image ? '0 1px 12px rgba(0,0,0,.8)' : 'none',
          }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
