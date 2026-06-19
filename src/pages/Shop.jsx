import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import { CATEGORIES } from '../data/products';
import PageHero from '../components/PageHero';
import { useBrand } from '../context/BrandContext';

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
  const [catFilter, setCatFilter] = useState(searchParams.get('cat') || 'all');
  const [stockFilter, setStockFilter] = useState('all-stock');
  const [sort, setSort]           = useState('newest');
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL ?cat= param whenever it changes (e.g. navbar dropdown click)
  useEffect(() => {
    const urlCat = searchParams.get('cat');
    setCatFilter(urlCat || 'all');
  }, [searchParams]);

  function handleCatClick(value) {
    setCatFilter(value);
    if (value === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat: value });
    }
  }

  useEffect(() => {
    supabase.from('products').select('*').eq('available', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProducts(data); setLoading(false); });
  }, []);

  // Apply all filters + sort
  let filtered = [...products];
  if (catFilter !== 'all') filtered = filtered.filter(p => p.cat === catFilter);
  if (stockFilter === 'in-stock')  filtered = filtered.filter(p => p.stock > 0);
  if (stockFilter === 'out-stock') filtered = filtered.filter(p => p.stock === 0);
  if (sort === 'oldest')     filtered = filtered.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  if (sort === 'price-asc')  filtered = filtered.sort((a,b) => (a.price||0) - (b.price||0));
  if (sort === 'price-desc') filtered = filtered.sort((a,b) => (b.price||0) - (a.price||0));
  if (sort === 'enquiry')    filtered = filtered.sort((a,b) => (b.enquiry_only?1:0) - (a.enquiry_only?1:0));

  const btnStyle = (active) => ({
    fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.14em',
    textTransform: 'uppercase', padding: '8px 14px',
    border: 'none', cursor: 'none', borderRadius: 2,
    transition: 'background .2s, color .2s',
    background: active ? 'var(--crimson)' : 'rgba(255,255,255,.04)',
    color: active ? 'var(--iv)' : 'var(--iv50)',
  });

  const selectStyle = {
    background: 'rgba(28,12,20,.95)', border: '1px solid var(--line)',
    color: 'var(--iv)', padding: '8px 12px',
    fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.12em',
    outline: 'none', cursor: 'none', borderRadius: 2,
  };

  return (
    <>
      {/* HEADER */}
      <PageHero
        image={brand.hero_shop}
        eyebrow="The Collection"
        title={products.length > 0 ? `${String(products.length).padStart(2,'0')} Pieces` : 'Collection'}
        minHeight={260}
      />

      {/* FILTER BAR — sticky */}
      <div style={{ background: 'var(--nav)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 64, zIndex: 100, padding: '0 44px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '10px 0' }}>

            {/* CATEGORY FILTERS */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {CATEGORIES.map(({ value, label }) => (
                <button key={value} onClick={() => handleCatClick(value)} style={btnStyle(catFilter === value)}>{label}</button>
              ))}
            </div>

            {/* RIGHT CONTROLS */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* STOCK FILTER PILLS */}
              <div style={{ display: 'flex', gap: 4 }}>
                {STOCK_FILTERS.map(({ value, label }) => (
                  <button key={value} onClick={() => setStockFilter(value)} style={{ ...btnStyle(stockFilter === value), padding: '6px 11px', fontSize: 8 }}>{label}</button>
                ))}
              </div>

              {/* SORT DROPDOWN */}
              <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: '#1C0C14' }}>{o.label}</option>
                ))}
              </select>

              {/* COUNT */}
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: 'rgba(248,236,216,.88)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
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
            <div className="empty-state" style={{ color: 'rgba(248,236,216,.88)' }}>No pieces found — try a different filter</div>
          ) : (
            <div className="shop-masonry">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} onViewDetail={setSelected} height={[320,360,300,340][i % 4]} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ProductDetail product={selected} onClose={() => setSelected(null)} />
      <style>{`
        @media (max-width: 768px) {
          .shop-filter-row { flex-direction: column !important; align-items: flex-start !important; }
          .shop-filter-row > div { width: 100%; overflow-x: auto; padding-bottom: 4px; }
        }
      `}</style>
    </>
  );
}
