import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fmt } from '../data/products';

export default function Confirmation() {
  const navigate = useNavigate();
  const order = JSON.parse(localStorage.getItem('tt_last_order') || '{}');

  return (
    <div style={{ paddingTop: 68, minHeight: '80vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* CHECK ICON */}
        <div style={{ width: 64, height: 64, background: 'var(--gd)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--br)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <div className="section-label" style={{ marginBottom: 7 }}>Order Placed</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px,6vw,62px)', fontWeight: 300, color: 'var(--iv)', fontStyle: 'italic', marginBottom: 14 }}>
          Thank You
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--iv)', lineHeight: 1.75, marginBottom: 28 }}>
          Your order has been received. We will reach out within 24 hours to confirm details and arrange delivery with care.
        </p>

        {/* ORDER DETAILS */}
        {order.orderId && (
          <div className="card-white" style={{ marginBottom: 26, textAlign: 'left' }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.18em', color: 'var(--iv)', marginBottom: 5, textTransform: 'uppercase' }}>Order ID</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: 'var(--iv)', letterSpacing: '0.04em', marginBottom: 13 }}>{order.orderId}</div>
            {order.items && (
              <>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '0.14em', color: 'var(--iv)', marginBottom: 7, textTransform: 'uppercase' }}>Items Ordered</div>
                {order.items.map((item, i) => (
                  <div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'var(--iv)', marginBottom: 2 }}>
                    {item.name} — Qty {item.qty}
                  </div>
                ))}
                {order.total && (
                  <div style={{ marginTop: 11, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'var(--iv)', fontWeight: 500 }}>
                    Total: {fmt(order.total)}
                  </div>
                )}
              </>
            )}
            {order.addr && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--iv)' }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '0.14em', color: 'var(--iv)', marginBottom: 5, textTransform: 'uppercase' }}>Delivery To</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: 'var(--iv)', lineHeight: 1.6 }}>
                  {order.addr.name}<br />
                  {order.addr.line1}{order.addr.line2 ? ', ' + order.addr.line2 : ''}<br />
                  {order.addr.city}, {order.addr.state} — {order.addr.pincode}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: 11, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`https://wa.me/918796988216?text=Confirming order ${order.orderId || ''}. Please share delivery timeline.`}
            target="_blank" rel="noreferrer"
            className="btn btn-wa"
            style={{ textDecoration: 'none' }}
          >
            Contact on WhatsApp
          </a>
          <button className="btn btn-outline" onClick={() => navigate('/account')}>View My Orders</button>
          <button className="btn btn-outline" onClick={() => navigate('/shop')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}
