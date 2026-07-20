import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useBrand } from '../context/BrandContext';
import PageHero from '../components/PageHero';
import { GALLERY_COLLECTIONS } from '../data/products';

export default function Gallery() {
  const { brand } = useBrand();
  const [products, setProducts] = useState([]);
  const revealRefs = useRef([]);

  useEffect(() => {
    supabase.from('products').select('*').eq('available', true)
      .then(({ data }) => { if (data) setProducts(data); });
  }, []);

  useEffect(() => {
    const ob = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ob.unobserve(e.target); } });
    }, { threshold: 0.1 });
    revealRefs.current.forEach(el => el && ob.observe(el));
    return () => ob.disconnect();
  }, [products]);
  const addReveal = (i) => (el) => { revealRefs.current[i] = el; };

  const collections = GALLERY_COLLECTIONS.map(c => {
    const pieces = products.filter(p => (p.cat || '').trim().toLowerCase() === c.name.toLowerCase());
    return { ...c, count: pieces.length, image: pieces.find(p => p.images?.[0])?.images?.[0] || null };
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHero
        image={brand.hero_gallery}
        position={brand.hero_gallery_position}
        eyebrow="Galleries by Tamarind Taless"
        title="Fine Art & Traditional Painting"
        subtitle="Five distinct painting traditions, each with its own hand, pigment, and lineage, browsed here as a curated gallery rather than a single catalogue."
      />

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {collections.map((c, i) => (
              <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`}
                ref={addReveal(i)} className={`reveal d${(i % 4) + 1}`}
                style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', display: 'block', textDecoration: 'none', border: '1px solid var(--line)' }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: c.image ? `url(${c.image})` : 'linear-gradient(150deg,#F2EFE4,#D3CCB9)',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  transition: 'transform .6s var(--ease)',
                }} className="gallery-img" />
                {c.image && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,27,20,.75) 0%, rgba(30,27,20,.15) 45%, transparent 70%)' }} />}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '28px 26px' }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: c.image ? 'rgba(242,239,228,.75)' : 'var(--gold-muted)', marginBottom: 8 }}>
                    {c.count > 0 ? `${c.count} Piece${c.count !== 1 ? 's' : ''}` : 'Coming Soon'}
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,3vw,34px)', fontWeight: 400, color: c.image ? '#F2EFE4' : 'var(--text)', marginBottom: 6 }}>{c.name}</h2>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontStyle: 'italic', color: c.image ? 'rgba(242,239,228,.8)' : 'var(--text-muted)' }}>{c.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--line)', padding: '3rem 44px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <p className="section-label">Looking For Something Else?</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--iv)', marginBottom: 22 }}>Bronze, brass, wood and more live in the full collection</h2>
          <Link to="/shop" className="btn btn-gold" style={{ textDecoration: 'none', display: 'inline-flex' }}>Shop All Pieces</Link>
        </div>
      </section>

      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .gallery-grid a:hover .gallery-img { transform: scale(1.06); }
        }
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
