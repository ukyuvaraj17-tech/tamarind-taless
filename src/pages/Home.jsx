import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';
import { supabase } from '../supabase';
import ProductCard from '../components/ProductCard';

const MQ = ['Made in India','Curated in India','Women Led','Tamarind Taless'];

export default function Home() {
  const navigate = useNavigate();
  const { brand } = useBrand();
  const [products, setProducts] = useState([]);
  const revealRefs = useRef([]);

  useEffect(() => {
    supabase.from('products').select('*').eq('available', true).order('created_at', { ascending: false })
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
  // Admin-pinned products show first; if fewer are pinned than the showcase count, fill the rest with the newest pieces
  const count = brand.featured_count || 3;
  const featured = products.filter(p => p.featured);
  const rest = products.filter(p => !p.featured);
  const showcaseProducts = [...featured, ...rest].slice(0, count);
  // Repeat the base list so a single half is wider than the viewport, then duplicate
  // that half once more — the marquee animates by -50%, so two identical halves loop seamlessly.
  const mqHalf = [...MQ, ...MQ, ...MQ, ...MQ];
  const mqItems = [...mqHalf, ...mqHalf].map((item, i) => (
    <React.Fragment key={i}><span className="marquee-item" >{item}</span><span className="marquee-sep">•</span></React.Fragment>
  ));

  return (
    <>
      {/* HERO — with optional shaded wallpaper image from admin */}
      <section style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'clamp(4rem,10vw,8rem) clamp(1.5rem,5vw,3.5rem)', position:'relative', overflow:'hidden' }}>
        {/* HERO BG IMAGE — set from Admin > Brand Settings */}
        {brand.hero_image && (
          <div aria-hidden="true" style={{ position:'absolute', inset:0, backgroundImage:`url(${brand.hero_image})`, backgroundSize:'cover', backgroundPosition: brand.hero_image_position || 'center', backgroundRepeat:'no-repeat', zIndex:0 }} />
        )}
        {/* OVERLAY — dark scrim only when a photo is set, otherwise a quiet ink-tinted glow */}
        <div aria-hidden="true" style={{ position:'absolute', inset:0, zIndex:1, background: brand.hero_image
          ? 'linear-gradient(to bottom, rgba(30,27,20,.55) 0%, rgba(30,27,20,.35) 50%, rgba(30,27,20,.55) 100%)'
          : 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(33,29,20,.05) 0%, transparent 65%), radial-gradient(ellipse 35% 30% at 20% 75%, rgba(33,29,20,.04) 0%, transparent 55%), radial-gradient(ellipse 30% 28% at 80% 25%, rgba(33,29,20,.04) 0%, transparent 50%)'
        }} />
        <div style={{ position:'relative', zIndex:2, maxWidth:820, margin:'0 auto', display:'flex', flexDirection:'column', alignItems:'center', gap:'1.4rem', animation:'fadeUp .9s ease both' }}>
          <hr className="hairline" aria-hidden="true" />
          <h1 className="display" style={{ color: brand.hero_image ? '#F2EFE4' : 'var(--text)', textShadow: brand.hero_image ? '0 2px 24px rgba(0,0,0,.5)' : 'none' }}>Where India's Stories<br /><em style={{ color: brand.hero_image ? '#F2EFE4' : 'var(--gold-muted)' }}>Find New Homes</em></h1>
          <p className="subline" style={{ color: brand.hero_image ? '#F2EFE4' : 'var(--text-muted)', textShadow: brand.hero_image ? '0 1px 12px rgba(0,0,0,.5)' : 'none', fontSize:'clamp(1rem,1.8vw,1.25rem)', maxWidth:540 }}>Curating vintage heirlooms, handcrafted treasures, and timeless artistry that celebrate India's rich cultural heritage, one story at a time.</p>
          <div style={{ display:'flex', gap:'.9rem', flexWrap:'wrap', justifyContent:'center' }}>
            <button className="btn btn-dark" onClick={() => navigate('/shop')}>Explore Collection</button>
            <button className="btn btn-outline" style={brand.hero_image ? { color: '#F2EFE4', borderColor: 'rgba(242,239,228,.5)' } : undefined} onClick={() => navigate('/about')}>Our Journey</button>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap" aria-hidden="true"><div className="marquee-track">{mqItems}</div></div>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ background:'var(--bg)' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:40, flexWrap:'wrap', gap:16 }}>
            <div ref={addReveal(0)} className="reveal">
              <p className="section-label">{brand.home_featured_label || 'Featured Acquisitions'}</p>
              <h2 className="section-title">{brand.home_featured_title || 'Pieces of Distinction'}</h2>
            </div>
            <button className="btn btn-outline btn-sm reveal" ref={addReveal(1)} onClick={() => navigate('/shop')}>View All</button>
          </div>
          <div className="grid-3 home-grid-3">
            {showcaseProducts.map((p,i) => (
              <div key={p.id} ref={addReveal(i+2)} className={`reveal d${i+1}`}>
                <ProductCard product={p} />
              </div>
            ))}
            {products.length === 0 && [1,2,3].map(i => (
              <div key={i} style={{ height:340, background:'var(--card)', border:'1px solid var(--line)', borderRadius:3 }} />
            ))}
          </div>
        </div>
      </section>

      <hr className="hairline-full" aria-hidden="true" />
{/* QUOTE */}
      <section style={{ background:'var(--bg)', padding:'clamp(3.5rem,7vw,5.5rem) clamp(1.5rem,5vw,3.5rem)' }}>
        <div style={{ maxWidth:820, margin:'0 auto', textAlign:'center' }} ref={addReveal(10)} className="reveal">
          <div aria-hidden="true" style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'5rem', fontWeight:300, color:'var(--cr20)', lineHeight:.8, marginBottom:'.5rem' }}>"</div>
          <blockquote style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(1.25rem,2.5vw,1.8rem)', fontStyle:'italic', fontWeight:300, color:'var(--iv)', lineHeight:1.55, marginBottom:'1.2rem' }}>
            {brand.home_quote_text || 'Every piece that finds its way to Tamarind Taless has already lived a story. We simply help it begin another.'}
          </blockquote>
          <p style={{ fontFamily:"'Inter', sans-serif", fontWeight:600, fontSize:'9.5px', letterSpacing:'.32em', textTransform:'uppercase', color:'var(--gold50)' }}>Tamarind Taless</p>
        </div>
      </section>

      <hr className="hairline-full" aria-hidden="true" />

      {/* SHADED BRAND SECTION — deliberate ink band for rhythm, still within the approved palette */}
      <section style={{ position:'relative', minHeight:500, background:'var(--gold)', overflow:'hidden', display:'flex', alignItems:'center' }}>
        <div className="container shaded-grid" style={{ position:'relative', zIndex:2, padding:'80px 44px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <hr className="hairline" style={{ marginBottom:16, background: '#F2EFE4' }} aria-hidden="true" />
            <p className="eyebrow" style={{ marginBottom:16, color: 'rgba(242,239,228,.65)' }}>{brand.home_ink_eyebrow || 'Why We Curate'}</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(30px,4.2vw,50px)', fontWeight:300, color:'#F2EFE4', lineHeight:1.02, marginBottom:20 }}>
              {brand.home_ink_title || 'Because beautiful traditions deserve to live on.'}
            </h2>
            <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:17, color:'rgba(242,239,228,.65)', lineHeight:1.8, fontStyle:'italic', marginBottom:28 }}>
              {brand.home_ink_body || "Across India, remarkable craftsmanship continues to thrive, often in places few people ever see. Alongside these living traditions are vintage treasures that carry the memories of another time. Tamarind Taless exists to bring both together in one thoughtful collection."}
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn" style={{ background: '#F2EFE4', color: 'var(--gold)' }} onClick={() => navigate('/about')}>Our Journey</button>
              <button className="btn btn-outline" style={{ color: '#F2EFE4', borderColor: 'rgba(242,239,228,.35)' }} onClick={() => navigate('/services')}>Our Services</button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              ['Vintage Finds','Objects with a story to tell'],
              ['Living Craft','Created by artisans across India'],
              ['Thoughtfully Curated','Chosen for meaning over trends'],
              ['Made to Last','Pieces to be cherished for generations'],
            ].map(([title, desc]) => (
              <div key={title} style={{ background:'rgba(242,239,228,.06)', border:'1px solid rgba(242,239,228,.15)', padding:'22px 18px' }}>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontWeight:500, fontSize:'clamp(1.15rem,1.9vw,1.45rem)', color:'#F2EFE4', lineHeight:1.15, marginBottom:8, letterSpacing:'.01em' }}>{title}</div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:14.5, fontStyle:'italic', color:'rgba(242,239,228,.65)', lineHeight:1.4 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="hairline-full" aria-hidden="true" />

      {/* ALL PRODUCTS */}
      {products.length > 0 && (
        <section className="section" style={{ background:'var(--nav)' }}>
          <div className="container">
            <div style={{ textAlign:'center', marginBottom:40 }} ref={addReveal(11)} className="reveal">
              <p className="section-label">The Full Collection</p>
              <h2 className="section-title">All <em>{products.length} Pieces</em></h2>
            </div>
            <div className="grid-4 home-grid-4">
              {products.map((p,i) => (
                <div key={p.id} ref={addReveal(12+i)} className={`reveal d${(i%4)+1}`}>
                  <ProductCard product={p} height={220} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INSTAGRAM CTA */}
      <section style={{ background:'var(--card)', borderTop:'1px solid var(--line)', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3.5rem)', textAlign:'center' }}>
        <div style={{ maxWidth:560, margin:'0 auto' }}>
          <p className="section-label">Follow Our Curation</p>
          <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(2rem,5vw,4rem)', fontWeight:300, fontStyle:'italic', color:'var(--iv)', margin:'8px 0' }}>@tamarindtaless</div>
          <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:15, color:'var(--iv)', marginBottom:24 }}>30,000 collectors and art lovers follow our heritage curation</p>
          <a href="https://instagram.com/tamarindtaless" target="_blank" rel="noreferrer" className="btn btn-gold" style={{ textDecoration:'none', display:'inline-flex' }}>View on Instagram</a>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid-r { grid-template-columns: 1fr 1fr !important; }
          .stats-grid-r > div:nth-child(2) { border-right: none !important; }
          .shaded-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 48px 20px !important; }
          .home-grid-3 { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .home-grid-4 { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
        }
        @media (max-width: 420px) {
          .stats-grid-r { grid-template-columns: 1fr 1fr !important; }
          .home-grid-3 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
