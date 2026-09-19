'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Sun, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProductCarousel } from '../hooks/useProductCarousel';
import { formatGoogleDriveUrl } from '../lib/products';
import type { Product, ProductFinishPreset } from '../types/store';

interface FinishPhilosophyProps {
  products: Product[];
  loading: boolean;
}

const DEFAULT_PRESETS: ProductFinishPreset[] = [
  {
    key: 'morning',
    label: 'Morning Sun',
    angle: 45,
    roughness: 'Ra < 0.050 µm',
    dispersion: '98.4%',
    imageUrl: 'https://drive.google.com/file/d/10MrLj9sZ0g3rDmXhl1XATt3WbHymY-RI/view?usp=sharing',
    sortOrder: 0,
  },
  {
    key: 'candlelight',
    label: 'Candlelight Grazing',
    angle: 22,
    roughness: 'Ra < 0.048 µm',
    dispersion: '99.1%',
    imageUrl: 'https://drive.google.com/file/d/1J6r_3beMMM8DGnMch3WVLIzncvKRUJrj/view?usp=sharing',
    sortOrder: 1,
  },
  {
    key: 'zenith',
    label: 'Overhead Ambient',
    angle: 70,
    roughness: 'Ra < 0.045 µm',
    dispersion: '98.8%',
    imageUrl: 'https://drive.google.com/file/d/1rgJEFBuH17GLAhCK6i-2Kcd0MoGmDFPu/view?usp=sharing',
    sortOrder: 2,
  },
];

interface LightingStudy {
  key: string;
  label: string;
  angle: number;
  image: string;
  imageAlt: string;
  opticalDescriptor: string;
  colorTemp: string;
  surfaceBehavior: string;
  hostingAtmosphere: string;
  materialHarmony: string;
  narrativeCaption: string;
}

const LIGHTING_STUDIES: Record<string, LightingStudy> = {
  morning: {
    key: 'morning',
    label: 'Morning Sun',
    angle: 45,
    image: '/images/morning-light-study.jpg',
    imageAlt: 'Maison Glint Object 01 catching crisp morning sunlight across raw linen and travertine',
    opticalDescriptor: '45° Incident Sunlight · Clean Specular Bloom',
    colorTemp: '4500K Natural Daylight',
    surfaceBehavior: 'Crisp Architectural Bloom',
    hostingAtmosphere: 'The Morning Table & Still Life',
    materialHarmony: 'Raw Linen & Travertine',
    narrativeCaption: 'Morning daylight enters diagonally, grazing the circular rim in high relief while the mirror basin quietly mirrors the room.',
  },
  candlelight: {
    key: 'candlelight',
    label: 'Candlelight Grazing',
    angle: 22,
    image: '/images/candlelight-study.jpg',
    imageAlt: 'Maison Glint Object 01 reflecting intimate evening candlelight on rustic oak',
    opticalDescriptor: '22° Low Grazing Flame · Deep Amber Radiance',
    colorTemp: '2200K Intimate Candlelight',
    surfaceBehavior: 'Amber Specular Grazing',
    hostingAtmosphere: 'Intimate Evening Gathering',
    materialHarmony: 'Dark Oak & Beeswax Taper',
    narrativeCaption: 'Unshielded candlelight sweeps across the steel at a shallow grazing angle, converting cold metal into deep honey radiance and lively flame movement.',
  },
  zenith: {
    key: 'zenith',
    label: 'Overhead Ambient',
    angle: 70,
    image: '/images/overhead-ambient-study.jpg',
    imageAlt: 'Maison Glint Object 01 under soft diffuse overhead dining ambient light',
    opticalDescriptor: '70° Diffuse Ceiling Illumination · Soft Field',
    colorTemp: '3200K Soft Warm Ambient',
    surfaceBehavior: 'Soft Diffuse Sheen',
    hostingAtmosphere: 'Quiet Domestic Centrepiece',
    materialHarmony: 'Matte Ceramic & Linen',
    narrativeCaption: 'Soft overhead dining light falls evenly across the plate, creating quiet, measured gradients and highlighting the seamless flat basin geometry.',
  },
};

