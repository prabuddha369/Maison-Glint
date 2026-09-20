'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/store';
import { resolveImageUrl } from '../lib/products';

interface CatalogGridProps {
  products?: Product[];
  loading?: boolean;
  onSelectProduct?: (product: Product, index: number) => void;
}

export default function CatalogGrid({
  products: suppliedProducts,
  loading: suppliedLoading,
  onSelectProduct,
}: CatalogGridProps) {
  const products = suppliedProducts || [];
  const loading = suppliedLoading ?? false;
  const { addItem } = useCart();
  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  return (
    <section id="collection" className="w-full py-16 sm:py-24 bg-[#ffffff] border-b border-[#e5e5e3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, ease: luxuryEase }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 border-b border-[#e5e5e3] pb-8"
        >
          <div>
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] font-medium text-[#c5a059] mb-3">
              The Complete Atelier Collection
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[42px] font-light text-[#111111] leading-tight">
              Curated Objects for Modern Gastronomy
            </h2>
          </div>
          <p className="font-[family-name:var(--font-inter)] text-[13px] sm:text-[14px] text-[#747878] font-light max-w-md mt-4 md:mt-0 leading-relaxed">
            Every object is cataloged directly from our verified atelier ledger,
            each serialized with laser-engraved hallmarks.
          </p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product, idx) => {
            const displayImage = resolveImageUrl(product.images?.[0]);
            const objectCode = product.id.replace(/-/g, ' ').toUpperCase();

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease: luxuryEase, delay: idx * 0.08 }}
                className="group flex flex-col justify-between bg-[#f9f9f7] border border-[#e5e5e3] hover:border-[#111111] transition-all duration-300"
              >
                {/* Image Container */}
                <div
                  onClick={() => onSelectProduct?.(product, idx)}
                  className={onSelectProduct ? 'cursor-pointer' : ''}
                >
                  <div className="relative w-full aspect-[4/3] bg-[#eeeeec] overflow-hidden border-b border-[#e5e5e3]">
                    <Image
                      src={displayImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      referrerPolicy="no-referrer"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 bg-[#f9f9f7]/95 backdrop-blur-sm border border-[#e5e5e3] px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] font-medium text-[#111111]">
                      {product.editionRemaining !== undefined
                        ? `${product.editionRemaining} left of ${product.editionTotal || 250}`
                        : 'Atelier Batch'}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="text-[9px] uppercase tracking-[0.22em] text-[#c5a059] font-medium mb-1">
                      {objectCode.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-[22px] font-light text-[#111111] mb-2 group-hover:text-[#c5a059] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[12px] text-[#444748] font-light leading-relaxed line-clamp-2 mb-4">
                      {product.description}
                    </p>

                    {/* Specification Badges */}
                    <div className="space-y-1 text-[11px] text-[#747878] border-t border-[#e5e5e3] pt-3 mb-2 font-mono">
                      {product.specifications?.diameter && (
                        <div className="flex justify-between">
                          <span className="text-[#8c8c8c] font-sans text-[10px] uppercase">Size</span>
                          <span>{product.specifications.diameter}</span>
                        </div>
                      )}
                      {product.specifications?.finish && (
                        <div className="flex justify-between">
                          <span className="text-[#8c8c8c] font-sans text-[10px] uppercase">Finish</span>
                          <span className="truncate max-w-[140px]">{product.specifications.finish}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-5 pt-0 border-t border-[#e5e5e3] mt-2">
                  <div className="flex items-center justify-between py-3">
                    <span className="font-mono text-[16px] text-[#111111] font-medium">
                      ${product.price} <span className="text-[10px] text-[#747878]">{product.currency || 'USD'}</span>
                    </span>
                    <Link
                      href={`/product/${product.id}`}
                      className="text-[10px] uppercase tracking-[0.16em] text-[#747878] hover:text-[#111111] flex items-center space-x-1"
                    >
                      <span>Monograph</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <button
                    onClick={() => addItem(product, 1, product.specifications)}
                    className="w-full py-2.5 bg-[#111111] text-[#f9f9f7] hover:bg-[#2b2b2b] text-[9px] uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3 text-[#c5a059]" />
                    <span>Acquire Edition</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
