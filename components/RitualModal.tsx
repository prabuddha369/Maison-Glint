'use client';

import Image from 'next/image';
import { X, Sparkles, Check, Compass } from 'lucide-react';
import { resolveImageUrl } from '../lib/products';

interface RitualModalProps {
  ritual: {
    title: string;
    subtitle: string;
    image: string;
    description: string;
    curation: string[];
  } | null;
  onClose: () => void;
  onRequestAccess: () => void;
}

export default function RitualModal({
  ritual,
  onClose,
  onRequestAccess,
}: RitualModalProps) {
  if (!ritual) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      {/* Container */}
      <div
        id="ritual-inspector-modal"
        className="relative w-full max-w-3xl bg-[#f9f9f7] border border-[#e5e5e3] p-5 sm:p-8 md:p-10 shadow-2xl max-h-[92vh] flex flex-col justify-between overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close ritual inspector"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-[#595D5D] hover:text-[#111111] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div>
          {/* Header */}
          <div className="text-xs uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-1.5 sm:mb-2">
            Maison Glint / Dining Ritual Series
          </div>
          <h3 className="font-[family-name:var(--font-cormorant)] text-[26px] sm:text-[34px] md:text-[40px] font-light text-[#111111] leading-tight mb-1">
            {ritual.title}
          </h3>
          <div className="font-[family-name:var(--font-cormorant)] text-[16px] sm:text-[20px] italic text-[#595D5D] font-light mb-4 sm:mb-6">
            {ritual.subtitle}
          </div>

          {/* Large Image Frame */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] bg-[#eeeeec] border border-[#e5e5e3] mb-4 sm:mb-6 overflow-hidden">
            <Image
              src={resolveImageUrl(ritual.image)}
              alt={ritual.title}
              fill
              sizes="(max-width: 640px) 100vw, 672px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>

          {/* Editorial Content */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 pt-1 sm:pt-2">
            <div className="sm:col-span-7">
              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                Ritual Narrative
              </div>
              <p className="text-[13px] sm:text-[14px] text-[#444748] font-light leading-[1.7]">
                {ritual.description}
              </p>
            </div>

            <div className="sm:col-span-5 bg-[#f4f4f2] border border-[#e5e5e3] p-4 sm:p-5">
              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-2 sm:mb-3">
                Curated Elements
              </div>
              <ul className="space-y-1.5 sm:space-y-2 text-xs text-[#444748] font-light">
                {ritual.curation.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-[#c5a059] mt-1.5 sm:mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#e5e5e3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs uppercase tracking-[0.18em] text-[#595D5D] text-center sm:text-left">
            Zurich Atelier · Series 01 Tableware
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2.5 border border-[#e5e5e3] text-xs uppercase tracking-[0.16em] font-medium text-[#111111] hover:border-[#111111] transition-all cursor-pointer text-center"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestAccess();
              }}
              className="flex-2 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-2.5 bg-[#111111] text-[#f9f9f7] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer text-center"
            >
              Reserve First Edition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
