import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
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
  }, []);

  // Two different sizes of the same product are separate cart lines -- keyed by
  // id+size, not just id, so picking "Small" vs "Medium" doesn't merge them.
  function lineKey(item) {
    return item.id + (item.size ? '::' + item.size : '');
  }

  function addToCart(product) {
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
  }

  function removeFromCart(item) {
    const key = lineKey(item);
    setCart((prev) => prev.filter((i) => lineKey(i) !== key));
    toast.success('Item removed from cart.');
  }

  function updateQty(item, qty) {
    if (qty <= 0) {
      removeFromCart(item);
      return;
    }
    const key = lineKey(item);
    setCart((prev) =>
      prev.map((i) => (lineKey(i) === key ? { ...i, qty } : i))
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
