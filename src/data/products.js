// Products are managed entirely via the Supabase Admin Panel
// This file has NO seed data — all products come from Supabase
// Admin adds products at /admin/login → Admin Panel → Add Product

export const COLLECTOR_LABEL = "Collector's Pieces";

// Grouped taxonomy — drives the Navbar mega-menu and the Shop filter bar.
// Madhubani and Mural are kept as two distinct entries (not merged) per the Gallery brief.
export const CATEGORY_GROUPS = [
  { label: 'Paintings', items: ['Madhubani', 'Mural', 'Ravi Varma Lithographs', 'Tanjore Paintings', 'Pichwai Paintings', 'Reverse Glass Paintings', 'Miniature Portraits'] },
  { label: 'By Materials', items: ['Terracotta', 'Bronze', 'Brass', 'Wooden', 'Stone', 'Copper', 'Silver'] },
  { label: 'Miniatures', items: ['Miniatures'] },
  { label: 'Home & Living', items: ['Lighting', 'Furniture'] },
  { label: 'Others', items: ['Sarees'] },
];

export const categories = [
  'All',
  ...CATEGORY_GROUPS.flatMap(g => g.items),
  COLLECTOR_LABEL,
];

export const fmt = (n) => 'Rs. ' + Number(n).toLocaleString('en-IN');

// The base product.stock field predates variants and isn't kept in sync with them --
// a variant product is only truly sold out when every one of its variants is.
// Shared by ProductCard and Shop so the grid and its "Sold Out" filter never disagree.
// Number(null) coerces to 0, not NaN -- so null/undefined must be excluded
// explicitly before coercing, not caught after the fact via Number.isFinite alone.
// Returns the numeric stock, or null if it's genuinely unset/unknown.
export const knownStock = (value) =>
  value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;

// Unset stock (null, undefined, '') is treated as "unknown, assume available" --
// never as sold out -- consistent with knownStock's own null-for-unset contract.
export const isProductSoldOut = (p) =>
  Array.isArray(p.variants) && p.variants.length > 0
    ? p.variants.every(v => knownStock(v.stock) === 0)
    : knownStock(p.stock) === 0;

// Builds the object to hand to addToCart() -- for a variant product this picks the
// first in-stock variant (falling back to the first variant if all are sold out,
// which addToCart's own stock check will then correctly reject) so callers never
// add the bare base product at its stale price/stock with no size selected.
export const productAddToCartPayload = (p) => {
  if (!Array.isArray(p.variants) || p.variants.length === 0) return p;
  const variant = p.variants.find(v => Number(v.stock) > 0) || p.variants[0];
  return { ...p, size: variant.size, price: variant.price ?? p.price, stock: variant.stock };
};

export default [];