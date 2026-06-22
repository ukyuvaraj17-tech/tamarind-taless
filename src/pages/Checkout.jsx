import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fmt } from '../data/products';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const { cart, cartSubtotal, clearCart } = useCart();
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

  const hasExisting = (userProfile?.addresses?.length || 0) > 0;
  const shipping = cartSubtotal > 50000 ? 0 : 500;

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
  const total = cartSubtotal + shipping;

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); }

  function validate() {
    if (useExisting && hasExisting) return true;
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.line1.trim()) e.line1 = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (!form.pincode.trim()) e.pincode = 'Required';
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

      // Save new address if checkbox checked
      const saveCb = document.getElementById('saveAddr');
      if (saveCb?.checked && !useExisting) {
        const newAddrs = [...(userProfile?.addresses || []), addr];
        await supabase.from('profiles').update({ addresses: newAddrs }).eq('id', currentUser.id);
        await refreshProfile();
      }

      const orderId = 'TT' + Date.now().toString().slice(-8).toUpperCase();
      const orderData = {
        order_id: orderId,
        user_id: currentUser.id,
        user_email: currentUser.email,
        user_name: userProfile?.name || form.name,
        user_phone: form.phone || userProfile?.phone,
        address: addr,
        items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, cat: i.cat })),
        subtotal: cartSubtotal, shipping, total,
        payment_method: payMethod,
        status: 'Pending',
      };

      const { error } = await supabase.from('orders').insert(orderData);
      if (error) throw error;

      // WhatsApp seller notification
      const waItems = cart.map(i => `${i.name} x${i.qty}`).join(', ');
      const waMsg = `New Order!\nID: ${orderId}\nCustomer: ${addr.name}\nPhone: ${addr.phone}\nItems: ${waItems}\nTotal: ${fmt(total)}\nPayment: ${payMethod === 'razorpay' ? 'Online' : 'WhatsApp/COD'}`;
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

  if (!currentUser) { navigate('/login', { state: { from: { pathname: '/checkout' } } }); return null; }
  if (cart.length === 0) { navigate('/cart'); return null; }

  const inputStyle = (field) => ({ width: '100%', padding: '11px 0', border: 'none', borderBottom: `1px solid ${errors[field] ? 'var(--tr)' : '#D4C5B0'}`, background: 'transparent', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', outline: 'none' });

  return (
    <div style={{ paddingTop: 68, minHeight: '80vh', background: 'var(--bg)' }}>
      <div className="container" style={{ padding: '54px 44px' }}>
        <div style={{ marginBottom: 38 }}>
          <div className="section-label">Complete Your Order</div>
          <h1 className="section-title" style={{ fontStyle: 'italic' }}>Checkout</h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr min(370px,42%)', gap: 36, alignItems: 'start' }}>
          <div>
            {/* ADDRESS */}
            <div className="card-white" style={{ marginBottom: 18 }}>
              <div className="section-label" style={{ marginBottom: 20 }}>Delivery Address <span style={{ color: 'var(--tr)' }}>*Required</span></div>
              {hasExisting && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'none', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(248,236,216,.88)' }}>
                      <input type="radio" checked={useExisting} onChange={() => setUseExisting(true)} style={{ accentColor: 'var(--gd)' }} /> Use Saved
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'none', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(248,236,216,.88)' }}>
                      <input type="radio" checked={!useExisting} onChange={() => setUseExisting(false)} style={{ accentColor: 'var(--gd)' }} /> New Address
                    </label>
                  </div>
                  {useExisting && userProfile.addresses.map((addr, i) => (
                    <div key={i} onClick={() => setSelectedAddrIdx(i)} style={{ border: `2px solid ${selectedAddrIdx === i ? 'var(--gd)' : 'var(--iv)'}`, padding: 14, marginBottom: 8, cursor: 'none', background: selectedAddrIdx === i ? 'rgba(200,169,110,0.04)' : 'transparent' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--iv)', lineHeight: 1.7 }}>
                        <strong>{addr.name}</strong> — {addr.phone}<br />{addr.line1}, {addr.city}, {addr.state} — {addr.pincode}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(!useExisting || !hasExisting) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  {[['Full Name *','name','text',false],['Phone *','phone','tel',false],['Email *','email','email',true],['Address Line 1 *','line1','text',true],['Address Line 2','line2','text',true],['City *','city','text',false],['State *','state','text',false],['Pincode *','pincode','text',false]].map(([label,key,type,full]) => (
                    <div key={key} style={{ gridColumn: full ? '1/-1' : 'auto' }}>
                      <div className="form-label">{label}</div>
                      <input type={type} value={form[key]} onChange={e => setF(key, e.target.value)} style={inputStyle(key)} onFocus={e => e.target.style.borderBottomColor = 'var(--gd)'} onBlur={e => e.target.style.borderBottomColor = errors[key] ? 'var(--tr)' : '#D4C5B0'} />
                      {errors[key] && <div className="form-error">{errors[key]}</div>}
                    </div>
                  ))}
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="saveAddr" style={{ accentColor: 'var(--gd)', cursor: 'none' }} />
                    <label htmlFor="saveAddr" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(248,236,216,.88)', cursor: 'none' }}>Save this address</label>
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT */}
            <div className="card-white">
              <div className="section-label" style={{ marginBottom: 20 }}>Payment Method</div>
              {[['razorpay','Pay Online','UPI, Cards, Net Banking via Razorpay'],['whatsapp','Confirm via WhatsApp','Order details sent to seller — payment arranged directly']].map(([val,title,sub]) => (
                <div key={val} className={`payment-card ${payMethod === val ? 'selected' : ''}`} onClick={() => setPayMethod(val)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className={`payment-radio ${payMethod === val ? 'checked' : ''}`}></div>
                    <div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.12em', color: 'var(--iv)' }}>{title}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(248,236,216,.88)' }}>{sub}</div>
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
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.2em', color: 'var(--iv)', marginBottom: 18, textTransform: 'uppercase' }}>Your Order</div>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 11, marginBottom: 12 }}>
                <div style={{ width: 46, height: 46, background: item.bg, flexShrink: 0, overflow: 'hidden' }}>
                  {item.images?.[0] && <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--iv)' }}>{item.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(248,236,216,.88)' }}>Qty: {item.qty}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'var(--iv)' }}>{fmt(item.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(248,236,216,.88)' }}><span>Subtotal</span><span>{fmt(cartSubtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'rgba(248,236,216,.88)' }}><span>Delivery</span><span>{shipping === 0 ? 'Free' : fmt(shipping)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'var(--iv)', fontWeight: 500 }}><span>Total</span><span>{fmt(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
