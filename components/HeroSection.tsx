'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ZoomIn, RefreshCw, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import type { Product } from '../types/store';
import { resolveImageUrl } from '../lib/products';

interface HeroSectionProps {
  products: Product[];
  loading: boolean;
  onReserveClick: () => void;
  onDiscoverClick: () => void;
  onActiveProductChange?: (product: Product, index: number) => void;
  activeProductIndex?: number;
  onSelectProductIndex?: (index: number) => void;
}

export default function HeroSection({
  products,
  loading,
  onReserveClick,
  onDiscoverClick,
  onActiveProductChange,
  activeProductIndex: propActiveProductIndex,
  onSelectProductIndex,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [carouselState, setCarouselState] = useState<{
    productIndex: number;
    perspectiveIndex: number;
  }>({
    productIndex: typeof propActiveProductIndex === 'number' ? propActiveProductIndex : 0,
    perspectiveIndex: 0,
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [cycleResetKey, setCycleResetKey] = useState<number>(0);

  // Synchronize when parent changes product
  useEffect(() => {
    if (typeof propActiveProductIndex === 'number') {
      setCarouselState((prev) => {
        if (prev.productIndex === propActiveProductIndex) return prev;
        return { productIndex: propActiveProductIndex, perspectiveIndex: 0 };
      });
    }
  }, [propActiveProductIndex]);

  // Parallax Scroll Tracking for Hero -> Object Showcase transition
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax Motion Values
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroDimOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [0, 0.25, 0.55]);
  const topControlsY = useTransform(scrollYProgress, [0, 0.6], ['0px', '-35px']);
  const topControlsOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const sideCardY = useTransform(scrollYProgress, [0, 1], ['0px', '70px']);
  const sideCardOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const bottomCaptionY = useTransform(scrollYProgress, [0, 1], ['0px', '40px']);
  const bottomCaptionOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const transitionConfig = {
    duration: 1.0,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const safeProductIndex = products.length ? carouselState.productIndex % products.length : 0;
  const activeProduct = products[safeProductIndex] || products[0];
  const editorial = activeProduct?.editorial;
  const fallbackSlides = (activeProduct?.images && activeProduct.images.length > 0)
    ? activeProduct.images.map((imageUrl, idx) => ({
        id: `slide-${idx}`,
        imageUrl: resolveImageUrl(imageUrl, imageUrl),
        alt: `${activeProduct.name} perspective ${idx + 1}`,
        category: idx === 0 ? 'Table Setting' : 'Side Elevation',
        title: idx === 0 ? 'A considered presence at the table' : 'Profile, edge, and reflected light',
        figureLabel: `FIG. 0${idx + 1}`,
        tabLabel: `Fig. 0${idx + 1}`,
        badge: idx === 0 ? 'Atmosphere' : 'Profile',
        sortOrder: idx,
      }))
    : [
        {
          id: 'slide-default-1',
          imageUrl: '/images/fig-01-table.png',
          alt: `${activeProduct?.name || 'Object'} perspective 1`,
          category: 'Table Setting',
          title: 'A considered presence at the table',
          figureLabel: 'FIG. 01',
          tabLabel: 'Fig. 01',
          badge: 'Atmosphere',
          sortOrder: 0,
        },
      ];
  const perspectives = (editorial?.hero.slides && editorial.hero.slides.length > 0)
    ? editorial.hero.slides
    : fallbackSlides;
  const safePerspectiveIndex = perspectives.length
    ? Math.min(carouselState.perspectiveIndex, perspectives.length - 1)
    : 0;
  const currentMain = perspectives[safePerspectiveIndex] || perspectives[0];
  const currentSide = perspectives.length > 1
    ? perspectives[(safePerspectiveIndex + 1) % perspectives.length]
    : currentMain;

  const carouselStateRef = useRef(carouselState);
  carouselStateRef.current = carouselState;

  // Two-Tier Nested Carousel:
  // Tier 1: View each figure (Fig. 01, Fig. 02) of current product for 1 full bar (4.0s = 4 beats @ 60 BPM)
  // Tier 2: After all figures of product have been viewed (2 bars = 8.0s), advance to next product on phrase boundary
  const STEP_INTERVAL_MS = 4000;
  const advanceStep = useCallback(() => {
    if (!products.length) return;
    const current = carouselStateRef.current;
    const currentProduct = products[current.productIndex % products.length];
    const slides = currentProduct?.editorial?.hero?.slides || [];
    const hasMoreSlides = slides.length > 1 && current.perspectiveIndex < slides.length - 1;

    if (hasMoreSlides) {
      setCarouselState({
        productIndex: current.productIndex,
        perspectiveIndex: current.perspectiveIndex + 1,
      });
    } else {
      const nextIndex = (current.productIndex + 1) % products.length;
      setCarouselState({
        productIndex: nextIndex,
        perspectiveIndex: 0,
      });
      onSelectProductIndex?.(nextIndex);
    }
  }, [products, onSelectProductIndex]);

  useEffect(() => {
    if (isPaused || products.length === 0) return;

    const timer = setInterval(() => {
      advanceStep();
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, products.length, advanceStep, cycleResetKey]);

  useEffect(() => {
    if (products.length > 0 && activeProduct) {
      if (typeof propActiveProductIndex === 'number' && propActiveProductIndex !== safeProductIndex) {
        onActiveProductChange?.(activeProduct, safeProductIndex);
      }
    }
  }, [activeProduct, safeProductIndex, products.length, propActiveProductIndex, onActiveProductChange]);

  if (loading || !activeProduct || !editorial) {
    return (
      <section ref={sectionRef} id="hero-section" className="min-h-[60vh] border-b border-[#e5e5e3] flex items-center justify-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#747878] animate-pulse font-mono">
          Loading Atelier Edition...
        </div>
      </section>
    );
  }

  const handleSelectPerspective = (index: number) => {
    setCarouselState((current) => ({
      ...current,
      perspectiveIndex: index,
    }));
    setCycleResetKey((k) => k + 1);
  };

  const toggleSwap = () => {
    setCarouselState((current) => {
      const currentProduct = products[current.productIndex % products.length];
      const slides = currentProduct?.editorial?.hero?.slides || [];
      const total = slides.length || 1;
      return {
        ...current,
        perspectiveIndex: (current.perspectiveIndex + 1) % total,
      };
    });
    setCycleResetKey((k) => k + 1);
  };

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="relative w-full border-b border-[#e5e5e3] overflow-hidden bg-[#eeeeec]"
    >
      {/* Full-Bleed Cinematic Hero Stage - Images cover the entire hero section space */}
      <div className="relative w-full min-h-[640px] sm:min-h-[720px] md:min-h-[780px] lg:min-h-[820px] flex items-center overflow-hidden">
        {/* Photographic Background Canvas with Parallax Scroll */}
        <motion.div
          style={{ y: backgroundY, scale: backgroundScale }}
          className="absolute -top-[12%] left-0 w-full h-[124%] select-none overflow-hidden"
        >
          {perspectives.map((persp, idx) => {
            const isActive = safePerspectiveIndex === idx;
            return (
              <motion.div
                key={`${activeProduct.id}-perspective-${idx}`}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1.0 : 1.03,
                }}
                transition={{
                  opacity: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                }}
                className={`absolute inset-0 w-full h-full ${isActive ? 'z-10' : 'z-0 pointer-events-none'}`}
              >
                <Image
                  src={resolveImageUrl(persp.imageUrl)}
                  alt={persp.alt}
                  fill
                  priority={idx === 0}
                  referrerPolicy="no-referrer"
                  className="object-cover object-center"
                />
              </motion.div>
            );
          })}

          {/* Luxury ambient vignette overlay for depth & readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent lg:from-black/35 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />
        </motion.div>

        {/* Parallax Ambient Dimming Layer as user scrolls down towards Object Showcase */}
        <motion.div
          style={{ opacity: heroDimOpacity }}
          className="absolute inset-0 bg-black pointer-events-none z-15"
        />

        {/* Top-Right: Perspective Switcher Tabs & Infinite Loop Control with Parallax */}
        <motion.div
          style={{ y: topControlsY, opacity: topControlsOpacity }}
          className="absolute top-4 left-4 right-4 sm:left-auto sm:right-6 lg:right-12 sm:top-6 z-30 flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/30 px-3 py-1.5 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.5),0_8px_24px_rgba(0,0,0,0.25)] text-[9px] sm:text-[10px] uppercase tracking-[0.16em]"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-medium text-white truncate max-w-[120px] sm:max-w-none">{activeProduct.name}</span>
            <span className="text-[#c5a059]">•</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="hero-loop-toggle-btn"
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center space-x-1.5 text-[9px] uppercase tracking-[0.16em] text-[#e5e5e3]/90 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? 'Resume automated cycle' : 'Pause automated cycle'}
            >
              {isPaused ? (
                <>
                  <Play className="w-2.5 h-2.5 text-[#c5a059]" />
                  <span>Paused</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-ping" />
                  <span>Loop Active</span>
                </>
              )}
            </button>

            <div className="h-3 w-[1px] bg-white/30 mx-0.5 sm:mx-1" />

            {/* Perspective Selector Tabs */}
            <div className="flex items-center space-x-1">
              {perspectives.map((persp, idx) => {
                const isActive = safePerspectiveIndex === idx;
                return (
                  <button
                    key={`${activeProduct.id}-perspective-tab-${idx}`}
                    id={`hero-perspective-${persp.id || idx}-btn`}
                    onClick={() => handleSelectPerspective(idx)}
                    className={`relative px-2 py-0.5 text-[9px] transition-all cursor-pointer overflow-hidden ${isActive
                      ? 'bg-white text-[#111111] font-medium'
                      : 'bg-transparent text-[#e5e5e3]/80 hover:text-white'
                      }`}
                  >
                    <span className="relative z-10">{persp.tabLabel}</span>

                    {/* Infinite Progress Hairline on Active Tab */}
                    {isActive && !isPaused && (
                      <motion.span
                        key={`progress-${safeProductIndex}-${safePerspectiveIndex}-${cycleResetKey}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3.5, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-[2px] bg-[#c5a059] z-20"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons: 2-Column Row on Mobile, Top-Left on Desktop */}
        <motion.div
          style={{ y: topControlsY, opacity: topControlsOpacity }}
          className="absolute top-[3.75rem] left-4 right-4 sm:top-6 sm:left-6 lg:left-12 sm:right-auto z-30 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3"
        >
          <button
            id="hero-discover-btn"
            onClick={onDiscoverClick}
            className="group inline-flex items-center justify-center space-x-1.5 sm:space-x-2 bg-[#111111]/90 backdrop-blur-md text-[#f9f9f7] px-2.5 sm:px-4 py-2 sm:py-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.18em] font-medium hover:bg-white hover:text-[#111111] hover:border-white transition-all cursor-pointer border border-white/35 shadow-[0_4px_16px_rgba(0,0,0,0.25)] text-center"
          >
            <span>{editorial.hero.discoverLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059] group-hover:text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </button>

          <button
            id="hero-reserve-btn"
            onClick={onReserveClick}
            className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md text-white px-2.5 sm:px-4 py-2 sm:py-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.18em] font-medium hover:bg-white hover:text-[#111111] transition-all cursor-pointer border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] text-center"
          >
            <span className="sm:hidden">Request Access</span>
            <span className="hidden sm:inline">{editorial.hero.reserveLabel || 'Request Priority Access'}</span>
          </button>
        </motion.div>

        {/* 
          Floating Editorial Pavilion Card (Commented out per user request - preserved for later experimentation)
        <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionConfig, delay: 0.15 }}
            className="relative w-full max-w-xl lg:max-w-lg xl:max-w-xl bg-white/[0.08] backdrop-blur-[6px] border border-white/35 p-6 sm:p-8 md:p-10 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1px_0_rgba(255,255,255,0.1),0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden"
          >
            -- Architectural Window Glass Light Reflections --
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.12] via-transparent to-white/[0.03] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              -- Eyebrow and Edition Tag --
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] font-medium text-[#e5e5e3]/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {editorial.hero.eyebrow}
                </span>
                <span className="w-6 sm:w-8 h-[1px] bg-[#c5a059]" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.18em] font-semibold text-[#d4af37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {editorial.hero.editionLabel}
                </span>
              </div>

              -- Display Headline --
              <h1 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[44px] md:text-[50px] lg:text-[56px] font-light leading-[1.06] tracking-[-0.02em] text-[#f9f9f7] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] mb-4 sm:mb-5">
                {activeProduct.name}
              </h1>

              -- Body Description --
              <p className="font-[family-name:var(--font-inter)] text-[13px] sm:text-[15px] text-[#e5e2e1]/95 font-normal leading-[1.7] drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] mb-6 sm:mb-8">
                {editorial.hero.description}
              </p>

              -- CTAs --
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  id="hero-discover-btn-archived"
                  onClick={onDiscoverClick}
                  className="w-full sm:w-auto group inline-flex items-center justify-center space-x-3 bg-[#111111]/90 backdrop-blur-md text-[#f9f9f7] px-6 sm:px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-white hover:text-[#111111] hover:border-white transition-all cursor-pointer border border-white/35 shadow-lg"
                >
                  <span>{editorial.hero.discoverLabel}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#c5a059] group-hover:text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>

                <button
                  id="hero-reserve-btn-archived"
                  onClick={onReserveClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 backdrop-blur-md text-white px-6 sm:px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-white hover:text-[#111111] transition-all cursor-pointer border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                >
                  <span>{editorial.hero.reserveLabel}</span>
                </button>
              </div>

              -- Metadata Specs Strip --
              <div className="pt-5 border-t border-white/20 grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] font-medium text-[#b0b0ad] mb-1">
                    {editorial.hero.materialLabel}
                  </div>
                  <div className="text-[11px] sm:text-[13px] font-medium text-[#f9f9f7] tracking-tight">
                    {editorial.hero.materialValue}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] font-medium text-[#b0b0ad] mb-1">
                    {editorial.hero.craftLabel}
                  </div>
                  <div className="text-[11px] sm:text-[13px] font-medium text-[#f9f9f7] tracking-tight">
                    {editorial.hero.craftValue}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] font-medium text-[#b0b0ad] mb-1">
                    {editorial.hero.editionLabelMeta}
                  </div>
                  <div className="text-[11px] sm:text-[13px] font-medium text-[#f9f9f7] tracking-tight">
                    {editorial.hero.editionValue}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        */}

        {/* Bottom Caption Overlay for Active Perspective with Parallax */}
        <motion.div
          style={{ y: bottomCaptionY, opacity: bottomCaptionOpacity }}
          className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 lg:left-auto lg:right-64 xl:right-72 z-20 pointer-events-none hidden md:block"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeProduct.id}-main-caption-${safePerspectiveIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="bg-black/55 backdrop-blur-md px-4 py-2 border border-white/15 text-[#f9f9f7]"
            >
              <div className="text-[8px] uppercase tracking-[0.22em] font-medium text-[#c5a059] mb-0.5">
                {currentMain.category} · {currentMain.figureLabel}
              </div>
              <div className="font-[family-name:var(--font-cormorant)] text-[16px] italic font-light text-white">
                {currentMain.title}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Companion Side Hero Image Card (Bottom-Right Floating Alternate Perspective Preview with Parallax) */}
        <motion.div
          style={{ y: sideCardY, opacity: sideCardOpacity }}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
          id="hero-side-image-card"
          onClick={toggleSwap}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-12 w-28 sm:w-36 md:w-48 lg:w-52 aspect-[3/4] bg-white/10 backdrop-blur-md p-1.5 sm:p-2 border border-white/40 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.6),0_20px_45px_rgba(0,0,0,0.35)] z-30 group cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,0.4)] select-none hidden xs:block"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleSwap();
            }
          }}
          aria-label="Click to swap perspective between Table Perspective and Side Elevation Profile"
        >
          <div className="relative w-full h-full overflow-hidden bg-[#eeeeec]">
            {/* Layered Crossfading Views for Side Preview Card */}
            {perspectives.map((persp, idx) => {
              const isSideActive = safePerspectiveIndex !== idx;
              return (
                <motion.div
                  key={`${activeProduct.id}-side-perspective-${idx}`}
                  initial={false}
                  animate={{
                    opacity: isSideActive ? 1 : 0,
                    scale: isSideActive ? 1.0 : 1.05,
                  }}
                  transition={{
                    opacity: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
                    scale: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className={`absolute inset-0 ${isSideActive ? 'z-10' : 'z-0 pointer-events-none'}`}
                >
                  <Image
                    src={resolveImageUrl(persp.imageUrl)}
                    alt={persp.alt}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </motion.div>
              );
            })}

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none z-10" />

            {/* Top Corner Pill Indicator */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
              <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.18em] font-medium bg-black/60 backdrop-blur-xs text-[#f9f9f7] px-1.5 py-0.5 border border-white/15">
                {currentSide.badge}
              </span>
              <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#111111] transition-colors">
                <RefreshCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
              </div>
            </div>

            {/* Bottom Caption Overlay on Side Image with smooth crossfade */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 text-[#f9f9f7] pointer-events-none z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeProduct.id}-side-caption-${perspectives.length > 1 ? (safePerspectiveIndex + 1) % perspectives.length : safePerspectiveIndex}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="text-[7px] uppercase tracking-[0.2em] font-medium text-[#c5a059] mb-0.5">
                    {currentSide.figureLabel}
                  </div>
                  <div className="font-[family-name:var(--font-cormorant)] text-[11px] sm:text-[13px] italic leading-tight text-white line-clamp-1">
                    {currentSide.title}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="mt-1 flex items-center space-x-1 text-[7px] uppercase tracking-[0.16em] text-[#e5e2e1]/80">
                <ZoomIn className="w-2.5 h-2.5" />
                <span>Click to Swap</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

