import React, { createContext, useContext, useState, useEffect } from 'react';
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
