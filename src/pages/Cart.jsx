import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fmt } from '../data/products';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartSubtotal } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const shipping = cartSubtotal > 50000 ? 0 : 500;

  return (
    <div style={{ paddingTop: 68, minHeight: '80vh', background: 'var(--bg)' }}>
      <div className="container" style={{ padding: '54px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 38 }}>
          <div>
            <div className="section-label">Your Selection</div>
            <h1 className="section-title" style={{ fontStyle: 'italic' }}>The Cart</h1>
          </div>
          {cart.length > 0 && (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(248,236,216,.88)' }}>
              {cart.reduce((s, i) => s + i.qty, 0)} piece{cart.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <div style={{ marginBottom: 8 }}>Your cart is empty</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(248,236,216,.88)', fontStyle: 'italic', marginBottom: 28 }}>Explore the collection to find pieces that resonate</div>
            <button className="btn btn-gold" onClick={() => navigate('/shop')}>Explore Collection</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr min(370px, 42%)', gap: 36, alignItems: 'start' }}>
            {/* ITEMS */}
            <div>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 18, padding: '22px 0', borderBottom: '1px solid rgba(212,197,176,0.4)' }}>
                  <div
                    style={{ width: 96, height: 96, background: item.bg, flexShrink: 0, cursor: 'none', overflow: 'hidden' }}
                    onClick={() => navigate('/shop')}
                  >
                    {item.images?.[0] && <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '0.14em', color: 'var(--gd)', marginBottom: 3 }}>{item.cat.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: 'var(--iv)', fontWeight: 500, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: 'rgba(248,236,216,.88)', fontStyle: 'italic', marginBottom: 11 }}>{item.origin}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          style={{ width: 27, height: 27, border: '1px solid var(--iv)', background: 'var(--card)', cursor: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--iv)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gd)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--iv)'}
                        >−</button>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: 'var(--iv)', minWidth: 17, textAlign: 'center' }}>{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          disabled={item.qty >= item.stock}
                          style={{ width: 27, height: 27, border: '1px solid var(--iv)', background: 'var(--card)', cursor: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--iv)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s', opacity: item.qty >= item.stock ? 0.4 : 1 }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gd)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--iv)'}
                        >+</button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'none', fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '0.12em', color: 'rgba(248,236,216,.88)', padding: 0, transition: 'color 0.2s', textTransform: 'uppercase' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--tr)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--sm)'}
                        >Remove</button>
                      </div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'var(--iv)', fontWeight: 500 }}>{fmt(item.price * item.qty)}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 18 }}>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/shop')}>Continue Shopping</button>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="card-white" style={{ position: 'sticky', top: 86 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.2em', color: 'var(--iv)', marginBottom: 20 }}>ORDER SUMMARY</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(248,236,216,.88)' }}>
                <span>Subtotal</span><span>{fmt(cartSubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--iv)', fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(248,236,216,.88)' }}>
                <span>Delivery</span><span>{shipping === 0 ? 'Free' : fmt(shipping)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22, fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: 'var(--iv)', fontWeight: 500 }}>
                <span>Total</span><span>{fmt(cartSubtotal + shipping)}</span>
              </div>
              {shipping > 0 && (
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: 'rgba(248,236,216,.88)', fontStyle: 'italic', marginBottom: 14 }}>Free delivery on orders above Rs. 50,000</div>
              )}
              <button
                className="btn btn-dark btn-full"
                onClick={() => {
                  if (!currentUser) { navigate('/login', { state: { from: { pathname: '/checkout' } } }); return; }
                  navigate('/checkout');
                }}
              >
                Proceed to Checkout
              </button>
              {!currentUser && (
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: 'rgba(248,236,216,.88)', fontStyle: 'italic', marginTop: 10, textAlign: 'center' }}>
                  You will be asked to login at checkout
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
