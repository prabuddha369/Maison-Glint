'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, ShieldCheck, ArrowRight } from 'lucide-react';
import type { Product } from '../types/store';
import { resolveImageUrl } from '../lib/products';

interface AcquisitionBagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  onUpdateQuantity: (q: number) => void;
  onProceedCheckout: () => void;
  product?: Product;
}

export default function AcquisitionBagDrawer({
  isOpen,
  onClose,
  quantity,
  onUpdateQuantity,
  onProceedCheckout,
  product,
}: AcquisitionBagDrawerProps) {
  const [packagingType, setPackagingType] = useState<'archival' | 'hospitality'>('archival');
  const pricePerItem = product?.price || 0;
  const subtotal = pricePerItem * quantity;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      {/* Drawer Container */}
      <div
        id="acquisition-bag-drawer"
        className="relative w-full max-w-md bg-[#f9f9f7] h-full border-l border-[#e5e5e3] flex flex-col justify-between p-6 sm:p-8 shadow-2xl overflow-y-auto"
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between border-b border-[#e5e5e3] pb-5 mb-6">
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-1">
                Acquisition Drawer
              </div>
              <h3 className="font-[family-name:var(--font-cormorant)] text-[26px] font-light text-[#111111] leading-none">
                Allocated Pieces ({quantity})
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label="Close bag drawer"
              className="p-2 text-[#747878] hover:text-[#111111] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {quantity > 0 ? (
            <div className="space-y-6">
              {/* Product Item Card */}
              <div className="bg-[#f4f4f2] border border-[#e5e5e3] p-3 sm:p-4 flex gap-3 sm:gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#eeeeec] border border-[#e5e5e3] shrink-0 overflow-hidden">
                  <Image
                    src={resolveImageUrl(product?.images?.[0])}
                    alt={product?.name || 'Selected product'}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.22em] text-[#c5a059] font-medium">
                      {product?.id || 'Selected edition'}
                    </div>
                    <h4 className="font-[family-name:var(--font-cormorant)] text-[16px] sm:text-[18px] font-light text-[#111111] leading-tight truncate sm:whitespace-normal">
                      {product?.name || 'Selected edition'}
                    </h4>
                    <div className="text-[12px] font-medium text-[#111111] mt-0.5 sm:mt-1">
                      ${pricePerItem} {product?.currency || 'USD'}
                    </div>
                  </div>

                  {/* Quantity and Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e3]">
                    <div className="flex items-center border border-[#e5e5e3] bg-[#f9f9f7]">
                      <button
                        onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#e5e5e3] transition-colors text-[11px]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-[11px] font-mono font-medium text-[#111111]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(Math.min(6, quantity + 1))}
                        className="w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#e5e5e3] transition-colors text-[11px]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onUpdateQuantity(0)}
                      className="text-[9px] uppercase tracking-[0.16em] text-[#747878] hover:text-[#111111] underline underline-offset-2 py-1 px-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Packaging Preferences */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111]">
                  Packaging & Provenance
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPackagingType('archival')}
                    className={`p-3 text-left border text-[11px] transition-all ${
                      packagingType === 'archival'
                        ? 'border-[#111111] bg-[#f4f4f2]'
                        : 'border-[#e5e5e3] bg-[#f9f9f7] hover:border-[#8c8c8c]'
                    }`}
                  >
                    <div className="font-medium text-[#111111] uppercase tracking-[0.1em] text-[10px]">
                      Archival Box
                    </div>
                    <div className="text-[10px] text-[#747878] mt-0.5">
                      Numbered certificate
                    </div>
                  </button>

                  <button
                    onClick={() => setPackagingType('hospitality')}
                    className={`p-3 text-left border text-[11px] transition-all ${
                      packagingType === 'hospitality'
                        ? 'border-[#111111] bg-[#f4f4f2]'
                        : 'border-[#e5e5e3] bg-[#f9f9f7] hover:border-[#8c8c8c]'
                    }`}
                  >
                    <div className="font-medium text-[#111111] uppercase tracking-[0.1em] text-[10px]">
                      Service Crate
                    </div>
                    <div className="text-[10px] text-[#747878] mt-0.5">
                      Multi-tier storage
                    </div>
                  </button>
                </div>
              </div>

              {/* Security & Provenance Bullet */}
              <div className="p-3 bg-[#f4f4f2] border border-[#e5e5e3] flex items-center space-x-2.5 text-[11px] text-[#444748]">
                <ShieldCheck className="w-4 h-4 text-[#c5a059] shrink-0" />
                <span>Individually laser-inscribed with serial stamp upon casting.</span>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-[13px] text-[#747878] font-light mb-6">
                Your acquisition drawer is empty.
              </p>
              <button
                onClick={() => {
                  onUpdateQuantity(1);
                }}
                className="inline-flex items-center px-6 py-3 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.2em] font-medium"
              >
                Add {product?.name || 'an exemplar'}
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout */}
        {quantity > 0 && (
          <div className="pt-6 border-t border-[#e5e5e3] space-y-4">
            <div className="flex justify-between text-[12px]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#747878]">
                Delivery
              </span>
              <span className="font-medium text-[#111111]">Complimentary</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111]">
                Estimated Subtotal
              </span>
              <span className="font-[family-name:var(--font-cormorant)] text-[24px] font-normal text-[#111111]">
                ${subtotal} USD
              </span>
            </div>

            <button
              id="drawer-checkout-btn"
              onClick={onProceedCheckout}
              className="w-full bg-[#111111] text-[#f9f9f7] py-4 text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer flex items-center justify-center space-x-2 border border-[#111111]"
            >
              <span>Proceed to Allocation Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
