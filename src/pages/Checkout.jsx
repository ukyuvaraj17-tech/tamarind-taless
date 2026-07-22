import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBrand } from '../context/BrandContext';
import { fmt } from '../data/products';
import { getCartDeliveryRange } from '../utils/delivery';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [useExisting, setUseExisting] = useState((userProfile?.addresses?.length || 0) > 0);
  const [selectedAddrIdx, setSelectedAddrIdx] = useState(0);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: userProfile?.name || '', phone: userProfile?.phone || '',
    email: currentUser?.email || '', line1: '', line2: '', city: '', state: '', pincode: '',
  });
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [applyingGiftCard, setApplyingGiftCard] = useState(false);

  const hasExisting = (userProfile?.addresses?.length || 0) > 0;
  const shipping = cartSubtotal > 50000 ? 0 : 500;
  const shippingCity = (useExisting && hasExisting) ? userProfile.addresses[selectedAddrIdx]?.city : form.city;
  const deliveryEstimate = getCartDeliveryRange(cart, brand, shippingCity);
  const discount = appliedCoupon
    ? (appliedCoupon.type === 'percent'
        ? Math.round(cartSubtotal * (Number(appliedCoupon.value) / 100))
        : Math.min(Number(appliedCoupon.value), cartSubtotal))
    : 0;
  const giftCardApplied = appliedGiftCard
    ? Math.min(Number(appliedGiftCard.balance), Math.max(cartSubtotal + shipping - discount, 0))
    : 0;

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    try {
      const { data, error } = await supabase.from('coupons').select('*').eq('code', code).eq('active', true).maybeSingle();
      if (error || !data) { toast.error('Invalid or expired coupon code.'); setAppliedCoupon(null); return; }
      const cartProductIds = cart.filter(i => !i.isGiftCard).map(i => i.id);
      if (data.applies_to === 'products') {
        const matches = (data.product_ids || []).some(id => cartProductIds.includes(id));
        if (!matches) { toast.error("This coupon doesn't apply to the items in your cart."); setAppliedCoupon(null); return; }
      } else if (data.applies_to === 'bundle') {
        const need = data.product_ids || [];
        const matchCount = need.filter(id => cartProductIds.includes(id)).length;
        if (matchCount < need.length) { toast.error(`This coupon needs all ${need.length} bundle items in your cart.`); setAppliedCoupon(null); return; }
      }
      setAppliedCoupon(data);
      toast.success('Coupon applied.');
    } finally { setApplyingCoupon(false); }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
  }

  async function applyGiftCard() {
    const code = giftCardCode.trim().toUpperCase();
    if (!code) return;
    setApplyingGiftCard(true);
    try {
      const { data, error } = await supabase.from('gift_cards').select('*').eq('code', code).maybeSingle();
      if (error || !data) { toast.error('Invalid gift card code.'); setAppliedGiftCard(null); return; }
      if (Number(data.balance) <= 0) { toast.error('This gift card has no remaining balance.'); setAppliedGiftCard(null); return; }
      setAppliedGiftCard(data);
      toast.success(`Gift card applied — ${fmt(data.balance)} available.`);
    } finally { setApplyingGiftCard(false); }
  }

  function removeGiftCard() {
    setAppliedGiftCard(null);
    setGiftCardCode('');
  }

  // Sync form and useExisting when userProfile loads asynchronously after render
  useEffect(() => {
    if (!userProfile) return;
    if ((userProfile.addresses?.length || 0) > 0) setUseExisting(true);
    setForm(f => ({
      ...f,
      name: f.name || userProfile.name || '',
      phone: f.phone || userProfile.phone || '',
    }));
  }, [userProfile]);
  const total = cartSubtotal + shipping - discount - giftCardApplied;

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); }
  function setB(k, v) { setBilling(b => ({ ...b, [k]: v })); setErrors(e => ({ ...e, ['b_' + k]: '' })); }

  function validate() {
    const e = {};
    if (!(useExisting && hasExisting)) {
      if (!form.name.trim()) e.name = 'Required';
      if (!form.phone.trim()) e.phone = 'Required';
      if (!form.email.trim()) e.email = 'Required';
      if (!form.line1.trim()) e.line1 = 'Required';
      if (!form.city.trim()) e.city = 'Required';
      if (!form.state.trim()) e.state = 'Required';
      if (!form.pincode.trim()) e.pincode = 'Required';
    }
    if (!billingSame) {
      if (!billing.name.trim()) e.b_name = 'Required';
      if (!billing.line1.trim()) e.b_line1 = 'Required';
      if (!billing.city.trim()) e.b_city = 'Required';
      if (!billing.state.trim()) e.b_state = 'Required';
      if (!billing.pincode.trim()) e.b_pincode = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder() {
    if (!validate()) { toast.error('Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      const addr = useExisting && hasExisting
        ? userProfile.addresses[selectedAddrIdx]
        : { name: form.name, phone: form.phone, line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode };
      const billAddr = billingSame ? addr : { ...billing, phone: billing.phone || addr.phone };

      // Save new address if checkbox checked (logged-in users only)
      const saveCb = document.getElementById('saveAddr');
      if (saveCb?.checked && !useExisting && currentUser) {
        const newAddrs = [...(userProfile?.addresses || []), addr];
        await supabase.from('profiles').update({ addresses: newAddrs }).eq('id', currentUser.id);
        await refreshProfile();
      }

      const orderId = 'TT' + Date.now().toString().slice(-8).toUpperCase();
      const orderData = {
        order_id: orderId,
        user_id: currentUser?.id || null,
        user_email: currentUser?.email || form.email,
        user_name: userProfile?.name || form.name,
        user_phone: form.phone || userProfile?.phone,
        address: { ...addr, billing: billAddr },
        items: cart.map(i => ({
          id: i.id, name: i.name, qty: i.qty, price: i.price, cat: i.cat, size: i.size || null,
          ...(i.isGiftCard ? { isGiftCard: true, giftCode: i.giftCode, recipientName: i.recipientName || null, recipientEmail: i.recipientEmail || null, giftMessage: i.giftMessage || null } : {}),
        })),
        subtotal: cartSubtotal, shipping, total,
        coupon_code: appliedCoupon?.code || null, discount,
        gift_card_code: appliedGiftCard?.code || null, gift_card_applied: giftCardApplied,
        payment_method: payMethod,
        status: 'Pending',
        estimated_delivery: deliveryEstimate?.label || null,
      };

      const { error } = await supabase.from('orders').insert(orderData);
      if (error) throw error;

      // Create a real, redeemable balance for any gift card(s) just purchased in this order.
      const giftCardItems = cart.filter(i => i.isGiftCard);
      if (giftCardItems.length > 0) {
        await supabase.from('gift_cards').insert(giftCardItems.map(i => ({
          code: i.giftCode, initial_value: i.price, balance: i.price, order_id: orderId,
          purchaser_email: currentUser?.email || form.email,
          recipient_name: i.recipientName || null, recipient_email: i.recipientEmail || null, message: i.giftMessage || null,
        })));
      }

      // Atomically deduct the balance actually used to pay for this order (safe under
      // concurrent checkouts -- the DB function only deducts if enough balance remains).
      if (appliedGiftCard && giftCardApplied > 0) {
        const { error: redeemError } = await supabase.rpc('redeem_gift_card', { p_code: appliedGiftCard.code, p_amount: giftCardApplied });
        if (redeemError) console.error('Gift card redemption failed:', redeemError);
      }

      // WhatsApp seller notification
      const waItems = cart.map(i => `${i.name}${i.size ? ' (' + i.size + ')' : ''} x${i.qty}`).join(', ');
      const waCoupon = appliedCoupon ? `\nCoupon: ${appliedCoupon.code} (-${fmt(discount)})` : '';
      const waGift = appliedGiftCard ? `\nGift Card: ${appliedGiftCard.code} (-${fmt(giftCardApplied)})` : '';
      const waMsg = `New Order!\nID: ${orderId}\nCustomer: ${addr.name}\nPhone: ${addr.phone}\nItems: ${waItems}${waCoupon}${waGift}\nTotal: ${fmt(total)}\nPayment: ${payMethod === 'razorpay' ? 'Online' : 'WhatsApp/COD'}`;
      window.open(`https://wa.me/918796988216?text=${encodeURIComponent(waMsg)}`, '_blank');

      localStorage.setItem('tt_last_order', JSON.stringify({ orderId, items: cart, total, addr }));
      clearCart();

      if (payMethod === 'razorpay' && process.env.REACT_APP_PAYMENT_URL && !process.env.REACT_APP_PAYMENT_URL.includes('your-link')) {
        window.location.href = process.env.REACT_APP_PAYMENT_URL;
      } else {
        navigate('/confirmation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
    } finally { setLoading(false); }
  }

  if (cart.length === 0) { navigate('/cart'); return null; }

  const inputStyle = (field) => ({ width: '100%', padding: '11px 0', border: 'none', borderBottom: `1px solid ${errors[field] ? 'var(--tr)' : '#D3CCB9'}`, background: 'transparent', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', outline: 'none' });

  return (
    <div style={{ paddingTop: 68, minHeight: '80vh', background: 'var(--bg)' }}>
      <div className="container" style={{ padding: '54px 44px' }}>
        <div style={{ marginBottom: 38 }}>
          <div className="section-label">Complete Your Order</div>
          <h1 className="section-title" style={{ fontStyle: 'italic' }}>Checkout</h1>
        </div>
        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr min(370px,42%)', gap: 36, alignItems: 'start' }}>
          <div>
            {/* GUEST NOTICE */}
            {!currentUser && (
              <div className="card-white" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)' }}>Checking out as a guest. Have an account?</div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })}>Sign In</button>
              </div>
            )}

            {/* SHIPPING ADDRESS */}
            <div className="card-white" style={{ marginBottom: 18 }}>
              <div className="section-label" style={{ marginBottom: 20 }}>Shipping Address <span style={{ color: 'var(--tr)' }}>*Required</span></div>
              {hasExisting && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(106,99,80,.88)' }}>
                      <input type="radio" checked={useExisting} onChange={() => setUseExisting(true)} style={{ accentColor: 'var(--gd)' }} /> Use Saved
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(106,99,80,.88)' }}>
                      <input type="radio" checked={!useExisting} onChange={() => setUseExisting(false)} style={{ accentColor: 'var(--gd)' }} /> New Address
                    </label>
                  </div>
                  {useExisting && userProfile.addresses.map((addr, i) => (
                    <div key={i} onClick={() => setSelectedAddrIdx(i)} style={{ border: `2px solid ${selectedAddrIdx === i ? 'var(--gd)' : 'var(--iv)'}`, padding: 14, marginBottom: 8, cursor: 'none', background: selectedAddrIdx === i ? 'rgba(33,29,20,0.04)' : 'transparent' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', lineHeight: 1.7 }}>
                        <strong>{addr.name}</strong>, {addr.phone}<br />{addr.line1}, {addr.city}, {addr.state}, {addr.pincode}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(!useExisting || !hasExisting) && (
                <div className="checkout-addr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  {[['Full Name *','name','text',false],['Phone *','phone','tel',false],['Email *','email','email',true],['Address Line 1 *','line1','text',true],['Address Line 2','line2','text',true],['City *','city','text',false],['State *','state','text',false],['Pincode *','pincode','text',false]].map(([label,key,type,full]) => (
                    <div key={key} style={{ gridColumn: full ? '1/-1' : 'auto' }}>
                      <div className="form-label">{label}</div>
                      <input type={type} value={form[key]} onChange={e => setF(key, e.target.value)} style={inputStyle(key)} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = errors[key] ? 'var(--tr)' : '#D3CCB9'} />
                      {errors[key] && <div className="form-error">{errors[key]}</div>}
                    </div>
                  ))}
                  {currentUser && (
                    <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id="saveAddr" style={{ accentColor: 'var(--gd)', cursor: 'none' }} />
                      <label htmlFor="saveAddr" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,.88)', cursor: 'none' }}>Save this address</label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BILLING ADDRESS */}
            <div className="card-white" style={{ marginBottom: 18 }}>
              <div className="section-label" style={{ marginBottom: 16 }}>Billing Address</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: billingSame ? 0 : 18 }}>
                <input type="checkbox" id="billSame" checked={billingSame} onChange={e => setBillingSame(e.target.checked)} style={{ accentColor: 'var(--gd)', width: 16, height: 16, cursor: 'pointer' }} />
                <label htmlFor="billSame" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', cursor: 'pointer' }}>Same as shipping address</label>
              </div>
              {!billingSame && (
                <div className="checkout-addr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  {[['Full Name *','name','text',false],['Phone','phone','tel',false],['Address Line 1 *','line1','text',true],['Address Line 2','line2','text',true],['City *','city','text',false],['State *','state','text',false],['Pincode *','pincode','text',false]].map(([label,key,type,full]) => (
                    <div key={key} style={{ gridColumn: full ? '1/-1' : 'auto' }}>
                      <div className="form-label">{label}</div>
                      <input type={type} value={billing[key]} onChange={e => setB(key, e.target.value)} style={inputStyle('b_' + key)} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = errors['b_' + key] ? 'var(--tr)' : '#D3CCB9'} />
                      {errors['b_' + key] && <div className="form-error">{errors['b_' + key]}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAYMENT */}
            <div className="card-white">
              <div className="section-label" style={{ marginBottom: 20 }}>Payment Method</div>
              {[['razorpay','Pay Online','UPI, Cards, Net Banking via Razorpay'],['whatsapp','Confirm via WhatsApp','Order details sent to seller, payment arranged directly']].map(([val,title,sub]) => (
                <div key={val} className={`payment-card ${payMethod === val ? 'selected' : ''}`} onClick={() => setPayMethod(val)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className={`payment-radio ${payMethod === val ? 'checked' : ''}`}></div>
                    <div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', color: 'var(--iv)' }}>{title}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,.88)' }}>{sub}</div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn btn-dark btn-full" style={{ marginTop: 20 }} onClick={placeOrder} disabled={loading}>
                {loading ? <span className="spinner"></span> : payMethod === 'razorpay' ? 'Proceed to Payment' : 'Confirm via WhatsApp'}
              </button>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="card-white" style={{ position: 'sticky', top: 86 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.2em', color: 'var(--iv)', marginBottom: 18, textTransform: 'uppercase' }}>Your Order</div>
            {cart.map(item => (
              <div key={item.id + (item.size || '')} style={{ display: 'flex', gap: 11, marginBottom: 12 }}>
                <div style={{ width: 46, height: 46, background: item.bg, flexShrink: 0, overflow: 'hidden' }}>
                  {item.images?.[0] && <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)' }}>{item.name}{item.size ? ` — ${item.size}` : ''}</div>
                  {item.isGiftCard && (
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12.5, color: 'rgba(106,99,80,.7)', fontStyle: 'italic' }}>
                      {item.giftCode}{item.recipientName ? ` — for ${item.recipientName}` : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(106,99,80,.88)' }}>Qty: {item.qty}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)' }}>{fmt(item.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
            <hr className="divider" />

            {/* COUPON */}
            <div style={{ marginBottom: 18 }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(107,142,80,.1)', borderLeft: '3px solid var(--success)', padding: '9px 12px' }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '.06em', color: 'var(--success)' }}>{appliedCoupon.code} applied</span>
                  <button onClick={removeCoupon} style={{ background: 'none', border: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(106,99,80,.7)', cursor: 'pointer', padding: 0 }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                    placeholder="Coupon code"
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid #D3CCB9', background: 'transparent', fontFamily: "'Inter',sans-serif", fontSize: 13, letterSpacing: '.04em', color: 'var(--iv)', outline: 'none', textTransform: 'uppercase' }}
                  />
                  <button onClick={applyCoupon} disabled={applyingCoupon || !couponCode.trim()} className="btn btn-outline btn-sm" style={{ opacity: applyingCoupon || !couponCode.trim() ? 0.5 : 1 }}>
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* GIFT CARD BALANCE */}
            <div style={{ marginBottom: 18 }}>
              {appliedGiftCard ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(107,142,80,.1)', borderLeft: '3px solid var(--success)', padding: '9px 12px' }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: '.06em', color: 'var(--success)' }}>{appliedGiftCard.code} — {fmt(appliedGiftCard.balance)} available</span>
                  <button onClick={removeGiftCard} style={{ background: 'none', border: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(106,99,80,.7)', cursor: 'pointer', padding: 0 }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={giftCardCode}
                    onChange={e => setGiftCardCode(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyGiftCard(); } }}
                    placeholder="Gift card code"
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid #D3CCB9', background: 'transparent', fontFamily: "'Inter',sans-serif", fontSize: 13, letterSpacing: '.04em', color: 'var(--iv)', outline: 'none', textTransform: 'uppercase' }}
                  />
                  <button onClick={applyGiftCard} disabled={applyingGiftCard || !giftCardCode.trim()} className="btn btn-outline btn-sm" style={{ opacity: applyingGiftCard || !giftCardCode.trim() ? 0.5 : 1 }}>
                    {applyingGiftCard ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,.88)' }}><span>Subtotal</span><span>{fmt(cartSubtotal)}</span></div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--success)' }}><span>Discount</span><span>-{fmt(discount)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: giftCardApplied > 0 ? 8 : 18, fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(106,99,80,.88)' }}><span>Delivery</span><span>{shipping === 0 ? 'Free' : fmt(shipping)}</span></div>
            {giftCardApplied > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--success)' }}><span>Gift Card</span><span>-{fmt(giftCardApplied)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'var(--iv)', fontWeight: 500 }}><span>Total</span><span>{fmt(total)}</span></div>
            {deliveryEstimate && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 9 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gd)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                </svg>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontStyle: 'italic', color: 'rgba(106,99,80,.88)' }}>
                  Estimated delivery: <strong style={{ color: 'var(--iv)', fontStyle: 'normal' }}>{deliveryEstimate.label}</strong>{shippingCity ? '' : ' (enter your city for an exact estimate)'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-addr-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
      `}</style>
    </div>
  );
}
