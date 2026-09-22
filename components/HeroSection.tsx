'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ZoomIn, RefreshCw, Play, Pause } from 'lucide-react';
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

  // Reflow-free passive scroll parallax tracking (0ms initial mount measurement, zero forced reflow)
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sy = window.scrollY;
          if (sy <= 0) {
            setScrollProgress(0);
          } else {
            setScrollProgress(Math.min(1, sy / 800));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax transform calculations
  const backgroundY = (scrollProgress * 22).toFixed(2) + '%';
  const backgroundScale = (1 + scrollProgress * 0.08).toFixed(3);
  const heroDimOpacity = scrollProgress > 0.75
    ? (0.25 + ((scrollProgress - 0.75) / 0.25) * 0.3).toFixed(2)
    : ((scrollProgress / 0.75) * 0.25).toFixed(2);
  const topControlsY = scrollProgress <= 0.6 ? `-${((scrollProgress / 0.6) * 35).toFixed(1)}px` : '-35px';
  const topControlsOpacity = Math.max(0, 1 - scrollProgress / 0.5).toFixed(2);
  const sideCardY = (scrollProgress * 70).toFixed(1) + 'px';
  const sideCardOpacity = scrollProgress <= 0.75 ? Math.max(0, 1 - scrollProgress / 0.75).toFixed(2) : '0';
  const bottomCaptionY = (scrollProgress * 40).toFixed(1) + 'px';
  const bottomCaptionOpacity = scrollProgress <= 0.65 ? Math.max(0, 1 - scrollProgress / 0.65).toFixed(2) : '0';

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
          imageUrl: '/images/fig-01-table.webp',
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
        <div className="text-xs uppercase tracking-[0.2em] text-[#595D5D] animate-pulse font-mono">
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
        {/* Photographic Background Canvas with Reflow-Free Parallax */}
        <div
          style={{
            transform: `translateY(${backgroundY}) scale(${backgroundScale})`,
            willChange: scrollProgress > 0 ? 'transform' : 'auto',
          }}
          className="absolute -top-[12%] left-0 w-full h-[124%] select-none overflow-hidden"
        >
          {perspectives.map((persp, idx) => {
            const isActive = safePerspectiveIndex === idx;
            return (
              <div
                key={`${activeProduct.id}-perspective-${idx}`}
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1.0)' : 'scale(1.03)',
                  transition: 'opacity 1.3s cubic-bezier(0.16, 1, 0.3, 1), transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'opacity, transform',
                }}
                className={`absolute inset-0 w-full h-full ${isActive ? 'z-10' : 'z-0 pointer-events-none'}`}
              >
                <Image
                  src={resolveImageUrl(persp.imageUrl)}
                  alt={persp.alt}
                  fill
                  priority={idx === 0}
                  unoptimized={idx === 0}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  sizes="100vw"
                  referrerPolicy="no-referrer"
                  className="object-cover object-center"
                />
              </div>
            );
          })}

          {/* Luxury ambient vignette overlay for depth & readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent lg:from-black/35 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />
        </div>

        {/* Parallax Ambient Dimming Layer as user scrolls down towards Object Showcase */}
        <div
          style={{ opacity: Number(heroDimOpacity) }}
          className="absolute inset-0 bg-black pointer-events-none z-15 transition-opacity duration-150"
        />

        {/* Top-Right: Perspective Switcher Tabs & Infinite Loop Control with Parallax */}
        <div
          style={{
            transform: `translateY(${topControlsY})`,
            opacity: Number(topControlsOpacity),
          }}
          className="absolute top-4 left-4 right-4 sm:left-auto sm:right-6 lg:right-12 sm:top-6 z-30 flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/30 px-3 py-1.5 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.5),0_8px_24px_rgba(0,0,0,0.25)] text-xs uppercase tracking-[0.16em]"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-medium text-white truncate max-w-[120px] sm:max-w-none">{activeProduct.name}</span>
            <span className="text-[#c5a059]">•</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="hero-loop-toggle-btn"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume automated cycle' : 'Pause automated cycle'}
              className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.16em] text-[#e5e5e3]/90 hover:text-white transition-colors cursor-pointer"
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
                    aria-label={`View perspective ${persp.tabLabel}`}
                    className={`relative px-2 py-0.5 text-xs transition-all cursor-pointer overflow-hidden ${isActive
                      ? 'bg-white text-[#111111] font-medium'
                      : 'bg-transparent text-[#e5e5e3]/80 hover:text-white'
                      }`}
                  >
                    <span className="relative z-10">{persp.tabLabel}</span>

                    {/* Infinite Progress Hairline on Active Tab */}
                    {isActive && !isPaused && (
                      <span
                        key={`progress-${safeProductIndex}-${safePerspectiveIndex}-${cycleResetKey}`}
                        className="absolute bottom-0 left-0 h-[2px] bg-[#c5a059] z-20 animate-hero-progress"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons: 2-Column Row on Mobile, Top-Left on Desktop */}
        <div
          style={{
            transform: `translateY(${topControlsY})`,
            opacity: Number(topControlsOpacity),
          }}
          className="absolute top-[3.75rem] left-4 right-4 sm:top-6 sm:left-6 lg:left-12 sm:right-auto z-30 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3"
        >
          <button
            id="hero-discover-btn"
            onClick={onDiscoverClick}
            aria-label={editorial.hero.discoverLabel || 'Discover Object'}
            className="group inline-flex items-center justify-center space-x-1.5 sm:space-x-2 bg-[#111111]/90 backdrop-blur-md text-[#f9f9f7] px-2.5 sm:px-4 py-2 sm:py-1.5 text-xs uppercase tracking-[0.14em] sm:tracking-[0.18em] font-medium hover:bg-white hover:text-[#111111] hover:border-white transition-all cursor-pointer border border-white/35 shadow-[0_4px_16px_rgba(0,0,0,0.25)] text-center"
          >
            <span>{editorial.hero.discoverLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059] group-hover:text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </button>

          <button
            id="hero-reserve-btn"
            onClick={onReserveClick}
            aria-label={editorial.hero.reserveLabel || 'Request Priority Access'}
            className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md text-white px-2.5 sm:px-4 py-2 sm:py-1.5 text-xs uppercase tracking-[0.14em] sm:tracking-[0.18em] font-medium hover:bg-white hover:text-[#111111] transition-all cursor-pointer border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] text-center"
          >
            <span className="sm:hidden">Request Access</span>
            <span className="hidden sm:inline">{editorial.hero.reserveLabel || 'Request Priority Access'}</span>
          </button>
        </div>

        {/* Bottom Caption Overlay for Active Perspective with Parallax */}
        <div
          style={{
            transform: `translateY(${bottomCaptionY})`,
            opacity: Number(bottomCaptionOpacity),
          }}
          className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 lg:left-auto lg:right-64 xl:right-72 z-20 pointer-events-none hidden md:block"
        >
          <div
            key={`${activeProduct.id}-main-caption-${safePerspectiveIndex}`}
            className="bg-black/55 backdrop-blur-md px-4 py-2 border border-white/15 text-[#f9f9f7] transition-all duration-500 ease-out"
          >
            <div className="text-xs uppercase tracking-[0.22em] font-medium text-[#c5a059] mb-0.5">
              {currentMain.category} · {currentMain.figureLabel}
            </div>
            <div className="font-[family-name:var(--font-cormorant)] text-[16px] italic font-light text-white">
              {currentMain.title}
            </div>
          </div>
        </div>

        {/* Companion Side Hero Image Card (Bottom-Right Floating Alternate Perspective Preview with Parallax) */}
        <div
          style={{
            transform: `translateY(${sideCardY})`,
            opacity: Number(sideCardOpacity),
          }}
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
                <div
                  key={`${activeProduct.id}-side-perspective-${idx}`}
                  style={{
                    opacity: isSideActive ? 1 : 0,
                    transform: isSideActive ? 'scale(1.0)' : 'scale(1.05)',
                    transition: 'opacity 1.3s cubic-bezier(0.16, 1, 0.3, 1), transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'opacity, transform',
                  }}
                  className={`absolute inset-0 ${isSideActive ? 'z-10' : 'z-0 pointer-events-none'}`}
                >
                  <Image
                    src={resolveImageUrl(persp.imageUrl)}
                    alt={persp.alt}
                    fill
                    sizes="(max-width: 640px) 140px, 160px"
                    referrerPolicy="no-referrer"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
              );
            })}

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none z-10" />

            {/* Top Corner Pill Indicator */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
              <span className="text-xs uppercase tracking-[0.18em] font-medium bg-black/60 backdrop-blur-xs text-[#f9f9f7] px-1.5 py-0.5 border border-white/15">
                {currentSide.badge}
              </span>
              <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#111111] transition-colors">
                <RefreshCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
              </div>
            </div>

            {/* Bottom Caption Overlay on Side Image with smooth crossfade */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 text-[#f9f9f7] pointer-events-none z-20">
              <div
                key={`${activeProduct.id}-side-caption-${perspectives.length > 1 ? (safePerspectiveIndex + 1) % perspectives.length : safePerspectiveIndex}`}
                className="transition-all duration-300 ease-out"
              >
                <div className="text-xs uppercase tracking-[0.2em] font-medium text-[#c5a059] mb-0.5">
                  {currentSide.figureLabel}
                </div>
                <div className="font-[family-name:var(--font-cormorant)] text-xs sm:text-[13px] italic leading-tight text-white line-clamp-1">
                  {currentSide.title}
                </div>
              </div>
              <div className="mt-1 flex items-center space-x-1 text-xs uppercase tracking-[0.16em] text-[#e5e2e1]/80">
                <ZoomIn className="w-2.5 h-2.5" />
                <span>Click to Swap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
