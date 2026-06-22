import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import PageHero from '../components/PageHero';
import toast from 'react-hot-toast';

const S = {
  eyebrow: { fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:'.35em', textTransform:'uppercase', color:'var(--gd)', marginBottom:10 },
  h1: { fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(42px,6vw,72px)', fontWeight:300, color:'var(--iv)', fontStyle:'italic', lineHeight:.95 },
  h2: { fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(24px,3.5vw,38px)', fontWeight:300, color:'var(--iv)', lineHeight:1.05, marginBottom:28 },
  body: { fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:'var(--iv)', lineHeight:1.85 },
  label: { fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gd)', marginBottom:4, display:'block' },
  inp: { width:'100%', padding:'11px 0', border:'none', borderBottom:'1px solid rgba(212,160,64,.85)', background:'transparent', fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:'var(--iv)', outline:'none', transition:'border-color .3s', caretColor:'var(--gd)' },
};

// ── ABOUT ───────────────────────────────────────────────────
export function About() {
  const navigate = useNavigate();
  const { brand } = useBrand();
  const revealRefs = useRef([]);
  const add = (i) => (el) => { revealRefs.current[i] = el; };

  useEffect(() => {
    const ob = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ob.unobserve(e.target); } });
    }, { threshold: 0.1 });
    revealRefs.current.forEach(el => el && ob.observe(el));
    return () => ob.disconnect();
  }, []);

  const values = [
    ['Authentic Provenance', 'Every piece is verified and documented. We never acquire without understanding where a piece comes from and what it meant in its original context.'],
    ['Heritage Over Decoration', 'We are custodians of living traditions — our pieces carry ritual meaning that we believe must be preserved and communicated to every collector.'],
    ['Women-Led Curation', 'Tamarind Taless is built on a feminine aesthetic of care, precision, and deep cultural knowledge. Our curation reflects this ethic in every choice we make.'],
  ];

  return (
    <>
      {/* HEADER */}
      <PageHero image={brand.hero_about} eyebrow="The Brand" title="About Tamarind Taless" minHeight={260} />

      {/* STORY */}
      <section className="section" style={{ background:'var(--bg)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }} className="about-grid">
            <div ref={add(0)} className="reveal" style={{ aspectRatio:'3/4', background: brand.about_image ? `url(${brand.about_image})` : 'linear-gradient(145deg,#1A0810,#2A1018 50%,#1A2010)', backgroundSize:'cover', backgroundPosition:'center', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
              {!brand.about_image && (
                <div style={{ textAlign:'center', padding:32 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(212,160,64,.5)', marginBottom:10 }}>No Image Set</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:14, color:'rgba(248,236,216,.4)', fontStyle:'italic' }}>Add an image in Admin → Brand Settings → About Page Side Image</div>
                </div>
              )}
            </div>
            <div>
              <hr className="hairline" style={{ marginBottom:14 }} />
              <p className="section-label reveal" ref={add(1)}>Our Story</p>
              <h2 style={{ ...S.h2 }} ref={add(2)} className="reveal d1">Every piece carries <em style={{ color:'var(--gd)' }}>a living memory</em></h2>
              <p style={S.body} ref={add(3)} className="reveal d2">Tamarind Taless was founded by women with a deep reverence for South India's sacred artistic traditions. We believe that the bronze casting of Kerala, the ritual wood carving of coastal Karnataka, the mural traditions of temple walls, and the lost-wax metalwork of Tamil Nadu are not merely art forms — they are living memories encoded in material.</p>
              <p style={{ ...S.body, marginTop:14 }} ref={add(4)} className="reveal d3">Each piece in our collection is acquired with care and reverence. We travel, research, and verify provenance — and only bring forward pieces we believe deserve to continue their journey.</p>
              <p style={{ ...S.body, marginTop:14 }} ref={add(5)} className="reveal d4">We are based in Noida and Coimbatore — two cities at the intersection of modern India and its ancient inheritances.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background:'var(--card)', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }} className="stats-grid-r">
            {[['30,385','Instagram Followers'],['Noida & Coimbatore','Our Locations'],['Women-Led','Brand & Curation'],['Made in India','Curated in India']].map(([n,l],i) => (
              <div key={i} ref={add(6+i)} className={`reveal d${i+1}`} style={{ textAlign:'center', padding:'2rem 1rem', borderRight: i < 3 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'clamp(1rem,2vw,1.4rem)', fontWeight:400, color:'var(--iv)', letterSpacing:'.06em', lineHeight:1, marginBottom:6 }}>{n}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, fontStyle:'italic', color:'rgba(248,236,216,.88)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section" style={{ background:'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:48 }} ref={add(10)} className="reveal">
            <p className="section-label">What We Stand For</p>
            <h2 className="section-title">Our <em>Values</em></h2>
          </div>
          <div className="grid-3">
            {values.map(([title, desc], i) => (
              <div key={i} ref={add(11+i)} className={`reveal d${i+1}`} style={{ padding:28, background:'var(--card)', border:'1px solid var(--line)' }}>
                <hr className="hairline" style={{ marginBottom:14 }} />
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:'var(--iv)', marginBottom:12, fontWeight:400 }}>{title}</h3>
                <p style={S.body}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'var(--card)', borderTop:'1px solid var(--line)', padding:'3rem 44px', textAlign:'center' }}>
        <div className="container" style={{ maxWidth:560 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(22px,3vw,34px)', fontWeight:300, fontStyle:'italic', color:'var(--iv)', marginBottom:22 }}>Explore the collection</h2>
          <button className="btn btn-gold" onClick={() => navigate('/shop')}>View All Pieces</button>
        </div>
      </section>

      <style>{`
        @media (max-width:768px){.about-grid{grid-template-columns:1fr!important}.stats-grid-r{grid-template-columns:1fr 1fr!important}}
      `}</style>
    </>
  );
}

// ── CONTACT ─────────────────────────────────────────────────
export function Contact() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ name:'', email: currentUser?.email || '', subject:'', message:'' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function send(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in all required fields.'); return; }
    setSending(true);
    try {
      await supabase.from('enquiries').insert({
        user_id: currentUser?.id || null,
        user_name: form.name, user_email: form.email,
        product: form.subject || 'General Enquiry',
        message: form.message, type: 'Email', status: 'Received',
      });
      setSent(true);
      toast.success('Enquiry sent. We will be in touch within 24 hours.');
      setForm({ name:'', email:'', subject:'', message:'' });
    } catch { toast.error('Failed to send. Please try again.'); }
    finally { setSending(false); }
  }

  const contacts = [
    { label:'Phone', val:'+91 87969 88216', href:'tel:+918796988216', icon:'↗' },
    { label:'WhatsApp', val:'Message us directly', href:'https://wa.me/918796988216', icon:'↗' },
    { label:'Instagram', val:'@tamarindtaless', href:'https://instagram.com/tamarindtaless', icon:'↗' },
    { label:'Locations', val:'Noida and Coimbatore, India', href:null, icon:'•' },
  ];

  return (
    <>
      {/* HEADER */}
      <div style={{ background:'var(--nav)', borderBottom:'1px solid var(--line)', paddingTop:64 }}>
        <div className="container" style={{ padding:'52px 44px 44px' }}>
          <hr className="hairline" style={{ marginBottom:14 }} aria-hidden="true" />
          <p style={S.eyebrow}>Reach Out</p>
          <h1 style={S.h1}>Get in Touch</h1>
        </div>
      </div>

      <section className="section" style={{ background:'var(--bg)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:56 }} className="contact-grid">

            {/* LEFT — CONTACT DETAILS */}
            <div>
              <hr className="hairline" style={{ marginBottom:14 }} />
              <p className="section-label">Contact Details</p>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(22px,3vw,34px)', fontWeight:300, color:'var(--iv)', fontStyle:'italic', lineHeight:1.1, marginBottom:36 }}>
                We would love to hear from you
              </h2>

              {contacts.map(({ label, val, href }) => (
                <div key={label} style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:24, paddingBottom:24, borderBottom:'1px solid rgba(96,16,32,.35)' }}>
                  <div style={{ width:42, height:42, background:'var(--card)', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <div style={{ width:8, height:8, background:'var(--gd)', borderRadius:'50%' }}></div>
                  </div>
                  <div>
                    <span style={S.label}>{label}</span>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                        style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:'var(--iv)', textDecoration:'none', transition:'color .2s', cursor:'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--gd)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--iv)'}
                      >{val}</a>
                    ) : (
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:'var(--iv)' }}>{val}</div>
                    )}
                  </div>
                </div>
              ))}

              {/* WHATSAPP QUICK BTN */}
              <a href="https://wa.me/918796988216?text=Hi, I am interested in a piece from Tamarind Taless" target="_blank" rel="noreferrer" className="btn btn-wa" style={{ textDecoration:'none', display:'inline-flex', marginTop:8 }}>
                WhatsApp Us Now
              </a>
            </div>

            {/* RIGHT — FORM */}
            <div style={{ background:'var(--card)', border:'1px solid var(--line)', padding:'32px 28px' }}>
              <p className="section-label" style={{ marginBottom:20 }}>Send an Enquiry</p>
              {sent && (
                <div style={{ background:'rgba(70,130,80,.1)', borderLeft:'3px solid #3A7A3A', padding:'12px 16px', marginBottom:20, fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:'#6AD08A', lineHeight:1.6 }}>
                  Your enquiry has been received. We will be in touch within 24 hours.
                </div>
              )}
              <form onSubmit={send}>
                {[
                  { label:'Your Name', key:'name', type:'text', ph:'Full name' },
                  { label:'Email Address', key:'email', type:'email', ph:'your@email.com' },
                  { label:'Subject', key:'subject', type:'text', ph:'Enquiry about a piece, shipping, etc.' },
                ].map(({ label, key, type, ph }) => (
                  <div style={{ marginBottom:20 }} key={key}>
                    <label style={S.label}>{label}</label>
                    <input type={type} value={form[key]} placeholder={ph}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={S.inp}
                      onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                      onBlur={e => e.target.style.borderBottomColor = 'rgba(212,160,64,.85)'}
                    />
                  </div>
                ))}
                <div style={{ marginBottom:20 }}>
                  <label style={S.label}>Message</label>
                  <textarea value={form.message} placeholder="Your message..." rows={4}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ ...S.inp, resize:'vertical', minHeight:90, lineHeight:1.6 }}
                    onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'}
                    onBlur={e => e.target.style.borderBottomColor = 'rgba(212,160,64,.85)'}
                  />
                </div>
                <button type="submit" className="btn btn-dark" disabled={sending}>
                  {sending ? <span className="spinner"></span> : 'Send Enquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width:768px){.contact-grid{grid-template-columns:1fr!important}}
      `}</style>
    </>
  );
}
