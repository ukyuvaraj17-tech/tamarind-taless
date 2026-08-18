import React, { useEffect, useState } from 'react';
import BlurImage from './BlurImage';

// Tracks the 768px breakpoint so the hero can use a distinct mobile crop
// instead of the desktop position, which often leaves the subject off to
// one side once the same wide framing is squeezed into a narrow viewport.
function useIsMobile(bp = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${bp}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [bp]);
  return isMobile;
}

// Reusable hero banner with optional Cloudinary background image + dark overlay
// Used on Shop, About, Services, Stories, Care page headers
export default function PageHero({ image, position, mobilePosition, eyebrow, title, subtitle, minHeight = 'clamp(420px, 52vw, 560px)', center = false }) {
  const isMobile = useIsMobile();
  const effectivePosition = (isMobile && mobilePosition) || position || 'center';
  return (
    <div style={{
      position: 'relative',
      minHeight,
      background: 'var(--nav)',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: center ? 'center' : 'flex-start',
      overflow: 'hidden',
      paddingTop: 64,
      textAlign: center ? 'center' : 'left',
    }}>
      {image && (
        <BlurImage
          src={image}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: effectivePosition,
            zIndex: 0,
          }}
        />
      )}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: image
          ? 'linear-gradient(to bottom, rgba(30,27,20,.58) 0%, rgba(30,27,20,.42) 60%, rgba(30,27,20,.6) 100%)'
          : 'radial-gradient(ellipse 60% 70% at 80% 50%, rgba(33,29,20,.05) 0%, transparent 65%)',
      }} />
      <div className="container" style={{ position: 'relative', zIndex: 2, padding: '70px 44px 64px', display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'flex-start' }}>
        <hr className="hairline" style={{ marginBottom: 16 }} aria-hidden="true" />
        {eyebrow && <p className="eyebrow" style={{ marginBottom: 14, color: image ? '#F2EFE4' : 'var(--gold-muted)' }}>{eyebrow}</p>}
        <h1 style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: center ? 'clamp(52px,9vw,96px)' : 'clamp(42px,7vw,76px)',
          fontWeight: 300, color: image ? '#F2EFE4' : 'var(--text)',
          lineHeight: .98,
          textShadow: image ? '0 2px 20px rgba(0,0,0,.5)' : 'none',
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 17, fontStyle: 'italic', color: image ? '#F2EFE4' : 'var(--text-muted)',
            opacity: image ? .92 : 1, marginTop: 16, maxWidth: 560, lineHeight: 1.7,
            textShadow: image ? '0 1px 12px rgba(0,0,0,.5)' : 'none',
          }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