export default function FinishPhilosophy({ products, loading }: FinishPhilosophyProps) {
  const { activeProduct, activeIndex, next, previous, prefersReducedMotion } = useProductCarousel(products);
  const [selectedKey, setSelectedKey] = useState<string>('morning');
  const [imageError, setImageError] = useState<boolean>(false);

  const editorial = activeProduct?.editorial?.finish;
  const presets = editorial?.presets && editorial.presets.length > 0 ? editorial.presets : DEFAULT_PRESETS;
  const activePreset = presets.find((p) => p.key === selectedKey) || presets[0];

  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  if (loading || !activeProduct) {
    return <section id="the-finish" className="min-h-[60vh] border-b border-[#e5e5e3]" />;
  }

  const study = LIGHTING_STUDIES[activePreset.key] || LIGHTING_STUDIES.morning;
  const resolvedPresetImage = formatGoogleDriveUrl(activePreset.imageUrl);
  const displayImage = !imageError && resolvedPresetImage ? resolvedPresetImage : study.image;

  return (
    <section
      id="the-finish"
      className="w-full border-b border-[#e5e5e3] py-12 sm:py-16 md:py-24 bg-[#f9f9f7] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Text Narrative */}
          <motion.div
            key={activeProduct.id ? `${activeProduct.id}-text` : 'finish-text'}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            {/* Eyebrow & Optional Carousel Switcher */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-[#747878]">
                {editorial?.sectionLabel || '02 / The Finish & Philosophy'}
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
                  <span className="font-mono text-[9px] text-[#747878]">
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

            <h2 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[44px] md:text-[54px] font-light leading-[1.12] text-[#111111] mb-6 sm:mb-8">
              {editorial?.title || 'Made of steel.'} <br />
              <span className="italic font-normal">{editorial?.titleEmphasis || 'Alive with light.'}</span>
            </h2>

            <div className="space-y-4 sm:space-y-6 text-[14px] sm:text-[16px] text-[#444748] font-light leading-[1.75] max-w-xl">
              {editorial?.paragraphs && editorial.paragraphs.length > 0 ? (
                editorial.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Interactive preset selector */}
            <div className="pt-8 sm:pt-10 mt-6 border-t border-[#e5e5e3]">
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#747878] mb-3">
                {editorial?.presetLabel || 'Select Optical Light State'}
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => {
                  const isActive = activePreset.key === preset.key;
                  const displayLabel = preset.label.includes('°')
                    ? preset.label
                    : `${preset.label} (${preset.angle}°)`;

                  return (
                    <button
                      key={preset.key || preset.id}
                      onClick={() => {
                        setSelectedKey(preset.key);
                        setImageError(false);
                      }}
                      className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] font-medium transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-[#111111] text-[#f9f9f7] border-[#111111]'
                          : 'bg-[#f4f4f2] text-[#444748] border-[#e5e5e3] hover:border-[#111111]'
                      }`}
                    >
                      {displayLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Sensory Study Card: The Art of Light */}
          <motion.div
            key={activeProduct.id ? `${activeProduct.id}-card` : 'finish-card'}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: luxuryEase, delay: 0.18 }}
            className="lg:col-span-6"
          >
            <div
              id="atmospheric-light-study-card"
              className="bg-[#ffffff] border border-[#e5e5e3] p-5 sm:p-7 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden"
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between border-b border-[#e5e5e3] pb-4 mb-5">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-none bg-[#c5a059]" />
                  <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#111111]">
                    THE ART OF LIGHT
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[#747878] font-medium">
                  ARCHIVE STUDY FIG. 02
                </span>
              </div>

              {/* Interactive Visual Canvas with Photographic Cross-Fade */}
              <div className="relative w-full aspect-[4/3] bg-[#f4f4f2] border border-[#e5e5e3] overflow-hidden group select-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${study.key}-${displayImage}`}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.55, ease: luxuryEase }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={displayImage}
                      alt={study.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                    {/* Atmospheric Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

                    {/* Floating Optical Metric Badge */}
                    <div className="absolute top-3 left-3 bg-[#111111]/85 backdrop-blur-md px-3 py-1.5 border border-white/20 text-[#f9f9f7] flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
                      <span className="text-[9px] uppercase tracking-[0.18em] font-mono font-medium">
                        {study.opticalDescriptor}
                      </span>
                    </div>

                    {/* Floating Bottom Telemetry Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[#f9f9f7] text-[10px] font-mono tracking-wider drop-shadow-md">
                      <span className="bg-black/60 px-2.5 py-1 backdrop-blur-sm">
                        ANGLE: {study.angle}°
                      </span>
                      <span className="bg-black/60 px-2.5 py-1 backdrop-blur-sm text-[#c5a059] font-semibold">
                        {study.colorTemp}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Evocative Narrative Observation */}
              <p className="text-[12px] text-[#59554F] font-light italic mt-4 leading-relaxed min-h-[36px]">
                "{study.narrativeCaption}"
              </p>

              {/* Bottom Atmospheric Telemetry Grid (4 columns) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-[#f0f0ee] text-center">
                <div className="bg-[#f9f9f7] p-3 border border-[#e5e5e3]">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1">
                    Color Temp
                  </div>
                  <div className="text-[11px] sm:text-[12px] font-semibold text-[#111111] truncate">
                    {study.colorTemp.split(' ')[0]}
                  </div>
                </div>
                <div className="bg-[#f9f9f7] p-3 border border-[#e5e5e3]">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1">
                    Surface State
                  </div>
                  <div
                    className="text-[11px] sm:text-[12px] font-semibold text-[#111111] truncate"
                    title={study.surfaceBehavior}
                  >
                    {study.surfaceBehavior}
                  </div>
                </div>
                <div className="bg-[#f9f9f7] p-3 border border-[#e5e5e3]">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1">
                    Atmosphere
                  </div>
                  <div
                    className="text-[11px] sm:text-[12px] font-semibold text-[#111111] truncate"
                    title={study.hostingAtmosphere}
                  >
                    {study.hostingAtmosphere}
                  </div>
                </div>
                <div className="bg-[#f9f9f7] p-3 border border-[#e5e5e3]">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1">
                    Material Harmony
                  </div>
                  <div
                    className="text-[11px] sm:text-[12px] font-semibold text-[#111111] truncate"
                    title={study.materialHarmony}
                  >
                    {study.materialHarmony}
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
