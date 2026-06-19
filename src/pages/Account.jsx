import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fmt } from '../data/products';
import toast from 'react-hot-toast';

const TABS = ['My Orders', 'My Wishlist', 'My Profile', 'Address Book', 'Enquiry History'];

export default function Account() {
  const { currentUser, userProfile, logout, refreshProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initTab = searchParams.get('tab') === 'wishlist' ? 1 : 0;
  const [tab, setTab] = useState(initTab);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      supabase.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
      supabase.from('enquiries').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    ]).then(([oRes, eRes]) => {
      setOrders(oRes.data || []);
      setEnquiries(eRes.data || []);
      setLoadingOrders(false);
    });
  }, [currentUser]);

  async function handleLogout() {
    await logout();
    toast.success('Signed out.');
    navigate('/');
  }

  if (!currentUser) { navigate('/login'); return null; }

  const statusCls = { Pending: 'badge-pending', Confirmed: 'badge-confirmed', Shipped: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-sold' };

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--br)', padding: '50px 44px' }}>
        <div className="container">
          <div className="section-label" style={{ color: 'var(--gd)' }}>Collector Account</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(30px,5vw,50px)', fontWeight: 300, color: 'var(--iv)', marginBottom: 4 }}>
            {userProfile?.name || currentUser.email?.split('@')[0] || 'Collector'}
          </h1>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(245,237,216,0.45)' }}>{currentUser.email}</div>
        </div>
      </div>

      <div className="container" style={{ padding: '44px 44px' }}>
        <div className="tabs">
          {TABS.map((t, i) => <button key={i} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>)}
        </div>

        {/* ORDERS */}
        {tab === 0 && (
          loadingOrders ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner"></span></div> :
          orders.length === 0 ? (
            <div className="empty-state">
              <div>No orders yet</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontStyle: 'italic', margin: '8px 0 22px' }}>Your order history will appear here</div>
              <button className="btn btn-gold btn-sm" onClick={() => navigate('/shop')}>Shop Now</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Delivery</th><th>Action</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: 'var(--iv)' }}>{o.order_id || o.id.slice(-8).toUpperCase()}</td>
                      <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items?.map(i => i.name).join(', ') || '—'}</td>
                      <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 500 }}>{fmt(o.total)}</td>
                      <td><span className={`badge ${statusCls[o.status] || 'badge-pending'}`}>{o.status}</span></td>
                      <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: o.estimated_delivery ? 'var(--gd)' : 'var(--sm)', fontStyle: o.estimated_delivery ? 'normal' : 'italic' }}>{o.estimated_delivery || 'Pending'}</td>
                      <td><a href={`https://wa.me/918796988216?text=Order status query for ${o.order_id || o.id.slice(-8)}`} target="_blank" rel="noreferrer" style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', color: 'var(--gd)' }}>Track</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* WISHLIST */}
        {tab === 1 && <WishlistTab navigate={navigate} />}

        {/* PROFILE */}
        {tab === 2 && <ProfileTab userProfile={userProfile} currentUser={currentUser} updateProfile={updateProfile} handleLogout={handleLogout} />}

        {/* ADDRESSES */}
        {tab === 3 && <AddressTab userProfile={userProfile} currentUser={currentUser} refreshProfile={refreshProfile} />}

        {/* ENQUIRIES */}
        {tab === 4 && (
          enquiries.length === 0 ? <div className="empty-state">No enquiries yet</div> :
          <table className="data-table">
            <thead><tr><th>Product</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              {enquiries.map(e => (
                <tr key={e.id}>
                  <td>{e.product || '—'}</td>
                  <td>{e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td><span className="badge badge-confirmed">{e.type}</span></td>
                  <td><span className="badge badge-pending">{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function WishlistTab({ navigate }) {
  const [wl, setWl] = useState(() => { try { return JSON.parse(localStorage.getItem('tt_wl') || '[]'); } catch { return []; } });
  const { addToCart } = useCart();
  function remove(id) { const u = wl.filter(p => p.id !== id); setWl(u); localStorage.setItem('tt_wl', JSON.stringify(u)); toast.success('Removed.'); }
  if (!wl.length) return <div className="empty-state"><div>Nothing saved yet</div><button className="btn btn-gold btn-sm" style={{ marginTop: 20 }} onClick={() => navigate('/shop')}>Explore Collection</button></div>;
  return (
    <div className="grid-4">
      {wl.map(p => (
        <div key={p.id} className="product-card">
          <div style={{ height: 170, background: p.bg, cursor: 'none', overflow: 'hidden' }} onClick={() => navigate('/shop')}>
            {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div className="product-card-body" style={{ padding: 13 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)', marginBottom: 9 }}>{p.enquiry_only ? <span style={{ fontStyle: 'italic', color: 'rgba(248,236,216,.88)', fontSize: 13 }}>Price on Enquiry</span> : fmt(p.price)}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {!p.enquiry_only && p.stock > 0 && <button className="btn btn-sm btn-gold" style={{ flex: 1 }} onClick={() => addToCart(p)}>Add to Cart</button>}
              <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ userProfile, currentUser, updateProfile, handleLogout }) {
  const [form, setForm] = useState({ name: userProfile?.name || '', phone: userProfile?.phone || '' });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try { await updateProfile({ name: form.name, phone: form.phone }); toast.success('Profile updated.'); }
    catch (e) { toast.error('Failed.'); }
    finally { setSaving(false); }
  }
  const inp = { width: '100%', padding: '11px 0', border: 'none', borderBottom: '1px solid rgba(212,160,64,.80)', background: 'transparent', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', outline: 'none' };
  return (
    <div style={{ maxWidth: 500 }}>
      <div className="card-white">
        <div className="section-label" style={{ marginBottom: 20 }}>Profile Details</div>
        <div className="form-group"><label className="form-label">Full Name</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = '#D4C5B0'} /></div>
        <div className="form-group"><label className="form-label">Email</label><input style={{ ...inp, opacity: 0.5 }} value={currentUser.email} disabled /></div>
        <div className="form-group"><label className="form-label">Phone</label><input style={inp} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = '#D4C5B0'} /></div>
        <button className="btn btn-gold btn-sm" onClick={save} disabled={saving}>{saving ? <span className="spinner"></span> : 'Save Changes'}</button>
      </div>
      <div style={{ marginTop: 18 }}>
        <button onClick={handleLogout} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', color: 'var(--tr)', background: 'none', border: 'none', cursor: 'none', textTransform: 'uppercase', padding: 0 }}>Sign Out</button>
      </div>
    </div>
  );
}

function AddressTab({ userProfile, currentUser, refreshProfile }) {
  const [form, setForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);
  const addresses = userProfile?.addresses || [];

  async function addAddress() {
    if (!form.name || !form.line1 || !form.city || !form.state || !form.pincode) { toast.error('Please fill required fields.'); return; }
    setSaving(true);
    try {
      const newAddrs = [...addresses, form];
      await supabase.from('profiles').update({ addresses: newAddrs }).eq('id', currentUser.id);
      await refreshProfile();
      setForm({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
      toast.success('Address saved.');
    } catch { toast.error('Failed.'); }
    finally { setSaving(false); }
  }

  async function deleteAddress(idx) {
    const newAddrs = addresses.filter((_, i) => i !== idx);
    await supabase.from('profiles').update({ addresses: newAddrs }).eq('id', currentUser.id);
    await refreshProfile();
    toast.success('Address removed.');
  }

  const inp = { width: '100%', padding: '11px 0', border: 'none', borderBottom: '1px solid rgba(212,160,64,.80)', background: 'transparent', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', outline: 'none' };

  return (
    <div style={{ maxWidth: 620 }}>
      {addresses.length === 0 && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(248,236,216,.88)', fontStyle: 'italic', marginBottom: 22 }}>No saved addresses yet.</div>}
      {addresses.map((addr, i) => (
        <div key={i} style={{ border: '1px solid var(--iv)', padding: 18, marginBottom: 12, position: 'relative' }}>
          {i === 0 && <span className="badge badge-gold" style={{ position: 'absolute', top: 11, right: 11, fontSize: 7 }}>Default</span>}
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', lineHeight: 1.7 }}>
            <strong>{addr.name}</strong> — {addr.phone}<br />{addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}<br />{addr.city}, {addr.state} — {addr.pincode}
          </div>
          <button className="btn btn-danger btn-sm" style={{ marginTop: 11 }} onClick={() => deleteAddress(i)}>Delete</button>
        </div>
      ))}
      <div className="card-white" style={{ marginTop: 18 }}>
        <div className="section-label" style={{ marginBottom: 17 }}>Add New Address</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          {[['Full Name *','name',false],['Phone *','phone',false],['Address Line 1 *','line1',true],['Address Line 2','line2',true],['City *','city',false],['State *','state',false],['Pincode *','pincode',false]].map(([label,key,full]) => (
            <div key={key} style={{ gridColumn: full ? '1/-1' : 'auto' }}>
              <label className="form-label">{label}</label>
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = '#D4C5B0'} />
            </div>
          ))}
        </div>
        <button className="btn btn-gold btn-sm" style={{ marginTop: 16 }} onClick={addAddress} disabled={saving}>
          {saving ? <span className="spinner"></span> : 'Save Address'}
        </button>
      </div>
    </div>
  );
}
