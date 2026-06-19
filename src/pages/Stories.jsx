import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useBrand } from '../context/BrandContext';
import PageHero from '../components/PageHero';

export default function Stories() {
  const { brand } = useBrand();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    supabase.from('stories').select('*').eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setStories(data); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHero
        image={brand.hero_stories}
        eyebrow="From Our World"
        title={<em style={{ fontStyle: 'italic', color: '#E8355A' }}>Stories</em>}
        subtitle="Artisan journeys, heritage knowledge, and the stories behind the pieces we curate."
        minHeight={280}
      />

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner"></span></div>
          ) : stories.length === 0 ? (
            <div className="empty-state">No stories published yet. Check back soon.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stories.map((s, i) => {
                const isOpen = openId === s.id;
                return (
                  <div key={s.id} style={{ background: i % 2 === 0 ? 'var(--card)' : 'var(--nav)', border: '1px solid var(--line)', padding: '32px 32px', transition: 'border-color .3s', cursor: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold50)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: s.images?.[0] ? '180px 1fr auto' : '1fr auto', gap: 24, alignItems: 'start' }} className="story-row">
                      {s.images?.[0] && (
                        <img src={s.images[0]} alt={s.title} style={{ width: '100%', height: 130, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.2em', textTransform: 'uppercase', background: 'var(--cr08)', color: 'var(--crimson)', padding: '3px 9px' }}>{s.category}</span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: 'rgba(248,236,216,.7)' }}>{s.author} · {new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                        </div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 400, color: 'var(--iv)', lineHeight: 1.2, marginBottom: 14 }}>{s.title}</h2>
                        {s.subtitle && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: 'italic', color: 'var(--gd)', marginBottom: 10 }}>{s.subtitle}</p>}
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(248,236,216,.85)', lineHeight: 1.75, fontStyle: isOpen ? 'normal' : 'italic', maxWidth: 620, whiteSpace: 'pre-line' }}>
                          {isOpen ? s.story : (s.story?.slice(0, 220) + (s.story?.length > 220 ? '…' : ''))}
                        </p>
                        {s.images?.length > 1 && isOpen && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                            {s.images.slice(1).map((img, j) => (
                              <img key={j} src={img} alt="" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ flexShrink: 0, paddingTop: 8 }}>
                        <button onClick={() => setOpenId(isOpen ? null : s.id)} style={{ background: 'none', border: 'none', fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gd)', borderBottom: '1px solid rgba(212,160,64,.3)', paddingBottom: 2, cursor: 'none', whiteSpace: 'nowrap' }}>
                          {isOpen ? 'Show Less ↑' : 'Read More →'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .story-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
