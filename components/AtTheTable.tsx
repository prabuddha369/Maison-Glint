'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, ZoomIn } from 'lucide-react';
import { motion } from 'motion/react';
import { useProductCarousel } from '../hooks/useProductCarousel';
import type { Product } from '../types/store';
import { resolveImageUrl } from '../lib/products';

interface RitualSelection {
  title: string;
  subtitle: string;
  image: string;
  description: string;
  curation: string[];
}

interface AtTheTableProps {
  products: Product[];
  loading: boolean;
  onSelectRitual: (ritual: RitualSelection) => void;
  activeProduct?: Product;
  activeIndex?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function AtTheTable({
  products,
  loading,
  onSelectRitual,
  activeProduct: propActiveProduct,
  activeIndex: propActiveIndex,
  onNext,
  onPrevious,
}: AtTheTableProps) {
  const carousel = useProductCarousel(products);
  const activeProduct = propActiveProduct || carousel.activeProduct;
  const activeIndex = typeof propActiveIndex === 'number' ? propActiveIndex : carousel.activeIndex;
  const next = onNext || carousel.next;
  const previous = onPrevious || carousel.previous;
  const prefersReducedMotion = carousel.prefersReducedMotion;

  const editorial = activeProduct?.editorial?.table;

  if (loading || !activeProduct || !editorial || editorial.rituals.length === 0) {
    return (
      <section id="at-the-table" className="min-h-[40vh] border-b border-[#e5e5e3] flex items-center justify-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#747878] animate-pulse font-mono">
          Loading Rituals of the Table...
        </div>
      </section>
    );
  }

  return (
    <section id="at-the-table" className="w-full border-b border-[#e5e5e3] py-12 sm:py-16 md:py-24 bg-[#f9f9f7]">
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
          <p className="max-w-xl mt-4 text-[14px] text-[#444748] font-light leading-[1.7]">
            {editorial.description}
          </p>
        </div>
        <motion.div key={activeProduct.id} initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-10">
          {editorial.rituals.map((ritual) => {
            const ritualImg = resolveImageUrl(ritual.imageUrl);
            return (
              <button
                key={ritual.id || ritual.title}
                onClick={() =>
                  onSelectRitual({
                    title: ritual.title,
                    subtitle: ritual.subtitle,
                    image: ritualImg,
                    description: ritual.description,
                    curation: ritual.items.map((item) => item.label),
                  })
                }
                className="group relative aspect-[4/3] overflow-hidden border border-[#e5e5e3] text-left bg-[#eeeeec]"
              >
                <Image
                  src={ritualImg}
                  alt={ritual.imageAlt || ritual.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#e5c98b] mb-2">{ritual.title}</div>
                  <div className="font-[family-name:var(--font-cormorant)] text-[22px] italic">{ritual.subtitle}</div>
                  <div className="mt-3 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.16em]">
                    <ZoomIn className="w-3 h-3" /> {activeProduct.name}
                  </div>
                </div>
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
