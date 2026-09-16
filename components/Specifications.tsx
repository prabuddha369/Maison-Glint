'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

export default function Specifications() {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const specsData = [
    {
      label: 'DIAMETER',
      metric: '280 mm',
      imperial: '11.02 in',
    },
    {
      label: 'RIM HEIGHT',
      metric: '18 mm',
      imperial: '0.71 in',
    },
    {
      label: 'BASE GAUGE THICKNESS',
      metric: '2.5 mm',
      imperial: '0.10 in',
    },
    {
      label: 'NET MASS',
      metric: '640 grams',
      imperial: '22.58 oz',
    },
    {
      label: 'ALLOY GRADE',
      metric: 'AISI 316 Food Safe Austenitic Steel',
      imperial: 'AISI 316 Food Safe Austenitic Steel',
    },
    {
      label: 'MIRROR POLISH',
      metric: 'Multi-Stage Optical Hand-Buff',
      imperial: 'Multi-Stage Optical Hand-Buff',
    },
    {
      label: 'ORIGIN ATELIER',
      metric: 'Precision Cold-Pressed & Finished in Zurich',
      imperial: 'Precision Cold-Pressed & Finished in Zurich',
    },
  ];

  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      id="specifications"
      className="w-full border-b border-[#e5e5e3] py-16 md:py-24 bg-[#f9f9f7] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Title and Unit Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-4">
                03 / Specifications
              </div>

              <h2 className="font-[family-name:var(--font-cormorant)] text-[38px] sm:text-[48px] md:text-[54px] font-light leading-[1.12] text-[#111111] mb-6">
                Every detail, <br />
                <span className="italic font-normal">considered.</span>
              </h2>

              <p className="text-[15px] sm:text-[16px] text-[#444748] font-light leading-[1.7] mb-10 max-w-md">
                Refined measurements balanced to rest flush against tablecloth,
                bare hardwood, or raw travertine.
              </p>
            </div>

            {/* Interactive Unit Switcher Button Group */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                id="unit-metric-btn"
                onClick={() => setUnitSystem('metric')}
                className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-all cursor-pointer border ${
                  unitSystem === 'metric'
                    ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]'
                    : 'bg-[#f4f4f2] text-[#444748] border-[#e5e5e3] hover:border-[#111111]'
                }`}
              >
                MM / G
              </button>
              <button
                id="unit-imperial-btn"
                onClick={() => setUnitSystem('imperial')}
                className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-all cursor-pointer border ${
                  unitSystem === 'imperial'
                    ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]'
                    : 'bg-[#f4f4f2] text-[#444748] border-[#e5e5e3] hover:border-[#111111]'
                }`}
              >
                IN / OZ
              </button>
            </div>
          </motion.div>

          {/* Right Column: High Precision Spec Sheet Table */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div
              id="spec-table-card"
              className="bg-[#f4f4f2] border border-[#e5e5e3] p-6 sm:p-10 transition-all shadow-2xs"
            >
              <div className="divide-y divide-[#e5e5e3]">
                {specsData.map((spec) => (
                  <div
                    key={spec.label}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[13px]"
                  >
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#747878]">
                      {spec.label}
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-[13px] sm:text-[14px] font-medium text-[#111111] tracking-tight">
                      {unitSystem === 'metric' ? spec.metric : spec.imperial}
                    </span>
                  </div>
                ))}
              </div>

              {/* Table Footer Stamp */}
              <div className="pt-8 mt-4 border-t border-[#e5e5e3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em]">
                <span className="font-mono text-[#747878]">
                  Verified Serial Stamp No. 001–250
                </span>
                <span className="font-medium text-[#c5a059] tracking-[0.25em]">
                  Maison Glint Archive
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
