'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useProductCarousel } from '../hooks/useProductCarousel';
import type { Product } from '../types/store';

interface SpecificationsProps {
  products: Product[];
  loading: boolean;
  activeProduct?: Product;
  activeIndex?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function Specifications({
  products,
  loading,
  activeProduct: propActiveProduct,
  activeIndex: propActiveIndex,
  onNext,
  onPrevious,
}: SpecificationsProps) {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const carousel = useProductCarousel(products);
  const activeProduct = propActiveProduct || carousel.activeProduct;
  const activeIndex = typeof propActiveIndex === 'number' ? propActiveIndex : carousel.activeIndex;
  const next = onNext || carousel.next;
  const previous = onPrevious || carousel.previous;
  const prefersReducedMotion = carousel.prefersReducedMotion;

  const editorial = activeProduct?.editorial?.specifications;

  if (loading || !activeProduct || !editorial) {
    return (
      <section id="specifications" className="min-h-[40vh] border-b border-[#e5e5e3] flex items-center justify-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#747878] animate-pulse font-mono">
          Loading Technical Architecture...
        </div>
      </section>
    );
  }

  return (
    <section id="specifications" className="w-full border-b border-[#e5e5e3] py-12 sm:py-16 md:py-24 bg-[#f9f9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="border-b border-[#e5e5e3] pb-8">
          {/* Eyebrow & Carousel Switcher */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-[#747878]">
              {editorial.sectionLabel}
            </div>
            {products && products.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous product"
                  onClick={previous}
                  className="p-1 text-[#747878] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[9px] text-[#747878] whitespace-nowrap">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
                </span>
                <button
                  aria-label="Next product"
                  onClick={next}
                  className="p-1 text-[#747878] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <h2 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[50px] font-light leading-tight">
            {editorial.title} <span className="italic">{editorial.titleEmphasis}</span>
          </h2>
          <p className="max-w-md mt-4 text-[14px] text-[#444748] font-light leading-[1.7]">
            {editorial.description}
          </p>
        </div>
        <motion.div key={activeProduct.id} initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pt-10">
          <div className="lg:col-span-5 flex items-start gap-2">
            <button onClick={() => setUnitSystem('metric')} className={`px-4 py-2 border text-[10px] uppercase tracking-[0.2em] ${unitSystem === 'metric' ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]' : 'border-[#e5e5e3]'}`}>{editorial.metricToggleLabel}</button>
            <button onClick={() => setUnitSystem('imperial')} className={`px-4 py-2 border text-[10px] uppercase tracking-[0.2em] ${unitSystem === 'imperial' ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]' : 'border-[#e5e5e3]'}`}>{editorial.imperialToggleLabel}</button>
          </div>
          <div className="lg:col-span-7 bg-[#f4f4f2] border border-[#e5e5e3] p-5 sm:p-8">
            <div className="divide-y divide-[#e5e5e3]">
              {editorial.rows.map((row) => <div key={row.id || row.label} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><span className="text-[10px] uppercase tracking-[0.18em] text-[#747878]">{row.label}</span><span className="text-[13px] font-medium">{unitSystem === 'metric' ? row.metric : row.imperial}</span></div>)}
            </div>
            <div className="pt-6 mt-4 border-t border-[#e5e5e3] flex flex-wrap justify-between gap-3 text-[9px] uppercase tracking-[0.18em] text-[#747878]"><span>{editorial.serialStamp}</span><span className="text-[#c5a059]">{editorial.archiveLabel}</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
