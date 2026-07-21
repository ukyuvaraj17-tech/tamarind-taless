import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fmt } from '../data/products';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'giftcards', label: 'Gift Cards' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'details', label: 'Account Details' },
];

function readWishlist() {
  try { return JSON.parse(localStorage.getItem('tt_wl') || '[]'); } catch { return []; }
}

export default function Account() {
  const { currentUser, userProfile, logout, refreshProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [tab, setTab] = useState(NAV_ITEMS.some(n => n.key === urlTab) ? urlTab : 'dashboard');
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

  function selectTab(key) {
    setTab(key);
    setSearchParams(key === 'dashboard' ? {} : { tab: key });
  }

  async function handleLogout() {
    await logout();
    toast.success('Signed out.');
    navigate('/');
  }

  if (!currentUser) { navigate('/login'); return null; }

  const statusCls = { Pending: 'badge-pending', Confirmed: 'badge-confirmed', Shipped: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-sold' };
  const wishlistCount = readWishlist().length;

  const navBtn = (active) => ({
    display: 'block', width: '100%', textAlign: 'left', padding: '13px 16px',
    fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '.06em',
    background: active ? 'rgba(33,29,20,.05)' : 'transparent', color: active ? 'var(--gd)' : 'var(--iv)',
    border: 'none', borderLeft: `2px solid ${active ? 'var(--gd)' : 'transparent'}`,
    borderBottom: '1px solid var(--line)', cursor: 'pointer', textTransform: 'uppercase',
  });

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--br)', padding: '50px 44px' }}>
        <div className="container">
          <div className="section-label" style={{ color: 'var(--gd)' }}>Collector Account</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(30px,5vw,50px)', fontWeight: 300, color: 'var(--iv)', marginBottom: 4 }}>
            {userProfile?.name || currentUser.email?.split('@')[0] || 'Collector'}
          </h1>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,0.45)' }}>{currentUser.email}</div>
        </div>
      </div>

      <div className="container" style={{ padding: '44px 44px' }}>
        <div className="account-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>

          {/* SIDEBAR */}
          <div style={{ border: '1px solid var(--line)', background: 'var(--card)' }}>
            {NAV_ITEMS.map(n => (
              <button key={n.key} onClick={() => selectTab(n.key)} style={navBtn(tab === n.key)}>{n.label}</button>
            ))}
            <button onClick={handleLogout} style={{ ...navBtn(false), borderBottom: 'none', color: 'var(--tr)' }}>Log Out</button>
          </div>

          {/* CONTENT */}
          <div style={{ minWidth: 0 }}>
            {tab === 'dashboard' && (
              <DashboardTab userProfile={userProfile} currentUser={currentUser} orderCount={orders.length} wishlistCount={wishlistCount} onNav={selectTab} />
            )}

            {tab === 'orders' && (
              loadingOrders ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner"></span></div> :
              orders.length === 0 ? (
                <div className="empty-state">
                  <div>No orders yet</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontStyle: 'italic', margin: '8px 0 22px' }}>Your order history will appear here</div>
                  <button className="btn btn-gold btn-sm" onClick={() => navigate('/shop')}>Shop Now</button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Delivery</th><th>Action</th></tr></thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, color: 'var(--iv)' }}>{o.order_id || o.id.slice(-8).toUpperCase()}</td>
                          <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                          <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items?.map(i => i.name).join(', ') || '-'}</td>
                          <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 500 }}>{fmt(o.total)}</td>
                          <td><span className={`badge ${statusCls[o.status] || 'badge-pending'}`}>{o.status}</span></td>
                          <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: o.estimated_delivery ? 'var(--gd)' : 'var(--sm)', fontStyle: o.estimated_delivery ? 'normal' : 'italic' }}>{o.estimated_delivery || 'Pending'}</td>
                          <td><a href={`https://wa.me/918796988216?text=Order status query for ${o.order_id || o.id.slice(-8)}`} target="_blank" rel="noreferrer" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', color: 'var(--gd)' }}>Track</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {tab === 'wishlist' && <WishlistTab navigate={navigate} />}
            {tab === 'giftcards' && <GiftCardsTab userProfile={userProfile} updateProfile={updateProfile} navigate={navigate} />}
            {tab === 'coupons' && <CouponsTab />}

            {tab === 'enquiries' && (
              enquiries.length === 0 ? <div className="empty-state">No enquiries yet</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Product</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
                    <tbody>
                      {enquiries.map(e => (
                        <tr key={e.id}>
                          <td>{e.product || '-'}</td>
                          <td>{e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '-'}</td>
                          <td><span className="badge badge-confirmed">{e.type}</span></td>
                          <td><span className="badge badge-pending">{e.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {tab === 'addresses' && <AddressTab userProfile={userProfile} currentUser={currentUser} refreshProfile={refreshProfile} />}
            {tab === 'details' && <AccountDetailsTab userProfile={userProfile} currentUser={currentUser} updateProfile={updateProfile} />}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .account-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function DashboardTab({ userProfile, currentUser, orderCount, wishlistCount, onNav }) {
  return (
    <div>
      <div className="card-white" style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'var(--iv)', lineHeight: 1.8 }}>
          Hello <strong>{userProfile?.name || currentUser.email}</strong>. From your account dashboard you can view your recent orders, manage your wishlist and addresses, link a gift card, browse active coupons, and edit your account details.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
        {[['Orders', orderCount, 'orders'], ['Wishlist', wishlistCount, 'wishlist']].map(([label, count, key]) => (
          <button key={key} onClick={() => onNav(key)} style={{ textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)', padding: '18px 20px', cursor: 'pointer' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: 'var(--gd)', fontWeight: 500 }}>{count}</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--iv)', marginTop: 4 }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WishlistTab({ navigate }) {
  const [wl, setWl] = useState(readWishlist);
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
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)', marginBottom: 9 }}>{p.enquiry_only ? <span style={{ fontStyle: 'italic', color: 'rgba(106,99,80,.88)', fontSize: 14 }}>Price on Enquiry</span> : fmt(p.price)}</div>
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

// Lightweight "keep the code on file" registry -- this project has no backend to safely
// track/deduct a live balance, so redemption is arranged manually (same as order fulfillment).
function GiftCardsTab({ userProfile, updateProfile, navigate }) {
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const cards = userProfile?.gift_cards || [];

  async function linkCard() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { toast.error('Enter a gift card code.'); return; }
    if (cards.some(c => c.code === trimmed)) { toast.error('That code is already linked to your account.'); return; }
    setSaving(true);
    try {
      await updateProfile({ gift_cards: [...cards, { code: trimmed, added_at: new Date().toISOString() }] });
      toast.success('Gift card linked to your account.');
      setCode(''); setShowModal(false);
    } catch { toast.error('Failed to link gift card.'); }
    finally { setSaving(false); }
  }

  async function removeCard(codeToRemove) {
    try { await updateProfile({ gift_cards: cards.filter(c => c.code !== codeToRemove) }); toast.success('Removed.'); }
    catch { toast.error('Failed.'); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div className="section-label" style={{ margin: 0 }}>My Gift Cards</div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowModal(true)}>Add New</button>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14.5, fontStyle: 'italic', color: 'rgba(106,99,80,.8)', marginBottom: 20 }}>
        Received a Tamarind Taless gift card? Link its code here to keep it on file. To redeem it, mention the code when you check out or message us on WhatsApp — our team applies it to your order directly.
      </div>

      {cards.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <div>No gift cards linked</div>
          <button className="btn btn-gold btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/gift-card')}>Buy a Gift Card</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map(c => (
            <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--line)', background: 'var(--card)', padding: '14px 18px', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '.05em', color: 'var(--iv)' }}>{c.code}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: 'italic', color: 'rgba(106,99,80,.7)' }}>Added {new Date(c.added_at).toLocaleDateString('en-IN')}</div>
              </div>
              <button onClick={() => removeCard(c.code)} className="btn btn-danger btn-sm">Remove</button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,27,20,.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowModal(false)}>
          <div className="card-white" style={{ maxWidth: 380, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--iv)', lineHeight: 1 }}>×</button>
            <div className="section-label" style={{ textAlign: 'center', marginBottom: 20 }}>Link a Gift Card</div>
            <label className="form-label">Gift Card Code</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); linkCard(); } }}
              placeholder="e.g. TT-GC-XXXXXX"
              style={{ width: '100%', padding: '11px 0', border: 'none', borderBottom: '1px solid rgba(33,29,20,.8)', background: 'transparent', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)', outline: 'none', marginBottom: 20, textTransform: 'uppercase' }}
            />
            <button className="btn btn-gold btn-full" onClick={linkCard} disabled={saving}>{saving ? <span className="spinner"></span> : 'Add It'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('coupons').select('*').eq('active', true).order('created_at', { ascending: false })
      .then(({ data }) => { setCoupons(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function copyCode(code) {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code);
    toast.success(`${code} copied.`);
  }

  return (
    <div>
      <div className="section-label" style={{ marginBottom: 18 }}>Available Coupons</div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner"></span></div>
      ) : coupons.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>No active coupons right now — check back soon.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coupons.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed var(--gd)', background: 'var(--card)', padding: '16px 18px', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '.05em', color: 'var(--gd)' }}>{c.code}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', marginTop: 2 }}>
                  {c.type === 'percent' ? `${c.value}% off` : `${fmt(c.value)} off`}
                  {c.applies_to === 'bundle' && ' — buy the qualifying pieces together'}
                  {c.applies_to === 'products' && ' — on select pieces'}
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => copyCode(c.code)}>Copy Code</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountDetailsTab({ userProfile, currentUser, updateProfile }) {
  const [form, setForm] = useState({ name: userProfile?.name || '', phone: userProfile?.phone || '' });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try { await updateProfile({ name: form.name, phone: form.phone }); toast.success('Details updated.'); }
    catch (e) { toast.error('Failed.'); }
    finally { setSaving(false); }
  }
  const inp = { width: '100%', padding: '11px 0', border: 'none', borderBottom: '1px solid rgba(33,29,20,.80)', background: 'transparent', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', outline: 'none' };
  return (
    <div style={{ maxWidth: 500 }}>
      <div className="card-white">
        <div className="section-label" style={{ marginBottom: 20 }}>Account Details</div>
        <div className="form-group"><label className="form-label">Full Name</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = '#D3CCB9'} /></div>
        <div className="form-group"><label className="form-label">Email</label><input style={{ ...inp, opacity: 0.5 }} value={currentUser.email} disabled /></div>
        <div className="form-group"><label className="form-label">Phone</label><input style={inp} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = '#D3CCB9'} /></div>
        <button className="btn btn-gold btn-sm" onClick={save} disabled={saving}>{saving ? <span className="spinner"></span> : 'Save Changes'}</button>
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

  const inp = { width: '100%', padding: '11px 0', border: 'none', borderBottom: '1px solid rgba(33,29,20,.80)', background: 'transparent', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', outline: 'none' };

  return (
    <div style={{ maxWidth: 620 }}>
      {addresses.length === 0 && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,.88)', fontStyle: 'italic', marginBottom: 22 }}>No saved addresses yet.</div>}
      {addresses.map((addr, i) => (
        <div key={i} style={{ border: '1px solid var(--iv)', padding: 18, marginBottom: 12, position: 'relative' }}>
          {i === 0 && <span className="badge badge-gold" style={{ position: 'absolute', top: 11, right: 11, fontSize: 10 }}>Default</span>}
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', lineHeight: 1.7 }}>
            <strong>{addr.name}</strong>, {addr.phone}<br />{addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}<br />{addr.city}, {addr.state}, {addr.pincode}
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
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = '#D3CCB9'} />
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
