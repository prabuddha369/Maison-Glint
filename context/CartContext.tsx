'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { CartItem, Product, ProductSpecifications } from '../types/store';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mg_maison_glint_cart_v1';
const ESTIMATED_TAX_RATE = 0.08; // 8% luxury cross-border tax estimate
const STANDARD_SHIPPING_FLAT = 45; // Complimentary over $1000, flat $45 otherwise

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Save cart to localStorage upon changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Cart sync warning:', e);
    }
  }, [items]);

  const addItem = (
    product: Product,
    quantity: number = 1,
    specifications?: ProductSpecifications
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency || 'USD',
        quantity,
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
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
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
    if (items.length === 0) return 0;
    return subtotal >= 1000 ? 0 : STANDARD_SHIPPING_FLAT;
  }, [items.length, subtotal]);

  const taxEstimate = useMemo(() => {
    return Math.round(subtotal * ESTIMATED_TAX_RATE);
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + shippingCost + taxEstimate;
  }, [subtotal, shippingCost, taxEstimate]);

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
