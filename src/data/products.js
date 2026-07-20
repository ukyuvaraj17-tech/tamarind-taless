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

// The fine-art / traditional-painting collections shown on the dedicated Gallery page.
export const GALLERY_COLLECTIONS = [
  { name: 'Madhubani', tagline: 'Ritual line and pigment from Mithila' },
  { name: 'Mural', tagline: 'Temple wall painting, reimagined for the home' },
  { name: 'Ravi Varma Lithographs', tagline: 'The prints that shaped modern Indian iconography' },
  { name: 'Tanjore Paintings', tagline: 'Gesso, gold leaf and devotional gem-work' },
  { name: 'Pichwai Paintings', tagline: 'Nathdwara\'s devotional cloth painting tradition' },
];

export const fmt = (n) => 'Rs. ' + Number(n).toLocaleString('en-IN');

export default [];