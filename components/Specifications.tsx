'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useProductCarousel } from '../hooks/useProductCarousel';
import type { Product } from '../types/store';

interface SpecificationsProps {
  products: Product[];
  loading: boolean;
}

export default function Specifications({ products, loading }: SpecificationsProps) {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const { activeProduct, activeIndex, next, previous, prefersReducedMotion } = useProductCarousel(products);
  const editorial = activeProduct?.editorial?.specifications;

  if (loading || !activeProduct || !editorial) {
    return <section id="specifications" className="min-h-[55vh] border-b border-[#e5e5e3]" />;
  }

  return (
    <section id="specifications" className="w-full border-b border-[#e5e5e3] py-12 sm:py-16 md:py-24 bg-[#f9f9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#e5e5e3] pb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#747878] mb-3">{editorial.sectionLabel}</div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[50px] font-light leading-tight">{editorial.title} <span className="italic">{editorial.titleEmphasis}</span></h2>
            <p className="max-w-md mt-4 text-[14px] text-[#444748] font-light leading-[1.7]">{editorial.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Previous product" onClick={previous} className="p-2 border border-[#e5e5e3] hover:border-[#111111]"><ArrowLeft className="w-4 h-4" /></button>
            <span className="font-mono text-[10px] text-[#747878]">{String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}</span>
            <button aria-label="Next product" onClick={next} className="p-2 border border-[#e5e5e3] hover:border-[#111111]"><ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
        <motion.div key={activeProduct.id} initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pt-10">
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
