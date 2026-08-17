import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cldThumb } from '../utils/cloudinary';

// Rendered via toast.custom() from CartContext's addToCart -- a richer
// "added to cart" notification with a way to jump straight to the cart,
// instead of a plain text toast.
export default function CartToast({ t, product, label }) {
  const navigate = useNavigate();
  const img = product.images?.[0];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--card)', border: '1px solid var(--line)', borderLeft: '3px solid var(--gd)',
      padding: '13px 16px', minWidth: 320, maxWidth: 380,
      boxShadow: '0 14px 36px rgba(12,9,8,.22)',
      opacity: t.visible ? 1 : 0,
      transform: t.visible ? 'translateX(0)' : 'translateX(24px)',
      transition: 'opacity .25s ease, transform .25s ease',
    }}>
      {img ? (
        <img src={cldThumb(img, 100)} alt="" style={{ width: 46, height: 46, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 46, height: 46, flexShrink: 0, background: product.bg || 'var(--bg-hover)' }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--success)', marginBottom: 3 }}>{label}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'var(--iv)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}{product.size ? ` — ${product.size}` : ''}
        </div>
      </div>
      <button
        onClick={() => { toast.dismiss(t.id); navigate('/cart'); }}
        style={{
          background: 'var(--gd)', color: 'var(--text-dark)', border: 'none',
          padding: '9px 13px', fontFamily: "'Inter', sans-serif", fontWeight: 600,
          fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase',
          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        Go to Cart
      </button>
    </div>
  );
}
