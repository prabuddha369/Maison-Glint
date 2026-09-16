'use client';

import { useState } from 'react';
import { Sun, Sparkles, Flame, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export default function FinishPhilosophy() {
  // Interactive ray angle mode
  const [lightingPreset, setLightingPreset] = useState<'candlelight' | 'morning' | 'zenith'>('morning');

  // Angle configurations for the interactive ray diagram
  const presetAngles = {
    candlelight: { angle: 22, name: 'Candlelight Grazing', ra: 'Ra < 0.048 µm', dispersion: '99.1%' },
    morning: { angle: 45, name: 'Travertine Sunbeam', ra: 'Ra < 0.050 µm', dispersion: '98.4%' },
    zenith: { angle: 70, name: 'Overhead Ambient', ra: 'Ra < 0.045 µm', dispersion: '98.8%' },
  };

  const activeConfig = presetAngles[lightingPreset];
  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      id="the-finish"
      className="w-full border-b border-[#e5e5e3] py-16 md:py-24 bg-[#f9f9f7] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-4">
              02 / The Finish & Philosophy
            </div>

            <h2 className="font-[family-name:var(--font-cormorant)] text-[38px] sm:text-[48px] md:text-[54px] font-light leading-[1.12] text-[#111111] mb-8">
              Made of steel. <br />
              <span className="italic font-normal">Alive with light.</span>
            </h2>

            <div className="space-y-6 text-[15px] sm:text-[16px] text-[#444748] font-light leading-[1.75] max-w-xl">
              <p>
                A curve. A glint. The room, reflected. A surface that becomes
                part of the setting.
              </p>
              <p>
                Unlike static tableware, mirror-finished steel continuously
                mirrors the season, the lighting, the faces of guests, and the
                architecture of the space. It is not merely an object; it is an
                optical memory of the gathering.
              </p>
            </div>

            {/* Interactive preset selector */}
            <div className="pt-10 mt-6 border-t border-[#e5e5e3]">
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#747878] mb-3">
                Select Optical Light State
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setLightingPreset('morning')}
                  className={`px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] font-medium transition-all border ${
                    lightingPreset === 'morning'
                      ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]'
                      : 'bg-[#f4f4f2] text-[#444748] border-[#e5e5e3] hover:border-[#111111]'
                  }`}
                >
                  Morning Sun (45°)
                </button>
                <button
                  onClick={() => setLightingPreset('candlelight')}
                  className={`px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] font-medium transition-all border ${
                    lightingPreset === 'candlelight'
                      ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]'
                      : 'bg-[#f4f4f2] text-[#444748] border-[#e5e5e3] hover:border-[#111111]'
                  }`}
                >
                  Candlelight (22°)
                </button>
                <button
                  onClick={() => setLightingPreset('zenith')}
                  className={`px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] font-medium transition-all border ${
                    lightingPreset === 'zenith'
                      ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]'
                      : 'bg-[#f4f4f2] text-[#444748] border-[#e5e5e3] hover:border-[#111111]'
                  }`}
                >
                  Overhead (70°)
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Technical Card: Ray Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase, delay: 0.18 }}
            className="lg:col-span-6"
          >
            <div
              id="technical-reflection-card"
              className="bg-[#f4f4f2] border border-[#e5e5e3] p-8 md:p-10 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#e5e5e3] pb-4 mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111]">
                  Reflective Index Spectrum
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-[#c5a059] font-medium">
                  RA &lt; 0.05 MM
                </span>
              </div>

              {/* Technical SVG Ray Diagram */}
              <div className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center my-4 overflow-hidden select-none">
                <svg
                  viewBox="0 0 500 240"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Subtle Grid Axis lines */}
                  <line
                    x1="40"
                    y1="190"
                    x2="460"
                    y2="190"
                    stroke="#e2e2e0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="250"
                    y1="40"
                    x2="250"
                    y2="190"
                    stroke="#e2e2e0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Reflected Light Rays (Champagne Gold and Warm Stone) */}
                  {/* Dynamic Primary Gold Ray */}
                  {lightingPreset === 'morning' && (
                    <>
                      {/* Incident */}
                      <line
                        x1="120"
                        y1="60"
                        x2="250"
                        y2="190"
                        stroke="#c5a059"
                        strokeWidth="1.75"
                      />
                      {/* Reflected */}
                      <line
                        x1="250"
                        y1="190"
                        x2="380"
                        y2="60"
                        stroke="#c5a059"
                        strokeWidth="1.75"
                      />
                      {/* Flank Rays */}
                      <line
                        x1="80"
                        y1="90"
                        x2="250"
                        y2="190"
                        stroke="#999"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                      <line
                        x1="250"
                        y1="190"
                        x2="420"
                        y2="90"
                        stroke="#999"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                      <line
                        x1="160"
                        y1="40"
                        x2="250"
                        y2="190"
                        stroke="#bbb"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                      <line
                        x1="250"
                        y1="190"
                        x2="340"
                        y2="40"
                        stroke="#bbb"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    </>
                  )}

                  {lightingPreset === 'candlelight' && (
                    <>
                      <line
                        x1="60"
                        y1="130"
                        x2="250"
                        y2="190"
                        stroke="#c5a059"
                        strokeWidth="2"
                      />
                      <line
                        x1="250"
                        y1="190"
                        x2="440"
                        y2="130"
                        stroke="#c5a059"
                        strokeWidth="2"
                      />
                      <line
                        x1="70"
                        y1="110"
                        x2="250"
                        y2="190"
                        stroke="#999"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                      <line
                        x1="250"
                        y1="190"
                        x2="430"
                        y2="110"
                        stroke="#999"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    </>
                  )}

                  {lightingPreset === 'zenith' && (
                    <>
                      <line
                        x1="200"
                        y1="40"
                        x2="250"
                        y2="190"
                        stroke="#c5a059"
                        strokeWidth="2"
                      />
                      <line
                        x1="250"
                        y1="190"
                        x2="300"
                        y2="40"
                        stroke="#c5a059"
                        strokeWidth="2"
                      />
                      <line
                        x1="150"
                        y1="50"
                        x2="250"
                        y2="190"
                        stroke="#999"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                      <line
                        x1="250"
                        y1="190"
                        x2="350"
                        y2="50"
                        stroke="#999"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    </>
                  )}

                  {/* Focal Specular Point Shimmer */}
                  <circle cx="250" cy="190" r="3.5" fill="#c5a059" />
                  <circle
                    cx="250"
                    cy="190"
                    r="8"
                    stroke="#c5a059"
                    strokeWidth="0.75"
                    strokeDasharray="2 2"
                    className="animate-pulse"
                  />

                  {/* The Plate Cross-Section Curve */}
                  {/* Subtle rim rises on both left and right edges */}
                  <path
                    d="M 60 183 Q 80 190, 130 192 L 370 192 Q 420 190, 440 183"
                    stroke="#111111"
                    strokeWidth="3.5"
                    strokeLinecap="square"
                  />
                  {/* Plate Base Under-thickness */}
                  <path
                    d="M 70 188 Q 90 195, 140 196 L 360 196 Q 410 195, 430 188"
                    stroke="#747878"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                  />
                </svg>

                {/* Sub-label under diagram */}
                <div className="absolute bottom-1 text-[9px] uppercase tracking-[0.2em] text-[#747878]">
                  Curvature Tangent Angle: {activeConfig.angle}° · {activeConfig.name}
                </div>
              </div>

              {/* Bottom Spec Grid (4 columns) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#e5e5e3] text-center">
                <div className="bg-[#f9f9f7] p-3 border border-[#e5e5e3]">
                  <div className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1">
                    Reflection
                  </div>
                  <div className="text-[12px] md:text-[13px] font-semibold text-[#111111]">
                    Specular 98%
                  </div>
                </div>

                <div className="bg-[#f9f9f7] p-3 border border-[#e5e5e3]">
                  <div className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1">
                    Thermal
                  </div>
                  <div className="text-[12px] md:text-[13px] font-semibold text-[#111111]">
                    Chilled/Warm
                  </div>
                </div>

                <div className="bg-[#f9f9f7] p-3 border border-[#e5e5e3]">
                  <div className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1">
                    Hardness
                  </div>
                  <div className="text-[12px] md:text-[13px] font-semibold text-[#111111]">
                    HV 210
                  </div>
                </div>

                <div className="bg-[#f9f9f7] p-3 border border-[#e5e5e3]">
                  <div className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1">
                    Finish
                  </div>
                  <div className="text-[12px] md:text-[13px] font-semibold text-[#111111]">
                    Mirror Buff
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
