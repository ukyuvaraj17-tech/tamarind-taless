import React, { useEffect, useRef } from 'react';

// A centered editorial verse block — matches the Home page quote styling so the
// same quiet, neat rhythm carries across pages. Reveals gently on scroll.
export default function Verse({ text, attribution = 'Tamarind Taless', background = 'var(--bg)' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ob.unobserve(e.target); } });
    }, { threshold: 0.2 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <section style={{ background, padding: 'clamp(3.5rem,7vw,5.5rem) clamp(1.5rem,5vw,3.5rem)' }}>
      <div ref={ref} className="reveal" style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <div aria-hidden="true" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '5rem', fontWeight: 300, color: 'var(--cr20)', lineHeight: .8, marginBottom: '.5rem' }}>&ldquo;</div>
        <blockquote style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.25rem,2.5vw,1.8rem)', fontStyle: 'italic', fontWeight: 300, color: 'var(--iv)', lineHeight: 1.55, margin: '0 0 1.2rem' }}>
          {text}
        </blockquote>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '9.5px', letterSpacing: '.32em', textTransform: 'uppercase', color: 'var(--gold50)', margin: 0 }}>{attribution}</p>
      </div>
    </section>
  );
}
