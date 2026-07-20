// Shared save/pin (wishlist) helpers — backed by the same localStorage key
// Account.jsx's Wishlist tab already reads from.

const KEY = 'tt_wl';

export function getWishlist() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function isSaved(id) {
  return getWishlist().some(p => p.id === id);
}

export function toggleSaved(product) {
  const list = getWishlist();
  const exists = list.some(p => p.id === product.id);
  const next = exists ? list.filter(p => p.id !== product.id) : [...list, product];
  localStorage.setItem(KEY, JSON.stringify(next));
  return !exists; // true if now saved
}
