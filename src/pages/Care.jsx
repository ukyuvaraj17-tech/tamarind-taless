import React from 'react';
import { useBrand } from '../context/BrandContext';
import PageHero from '../components/PageHero';

const CARE_GUIDES = [
  {
    material: 'Bronze & Brass',
    icon: '◈',
    steps: [
      'Dust regularly with a soft, dry microfiber cloth',
      'Avoid water or liquid cleaners on uncoated bronze',
      'For light tarnish, use a small amount of coconut oil on a cloth and buff gently',
      'Store away from direct sunlight and humidity',
      'Never use chemical polishes or abrasive materials',
      'The natural patina that develops over time is part of the artefact\'s beauty — do not try to remove it',
    ],
    note: 'Antique bronze develops a natural green or brown patina over centuries. This patina is not damage — it is evidence of age and authenticity. Preserve it.',
  },
  {
    material: 'Wooden Art',
    icon: '◇',
    steps: [
      'Dust with a soft, dry cloth or a very soft brush',
      'Avoid placing near air-conditioning vents or direct heat sources',
      'Apply a thin coat of pure beeswax or linseed oil once every 6 months to prevent drying',
      'Keep away from moisture and direct sunlight to prevent cracking',
      'Never submerge in water or use wet cloths',
      'For intricate carvings, use a soft paintbrush to clean dust from crevices',
    ],
    note: 'Old wood breathes and responds to its environment. A stable room temperature (18–26°C) and moderate humidity (40–60%) is ideal for wooden artefacts.',
  },
  {
    material: 'Temple Paintings & Murals',
    icon: '◉',
    steps: [
      'Handle with clean, dry hands or soft cotton gloves',
      'Frame behind UV-protective glass to prevent fading',
      'Keep away from direct sunlight, moisture, and strong artificial light',
      'Do not attempt to clean the painted surface yourself',
      'For dust, use a very soft, dry brush — never touch the paint surface with cloth',
      'If restoration is needed, consult a professional conservator',
    ],
    note: 'Heritage paintings use natural pigments that are irreplaceable. Even gentle cleaning by an untrained hand can cause irreversible damage. When in doubt, do nothing.',
  },
  {
    material: 'Miniatures & Small Artefacts',
    icon: '◆',
    steps: [
      'Display in a closed glass cabinet to minimise dust exposure',
      'Handle as infrequently as possible, always with clean hands',
      'Use museum-grade display putty to secure pieces on shelves',
      'Store in acid-free tissue if not on display',
      'Keep away from children and pets',
      'Photograph and document each piece for insurance purposes',
    ],
    note: 'Small artefacts are often the most delicate. A closed display cabinet is the best investment you can make for their long-term preservation.',
  },
];

export default function Care() {
  const { brand } = useBrand();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHero
        image={brand.hero_care}
        eyebrow="Preservation Guide"
        title={<>Care &amp; <em style={{ fontStyle: 'italic', color: '#E8355A' }}>Preservation</em></>}
        subtitle="Your piece has survived centuries. With the right care, it will survive centuries more."
        minHeight={280}
      />

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {CARE_GUIDES.map((g, i) => (
              <div key={g.material} style={{ background: i % 2 === 0 ? 'var(--card)' : 'var(--nav)', border: '1px solid var(--line)', padding: '36px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: 'var(--gd)' }}>{g.icon}</div>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--iv)', fontWeight: 500 }}>{g.material}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
                  <ul style={{ listStyle: 'none' }}>
                    {g.steps.map((step, j) => (
                      <li key={j} style={{ display: 'flex', gap: 12, marginBottom: 10, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(248,236,216,.88)', lineHeight: 1.6 }}>
                        <span style={{ color: 'var(--gd)', flexShrink: 0, marginTop: 2, fontSize: 12 }}>✓</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {g.note && (
                  <div style={{ background: 'rgba(212,160,64,.06)', borderLeft: '2px solid var(--gd)', padding: '14px 18px', marginTop: 20 }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: 'italic', color: 'rgba(212,160,64,.8)', lineHeight: 1.7 }}>{g.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--line)', padding: '40px 44px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 500 }}>
          <p className="section-label">Need Expert Advice?</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontStyle: 'italic', color: 'rgba(248,236,216,.88)', marginBottom: 22, lineHeight: 1.7 }}>
            Every piece is different. If you have a specific care question about your artefact, we are happy to help.
          </p>
          <a href="https://wa.me/918796988216?text=I have a care question about my Tamarind Taless piece" target="_blank" rel="noreferrer" className="btn btn-gold" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Ask on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
