'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, ShoppingBag, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../hooks/useCart';
import { useProduct } from '../lib/catalog';

interface ObjectShowcaseProps {
  onRequestPriorityAccess: () => void;
}

export default function ObjectShowcase({
  onRequestPriorityAccess,
}: ObjectShowcaseProps) {
  const { addItem } = useCart();
  const { product, loading } = useProduct('object-01');
  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const luxuryEase = [0.16, 1, 0.3, 1] as const;
  const showcaseImage = product.images?.[2] || product.images?.[0] || '/images/scallops-macro.png';
  const priceDisplay = product.price ? `$${product.price}` : '$680';

  return (
    <section
      id="the-plate"
      className="w-full border-b border-[#e5e5e3] py-12 sm:py-16 md:py-24 bg-[#f9f9f7] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.85, ease: luxuryEase }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 pb-8 sm:pb-12 md:pb-16 border-b border-[#e5e5e3]"
        >
          <div className="lg:col-span-7">
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-3 sm:mb-4">
              01 / The Glint Plate
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[30px] sm:text-[40px] md:text-[50px] font-light leading-[1.12] text-[#111111]">
              The First Object — One plate. <br className="hidden sm:inline" />
              <span className="italic font-normal">Endless possibilities.</span>
            </h2>
          </div>

          <div className="lg:col-span-5 flex items-end">
            <p className="font-[family-name:var(--font-inter)] text-[14px] md:text-[15px] text-[#444748] font-light leading-[1.7]">
              A simple form, a reflective surface, a different way to set the
              table. Clean lines and a luminous finish make the everyday feel a
              little less ordinary.
            </p>
          </div>
        </motion.div>

        {/* Section Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pt-8 sm:pt-12 md:pt-16 items-start">
          {/* Left Column: Macro Image + Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase, delay: 0.1 }}
            className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-6"
          >
            {/* Macro Close-up Image Container */}
            <div className="relative w-full aspect-[4/3] bg-[#eeeeec] border border-[#e5e5e3] overflow-hidden group">
              <Image
                src={showcaseImage}
                alt={product.name || 'Macro profile of the mirror-polished steel rim bevel'}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                referrerPolicy="no-referrer"
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />

              {/* Top-left Pill Badge */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-[#f9f9f7]/95 backdrop-blur-sm border border-[#e5e5e3] px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.2em] font-medium text-[#111111] shadow-xs">
                {product.specifications?.finish || 'Optical Rim Bevel · Profile'}
              </div>

              {/* Reflection Accent Line */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
            </div>

            {/* Feature Sub-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-[#f4f4f2] p-4 sm:p-6 border border-[#e5e5e3] transition-all hover:border-[#c5a059]/60">
                <div className="text-[9px] uppercase tracking-[0.22em] font-semibold text-[#111111] mb-1.5 sm:mb-2 flex items-center justify-between">
                  <span>Surface Refraction</span>
                  <span className="w-1.5 h-1.5 bg-[#c5a059]" />
                </div>
                <p className="text-[12px] sm:text-[13px] text-[#444748] font-light leading-[1.6]">
                  Distortion-free hand-buffed alloy mirroring ambient candlelight
                  and tactile ceramics.
                </p>
              </div>

              <div className="bg-[#f4f4f2] p-4 sm:p-6 border border-[#e5e5e3] transition-all hover:border-[#c5a059]/60">
                <div className="text-[9px] uppercase tracking-[0.22em] font-semibold text-[#111111] mb-1.5 sm:mb-2 flex items-center justify-between">
                  <span>Ergonomic Lift</span>
                  <span className="w-1.5 h-1.5 bg-[#c5a059]" />
                </div>
                <p className="text-[12px] sm:text-[13px] text-[#444748] font-light leading-[1.6]">
                  18mm gradual rise engineered for fingertip stability during
                  hospitality courses.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Title, Allocation Status, Accordions */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-1.5 sm:mb-2 flex items-center space-x-2">
              <span>Maison Glint / {product.id.startsWith('object-') ? product.id.split('-').slice(0, 2).join(' ').toUpperCase() : 'OBJECT 01'}</span>
              {loading && <span className="w-1.5 h-1.5 bg-[#c5a059] animate-ping" />}
            </div>

            <h3 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[40px] md:text-[44px] font-light text-[#111111] leading-tight mb-2 sm:mb-3">
              {product.name}
            </h3>

            <p className="text-[13px] sm:text-[14px] text-[#444748] font-light leading-[1.6] mb-6 sm:mb-8">
              {product.description}
            </p>

            {/* Status & Priority Request Card */}
            <div className="bg-[#f4f4f2] border border-[#e5e5e3] p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em]">
                <span className="font-semibold text-[#747878]">Status</span>
                <span className="bg-[#eeeeec] text-[#111111] px-2 sm:px-2.5 py-1 border border-[#e0e0de] font-medium">
                  {product.editionRemaining !== undefined
                    ? `Edition: ${product.editionRemaining} of ${product.editionTotal || 250} Exemplars`
                    : 'The First Release — Active Allocation'}
                </span>
              </div>

              <p className="text-[12px] sm:text-[13px] text-[#444748] font-light leading-[1.6] mb-4 sm:mb-6">
                Serialized private batch allocation active in Atelier catalog. Edition
                verification certificate and serial hallmark included with each boxed exemplar.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="acquire-plate-btn"
                  onClick={() => addItem(product, 1, product.specifications)}
                  className="flex-1 bg-[#111111] text-[#f9f9f7] py-3.5 px-4 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer text-center border border-[#111111] flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Acquire Edition · {priceDisplay}</span>
                </button>
                <button
                  id="request-priority-access-btn"
                  onClick={onRequestPriorityAccess}
                  className="bg-transparent text-[#111111] py-3.5 px-4 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-[#ecece9] transition-all cursor-pointer text-center border border-[#111111]"
                >
                  Priority Access
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-[#e0e0de] flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#747878]">
                <span>Provenance: {product.specifications?.origin || 'Atelier Zurich / Milan'}</span>
                <Link
                  href={`/product/${product.id}`}
                  className="inline-flex items-center space-x-1 text-[#111111] hover:text-[#c5a059] transition-colors"
                >
                  <span>Monograph View</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Accordion Group */}
            <div className="border-t border-[#e5e5e3] divide-y divide-[#e5e5e3]">
              {/* Product Details Accordion */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('details')}
                  className="w-full flex items-center justify-between text-left text-[11px] uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#c5a059] transition-colors py-1 cursor-pointer"
                >
                  <span>Product Details</span>
                  <span className="text-[#111111] ml-4">
                    {openAccordion === 'details' ? (
                      <Minus className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
                {openAccordion === 'details' && (
                  <div className="pt-3 pb-2 text-[13px] text-[#444748] font-light leading-[1.7] space-y-2">
                    <p>
                      Crafted from surgical-grade AISI 316 austenitic stainless steel, resistant to food acids, citrus, and extreme temperature swings.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[12px]">
                      <div><span className="font-medium text-[#111111]">Outer Diameter:</span> {product.specifications?.diameter || '280 mm'}</div>
                      <div><span className="font-medium text-[#111111]">Rim Height:</span> {product.specifications?.rimHeight || '18 mm'}</div>
                      <div><span className="font-medium text-[#111111]">Core Gauge:</span> {product.specifications?.gauge || '18-Gauge Surgical 316L Core'}</div>
                      <div><span className="font-medium text-[#111111]">Net Mass:</span> {product.specifications?.weight || '1,420 grams'}</div>
                      <div><span className="font-medium text-[#111111]">Finish:</span> {product.specifications?.finish || 'Mirror Chrome'}</div>
                      <div><span className="font-medium text-[#111111]">Origin:</span> {product.specifications?.origin || 'Atelier Zurich / Milan'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Care & Use Accordion */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex items-center justify-between text-left text-[11px] uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#c5a059] transition-colors py-1 cursor-pointer"
                >
                  <span>Care & Use</span>
                  <span className="text-[#111111] ml-4">
                    {openAccordion === 'care' ? (
                      <Minus className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
                {openAccordion === 'care' && (
                  <div className="pt-3 pb-2 text-[13px] text-[#444748] font-light leading-[1.7] space-y-2">
                    <p>
                      Wash by hand with warm water and neutral detergent using a soft microfiber cloth. Dry promptly to preserve the flawless optical mirror sheen.
                    </p>
                    <p>
                      Freezer safe for chilling raw seafood courses, crudo, or fruit desserts; oven-warm safe up to 250°C. Do not microwave.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery & Provenance Accordion */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion('delivery')}
                  className="w-full flex items-center justify-between text-left text-[11px] uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#c5a059] transition-colors py-1 cursor-pointer"
                >
                  <span>Delivery & Provenance</span>
                  <span className="text-[#111111] ml-4">
                    {openAccordion === 'delivery' ? (
                      <Minus className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
                {openAccordion === 'delivery' && (
                  <div className="pt-3 pb-2 text-[13px] text-[#444748] font-light leading-[1.7] space-y-2">
                    <p>
                      Each exemplar from Batch 01 is individually serialized (No. 001–250) with laser stamp engraving on the underside base.
                    </p>
                    <p>
                      Delivered in custom charcoal archival gift packaging with signed authenticity documentation and serialized collector certificate.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
