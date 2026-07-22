import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

// Split into two contexts so a component that only needs to call addToCart
// (every ProductCard, ProductPage, GiftCard) never re-renders when the cart's
// contents change — only components reading actual cart data (Cart, Checkout,
// the Navbar badge) do. All the action functions below are wrapped in
// useCallback with no dependencies (they only ever use the functional
// setCart(prev => ...) form), so CartActionsContext's value is stable for
// the lifetime of the app and never triggers its subscribers to re-render.
const CartDataContext = createContext();
const CartActionsContext = createContext();

export function useCartData() { return useContext(CartDataContext); }
export function useCartActions() { return useContext(CartActionsContext); }
// Back-compat combined hook for call sites that need both.
export function useCart() {
  return { ...useContext(CartDataContext), ...useContext(CartActionsContext) };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tt_cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tt_cart', JSON.stringify(cart));
  }, [cart]);

  // The cart is saved in the browser and can go stale -- a product added days ago may
  // since have been deleted or unpublished by the admin. Re-check once against Supabase
  // on load and drop anything that's gone, so a removed product never lingers in a cart.
  useEffect(() => {
    const initialCart = cart;
    const realIds = [...new Set(initialCart.filter(i => !i.isGiftCard).map(i => i.id))];
    if (realIds.length === 0) return;
    supabase.from('products').select('id, available, stock').in('id', realIds).then(({ data, error }) => {
      if (error || !data) return;
      const liveMap = new Map(data.map(p => [p.id, p]));
      const kept = [];
      let removedCount = 0;
      initialCart.forEach(item => {
        if (item.isGiftCard) { kept.push(item); return; }
        const live = liveMap.get(item.id);
        if (!live || live.available === false) { removedCount++; return; }
        kept.push({ ...item, stock: live.stock });
      });
      setCart(kept);
      if (removedCount > 0) {
        toast.error(removedCount === 1
          ? 'An item in your cart is no longer available and was removed.'
          : `${removedCount} items in your cart are no longer available and were removed.`);
      }
    });
    // eslint-disable-next-line
  }, []);

  // Two different sizes of the same product are separate cart lines -- keyed by
  // id+size, not just id, so picking "Small" vs "Medium" doesn't merge them.
  function lineKey(item) {
    return item.id + (item.size ? '::' + item.size : '');
  }

  const addToCart = useCallback((product) => {
    if (product.stock === 0) {
      toast.error('This piece is no longer available.');
      return;
    }
    const label = product.name + (product.size ? ` (${product.size})` : '');
    setCart((prev) => {
      const key = lineKey(product);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.error(`Only ${product.stock} available.`);
          return prev;
        }
        toast.success(`${label} quantity updated.`);
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, qty: i.qty + 1 } : i
        );
      }
      toast.success(`${label} added to cart.`);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((item) => {
    const key = lineKey(item);
    setCart((prev) => prev.filter((i) => lineKey(i) !== key));
    toast.success('Item removed from cart.');
  }, []);

  const updateQty = useCallback((item, qty) => {
    if (qty <= 0) {
      removeFromCart(item);
      return;
    }
    const key = lineKey(item);
    setCart((prev) =>
      prev.map((i) => (lineKey(i) === key ? { ...i, qty } : i))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  const dataValue = useMemo(
    () => ({ cart, cartCount, cartSubtotal }),
    [cart, cartCount, cartSubtotal]
  );
  const actionsValue = useMemo(
    () => ({ addToCart, removeFromCart, updateQty, clearCart }),
    [addToCart, removeFromCart, updateQty, clearCart]
  );

  return (
    <CartActionsContext.Provider value={actionsValue}>
      <CartDataContext.Provider value={dataValue}>
        {children}
      </CartDataContext.Provider>
    </CartActionsContext.Provider>
  );
}
