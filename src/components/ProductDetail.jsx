import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { fmt } from '../data/products';

export default function ProductDetail({ product, onClose }) {
  const { addToCart } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const open = !!product;

  React.useEffect(() => { setActiveImg(0); setLightbox(false); }, [product?.id]);

  const isEnquiryOnly = product?.enquiry_only || product?.enquiryOnly;
  const isSoldOut = product?.stock === 0;
  const isLimited = product?.stock === 1;
  const images = product?.images || [];

  const S = {
    eyebrow: { fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--gd)' },
    title: { fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:'var(--iv)', fontWeight:400, lineHeight:1.05 },
    sub: { fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:'rgba(248,236,216,.85)', fontStyle:'italic' },
    body: { fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:'var(--iv)', lineHeight:1.85 },
    label: { fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--gd)', display:'block', marginBottom:6 },
  };

  return (
    <>
      {/* OVERLAY */}
      <div className={`detail-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      {/* PANEL */}
      <div className={`detail-panel ${open ? 'open' : ''}`}>
        {product && (
          <>
            {/* STICKY HEADER */}
            <div style={{ background:'var(--nav)', padding:'14px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, borderBottom:'1px solid var(--line)' }}>
              <div>
                <div style={S.eyebrow}>{product.cat}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:'var(--iv)', marginTop:2 }}>{product.name}</div>
              </div>
              <button onClick={onClose} style={{ background:'none', border:'none', cursor:'none', color:'rgba(248,236,216,.6)', fontSize:24, lineHeight:1, padding:'4px 8px', transition:'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--iv)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,236,216,.6)'}
              >×</button>
            </div>

            {/* MAIN IMAGE — clickable to open lightbox */}
            <div style={{ width:'100%', aspectRatio:'1', background: product.bg || 'var(--card)', position:'relative', overflow:'hidden', cursor:'none' }}
              onClick={() => images.length > 0 && setLightbox(true)}
            >
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'opacity .3s' }} />
              ) : (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'rgba(255,255,255,.06)', fontStyle:'italic', padding:32 }}>{product.name}</div>
              )}
              {/* ZOOM HINT */}
              {images.length > 0 && (
                <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(8,4,8,.6)', padding:'5px 10px', fontFamily:"'Cinzel',serif", fontSize:7, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(248,236,216,.6)' }}>
                  Tap to expand
                </div>
              )}
              {/* BADGES */}
              <div style={{ position:'absolute', top:14, left:14, display:'flex', flexDirection:'column', gap:5, zIndex:2 }}>
                {product.badge && <span className="badge badge-gold">{product.badge}</span>}
                {isSoldOut && <span className="badge badge-sold">Sold Out</span>}
                {!isSoldOut && isLimited && <span className="badge badge-stock">Only 1 Available</span>}
                {isEnquiryOnly && !isSoldOut && <span className="badge badge-enquiry">Price on Enquiry</span>}
              </div>
            </div>

            {/* THUMBNAILS — all clickable, all open lightbox at that index */}
            {images.length > 1 && (
              <div style={{ display:'flex', gap:5, padding:'8px 22px', overflowX:'auto', background:'var(--card)', borderBottom:'1px solid var(--line)' }}>
                {images.map((url, i) => (
                  <div key={i}
                    onClick={() => { setActiveImg(i); setLightbox(true); }}
                    style={{ flexShrink:0, width:68, height:68, overflow:'hidden', cursor:'none', border:`2px solid ${activeImg === i ? 'var(--gd)' : 'rgba(96,16,32,.5)'}`, opacity: activeImg === i ? 1 : 0.55, transition:'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.borderColor='var(--gold50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity= i === activeImg ? '1':'0.55'; e.currentTarget.style.borderColor= i === activeImg ? 'var(--gd)':'rgba(96,16,32,.5)'; }}
                  >
                    <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* BODY */}
            <div style={{ padding:'26px 22px' }}>
              <div style={S.eyebrow}>{product.origin}</div>
              <h2 style={{ ...S.title, margin:'6px 0 5px' }}>{product.name}</h2>
              {product.subtitle && <div style={S.sub}>{product.subtitle}</div>}

              {/* PRICE */}
              <div style={{ margin:'18px 0 22px', paddingBottom:18, borderBottom:'1px solid var(--line)' }}>
                {isSoldOut ? (
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.15em', color:'rgba(248,236,216,.88)', textTransform:'uppercase' }}>Sold Out</div>
                ) : isEnquiryOnly ? (
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:'var(--gd)', fontStyle:'italic' }}>Price available on enquiry</div>
                ) : (
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:'var(--crimson)', fontWeight:400 }}>{fmt(product.price)}</div>
                )}
              </div>

              {/* STORY */}
              {product.story && (
                <>
                  <div style={{ ...S.label, marginBottom:10 }}>The Story Behind This Piece</div>
                  <p style={{ ...S.body, marginBottom:14 }}>{product.story}</p>
                </>
              )}
              {product.together && (
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:14, color:'rgba(248,236,216,.85)', lineHeight:1.75, fontStyle:'italic', marginBottom:22 }}>{product.together}</p>
              )}

              {/* SPECS */}
              {(product.material || product.dimensions || product.weight || product.origin) && (
                <div style={{ background:'var(--card)', padding:'16px 18px', marginBottom:22, border:'1px solid rgba(212,160,64,.80)' }}>
                  <div style={{ ...S.label, marginBottom:12 }}>Specifications</div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    {[['Material', product.material], ['Dimensions', product.dimensions], ['Weight', product.weight], ['Origin', product.origin]].filter(([,v]) => v).map(([k,v]) => (
                      <tr key={k} style={{ borderBottom:'1px solid rgba(212,160,64,.15)' }}>
                        <td style={{ fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:'.1em', color:'var(--gd)', padding:'8px 0', textTransform:'uppercase', width:'36%' }}>{k}</td>
                        <td style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:'var(--iv)', padding:'8px 0', fontWeight:400 }}>{v}</td>
                      </tr>
                    ))}
                  </table>
                </div>
              )}

              {/* ACTIONS */}
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {isSoldOut ? (
                  <button className="btn btn-full" style={{ background:'rgba(255,255,255,.08)', color:'rgba(248,236,216,.88)', cursor:'not-allowed', fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', padding:14, border:'none' }} disabled>Sold Out</button>
                ) : isEnquiryOnly ? (
                  <a href={`https://wa.me/918796988216?text=${encodeURIComponent('I am interested in ' + product.name + ' — ' + (product.material || '') + ', ' + (product.origin || '') + '. Please share details and pricing.')}`} target="_blank" rel="noreferrer" className="btn btn-full btn-wa" style={{ textDecoration:'none' }}>Enquire on WhatsApp</a>
                ) : (
                  <>
                    <button className="btn btn-full btn-dark" onClick={() => addToCart(product)}>Add to Cart</button>
                    <a href={`https://wa.me/918796988216?text=${encodeURIComponent('I am interested in ' + product.name + ' — ' + fmt(product.price) + '. Please share more details.')}`} target="_blank" rel="noreferrer" className="btn btn-full btn-wa" style={{ textDecoration:'none' }}>Enquire on WhatsApp</a>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── LIGHTBOX — full screen image viewer ── */}
      {lightbox && images.length > 0 && (
        <div style={{ position:'fixed', inset:0, background:'rgba(4,2,4,.96)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}
          onClick={() => setLightbox(false)}
        >
          {/* CLOSE */}
          <button onClick={() => setLightbox(false)} style={{ position:'absolute', top:18, right:22, background:'none', border:'none', color:'rgba(248,236,216,.7)', fontSize:28, cursor:'none', zIndex:10001, lineHeight:1 }}>×</button>

          {/* MAIN LARGE IMAGE */}
          <div style={{ maxWidth:'90vw', maxHeight:'75vh', position:'relative' }} onClick={e => e.stopPropagation()}>
            <img src={images[activeImg]} alt={product?.name} style={{ maxWidth:'90vw', maxHeight:'75vh', objectFit:'contain', display:'block' }} />
          </div>

          {/* PREV / NEXT */}
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }}
                style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', background:'rgba(28,12,20,.7)', border:'1px solid var(--line)', color:'var(--iv)', width:44, height:44, fontSize:20, cursor:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }}
                style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', background:'rgba(28,12,20,.7)', border:'1px solid var(--line)', color:'var(--iv)', width:44, height:44, fontSize:20, cursor:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
            </>
          )}

          {/* THUMBNAIL STRIP — all images */}
          {images.length > 1 && (
            <div style={{ display:'flex', gap:8, marginTop:16, overflowX:'auto', maxWidth:'90vw', padding:'4px 0' }} onClick={e => e.stopPropagation()}>
              {images.map((url, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ flexShrink:0, width:72, height:72, overflow:'hidden', cursor:'none', border:`2px solid ${activeImg === i ? 'var(--gd)' : 'rgba(248,236,216,.80)'}`, transition:'border-color .2s', opacity: activeImg === i ? 1 : 0.55 }}>
                  <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* COUNTER */}
          <div style={{ marginTop:12, fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:'.2em', color:'rgba(248,236,216,.88)', textTransform:'uppercase' }}>
            {activeImg + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
