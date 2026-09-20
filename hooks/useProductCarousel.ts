'use client';

import { useEffect, useState } from 'react';
import type { Product } from '../types/store';

interface ProductCarouselOptions {
  interval?: number;
  autoPlay?: boolean;
}

export function useProductCarousel(
  products: Product[],
  { interval = 8000, autoPlay = true }: ProductCarouselOptions = {}
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    setActiveIndex((current) => (products.length ? Math.min(current, products.length - 1) : 0));
  }, [products.length]);

  useEffect(() => {
    if (!autoPlay || isPaused || prefersReducedMotion || products.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, interval, isPaused, prefersReducedMotion, products.length]);

  const next = () => setActiveIndex((current) => (products.length ? (current + 1) % products.length : 0));
  const previous = () => setActiveIndex((current) => (products.length ? (current - 1 + products.length) % products.length : 0));

  return {
    activeIndex,
    activeProduct: products[activeIndex],
    isPaused,
    setIsPaused,
    prefersReducedMotion,
    setActiveIndex,
    next,
    previous,
  };
}