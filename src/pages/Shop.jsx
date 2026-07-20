import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import ProductCard from '../components/ProductCard';
import { CATEGORY_GROUPS, COLLECTOR_LABEL } from '../data/products';
import PageHero from '../components/PageHero';
import { useBrand } from '../context/BrandContext';

// Legacy Supabase rows may still carry old names — match loosely.
const LEGACY_CATS = { 'terracotta artefacts': 'terracotta', 'lightings': 'lighting' };
function matchesCategory(product, category) {
  let cat = (product.cat || '').trim().toLowerCase();
  cat = LEGACY_CATS[cat] || cat;
  let want = category.trim().toLowerCase();
  want = LEGACY_CATS[want] || want;
  return cat === want;
}

const STOCK_FILTERS = [
  { value: 'all-stock', label: 'All' },
  { value: 'in-stock',  label: 'In Stock' },
  { value: 'out-stock', label: 'Sold Out' },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'enquiry',    label: 'By Enquiry' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { brand } = useBrand();
  const [products, setProducts]   = useState([]);
  const [catFilter, setCatFilter] = useState(searchParams.get('category') || 'All');
  const [groupFilter, setGroupFilter] = useState(searchParams.get('group') || '');
  const [collectionFilter, setCollectionFilter] = useState(searchParams.get('collection') || '');
  const [stockFilter, setStockFilter] = useState('all-stock');
  const [sort, setSort]           = useState('newest');
  const [loading, setLoading]     = useState(true);
  const [catDdOpen, setCatDdOpen] = useState(false);
  const catDdRef = React.useRef(null);

  useEffect(() => {
    if (!catDdOpen) return;
    const close = (e) => { if (!catDdRef.current?.contains(e.target)) setCatDdOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [catDdOpen]);

  // Sync URL ?category= / ?group= / ?collection= whenever it changes (e.g. navbar mega-menu click)
  useEffect(() => {
    setCatFilter(searchParams.get('category') || 'All');
    setGroupFilter(searchParams.get('group') || '');
    setCollectionFilter(searchParams.get('collection') || '');
  }, [searchParams]);

  function handleCatClick(value) {
    if (value === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
    setCatDdOpen(false);
  }

  function handleGroupClick(label) {
    setSearchParams({ group: label });
    setCatDdOpen(false);
  }

  function handleCollectionClick() {
    setSearchParams({ collection: COLLECTOR_LABEL });
    setCatDdOpen(false);
  }

  useEffect(() => {
    supabase.from('products').select('*').eq('available', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProducts(data); setLoading(false); });
  }, []);

  // Apply all filters + sort
  let filtered = [...products];
  if (collectionFilter) {
    filtered = filtered.filter(p => matchesCategory(p, collectionFilter));
  } else if (groupFilter) {
    const group = CATEGORY_GROUPS.find(g => g.label.toLowerCase() === groupFilter.toLowerCase());
    if (group) filtered = filtered.filter(p => group.items.some(item => matchesCategory(p, item)));
  } else if (catFilter !== 'All') {
    filtered = filtered.filter(p => matchesCategory(p, catFilter));
  }
  if (stockFilter === 'in-stock')  filtered = filtered.filter(p => p.stock > 0);
  if (stockFilter === 'out-stock') filtered = filtered.filter(p => p.stock === 0);
  if (sort === 'oldest')     filtered = filtered.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  if (sort === 'price-asc')  filtered = filtered.sort((a,b) => (a.price||0) - (b.price||0));
  if (sort === 'price-desc') filtered = filtered.sort((a,b) => (b.price||0) - (a.price||0));
  if (sort === 'enquiry')    filtered = filtered.sort((a,b) => (b.enquiry_only?1:0) - (a.enquiry_only?1:0));

  const btnStyle = (active) => ({
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '.14em',
    textTransform: 'uppercase', padding: '8px 14px',
    border: 'none', cursor: 'none', borderRadius: 2,
    transition: 'background .2s, color .2s',
    background: active ? 'var(--gold)' : 'rgba(30,27,20,.04)',
    color: active ? 'var(--text-dark)' : 'var(--iv50)',
  });

  const selectStyle = {
    background: 'rgba(242,239,228,.95)', border: '1px solid var(--line)',
    color: 'var(--iv)', padding: '8px 12px',
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '.12em',
    outline: 'none', cursor: 'none', borderRadius: 2,
  };

  return (
    <>
      {/* HEADER */}
      <PageHero
        image={brand.hero_shop}
        position={brand.hero_shop_position}
        title="The Collection"
        center
      />

      {/* FILTER BAR — sticky */}
      <div style={{ background: 'var(--nav)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 64, zIndex: 100, padding: '0 44px' }}>
        <div className="container">
          <div className="shop-filter-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '10px 0' }}>

            {/* CATEGORY FILTER — single organized dropdown, same taxonomy as the Navbar mega-menu */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => handleCatClick('All')} style={btnStyle(!collectionFilter && !groupFilter && catFilter === 'All')}>All</button>

              <div ref={catDdRef} style={{ position: 'relative' }}>
                <button onClick={() => setCatDdOpen(o => !o)} style={{ ...btnStyle(!collectionFilter && (!!groupFilter || catFilter !== 'All')), display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!collectionFilter && groupFilter ? groupFilter : (!collectionFilter && catFilter !== 'All' ? catFilter : 'Category')}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: catDdOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {catDdOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, background: 'var(--nav)', border: '1px solid var(--line)', boxShadow: '0 12px 40px rgba(30,27,20,.14)', zIndex: 200, display: 'flex', minWidth: 640 }} className="shop-cat-dd">
                    {CATEGORY_GROUPS.map((group, gi) => (
                      <div key={group.label} style={{ flex: 1, minWidth: 150, borderRight: gi < CATEGORY_GROUPS.length - 1 ? '1px solid var(--line)' : 'none', padding: '14px 0' }}>
                        <button onClick={() => handleGroupClick(group.label)} style={{
                          fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase',
                          color: groupFilter === group.label ? 'var(--gd)' : 'var(--gold-muted)', padding: '0 16px 10px',
                          background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, textAlign: 'left', display: 'block',
                        }}>{group.label}</button>
                        {group.items.map(item => (
                          <button key={item} onClick={() => handleCatClick(item)} style={{
                            display: 'block', width: '100%', textAlign: 'left', background: catFilter === item ? 'rgba(33,29,20,.06)' : 'none', border: 'none', cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '.05em', color: catFilter === item ? 'var(--gd)' : 'var(--iv)',
                            padding: '9px 16px', transition: 'background .15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(33,29,20,.06)'}
                            onMouseLeave={e => { if (catFilter !== item) e.currentTarget.style.background = 'none'; }}
                          >{item}</button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleCollectionClick} style={{ ...btnStyle(!!collectionFilter), border: '1px solid var(--border-gold)' }}>{COLLECTOR_LABEL}</button>
            </div>

            {/* RIGHT CONTROLS */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* STOCK FILTER PILLS */}
              <div style={{ display: 'flex', gap: 4 }}>
                {STOCK_FILTERS.map(({ value, label }) => (
                  <button key={value} onClick={() => setStockFilter(value)} style={{ ...btnStyle(stockFilter === value), padding: '6px 11px', fontSize: 11 }}>{label}</button>
                ))}
              </div>

              {/* SORT DROPDOWN */}
              <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: '#F2EFE4' }}>{o.label}</option>
                ))}
              </select>

              {/* COUNT */}
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(106,99,80,.88)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner"></span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ color: 'rgba(106,99,80,.88)' }}>No pieces found. Try a different filter</div>
          ) : (
            <div className="shop-masonry">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} height={320} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .shop-filter-row { flex-direction: column !important; align-items: flex-start !important; }
          .shop-cat-dd { min-width: min(92vw, 640px) !important; left: 0; right: 0; overflow-x: auto; }
        }
        @media (max-width: 560px) {
          .shop-cat-dd { flex-direction: column !important; min-width: 220px !important; }
        }
      `}</style>
    </>
  );
}
