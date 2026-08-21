import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { useNavigate } from 'react-router-dom';
import { fmt, categories, CATEGORY_GROUPS, COLLECTOR_LABEL } from '../data/products';
import ImageUploader from '../components/ImageUploader';
import { cldThumb } from '../utils/cloudinary';
import toast from 'react-hot-toast';

// estimated_delivery can hold either an admin-set exact date or an auto-generated
// range label like "20 Aug – 25 Aug" (no year, not parseable) — never assume it's
// a valid date string.
function toDateInputValue(str) {
  if (!str) return '';
  const d = new Date(str);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

const CATS = categories.filter(c => c !== 'All');
// Same shape as the static `categories` export, but built from whatever taxonomy is
// currently active (admin-customized via Brand Settings, or the built-in default).
function categoriesFor(groups) {
  return [...groups.flatMap(g => g.items), COLLECTOR_LABEL];
}
const STATUSES = ['Pending', 'Paid', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const TABS = ['Dashboard', 'Products', 'Add Product', 'Orders', 'Enquiries', 'Stories', 'Coupons', 'Gift Cards', 'Brand Settings'];
const EMPTY = { name: '', cat: CATS[0], subtitle: '', origin: '', material: '', dimensions: '', weight: '', price: '', story: '', together: '', badge: '', enquiry_only: false, stock: 1, available: true, featured: false, allow_enquiry: true, bg: 'linear-gradient(145deg,#F2EFE4,#D3CCB9)', images: [], image_position: '50% 50%', pinterest_url: '', variants: [], delivery_min_days: 5, delivery_max_days: 8 };

// ── SHARED CLOUDINARY UPLOAD (single file — logo / hero / video fields) ──
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const CAN_UPLOAD = CLOUD_NAME && UPLOAD_PRESET && CLOUD_NAME !== 'your_cloud_name';

async function uploadSingleToCloudinary(file, resourceType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'tamarind-tales/brand');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, { method: 'POST', body: formData });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
}

// Paste-URL input + optional direct-upload button, for any single logo/hero/video field
function MediaUrlField({ value, onChange, onSave, placeholder, resourceType = 'image', accept = 'image/*', inputStyle, saveLabel = 'Save' }) {
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSingleToCloudinary(file, resourceType);
      onSave(url);
      toast.success('Uploaded.');
    } catch (err) { toast.error('Upload failed: ' + err.message); }
    finally { setUploading(false); e.target.value = ''; }
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, flex: 1, minWidth: 180 }}
        onFocus={e => e.target.style.borderColor = 'var(--gd)'}
        onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'}
      />
      <button onClick={() => onSave(value)} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{saveLabel}</button>
      {CAN_UPLOAD && (
        <>
          <input ref={fileRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: uploading ? 'rgba(33,29,20,0.4)' : 'rgba(30,27,20,0.08)', border: '1px dashed rgba(33,29,20,0.35)', color: 'var(--iv)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 16px', cursor: uploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            {uploading ? 'Uploading…' : 'Upload File'}
          </button>
        </>
      )}
    </div>
  );
}

// 3x3 focal-point grid — maps a friendly label to a CSS object-position value
const IMAGE_POSITIONS = [
  ['Top Left', '0% 0%'],   ['Top', '50% 0%'],    ['Top Right', '100% 0%'],
  ['Left', '0% 50%'],      ['Center', '50% 50%'], ['Right', '100% 50%'],
  ['Bottom Left', '0% 100%'], ['Bottom', '50% 100%'], ['Bottom Right', '100% 100%'],
];

