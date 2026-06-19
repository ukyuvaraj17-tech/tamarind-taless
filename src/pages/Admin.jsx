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
const TABS = ['Dashboard', 'Products', 'Add Product', 'Orders', 'Enquiries', 'Stories', 'Brand Settings'];
const EMPTY = { name: '', cat: 'bronze', subtitle: '', origin: '', material: '', dimensions: '', weight: '', price: '', story: '', together: '', badge: '', enquiry_only: false, stock: 1, available: true, bg: 'linear-gradient(145deg,#2a1f18,#4a3020)', images: [] };

// ── STORIES MANAGER ────────────────────────────────────────
const EMPTY_STORY = { title: '', subtitle: '', category: 'Heritage Notes', author: 'Tamarind Taless', story: '', images: [], published: true };
const STORY_CATS = ['Artisan Story', 'Heritage Notes', "Collector's Corner", 'Behind the Curation'];

function StoriesManager() {
  const [stories, setStories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState('list'); // 'list' or 'edit'
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

  // ── LIST VIEW ──
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

  // ── EDIT/ADD VIEW ──
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

  // Per-page hero image URL inputs
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

  // Reusable hero image upload block
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

      {/* HOME PAGE PRODUCT SHOWCASE */}
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

      <HeroImageField field="hero_image" title="Home Page Hero" description="Full-screen background behind the main homepage headline." />
      <HeroImageField field="hero_shop" title="Shop Page Hero" description="Background banner at the top of the Shop / Collection page." />
      <HeroImageField field="hero_about" title="About Page Hero" description="Background banner at the top of the About page." />
      <HeroImageField field="about_image" title="About Page — Side Image" description="The image block next to the brand story text on the About page." />
      <HeroImageField field="hero_services" title="Services Page Hero" description="Background banner at the top of the Services page." />
      <HeroImageField field="hero_stories" title="Stories Page Hero" description="Background banner at the top of the Stories / Blog page." />
      <HeroImageField field="hero_care" title="Care Guide Page Hero" description="Background banner at the top of the Care &amp; Preservation page." />
    </div>
  );
}


