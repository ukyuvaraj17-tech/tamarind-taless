// Products are managed entirely via Firebase Admin Panel
// This file has NO seed data — all products come from Firestore
// Admin adds products at /admin/login → Admin Panel → Add Product

export const CATEGORIES = [
  { value: 'all', label: 'All Pieces' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'wooden', label: 'Wooden Art' },
  { value: 'paintings', label: 'Paintings' },
  { value: 'miniatures', label: 'Miniatures' },
  { value: 'brass', label: 'Brass' },
];

export const fmt = (n) => 'Rs. ' + Number(n).toLocaleString('en-IN');

export default [];