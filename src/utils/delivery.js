// Estimated delivery date range for a product, adjusted by shipping location.
// Each product carries its own base min/max days (set in Admin); a configurable list of
// metro cities gets that base estimate as-is, everywhere else adds a configurable buffer.
// This is an honest estimate, not a live courier-tracked figure -- there's no courier API
// wired in, so it's a business rule the admin controls, same spirit as the rest of the site.

const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function isMetroCity(city, brand) {
  if (!city) return true; // unknown location: show the optimistic/base estimate
  const metros = (brand?.delivery_metro_cities || '')
    .split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
  return metros.includes(city.trim().toLowerCase());
}

export function getDeliveryRange(product, brand, city) {
  const baseMin = Number(product?.delivery_min_days) || 5;
  const baseMax = Number(product?.delivery_max_days) || 8;
  const extra = isMetroCity(city, brand) ? 0 : (Number(brand?.delivery_extra_days) || 0);
  const minDays = baseMin + extra;
  const maxDays = baseMax + extra;

  const today = new Date();
  const start = new Date(today); start.setDate(start.getDate() + minDays);
  const end = new Date(today); end.setDate(end.getDate() + maxDays);

  return {
    minDays, maxDays,
    label: `${fmtDate(start)} – ${fmtDate(end)}`,
    daysLabel: minDays === maxDays ? `${minDays} days` : `${minDays}–${maxDays} days`,
  };
}

// Widest range across every item in a cart, since a mixed order ships together and is
// bound by whichever piece takes longest.
export function getCartDeliveryRange(cartItems, brand, city) {
  const real = (cartItems || []).filter(i => !i.isGiftCard);
  if (real.length === 0) return null;
  const ranges = real.map(i => getDeliveryRange(i, brand, city));
  const minDays = Math.max(...ranges.map(r => r.minDays));
  const maxDays = Math.max(...ranges.map(r => r.maxDays));
  const today = new Date();
  const start = new Date(today); start.setDate(start.getDate() + minDays);
  const end = new Date(today); end.setDate(end.getDate() + maxDays);
  return { minDays, maxDays, label: `${fmtDate(start)} – ${fmtDate(end)}` };
}
