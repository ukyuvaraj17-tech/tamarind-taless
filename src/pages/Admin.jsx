import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { useNavigate } from 'react-router-dom';
import { fmt } from '../data/products';
import ImageUploader from '../components/ImageUploader';
import toast from 'react-hot-toast';

const CATS = ['bronze', 'wooden', 'paintings', 'brass', 'miniatures'];
const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const EMPTY = { name: '', cat: 'bronze', subtitle: '', origin: '', material: '', dimensions: '', weight: '', price: '', story: '', together: '', badge: '', enquiry_only: false, stock: 1, available: true, bg: 'linear-gradient(145deg,#2a1f18,#4a3020)', images: [] };

// ── NAV ITEMS ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 0, label: 'Dashboard', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { id: 1, label: 'Products', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )},
  { id: 2, label: 'Add Product', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )},
  { id: 3, label: 'Orders', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )},
  { id: 4, label: 'Enquiries', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )},
  { id: 5, label: 'Stories', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )},
  { id: 6, label: 'Brand Settings', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )},
];

// ── STORIES MANAGER ────────────────────────────────────────
const EMPTY_STORY = { title: '', subtitle: '', category: 'Heritage Notes', author: 'Tamarind Taless', story: '', images: [], published: true };
const STORY_CATS = ['Artisan Story', 'Heritage Notes', "Collector's Corner", 'Behind the Curation'];

