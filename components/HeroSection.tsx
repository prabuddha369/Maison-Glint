'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ZoomIn, RefreshCw, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroSectionProps {
  onReserveClick: () => void;
  onDiscoverClick: () => void;
}

export default function HeroSection({
  onReserveClick,
  onDiscoverClick,
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const CYCLE_DURATION = 5200; // 5.2s interval for a stately, quiet-luxury loop

  const transitionConfig = {
    duration: 0.9,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  const perspectives = [
    {
      id: 'table',
      src: '/images/fig-01-table.png',
      alt: 'The Glint Plate resting on honed travertine with dessert in delicate glass coupe',
      category: 'The Table Setting',
      title: 'Travertine and Reflected Sunlight',
      fig: 'FIG. 01 — 280MM',
      tabLabel: 'Fig. 01 Table',
      badge: 'Atmosphere',
    },
    {
      id: 'profile',
      src: '/images/fig-02-profile.png',
      alt: 'Low-angle side profile showing the paper-thin 1.8mm tapered rim and mirror bevel of the Glint Plate',
      category: 'Side Elevation',
      title: '1.8mm Tapered Rim & Mirror Bevel',
      fig: 'FIG. 02 — PROFILE',
      tabLabel: 'Fig. 02 Profile',
      badge: 'Side Profile',
    },
  ];

  // Continuous infinite animation loop
  useEffect(() => {
    if (isPaused || isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === 0 ? 1 : 0));
    }, CYCLE_DURATION);

    return () => clearInterval(interval);
  }, [isPaused, isHovered, activeIndex]);

  const currentMain = perspectives[activeIndex];
  const currentSide = perspectives[activeIndex === 0 ? 1 : 0];

  const handleSelectPerspective = (index: number) => {
    setActiveIndex(index);
  };

  const toggleSwap = () => {
    setActiveIndex((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <section
      id="hero-section"
      className="relative w-full border-b border-[#e5e5e3] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Editorial Text Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Eyebrow and Edition Tag */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transitionConfig, delay: 0.1 }}
              className="flex items-center space-x-3 mb-6"
            >
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-[#747878]">
                Objects for the Everyday Ritual
              </span>
              <span className="w-8 h-[1px] bg-[#c5a059]" />
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-semibold text-[#c5a059]">
                Edition 01
              </span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transitionConfig, delay: 0.2 }}
              className="font-[family-name:var(--font-cormorant)] text-[46px] sm:text-[56px] md:text-[64px] lg:text-[72px] font-light leading-[1.06] tracking-[-0.02em] text-[#111111] mb-8"
            >
              A quieter kind <br />
              of <span className="italic font-normal text-[#111111]">brilliance.</span>
            </motion.h1>

            {/* Body Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transitionConfig, delay: 0.35 }}
              className="font-[family-name:var(--font-inter)] text-[15px] sm:text-[16px] text-[#444748] font-light leading-[1.7] max-w-lg mb-10"
            >
              Stainless steel. A new reflection. Clean lines and liquid luster
              forged to turn domestic dining into quiet sculpture.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transitionConfig, delay: 0.48 }}
              className="flex flex-wrap items-center gap-4 mb-16"
            >
              <button
                id="hero-discover-btn"
                onClick={onDiscoverClick}
                className="group inline-flex items-center justify-center space-x-3 bg-[#111111] text-[#f9f9f7] px-7 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer border border-[#111111]"
              >
                <span>Discover The Plate</span>
                <ArrowUpRight className="w-4 h-4 text-[#c5a059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                id="hero-reserve-btn"
                onClick={onReserveClick}
                className="inline-flex items-center justify-center bg-transparent text-[#111111] px-7 py-4 text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-[#111111] hover:text-[#f9f9f7] transition-all cursor-pointer border border-[#111111]"
              >
                <span>Reserve First Edition</span>
              </button>
            </motion.div>

            {/* Metadata Specs Strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transitionConfig, delay: 0.6 }}
              className="pt-8 border-t border-[#e5e5e3] grid grid-cols-3 gap-6"
            >
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1.5">
                  Material
                </div>
                <div className="text-[13px] md:text-[14px] font-medium text-[#111111] tracking-tight">
                  18/10 Stainless
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1.5">
                  Craft
                </div>
                <div className="text-[13px] md:text-[14px] font-medium text-[#111111] tracking-tight">
                  Optical Buff
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#747878] mb-1.5">
                  Edition
                </div>
                <div className="text-[13px] md:text-[14px] font-medium text-[#111111] tracking-tight">
                  Batch 01 / 250
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Editorial Image Composition with Side Hero Image */}
          <div
            className="lg:col-span-6 relative pb-6 sm:pb-8 lg:pb-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* View Switcher Bar & Loop Control */}
            <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-[0.18em] text-[#747878]">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-[#111111]">Atelier Perspectives</span>
                <span className="text-[#c5a059]">•</span>
                <button
                  id="hero-loop-toggle-btn"
                  onClick={() => setIsPaused(!isPaused)}
                  className="inline-flex items-center space-x-1 text-[9px] uppercase tracking-[0.18em] text-[#747878] hover:text-[#111111] transition-colors cursor-pointer"
                  title={isPaused ? 'Resume infinite perspective loop' : 'Pause infinite perspective loop'}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-2.5 h-2.5 text-[#c5a059]" />
                      <span>Paused</span>
                    </>
                  ) : (
                    <>
                      <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-[#747878]' : 'bg-[#c5a059] animate-ping'}`} />
                      <span>{isHovered ? 'Hover Pause' : 'Loop Active'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Perspective Selector Tabs */}
              <div className="flex items-center space-x-2">
                {perspectives.map((persp, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={persp.id}
                      id={`hero-perspective-${persp.id}-btn`}
                      onClick={() => handleSelectPerspective(idx)}
                      className={`relative px-2.5 py-1 transition-all cursor-pointer overflow-hidden ${
                        isActive
                          ? 'bg-[#111111] text-[#f9f9f7]'
                          : 'bg-transparent text-[#747878] hover:text-[#111111]'
                      }`}
                    >
                      <span className="relative z-10">{persp.tabLabel}</span>

                      {/* Infinite Progress Hairline on Active Tab */}
                      {isActive && !isPaused && !isHovered && (
                        <motion.span
                          key={`progress-${activeIndex}`}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: CYCLE_DURATION / 1000, ease: 'linear' }}
                          className="absolute bottom-0 left-0 h-[2px] bg-[#c5a059] z-20"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Primary Hero Image Frame with Crossfade Animation Loop */}
            <motion.div
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              id="hero-image-container"
              className="relative w-full aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] bg-[#eeeeec] overflow-hidden border border-[#e5e5e3] group select-none"
            >
              {/* Layered Crossfading Photographic Views */}
              {perspectives.map((persp, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <motion.div
                    key={persp.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1.0 : 1.04,
                    }}
                    transition={{
                      opacity: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
                      scale: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                    }}
                    className={`absolute inset-0 ${isActive ? 'z-10' : 'z-0 pointer-events-none'}`}
                  >
                    <Image
                      src={persp.src}
                      alt={persp.alt}
                      fill
                      priority={idx === 0}
                      referrerPolicy="no-referrer"
                      className="object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                    />
                  </motion.div>
                );
              })}

              {/* Subtle Ambient Light Shimmer & Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none z-10" />

              {/* Top Edition Counter Badge */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="text-[9px] uppercase tracking-[0.22em] font-medium bg-black/45 backdrop-blur-xs text-[#f9f9f7] px-2.5 py-1 border border-white/15">
                  Maison Glint • {currentMain.badge}
                </span>
              </div>

              {/* Bottom Caption Overlay Matching Active Perspective */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMain.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-end justify-between text-[#f9f9f7]"
                  >
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-1">
                        {currentMain.category}
                      </div>
                      <div className="font-[family-name:var(--font-cormorant)] text-[20px] md:text-[24px] italic font-light tracking-wide text-white drop-shadow-sm">
                        {currentMain.title}
                      </div>
                    </div>

                    <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#e5e2e1]/90">
                      {currentMain.fig}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Companion Side Hero Image on the Right (Crossfading Alternate Perspective) */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
              id="hero-side-image-card"
              onClick={toggleSwap}
              className="absolute -bottom-4 right-2 sm:-bottom-6 sm:right-0 md:-bottom-8 md:-right-4 lg:-bottom-8 lg:-right-6 w-36 sm:w-48 md:w-56 lg:w-60 aspect-[3/4] bg-[#f9f9f7] p-2 sm:p-2.5 border border-[#e5e5e3] shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-30 group cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.18)] select-none"
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
                  const isSideActive = activeIndex !== idx;
                  return (
                    <motion.div
                      key={`side-${persp.id}`}
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
                        src={persp.src}
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
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] font-medium bg-black/60 backdrop-blur-xs text-[#f9f9f7] px-2 py-0.5 border border-white/15">
                    {currentSide.badge}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#111111] transition-colors">
                    <RefreshCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
                  </div>
                </div>

                {/* Bottom Caption Overlay on Side Image with smooth crossfade */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 text-[#f9f9f7] pointer-events-none z-20">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`caption-${currentSide.id}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] font-medium text-[#c5a059] mb-0.5">
                        {currentSide.fig}
                      </div>
                      <div className="font-[family-name:var(--font-cormorant)] text-[12px] sm:text-[14px] italic leading-tight text-white line-clamp-1">
                        {currentSide.title}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="mt-1 flex items-center space-x-1 text-[7px] sm:text-[8px] uppercase tracking-[0.16em] text-[#e5e2e1]/80">
                    <ZoomIn className="w-2.5 h-2.5" />
                    <span>Click to Swap</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

