'use client';

import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { motion } from 'motion/react';

interface AtTheTableProps {
  onSelectRitual: (ritual: {
    title: string;
    subtitle: string;
    image: string;
    description: string;
    curation: string[];
  }) => void;
}

export default function AtTheTable({ onSelectRitual }: AtTheTableProps) {
  const rituals = {
    dining: {
      title: 'The Dining Ritual',
      subtitle: 'Linen, stone, and cool metal.',
      image: '/images/dining-ritual.png',
      description:
        'A warm rustic sourdough loaf rested alongside French salted butter and tactile linen. The Glint Plate serves as an architectural base that captures morning sunlight streaming across travertine stone.',
      curation: [
        'Artisanal Fermented Country Loaf',
        'Raw Milk Churned Salted Butter',
        'Washed Belgian Flax Linen',
        'Natural Honed Roman Travertine',
      ],
    },
    raw: {
      title: 'Raw Elements',
      subtitle: 'A reflective stage for fresh botanical harvest.',
      image: '/images/raw-elements.png',
      description:
        'Sliced black mission figs rested on freshly clipped fig leaves. The mirrored alloy provides a dramatic chiaroscuro backdrop that accentuates deep jewel purples and emerald greens.',
      curation: [
        'Ripe Black Mission Figs',
        'Clipped Wild Fig Foliage',
        'Micro-Crystalline Flake Salt',
        'Cold-Pressed Extra Virgin Olive Oil',
      ],
    },
    nocturne: {
      title: 'Nocturne Setting',
      subtitle: 'Candlelight, wine, and evening reflections.',
      image: '/images/nocturne-setting.png',
      description:
        'When day transitions to evening, the plate comes alive with the golden flicker of beeswax tapers, reflecting amber wine and intimate dinner conversation across the table.',
      curation: [
        'Natural Beeswax Taper Candles',
        'Hand-Blown Crystal Wine Glasses',
        'Low Grazing Candlelight Angle (22°)',
        'Polished Mirror Rim Highlighting',
      ],
    },
  };

  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      id="at-the-table"
      className="w-full border-b border-[#e5e5e3] py-16 md:py-24 bg-[#f9f9f7] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.85, ease: luxuryEase }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pb-12 md:pb-16 border-b border-[#e5e5e3]"
        >
          <div className="lg:col-span-7">
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-4">
              04 / At The Table
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[34px] sm:text-[42px] md:text-[50px] font-light leading-[1.15] text-[#111111]">
              The Art of the Everyday.{' '}
              <span className="italic font-normal">Set a different table.</span>
            </h2>
          </div>

          <div className="lg:col-span-5 flex items-end">
            <p className="font-[family-name:var(--font-inter)] text-[14px] md:text-[15px] text-[#444748] font-light leading-[1.7]">
              A reflective stage for fresh figs, minimalist bread courses, or
              architectural fruit centerpieces.
            </p>
          </div>
        </motion.div>

        {/* Gallery Grid: Left Large + Right 2-Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-10 items-stretch">
          {/* Left Large Card: The Dining Ritual */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase, delay: 0.1 }}
            onClick={() => onSelectRitual(rituals.dining)}
            className="lg:col-span-7 group relative aspect-[4/3] lg:aspect-auto lg:h-[580px] bg-[#eeeeec] border border-[#e5e5e3] overflow-hidden cursor-pointer"
          >
            <Image
              src={rituals.dining.image}
              alt="The Dining Ritual — Sourdough, butter, and linen on travertine"
              fill
              referrerPolicy="no-referrer"
              className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity" />

            {/* Hover Prompt */}
            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111]/80 backdrop-blur-xs text-[#f9f9f7] px-3 py-1 text-[9px] uppercase tracking-[0.2em] flex items-center space-x-1.5 border border-[#111111]">
              <ZoomIn className="w-3 h-3" />
              <span>Inspect Ritual</span>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-[#f9f9f7]">
              <div className="text-[9px] uppercase tracking-[0.25em] font-medium text-[#e5e2e1] mb-1.5">
                The Dining Ritual
              </div>
              <div className="font-[family-name:var(--font-cormorant)] text-[22px] sm:text-[26px] italic font-light text-white drop-shadow-sm">
                Linen, stone, and cool metal.
              </div>
            </div>
          </motion.div>

          {/* Right Column: Two Stacked Cards */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col space-y-6"
          >
            {/* Top Right: Raw Elements */}
            <div
              onClick={() => onSelectRitual(rituals.raw)}
              className="group relative aspect-[16/9] lg:h-[278px] bg-[#eeeeec] border border-[#e5e5e3] overflow-hidden cursor-pointer"
            >
              <Image
                src={rituals.raw.image}
                alt="Raw Elements — Fresh figs on the Glint Plate"
                fill
                referrerPolicy="no-referrer"
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Tag Badge */}
              <div className="absolute bottom-5 left-5 bg-[#f9f9f7]/95 backdrop-blur-xs border border-[#e5e5e3] px-3.5 py-1.5 text-[9px] uppercase tracking-[0.22em] font-semibold text-[#111111] shadow-xs">
                Raw Elements
              </div>

              {/* Hover Prompt */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111]/80 backdrop-blur-xs text-[#f9f9f7] p-1.5 border border-[#111111]">
                <ZoomIn className="w-3 h-3" />
              </div>
            </div>

            {/* Bottom Right: Nocturne Setting */}
            <div
              onClick={() => onSelectRitual(rituals.nocturne)}
              className="group relative aspect-[16/9] lg:h-[278px] bg-[#eeeeec] border border-[#e5e5e3] overflow-hidden cursor-pointer"
            >
              <Image
                src={rituals.nocturne.image}
                alt="Nocturne Setting — Candlelight evening dinner on the Glint Plate"
                fill
                referrerPolicy="no-referrer"
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Tag Badge */}
              <div className="absolute bottom-5 left-5 bg-[#f9f9f7]/95 backdrop-blur-xs border border-[#e5e5e3] px-3.5 py-1.5 text-[9px] uppercase tracking-[0.22em] font-semibold text-[#111111] shadow-xs">
                Nocturne Setting
              </div>

              {/* Hover Prompt */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111]/80 backdrop-blur-xs text-[#f9f9f7] p-1.5 border border-[#111111]">
                <ZoomIn className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