function StoriesManager() {
  const [stories, setStories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState('list');
  const [form, setForm] = React.useState({ ...EMPTY_STORY });
  const [editId, setEditId] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { fetchStories(); }, []);

  async function fetchStories() {
    setLoading(true);
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (data) setStories(data);
    setLoading(false);
  }

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function startNew() { setForm({ ...EMPTY_STORY }); setEditId(null); setView('edit'); }
  function startEdit(s) { setForm({ ...s }); setEditId(s.id); setView('edit'); }

  async function saveStory() {
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, updated_at: new Date().toISOString() };
      if (editId) {
        await supabase.from('stories').update(payload).eq('id', editId);
        toast.success('Story updated.');
      } else {
        await supabase.from('stories').insert(payload);
        toast.success('Story published.');
      }
      await fetchStories();
      setView('list');
    } catch (e) { toast.error('Failed to save story.'); }
    finally { setSaving(false); }
  }

  async function deleteStory(id) {
    if (!window.confirm('Delete this story permanently?')) return;
    await supabase.from('stories').delete().eq('id', id);
    toast.success('Story deleted.');
    fetchStories();
  }

  async function togglePublish(s) {
    await supabase.from('stories').update({ published: !s.published }).eq('id', s.id);
    fetchStories();
  }

  const lbl = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.14em', color: 'rgba(245,237,216,0.55)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,169,110,0.25)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, outline: 'none', caretColor: 'var(--gd)' };

  if (view === 'list') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>Stories &amp; Blog ({stories.length})</div>
          <button onClick={startNew} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 18px', cursor: 'pointer' }}>Add New Story</button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner"></span></div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'rgba(245,237,216,0.5)', fontStyle: 'italic' }}>No stories yet. Click "Add New Story" to publish your first one.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stories.map(s => (
              <div key={s.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,169,110,0.15)', padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'center' }}>
                {s.images?.[0] && <img src={s.images[0]} alt="" style={{ width: 64, height: 64, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(200,169,110,0.2)' }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gd)', background: 'rgba(212,160,64,.12)', padding: '2px 8px' }}>{s.category}</span>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.published ? '#6AD08A' : 'rgba(245,237,216,0.4)' }}>{s.published ? 'Published' : 'Draft'}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'var(--iv)', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(245,237,216,0.5)', fontStyle: 'italic' }}>{s.author} · {new Date(s.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => togglePublish(s)} style={{ background: 'none', border: '1px solid rgba(200,169,110,0.3)', color: 'rgba(245,237,216,0.6)', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>{s.published ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => startEdit(s)} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteStory(s.id)} style={{ background: 'none', border: '1px solid rgba(176,40,64,.4)', color: '#E07070', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>{editId ? 'Edit Story' : 'New Story'}</div>
        <button onClick={() => setView('list')} style={{ background: 'transparent', border: '1px solid rgba(245,237,216,0.25)', color: 'rgba(245,237,216,0.6)', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer' }}>Back to List</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. The Last Bell-Maker of Palakkad" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.25)'} /></div>
        <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e => setF('subtitle', e.target.value)} placeholder="One-line summary shown under the title" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.25)'} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Category</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => setF('category', e.target.value)}>
              {STORY_CATS.map(c => <option key={c} value={c} style={{ background: '#1C0C14' }}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Author</label><input style={inp} value={form.author} onChange={e => setF('author', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.25)'} /></div>
        </div>
        <div>
          <label style={lbl}>Story Text</label>
          <textarea style={{ ...inp, minHeight: 180, resize: 'vertical', lineHeight: 1.7 }} value={form.story} onChange={e => setF('story', e.target.value)} placeholder="Write the full story here..." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.25)'} />
        </div>
        <ImageUploader images={form.images} onChange={imgs => setF('images', imgs)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={form.published} onChange={e => setF('published', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gd)' }} />
          <label style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--iv)' }}>Published — visible on the public Stories page</label>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={saveStory} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : editId ? 'Update Story' : 'Publish Story'}
          </button>
          {editId && <button onClick={() => { setForm({ ...EMPTY_STORY }); setEditId(null); setView('list'); }} style={{ background: 'transparent', border: '1px solid rgba(245,237,216,0.25)', color: 'rgba(245,237,216,0.6)', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}

// ── BRAND SETTINGS ────────────────────────────────────────
function BrandSettings() {
  const { brand, updateBrand } = useBrand();
  const [form, setForm] = React.useState({ brand_name: brand.brand_name || '', tagline: brand.tagline || '' });
  const [saving, setSaving] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState('');
  const [heroUrls, setHeroUrls] = React.useState({
    hero_image: '', hero_shop: '', hero_about: '', hero_services: '', hero_stories: '', hero_care: '', about_image: '',
  });

  const lbl = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.14em', color: 'rgba(245,237,216,0.55)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,169,110,0.25)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, outline: 'none', caretColor: 'var(--gd)' };
  const section = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,169,110,0.15)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 16 };
  const secHead = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(212,160,64,.7)', marginBottom: 4 };
  const helpText = { fontFamily: "'Cormorant Garamond',serif", fontSize: 12.5, fontStyle: 'italic', color: 'rgba(248,236,216,.6)' };

  async function saveLogoUrl() {
    if (!logoUrl.trim()) return;
    try { await updateBrand({ logo_url: logoUrl.trim() }); toast.success('Logo saved.'); setLogoUrl(''); }
    catch { toast.error('Failed.'); }
  }

  async function saveHeroField(field) {
    const val = heroUrls[field]?.trim();
    if (!val) return;
    try {
      await updateBrand({ [field]: val });
      toast.success('Image saved.');
      setHeroUrls(h => ({ ...h, [field]: '' }));
    } catch { toast.error('Failed to save. Run the hero_image SQL migration in Supabase if this keeps failing.'); }
  }

  async function removeHeroField(field) {
    try { await updateBrand({ [field]: '' }); toast.success('Image removed.'); }
    catch { toast.error('Failed.'); }
  }

  async function saveBrand() {
    setSaving(true);
    try { await updateBrand({ brand_name: form.brand_name, tagline: form.tagline }); toast.success('Brand settings saved.'); }
    catch { toast.error('Failed.'); }
    finally { setSaving(false); }
  }

  async function saveFeaturedCount(n) {
    try { await updateBrand({ featured_count: n }); toast.success('Home page showcase updated.'); }
    catch { toast.error('Failed.'); }
  }

  function HeroImageField({ field, title, description }) {
    return (
      <div style={section}>
        <div style={secHead}>{title}</div>
        <div style={helpText}>{description}</div>
        {brand[field] && (
          <div style={{ position: 'relative', height: 130, overflow: 'hidden', border: '1px solid rgba(212,160,64,.25)' }}>
            <img src={brand[field]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .75 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,4,8,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(212,160,64,.85)' }}>Current Image</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={heroUrls[field]}
            onChange={e => setHeroUrls(h => ({ ...h, [field]: e.target.value }))}
            placeholder="Paste Cloudinary image URL..."
            style={{ ...inp, flex: 1 }}
            onFocus={e => e.target.style.borderColor = 'var(--gd)'}
            onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.25)'}
          />
          <button onClick={() => saveHeroField(field)} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Save</button>
        </div>
        {brand[field] && <button onClick={() => removeHeroField(field)} style={{ background: 'none', border: '1px solid rgba(176,40,64,.4)', color: '#E07070', fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer', alignSelf: 'flex-start' }}>Remove Image</button>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', marginBottom: 20, textTransform: 'uppercase' }}>Brand Settings</div>

      {/* LOGO */}
      <div style={section}>
        <div style={secHead}>Logo Image</div>
        {brand.logo_url && <img src={brand.logo_url} alt="Logo" style={{ height: 48, objectFit: 'contain', maxWidth: 200, marginBottom: 4, display: 'block', border: '1px solid rgba(212,160,64,.15)', padding: 6 }} />}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Paste Cloudinary logo URL..." style={{ ...inp, flex: 1 }} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.25)'} />
          <button onClick={saveLogoUrl} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Save Logo</button>
        </div>
        {brand.logo_url && <button onClick={() => updateBrand({ logo_url: '' })} style={{ background: 'none', border: '1px solid rgba(176,40,64,.4)', color: '#E07070', fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer', alignSelf: 'flex-start' }}>Remove Logo</button>}
      </div>

      {/* BRAND TEXT */}
      <div style={section}>
        <div style={secHead}>Brand Text</div>
        <div><label style={lbl}>Brand Name</label><input style={inp} value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.25)'} /></div>
        <div><label style={lbl}>Tagline</label><input style={inp} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.25)'} /></div>
        <button onClick={saveBrand} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Brand Text'}
        </button>
      </div>

      {/* HOME SHOWCASE */}
      <div style={section}>
        <div style={secHead}>Home Page Product Showcase</div>
        <div style={helpText}>Choose how many products appear in the "Featured Acquisitions" section on the homepage.</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={brand.featured_count || 3} onChange={e => saveFeaturedCount(Number(e.target.value))} style={{ ...inp, width: 120, cursor: 'pointer' }}>
            {[2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: '#1C0C14' }}>{n} products</option>)}
          </select>
          <span style={helpText}>currently showing {brand.featured_count || 3}</span>
        </div>
      </div>

      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', margin: '32px 0 16px', textTransform: 'uppercase' }}>Per-Page Hero Images</div>
      <HeroImageField field="hero_image"    title="Home Page Hero"           description="Full-screen background behind the main homepage headline." />
      <HeroImageField field="hero_shop"     title="Shop Page Hero"           description="Background banner at the top of the Shop / Collection page." />
      <HeroImageField field="hero_about"    title="About Page Hero"          description="Background banner at the top of the About page." />
      <HeroImageField field="about_image"   title="About Page — Side Image"  description="The image block next to the brand story text on the About page." />
      <HeroImageField field="hero_services" title="Services Page Hero"       description="Background banner at the top of the Services page." />
      <HeroImageField field="hero_stories"  title="Stories Page Hero"        description="Background banner at the top of the Stories / Blog page." />
      <HeroImageField field="hero_care"     title="Care Guide Page Hero"     description="Background banner at the top of the Care &amp; Preservation page." />
    </div>
  );
}


// ── MAIN ADMIN ────────────────────────────────────────────
export default function Admin() {
  const { logout, currentUser } = useAuth();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/admin/login'); return; }
    if (currentUser.email !== process.env.REACT_APP_ADMIN_EMAIL) { navigate('/'); return; }
    fetchAll();
  }, [currentUser]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [pRes, oRes, eRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
      ]);
      setProducts(pRes.data || []);
      setOrders(oRes.data || []);
      setEnquiries(eRes.data || []);
    } catch (e) { toast.error('Failed to load data.'); }
    finally { setLoading(false); }
  }

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function saveProduct() {
    if (!form.name.trim()) { toast.error('Product name is required.'); return; }
    setSaving(true);
    try {
      const data = { ...form, price: form.enquiry_only ? null : (Number(form.price) || null), stock: Number(form.stock) || 0 };
      delete data.id;
      if (editId) {
        const { error } = await supabase.from('products').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editId);
        if (error) throw error;
        toast.success('Product updated.');
      } else {
        const { error } = await supabase.from('products').insert(data);
        if (error) throw error;
        toast.success('Product added.');
      }
      setForm({ ...EMPTY }); setEditId(null);
      await fetchAll(); setTab(1);
    } catch (e) { toast.error('Failed: ' + e.message); }
    finally { setSaving(false); }
  }

  async function deleteProduct(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Failed.'); return; }
    toast.success('Deleted.'); await fetchAll();
  }

  function editProduct(p) {
    setForm({ ...EMPTY, ...p, images: p.images || [] });
    setEditId(p.id); setTab(2);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error('Failed.'); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Status: ${status}`);
  }

  async function updateDelivery(id, date) {
    const { error } = await supabase.from('orders').update({ estimated_delivery: date }).eq('id', id);
    if (error) { toast.error('Failed.'); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estimated_delivery: date } : o));
    toast.success('Delivery date set.');
  }

  const lbl = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.14em', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,169,110,0.2)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: 'none', transition: 'border-color 0.25s' };

  const lowStock = products.filter(p => p.stock === 1 && p.available);

  const statusColor = (s) => s === 'Delivered' ? '#6AD08A' : s === 'Cancelled' ? '#E07070' : s === 'Pending' ? '#E8A040' : s === 'Shipped' ? '#8090E0' : 'var(--iv)';
  const statusBg   = (s) => s === 'Delivered' ? 'rgba(106,208,138,0.12)' : s === 'Cancelled' ? 'rgba(224,112,112,0.12)' : s === 'Pending' ? 'rgba(232,160,64,0.12)' : s === 'Shipped' ? 'rgba(128,144,224,0.12)' : 'rgba(255,255,255,0.06)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(160deg,#09050a 0%,#07030a 60%,#080308 100%)', color: 'var(--iv)' }}>

      {/* ══ SIDEBAR ══════════════════════════════════════ */}
      <aside style={{
        width: 232, flexShrink: 0,
        background: 'rgba(4,2,6,0.92)',
        borderRight: '1px solid rgba(212,160,64,0.14)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 200, overflowY: 'auto',
        backdropFilter: 'blur(12px)',
      }}>

        {/* LOGO / BRAND */}
        <div style={{ padding: '26px 22px 20px', borderBottom: '1px solid rgba(212,160,64,0.1)' }}>
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brand.brand_name || 'Logo'}
              style={{ height: 46, objectFit: 'contain', maxWidth: 170, display: 'block', marginBottom: 10 }}
            />
          ) : (
            <div style={{ width: 42, height: 42, background: 'rgba(212,160,64,0.12)', border: '1px solid rgba(212,160,64,0.3)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gd)" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          )}
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'var(--iv)', lineHeight: 1.1, letterSpacing: '.03em' }}>
            {brand.brand_name || 'Tamarind Taless'}
          </div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.38em', color: 'var(--gd)', textTransform: 'uppercase', marginTop: 4, opacity: 0.8 }}>
            Admin Panel
          </div>
        </div>

        {/* NAV ITEMS */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 22px',
                  background: active ? 'rgba(212,160,64,0.09)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${active ? 'var(--gd)' : 'transparent'}`,
                  color: active ? 'var(--gd)' : 'rgba(248,236,216,0.42)',
                  fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: '0.13em',
                  textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(248,236,216,0.72)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,236,216,0.42)'; } }}
              >
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.55 }}>{icon}</span>
                {label}
                {/* badges */}
                {id === 3 && orders.filter(o => o.status === 'Pending').length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#E8A040', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 7, padding: '1px 6px', borderRadius: 99 }}>
                    {orders.filter(o => o.status === 'Pending').length}
                  </span>
                )}
                {id === 4 && enquiries.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'rgba(212,160,64,0.2)', color: 'var(--gd)', fontFamily: "'Cinzel',serif", fontSize: 7, padding: '1px 6px', borderRadius: 99 }}>
                    {enquiries.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM: USER + ACTIONS */}
        <div style={{ padding: '14px 18px 20px', borderTop: '1px solid rgba(212,160,64,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(212,160,64,0.15)', border: '1px solid rgba(212,160,64,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gd)" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.1em', color: 'rgba(212,160,64,0.7)', textTransform: 'uppercase', marginBottom: 1 }}>Admin</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(248,236,216,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button
              onClick={() => navigate('/')}
              style={{ flex: 1, background: 'transparent', border: '1px solid rgba(212,160,64,0.2)', fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(248,236,216,0.4)', padding: '8px 4px', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 2 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,160,64,0.5)'; e.currentTarget.style.color = 'var(--gd)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,160,64,0.2)'; e.currentTarget.style.color = 'rgba(248,236,216,0.4)'; }}
            >View Site</button>
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
              style={{ flex: 1, background: 'transparent', border: '1px solid rgba(176,40,64,0.3)', fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(224,112,112,0.65)', padding: '8px 4px', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 2 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(176,40,64,0.6)'; e.currentTarget.style.color = '#E07070'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(176,40,64,0.3)'; e.currentTarget.style.color = 'rgba(224,112,112,0.65)'; }}
            >Sign Out</button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN AREA ═════════════════════════════════════ */}
      <div style={{ marginLeft: 232, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        {/* TOP BAR */}
        <div style={{ background: 'rgba(4,2,6,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(212,160,64,0.1)', padding: '14px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.32em', color: 'rgba(212,160,64,0.5)', textTransform: 'uppercase', marginBottom: 2 }}>
              {['Dashboard','Products','Add Product','Orders','Enquiries','Stories','Brand Settings'][tab]}
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: 'var(--iv)', lineHeight: 1, fontWeight: 300 }}>
              {tab === 2 && editId ? 'Edit Product' : ['Overview','All Products','Add New Product','All Orders','All Enquiries','Stories & Blog','Brand Settings'][tab]}
            </div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(248,236,216,0.3)', fontStyle: 'italic' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ padding: '32px 36px 72px', flex: 1 }}>

          {/* ── DASHBOARD ── */}
          {tab === 0 && (
            <div>
              {/* STAT CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Total Products', value: products.length, color: 'var(--gd)',    bg: 'rgba(212,160,64,0.06)',    sub: 'In catalogue' },
                  { label: 'Total Orders',   value: orders.length,   color: '#6AD08A',       bg: 'rgba(106,208,138,0.06)',   sub: 'All time' },
                  { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, color: '#E8A040', bg: 'rgba(232,160,64,0.06)', sub: 'Need attention' },
                  { label: 'Enquiries',      value: enquiries.length, color: 'var(--crimson)', bg: 'rgba(176,40,64,0.06)',  sub: 'Total received' },
                ].map(({ label, value, color, bg, sub }) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${color}28`, borderTop: `3px solid ${color}`, padding: '22px 20px' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 52, color, fontWeight: 300, lineHeight: 1, marginBottom: 10 }}>{value}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: '0.18em', color: 'var(--iv)', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(248,236,216,0.32)', marginTop: 3, fontStyle: 'italic' }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* RECENT ORDERS + QUICK ACTIONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 24 }}>

                {/* RECENT ORDERS TABLE */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,160,64,0.13)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(212,160,64,0.1)' }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.22em', color: 'var(--gd)', textTransform: 'uppercase' }}>Recent Orders</div>
                    <button onClick={() => setTab(3)} style={{ background: 'none', border: 'none', fontFamily: "'Cinzel',serif", fontSize: 7.5, color: 'rgba(212,160,64,0.55)', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--gd)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,160,64,0.55)'}
                    >View All →</button>
                  </div>
                  {orders.length === 0 ? (
                    <div style={{ padding: '44px 20px', textAlign: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(248,236,216,0.25)', fontStyle: 'italic' }}>No orders yet</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Order ID','Customer','Items','Total','Status'].map(h => (
                            <th key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '9px 14px', textAlign: 'left', color: 'rgba(248,236,216,0.28)', borderBottom: '1px solid rgba(212,160,64,0.08)', fontWeight: 400 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 7).map(o => (
                          <tr key={o.id}
                            style={{ transition: 'background 0.15s', cursor: 'default' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '10px 14px', fontFamily: "'Cinzel',serif", fontSize: 8.5, color: 'var(--gd)', borderBottom: '1px solid rgba(255,255,255,0.03)', whiteSpace: 'nowrap' }}>{o.order_id || o.id.slice(-8).toUpperCase()}</td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--iv)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{o.user_name || '—'}</td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(248,236,216,0.45)', borderBottom: '1px solid rgba(255,255,255,0.03)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items?.map(i => i.name).join(', ') || '—'}</td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.03)', whiteSpace: 'nowrap' }}>{fmt(o.total)}</td>
                            <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', color: statusColor(o.status), background: statusBg(o.status) }}>
                                {o.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* QUICK PANEL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* QUICK ACTIONS */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,160,64,0.13)', padding: '18px 18px 14px' }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.22em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 14 }}>Quick Actions</div>
                    {[
                      { label: 'Add New Product', action: () => { setForm({...EMPTY}); setEditId(null); setTab(2); }, primary: true },
                      { label: 'View All Orders',  action: () => setTab(3), primary: false },
                      { label: 'Manage Stories',   action: () => setTab(5), primary: false },
                      { label: 'Brand Settings',   action: () => setTab(6), primary: false },
                    ].map(({ label, action, primary }) => (
                      <button key={label} onClick={action} style={{
                        width: '100%', display: 'block', padding: '10px 14px', marginBottom: 8,
                        background: primary ? 'var(--gd)' : 'rgba(255,255,255,0.04)',
                        border: primary ? 'none' : '1px solid rgba(212,160,64,0.2)',
                        fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: '0.13em', textTransform: 'uppercase',
                        color: primary ? '#080408' : 'rgba(248,236,216,0.55)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { if (primary) { e.currentTarget.style.background='var(--gl)'; } else { e.currentTarget.style.background='rgba(212,160,64,0.08)'; e.currentTarget.style.borderColor='rgba(212,160,64,0.4)'; e.currentTarget.style.color='var(--gd)'; } }}
                        onMouseLeave={e => { if (primary) { e.currentTarget.style.background='var(--gd)'; } else { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(212,160,64,0.2)'; e.currentTarget.style.color='rgba(248,236,216,0.55)'; } }}
                      >{label}</button>
                    ))}
                  </div>

                  {/* LOW STOCK ALERT */}
                  {lowStock.length > 0 && (
                    <div style={{ background: 'rgba(232,160,64,0.07)', border: '1px solid rgba(232,160,64,0.28)', padding: '14px 16px' }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: '0.18em', color: '#E8A040', textTransform: 'uppercase', marginBottom: 10 }}>⚠ Low Stock</div>
                      {lowStock.slice(0, 4).map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(248,236,216,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.name}</span>
                          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, color: '#E8A040', marginLeft: 8, flexShrink: 0, letterSpacing: '0.1em' }}>LAST 1</span>
                        </div>
                      ))}
                      {lowStock.length > 4 && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(248,236,216,0.3)', fontStyle: 'italic', marginTop: 4 }}>+{lowStock.length - 4} more</div>}
                    </div>
                  )}

                  {/* CATALOGUE BREAKDOWN */}
                  {products.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,160,64,0.13)', padding: '14px 16px' }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 12 }}>By Category</div>
                      {CATS.map(cat => {
                        const count = products.filter(p => p.cat === cat).length;
                        if (!count) return null;
                        return (
                          <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(248,236,216,0.55)', textTransform: 'capitalize' }}>{cat}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 60, height: 3, background: 'rgba(212,160,64,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ width: `${(count / products.length) * 100}%`, height: '100%', background: 'var(--gd)' }} />
                              </div>
                              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: 'var(--gd)', minWidth: 16, textAlign: 'right' }}>{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS LIST ── */}
          {tab === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>All Products ({products.length})</div>
                <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setTab(2); }} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 18px', cursor: 'pointer' }}>Add New Product</button>
              </div>
              {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(245,237,216,0.3)' }}>Loading...</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                    <thead>
                      <tr>
                        {['Image','Name','Category','Price','Stock','Visible','Actions'].map(h => (
                          <th key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(200,169,110,0.12)', color: 'rgba(245,237,216,0.4)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}
                          style={{ transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>
                            <div style={{ width: 52, height: 52, background: p.bg, overflow: 'hidden' }}>
                              {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{p.name}</td>
                          <td style={{ padding: '10px 12px', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', color: 'var(--gd)', textTransform: 'uppercase', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{p.cat}</td>
                          <td style={{ padding: '10px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', fontWeight: 500, borderBottom: '1px solid rgba(200,169,110,0.06)' }}>
                            {p.enquiry_only ? <span style={{ fontStyle: 'italic', fontSize: 13, color: 'rgba(245,237,216,0.5)' }}>Enquiry</span> : fmt(p.price)}
                          </td>
                          <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>
                            {p.stock === 0
                              ? <span style={{ background: '#444', color: '#999', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>Sold</span>
                              : p.stock === 1
                              ? <span style={{ background: 'var(--tr)', color: '#fff', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>Last 1</span>
                              : <span style={{ color: 'rgba(245,237,216,0.6)', fontSize: 13, fontFamily: "'Cormorant Garamond',serif" }}>{p.stock}</span>
                            }
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: p.available ? '#5AA85A' : '#C07070', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>
                            {p.available ? 'Live' : 'Hidden'}
                          </td>
                          <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => editProduct(p)} style={{ background: 'none', border: '1px solid rgba(200,169,110,0.25)', fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.12em', color: 'var(--gd)', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,169,110,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                              >Edit</button>
                              <button onClick={() => deleteProduct(p.id, p.name)} style={{ background: 'none', border: '1px solid rgba(192,57,43,0.4)', fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.12em', color: '#C0392B', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.2)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16 }}>No products yet — click "Add New Product" to get started</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ADD / EDIT PRODUCT ── */}
          {tab === 2 && (
            <div style={{ maxWidth: 740 }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,160,64,0.18)', padding: '34px 32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Product Name *</label><input style={inp} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Naranbil Bhagavathy" onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e => setF('subtitle', e.target.value)} placeholder="e.g. Guardian of Justice" onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div><label style={lbl}>Category</label><select style={{ ...inp, cursor: 'pointer' }} value={form.cat} onChange={e => setF('cat', e.target.value)}>{CATS.map(c => <option key={c} value={c} style={{ background: '#2D1A0E' }}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Origin</label><input style={inp} value={form.origin} onChange={e => setF('origin', e.target.value)} placeholder="e.g. North Malabar, Kerala" onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div><label style={lbl}>Material</label><input style={inp} value={form.material} onChange={e => setF('material', e.target.value)} placeholder="e.g. Bronze" onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div><label style={lbl}>Dimensions</label><input style={inp} value={form.dimensions} onChange={e => setF('dimensions', e.target.value)} placeholder='10" H x 4" W' onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div><label style={lbl}>Weight</label><input style={inp} value={form.weight} onChange={e => setF('weight', e.target.value)} placeholder="e.g. 1.2 kg" onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div><label style={lbl}>Stock (0 = Sold Out)</label><input style={inp} type="number" min="0" value={form.stock} onChange={e => setF('stock', e.target.value)} onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="eq" checked={form.enquiry_only} onChange={e => setF('enquiry_only', e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                    <label htmlFor="eq" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Enquiry Only — hide price, show WhatsApp button</label>
                  </div>
                  {!form.enquiry_only && (
                    <div><label style={lbl}>Price (Rs.)</label><input style={inp} type="number" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="e.g. 45000" onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  )}
                  <div><label style={lbl}>Badge</label><input style={inp} value={form.badge} onChange={e => setF('badge', e.target.value)} placeholder="Featured / Rare / Collector" onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="av" checked={form.available} onChange={e => setF('available', e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                    <label htmlFor="av" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Visible on website</label>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Story</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} rows={4} value={form.story} onChange={e => setF('story', e.target.value)} placeholder="The story behind this piece..." onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Collection Note</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} rows={3} value={form.together} onChange={e => setF('together', e.target.value)} placeholder="Context..." onFocus={e => e.target.style.borderColor='var(--gd)'} onBlur={e => e.target.style.borderColor='rgba(200,169,110,0.2)'} /></div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <ImageUploader images={form.images || []} onChange={imgs => setF('images', imgs)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                  <button onClick={saveProduct} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {saving && <span style={{ width: 14, height: 14, border: '2px solid rgba(26,15,8,0.3)', borderTopColor: '#080408', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                    {editId ? 'Update Product' : 'Add Product'}
                  </button>
                  {editId && (
                    <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setTab(1); }} style={{ background: 'transparent', border: '1px solid rgba(245,237,216,0.25)', color: 'rgba(245,237,216,0.6)', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer' }}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 3 && (
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', marginBottom: 20, textTransform: 'uppercase' }}>All Orders ({orders.length})</div>
              {loading ? <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner"></span></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {orders.map(o => (
                    <div key={o.id} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,160,64,0.15)', padding: '24px 26px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                        <div>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.2em', color: 'var(--gd)' }}>{o.order_id || o.id.slice(-8).toUpperCase()}</div>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(245,237,216,0.7)', marginTop: 3 }}>{o.user_name} — {o.user_email}</div>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.4)', marginTop: 2 }}>{o.user_phone} | {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'var(--iv)', fontWeight: 500 }}>{fmt(o.total)}</div>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, color: o.payment_method === 'razorpay' ? '#5AA85A' : 'var(--gd)', textTransform: 'uppercase', marginTop: 4 }}>{o.payment_method === 'razorpay' ? 'Online' : 'WhatsApp/COD'}</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(200,169,110,0.08)' }}>
                        {o.items?.map((item, i) => <span key={i} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.5)', marginRight: 12 }}>{item.name} ×{item.qty}</span>)}
                      </div>
                      {o.address && (
                        <div style={{ marginBottom: 14, fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.4)', lineHeight: 1.6 }}>
                          {o.address.line1}{o.address.line2 ? ', ' + o.address.line2 : ''}, {o.address.city}, {o.address.state} — {o.address.pincode}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div>
                          <label style={{ ...lbl, marginBottom: 6 }}>Status</label>
                          <select value={o.status || 'Pending'} onChange={e => updateStatus(o.id, e.target.value)} style={{ background: 'rgba(45,26,14,0.95)', border: '1px solid rgba(200,169,110,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.1em', outline: 'none', cursor: 'pointer' }}>
                            {STATUSES.map(s => <option key={s} value={s} style={{ background: '#2D1A0E' }}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ ...lbl, marginBottom: 6 }}>Delivery Date</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input type="date" id={`dd-${o.id}`} defaultValue={o.estimated_delivery ? new Date(o.estimated_delivery).toISOString?.().split('T')[0] : ''} style={{ background: 'rgba(45,26,14,0.95)', border: '1px solid rgba(200,169,110,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
                            <button onClick={() => { const v = document.getElementById(`dd-${o.id}`)?.value; if (v) { const d = new Date(v); updateDelivery(o.id, d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })); } }} style={{ background: 'var(--gd)', border: 'none', color: '#080408', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 14px', cursor: 'pointer' }}>Set</button>
                          </div>
                          {o.estimated_delivery && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'var(--gd)', marginTop: 5, fontStyle: 'italic' }}>Set: {o.estimated_delivery}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <div style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.2)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16 }}>No orders yet</div>}
                </div>
              )}
            </div>
          )}

          {/* ── ENQUIRIES ── */}
          {tab === 4 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr>
                    {['Product','Customer','Message','Date','Type','Status'].map(h => (
                      <th key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(200,169,110,0.12)', color: 'rgba(245,237,216,0.4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map(e => (
                    <tr key={e.id}>
                      <td style={{ padding: '12px', color: 'rgba(245,237,216,0.7)', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{e.product || '—'}</td>
                      <td style={{ padding: '12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.6)', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>
                        {e.user_name}<br /><span style={{ opacity: 0.5, fontSize: 11 }}>{e.user_email}</span>
                      </td>
                      <td style={{ padding: '12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.5)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{e.message || '—'}</td>
                      <td style={{ padding: '12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.4)', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}><span style={{ background: 'rgba(70,130,80,0.1)', color: '#5AA85A', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>{e.type || 'Email'}</span></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}><span style={{ background: 'rgba(200,169,110,0.1)', color: 'var(--gd)', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>{e.status || 'Received'}</span></td>
                    </tr>
                  ))}
                  {enquiries.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.2)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16 }}>No enquiries yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── STORIES ── */}
          {tab === 5 && <StoriesManager />}

          {/* ── BRAND SETTINGS ── */}
          {tab === 6 && <BrandSettings />}

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .admin-sidebar { width: 200px !important; }
          .admin-main { margin-left: 200px !important; }
        }
      `}</style>
    </div>
  );
}
