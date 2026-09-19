'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    shippingCost,
    taxEstimate,
    total,
    itemCount,
    maxPerProduct,
    notice,
    clearNotice,
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-[#111111]/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#f9f9f7] border-l border-[#e5e5e3] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-6 border-b border-[#e5e5e3] flex items-center justify-between bg-[#ffffff]">
            <div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#747878] font-medium block">
                Acquisition Drawer
              </span>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#111111] leading-none mt-1">
                Your Selection ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              aria-label="Close acquisition drawer"
              className="p-2 text-[#111111] hover:text-[#c5a059] transition-colors border border-transparent hover:border-[#e5e5e3] cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Allocation Notice Banner */}
          {notice && (
            <div className="bg-[#fff9ee] border-b border-[#ebd7b2] px-6 py-2.5 text-[11px] text-[#8a681c] flex items-center justify-between">
              <span className="font-light">{notice}</span>
              <button
                onClick={clearNotice}
                aria-label="Dismiss notice"
                className="p-1 text-[#8a681c] hover:text-[#111111] transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-[#e5e5e3]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-12 h-12 border border-[#e5e5e3] flex items-center justify-center text-[#747878] mb-4">
                  <Package className="w-6 h-6 stroke-[1.2]" />
                </div>
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#111111] mb-2">
                  No Objects Selected
                </h3>
                <p className="text-[12px] text-[#747878] font-light max-w-xs mb-6">
                  Explore our restricted serial allocations to begin your domestic curation.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-3 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-colors cursor-pointer"
                >
                  Return to Atelier
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-5 flex gap-4 first:pt-0 last:pb-0">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 bg-[#ecece9] border border-[#e5e5e3] shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-[family-name:var(--font-cormorant)] text-[17px] font-medium text-[#111111] leading-tight">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="text-[#8c8c8c] hover:text-[#d9534f] transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>

                      {item.specifications?.gauge && (
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#747878] mt-1 font-light">
                          {item.specifications.gauge}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f0f0ee]">
                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#d6d6d4] bg-[#ffffff]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="p-1.5 hover:bg-[#ecece9] text-[#111111] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-[11px] font-medium text-[#111111]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (maxPerProduct || 4)}
                            aria-label="Increase quantity"
                            title={
                              item.quantity >= (maxPerProduct || 4)
                                ? 'Atelier allocation limit: 4 pieces per patron'
                                : 'Increase quantity'
                            }
                            className={`p-1.5 transition-colors ${
                              item.quantity >= (maxPerProduct || 4)
                                ? 'opacity-25 cursor-not-allowed text-[#8c8c8c]'
                                : 'hover:bg-[#ecece9] text-[#111111] cursor-pointer'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-[family-name:var(--font-cormorant)] text-[17px] text-[#111111] font-semibold">
                          ${(item.price * item.quantity).toLocaleString()} USD
                        </span>
                      </div>

                      {item.quantity >= (maxPerProduct || 4) && (
                        <p className="text-[10px] text-[#8c8c8c] italic mt-1.5 font-light">
                          Atelier allocation limit: Maximum 4 exemplars per edition
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Financial Breakdown */}
          {items.length > 0 && (
            <div className="border-t border-[#e5e5e3] bg-[#ffffff] p-6 space-y-4">
              <div className="space-y-2 text-[11px] uppercase tracking-[0.14em]">
                <div className="flex justify-between text-[#747878]">
                  <span>Subtotal</span>
                  <span className="text-[#111111] font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#747878]">
                  <span>Insured Cross-Border Freight</span>
                  <span className="text-[#111111] font-medium">
                    {shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#747878]">
                  <span>Estimated Atelier Duty / Tax</span>
                  <span className="text-[#111111] font-medium">${taxEstimate.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-[#e5e5e3] flex justify-between text-[13px] font-semibold text-[#111111]">
                  <span>Total Investment</span>
                  <span className="font-[family-name:var(--font-cormorant)] text-xl font-bold">
                    ${total.toLocaleString()} USD
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-4 bg-[#111111] text-[#f9f9f7] hover:bg-[#2b2b2b] text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center justify-center space-x-2 transition-all border border-[#111111]"
                >
                  <span>Proceed to Verified Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[9px] uppercase tracking-[0.15em] text-[#747878] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Encrypted Vault Checkout · Serial Number Authenticated</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