// ── MAIN ADMIN ────────────────────────────────────────────
export default function Admin() {
  const { isAdmin, logout, currentUser } = useAuth();
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
    if (currentUser && currentUser.email !== process.env.REACT_APP_ADMIN_EMAIL) {
      navigate('/');
      return;
    }
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
      const data = {
        ...form,
        price: form.enquiry_only ? null : (Number(form.price) || null),
        stock: Number(form.stock) || 0,
      };
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

  async function updateStatus(id, status, order) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error('Failed.'); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Status: ${status}`);
  }

  async function updateDelivery(id, date, order) {
    const { error } = await supabase.from('orders').update({ estimated_delivery: date }).eq('id', id);
    if (error) { toast.error('Failed.'); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estimated_delivery: date } : o));
    toast.success('Delivery date set.');
  }

  const lbl = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.14em', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,169,110,0.2)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: 'none', transition: 'border-color 0.25s' };
  const stats = [['Products', products.length], ['Orders', orders.length], ['Pending', orders.filter(o => o.status === 'Pending').length], ['Enquiries', enquiries.length]];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--br)', color: 'var(--iv)' }}>
      {/* NAV */}
      <div style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(200,169,110,0.1)', padding: '15px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: 'var(--iv)' }}>Tamarind Taless</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.28em', color: 'var(--gd)' }}>ADMIN</div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.35)' }}>{currentUser?.email}</span>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.14em', color: 'rgba(245,237,216,0.4)', cursor: 'pointer', textTransform: 'uppercase' }} onMouseEnter={e => e.target.style.color = 'var(--gd)'} onMouseLeave={e => e.target.style.color = 'rgba(245,237,216,0.4)'}>View Site</button>
          <button onClick={() => { logout(); navigate('/admin/login'); }} style={{ background: 'none', border: '1px solid rgba(200,169,110,0.2)', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.14em', color: 'rgba(245,237,216,0.45)', padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase' }} onMouseEnter={e => { e.target.style.borderColor = 'var(--gd)'; e.target.style.color = 'var(--gd)'; }} onMouseLeave={e => { e.target.style.borderColor = 'rgba(200,169,110,0.2)'; e.target.style.color = 'rgba(245,237,216,0.45)'; }}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding: '28px 30px 60px' }}>
        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(200,169,110,0.1)', marginBottom: 28, overflowX: 'auto' }}>
          {TABS.map((t, i) => <button key={i} onClick={() => setTab(i)} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '12px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === i ? 'var(--gd)' : 'transparent'}`, color: tab === i ? 'var(--cr)' : 'rgba(245,237,216,0.38)', cursor: 'pointer', marginBottom: -1, whiteSpace: 'nowrap' }}>{t}</button>)}
        </div>

        {/* DASHBOARD */}
        {tab === 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>{stats.map(([l, v]) => <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,169,110,0.13)', padding: 24 }}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 52, color: 'var(--gd)', fontWeight: 300, lineHeight: 1 }}>{v}</div><div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.18em', color: 'rgba(245,237,216,0.55)', textTransform: 'uppercase', marginTop: 6 }}>{l}</div></div>)}</div>}

        {/* PRODUCTS LIST */}
        {tab === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>All Products ({products.length})</div>
              <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setTab(2); }} style={{ background: 'var(--gd)', border: 'none', color: 'var(--iv)', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 18px', cursor: 'pointer' }}>Add New Product</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(245,237,216,0.3)' }}>Loading...</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                  <thead><tr>{['Image', 'Name', 'Category', 'Price', 'Stock', 'Visible', 'Actions'].map(h => <th key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(200,169,110,0.12)', color: 'rgba(245,237,216,0.4)' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}><div style={{ width: 52, height: 52, background: p.bg, overflow: 'hidden' }}>{p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div></td>
                        <td style={{ padding: '10px 12px', color: 'var(--iv)', fontSize: 15, borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{p.name}</td>
                        <td style={{ padding: '10px 12px', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', color: 'var(--gd)', textTransform: 'uppercase', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{p.cat}</td>
                        <td style={{ padding: '10px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)', fontWeight: 500, borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{p.enquiry_only ? <span style={{ fontStyle: 'italic', fontSize: 13, color: 'rgba(245,237,216,0.5)' }}>Enquiry</span> : fmt(p.price)}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{p.stock === 0 ? <span style={{ background: '#555', color: '#fff', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>Sold</span> : p.stock === 1 ? <span style={{ background: 'var(--tr)', color: '#fff', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>Last 1</span> : <span style={{ color: 'rgba(245,237,216,0.6)', fontSize: 13 }}>{p.stock}</span>}</td>
                        <td style={{ padding: '10px 12px', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: p.available ? '#5AA85A' : '#C07070', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{p.available ? 'Live' : 'Hidden'}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => editProduct(p)} style={{ background: 'none', border: '1px solid rgba(200,169,110,0.25)', fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.12em', color: 'var(--gd)', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase' }} onMouseEnter={e => e.target.style.background = 'rgba(200,169,110,0.1)'} onMouseLeave={e => e.target.style.background = 'none'}>Edit</button>
                            <button onClick={() => deleteProduct(p.id, p.name)} style={{ background: 'none', border: '1px solid rgba(192,57,43,0.4)', fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.12em', color: '#C0392B', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase' }} onMouseEnter={e => e.target.style.background = 'rgba(192,57,43,0.15)'} onMouseLeave={e => e.target.style.background = 'none'}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.2)' }}>No products yet</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD/EDIT PRODUCT */}
        {tab === 2 && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', marginBottom: 24, textTransform: 'uppercase' }}>{editId ? 'Edit Product' : 'Add New Product'}</div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,169,110,0.13)', padding: '30px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Product Name *</label><input style={inp} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Naranbil Bhagavathy" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e => setF('subtitle', e.target.value)} placeholder="e.g. Guardian of Justice" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div><label style={lbl}>Category</label><select style={{ ...inp, cursor: 'pointer' }} value={form.cat} onChange={e => setF('cat', e.target.value)}>{CATS.map(c => <option key={c} value={c} style={{ background: '#2D1A0E' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Origin</label><input style={inp} value={form.origin} onChange={e => setF('origin', e.target.value)} placeholder="e.g. North Malabar, Kerala" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div><label style={lbl}>Material</label><input style={inp} value={form.material} onChange={e => setF('material', e.target.value)} placeholder="e.g. Bronze" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div><label style={lbl}>Dimensions</label><input style={inp} value={form.dimensions} onChange={e => setF('dimensions', e.target.value)} placeholder='10" H x 4" W' onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div><label style={lbl}>Weight</label><input style={inp} value={form.weight} onChange={e => setF('weight', e.target.value)} placeholder="e.g. 1.2 kg" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div><label style={lbl}>Stock (0 = Sold Out)</label><input style={inp} type="number" min="0" value={form.stock} onChange={e => setF('stock', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="eq" checked={form.enquiry_only} onChange={e => setF('enquiry_only', e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="eq" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Enquiry Only — hide price, show WhatsApp button</label>
                </div>
                {!form.enquiry_only && <div><label style={lbl}>Price (Rs.)</label><input style={inp} type="number" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="e.g. 45000" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>}
                <div><label style={lbl}>Badge</label><input style={inp} value={form.badge} onChange={e => setF('badge', e.target.value)} placeholder="Featured / Rare / Collector" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="av" checked={form.available} onChange={e => setF('available', e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="av" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Visible on website</label>
                </div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Story</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} rows={4} value={form.story} onChange={e => setF('story', e.target.value)} placeholder="The story behind this piece..." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Collection Note</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} rows={3} value={form.together} onChange={e => setF('together', e.target.value)} placeholder="Context..." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'} /></div>
                <div style={{ gridColumn: '1/-1' }}>
                  <ImageUploader images={form.images || []} onChange={imgs => setF('images', imgs)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button onClick={saveProduct} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: 'var(--iv)', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {saving ? <span style={{ width: 14, height: 14, border: '2px solid rgba(26,15,8,0.3)', borderTopColor: 'var(--br)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : null}
                  {editId ? 'Update Product' : 'Add Product'}
                </button>
                {editId && <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setTab(1); }} style={{ background: 'transparent', border: '1px solid rgba(245,237,216,0.25)', color: 'rgba(245,237,216,0.6)', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer' }}>Cancel</button>}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 3 && (
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--gd)', marginBottom: 20, textTransform: 'uppercase' }}>All Orders ({orders.length})</div>
            {loading ? <div style={{ textAlign: 'center', padding: 60 }}>Loading...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map(o => (
                  <div key={o.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,169,110,0.13)', padding: '22px 24px' }}>
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
                    {o.address && <div style={{ marginBottom: 14, fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(245,237,216,0.4)', lineHeight: 1.6 }}>{o.address.line1}{o.address.line2 ? ', ' + o.address.line2 : ''}, {o.address.city}, {o.address.state} — {o.address.pincode}</div>}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ ...lbl, marginBottom: 6 }}>Status</label>
                        <select value={o.status || 'Pending'} onChange={e => updateStatus(o.id, e.target.value, o)} style={{ background: 'rgba(45,26,14,0.95)', border: '1px solid rgba(200,169,110,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.1em', outline: 'none', cursor: 'pointer' }}>
                          {STATUSES.map(s => <option key={s} value={s} style={{ background: '#2D1A0E' }}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ ...lbl, marginBottom: 6 }}>Delivery Date</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="date" id={`dd-${o.id}`} defaultValue={o.estimated_delivery ? new Date(o.estimated_delivery).toISOString?.().split('T')[0] : ''} style={{ background: 'rgba(45,26,14,0.95)', border: '1px solid rgba(200,169,110,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
                          <button onClick={() => { const v = document.getElementById(`dd-${o.id}`)?.value; if (v) { const d = new Date(v); updateDelivery(o.id, d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), o); } }} style={{ background: 'var(--gd)', border: 'none', color: 'var(--iv)', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 14px', cursor: 'pointer' }}>Set &amp; Notify</button>
                        </div>
                        {o.estimated_delivery && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'var(--gd)', marginTop: 5, fontStyle: 'italic' }}>Set: {o.estimated_delivery}</div>}
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <div style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.2)' }}>No orders yet</div>}
              </div>
            )}
          </div>
        )}

        {/* ENQUIRIES */}
        {tab === 4 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead><tr>{['Product', 'Customer', 'Message', 'Date', 'Type', 'Status'].map(h => <th key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(200,169,110,0.12)', color: 'rgba(245,237,216,0.4)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {enquiries.map(e => (
                  <tr key={e.id}>
                    <td style={{ padding: '12px', color: 'rgba(245,237,216,0.7)', fontSize: 14, borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{e.product || '—'}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'rgba(245,237,216,0.6)', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{e.user_name}<br /><span style={{ opacity: 0.5, fontSize: 11 }}>{e.user_email}</span></td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'rgba(245,237,216,0.5)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{e.message || '—'}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'rgba(245,237,216,0.4)', borderBottom: '1px solid rgba(200,169,110,0.06)' }}>{e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}><span style={{ background: 'rgba(70,130,80,0.1)', color: '#5AA85A', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>{e.type || 'Email'}</span></td>
                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(200,169,110,0.06)' }}><span style={{ background: 'rgba(200,169,110,0.1)', color: 'var(--gd)', padding: '2px 8px', fontSize: 7, fontFamily: "'Cinzel',serif", textTransform: 'uppercase' }}>{e.status || 'Received'}</span></td>
                  </tr>
                ))}
                {enquiries.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(245,237,216,0.2)' }}>No enquiries yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* BRAND SETTINGS */}
        {tab === 5 && <StoriesManager />}
        {tab === 6 && <BrandSettings />}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
