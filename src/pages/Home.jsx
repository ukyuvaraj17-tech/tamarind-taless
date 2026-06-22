import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';
import { supabase } from '../supabase';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

const MQ = ['Bronze Artefacts','Theyyam Heritage','Kerala Murals','Bhuta Kola Traditions','Panchaloha Bronzes','Made in India','Women-Led Curation'];

const NUM = { fontFamily:"'Cinzel', serif", fontSize:'clamp(1.1rem,2vw,1.5rem)', fontWeight:400, color:'var(--iv)', letterSpacing:'.08em', lineHeight:1 };
const NUM_LABEL = { fontFamily:"'Cormorant Garamond', serif", fontSize:13, fontStyle:'italic', color:'var(--iv)', marginTop:5, lineHeight:1.3 };

export default function Home() {
  const navigate = useNavigate();
  const { brand } = useBrand();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
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
  const mqItems = [...MQ, ...MQ].map((item, i) => (
    <React.Fragment key={i}><span className="marquee-item" >{item}</span><span className="marquee-sep">—</span></React.Fragment>
  ));

  return (
    <>
      {/* HERO — with optional shaded wallpaper image from admin */}
      <section style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'clamp(4rem,10vw,8rem) clamp(1.5rem,5vw,3.5rem)', position:'relative', overflow:'hidden' }}>
        {/* HERO BG IMAGE — set from Admin > Brand Settings */}
        {brand.hero_image && (
          <div aria-hidden="true" style={{ position:'absolute', inset:0, backgroundImage:`url(${brand.hero_image})`, backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat', zIndex:0 }} />
        )}
        {/* DARK OVERLAY — always on top of image */}
        <div aria-hidden="true" style={{ position:'absolute', inset:0, zIndex:1, background: brand.hero_image
          ? 'linear-gradient(to bottom, rgba(8,4,8,.72) 0%, rgba(8,4,8,.55) 50%, rgba(8,4,8,.72) 100%)'
          : 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(96,16,32,.28) 0%, transparent 65%), radial-gradient(ellipse 35% 30% at 20% 75%, rgba(212,160,64,.06) 0%, transparent 55%), radial-gradient(ellipse 30% 28% at 80% 25%, rgba(176,40,64,.08) 0%, transparent 50%)'
        }} />
        <div style={{ position:'relative', zIndex:2, maxWidth:820, margin:'0 auto', display:'flex', flexDirection:'column', alignItems:'center', gap:'1.4rem', animation:'fadeUp .9s ease both' }}>
          <hr className="hairline" aria-hidden="true" />
          <p className="eyebrow" style={{ color:'#E8C060', textShadow:'0 1px 8px rgba(0,0,0,.8)', letterSpacing:'.4em' }}>Rare Artefacts — Living Heritage</p>
          <h1 className="display" style={{ color:'#FFFFFF', textShadow:'0 2px 24px rgba(0,0,0,.9), 0 0 50px rgba(0,0,0,.7)' }}>Objects that<br /><em style={{ color:'#E8355A', textShadow:'0 0 30px rgba(232,53,90,.4), 0 2px 12px rgba(0,0,0,.9)' }}>carry centuries</em></h1>
          <p className="subline" style={{ color:'#FFFFFF', textShadow:'0 1px 12px rgba(0,0,0,.9)', fontSize:'clamp(1rem,1.8vw,1.25rem)', maxWidth:540 }}>Bronze, wood, pigment and devotion — each piece bridges ancient ritual and the living present.</p>
          <div style={{ display:'flex', gap:'.9rem', flexWrap:'wrap', justifyContent:'center' }}>
            <button className="btn btn-dark" onClick={() => navigate('/shop')}>Explore Collection</button>
            <button className="btn btn-outline" onClick={() => navigate('/about')}>Our Story</button>
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
              <p className="section-label">Featured Acquisitions</p>
              <h2 className="section-title">Pieces of <em>Distinction</em></h2>
            </div>
            <button className="btn btn-outline btn-sm reveal" ref={addReveal(1)} onClick={() => navigate('/shop')}>View All</button>
          </div>
          <div className="grid-3 home-grid-3">
            {products.slice(0, brand.featured_count || 3).map((p,i) => (
              <div key={p.id} ref={addReveal(i+2)} className={`reveal d${i+1}`}>
                <ProductCard product={p} onViewDetail={setSelected} />
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
            These are not objects of decor. They are vessels of devotion, memory, and belonging — made by hands that understood their purpose.
          </blockquote>
          <p style={{ fontFamily:"'Cinzel', serif", fontSize:'6.5px', letterSpacing:'.32em', textTransform:'uppercase', color:'var(--gold50)' }}>Tamarind Taless — Heritage Curators</p>
        </div>
      </section>

      <hr className="hairline-full" aria-hidden="true" />

      {/* SHADED BRAND SECTION */}
      <section style={{ position:'relative', minHeight:500, background:'var(--bg)', overflow:'hidden', display:'flex', alignItems:'center' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#1A0810 0%,#2A1018 30%,#0A1208 70%,#060E08 100%)' }} aria-hidden="true" />
        <div style={{ position:'absolute', inset:0, background:'rgba(8,4,8,.62)', zIndex:1 }} aria-hidden="true" />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 50% 60% at 30% 50%, rgba(212,160,64,.07) 0%, transparent 65%)', zIndex:1 }} aria-hidden="true" />
        <div className="container shaded-grid" style={{ position:'relative', zIndex:2, padding:'80px 44px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <hr className="hairline" style={{ marginBottom:16 }} aria-hidden="true" />
            <p className="eyebrow" style={{ marginBottom:16 }}>Who We Are</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(32px,4.5vw,56px)', fontWeight:300, color:'var(--iv)', lineHeight:.95, marginBottom:20 }}>
              Curated with<br /><em style={{ fontStyle:'italic', color:'var(--crimson)' }}>devotion</em>
            </h2>
            <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:17, color:'rgba(248,236,216,.88)', lineHeight:1.8, fontStyle:'italic', marginBottom:28 }}>
              Tamarind Taless was born from a deep love for India's living heritage — the bronzes cast in fire, the wood carved with devotion, the paintings that still carry the breath of their makers. We source directly from artisan communities, ensuring every piece arrives with its story intact.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn btn-gold" onClick={() => navigate('/about')}>Our Story</button>
              <button className="btn btn-outline" onClick={() => navigate('/services')}>Our Services</button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['30,385','Instagram Followers'],['Noida','North India'],['Coimbatore','South India'],['Women-Led','Curation']].map(([n,l]) => (
              <div key={l} style={{ background:'rgba(28,12,20,.7)', border:'1px solid rgba(212,160,64,.15)', padding:'22px 18px' }}>
                <div style={{ ...NUM, fontSize:'clamp(1rem,1.8vw,1.3rem)', marginBottom:6 }}>{n}</div>
                <div style={NUM_LABEL}>{l}</div>
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
                  <ProductCard product={p} onViewDetail={setSelected} height={220} />
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

      <ProductDetail product={selected} onClose={() => setSelected(null)} />

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
