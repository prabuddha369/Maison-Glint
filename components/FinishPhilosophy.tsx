'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useProductCarousel } from '../hooks/useProductCarousel';
import type { Product } from '../types/store';

interface FinishPhilosophyProps {
  products: Product[];
  loading: boolean;
}

export default function FinishPhilosophy({ products, loading }: FinishPhilosophyProps) {
  const { activeProduct, activeIndex, next, previous, prefersReducedMotion } = useProductCarousel(products);
  const [presetIndex, setPresetIndex] = useState(0);
  const editorial = activeProduct?.editorial?.finish;
  const preset = editorial?.presets[presetIndex] || editorial?.presets[0];

  if (loading || !activeProduct || !editorial || !preset) {
    return <section id="the-finish" className="min-h-[60vh] border-b border-[#e5e5e3]" />;
  }

  return (
    <section id="the-finish" className="w-full border-b border-[#e5e5e3] py-12 sm:py-16 md:py-24 bg-[#f9f9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#e5e5e3] pb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#747878] mb-3">{editorial.sectionLabel}</div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[50px] font-light leading-tight">
              {editorial.title} <span className="italic">{editorial.titleEmphasis}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Previous product" onClick={previous} className="p-2 border border-[#e5e5e3] hover:border-[#111111]"><ArrowLeft className="w-4 h-4" /></button>
            <span className="font-mono text-[10px] text-[#747878]">{String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}</span>
            <button aria-label="Next product" onClick={next} className="p-2 border border-[#e5e5e3] hover:border-[#111111]"><ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>

        <motion.div key={activeProduct.id} initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pt-10">
          <div className="space-y-6">
            {editorial.paragraphs.map((paragraph) => <p key={paragraph} className="text-[15px] text-[#444748] font-light leading-[1.75]">{paragraph}</p>)}
            <div className="pt-6 border-t border-[#e5e5e3]">
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#747878] mb-3">{editorial.presetLabel}</div>
              <div className="flex flex-wrap gap-2">
                {editorial.presets.map((item, index) => <button key={item.id || item.key} onClick={() => setPresetIndex(index)} className={`px-3 py-2 border text-[10px] uppercase tracking-[0.14em] ${index === presetIndex ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]' : 'border-[#e5e5e3]'}`}>{item.label}</button>)}
              </div>
            </div>
          </div>
          <div className="bg-[#f4f4f2] border border-[#e5e5e3] p-6 sm:p-10">
            <div className="flex items-center justify-between border-b border-[#e5e5e3] pb-4 mb-8">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">{editorial.spectrumLabel}</span>
              <Sun className="w-4 h-4 text-[#c5a059]" />
            </div>
            <div className="relative h-48 flex items-center justify-center border-b border-[#e5e5e3]">
              <div className="absolute bottom-8 left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-[#c5a059]" />
              <div className="absolute bottom-10 left-1/2 h-32 w-px origin-bottom bg-[#c5a059]" style={{ transform: `translateX(-50%) rotate(${preset.angle - 45}deg)` }} />
              <div className="absolute bottom-10 left-1/2 h-32 w-px origin-bottom bg-[#999999]" style={{ transform: `translateX(-50%) rotate(${45 - preset.angle}deg)` }} />
              <span className="absolute bottom-1 text-[9px] uppercase tracking-[0.18em] text-[#747878]">{preset.angle}° · {preset.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 text-[11px]">
              <div><div className="text-[9px] uppercase tracking-[0.18em] text-[#747878]">{editorial.roughnessLabel}</div><div className="font-medium mt-1">{preset.roughness}</div></div>
              <div><div className="text-[9px] uppercase tracking-[0.18em] text-[#747878]">{activeProduct.name}</div><div className="font-medium mt-1">{preset.dispersion}</div></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
