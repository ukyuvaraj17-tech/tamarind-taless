import React, { useRef, useState } from 'react';
import { useBrand } from '../context/BrandContext';
import PageHero from '../components/PageHero';
import Verse from '../components/Verse';

export default function Gallery() {
  const { brand } = useBrand();
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(true);

  function toggleVideo() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHero
        image={brand.hero_gallery}
        position={brand.hero_gallery_position}
        eyebrow="Galleries by Tamarind Taless"
        title="Fine Art & Traditional Painting"
      />

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          {brand.gallery_video ? (
            <div
              onClick={toggleVideo}
              onContextMenu={(e) => e.preventDefault()}
              style={{ position: 'relative', cursor: 'pointer', lineHeight: 0 }}
            >
              <video
                ref={videoRef}
                key={brand.gallery_video}
                src={brand.gallery_video}
                loop
                playsInline
                preload="metadata"
                disablePictureInPicture
                controlsList="nodownload"
                onPlay={() => setPaused(false)}
                onPause={() => setPaused(true)}
                style={{ width: '100%', display: 'block', background: '#000', border: '1px solid var(--line)' }}
              />
              {paused && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.28)' }}>
                  <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: '1px solid rgba(242,239,228,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#F2EFE4" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', border: '1px solid var(--line)' }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontStyle: 'italic', color: 'var(--text-muted)' }}>Gallery video coming soon</p>
            </div>
          )}
        </div>
      </section>

      <Verse text="If a piece makes us pause, wonder, and imagine the lives it has touched, we know it's meant to be shared." background="var(--card)" />
    </div>
  );
}
