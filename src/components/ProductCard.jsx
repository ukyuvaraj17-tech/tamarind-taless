import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fmt } from '../data/products';
import { isSaved, toggleSaved } from '../utils/wishlist';
import BlurImage from './BlurImage';
import { cldThumb } from '../utils/cloudinary';
import toast from 'react-hot-toast';

export default function ProductCard({ product: p }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => isSaved(p.id));
  const isEnquiryOnly = p.enquiry_only || p.enquiryOnly;
  const isSoldOut = p.stock === 0;
  const img = p.images?.[0];

  function goToProduct() { navigate(`/product/${p.id}`); }

  function handleSave(e) {
    e.stopPropagation();
    const nowSaved = toggleSaved(p);
    setSaved(nowSaved);
    toast.success(nowSaved ? 'Saved for later.' : 'Removed from saved.');
  }

  return (
    <div className="product-card pc" style={{ cursor: 'none' }}>
      {/* IMAGE BLOCK */}
      <div className="product-card-img" style={{
        background: p.bg || 'linear-gradient(145deg, var(--card), var(--line))',
      }}>
        {img && <BlurImage src={cldThumb(img, 640)} alt={p.name} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.image_position || '50% 50%' }} />}

        {/* OVERLAY */}
        <div className="product-card-overlay" onClick={goToProduct}>
          <span>View Piece</span>
        </div>

        {/* BADGES */}
        <div className="product-card-badge" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {p.badge && <span className="badge badge-gold" style={{ fontSize: '9px', letterSpacing: '.12em' }}>{p.badge}</span>}
          {isSoldOut && <span className="badge badge-sold" style={{ fontSize: '9px' }}>Sold Out</span>}
        </div>

        {/* SAVE / PIN */}
        <button onClick={handleSave} title={saved ? 'Remove from saved' : 'Save for later'} style={{
          position: 'absolute', top: 14, right: 14, zIndex: 5,
          width: 26, height: 26, borderRadius: '50%', cursor: 'pointer',
          background: 'rgba(242,239,228,.9)', border: '1px solid rgba(33,29,20,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? 'var(--gd)' : 'none'} stroke="var(--gd)" strokeWidth="1.8">
            <path d="M5 3h14a1 1 0 011 1v17l-8-5-8 5V4a1 1 0 011-1z" />
          </svg>
        </button>

        {/* CARD NAME — on image */}
        <div className="product-card-name-wrap">
          <div className="product-card-cat">{p.cat}</div>
          <div className="product-card-name">{p.name}</div>
        </div>
      </div>

      {/* BODY */}
      <div className="product-card-body">
        {p.origin && <div className="product-card-origin">{p.origin}</div>}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--cr08)', paddingTop: 10, gap: 8 }}>
          {isSoldOut ? (
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sold Out</span>
          ) : isEnquiryOnly ? (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: 'italic', color: 'var(--iv)' }}>Price on Enquiry</span>
          ) : (
            <span className="product-card-price" style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:16, color:'var(--crimson)', fontWeight:400, letterSpacing:'.02em' }}>{fmt(p.price)}</span>
          )}

          <div className="product-card-actions">
            {!isSoldOut && isEnquiryOnly && (
              <a href={`https://wa.me/918796988216?text=${encodeURIComponent('I am interested in ' + p.name)}`} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm" style={{ textDecoration: 'none', fontSize: '10px', padding: '6px 10px' }}>
                Enquire
              </a>
            )}
            {!isSoldOut && !isEnquiryOnly && (
              <button className="btn btn-dark btn-sm" style={{ fontSize: '10px', padding: '6px 10px' }} onClick={() => addToCart(p)}>
                Add
              </button>
            )}
            <button style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '9.5px', letterSpacing: '.12em', textTransform: 'uppercase', padding: '6px 10px', background: 'transparent', color: 'var(--iv)', border: '1px solid var(--line)', cursor: 'none', transition: 'border-color .2s, color .2s', borderRadius: 2 }}
              onClick={goToProduct}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold50)'; e.currentTarget.style.color = 'var(--iv)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--iv50)'; }}
            >Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}
