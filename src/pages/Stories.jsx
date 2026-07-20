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
        position={brand.hero_stories_position}
        eyebrow="From Our World"
        title={<em style={{ fontStyle: 'italic', color: 'var(--gold-pale)' }}>Stories</em>}
        subtitle="Artisan journeys, heritage knowledge, and the stories behind the pieces we curate."
        minHeight="clamp(480px, 60vw, 640px)"
      />

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner"></span></div>
          ) : stories.length === 0 ? (
            <div className="empty-state">No stories published yet. Check back soon.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 56, maxWidth: 720, margin: '0 auto' }}>
              {stories.map((s) => {
                const isOpen = openId === s.id;
                return (
                  <article key={s.id}>
                    {s.images?.[0] && (
                      <img src={s.images[0]} alt={s.title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', marginBottom: 24, border: '1px solid var(--line)' }} />
                    )}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', background: 'var(--cr08)', color: 'var(--crimson)', padding: '3px 9px' }}>{s.category}</span>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 600, color: 'var(--iv)', lineHeight: 1.25, margin: '14px 0 10px', textDecoration: 'underline', textUnderlineOffset: 6 }}>{s.title}</h2>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(106,99,80,.75)', marginBottom: 18 }}>{s.author} · {new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                    {s.subtitle && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: 'var(--iv)', lineHeight: 1.6, marginBottom: 14 }}>{s.subtitle}</p>}
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 400, color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                      {isOpen ? s.story : (s.story?.slice(0, 260) + (s.story?.length > 260 ? '…' : ''))}
                    </p>
                    {s.images?.length > 1 && isOpen && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                        {s.images.slice(1).map((img, j) => (
                          <img key={j} src={img} alt="" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                        ))}
                      </div>
                    )}
                    {s.story?.length > 260 && (
                      <button onClick={() => setOpenId(isOpen ? null : s.id)} style={{ background: 'none', border: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gd)', borderBottom: '1px solid rgba(33,29,20,.3)', paddingBottom: 2, cursor: 'none', marginTop: 12, display: 'inline-block' }}>
                        {isOpen ? 'Show Less ↑' : 'Read More →'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
