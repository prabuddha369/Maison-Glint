'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { CartItem, Product, ProductSpecifications } from '../types/store';

export const MAX_ITEMS_PER_PRODUCT = 4;

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, specifications?: ProductSpecifications) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  taxEstimate: number;
  shippingCost: number;
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  maxPerProduct: number;
  notice: string | null;
  clearNotice: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mg_maison_glint_cart_v1';
const ESTIMATED_TAX_RATE = 0; // No hidden tax charges
const STANDARD_SHIPPING_FLAT = 0; // Complimentary normal delivery

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNoticeState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const setNotice = (msg: string) => {
    setNoticeState(msg);
    setTimeout(() => {
      setNoticeState((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const clearNotice = () => setNoticeState(null);

  // Client-side hydration from localStorage (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Auto-clamp any pre-existing cart items exceeding MAX_ITEMS_PER_PRODUCT
          setItems(
            parsed.map((item: CartItem) => ({
              ...item,
              quantity: Math.min(MAX_ITEMS_PER_PRODUCT, Math.max(1, item.quantity)),
            }))
          );
        }
      }
    } catch {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage upon changes (only after initial hydration to prevent overwriting)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Cart sync warning:', e);
    }
  }, [items, isHydrated]);

  const addItem = (
    product: Product,
    quantity: number = 1,
    specifications?: ProductSpecifications
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        if (currentQty >= MAX_ITEMS_PER_PRODUCT) {
          setNotice(`Atelier allocation cap reached: Maximum ${MAX_ITEMS_PER_PRODUCT} exemplars per edition.`);
          return prev;
        }

        const allowedAdd = Math.min(quantity, MAX_ITEMS_PER_PRODUCT - currentQty);
        if (allowedAdd < quantity) {
          setNotice(`Allocation adjusted: Maximum ${MAX_ITEMS_PER_PRODUCT} exemplars allowed per patron.`);
        }

        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: currentQty + allowedAdd,
        };
        return next;
      }

      const clampedQty = Math.min(MAX_ITEMS_PER_PRODUCT, Math.max(1, quantity));
      if (clampedQty < quantity) {
        setNotice(`Allocation adjusted: Maximum ${MAX_ITEMS_PER_PRODUCT} exemplars allowed per patron.`);
      }

      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency || 'USD',
        quantity: clampedQty,
        image: product.images[0] || '/images/fig-01-table.png',
        specifications: specifications || product.specifications,
      };
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    const clampedQty = Math.min(MAX_ITEMS_PER_PRODUCT, quantity);
    if (quantity > MAX_ITEMS_PER_PRODUCT) {
      setNotice(`Atelier allocation limit: Maximum ${MAX_ITEMS_PER_PRODUCT} exemplars per edition.`);
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: clampedQty } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.warn('Cart clear warning:', e);
    }
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const shippingCost = useMemo(() => {
    return 0; // Complimentary normal delivery
  }, []);

  const taxEstimate = useMemo(() => {
    return 0; // No hidden tax charges
  }, []);

  const total = useMemo(() => {
    return subtotal;
  }, [subtotal]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        taxEstimate,
        shippingCost,
        total,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        maxPerProduct: MAX_ITEMS_PER_PRODUCT,
        notice,
        clearNotice,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
