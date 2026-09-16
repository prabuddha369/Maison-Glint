'use client';

import Image from 'next/image';
import { X, Sparkles, Check, Compass } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs animate-fadeIn">
      {/* Container */}
      <div
        id="ritual-inspector-modal"
        className="relative w-full max-w-3xl bg-[#f9f9f7] border border-[#e5e5e3] p-6 sm:p-10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col justify-between overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close ritual inspector"
          className="absolute top-6 right-6 p-2 text-[#747878] hover:text-[#111111] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div>
          {/* Header */}
          <div className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-2">
            Maison Glint / Dining Ritual Series
          </div>
          <h3 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[40px] font-light text-[#111111] leading-tight mb-1">
            {ritual.title}
          </h3>
          <div className="font-[family-name:var(--font-cormorant)] text-[18px] sm:text-[20px] italic text-[#747878] font-light mb-6">
            {ritual.subtitle}
          </div>

          {/* Large Image Frame */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-[#eeeeec] border border-[#e5e5e3] mb-6 overflow-hidden">
            <Image
              src={ritual.image}
              alt={ritual.title}
              fill
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>

          {/* Editorial Content */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
            <div className="sm:col-span-7">
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111] mb-2">
                Ritual Narrative
              </div>
              <p className="text-[14px] text-[#444748] font-light leading-[1.7]">
                {ritual.description}
              </p>
            </div>

            <div className="sm:col-span-5 bg-[#f4f4f2] border border-[#e5e5e3] p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111] mb-3">
                Curated Elements
              </div>
              <ul className="space-y-2 text-[12px] text-[#444748] font-light">
                {ritual.curation.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-[#c5a059] mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 mt-6 border-t border-[#e5e5e3] flex flex-wrap items-center justify-between gap-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#747878]">
            Zurich Atelier · Series 01 Tableware
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-[#e5e5e3] text-[10px] uppercase tracking-[0.16em] font-medium text-[#111111] hover:border-[#111111] transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestAccess();
              }}
              className="px-6 py-2.5 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.18em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer"
            >
              Reserve First Edition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
