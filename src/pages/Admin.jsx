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

// Rajput palette constants
const M = {
  bg:          'linear-gradient(160deg,#2E080F 0%,#390E18 55%,#3E1019 100%)',
  sidebar:     'linear-gradient(180deg,#1E0507 0%,#260A0F 55%,#2B0C12 100%)',
  sidebarBdr:  'rgba(210,145,45,0.26)',
  topbar:      'rgba(16,4,8,0.94)',
  card:        'rgba(10,2,6,0.42)',
  cardBdr:     'rgba(210,145,45,0.18)',
  rowHover:    'rgba(80,12,28,0.45)',
  navActive:   'rgba(160,30,55,0.48)',
  navHover:    'rgba(120,20,40,0.32)',
  gold:        '#C89430',
  goldFaint:   'rgba(200,148,48,0.16)',
  goldLine:    'linear-gradient(90deg,transparent,rgba(200,148,48,0.55),transparent)',
  maroon:      '#8B1828',
  maroonFaint: 'rgba(160,28,50,0.2)',
  dividerH:    '1px solid rgba(200,145,45,0.16)',
  selectBg:    'rgba(18,5,9,0.98)',
};

// ── NAV ITEMS ──────────────────────────────────────────────
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

// Decorative gold divider
const GoldDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 22px', margin: '4px 0' }}>
    <div style={{ flex: 1, height: 1, background: M.goldLine }} />
    <svg width="7" height="7" viewBox="0 0 10 10" fill={M.gold} opacity="0.6">
      <polygon points="5,0 6.5,3.5 10,5 6.5,6.5 5,10 3.5,6.5 0,5 3.5,3.5"/>
    </svg>
    <div style={{ flex: 1, height: 1, background: M.goldLine }} />
  </div>
);

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

  const lbl = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.14em', color: 'rgba(245,237,216,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: M.card, border: `1px solid ${M.cardBdr}`, color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, outline: 'none', caretColor: M.gold };

  if (view === 'list') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: M.gold, textTransform: 'uppercase' }}>Stories &amp; Blog ({stories.length})</div>
          <button onClick={startNew} className="adm-btn-gold">Add New Story</button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner"></span></div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'rgba(245,237,216,0.4)', fontStyle: 'italic' }}>No stories yet. Click "Add New Story" to publish your first one.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stories.map(s => (
              <div key={s.id} style={{ background: M.card, border: `1px solid ${M.cardBdr}`, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'center' }}>
                {s.images?.[0] && <img src={s.images[0]} alt="" style={{ width: 64, height: 64, objectFit: 'cover', flexShrink: 0, border: `1px solid ${M.cardBdr}` }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', color: M.gold, background: M.goldFaint, padding: '2px 8px' }}>{s.category}</span>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.published ? '#6AD08A' : 'rgba(245,237,216,0.4)' }}>{s.published ? 'Published' : 'Draft'}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'var(--iv)', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(245,237,216,0.45)', fontStyle: 'italic' }}>{s.author} · {new Date(s.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => togglePublish(s)} className="adm-btn-outline">{s.published ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => startEdit(s)} className="adm-btn-gold" style={{ padding: '7px 12px' }}>Edit</button>
                  <button onClick={() => deleteStory(s.id)} className="adm-btn-danger">Delete</button>
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
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: M.gold, textTransform: 'uppercase' }}>{editId ? 'Edit Story' : 'New Story'}</div>
        <button onClick={() => setView('list')} className="adm-btn-outline">Back to List</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. The Last Bell-Maker of Palakkad" className="adm-input" /></div>
        <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e => setF('subtitle', e.target.value)} placeholder="One-line summary shown under the title" className="adm-input" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Category</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => setF('category', e.target.value)} className="adm-input">
              {STORY_CATS.map(c => <option key={c} value={c} style={{ background: '#1A0408' }}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Author</label><input style={inp} value={form.author} onChange={e => setF('author', e.target.value)} className="adm-input" /></div>
        </div>
        <div>
          <label style={lbl}>Story Text</label>
          <textarea style={{ ...inp, minHeight: 180, resize: 'vertical', lineHeight: 1.7 }} value={form.story} onChange={e => setF('story', e.target.value)} placeholder="Write the full story here..." className="adm-input" />
        </div>
        <ImageUploader images={form.images} onChange={imgs => setF('images', imgs)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={form.published} onChange={e => setF('published', e.target.checked)} style={{ width: 16, height: 16, accentColor: M.gold }} />
          <label style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--iv)' }}>Published — visible on the public Stories page</label>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={saveStory} disabled={saving} className="adm-btn-gold" style={{ padding: '13px 28px', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : editId ? 'Update Story' : 'Publish Story'}
          </button>
          {editId && <button onClick={() => { setForm({ ...EMPTY_STORY }); setEditId(null); setView('list'); }} className="adm-btn-outline" style={{ padding: '13px 28px' }}>Cancel</button>}
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

  const lbl = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.14em', color: 'rgba(245,237,216,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: M.card, border: `1px solid ${M.cardBdr}`, color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, outline: 'none', caretColor: M.gold };
  const section = { background: M.card, border: `1px solid ${M.cardBdr}`, padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 16, boxShadow: 'inset 0 0 40px rgba(80,8,20,0.12)' };
  const secHead = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.25em', textTransform: 'uppercase', color: M.gold, opacity: 0.85, marginBottom: 4 };
  const helpText = { fontFamily: "'Cormorant Garamond',serif", fontSize: 12.5, fontStyle: 'italic', color: 'rgba(248,236,216,.55)' };

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
          <div style={{ position: 'relative', height: 130, overflow: 'hidden', border: `1px solid ${M.cardBdr}` }}>
            <img src={brand[field]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .7 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,2,5,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: `${M.gold}cc` }}>Current Image</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={heroUrls[field]} onChange={e => setHeroUrls(h => ({ ...h, [field]: e.target.value }))} placeholder="Paste Cloudinary image URL..." style={{ ...inp, flex: 1 }} className="adm-input" />
          <button onClick={() => saveHeroField(field)} className="adm-btn-gold" style={{ whiteSpace: 'nowrap' }}>Save</button>
        </div>
        {brand[field] && <button onClick={() => removeHeroField(field)} className="adm-btn-danger" style={{ alignSelf: 'flex-start' }}>Remove Image</button>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: M.gold, marginBottom: 20, textTransform: 'uppercase' }}>Brand Settings</div>

      <div style={section}>
        <div style={secHead}>Logo Image</div>
        {brand.logo_url && <img src={brand.logo_url} alt="Logo" style={{ height: 48, objectFit: 'contain', maxWidth: 200, marginBottom: 4, display: 'block', border: `1px solid ${M.cardBdr}`, padding: 6 }} />}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Paste Cloudinary logo URL..." style={{ ...inp, flex: 1 }} className="adm-input" />
          <button onClick={saveLogoUrl} className="adm-btn-gold" style={{ whiteSpace: 'nowrap' }}>Save Logo</button>
        </div>
        {brand.logo_url && <button onClick={() => updateBrand({ logo_url: '' })} className="adm-btn-danger" style={{ alignSelf: 'flex-start' }}>Remove Logo</button>}
      </div>

      <div style={section}>
        <div style={secHead}>Brand Text</div>
        <div><label style={lbl}>Brand Name</label><input style={inp} value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} className="adm-input" /></div>
        <div><label style={lbl}>Tagline</label><input style={inp} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} className="adm-input" /></div>
        <button onClick={saveBrand} disabled={saving} className="adm-btn-gold" style={{ alignSelf: 'flex-start', padding: '13px 28px', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Brand Text'}
        </button>
      </div>

      <div style={section}>
        <div style={secHead}>Home Page Product Showcase</div>
        <div style={helpText}>Choose how many products appear in the "Featured Acquisitions" section on the homepage.</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={brand.featured_count || 3} onChange={e => saveFeaturedCount(Number(e.target.value))} style={{ ...inp, width: 120, cursor: 'pointer' }} className="adm-input">
            {[2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: '#1A0408' }}>{n} products</option>)}
          </select>
          <span style={helpText}>currently showing {brand.featured_count || 3}</span>
        </div>
      </div>

      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: M.gold, margin: '32px 0 16px', textTransform: 'uppercase' }}>Per-Page Hero Images</div>
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
  const inp = { width: '100%', padding: '10px 12px', background: M.card, border: `1px solid ${M.cardBdr}`, color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: 'none', transition: 'border-color 0.25s' };

  const lowStock = products.filter(p => p.stock === 1 && p.available);

  const statusColor = s => s === 'Delivered' ? '#6AD08A' : s === 'Cancelled' ? '#E07070' : s === 'Pending' ? '#E8A040' : s === 'Shipped' ? '#8090E0' : 'var(--iv)';
  const statusBg   = s => s === 'Delivered' ? 'rgba(106,208,138,0.12)' : s === 'Cancelled' ? 'rgba(224,112,112,0.12)' : s === 'Pending' ? 'rgba(232,160,64,0.12)' : s === 'Shipped' ? 'rgba(128,144,224,0.12)' : M.goldFaint;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: M.bg, color: 'var(--iv)' }}>

      {/* ══ SIDEBAR ══════════════════════════════════════ */}
      <aside style={{
        width: 234, flexShrink: 0,
        background: M.sidebar,
        borderRight: `1px solid ${M.sidebarBdr}`,
        boxShadow: '4px 0 40px rgba(0,0,0,0.7), inset -1px 0 0 rgba(200,148,48,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 200, overflowY: 'auto',
        backdropFilter: 'blur(18px)',
      }}>

        {/* LOGO / BRAND */}
        <div style={{ padding: '26px 22px 18px' }}>
          {/* decorative top corner accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 60, height: 60, background: `radial-gradient(circle at 0 0, ${M.goldFaint}, transparent 70%)`, pointerEvents: 'none' }} />

          {brand.logo_url ? (
            <img src={brand.logo_url} alt={brand.brand_name || 'Logo'}
              style={{ height: 48, objectFit: 'contain', maxWidth: 172, display: 'block', marginBottom: 12, filter: 'drop-shadow(0 2px 8px rgba(200,148,48,0.25))' }}
            />
          ) : (
            <div style={{ width: 44, height: 44, background: M.goldFaint, border: `1px solid rgba(200,148,48,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={M.gold} strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          )}
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'var(--iv)', lineHeight: 1.1, letterSpacing: '.03em', fontWeight: 400 }}>
            {brand.brand_name || 'Tamarind Taless'}
          </div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.38em', color: M.gold, textTransform: 'uppercase', marginTop: 6, opacity: 0.9 }}>
            Admin Panel
          </div>
        </div>

        <GoldDivider />

        {/* NAV ITEMS */}
        <nav style={{ flex: 1, padding: '6px 0' }}>
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 22px',
                  background: active ? M.navActive : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${active ? M.gold : 'transparent'}`,
                  color: active ? M.gold : 'rgba(245,237,216,0.38)',
                  fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.11em',
                  textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.18s',
                  boxShadow: active ? `inset 0 0 24px rgba(120,18,35,0.25)` : 'none',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = M.navHover; e.currentTarget.style.color = 'rgba(245,237,216,0.68)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(245,237,216,0.38)'; } }}
              >
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.5 }}>{icon}</span>
                {label}
                {id === 3 && orders.filter(o => o.status === 'Pending').length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#C8421A', color: '#fff', fontFamily: "'Cinzel',serif", fontSize: 7, padding: '1px 6px', borderRadius: 99 }}>
                    {orders.filter(o => o.status === 'Pending').length}
                  </span>
                )}
                {id === 4 && enquiries.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: M.goldFaint, color: M.gold, fontFamily: "'Cinzel',serif", fontSize: 7, padding: '1px 6px', borderRadius: 99 }}>
                    {enquiries.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <GoldDivider />

        {/* BOTTOM: USER + ACTIONS */}
        <div style={{ padding: '14px 18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: M.maroonFaint, border: `1px solid rgba(200,148,48,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={M.gold} strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.1em', color: `${M.gold}bb`, textTransform: 'uppercase', marginBottom: 1 }}>Admin</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button onClick={() => navigate('/')} className="adm-btn-side" style={{ flex: 1 }}>View Site</button>
            <button onClick={() => { logout(); navigate('/admin/login'); }} className="adm-btn-side-danger" style={{ flex: 1 }}>Sign Out</button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN AREA ═════════════════════════════════════ */}
      <div style={{ marginLeft: 234, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        {/* TOP BAR */}
        <div style={{
          background: M.topbar,
          backdropFilter: 'blur(18px)',
          borderBottom: `1px solid ${M.sidebarBdr}`,
          boxShadow: `0 1px 0 rgba(200,148,48,0.06), 0 4px 24px rgba(0,0,0,0.5)`,
          padding: '14px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: '0.28em', color: `${M.gold}90`, textTransform: 'uppercase', marginBottom: 4 }}>
              {['Dashboard','Products','Add Product','Orders','Enquiries','Stories','Brand Settings'][tab]}
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: 'var(--iv)', lineHeight: 1, fontWeight: 300, letterSpacing: '.02em' }}>
              {tab === 2 && editId ? 'Edit Product' : ['Overview','All Products','Add New Product','All Orders','All Enquiries','Stories & Blog','Brand Settings'][tab]}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* decorative gem */}
            <svg width="6" height="6" viewBox="0 0 10 10" fill={M.gold} opacity="0.4">
              <polygon points="5,0 6.5,3.5 10,5 6.5,6.5 5,10 3.5,6.5 0,5 3.5,3.5"/>
            </svg>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(245,237,216,0.32)', fontStyle: 'italic' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
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
                  { label: 'Total Products', value: products.length, color: M.gold,    bg: M.goldFaint,              sub: 'In catalogue',   border: M.gold },
                  { label: 'Total Orders',   value: orders.length,   color: '#6AD08A', bg: 'rgba(106,208,138,0.07)', sub: 'All time',        border: '#6AD08A' },
                  { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, color: '#E8A040', bg: 'rgba(232,160,64,0.07)', sub: 'Need attention', border: '#E8A040' },
                  { label: 'Enquiries',      value: enquiries.length, color: '#C06080', bg: M.maroonFaint,            sub: 'Total received',  border: M.maroon },
                ].map(({ label, value, color, bg, sub, border }) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${border}28`, borderTop: `3px solid ${border}`, padding: '22px 20px', boxShadow: `inset 0 0 30px rgba(80,6,18,0.1), 0 2px 16px rgba(0,0,0,0.3)` }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 52, color, fontWeight: 300, lineHeight: 1, marginBottom: 10 }}>{value}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.16em', color: 'var(--iv)', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(245,237,216,0.35)', marginTop: 4, fontStyle: 'italic' }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* RECENT ORDERS + SIDE PANEL */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 24 }}>

                {/* RECENT ORDERS TABLE */}
                <div style={{ background: M.card, border: `1px solid ${M.cardBdr}`, overflow: 'hidden', boxShadow: `inset 0 0 40px rgba(60,5,15,0.12)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: M.dividerH, background: 'rgba(60,5,15,0.3)' }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.2em', color: M.gold, textTransform: 'uppercase' }}>Recent Orders</div>
                    <button onClick={() => setTab(3)} style={{ background: 'none', border: 'none', fontFamily: "'Cinzel',serif", fontSize: 7.5, color: `${M.gold}88`, cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = M.gold}
                      onMouseLeave={e => e.currentTarget.style.color = `${M.gold}88`}
                    >View All →</button>
                  </div>
                  {orders.length === 0 ? (
                    <div style={{ padding: '44px 20px', textAlign: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(245,237,216,0.22)', fontStyle: 'italic' }}>No orders yet</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(50,5,14,0.4)' }}>
                          {['Order ID','Customer','Items','Total','Status'].map(h => (
                            <th key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 14px', textAlign: 'left', color: `${M.gold}70`, borderBottom: M.dividerH, fontWeight: 400 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 7).map(o => (
                          <tr key={o.id} style={{ transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = M.rowHover}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '10px 14px', fontFamily: "'Cinzel',serif", fontSize: 8.5, color: M.gold, borderBottom: `1px solid rgba(80,5,18,0.25)`, whiteSpace: 'nowrap' }}>{o.order_id || o.id.slice(-8).toUpperCase()}</td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--iv)', borderBottom: `1px solid rgba(80,5,18,0.25)` }}>{o.user_name || '—'}</td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(245,237,216,0.4)', borderBottom: `1px solid rgba(80,5,18,0.25)`, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items?.map(i => i.name).join(', ') || '—'}</td>
                            <td style={{ padding: '10px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', fontWeight: 500, borderBottom: `1px solid rgba(80,5,18,0.25)`, whiteSpace: 'nowrap' }}>{fmt(o.total)}</td>
                            <td style={{ padding: '10px 14px', borderBottom: `1px solid rgba(80,5,18,0.25)` }}>
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
                  <div style={{ background: M.card, border: `1px solid ${M.cardBdr}`, padding: '18px 18px 14px', boxShadow: `inset 0 0 30px rgba(60,5,15,0.12)` }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.18em', color: M.gold, textTransform: 'uppercase', marginBottom: 6 }}>Quick Actions</div>
                    <div style={{ height: 1, background: M.goldLine, marginBottom: 14 }} />
                    {[
                      { label: 'Add New Product', action: () => { setForm({...EMPTY}); setEditId(null); setTab(2); }, primary: true },
                      { label: 'View All Orders',  action: () => setTab(3), primary: false },
                      { label: 'Manage Stories',   action: () => setTab(5), primary: false },
                      { label: 'Brand Settings',   action: () => setTab(6), primary: false },
                    ].map(({ label, action, primary }) => (
                      <button key={label} onClick={action} style={{
                        width: '100%', display: 'block', padding: '10px 14px', marginBottom: 8,
                        background: primary ? `linear-gradient(135deg,${M.gold},#A87020)` : M.maroonFaint,
                        border: primary ? 'none' : `1px solid ${M.cardBdr}`,
                        fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.11em', textTransform: 'uppercase',
                        color: primary ? '#0E0205' : 'rgba(245,237,216,0.5)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                        boxShadow: primary ? '0 4px 14px rgba(180,120,20,0.3)' : 'none',
                      }}
                        onMouseEnter={e => { if (primary) { e.currentTarget.style.boxShadow='0 4px 20px rgba(200,148,48,0.5)'; } else { e.currentTarget.style.background=`rgba(130,18,40,0.25)`; e.currentTarget.style.borderColor=`rgba(200,148,48,0.35)`; e.currentTarget.style.color=M.gold; } }}
                        onMouseLeave={e => { if (primary) { e.currentTarget.style.boxShadow='0 4px 14px rgba(180,120,20,0.3)'; } else { e.currentTarget.style.background=M.maroonFaint; e.currentTarget.style.borderColor=M.cardBdr; e.currentTarget.style.color='rgba(245,237,216,0.5)'; } }}
                      >{label}</button>
                    ))}
                  </div>

                  {/* LOW STOCK ALERT */}
                  {lowStock.length > 0 && (
                    <div style={{ background: 'rgba(200,80,20,0.08)', border: '1px solid rgba(232,140,40,0.28)', padding: '14px 16px' }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: '0.18em', color: '#E8A040', textTransform: 'uppercase', marginBottom: 10 }}>⚠ Low Stock</div>
                      {lowStock.slice(0, 4).map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.name}</span>
                          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, color: '#E8A040', marginLeft: 8, flexShrink: 0, letterSpacing: '0.1em' }}>LAST 1</span>
                        </div>
                      ))}
                      {lowStock.length > 4 && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(245,237,216,0.28)', fontStyle: 'italic', marginTop: 4 }}>+{lowStock.length - 4} more</div>}
                    </div>
                  )}

                  {/* CATEGORY BREAKDOWN */}
                  {products.length > 0 && (
                    <div style={{ background: M.card, border: `1px solid ${M.cardBdr}`, padding: '14px 16px' }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.18em', color: M.gold, textTransform: 'uppercase', marginBottom: 6 }}>By Category</div>
                      <div style={{ height: 1, background: M.goldLine, marginBottom: 12 }} />
                      {CATS.map(cat => {
                        const count = products.filter(p => p.cat === cat).length;
                        if (!count) return null;
                        return (
                          <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.5)', textTransform: 'capitalize' }}>{cat}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 60, height: 3, background: 'rgba(200,148,48,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ width: `${(count / products.length) * 100}%`, height: '100%', background: `linear-gradient(90deg,${M.maroon},${M.gold})` }} />
                              </div>
                              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: M.gold, minWidth: 16, textAlign: 'right' }}>{count}</span>
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
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: '0.18em', color: M.gold, textTransform: 'uppercase' }}>All Products ({products.length})</div>
                <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setTab(2); }} className="adm-btn-gold">Add New Product</button>
              </div>
              {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(245,237,216,0.25)' }}>Loading...</div> : (
                <div style={{ overflowX: 'auto', background: M.card, border: `1px solid ${M.cardBdr}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                    <thead>
                      <tr style={{ background: 'rgba(60,5,15,0.5)' }}>
                        {['Image','Name','Category','Price','Stock','Visible','Actions'].map(h => (
                          <th key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 14px', textAlign: 'left', borderBottom: M.dividerH, color: `${M.gold}80`, fontWeight: 400 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} style={{ transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = M.rowHover}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 14px', borderBottom: `1px solid rgba(80,5,18,0.18)` }}>
                            <div style={{ width: 52, height: 52, background: p.bg, overflow: 'hidden' }}>
                              {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, borderBottom: `1px solid rgba(80,5,18,0.18)` }}>{p.name}</td>
                          <td style={{ padding: '10px 14px', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', color: M.gold, textTransform: 'uppercase', borderBottom: `1px solid rgba(80,5,18,0.18)` }}>{p.cat}</td>
                          <td style={{ padding: '10px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', fontWeight: 500, borderBottom: `1px solid rgba(80,5,18,0.18)` }}>
                            {p.enquiry_only ? <span style={{ fontStyle: 'italic', fontSize: 13, color: 'rgba(245,237,216,0.45)' }}>Enquiry</span> : fmt(p.price)}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: `1px solid rgba(80,5,18,0.18)` }}>
                            {p.stock === 0
                              ? <span style={{ background: 'rgba(80,80,80,0.25)', color: '#888', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>Sold</span>
                              : p.stock === 1
                              ? <span style={{ background: M.maroonFaint, color: '#E07070', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase', border: '1px solid rgba(200,80,80,0.3)' }}>Last 1</span>
                              : <span style={{ color: 'rgba(245,237,216,0.55)', fontSize: 13, fontFamily: "'Cormorant Garamond',serif" }}>{p.stock}</span>
                            }
                          </td>
                          <td style={{ padding: '10px 14px', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: p.available ? '#5AA85A' : '#C07070', borderBottom: `1px solid rgba(80,5,18,0.18)` }}>
                            {p.available ? 'Live' : 'Hidden'}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: `1px solid rgba(80,5,18,0.18)` }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => editProduct(p)} className="adm-btn-outline" style={{ padding: '5px 10px', fontSize: 7 }}>Edit</button>
                              <button onClick={() => deleteProduct(p.id, p.name)} className="adm-btn-danger" style={{ padding: '5px 10px', fontSize: 7 }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.18)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16 }}>No products yet — click "Add New Product" to get started</td></tr>
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
              <div style={{ background: M.card, border: `1px solid ${M.cardBdr}`, padding: '34px 32px', boxShadow: `inset 0 0 60px rgba(60,5,15,0.14)` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Product Name *</label><input style={inp} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Naranbil Bhagavathy" className="adm-input" /></div>
                  <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e => setF('subtitle', e.target.value)} placeholder="e.g. Guardian of Justice" className="adm-input" /></div>
                  <div><label style={lbl}>Category</label><select style={{ ...inp, cursor: 'pointer' }} value={form.cat} onChange={e => setF('cat', e.target.value)} className="adm-input">{CATS.map(c => <option key={c} value={c} style={{ background: '#1A0408' }}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Origin</label><input style={inp} value={form.origin} onChange={e => setF('origin', e.target.value)} placeholder="e.g. North Malabar, Kerala" className="adm-input" /></div>
                  <div><label style={lbl}>Material</label><input style={inp} value={form.material} onChange={e => setF('material', e.target.value)} placeholder="e.g. Bronze" className="adm-input" /></div>
                  <div><label style={lbl}>Dimensions</label><input style={inp} value={form.dimensions} onChange={e => setF('dimensions', e.target.value)} placeholder='10" H x 4" W' className="adm-input" /></div>
                  <div><label style={lbl}>Weight</label><input style={inp} value={form.weight} onChange={e => setF('weight', e.target.value)} placeholder="e.g. 1.2 kg" className="adm-input" /></div>
                  <div><label style={lbl}>Stock (0 = Sold Out)</label><input style={inp} type="number" min="0" value={form.stock} onChange={e => setF('stock', e.target.value)} className="adm-input" /></div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="eq" checked={form.enquiry_only} onChange={e => setF('enquiry_only', e.target.checked)} style={{ accentColor: M.gold, width: 16, height: 16, cursor: 'pointer' }} />
                    <label htmlFor="eq" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Enquiry Only — hide price, show WhatsApp button</label>
                  </div>
                  {!form.enquiry_only && (
                    <div><label style={lbl}>Price (Rs.)</label><input style={inp} type="number" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="e.g. 45000" className="adm-input" /></div>
                  )}
                  <div><label style={lbl}>Badge</label><input style={inp} value={form.badge} onChange={e => setF('badge', e.target.value)} placeholder="Featured / Rare / Collector" className="adm-input" /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="av" checked={form.available} onChange={e => setF('available', e.target.checked)} style={{ accentColor: M.gold, width: 16, height: 16, cursor: 'pointer' }} />
                    <label htmlFor="av" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Visible on website</label>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Story</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} rows={4} value={form.story} onChange={e => setF('story', e.target.value)} placeholder="The story behind this piece..." className="adm-input" /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Collection Note</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} rows={3} value={form.together} onChange={e => setF('together', e.target.value)} placeholder="Context..." className="adm-input" /></div>
                  <div style={{ gridColumn: '1/-1' }}><ImageUploader images={form.images || []} onChange={imgs => setF('images', imgs)} /></div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                  <button onClick={saveProduct} disabled={saving} className="adm-btn-gold" style={{ padding: '13px 28px', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {saving && <span style={{ width: 14, height: 14, border: '2px solid rgba(14,2,5,0.3)', borderTopColor: '#0E0205', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                    {editId ? 'Update Product' : 'Add Product'}
                  </button>
                  {editId && (
                    <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setTab(1); }} className="adm-btn-outline" style={{ padding: '13px 28px' }}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 3 && (
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: '0.18em', color: M.gold, marginBottom: 20, textTransform: 'uppercase' }}>All Orders ({orders.length})</div>
              {loading ? <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner"></span></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {orders.map(o => (
                    <div key={o.id} style={{ background: M.card, border: `1px solid ${M.cardBdr}`, padding: '24px 26px', boxShadow: `inset 0 0 30px rgba(60,5,15,0.1)` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                        <div>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.2em', color: M.gold }}>{o.order_id || o.id.slice(-8).toUpperCase()}</div>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(245,237,216,0.65)', marginTop: 3 }}>{o.user_name} — {o.user_email}</div>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.35)', marginTop: 2 }}>{o.user_phone} | {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'var(--iv)', fontWeight: 500 }}>{fmt(o.total)}</div>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, color: o.payment_method === 'razorpay' ? '#5AA85A' : M.gold, textTransform: 'uppercase', marginTop: 4 }}>{o.payment_method === 'razorpay' ? 'Online' : 'WhatsApp/COD'}</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: M.dividerH }}>
                        {o.items?.map((item, i) => <span key={i} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.45)', marginRight: 12 }}>{item.name} ×{item.qty}</span>)}
                      </div>
                      {o.address && (
                        <div style={{ marginBottom: 14, fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.35)', lineHeight: 1.6 }}>
                          {o.address.line1}{o.address.line2 ? ', ' + o.address.line2 : ''}, {o.address.city}, {o.address.state} — {o.address.pincode}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div>
                          <label style={{ ...lbl, marginBottom: 6 }}>Status</label>
                          <select value={o.status || 'Pending'} onChange={e => updateStatus(o.id, e.target.value)} style={{ background: M.selectBg, border: `1px solid ${M.cardBdr}`, color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.1em', outline: 'none', cursor: 'pointer' }}>
                            {STATUSES.map(s => <option key={s} value={s} style={{ background: '#1A0408' }}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ ...lbl, marginBottom: 6 }}>Delivery Date</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input type="date" id={`dd-${o.id}`} defaultValue={o.estimated_delivery ? new Date(o.estimated_delivery).toISOString?.().split('T')[0] : ''} style={{ background: M.selectBg, border: `1px solid ${M.cardBdr}`, color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
                            <button onClick={() => { const v = document.getElementById(`dd-${o.id}`)?.value; if (v) { const d = new Date(v); updateDelivery(o.id, d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })); } }} className="adm-btn-gold" style={{ padding: '8px 14px', fontSize: 8 }}>Set</button>
                          </div>
                          {o.estimated_delivery && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: M.gold, marginTop: 5, fontStyle: 'italic' }}>Set: {o.estimated_delivery}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <div style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.18)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16 }}>No orders yet</div>}
                </div>
              )}
            </div>
          )}

          {/* ── ENQUIRIES ── */}
          {tab === 4 && (
            <div style={{ background: M.card, border: `1px solid ${M.cardBdr}`, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'rgba(60,5,15,0.5)' }}>
                    {['Product','Customer','Message','Date','Type','Status'].map(h => (
                      <th key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 14px', textAlign: 'left', borderBottom: M.dividerH, color: `${M.gold}80`, fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map(e => (
                    <tr key={e.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = M.rowHover}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 14px', color: 'rgba(245,237,216,0.65)', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, borderBottom: `1px solid rgba(80,5,18,0.18)` }}>{e.product || '—'}</td>
                      <td style={{ padding: '12px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.55)', borderBottom: `1px solid rgba(80,5,18,0.18)` }}>
                        {e.user_name}<br /><span style={{ opacity: 0.45, fontSize: 11 }}>{e.user_email}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.45)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderBottom: `1px solid rgba(80,5,18,0.18)` }}>{e.message || '—'}</td>
                      <td style={{ padding: '12px 14px', fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.35)', borderBottom: `1px solid rgba(80,5,18,0.18)` }}>{e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: `1px solid rgba(80,5,18,0.18)` }}><span style={{ background: 'rgba(60,120,70,0.12)', color: '#5AA85A', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>{e.type || 'Email'}</span></td>
                      <td style={{ padding: '12px 14px', borderBottom: `1px solid rgba(80,5,18,0.18)` }}><span style={{ background: M.goldFaint, color: M.gold, padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>{e.status || 'Received'}</span></td>
                    </tr>
                  ))}
                  {enquiries.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.18)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16 }}>No enquiries yet</td></tr>
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

        /* ── BUTTON CLASSES ── */
        .adm-btn-gold {
          background: linear-gradient(135deg,#C89430,#A07020);
          border: none;
          color: #0E0205;
          font-family: 'Cinzel',serif;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 10px 20px;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(180,120,20,0.28);
          transition: box-shadow 0.2s, filter 0.2s;
        }
        .adm-btn-gold:hover { box-shadow: 0 4px 20px rgba(200,148,48,0.5); filter: brightness(1.08); }

        .adm-btn-outline {
          background: rgba(200,148,48,0.06);
          border: 1px solid rgba(200,148,48,0.28);
          color: rgba(245,237,216,0.6);
          font-family: 'Cinzel',serif;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-btn-outline:hover { background: rgba(200,148,48,0.12); border-color: rgba(200,148,48,0.5); color: #C89430; }

        .adm-btn-danger {
          background: rgba(180,40,40,0.1);
          border: 1px solid rgba(200,60,60,0.3);
          color: #D07070;
          font-family: 'Cinzel',serif;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 7px 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-btn-danger:hover { background: rgba(180,40,40,0.22); border-color: rgba(200,60,60,0.6); color: #E08080; }

        .adm-btn-side {
          background: rgba(200,148,48,0.06);
          border: 1px solid rgba(200,148,48,0.18);
          font-family: 'Cinzel',serif;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(245,237,216,0.42);
          padding: 9px 4px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 2px;
        }
        .adm-btn-side:hover { border-color: rgba(200,148,48,0.45); color: #C89430; }

        .adm-btn-side-danger {
          background: rgba(160,30,40,0.1);
          border: 1px solid rgba(180,50,50,0.25);
          font-family: 'Cinzel',serif;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(210,100,100,0.65);
          padding: 9px 4px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 2px;
        }
        .adm-btn-side-danger:hover { border-color: rgba(200,60,60,0.5); color: #D07070; }

        /* ── INPUT FOCUS ── */
        .adm-input:focus { border-color: #C89430 !important; box-shadow: 0 0 0 1px rgba(200,148,48,0.15); }

        /* ── SCROLLBAR ── */
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-track { background: rgba(20,4,8,0.5); }
        aside::-webkit-scrollbar-thumb { background: rgba(200,148,48,0.2); border-radius: 2px; }
        aside::-webkit-scrollbar-thumb:hover { background: rgba(200,148,48,0.4); }
      `}</style>
    </div>
  );
}
