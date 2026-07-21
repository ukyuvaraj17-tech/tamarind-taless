import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
import { useBrand } from '../context/BrandContext';
import { useAuth } from '../context/AuthContext';
import { fmt, CATEGORY_GROUPS } from '../data/products';
import { isSaved, toggleSaved } from '../utils/wishlist';
import ProductCard from '../components/ProductCard';
import { FacebookIcon, TwitterXIcon, PinterestIcon, EmailIcon } from '../components/SocialIcons';
import toast from 'react-hot-toast';

const S = {
  eyebrow: { fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:11, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--gd)' },
  label: { fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:10.5, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--gd)', display:'block', marginBottom:6 },
  body: { fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:'var(--iv)', fontWeight:500, lineHeight:1.75 },
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { brand } = useBrand();
  const { currentUser, userProfile } = useAuth();
  const groups = brand.category_taxonomy?.length ? brand.category_taxonomy : CATEGORY_GROUPS;
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedTier, setRelatedTier] = useState('cat'); // 'cat' | 'group' | 'recent'
  const [relatedGroupLabel, setRelatedGroupLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [saved, setSaved] = useState(false);

  // Lock page scroll while the lightbox is open — without this, scrolling the
  // underlying page on mobile made the fixed lightbox appear to jump/misalign.
  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  useEffect(() => { setZoomed(false); }, [activeImg, lightbox]);

  const lastTapRef = React.useRef(0);
  function handleImageTap(e) {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 350) setZoomed(z => !z);
    lastTapRef.current = now;
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setActiveImg(0);
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      if (cancelled) return;
      setProduct(data || null);
      setSaved(data ? isSaved(data.id) : false);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!product) { setRelated([]); return; }
    const productCat = (product.cat || '').trim().toLowerCase();
    supabase.from('products').select('*')
      .eq('available', true).neq('id', product.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const all = data || [];
        const sameCat = all.filter(p => (p.cat || '').trim().toLowerCase() === productCat);
        if (sameCat.length > 0) { setRelated(sameCat.slice(0, 4)); setRelatedTier('cat'); return; }

        // No other pieces in the exact same category — widen to the same taxonomy group
        // (e.g. other Paintings, or other By Materials pieces) before falling back to "recent".
        const group = groups.find(g => g.items.some(item => item.toLowerCase() === productCat));
        const groupCats = group ? group.items.map(c => c.toLowerCase()) : [];
        const sameGroup = groupCats.length ? all.filter(p => groupCats.includes((p.cat || '').trim().toLowerCase())) : [];
        if (sameGroup.length > 0) { setRelated(sameGroup.slice(0, 4)); setRelatedTier('group'); setRelatedGroupLabel(group?.label || ''); return; }

        setRelated(all.slice(0, 4));
        setRelatedTier('recent');
      });
  }, [product]);

  function handleSave() {
    if (!product) return;
    const nowSaved = toggleSaved(product);
    setSaved(nowSaved);
    toast.success(nowSaved ? 'Saved for later.' : 'Removed from saved.');
  }

  // Opens WhatsApp immediately (so it isn't blocked as a popup) and logs the enquiry to
  // Supabase in the background so it shows up under Admin > Enquiries.
  function handleEnquire(reason) {
    const messages = {
      soldOut: `Hi, I'm interested in "${product.name}" but see it's currently sold out. Is it available, or do you have something similar?`,
      priceOnEnquiry: `I am interested in ${product.name}, ${product.material || ''}, ${product.origin || ''}. Please share details and pricing.`,
      inStock: `I am interested in ${product.name}, ${fmt(product.price)}. Please share more details.`,
    };
    const message = messages[reason];
    window.open(`https://wa.me/918796988216?text=${encodeURIComponent(message)}`, '_blank');
    supabase.from('enquiries').insert({
      user_id: currentUser?.id || null,
      user_name: userProfile?.name || 'Website Visitor',
      user_email: currentUser?.email || null,
      product: product.name,
      message: reason === 'soldOut' ? 'Enquired about a sold-out piece via WhatsApp.' : message,
      type: 'WhatsApp',
      status: 'Received',
    }).then(({ error }) => { if (error) console.error('Failed to log enquiry:', error); });
  }

  const touchX = React.useRef(null);
  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e, count) {
    if (touchX.current === null || count < 2 || zoomed) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      setActiveImg(i => dx < 0 ? (i + 1) % count : (i - 1 + count) % count);
    }
    touchX.current = null;
  }

  if (loading) {
    return <div style={{ paddingTop: 64, minHeight: '80vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner"></span></div>;
  }

  if (!product) {
    return (
      <div style={{ paddingTop: 64, minHeight: '80vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px' }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: 'var(--iv)', marginBottom: 14 }}>Piece not found</div>
          <button className="btn btn-outline" onClick={() => navigate('/shop')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  const isEnquiryOnly = product.enquiry_only || product.enquiryOnly;
  const isSoldOut = product.stock === 0;
  const images = product.images || [];
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div key={id} className="pp-fade-in" style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '28px 44px 0' }}>
        <Link to="/shop" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>← Back to Shop</Link>
      </div>

      <div className="container product-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, padding: '24px 44px 60px', alignItems: 'start' }}>

        {/* IMAGES */}
        <div>
          <div style={{ width: '100%', aspectRatio: '1', background: product.bg || 'var(--card)', position: 'relative', overflow: 'hidden', cursor: images.length ? 'pointer' : 'default', border: '1px solid var(--line)' }}
            onClick={() => images.length > 0 && setLightbox(true)}
            onTouchStart={onTouchStart}
            onTouchEnd={e => onTouchEnd(e, images.length)}
          >
            {images[activeImg] ? (
              <img key={activeImg} src={images[activeImg]} alt={product.name} className="pp-img-fade" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: product.image_position || '50% 50%' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'rgba(30,27,20,.15)', fontStyle: 'italic', padding: 32 }}>{product.name}</div>
            )}
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {product.badge && <span className="badge badge-gold">{product.badge}</span>}
              {isSoldOut && <span className="badge badge-sold">Sold Out</span>}
            </div>
            {images.length > 0 && (
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(30,27,20,.55)', padding: '5px 10px', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F2EFE4' }}>
                Tap to expand
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {images.map((url, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ width: 68, height: 68, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${activeImg === i ? 'var(--gd)' : 'var(--line)'}`, opacity: activeImg === i ? 1 : 0.6, transition: 'all .2s' }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* SHARE — directly below the product image, on the image side of the layout */}
          <div className="pp-share-row" style={{ marginTop: 24, borderTop: '1px solid var(--line)', borderLeft: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {[
              { label: 'Share On Facebook', Icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, external: true },
              { label: 'Tweet This Product', Icon: TwitterXIcon, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(product.name)}`, external: true },
              { label: 'Pin This Product', Icon: PinterestIcon, href: product.pinterest_url || `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(images[0] || '')}&description=${encodeURIComponent(product.name)}`, external: true },
              { label: 'Email This Product', Icon: EmailIcon, href: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent('Check out this piece: ' + pageUrl)}`, external: false },
            ].map(({ label, Icon, href, external }) => (
              <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
                className="pp-share-item"
                style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '16px 14px', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
              >
                <span className="pp-share-icon" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gd)', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s, transform .2s' }}>
                  <Icon width={15} height={15} />
                </span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12.5, color: 'var(--iv)' }}>{label}</span>
              </a>
            ))}
          </div>

          {/* SHIPPING / RETURNS / CARE — policy summary */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { to: '/shipping-policy', icon: (
                  <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                ), title: 'Shipping Information', body: 'See delivery timelines and charges' },
              { to: '/refund-policy', icon: (
                  <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8M3 3v5h5" />
                ), title: 'Returns & Refunds', body: 'See our return eligibility and process' },
              { to: '/care', icon: (
                  <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
                ), title: 'Care & Preservation Guide', body: 'How to look after this piece' },
            ].map(({ to, icon, title, body }) => (
              <Link key={to} to={to} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', textDecoration: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gd)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>{icon}</svg>
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, color: 'var(--iv)' }}>{title}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{body}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={S.eyebrow}>{product.cat}</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', color: 'var(--iv)', fontWeight: 400, margin: '8px 0 4px', lineHeight: 1.1 }}>{product.name}</h1>
              {product.subtitle && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)', fontStyle: 'italic' }}>{product.subtitle}</div>}
            </div>
            <button onClick={handleSave} title={saved ? 'Remove from saved' : 'Save for later'} style={{
              flexShrink: 0, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
              background: 'var(--card)', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'var(--gd)' : 'none'} stroke="var(--gd)" strokeWidth="1.6">
                <path d="M5 3h14a1 1 0 011 1v17l-8-5-8 5V4a1 1 0 011-1z" />
              </svg>
            </button>
          </div>

          <div style={{ margin: '22px 0 24px', paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
            {isSoldOut ? (
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: '.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sold Out</div>
            ) : isEnquiryOnly ? (
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: 'var(--gd)', fontStyle: 'italic' }}>Price available on enquiry</div>
            ) : (
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: 'var(--crimson)', fontWeight: 400 }}>{fmt(product.price)}</div>
            )}
          </div>

          {product.story && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '20px 22px', marginBottom: 24 }}>
              <p style={{ ...S.body, whiteSpace: 'pre-line' }}>{product.story}</p>
              {product.together && (
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', lineHeight: 1.7, fontStyle: 'italic', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', whiteSpace: 'pre-line' }}>{product.together}</p>
              )}
            </div>
          )}
          {!product.story && product.together && (
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24, whiteSpace: 'pre-line' }}>{product.together}</p>
          )}

          {(product.material || product.dimensions || product.weight || product.origin) && (
            <div style={{ background: 'var(--card)', padding: '18px 20px', marginBottom: 26, border: '1px solid var(--line)' }}>
              <div style={{ ...S.label, marginBottom: 12 }}>Specifications</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[['Material', product.material], ['Dimensions', product.dimensions], ['Weight', product.weight], ['Source', product.origin]].filter(([, v]) => v).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 10.5, letterSpacing: '.1em', color: 'var(--gd)', padding: '9px 0', textTransform: 'uppercase', width: '36%' }}>{k}</td>
                      <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', padding: '9px 0' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isSoldOut ? (
              <>
                <button className="btn btn-full" style={{ background: 'var(--card)', color: 'var(--text-muted)', cursor: 'not-allowed', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', padding: 15, border: '1px solid var(--line)' }} disabled>Sold Out</button>
                <button className="btn btn-full btn-wa" onClick={() => handleEnquire('soldOut')}>Enquire on WhatsApp</button>
              </>
            ) : isEnquiryOnly ? (
              <button className="btn btn-full btn-wa" onClick={() => handleEnquire('priceOnEnquiry')}>Enquire on WhatsApp</button>
            ) : (
              <>
                <button className="btn btn-full btn-dark" onClick={() => addToCart(product)}>Add to Cart</button>
                <button className="btn btn-full btn-wa" onClick={() => handleEnquire('inStock')}>Enquire on WhatsApp</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RECOMMENDED */}
      {related.length > 0 && (
        <section className="section" style={{ background: 'var(--nav)', borderTop: '1px solid var(--line)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p className="section-label">You May Also Like</p>
              <h2 className="section-title">
                {relatedTier === 'cat' && <>More From <em>{product.cat}</em></>}
                {relatedTier === 'group' && <>More <em>{relatedGroupLabel}</em></>}
                {relatedTier === 'recent' && <>Other <em>Pieces</em></>}
              </h2>
            </div>
            <div className="grid-4 product-page-related">
              {related.map(p => <ProductCard key={p.id} product={p} height={220} />)}
            </div>
          </div>
        </section>
      )}

      {/* LIGHTBOX — portaled to document.body so it always renders above the fixed navbar,
          regardless of any transform/animation on this page's own ancestors */}
      {lightbox && images.length > 0 && createPortal((
        <div className="pp-lightbox" style={{ position: 'fixed', inset: 0, background: '#FDFCF9', zIndex: 9999, display: 'flex', touchAction: 'none' }}
          onClick={() => setLightbox(false)}
        >
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: 18, right: 22, background: 'none', border: 'none', color: 'var(--iv)', fontSize: 28, cursor: 'pointer', zIndex: 10001, lineHeight: 1 }}>×</button>

          {/* THUMBNAIL RAIL */}
          {images.length > 1 && (
            <div className="pp-lightbox-rail" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20, overflowY: 'auto', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              {images.map((url, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ width: 64, height: 64, flexShrink: 0, cursor: 'pointer', border: `2px solid ${activeImg === i ? 'var(--gd)' : 'var(--line)'}`, opacity: activeImg === i ? 1 : 0.55, transition: 'opacity .2s' }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* MAIN IMAGE */}
          <div className="pp-lightbox-main" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
            onTouchStart={onTouchStart}
            onTouchEnd={e => onTouchEnd(e, images.length)}
          >
            <div style={{ maxWidth: '85%', maxHeight: '85vh', position: 'relative', overflow: zoomed ? 'auto' : 'visible' }} onClick={e => e.stopPropagation()}>
              <img key={activeImg} src={images[activeImg]} alt={product.name} className="pp-img-fade"
                onClick={handleImageTap}
                style={{
                  maxWidth: zoomed ? 'none' : '100%', maxHeight: zoomed ? 'none' : '85vh',
                  width: zoomed ? '190%' : 'auto',
                  objectFit: 'contain', display: 'block', cursor: zoomed ? 'zoom-out' : 'zoom-in',
                  transition: 'width .3s ease',
                }} />
            </div>
            {images.length > 1 && !zoomed && (
              <>
                <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }}
                  style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--iv)', width: 40, height: 40, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>‹</button>
                <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }}
                  style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--iv)', width: 40, height: 40, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>›</button>
              </>
            )}
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {activeImg + 1} / {images.length}
            </div>
          </div>
        </div>
      ), document.body)}

      <style>{`
        @keyframes ppFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ppImgFade { from { opacity:0; } to { opacity:1; } }
        .pp-fade-in { animation: ppFadeUp .45s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .pp-img-fade { animation: ppImgFade .35s ease both; }
        @media (hover: hover) and (pointer: fine) {
          .pp-share-item:hover .pp-share-icon { background: var(--gl); transform: scale(1.08); }
        }
        @media (max-width: 700px) {
          .pp-lightbox { flex-direction: column-reverse; }
          .pp-lightbox-rail { flex-direction: row; overflow-x: auto; overflow-y: visible; padding: 12px; }
        }
        @media (max-width: 900px) {
          .product-page-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 560px) {
          .pp-share-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .product-page-related { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
