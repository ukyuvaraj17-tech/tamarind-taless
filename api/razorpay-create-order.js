// Vercel serverless function -- the ONLY place the Razorpay Key Secret is ever used,
// and now also the source of truth for what an order actually costs. The browser
// used to send a pre-computed `amount` here and this function just charged it --
// which meant editing that one number in a network request was enough to pay
// whatever you wanted for any cart. Every line item is now re-priced from the
// database, coupons/gift cards are re-validated from their own tables, and the
// Razorpay order is created for that server-computed total -- never the client's.
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getShippingCost } from '../src/utils/delivery.js';
import { cartSubtotalOf, couponDiscountOf, giftCardAppliedOf } from '../src/utils/pricing.js';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

// A short-lived proof that THIS specific order was legitimately computed as needing
// no payment (a coupon or gift card covered it entirely) -- tied to the receipt so it
// can't be reused for a different order. See the note in Checkout.jsx's finalizeOrder
// for the residual gap this does (and doesn't) close.
function signFreeOrder(receipt, keySecret) {
  return crypto.createHmac('sha256', keySecret).update(`free|${receipt}|0`).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    res.status(500).json({ error: 'Payment gateway is not configured.' });
    return;
  }

  const { items, couponCode, giftCardCode, receipt } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Your cart is empty.' });
    return;
  }

  try {
    // Aggregate quantities per product+size (and per gift-card line) BEFORE checking
    // stock -- otherwise a request could split one large quantity across several line
    // entries and have each one individually pass the per-line stock check.
    const lineKey = (i) => i.isGiftCard ? `gc:${i.id}` : `${i.id}::${i.size || ''}`;
    const aggregated = new Map();
    for (const item of items) {
      const qty = Number(item.qty);
      if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
        res.status(400).json({ error: 'One of the items in your cart has an invalid quantity.' });
        return;
      }
      const key = lineKey(item);
      const existing = aggregated.get(key);
      if (existing) existing.qty += qty;
      else aggregated.set(key, { id: item.id, size: item.size || null, isGiftCard: !!item.isGiftCard, price: item.price, qty });
    }
    const mergedItems = [...aggregated.values()];

    // ---- Re-price every line item from the database -- never trust a client-sent price ----
    const productIds = [...new Set(mergedItems.filter(i => !i.isGiftCard).map(i => i.id))];
    const { data: products, error: prodErr } = productIds.length
      ? await supabase.from('products').select('*').in('id', productIds)
      : { data: [], error: null };
    if (prodErr) {
      res.status(500).json({ error: 'Could not verify your cart. Please try again.' });
      return;
    }
    const productById = Object.fromEntries((products || []).map(p => [p.id, p]));

    let giftcardMin = 500, giftcardMax = 50000;
    if (mergedItems.some(i => i.isGiftCard)) {
      const { data: settings } = await supabase.from('settings').select('giftcard_min, giftcard_max').eq('id', 'brand').maybeSingle();
      if (settings) {
        // ?? applied BEFORE Number() -- an admin deliberately setting a 0 minimum must
        // not be silently overridden back to the hardcoded default. `Number(x) ?? y`
        // would never work here since Number(null/undefined) is NaN/0, neither of
        // which is nullish, so the fallback would never trigger at all.
        // (src/pages/GiftCard.jsx already uses this same ?? pattern for this exact value.)
        giftcardMin = Number(settings.giftcard_min ?? giftcardMin);
        giftcardMax = Number(settings.giftcard_max ?? giftcardMax);
      }
    }

    const verifiedCart = [];
    // Returned to the client so the order record's line items reflect the same
    // server-verified prices as the total, instead of whatever the client's cart said.
    const verifiedItemsForClient = [];
    for (const item of mergedItems) {
      if (item.isGiftCard) {
        // A gift card is always exactly one redeemable code -- matches the site's own
        // UI invariant (Cart.jsx caps gift-card stock at 1). A qty > 1 would be charged
        // in full but only ever produce one redeemable card, so it's rejected outright
        // rather than silently under-delivering value.
        if (item.qty !== 1) {
          res.status(400).json({ error: 'Gift cards can only be purchased one at a time -- add another to your cart separately.' });
          return;
        }
        // A gift card's value is a customer choice, not a catalog price -- verify it
        // falls inside the admin-configured range instead of looking it up.
        const price = Number(item.price);
        if (!Number.isFinite(price) || price < giftcardMin || price > giftcardMax) {
          res.status(400).json({ error: `Gift card amount must be between Rs. ${giftcardMin} and Rs. ${giftcardMax}.` });
          return;
        }
        verifiedCart.push({ id: item.id, price, qty: item.qty, isGiftCard: true });
        verifiedItemsForClient.push({ id: item.id, size: null, isGiftCard: true, price, qty: item.qty });
        continue;
      }

      const product = productById[item.id];
      if (!product || product.available === false || product.enquiry_only) {
        res.status(400).json({ error: 'One of the items in your cart is no longer available.' });
        return;
      }

      let price = Number(product.price);
      let stock = product.stock;
      const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
      if (hasVariants) {
        // A product with variants has no meaningful base price/stock of its own --
        // a missing size can't fall back to it, or the wrong price/stock gets used.
        if (!item.size) {
          res.status(400).json({ error: 'One of the items in your cart needs an option selected -- please remove and re-add it.' });
          return;
        }
        const variant = product.variants.find(v => v.size === item.size);
        if (!variant) {
          res.status(400).json({ error: 'One of the items in your cart is no longer available.' });
          return;
        }
        price = Number(variant.price);
        stock = variant.stock;
      }
      if (!Number.isFinite(price) || price <= 0) {
        res.status(400).json({ error: 'One of the items in your cart is no longer available.' });
        return;
      }

      // Same "unknown vs. actually zero" stock rule as the rest of the app (src/data/products.js's
      // knownStock) -- null/undefined/'' means "not tracked," not "out of stock."
      const knownStock = (stock === null || stock === undefined || stock === '') ? null : Number(stock);
      if (knownStock !== null && item.qty > knownStock) {
        res.status(400).json({ error: `Only ${knownStock} left of "${product.name}" -- please update your cart.` });
        return;
      }

      verifiedCart.push({ id: item.id, price, qty: item.qty, isGiftCard: false });
      verifiedItemsForClient.push({ id: item.id, size: item.size, isGiftCard: false, price, qty: item.qty, name: product.name, cat: product.cat });
    }

    const cartSubtotal = cartSubtotalOf(verifiedCart);

    // ---- Re-validate the coupon against the real table, same rules Checkout.jsx applies ----
    let coupon = null;
    if (couponCode) {
      const { data } = await supabase.from('coupons').select('*').eq('code', String(couponCode).toUpperCase()).eq('active', true).maybeSingle();
      if (data) {
        const cartProductIds = verifiedCart.filter(i => !i.isGiftCard).map(i => i.id);
        if (data.applies_to === 'products') {
          if ((data.product_ids || []).some(id => cartProductIds.includes(id))) coupon = data;
        } else if (data.applies_to === 'bundle') {
          const need = data.product_ids || [];
          if (need.length && need.filter(id => cartProductIds.includes(id)).length >= need.length) coupon = data;
        } else {
          coupon = data;
        }
        // Usage cap reached -- treat exactly like an invalid code rather than erroring,
        // same as if it had simply expired.
        const maxUses = Number(coupon?.max_uses);
        if (coupon && Number.isFinite(maxUses) && maxUses > 0 && Number(coupon.times_used || 0) >= maxUses) {
          coupon = null;
        }
      }
    }
    let discount = couponDiscountOf(verifiedCart, coupon, cartSubtotal);

    // Reserve the coupon's use slot atomically, HERE, before any payment is created --
    // not after the order is written. Two concurrent checkouts both reading "1 use
    // left" would otherwise both get the discount and both get charged the discounted
    // amount before either's reservation is checked; reserving it against the real
    // total up front means a losing request simply computes a full-price total instead,
    // so the discount can never be granted more times than the cap allows. The RPC
    // itself (redeem_coupon_use) does the atomic check-and-increment via a row lock --
    // this call either secures the discount this request just computed, or (if another
    // request won the race in between) fails and the discount is dropped before the
    // customer ever pays.
    if (coupon && discount > 0) {
      const { error: couponRedeemErr } = await supabase.rpc('redeem_coupon_use', { p_code: coupon.code });
      if (couponRedeemErr) {
        coupon = null;
        discount = 0;
      }
    }

    // ---- Re-validate the gift card against the real table ----
    let giftCard = null;
    if (giftCardCode) {
      const { data } = await supabase.from('gift_cards').select('*').eq('code', String(giftCardCode).toUpperCase()).maybeSingle();
      if (data && Number(data.balance) > 0) giftCard = data;
    }

    const shipping = getShippingCost(cartSubtotal);
    const giftCardApplied = giftCardAppliedOf(giftCard, cartSubtotal, shipping, discount);
    const total = Math.max(0, cartSubtotal + shipping - discount - giftCardApplied);

    const computed = {
      computedSubtotal: cartSubtotal,
      computedShipping: shipping,
      computedDiscount: discount,
      computedGiftCardApplied: giftCardApplied,
      computedTotal: total,
      couponValid: !!coupon,
      giftCardValid: !!giftCard,
      verifiedItems: verifiedItemsForClient,
    };

    if (total <= 0) {
      const freeToken = signFreeOrder(receipt, keySecret);
      res.status(200).json({ free: true, freeToken, ...computed });
      return;
    }

    const amountPaise = Math.round(total * 100);
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: receipt || undefined,
      }),
    });
    const data = await rzpRes.json();
    if (!rzpRes.ok) {
      res.status(502).json({ error: data?.error?.description || 'Could not create payment order.' });
      return;
    }
    res.status(200).json({ id: data.id, amount: data.amount, currency: data.currency, key_id: keyId, ...computed });
  } catch (err) {
    console.error('razorpay-create-order failed:', err);
    res.status(500).json({ error: 'Could not start payment. Please try again.' });
  }
}