function PositionGrid({ pos, onChange, size = 32 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(3,${size}px)`, gridTemplateRows: `repeat(3,${size}px)`, gap: 4 }}>
      {IMAGE_POSITIONS.map(([label, val]) => (
        <button key={val} type="button" title={label} onClick={() => onChange(val)} style={{
          width: size, height: size, border: '1px solid rgba(33,29,20,0.25)', cursor: 'pointer',
          background: pos === val ? 'var(--gd)' : 'rgba(30,27,20,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}>
          <span style={{ width: size * 0.19, height: size * 0.19, borderRadius: '50%', background: pos === val ? '#F2EFE4' : 'rgba(106,99,80,0.5)' }} />
        </button>
      ))}
    </div>
  );
}

function ImagePositionPicker({ image, value, onChange, aspect = '1/1', width = 320 }) {
  const pos = value || '50% 50%';
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div>
      <label style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(106,99,80,0.55)', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
        Image Focal Point — which part of the photo should stay visible when cropped
      </label>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div onClick={() => image && setExpanded(true)} style={{ width: `min(${width}px, 100%)`, aspectRatio: aspect, position: 'relative', border: '1px solid rgba(33,29,20,0.2)', overflow: 'hidden', background: 'var(--card)', cursor: image ? 'zoom-in' : 'default' }}>
          {image ? (
            <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontStyle: 'italic', color: 'rgba(106,99,80,0.5)', textAlign: 'center', padding: 20 }}>Add an image to preview crop</div>
          )}
          {image && <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(30,27,20,0.6)', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 7px' }}>Click to enlarge</div>}
        </div>
        <PositionGrid pos={pos} onChange={onChange} />
      </div>

      {expanded && (
        <div onClick={() => setExpanded(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(12,9,7,.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: 28, display: 'flex', gap: 28, alignItems: 'flex-start', maxWidth: '92vw', maxHeight: '92vh', overflow: 'auto' }}>
            <div style={{ width: 'min(60vw, 720px)', aspectRatio: aspect, position: 'relative', overflow: 'hidden', border: '1px solid var(--line)', flexShrink: 0 }}>
              <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 16 }}>Set Focal Point</div>
              <PositionGrid pos={pos} onChange={onChange} size={54} />
              <button onClick={() => setExpanded(false)} style={{ marginTop: 20, background: 'var(--gd)', border: 'none', color: 'var(--text-dark)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '11px 22px', cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
      // Supabase resolves (doesn't throw) on a query/RLS error, so the error must
      // be checked explicitly -- otherwise a blocked write still shows "saved."
      const { error } = editId
        ? await supabase.from('stories').update(payload).eq('id', editId)
        : await supabase.from('stories').insert(payload);
      if (error) throw error;
      toast.success(editId ? 'Story updated.' : 'Story published.');
      await fetchStories();
      setView('list');
    } catch (e) { toast.error('Failed to save story.'); }
    finally { setSaving(false); }
  }

  async function deleteStory(id) {
    if (!window.confirm('Delete this story permanently?')) return;
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (error) { toast.error('Failed to delete story.'); return; }
    toast.success('Story deleted.');
    fetchStories();
  }

  async function togglePublish(s) {
    const { error } = await supabase.from('stories').update({ published: !s.published }).eq('id', s.id);
    if (error) { toast.error('Failed to update story.'); return; }
    fetchStories();
  }

  const lbl = { fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(106,99,80,0.55)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(30,27,20,0.06)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, outline: 'none', caretColor: 'var(--gd)' };

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>Stories ({stories.length})</div>
          <button onClick={startNew} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 18px', cursor: 'pointer' }}>Add New Story</button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner"></span></div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'rgba(106,99,80,0.5)', fontStyle: 'italic' }}>No stories yet. Click "Add New Story" to publish your first one.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stories.map(s => (
              <div key={s.id} className="admin-story-row" style={{ background: 'rgba(30,27,20,0.04)', border: '1px solid rgba(33,29,20,0.15)', padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'center' }}>
                {s.images?.[0] && <img src={cldThumb(s.images[0], 130)} alt="" loading="lazy" decoding="async" style={{ width: 64, height: 64, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(33,29,20,0.2)' }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gd)', background: 'rgba(33,29,20,.12)', padding: '2px 8px' }}>{s.category}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.published ? 'var(--success)' : 'rgba(106,99,80,0.4)' }}>{s.published ? 'Published' : 'Draft'}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'var(--iv)', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,0.5)', fontStyle: 'italic' }}>{s.author} · {new Date(s.created_at).toLocaleDateString()}</div>
                </div>
                <div className="admin-story-actions" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => togglePublish(s)} style={{ background: 'none', border: '1px solid rgba(33,29,20,0.3)', color: 'rgba(106,99,80,0.6)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>{s.published ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => startEdit(s)} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteStory(s.id)} style={{ background: 'none', border: '1px solid rgba(192,120,64,.4)', color: 'var(--error)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>Delete</button>
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
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>{editId ? 'Edit Story' : 'New Story'}</div>
        <button onClick={() => setView('list')} style={{ background: 'transparent', border: '1px solid rgba(106,99,80,0.25)', color: 'rgba(106,99,80,0.6)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer' }}>Back to List</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. The Last Bell-Maker of Palakkad" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>

        <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e => setF('subtitle', e.target.value)} placeholder="One-line summary shown under the title" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>

        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Category</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => setF('category', e.target.value)}>
              {STORY_CATS.map(c => <option key={c} value={c} style={{ background: '#F2EFE4' }}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Author</label><input style={inp} value={form.author} onChange={e => setF('author', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        </div>

        <div>
          <label style={lbl}>Story Text</label>
          <textarea style={{ ...inp, minHeight: 180, resize: 'vertical', lineHeight: 1.7 }} value={form.story} onChange={e => setF('story', e.target.value)} placeholder="Write the full story here..." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} />
        </div>

        <ImageUploader images={form.images} onChange={imgs => setF('images', imgs)} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={form.published} onChange={e => setF('published', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gd)' }} />
          <label style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)' }}>Published (visible on the public Stories page)</label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={saveStory} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : editId ? 'Update Story' : 'Publish Story'}
          </button>
          {editId && <button onClick={() => { setForm({ ...EMPTY_STORY }); setEditId(null); setView('list'); }} style={{ background: 'transparent', border: '1px solid rgba(106,99,80,0.25)', color: 'rgba(106,99,80,0.6)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}

// ── COUPONS ────────────────────────────────────────────────
const EMPTY_COUPON = { code: '', type: 'percent', value: '', applies_to: 'all', product_ids: [], active: true, max_uses: '' };
const APPLIES_TO_LABEL = { all: 'All products', products: 'Specific product(s)', bundle: 'Bundle — buy together' };

function CouponsManager() {
  const [coupons, setCoupons] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState('list');
  const [form, setForm] = React.useState({ ...EMPTY_COUPON });
  const [editId, setEditId] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { fetchCoupons(); fetchProducts(); }, []);

  async function fetchCoupons() {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  }
  async function fetchProducts() {
    const { data } = await supabase.from('products').select('id, name').order('name');
    if (data) setProducts(data);
  }

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function startNew() { setForm({ ...EMPTY_COUPON }); setEditId(null); setView('edit'); }
  function startEdit(c) { setForm({ ...EMPTY_COUPON, ...c, value: String(c.value), product_ids: c.product_ids || [], max_uses: c.max_uses ? String(c.max_uses) : '' }); setEditId(c.id); setView('edit'); }

  function toggleProduct(id) {
    setForm(f => ({ ...f, product_ids: f.product_ids.includes(id) ? f.product_ids.filter(x => x !== id) : [...f.product_ids, id] }));
  }

  function productNames(ids) {
    if (!ids?.length) return '—';
    return ids.map(id => products.find(p => p.id === id)?.name || '(deleted product)').join(', ');
  }

  async function saveCoupon() {
    const code = form.code.trim().toUpperCase();
    if (!code) { toast.error('Coupon code is required.'); return; }
    if (!form.value || Number(form.value) <= 0) { toast.error('Enter a discount value greater than 0.'); return; }
    if (form.type === 'percent' && Number(form.value) > 100) { toast.error('Percentage off can\'t be more than 100%.'); return; }
    if (form.applies_to !== 'all' && form.product_ids.length === 0) { toast.error('Select at least one product.'); return; }
    if (form.applies_to === 'bundle' && form.product_ids.length < 2) { toast.error('A bundle coupon needs at least 2 products selected.'); return; }
    if (form.max_uses !== '' && (!Number.isInteger(Number(form.max_uses)) || Number(form.max_uses) <= 0)) { toast.error('Max uses must be a whole number greater than 0, or left blank for unlimited.'); return; }
    setSaving(true);
    try {
      const payload = {
        code, type: form.type, value: Number(form.value),
        applies_to: form.applies_to, product_ids: form.applies_to === 'all' ? [] : form.product_ids,
        min_products: form.applies_to === 'bundle' ? form.product_ids.length : 1,
        active: form.active,
        max_uses: form.max_uses === '' ? null : Number(form.max_uses),
      };
      if (editId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Coupon updated.');
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
        toast.success('Coupon created.');
      }
      await fetchCoupons();
      setView('list');
    } catch (e) {
      toast.error(e.message?.includes('duplicate') ? 'That code already exists.' : 'Failed. Run the coupons SQL migration in Supabase if this keeps failing.');
    } finally { setSaving(false); }
  }

  async function deleteCoupon(id) {
    if (!window.confirm('Delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) { toast.error('Failed to delete coupon.'); return; }
    toast.success('Coupon deleted.');
    fetchCoupons();
  }

  async function toggleActive(c) {
    const { error } = await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
    if (error) { toast.error('Failed to update coupon.'); return; }
    fetchCoupons();
  }

  const lbl = { fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(106,99,80,0.55)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(30,27,20,0.06)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, outline: 'none', caretColor: 'var(--gd)' };
  const helpText = { fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, fontStyle: 'italic', color: 'rgba(106,99,80,.8)' };

  if (view === 'list') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>Coupons ({coupons.length})</div>
          <button onClick={startNew} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 18px', cursor: 'pointer' }}>Add New Coupon</button>
        </div>
        <div style={{ ...helpText, marginBottom: 20 }}>Since this site has no backend server, coupon codes are checked directly against this table when a customer applies one at checkout — a normal customer typing a code you gave them works completely fine, but a technically determined person could discover codes by inspecting network requests. Fine for typical promotions, just worth knowing.</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner"></span></div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'rgba(106,99,80,0.5)', fontStyle: 'italic' }}>No coupons yet. Click "Add New Coupon" to create your first one.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {coupons.map(c => (
              <div key={c.id} style={{ background: 'rgba(30,27,20,0.04)', border: '1px solid rgba(33,29,20,0.15)', padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.06em', color: 'var(--iv)' }}>{c.code}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.active ? 'var(--success)' : 'rgba(106,99,80,0.4)' }}>{c.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)' }}>
                    {c.type === 'percent' ? `${c.value}% off` : `Rs. ${Number(c.value).toLocaleString('en-IN')} off`} — {APPLIES_TO_LABEL[c.applies_to]}
                  </div>
                  {c.applies_to !== 'all' && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(106,99,80,0.6)', fontStyle: 'italic', marginTop: 2 }}>{productNames(c.product_ids)}</div>}
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13.5, color: 'rgba(106,99,80,0.55)', fontStyle: 'italic', marginTop: 2 }}>{c.max_uses ? `Used ${c.times_used || 0} of ${c.max_uses}` : 'Unlimited uses'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => toggleActive(c)} style={{ background: 'none', border: '1px solid rgba(33,29,20,0.3)', color: 'rgba(106,99,80,0.6)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>{c.active ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => startEdit(c)} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteCoupon(c.id)} style={{ background: 'none', border: '1px solid rgba(192,120,64,.4)', color: 'var(--error)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 12px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>{editId ? 'Edit Coupon' : 'New Coupon'}</div>
        <button onClick={() => setView('list')} style={{ background: 'transparent', border: '1px solid rgba(106,99,80,0.25)', color: 'rgba(106,99,80,0.6)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer' }}>Back to List</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={lbl}>Coupon Code *</label>
          <input style={{ ...inp, textTransform: 'uppercase' }} value={form.code} onChange={e => setF('code', e.target.value)} placeholder="e.g. FESTIVE20" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} />
        </div>

        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Discount Type</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.type} onChange={e => setF('type', e.target.value)}>
              <option value="percent" style={{ background: '#F2EFE4' }}>Percentage Off</option>
              <option value="flat" style={{ background: '#F2EFE4' }}>Flat Amount Off</option>
            </select>
          </div>
          <div>
            <label style={lbl}>{form.type === 'percent' ? 'Percentage (%)' : 'Amount (Rs.)'}</label>
            <input style={inp} type="number" min="0" value={form.value} onChange={e => setF('value', e.target.value)} onWheel={e => e.currentTarget.blur()} placeholder={form.type === 'percent' ? 'e.g. 20' : 'e.g. 500'} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} />
          </div>
        </div>

        <div>
          <label style={lbl}>Applies To</label>
          <select style={{ ...inp, cursor: 'pointer' }} value={form.applies_to} onChange={e => setF('applies_to', e.target.value)}>
            <option value="all" style={{ background: '#F2EFE4' }}>All products — works on any order</option>
            <option value="products" style={{ background: '#F2EFE4' }}>Specific product(s) — order must contain at least one</option>
            <option value="bundle" style={{ background: '#F2EFE4' }}>Bundle — order must contain ALL selected products</option>
          </select>
        </div>

        {form.applies_to !== 'all' && (
          <div>
            <label style={lbl}>Select Product(s)</label>
            <div style={{ ...helpText, marginBottom: 10 }}>
              {form.applies_to === 'bundle'
                ? 'The coupon only applies when every product checked below is in the cart together.'
                : 'The coupon applies when any one of the products checked below is in the cart.'}
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid rgba(33,29,20,0.15)', padding: '4px 4px' }}>
              {products.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>
                  <input type="checkbox" checked={form.product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} style={{ accentColor: 'var(--gd)', width: 15, height: 15, cursor: 'pointer' }} />
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)' }}>{p.name}</span>
                </label>
              ))}
              {products.length === 0 && <div style={{ ...helpText, padding: 10 }}>No products yet.</div>}
            </div>
          </div>
        )}

        <div>
          <label style={lbl}>Max Uses (optional)</label>
          <input style={{ ...inp, maxWidth: 200 }} type="number" min="1" value={form.max_uses} onChange={e => setF('max_uses', e.target.value)} onWheel={e => e.currentTarget.blur()} placeholder="Unlimited" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} />
          <div style={{ ...helpText, marginTop: 6 }}>Leave blank for unlimited uses. {editId && form.max_uses ? `Used ${form.times_used || 0} of ${form.max_uses} so far.` : ''}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={form.active} onChange={e => setF('active', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gd)', cursor: 'pointer' }} />
          <label style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)' }}>Active (customers can use this code)</label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={saveCoupon} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : editId ? 'Update Coupon' : 'Create Coupon'}
          </button>
          {editId && <button onClick={() => { setForm({ ...EMPTY_COUPON }); setEditId(null); setView('list'); }} style={{ background: 'transparent', border: '1px solid rgba(106,99,80,0.25)', color: 'rgba(106,99,80,0.6)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}

// ── GIFT CARDS ─────────────────────────────────────────────
function GiftCardsManager() {
  const { brand, updateBrand } = useBrand();
  const [issued, setIssued] = React.useState([]);
  const [loadingIssued, setLoadingIssued] = React.useState(true);
  const [form, setForm] = React.useState({
    giftcard_min: brand.giftcard_min ?? 500,
    giftcard_max: brand.giftcard_max ?? 50000,
    giftcard_description: brand.giftcard_description || '',
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    supabase.from('gift_cards').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setIssued(data || []);
      setLoadingIssued(false);
    });
  }, []);

  async function toggleEnabled() {
    try {
      await updateBrand({ giftcard_enabled: brand.giftcard_enabled === false });
      toast.success(brand.giftcard_enabled === false ? 'Gift cards enabled.' : 'Gift cards disabled.');
    } catch (e) { toast.error('Failed: ' + e.message); }
  }

  async function saveSettings() {
    const min = Number(form.giftcard_min);
    const max = Number(form.giftcard_max);
    if (!Number.isFinite(min) || min <= 0) { toast.error('Minimum amount must be a positive number.'); return; }
    if (!Number.isFinite(max) || max <= min) { toast.error('Maximum amount must be greater than the minimum.'); return; }
    setSaving(true);
    try {
      await updateBrand({
        giftcard_min: min,
        giftcard_max: max,
        giftcard_description: form.giftcard_description,
      });
      toast.success('Gift card settings saved.');
    } catch (e) { toast.error('Failed: ' + e.message); }
    finally { setSaving(false); }
  }

  const lbl = { fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(106,99,80,0.55)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(30,27,20,0.06)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, outline: 'none', caretColor: 'var(--gd)' };
  const helpText = { fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, fontStyle: 'italic', color: 'rgba(106,99,80,.8)' };
  const section = { background: 'rgba(30,27,20,0.04)', border: '1px solid rgba(33,29,20,0.15)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 };
  const secHead = { fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(33,29,20,.7)', marginBottom: 4 };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', marginBottom: 24, textTransform: 'uppercase' }}>Gift Cards</div>

      <div style={section}>
        <div style={secHead}>Settings</div>
        <div style={helpText}>Customers pick their own amount at /gift-card and buy it like a product. Each purchase creates a real, spendable balance under a unique code — customers (or you, on their behalf) can apply it at checkout, and the balance is deducted automatically. The image shown on the Gift Card page hero is set in Brand Settings → Per-Page Hero Images, alongside your other page banners.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="gce" checked={brand.giftcard_enabled !== false} onChange={toggleEnabled} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
          <label htmlFor="gce" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Gift cards page enabled</label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={lbl}>Minimum Amount (Rs.)</label><input style={inp} type="number" value={form.giftcard_min} onChange={e => setForm(f => ({ ...f, giftcard_min: e.target.value }))} onWheel={e => e.currentTarget.blur()} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
          <div><label style={lbl}>Maximum Amount (Rs.)</label><input style={inp} type="number" value={form.giftcard_max} onChange={e => setForm(f => ({ ...f, giftcard_max: e.target.value }))} onWheel={e => e.currentTarget.blur()} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        </div>
        <div><label style={lbl}>Page Description</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={2} value={form.giftcard_description} onChange={e => setForm(f => ({ ...f, giftcard_description: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <button onClick={saveSettings} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: 'var(--text-dark)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div style={secHead}>Issued Gift Cards ({issued.length})</div>
      {loadingIssued ? (
        <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner"></span></div>
      ) : issued.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'rgba(106,99,80,0.5)', fontStyle: 'italic' }}>No gift cards purchased yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead><tr>{['Code', 'Balance', 'Initial Value', 'Recipient', 'Purchased'].map(h => <th key={h} style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(33,29,20,0.12)', color: 'rgba(106,99,80,0.5)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {issued.map(g => (
                <tr key={g.id}>
                  <td style={{ padding: '10px 12px', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--iv)', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{g.code}</td>
                  <td style={{ padding: '10px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: Number(g.balance) > 0 ? 'var(--success)' : 'rgba(106,99,80,0.4)', fontWeight: 500, borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{fmt(g.balance)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,0.7)', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{fmt(g.initial_value)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, color: 'rgba(106,99,80,0.7)', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{g.recipient_name ? `${g.recipient_name} (${g.recipient_email})` : '—'}</td>
                  <td style={{ padding: '10px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, color: 'rgba(106,99,80,0.5)', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{g.created_at ? new Date(g.created_at).toLocaleDateString('en-IN') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── BRAND SETTINGS ────────────────────────────────────────
function BrandSettings() {
  const { brand, updateBrand } = useBrand();
  const [form, setForm] = React.useState({
    brand_name: brand.brand_name || '', tagline: brand.tagline || '', registered_office: brand.registered_office || '',
    gallery_video_caption: brand.gallery_video_caption || '',
    home_featured_label: brand.home_featured_label || '', home_featured_title: brand.home_featured_title || '',
    home_quote_text: brand.home_quote_text || '', home_ink_eyebrow: brand.home_ink_eyebrow || '',
    home_ink_title: brand.home_ink_title || '', home_ink_body: brand.home_ink_body || '', home_ig_followers: brand.home_ig_followers || '',
    delivery_metro_cities: brand.delivery_metro_cities || '', delivery_extra_days: brand.delivery_extra_days ?? 3,
  });
  const [savingHome, setSavingHome] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savingDelivery, setSavingDelivery] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState('');

  // Per-page hero image URL inputs
  const [heroUrls, setHeroUrls] = React.useState({
    hero_image: '', hero_shop: '', hero_about: '', hero_services: '', hero_stories: '', hero_care: '', hero_gallery: '', hero_giftcard: '', about_image: '', splash_logo: '', gallery_video: '',
  });

  // Category taxonomy (masters/groups shown in the navbar mega-menu + Shop filter)
  const [taxonomy, setTaxonomy] = React.useState(() => (brand.category_taxonomy?.length ? brand.category_taxonomy : CATEGORY_GROUPS));
  const [newGroupName, setNewGroupName] = React.useState('');
  const [newItemInputs, setNewItemInputs] = React.useState({});
  const [savingTaxonomy, setSavingTaxonomy] = React.useState(false);

  const lbl = { fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(106,99,80,0.55)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(30,27,20,0.06)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, outline: 'none', caretColor: 'var(--gd)' };
  const section = { background: 'rgba(30,27,20,0.04)', border: '1px solid rgba(33,29,20,0.15)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 16 };
  const secHead = { fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(33,29,20,.7)', marginBottom: 4 };
  const helpText = { fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, fontStyle: 'italic', color: 'rgba(106,99,80,.8)' };

  async function saveLogoUrl(url) {
    const v = (url ?? logoUrl).trim();
    if (!v) return;
    try { await updateBrand({ logo_url: v }); toast.success('Logo saved.'); setLogoUrl(''); }
    catch (e) { toast.error('Failed: ' + e.message); }
  }

  async function saveHeroField(field, url) {
    const val = (url ?? heroUrls[field])?.trim();
    if (!val) return;
    try {
      await updateBrand({ [field]: val });
      toast.success('Image saved.');
      setHeroUrls(h => ({ ...h, [field]: '' }));
    } catch { toast.error('Failed to save. Run the hero_image SQL migration in Supabase if this keeps failing.'); }
  }

  async function removeHeroField(field) {
    try { await updateBrand({ [field]: '' }); toast.success('Image removed.'); }
    catch (e) { toast.error('Failed: ' + e.message); }
  }

  async function saveGalleryCaption() {
    try { await updateBrand({ gallery_video_caption: form.gallery_video_caption }); toast.success('Caption saved.'); }
    catch (e) { toast.error('Failed: ' + e.message); }
  }

  async function savePositionField(field, val) {
    try { await updateBrand({ [`${field}_position`]: val }); toast.success('Crop position saved.'); }
    catch { toast.error('Failed to save. Run the image position SQL migration in Supabase if this keeps failing.'); }
  }

  async function saveBrand() {
    setSaving(true);
    try { await updateBrand({ brand_name: form.brand_name, tagline: form.tagline, registered_office: form.registered_office }); toast.success('Brand settings saved.'); }
    catch (e) { toast.error('Failed: ' + e.message); }
    finally { setSaving(false); }
  }

  async function saveFeaturedCount(n) {
    try { await updateBrand({ featured_count: n }); toast.success('Home page showcase updated.'); }
    catch (e) { toast.error('Failed: ' + e.message); }
  }

  async function saveHomeText() {
    setSavingHome(true);
    try {
      await updateBrand({
        home_featured_label: form.home_featured_label, home_featured_title: form.home_featured_title,
        home_quote_text: form.home_quote_text, home_ink_eyebrow: form.home_ink_eyebrow,
        home_ink_title: form.home_ink_title, home_ink_body: form.home_ink_body, home_ig_followers: form.home_ig_followers,
      });
      toast.success('Home page text saved.');
    } catch { toast.error('Failed. Run the home text SQL migration in Supabase if this keeps failing.'); }
    finally { setSavingHome(false); }
  }

  async function saveDeliverySettings() {
    setSavingDelivery(true);
    try {
      await updateBrand({
        delivery_metro_cities: form.delivery_metro_cities,
        delivery_extra_days: Number(form.delivery_extra_days) || 0,
      });
      toast.success('Delivery settings saved.');
    } catch { toast.error('Failed. Run the delivery SQL migration in Supabase if this keeps failing.'); }
    finally { setSavingDelivery(false); }
  }

  function addGroup() {
    const name = newGroupName.trim();
    if (!name) return;
    if (taxonomy.some(g => g.label.toLowerCase() === name.toLowerCase())) { toast.error('A master with that name already exists.'); return; }
    setTaxonomy(t => [...t, { label: name, items: [] }]);
    setNewGroupName('');
  }
  function removeGroup(label) {
    setTaxonomy(t => t.filter(g => g.label !== label));
  }
  function addItem(groupLabel) {
    const val = (newItemInputs[groupLabel] || '').trim();
    if (!val) return;
    setTaxonomy(t => t.map(g => g.label === groupLabel ? { ...g, items: g.items.includes(val) ? g.items : [...g.items, val] } : g));
    setNewItemInputs(s => ({ ...s, [groupLabel]: '' }));
  }
  function removeItem(groupLabel, item) {
    setTaxonomy(t => t.map(g => g.label === groupLabel ? { ...g, items: g.items.filter(i => i !== item) } : g));
  }
  async function saveTaxonomy() {
    setSavingTaxonomy(true);
    try { await updateBrand({ category_taxonomy: taxonomy }); toast.success('Category structure saved.'); }
    catch { toast.error('Failed. Run the category_taxonomy SQL migration in Supabase if this keeps failing.'); }
    finally { setSavingTaxonomy(false); }
  }
  function resetTaxonomy() {
    setTaxonomy(CATEGORY_GROUPS);
  }

  // Reusable hero image upload block
  function HeroImageField({ field, title, description, aspect = '16/5', mobileAspect }) {
    return (
      <div style={section}>
        <div style={secHead}>{title}</div>
        <div style={helpText}>{description}</div>
        {brand[field] && (
          <ImagePositionPicker image={brand[field]} value={brand[`${field}_position`]} onChange={v => savePositionField(field, v)} aspect={aspect} width={aspect === '3/4' ? 260 : 460} />
        )}
        {brand[field] && mobileAspect && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11.5, letterSpacing: '0.12em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 4 }}>Mobile Crop</div>
            <div style={helpText}>How this photo crops on phones — kept separate from the desktop crop above so the subject isn't cut off on a narrow screen.</div>
            <ImagePositionPicker image={brand[field]} value={brand[`${field}_mobile_position`]} onChange={v => savePositionField(`${field}_mobile`, v)} aspect={mobileAspect} width={260} />
          </div>
        )}
        <MediaUrlField
          value={heroUrls[field]}
          onChange={v => setHeroUrls(h => ({ ...h, [field]: v }))}
          onSave={url => saveHeroField(field, url)}
          placeholder="Paste Cloudinary image URL..."
          inputStyle={inp}
        />
        {brand[field] && <button onClick={() => removeHeroField(field)} style={{ marginTop: 8, background: 'none', border: '1px solid rgba(192,120,64,.4)', color: 'var(--error)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer', alignSelf: 'flex-start' }}>Remove Image</button>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', marginBottom: 20, textTransform: 'uppercase' }}>Brand Settings</div>

      {/* LOGO */}
      <div style={section}>
        <div style={secHead}>Logo Image</div>
        {brand.logo_url && <img src={brand.logo_url} alt="Logo" style={{ height: 48, objectFit: 'contain', maxWidth: 200, marginBottom: 4, display: 'block', border: '1px solid rgba(33,29,20,.15)', padding: 6 }} />}
        <MediaUrlField value={logoUrl} onChange={setLogoUrl} onSave={saveLogoUrl} placeholder="Paste Cloudinary logo URL..." inputStyle={inp} saveLabel="Save Logo" />
        {brand.logo_url && <button onClick={() => updateBrand({ logo_url: '' })} style={{ background: 'none', border: '1px solid rgba(192,120,64,.4)', color: 'var(--error)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer', alignSelf: 'flex-start' }}>Remove Logo</button>}
      </div>

      {/* SPLASH / LOADING LOGO */}
      <div style={section}>
        <div style={secHead}>Loading Screen Logo</div>
        <div style={helpText}>Shown full-screen while the website loads. If empty, the main logo is used.</div>
        {brand.splash_logo && <img src={brand.splash_logo} alt="Splash logo" style={{ height: 64, objectFit: 'contain', maxWidth: 200, marginBottom: 4, display: 'block', border: '1px solid rgba(33,29,20,.15)', padding: 6 }} />}
        <MediaUrlField
          value={heroUrls.splash_logo || ''}
          onChange={v => setHeroUrls(h => ({ ...h, splash_logo: v }))}
          onSave={url => saveHeroField('splash_logo', url)}
          placeholder="Paste Cloudinary logo URL..."
          inputStyle={inp}
        />
        {brand.splash_logo && <button onClick={() => removeHeroField('splash_logo')} style={{ marginTop: 8, background: 'none', border: '1px solid rgba(192,120,64,.4)', color: 'var(--error)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer', alignSelf: 'flex-start' }}>Remove</button>}
      </div>

      {/* GALLERY VIDEO */}
      <div style={section}>
        <div style={secHead}>Gallery Page Video</div>
        <div style={helpText}>Shown on the Gallery page instead of the old collection grid. Upload a video file or paste a Cloudinary video URL.</div>
        {brand.gallery_video && <video src={brand.gallery_video} controls style={{ width: '100%', maxWidth: 360, display: 'block', marginBottom: 4, background: '#000', border: '1px solid rgba(33,29,20,.15)' }} />}
        <MediaUrlField
          value={heroUrls.gallery_video || ''}
          onChange={v => setHeroUrls(h => ({ ...h, gallery_video: v }))}
          onSave={url => saveHeroField('gallery_video', url)}
          placeholder="Paste Cloudinary video URL..."
          resourceType="video"
          accept="video/*"
          inputStyle={inp}
        />
        {brand.gallery_video && <button onClick={() => removeHeroField('gallery_video')} style={{ marginTop: 8, background: 'none', border: '1px solid rgba(192,120,64,.4)', color: 'var(--error)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer', alignSelf: 'flex-start' }}>Remove</button>}

        <div style={{ marginTop: 16 }}>
          <label style={lbl}>Video Caption (shown via the CC button on the Gallery page)</label>
          <textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={2} value={form.gallery_video_caption} onChange={e => setForm(f => ({ ...f, gallery_video_caption: e.target.value }))} placeholder="e.g. A look inside our restoration studio, Coimbatore." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} />
          <button onClick={saveGalleryCaption} style={{ marginTop: 8, background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '7px 16px', cursor: 'pointer', alignSelf: 'flex-start' }}>Save Caption</button>
        </div>
      </div>

      {/* BRAND TEXT */}
      <div style={section}>
        <div style={secHead}>Brand Text</div>
        <div><label style={lbl}>Brand Name</label><input style={inp} value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <div><label style={lbl}>Tagline</label><input style={inp} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <div><label style={lbl}>Registered Office (shown in the footer)</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={2} value={form.registered_office} onChange={e => setForm(f => ({ ...f, registered_office: e.target.value }))} placeholder="e.g. 12/3 Example Street, Noida, Uttar Pradesh 201301" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <button onClick={saveBrand} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Brand Text'}
        </button>
      </div>

      {/* HOME PAGE PRODUCT SHOWCASE */}
      <div style={section}>
        <div style={secHead}>Home Page Product Showcase</div>
        <div style={helpText}>Choose how many products appear in the "Featured Acquisitions" section on the homepage.</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={brand.featured_count || 3} onChange={e => saveFeaturedCount(Number(e.target.value))} style={{ ...inp, width: 120, cursor: 'pointer' }}>
            {[2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: '#F2EFE4' }}>{n} products</option>)}
          </select>
          <span style={helpText}>currently showing {brand.featured_count || 3}</span>
        </div>
      </div>

      {/* HOME PAGE TEXT */}
      <div style={section}>
        <div style={secHead}>Home Page Text</div>
        <div style={helpText}>Edit the wording on the homepage — the "Featured Acquisitions" label, the centered quote, the dark "Why We Curate" band, and your Instagram follower count.</div>
        <div><label style={lbl}>Featured Products — Small Label</label><input style={inp} value={form.home_featured_label} onChange={e => setForm(f => ({ ...f, home_featured_label: e.target.value }))} placeholder="Featured Acquisitions" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <div><label style={lbl}>Featured Products — Heading</label><input style={inp} value={form.home_featured_title} onChange={e => setForm(f => ({ ...f, home_featured_title: e.target.value }))} placeholder="Pieces of Distinction" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <div><label style={lbl}>Quote Section</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={3} value={form.home_quote_text} onChange={e => setForm(f => ({ ...f, home_quote_text: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <div><label style={lbl}>Dark Band — Small Label</label><input style={inp} value={form.home_ink_eyebrow} onChange={e => setForm(f => ({ ...f, home_ink_eyebrow: e.target.value }))} placeholder="Why We Curate" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <div><label style={lbl}>Dark Band — Heading</label><input style={inp} value={form.home_ink_title} onChange={e => setForm(f => ({ ...f, home_ink_title: e.target.value }))} placeholder="Because beautiful traditions deserve to live on." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <div><label style={lbl}>Dark Band — Paragraph</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={4} value={form.home_ink_body} onChange={e => setForm(f => ({ ...f, home_ink_body: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <div><label style={lbl}>Instagram Followers (shown in the "Follow Our Curation" section)</label><input style={inp} value={form.home_ig_followers} onChange={e => setForm(f => ({ ...f, home_ig_followers: e.target.value }))} placeholder="30,000" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} /></div>
        <button onClick={saveHomeText} disabled={savingHome} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', alignSelf: 'flex-start', opacity: savingHome ? 0.6 : 1 }}>
          {savingHome ? 'Saving...' : 'Save Home Page Text'}
        </button>
      </div>

      {/* DELIVERY ESTIMATES */}
      <div style={section}>
        <div style={secHead}>Delivery Estimates</div>
        <div style={helpText}>Each product has its own base delivery window (set on the product's Add/Edit page). Cities listed below get that estimate as-is; anywhere else automatically gets the extra days added on top. This is an estimate you control, not a live courier tracking figure.</div>
        <div>
          <label style={lbl}>Fast-Delivery Cities (comma-separated)</label>
          <textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={3} value={form.delivery_metro_cities} onChange={e => setForm(f => ({ ...f, delivery_metro_cities: e.target.value }))} placeholder="Noida, Delhi, Coimbatore, Chennai, Mumbai, Bangalore..." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} />
        </div>
        <div style={{ maxWidth: 260 }}>
          <label style={lbl}>Extra Days for Other Cities</label>
          <input style={inp} type="number" min="0" value={form.delivery_extra_days} onChange={e => setForm(f => ({ ...f, delivery_extra_days: e.target.value }))} onWheel={e => e.currentTarget.blur()} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'} />
        </div>
        <button onClick={saveDeliverySettings} disabled={savingDelivery} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', alignSelf: 'flex-start', opacity: savingDelivery ? 0.6 : 1 }}>
          {savingDelivery ? 'Saving...' : 'Save Delivery Settings'}
        </button>
      </div>

      {/* CATEGORY / MASTER MANAGEMENT */}
      <div style={section}>
        <div style={secHead}>Product Categories (Masters)</div>
        <div style={helpText}>Manage the masters (groups) and categories shown in the navbar's "By Collection" menu and the Shop filter bar. Add or remove masters, and add or remove categories inside each one.</div>

        {taxonomy.map(group => (
          <div key={group.label} style={{ border: '1px solid rgba(33,29,20,.15)', padding: '14px 16px', background: 'rgba(255,255,255,.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '.08em', color: 'var(--iv)', textTransform: 'uppercase' }}>{group.label}</span>
              <button onClick={() => removeGroup(group.label)} style={{ background: 'none', border: '1px solid rgba(192,120,64,.4)', color: 'var(--error)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', cursor: 'pointer' }}>Remove Master</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {group.items.map(item => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(33,29,20,.06)', border: '1px solid rgba(33,29,20,.15)', padding: '5px 10px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)' }}>
                  {item}
                  <button onClick={() => removeItem(group.label, item)} aria-label={`Remove ${item}`} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 700, fontSize: 15, lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
              {!group.items.length && <span style={{ ...helpText, fontSize: 13 }}>No categories yet.</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...inp, flex: 1 }}
                placeholder="New category name..."
                value={newItemInputs[group.label] || ''}
                onChange={e => setNewItemInputs(s => ({ ...s, [group.label]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(group.label); } }}
                onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'}
              />
              <button onClick={() => addItem(group.label)} style={{ background: 'var(--iv)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        ))}
        {!taxonomy.length && <div style={helpText}>No masters yet — add one below.</div>}

        <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px dashed rgba(33,29,20,.25)' }}>
          <input
            style={{ ...inp, flex: 1 }}
            placeholder="New master name (e.g. Textiles)..."
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGroup(); } }}
            onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.25)'}
          />
          <button onClick={addGroup} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Add Master</button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={saveTaxonomy} disabled={savingTaxonomy} style={{ background: 'var(--gd)', border: 'none', color: '#F2EFE4', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', opacity: savingTaxonomy ? 0.6 : 1 }}>
            {savingTaxonomy ? 'Saving...' : 'Save Category Structure'}
          </button>
          <button onClick={resetTaxonomy} style={{ background: 'none', border: '1px solid rgba(33,29,20,.3)', color: 'var(--iv)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '13px 20px', cursor: 'pointer' }}>Reset to Default</button>
        </div>
      </div>

      <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', margin: '32px 0 16px', textTransform: 'uppercase' }}>Per-Page Hero Images</div>

      <HeroImageField field="hero_image" title="Home Page Hero" description="Full-screen background behind the main homepage headline." mobileAspect="4/5" />
      <HeroImageField field="hero_shop" title="Shop Page Hero" description="Background banner at the top of the Shop / Collection page." mobileAspect="1/1" />
      <HeroImageField field="hero_gallery" title="Gallery Page Hero" description="Background banner at the top of the Gallery page." mobileAspect="1/1" />
      <HeroImageField field="hero_giftcard" title="Gift Card Page Hero" description="Background banner at the top of the Gift Cards page." mobileAspect="1/1" />
      <HeroImageField field="hero_about" title="About Page Hero" description="Background banner at the top of the About page." mobileAspect="1/1" />
      <HeroImageField field="about_image" title="About Page Side Image" description="The image block next to the brand story text on the About page." aspect="3/4" />
      <HeroImageField field="hero_services" title="Services Page Hero" description="Background banner at the top of the Services page." mobileAspect="1/1" />
      <HeroImageField field="hero_stories" title="Stories Page Hero" description="Background banner at the top of the Stories page." mobileAspect="1/1" />
      <HeroImageField field="hero_care" title="Care Guide Page Hero" description="Background banner at the top of the Care &amp; Preservation page." mobileAspect="1/1" />
    </div>
  );
}


// ── DASHBOARD: ICONS, STAT TILES, CHARTS ──
const DASH_ICON_PATHS = {
  box: <><path d="M3 7.5l9-4 9 4-9 4-9-4z" /><path d="M3 7.5v9l9 4 9-4v-9" /><path d="M12 11.5v9" /></>,
  orders: <><rect x="3.5" y="7.5" width="17" height="13" rx="2" /><path d="M8 7.5V6a4 4 0 0 1 8 0v1.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 3.2" /></>,
  chat: <><path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-3.9-.96L3 21l1.96-5.7a8.3 8.3 0 0 1-.96-3.9A8.4 8.4 0 0 1 12.5 3a8.4 8.4 0 0 1 8.4 8.4z" /></>,
};
function DashIcon({ type, color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {DASH_ICON_PATHS[type]}
    </svg>
  );
}
function StatTile({ type, color, value, label }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(33,29,20,0.1)', borderRadius: 10, padding: '22px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 1px 3px rgba(33,29,20,0.05)' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: color + '1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DashIcon type={type} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 42, color: 'var(--iv)', fontWeight: 500, lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 9 }}>{label}</div>
      </div>
    </div>
  );
}

// Single-series area/line — order volume per day, last 14 days, with a hover crosshair + tooltip
function OrdersTrendChart({ orders, color }) {
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const days = React.useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      arr.push({ date: d, count: 0 });
    }
    orders.forEach(o => {
      if (!o.created_at) return;
      const od = new Date(o.created_at);
      od.setHours(0, 0, 0, 0);
      const match = arr.find(a => a.date.getTime() === od.getTime());
      if (match) match.count++;
    });
    return arr;
  }, [orders]);

  const max = Math.max(1, ...days.map(d => d.count));
  const W = 560, H = 160, padL = 6, padR = 6, padT = 14, padB = 4;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const stepX = plotW / (days.length - 1);
  const points = days.map((d, i) => ({ x: padL + i * stepX, y: padT + plotH - (d.count / max) * plotH, ...d }));
  const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
  const areaPath = linePath + ` L${points[points.length - 1].x.toFixed(1)},${(padT + plotH).toFixed(1)} L${points[0].x.toFixed(1)},${(padT + plotH).toFixed(1)} Z`;
  const hp = hoverIdx != null ? points[hoverIdx] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }} onMouseLeave={() => setHoverIdx(null)}>
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="rgba(33,29,20,0.12)" strokeWidth="1" />
        <path d={areaPath} fill={color} opacity="0.12" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hp && <line x1={hp.x} y1={padT} x2={hp.x} y2={padT + plotH} stroke="rgba(33,29,20,0.22)" strokeWidth="1" />}
        {points.map((p, i) => (
          <g key={i}>
            <rect x={p.x - stepX / 2} y={0} width={stepX} height={H} fill="transparent" onMouseEnter={() => setHoverIdx(i)} style={{ cursor: 'pointer' }} />
            {i === hoverIdx && <circle cx={p.x} cy={p.y} r="4.5" fill={color} stroke="#fff" strokeWidth="2" />}
          </g>
        ))}
      </svg>
      {hp && (
        <div style={{ position: 'absolute', left: `${(hp.x / W) * 100}%`, top: 0, transform: 'translate(-50%,-100%)', marginTop: -8, background: 'var(--iv)', color: '#F2EFE4', padding: '7px 11px', borderRadius: 4, fontSize: 12.5, fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 2 }}>
          <div style={{ fontWeight: 700 }}>{hp.count} order{hp.count !== 1 ? 's' : ''}</div>
          <div style={{ opacity: 0.7, fontSize: 11, marginTop: 1 }}>{hp.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: "'Inter',sans-serif", fontSize: 10.5, color: 'var(--text-muted)' }}>
        <span>{points[0].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        <span>{points[points.length - 1].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
}

// Sequential single-hue horizontal bars — magnitude comparison across order statuses
function StatusBreakdownChart({ orders, color }) {
  const counts = React.useMemo(
    () => STATUSES.map(s => ({ status: s, count: orders.filter(o => (o.status || 'Pending') === s).length })),
    [orders]
  );
  const max = Math.max(1, ...counts.map(c => c.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {counts.map(c => (
        <div key={c.status} style={{ display: 'flex', alignItems: 'center', gap: 10 }} title={`${c.status}: ${c.count}`}>
          <div style={{ width: 112, flexShrink: 0, fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11.5, letterSpacing: '0.03em', color: 'var(--text-muted)' }}>{c.status}</div>
          <div style={{ flex: 1, height: 15, background: 'rgba(33,29,20,0.06)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: `${(c.count / max) * 100}%`, minWidth: c.count > 0 ? 6 : 0, height: '100%', background: color, borderRadius: 8, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ width: 24, textAlign: 'right', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--iv)' }}>{c.count}</div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ADMIN ────────────────────────────────────────────
export default function Admin() {
  const { isAdmin, logout, currentUser } = useAuth();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const liveCats = categoriesFor(brand.category_taxonomy?.length ? brand.category_taxonomy : CATEGORY_GROUPS);
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');

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

  function addVariant() {
    setForm(f => ({ ...f, variants: [...(f.variants || []), { size: '', price: '', weight: '', dimensions: '', stock: '' }] }));
  }
  function updateVariant(i, key, val) {
    setForm(f => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, [key]: val } : v) }));
  }
  function removeVariant(i) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  }

  async function saveProduct() {
    if (!form.name.trim()) { toast.error('Product name is required.'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: form.enquiry_only ? null : (form.price !== '' && !isNaN(Number(form.price)) ? Number(form.price) : null),
        stock: Number(form.stock) || 0,
        delivery_min_days: Number(form.delivery_min_days) || 5,
        delivery_max_days: Number(form.delivery_max_days) || 8,
        variants: (form.variants || [])
          .filter(v => (v.size || '').trim())
          .map(v => ({ size: v.size.trim(), price: Number(v.price) || 0, weight: v.weight || '', dimensions: v.dimensions || '', stock: Number(v.stock) || 0 })),
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
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('Deleted.'); await fetchAll();
  }

  function editProduct(p) {
    setForm({ ...EMPTY, ...p, images: p.images || [], image_position: p.image_position || '50% 50%', pinterest_url: p.pinterest_url || '', variants: p.variants || [], allow_enquiry: p.allow_enquiry !== false, delivery_min_days: p.delivery_min_days ?? 5, delivery_max_days: p.delivery_max_days ?? 8 });
    setEditId(p.id); setTab(2);
  }

  async function toggleFeatured(p) {
    const { error } = await supabase.from('products').update({ featured: !p.featured }).eq('id', p.id);
    if (error) { toast.error('Failed to update. Run the featured SQL migration in Supabase if this keeps failing.'); return; }
    toast.success(p.featured ? 'Removed from Homepage showcase.' : 'Pinned to Homepage showcase.');
    await fetchAll();
  }

  async function updateStatus(id, status, order) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error('Failed: ' + error.message); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Status: ${status}`);
  }

  async function updateDelivery(id, date, order) {
    const { error } = await supabase.from('orders').update({ estimated_delivery: date }).eq('id', id);
    if (error) { toast.error('Failed: ' + error.message); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estimated_delivery: date } : o));
    toast.success('Delivery date set.');
  }

  const lbl = { fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(106,99,80,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 7 };
  const inp = { width: '100%', padding: '10px 12px', background: 'rgba(30,27,20,0.06)', border: '1px solid rgba(33,29,20,0.2)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, outline: 'none', transition: 'border-color 0.25s' };
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'All' && (o.status || 'Pending') !== orderStatusFilter) return false;
    if (orderDateFrom && (!o.created_at || o.created_at < orderDateFrom)) return false;
    if (orderDateTo && (!o.created_at || o.created_at > orderDateTo + 'T23:59:59')) return false;
    return true;
  });
  const ordersFiltered = orderStatusFilter !== 'All' || orderDateFrom || orderDateTo;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6EF', color: 'var(--iv)' }}>
      {/* NAV */}
      <div style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(33,29,20,0.1)', padding: '15px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: 'var(--iv)' }}>Tamarind Taless</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.28em', color: 'var(--gd)' }}>ADMIN</div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'rgba(106,99,80,0.35)' }}>{currentUser?.email}</span>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(106,99,80,0.4)', cursor: 'pointer', textTransform: 'uppercase' }} onMouseEnter={e => e.target.style.color = 'var(--gd)'} onMouseLeave={e => e.target.style.color = 'rgba(106,99,80,0.4)'}>View Site</button>
          <button onClick={() => { logout(); navigate('/admin/login'); }} style={{ background: 'none', border: '1px solid rgba(33,29,20,0.2)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(106,99,80,0.45)', padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase' }} onMouseEnter={e => { e.target.style.borderColor = 'var(--gd)'; e.target.style.color = 'var(--gd)'; }} onMouseLeave={e => { e.target.style.borderColor = 'rgba(33,29,20,0.2)'; e.target.style.color = 'rgba(106,99,80,0.45)'; }}>Sign Out</button>
        </div>
      </div>

      <div className="admin-body-pad" style={{ padding: '28px 30px 60px' }}>
        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(33,29,20,0.1)', marginBottom: 28, overflowX: 'auto' }}>
          {TABS.map((t, i) => <button key={i} onClick={() => setTab(i)} style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '12px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === i ? 'var(--gd)' : 'transparent'}`, color: tab === i ? 'var(--cr)' : 'rgba(106,99,80,0.38)', cursor: 'pointer', marginBottom: -1, whiteSpace: 'nowrap' }}>{t}</button>)}
        </div>

        {/* DASHBOARD */}
        {tab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
              <StatTile type="box" color="#6B4E9E" value={products.length} label="Products" />
              <StatTile type="orders" color="#B8791E" value={orders.length} label="Orders" />
              <StatTile type="clock" color="#C05A34" value={orders.filter(o => (o.status || 'Pending') === 'Pending').length} label="Pending" />
              <StatTile type="chat" color="#3F7566" value={enquiries.length} label="Enquiries" />
            </div>
            <div className="admin-dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid rgba(33,29,20,0.1)', borderRadius: 10, padding: '22px 24px' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.16em', color: 'var(--iv)', textTransform: 'uppercase' }}>Orders — Last 14 Days</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, fontStyle: 'italic', color: 'var(--text-muted)', marginTop: 3, marginBottom: 16 }}>Daily order volume</div>
                <OrdersTrendChart orders={orders} color="#B8791E" />
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid rgba(33,29,20,0.1)', borderRadius: 10, padding: '22px 24px' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.16em', color: 'var(--iv)', textTransform: 'uppercase' }}>Orders by Status</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, fontStyle: 'italic', color: 'var(--text-muted)', marginTop: 3, marginBottom: 18 }}>All-time breakdown</div>
                <StatusBreakdownChart orders={orders} color="#B8791E" />
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS LIST */}
        {tab === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', textTransform: 'uppercase' }}>All Products ({products.length})</div>
              <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setTab(2); }} style={{ background: 'var(--gd)', border: 'none', color: 'var(--text-dark)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 18px', cursor: 'pointer' }}>Add New Product</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(106,99,80,0.3)' }}>Loading...</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                  <thead><tr>{['Image', 'Name', 'Category', 'Price', 'Stock', 'Visible', 'Actions'].map(h => <th key={h} style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(33,29,20,0.12)', color: 'rgba(106,99,80,0.4)' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(33,29,20,0.06)' }}><div style={{ width: 52, height: 52, background: p.bg, overflow: 'hidden' }}>{p.images?.[0] && <img src={cldThumb(p.images[0], 110)} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div></td>
                        <td style={{ padding: '10px 12px', color: 'var(--iv)', fontSize: 16, borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{p.name}</td>
                        <td style={{ padding: '10px 12px', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.12em', color: 'var(--gd)', textTransform: 'uppercase', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{p.cat}</td>
                        <td style={{ padding: '10px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'var(--iv)', fontWeight: 500, borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{p.enquiry_only ? <span style={{ fontStyle: 'italic', fontSize: 16, color: 'rgba(106,99,80,0.5)' }}>Enquiry</span> : fmt(p.price)}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{p.stock === 0 ? <span style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', padding: '2px 8px', fontSize: 12, fontFamily: "'Inter',sans-serif", fontWeight: 600, textTransform: 'uppercase' }}>Sold</span> : p.stock === 1 ? <span style={{ background: 'var(--tr)', color: '#fff', padding: '2px 8px', fontSize: 12, fontFamily: "'Inter',sans-serif", fontWeight: 600, textTransform: 'uppercase' }}>Last 1</span> : <span style={{ color: 'rgba(106,99,80,0.6)', fontSize: 15 }}>{p.stock}</span>}</td>
                        <td style={{ padding: '10px 12px', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: p.available ? 'var(--success)' : 'var(--error)', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{p.available ? 'Live' : 'Hidden'}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => toggleFeatured(p)} title={p.featured ? 'Unpin from Homepage' : 'Pin to Homepage'} style={{ background: p.featured ? 'var(--gd)' : 'none', border: '1px solid rgba(33,29,20,0.25)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', color: p.featured ? 'var(--text-dark)' : 'var(--gd)', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase' }}>{p.featured ? '★ Pinned' : '☆ Pin'}</button>
                            <button onClick={() => editProduct(p)} style={{ background: 'none', border: '1px solid rgba(33,29,20,0.25)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', color: 'var(--gd)', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase' }} onMouseEnter={e => e.target.style.background = 'rgba(33,29,20,0.1)'} onMouseLeave={e => e.target.style.background = 'none'}>Edit</button>
                            <button onClick={() => deleteProduct(p.id, p.name)} style={{ background: 'none', border: '1px solid rgba(192,120,64,0.4)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', color: 'var(--error)', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase' }} onMouseEnter={e => e.target.style.background = 'rgba(192,120,64,0.15)'} onMouseLeave={e => e.target.style.background = 'none'}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(106,99,80,0.2)' }}>No products yet</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD/EDIT PRODUCT */}
        {tab === 2 && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', marginBottom: 24, textTransform: 'uppercase' }}>{editId ? 'Edit Product' : 'Add New Product'}</div>
            <div style={{ background: 'rgba(30,27,20,0.04)', border: '1px solid rgba(33,29,20,0.13)', padding: '30px 28px' }}>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Product Name *</label><input style={inp} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Naranbil Bhagavathy" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e => setF('subtitle', e.target.value)} placeholder="e.g. Guardian of Justice" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div><label style={lbl}>Category</label><select style={{ ...inp, cursor: 'pointer' }} value={form.cat} onChange={e => setF('cat', e.target.value)}>{liveCats.map(c => <option key={c} value={c} style={{ background: '#F2EFE4' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Source</label><input style={inp} value={form.origin} onChange={e => setF('origin', e.target.value)} placeholder="e.g. North Malabar, Kerala" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div><label style={lbl}>Material</label><input style={inp} value={form.material} onChange={e => setF('material', e.target.value)} placeholder="e.g. Bronze" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div><label style={lbl}>Dimensions</label><input style={inp} value={form.dimensions} onChange={e => setF('dimensions', e.target.value)} placeholder='10" H x 4" W' onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div><label style={lbl}>Weight</label><input style={inp} value={form.weight} onChange={e => setF('weight', e.target.value)} placeholder="e.g. 1.2 kg" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div><label style={lbl}>Stock (0 = Sold Out)</label><input style={inp} type="number" min="0" value={form.stock} onChange={e => setF('stock', e.target.value)} onWheel={e => e.currentTarget.blur()} onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div><label style={lbl}>Delivery — Min Days</label><input style={inp} type="number" min="0" value={form.delivery_min_days} onChange={e => setF('delivery_min_days', e.target.value)} onWheel={e => e.currentTarget.blur()} placeholder="e.g. 5" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div><label style={lbl}>Delivery — Max Days</label><input style={inp} type="number" min="0" value={form.delivery_max_days} onChange={e => setF('delivery_max_days', e.target.value)} onWheel={e => e.currentTarget.blur()} placeholder="e.g. 8" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="eq" checked={form.enquiry_only} onChange={e => setF('enquiry_only', e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="eq" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Enquiry Only (hide price, show WhatsApp button)</label>
                </div>
                {!form.enquiry_only && <div><label style={lbl}>Price (Rs.)</label><input style={inp} type="number" value={form.price} onChange={e => setF('price', e.target.value)} onWheel={e => e.currentTarget.blur()} placeholder="e.g. 45000" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>}
                <div><label style={lbl}>Badge</label><input style={inp} value={form.badge} onChange={e => setF('badge', e.target.value)} placeholder="Featured / Rare / Collector" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Pinterest Pin URL (optional)</label><input style={inp} value={form.pinterest_url} onChange={e => setF('pinterest_url', e.target.value)} placeholder="Paste the pin's URL from Pinterest — leave blank to auto-generate a Pin It link" onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>

                {/* VARIANTS */}
                <div style={{ gridColumn: '1/-1', borderTop: '1px dashed rgba(33,29,20,.2)', paddingTop: 18, marginTop: 4 }}>
                  <label style={lbl}>Variants (optional)</label>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, fontStyle: 'italic', color: 'rgba(106,99,80,.8)', marginBottom: 14 }}>
                    Use this if the piece comes in more than one option — actual sizes like Small / Medium / Large, or distinct named pieces sold under one listing (e.g. "Shiva" and "Ardhanarishvara" heads) — each with its own price, weight, dimensions and stock. Customers pick one on the product page and see that option's details, pre-selected to the first available by default. Leave empty for a single-option product (the Price/Weight/Dimensions/Stock fields above are used instead).
                  </div>
                  {(form.variants || []).map((v, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input style={{ ...inp, flex: '1 1 110px' }} value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} placeholder="Option name (Small, or Shiva)" />
                      <input style={{ ...inp, flex: '1 1 100px' }} type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} onWheel={e => e.currentTarget.blur()} placeholder="Price (Rs.)" />
                      <input style={{ ...inp, flex: '1 1 90px' }} value={v.weight} onChange={e => updateVariant(i, 'weight', e.target.value)} placeholder="Weight" />
                      <input style={{ ...inp, flex: '1 1 120px' }} value={v.dimensions} onChange={e => updateVariant(i, 'dimensions', e.target.value)} placeholder="Dimensions" />
                      <input style={{ ...inp, flex: '0 1 80px' }} type="number" min="0" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} onWheel={e => e.currentTarget.blur()} placeholder="Stock" />
                      <button type="button" onClick={() => removeVariant(i)} title="Remove size" style={{ background: 'none', border: '1px solid rgba(192,120,64,.4)', color: 'var(--error)', width: 34, height: 34, flexShrink: 0, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                  <button type="button" onClick={addVariant} style={{ background: 'none', border: '1px dashed rgba(33,29,20,.35)', color: 'var(--gd)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '9px 16px', cursor: 'pointer', marginTop: 4 }}>+ Add Option</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="av" checked={form.available} onChange={e => setF('available', e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="av" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Visible on website</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="ft" checked={form.featured} onChange={e => setF('featured', e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="ft" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Featured (pin to Homepage showcase)</label>
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="aq" checked={form.allow_enquiry} onChange={e => setF('allow_enquiry', e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="aq" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Allow WhatsApp Enquiry (uncheck for fixed-price / non-negotiable items)</label>
                </div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Story</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} rows={4} value={form.story} onChange={e => setF('story', e.target.value)} placeholder="The story behind this piece..." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Collection Note</label><textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} rows={3} value={form.together} onChange={e => setF('together', e.target.value)} placeholder="Context..." onFocus={e => e.target.style.borderColor = 'var(--gd)'} onBlur={e => e.target.style.borderColor = 'rgba(33,29,20,0.2)'} /></div>
                <div style={{ gridColumn: '1/-1' }}>
                  <ImageUploader images={form.images || []} onChange={imgs => setF('images', imgs)} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <ImagePositionPicker image={form.images?.[0]} value={form.image_position} onChange={v => setF('image_position', v)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button onClick={saveProduct} disabled={saving} style={{ background: 'var(--gd)', border: 'none', color: 'var(--text-dark)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {saving ? <span style={{ width: 14, height: 14, border: '2px solid rgba(26,15,8,0.3)', borderTopColor: 'var(--br)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : null}
                  {editId ? 'Update Product' : 'Add Product'}
                </button>
                {editId && <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setTab(1); }} style={{ background: 'transparent', border: '1px solid rgba(106,99,80,0.25)', color: 'rgba(106,99,80,0.6)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 28px', cursor: 'pointer' }}>Cancel</button>}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 3 && (
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.2em', color: 'var(--gd)', marginBottom: 20, textTransform: 'uppercase' }}>All Orders ({orders.length})</div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20, padding: '16px 18px', background: '#FFFFFF', border: '1px solid rgba(33,29,20,0.1)', borderRadius: 8 }}>
              <div>
                <label style={{ ...lbl, marginBottom: 6 }}>Status</label>
                <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} style={{ background: 'rgba(242,239,228,0.95)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', outline: 'none', cursor: 'pointer' }}>
                  <option value="All">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s} style={{ background: '#F2EFE4' }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ ...lbl, marginBottom: 6 }}>From</label>
                <input type="date" value={orderDateFrom} onChange={e => setOrderDateFrom(e.target.value)} style={{ background: 'rgba(242,239,228,0.95)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, outline: 'none', colorScheme: 'light' }} />
              </div>
              <div>
                <label style={{ ...lbl, marginBottom: 6 }}>To</label>
                <input type="date" value={orderDateTo} onChange={e => setOrderDateTo(e.target.value)} style={{ background: 'rgba(242,239,228,0.95)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, outline: 'none', colorScheme: 'light' }} />
              </div>
              {ordersFiltered && (
                <button onClick={() => { setOrderStatusFilter('All'); setOrderDateFrom(''); setOrderDateTo(''); }} style={{ background: 'none', border: '1px solid rgba(106,99,80,0.35)', color: 'var(--text-muted)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px', cursor: 'pointer' }}>Clear</button>
              )}
              <div style={{ marginLeft: 'auto', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--text-muted)', fontStyle: 'italic', paddingBottom: 8 }}>
                Showing {filteredOrders.length} of {orders.length}
              </div>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: 60 }}>Loading...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredOrders.map(o => (
                  <div key={o.id} style={{ background: 'rgba(30,27,20,0.04)', border: '1px solid rgba(33,29,20,0.13)', padding: '22px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: '0.2em', color: 'var(--gd)' }}>{o.order_id || o.id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--text-muted)', marginTop: 3 }}>{o.user_name}, {o.user_email}</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--text-muted)', marginTop: 2 }}>{o.user_phone} | {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '-'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'var(--iv)', fontWeight: 500 }}>{fmt(o.total)}</div>
                        {o.coupon_code && <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11.5, letterSpacing: '.06em', color: 'var(--success)', marginTop: 2 }}>{o.coupon_code} (-{fmt(o.discount || 0)})</div>}
                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: o.payment_method === 'razorpay' ? 'var(--success)' : 'var(--gd)', textTransform: 'uppercase', marginTop: 4 }}>{o.payment_method === 'razorpay' ? 'Online' : 'WhatsApp/COD'}</div>
                        {o.payment_id && <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 500, fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Pay ID: {o.payment_id}</div>}
                      </div>
                    </div>
                    <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(33,29,20,0.08)' }}>
                      {o.items?.map((item, i) => (
                        <div key={i} style={{ display: 'inline-block', marginRight: 12 }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--text-muted)' }}>{item.name} ×{item.qty}</span>
                          {item.isGiftCard && (
                            <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.04em', color: 'var(--gd)', background: 'rgba(33,29,20,.08)', padding: '2px 8px', marginLeft: 6 }}>
                              {item.giftCode}{item.recipientName ? ` → ${item.recipientName} (${item.recipientEmail})` : ''}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {o.address && <div style={{ marginBottom: 14, fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6 }}>{o.address.line1}{o.address.line2 ? ', ' + o.address.line2 : ''}, {o.address.city}, {o.address.state}, {o.address.pincode}</div>}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ ...lbl, marginBottom: 6 }}>Status</label>
                        <select value={o.status || 'Pending'} onChange={e => updateStatus(o.id, e.target.value, o)} style={{ background: 'rgba(242,239,228,0.95)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.1em', outline: 'none', cursor: 'pointer' }}>
                          {STATUSES.map(s => <option key={s} value={s} style={{ background: '#F2EFE4' }}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ ...lbl, marginBottom: 6 }}>Delivery Date</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="date" id={`dd-${o.id}`} defaultValue={toDateInputValue(o.estimated_delivery)} style={{ background: 'rgba(242,239,228,0.95)', border: '1px solid rgba(33,29,20,0.25)', color: 'var(--iv)', padding: '8px 12px', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, outline: 'none', colorScheme: 'light' }} />
                          <button onClick={() => { const v = document.getElementById(`dd-${o.id}`)?.value; if (v) { const d = new Date(v); updateDelivery(o.id, d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), o); } }} style={{ background: 'var(--gd)', border: 'none', color: 'var(--text-dark)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 14px', cursor: 'pointer' }}>Set &amp; Notify</button>
                        </div>
                        {o.estimated_delivery && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--gd)', marginTop: 5, fontStyle: 'italic' }}>Set: {o.estimated_delivery}</div>}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(106,99,80,0.4)' }}>
                    {ordersFiltered ? 'No orders match this filter.' : 'No orders yet'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ENQUIRIES */}
        {tab === 4 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead><tr>{['Product', 'Customer', 'Message', 'Date', 'Type', 'Status'].map(h => <th key={h} style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(33,29,20,0.12)', color: 'rgba(106,99,80,0.4)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {enquiries.map(e => (
                  <tr key={e.id}>
                    <td style={{ padding: '12px', color: 'rgba(106,99,80,0.7)', fontSize: 16, borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{e.product || '-'}</td>
                    <td style={{ padding: '12px', fontSize: 16, color: 'rgba(106,99,80,0.6)', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{e.user_name}<br /><span style={{ opacity: 0.5, fontSize: 15 }}>{e.user_email}</span></td>
                    <td style={{ padding: '12px', fontSize: 16, color: 'rgba(106,99,80,0.5)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{e.message || '-'}</td>
                    <td style={{ padding: '12px', fontSize: 16, color: 'var(--text-muted)', borderBottom: '1px solid rgba(33,29,20,0.06)' }}>{e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '-'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(33,29,20,0.06)' }}><span style={{ background: 'rgba(107,142,80,0.1)', color: 'var(--success)', padding: '2px 8px', fontSize: 12, fontFamily: "'Inter',sans-serif", fontWeight: 600, textTransform: 'uppercase' }}>{e.type || 'Email'}</span></td>
                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(33,29,20,0.06)' }}><span style={{ background: 'rgba(33,29,20,0.1)', color: 'var(--gd)', padding: '2px 8px', fontSize: 12, fontFamily: "'Inter',sans-serif", fontWeight: 600, textTransform: 'uppercase' }}>{e.status || 'Received'}</span></td>
                  </tr>
                ))}
                {enquiries.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: 'rgba(106,99,80,0.2)' }}>No enquiries yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* STORIES */}
        {tab === 5 && <StoriesManager />}

        {/* COUPONS */}
        {tab === 6 && <CouponsManager />}

        {/* GIFT CARDS */}
        {tab === 7 && <GiftCardsManager />}

        {/* BRAND SETTINGS */}
        {tab === 8 && <BrandSettings />}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .admin-body-pad { padding: 20px 16px 44px !important; }
          .admin-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .admin-dash-grid { grid-template-columns: 1fr !important; }
          .admin-form-grid { grid-template-columns: 1fr !important; }
          .admin-story-row { flex-wrap: wrap !important; }
          .admin-story-row .admin-story-actions { width: 100% !important; justify-content: flex-end !important; }
        }
        @media (max-width: 480px) {
          .admin-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}