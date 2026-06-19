import React from 'react';
import { Link } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';
import PageHero from '../components/PageHero';

const SERVICES = [
  {
    icon: '◈',
    title: 'Curation & Sourcing',
    items: [
      'Hand-picked artefacts from all across India',
      'On-request sourcing for collectors, designers, and stylists',
      'Direct relationships with artisan communities',
      'Authenticity documentation for significant pieces',
    ],
    cta: 'Enquire about sourcing',
  },
  {
    icon: '◇',
    title: 'Styling & Decor Consultation',
    items: [
      'Theme-based curation and placement advice',
      'Home, boutique & commercial project styling',
      'Collaboration with interior designers and architects',
      'Virtual consultation available',
    ],
    cta: 'Book a consultation',
  },

];

export default function Services() {
  const { brand } = useBrand();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* HERO */}
      <PageHero
        image={brand.hero_services}
        eyebrow="What We Offer"
        title={<>Our <em style={{ fontStyle: 'italic', color: '#E8355A' }}>Services</em></>}
        subtitle="Heritage curation, sourcing, and styling — for collectors, designers, and spaces that deserve something extraordinary."
        minHeight={300}
      />

      {/* SERVICES GRID */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: 16 }}>
            {SERVICES.map((s, i) => (
              <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '32px 28px', transition: 'border-color .3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold50)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
              >
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: 'var(--gd)', marginBottom: 14, lineHeight: 1 }}>{s.icon}</div>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--iv)', marginBottom: 20, fontWeight: 500 }}>{s.title}</h2>
                <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                  {s.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', gap: 12, marginBottom: 10, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(248,236,216,.88)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--crimson)', flexShrink: 0 }}>—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gd)', textDecoration: 'none', borderBottom: '1px solid rgba(212,160,64,.85)', paddingBottom: 2, transition: 'border-color .2s', cursor: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.borderBottomColor = 'var(--gd)'}
                  onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'rgba(212,160,64,.85)'}
                >{s.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section" style={{ background: 'var(--nav)', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="section-label">How It Works</p>
            <h2 className="section-title">The Curation <em>Process</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {[
              { num: '01', title: 'Connect', desc: 'Reach out via WhatsApp or our enquiry form with your requirements.' },
              { num: '02', title: 'Consult', desc: 'We understand your space, taste, and budget through a detailed conversation.' },
              { num: '03', title: 'Curate', desc: 'We source and shortlist pieces that match your needs from our network.' },
              { num: '04', title: 'Deliver', desc: 'Your chosen piece is carefully packed and delivered to your doorstep.' },
            ].map(({ num, title, desc }) => (
              <div key={num} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1rem,1.5vw,1.2rem)', fontWeight: 400, fontFamily: "'Cinzel', serif", color: 'rgba(248,236,216,.88)', lineHeight: 1, marginBottom: 8, opacity: .4 }}>{num}</div>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--iv)', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(248,236,216,.88)', lineHeight: 1.7, fontStyle: 'italic' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--line)', padding: '48px 44px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <p className="section-label">Ready to Begin?</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 300, color: 'var(--iv)', fontStyle: 'italic', marginBottom: 18 }}>Let us find your perfect piece</h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'rgba(248,236,216,.88)', marginBottom: 28, lineHeight: 1.7 }}>
            Every collector's journey is unique. We are here to make yours extraordinary.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-gold" style={{ textDecoration: 'none' }}>Get in Touch</Link>
            <a href="https://wa.me/918796988216" target="_blank" rel="noreferrer" className="btn btn-wa" style={{ textDecoration: 'none' }}>WhatsApp Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
