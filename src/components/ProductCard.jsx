import React from 'react';
import { useCart } from '../context/CartContext';
import { fmt } from '../data/products';

export default function ProductCard({ product: p, onViewDetail, height = 260 }) {
  const { addToCart } = useCart();
  const isEnquiryOnly = p.enquiry_only || p.enquiryOnly;
  const isSoldOut = p.stock === 0;
  const isLimited = p.stock === 1;
  const img = p.images?.[0];

  return (
    <div className="product-card pc" style={{ cursor: 'none' }}>
      {/* IMAGE BLOCK */}
      <div className="product-card-img" style={{
        height,
        background: p.bg || 'linear-gradient(145deg, var(--card), var(--line))',
        minHeight: height,
      }}>
        {img && <img src={img} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}

        {/* OVERLAY */}
        <div className="product-card-overlay" onClick={() => onViewDetail?.(p)}>
          <span>View Piece</span>
        </div>

        {/* BADGES */}
        <div className="product-card-badge" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {p.badge && <span className="badge badge-gold" style={{ fontSize: '6px', letterSpacing: '.12em' }}>{p.badge}</span>}
          {isSoldOut && <span className="badge badge-sold" style={{ fontSize: '6px' }}>Sold Out</span>}
          {!isSoldOut && isLimited && <span className="badge badge-stock" style={{ fontSize: '6px' }}>Last 1</span>}
        </div>

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
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#555' }}>Sold Out</span>
          ) : isEnquiryOnly ? (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: 'italic', color: 'var(--iv)' }}>Price on Enquiry</span>
          ) : (
            <span className="product-card-price" style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:16, color:'var(--crimson)', fontWeight:400, letterSpacing:'.02em' }}>{fmt(p.price)}</span>
          )}

          <div className="product-card-actions">
            {!isSoldOut && isEnquiryOnly && (
              <a href={`https://wa.me/918796988216?text=${encodeURIComponent('I am interested in ' + p.name)}`} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm" style={{ textDecoration: 'none', fontSize: '7px', padding: '6px 10px' }}>
                Enquire
              </a>
            )}
            {!isSoldOut && !isEnquiryOnly && (
              <button className="btn btn-dark btn-sm" style={{ fontSize: '7px', padding: '6px 10px' }} onClick={() => addToCart(p)}>
                Add
              </button>
            )}
            <button style={{ fontFamily: "'Cinzel', serif", fontSize: '6.5px', letterSpacing: '.12em', textTransform: 'uppercase', padding: '6px 10px', background: 'transparent', color: 'var(--iv)', border: '1px solid var(--line)', cursor: 'none', transition: 'border-color .2s, color .2s', borderRadius: 2 }}
              onClick={() => onViewDetail?.(p)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold50)'; e.currentTarget.style.color = 'var(--iv)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--iv50)'; }}
            >Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}
