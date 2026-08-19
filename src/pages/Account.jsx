import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useCartActions } from '../context/CartContext';
import { fmt } from '../data/products';
import { cldThumb } from '../utils/cloudinary';
import { getWishlist, toggleSaved } from '../utils/wishlist';
import { isProductSoldOut, productAddToCartPayload } from '../data/products';
import toast from 'react-hot-toast';

const NAV_ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  orders: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></>,
  wishlist: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
  giftcards: <><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></>,
  coupons: <><path d="M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  enquiries: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  addresses: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
  details: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
};

function NavIcon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {NAV_ICONS[name]}
    </svg>
  );
}

// The real fulfillment stages an order moves through after payment (mirrors
// Admin's STATUSES, minus the pre-payment "Pending" state and the terminal
// "Cancelled" exception, both handled separately below).
const ORDER_STAGES = ['Paid', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

function OrderStageTracker({ status }) {
  if (status === 'Cancelled') {
    return (
      <div style={{ padding: '16px 6px', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--tr)' }}>
        This order was cancelled.
      </div>
    );
  }
  // 'Pending' is a pre-payment/legacy state -- hasn't reached the first real stage yet.
  const currentIdx = status === 'Pending' ? -1 : ORDER_STAGES.indexOf(status);
  return (
    <div style={{ display: 'flex', padding: '20px 6px 8px', overflowX: 'auto' }}>
      {ORDER_STAGES.map((stage, i) => {
        const done = i <= currentIdx;
        const isLast = i === ORDER_STAGES.length - 1;
        return (
          <React.Fragment key={stage}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 82 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: done ? 'var(--gd)' : 'var(--card)',
                border: `2px solid ${done ? 'var(--gd)' : 'var(--line)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F2EFE4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', color: done ? 'var(--iv)' : 'var(--sm)', marginTop: 6, textAlign: 'center', lineHeight: 1.3 }}>{stage}</div>
            </div>
            {!isLast && <div style={{ flex: 1, height: 2, background: i < currentIdx ? 'var(--gd)' : 'var(--line)', marginTop: 10, minWidth: 20 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

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

export default function Account() {
  const { currentUser, userProfile, logout, refreshProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [tab, setTab] = useState(NAV_ITEMS.some(n => n.key === urlTab) ? urlTab : 'dashboard');
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // `tab` only ever read the URL once, on mount -- clicking a section link from
  // somewhere else on the page (the Navbar account dropdown) while already on
  // /account changes the URL but never re-synced the visible tab. This keeps them
  // in step whenever the URL's own tab param changes.
  useEffect(() => {
    const key = searchParams.get('tab');
    setTab(NAV_ITEMS.some(n => n.key === key) ? key : 'dashboard');
  }, [searchParams]);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      supabase.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
      supabase.from('enquiries').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    ]).then(([oRes, eRes]) => {
      setOrders(oRes.data || []);
      setEnquiries(eRes.data || []);
      setLoadingOrders(false);
    }).catch(() => setLoadingOrders(false)); // a network-level failure rejects instead of resolving with {error} -- without this the tab spins forever
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

  const statusCls = { Pending: 'badge-pending', Paid: 'badge-confirmed', Confirmed: 'badge-confirmed', Shipped: 'badge-shipped', 'Out for Delivery': 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-sold' };
  const wishlistCount = getWishlist().length;

  const navBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', padding: '17px 22px',
    fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13.5, letterSpacing: '.07em',
    background: active ? 'rgba(201,162,75,.09)' : 'transparent', color: active ? 'var(--gd)' : 'var(--iv)',
    border: 'none', borderLeft: `3px solid ${active ? 'var(--gd)' : 'transparent'}`,
    borderBottom: '1px solid var(--line)', cursor: 'pointer', textTransform: 'uppercase',
    transition: 'background .18s, color .18s',
  });

  // Mobile-only nav: a horizontally scrollable pill strip instead of the desktop list stretched full-width
  const navPill = (active) => ({
    display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, padding: '10px 15px',
    borderRadius: 20, border: `1px solid ${active ? 'var(--gd)' : 'var(--line)'}`,
    background: active ? 'var(--gd)' : 'var(--card)', color: active ? 'var(--text-dark)' : 'var(--iv)',
    fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.04em',
    textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--br)', padding: '54px 44px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 80% at 85% 50%, rgba(201,162,75,.06) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="section-label" style={{ color: 'var(--gd)' }}>Collector Account</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 300, color: 'var(--iv)', marginBottom: 4 }}>
            {userProfile?.name || currentUser.email?.split('@')[0] || 'Collector'}
          </h1>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,0.45)' }}>{currentUser.email}</div>
        </div>
      </div>

      <div className="container" style={{ padding: '44px 44px' }}>
        <div className="account-layout" style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 44, alignItems: 'start' }}>

          {/* SIDEBAR — desktop: vertical list, sticky */}
          <div className="account-sidebar" style={{ border: '1px solid var(--line)', background: 'var(--card)', boxShadow: '0 10px 34px rgba(30,27,20,.06)', position: 'sticky', top: 90 }}>
            {NAV_ITEMS.map(n => (
              <button key={n.key} onClick={() => selectTab(n.key)} style={navBtn(tab === n.key)}>
                <NavIcon name={n.key} />
                {n.label}
              </button>
            ))}
            <button onClick={handleLogout} style={{ ...navBtn(false), borderBottom: 'none', color: 'var(--tr)' }}>
              <NavIcon name="logout" />
              Log Out
            </button>
          </div>

          {/* SIDEBAR — mobile: horizontally scrollable pill strip, its own layout instead of the list above stretched full-width.
              Log Out isn't in this strip at all -- it's a separate, always-visible button at the bottom of the page. */}
          <div className="account-nav-mobile">
            <div className="account-nav-scroll">
              {NAV_ITEMS.map(n => (
                <button key={n.key} onClick={() => selectTab(n.key)} style={navPill(tab === n.key)}>
                  <NavIcon name={n.key} size={15} />
                  {n.label}
                </button>
              ))}
            </div>
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
                      {orders.map(o => {
                        const isExpanded = expandedOrderId === o.id;
                        return (
                        <React.Fragment key={o.id}>
                        <tr>
                          <td style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, color: 'var(--iv)' }}>{o.order_id || o.id.slice(-8).toUpperCase()}</td>
                          <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                          <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items?.map(i => i.name).join(', ') || '-'}</td>
                          <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 500 }}>{fmt(o.total)}</td>
                          <td><span className={`badge ${statusCls[o.status] || 'badge-pending'}`}>{o.status}</span></td>
                          <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: o.estimated_delivery ? 'var(--gd)' : 'var(--sm)', fontStyle: o.estimated_delivery ? 'normal' : 'italic' }}>{o.estimated_delivery || 'Pending'}</td>
                          <td>
                            <button onClick={() => setExpandedOrderId(isExpanded ? null : o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', color: 'var(--gd)', padding: 0 }}>
                              {isExpanded ? 'Hide' : 'Track'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)', padding: '4px 12px 14px' }}>
                              <OrderStageTracker status={o.status} />
                              <a href={`https://wa.me/918796988216?text=Order status query for ${o.order_id || o.id.slice(-8)}`} target="_blank" rel="noreferrer" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13.5, fontStyle: 'italic', color: 'rgba(106,99,80,.8)' }}>
                                Questions about this order? Message us on WhatsApp
                              </a>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                        );
                      })}
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

        {/* Mobile-only: Log Out at the very bottom of the page, below all tab content -- not mixed in with section navigation. */}
        <button onClick={handleLogout} className="account-logout-bottom" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', marginTop: 32, padding: '13px 15px', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--tr)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
          <NavIcon name="logout" size={15} />
          Log Out
        </button>
      </div>

      <style>{`
        .account-nav-mobile { display: none; }
        .account-nav-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .account-nav-scroll::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .account-layout { grid-template-columns: 1fr !important; }
          .account-sidebar { display: none !important; }
          /* min-width: 0 overrides the grid item's default auto min-width, which is based
             on its content's min-content size -- without it, the horizontally-scrolling nav
             strip's true (wider-than-screen) content width forces this whole grid column,
             and the page along with it, into horizontal overflow instead of staying
             contained with its own internal scrollbar. */
          .account-nav-mobile { display: block !important; min-width: 0; }
          .account-logout-bottom { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function DashboardTab({ userProfile, currentUser, orderCount, wishlistCount, onNav }) {
  return (
    <div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderTop: '2px solid var(--gd)', padding: '32px 30px', marginBottom: 26, boxShadow: '0 10px 30px rgba(30,27,20,.05)' }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 10.5, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 12 }}>Welcome Back</div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, color: 'var(--iv)', lineHeight: 1.75, fontStyle: 'italic', margin: 0 }}>
          Hello <strong style={{ fontStyle: 'normal' }}>{userProfile?.name || currentUser.email}</strong>. From here you can view your orders, manage your wishlist and addresses, link a gift card, browse active coupons, and edit your account details.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        {[['Orders', orderCount, 'orders'], ['Wishlist', wishlistCount, 'wishlist']].map(([label, count, key]) => (
          <button key={key} onClick={() => onNav(key)} style={{
            textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)', padding: '22px 24px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color .2s, box-shadow .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold50)'; e.currentTarget.style.boxShadow = '0 10px 26px rgba(30,27,20,.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,162,75,.1)', color: 'var(--gd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <NavIcon name={key} size={20} />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, color: 'var(--gd)', fontWeight: 500, lineHeight: 1 }}>{count}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--iv)', marginTop: 5 }}>{label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WishlistTab({ navigate }) {
  const [wl, setWl] = useState(getWishlist);
  const { addToCart } = useCartActions();
  function remove(product) { toggleSaved(product); setWl(wl.filter(p => p.id !== product.id)); toast.success('Removed.'); }
  if (!wl.length) return <div className="empty-state"><div>Nothing saved yet</div><button className="btn btn-gold btn-sm" style={{ marginTop: 20 }} onClick={() => navigate('/shop')}>Explore Collection</button></div>;
  return (
    <div className="grid-4">
      {wl.map(p => (
        <div key={p.id} className="product-card">
          <div style={{ height: 170, background: p.bg, cursor: 'none', overflow: 'hidden' }} onClick={() => navigate('/shop')}>
            {p.images?.[0] && <img src={cldThumb(p.images[0], 350)} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div className="product-card-body" style={{ padding: 13 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)', marginBottom: 9 }}>{p.enquiry_only ? <span style={{ fontStyle: 'italic', color: 'rgba(106,99,80,.88)', fontSize: 14 }}>Price on Enquiry</span> : fmt(p.price)}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {!p.enquiry_only && !isProductSoldOut(p) && <button className="btn btn-sm btn-gold" style={{ flex: 1 }} onClick={() => addToCart(productAddToCartPayload(p))}>Add to Cart</button>}
              <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Remove</button>
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
  const [balances, setBalances] = useState({});
  const [loadingBalances, setLoadingBalances] = useState(true);
  const cards = userProfile?.gift_cards || [];

  useEffect(() => {
    const codes = cards.map(c => c.code);
    if (codes.length === 0) { setLoadingBalances(false); return; }
    supabase.from('gift_cards').select('code, balance').in('code', codes).then(({ data }) => {
      const map = {};
      (data || []).forEach(g => { map[g.code] = g.balance; });
      setBalances(map);
      setLoadingBalances(false);
    }).catch(() => setLoadingBalances(false)); // a network-level failure rejects instead of resolving with {error} -- without this every card is stuck "Checking balance..."
    // eslint-disable-next-line
  }, [userProfile?.gift_cards]);

  async function linkCard() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { toast.error('Enter a gift card code.'); return; }
    if (cards.some(c => c.code === trimmed)) { toast.error('That code is already linked to your account.'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('gift_cards').select('code, balance').eq('code', trimmed).maybeSingle();
      if (error || !data) { toast.error('That code was not found.'); return; }
      await updateProfile({ gift_cards: [...cards, { code: trimmed, added_at: new Date().toISOString() }] });
      toast.success(`Gift card linked — ${fmt(data.balance)} available.`);
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
        Received a Tamarind Taless gift card? Link its code here to keep it on file and see its remaining balance. Apply it directly at checkout when you're ready to use it.
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
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--gd)', marginTop: 2 }}>
                  {loadingBalances ? 'Checking balance…' : balances[c.code] !== undefined ? `${fmt(balances[c.code])} available` : 'Balance unavailable'}
                </div>
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
      const { error } = await supabase.from('profiles').update({ addresses: newAddrs }).eq('id', currentUser.id);
      if (error) throw error;
      await refreshProfile();
      setForm({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
      toast.success('Address saved.');
    } catch { toast.error('Failed to save address.'); }
    finally { setSaving(false); }
  }

  async function deleteAddress(idx) {
    const newAddrs = addresses.filter((_, i) => i !== idx);
    const { error } = await supabase.from('profiles').update({ addresses: newAddrs }).eq('id', currentUser.id);
    if (error) { toast.error('Failed to remove address.'); return; }
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
