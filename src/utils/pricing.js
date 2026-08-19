// Shared, pure discount/total math used by both the client (Checkout.jsx, for display)
// and the server (api/razorpay-create-order.js, as the source of truth for what's
// actually charged) -- importing the same functions from both places guarantees the
// two can never drift apart.

export function cartSubtotalOf(cart) {
  return cart.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);
}

// A coupon scoped to specific products/a bundle should only discount those items'
// share of the cart, not the whole subtotal (which may include unrelated pieces).
export function couponBaseOf(cart, coupon, cartSubtotal) {
  if (!coupon) return 0;
  if (coupon.applies_to === 'products' || coupon.applies_to === 'bundle') {
    return cart
      .filter(i => !i.isGiftCard && (coupon.product_ids || []).includes(i.id))
      .reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);
  }
  return cartSubtotal;
}

// Percent discounts are capped at 100% here, in the one place both client and server
// call through -- a coupon accidentally saved as e.g. 150% off can never produce a
// discount larger than the base it's applied to, no matter what's stored in the DB.
export function couponDiscountOf(cart, coupon, cartSubtotal) {
  if (!coupon) return 0;
  const base = couponBaseOf(cart, coupon, cartSubtotal);
  if (base <= 0) return 0;
  const raw = coupon.type === 'percent'
    ? Math.round(base * (Math.min(Number(coupon.value) || 0, 100) / 100))
    : Math.min(Number(coupon.value) || 0, base);
  return Math.max(0, Math.min(raw, base));
}

export function giftCardAppliedOf(giftCard, cartSubtotal, shipping, discount) {
  if (!giftCard) return 0;
  return Math.min(Number(giftCard.balance) || 0, Math.max(cartSubtotal + shipping - discount, 0));
}
