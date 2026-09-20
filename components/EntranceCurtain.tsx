'use client';

import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

const CRITICAL_STOREFRONT_IMAGES = [
  '/images/products/object-01-the-glint-plate-hero-fig01.webp',
  '/images/products/object-01-the-glint-plate-hero-fig02.webp',
  '/images/products/object-01-the-glint-plate-catalog.webp',
  '/images/products/object-02-fluid-coupe-pair-catalog.webp',
  '/images/products/object-03-monolith-serving-knife-catalog.webp',
  '/images/products/finish-study-morning.webp',
];

export default function EntranceCurtain() {
  const { hasCurtainBeenSeen, enterMaison } = useAudio();
  const [isExiting, setIsExiting] = useState(false);

  // Preload critical above-the-fold assets while the curtain is viewed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      CRITICAL_STOREFRONT_IMAGES.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, []);

  if (hasCurtainBeenSeen) return null;

  const handleEnter = () => {
    setIsExiting(true);
    // Wait for exit animation to complete (1 beat = 1000ms) before triggering audio + dismiss
    setTimeout(() => {
      enterMaison();
    }, 1000);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none
        ${isExiting ? 'curtain-exit' : 'curtain-enter'}`}
      onClick={handleEnter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEnter(); }}
      aria-label="Enter the Maison"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 40%, #0d0d0d 100%)',
      }}
    >
      {/* Subtle gold accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px opacity-30"
        style={{
          height: '30vh',
          background: 'linear-gradient(180deg, transparent 0%, #c9a96e 50%, transparent 100%)',
        }}
      />

      {/* Brand wordmark */}
      <div className="relative z-10 text-center">
        <h1
          className="font-[var(--font-cormorant)] text-[#f5f0e8] tracking-[0.35em] uppercase mb-2"
          style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
            fontWeight: 300,
            letterSpacing: '0.35em',
          }}
        >
          Maison Glint
        </h1>

        {/* Thin divider */}
        <div
          className="mx-auto my-6 opacity-40"
          style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)',
          }}
        />

        {/* Enter text */}
        <p
          className="font-[var(--font-cormorant)] italic text-[#c9a96e] tracking-[0.2em] curtain-text-pulse"
          style={{
            fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)',
            fontWeight: 300,
          }}
        >
          Enter the Maison
        </p>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px opacity-30"
        style={{
          height: '30vh',
          background: 'linear-gradient(0deg, transparent 0%, #c9a96e 50%, transparent 100%)',
        }}
      />

      {/* Subtle corner accents */}
      <div className="absolute top-8 left-8 w-6 h-6 opacity-15"
        style={{ borderTop: '1px solid #c9a96e', borderLeft: '1px solid #c9a96e' }} />
      <div className="absolute top-8 right-8 w-6 h-6 opacity-15"
        style={{ borderTop: '1px solid #c9a96e', borderRight: '1px solid #c9a96e' }} />
      <div className="absolute bottom-8 left-8 w-6 h-6 opacity-15"
        style={{ borderBottom: '1px solid #c9a96e', borderLeft: '1px solid #c9a96e' }} />
      <div className="absolute bottom-8 right-8 w-6 h-6 opacity-15"
        style={{ borderBottom: '1px solid #c9a96e', borderRight: '1px solid #c9a96e' }} />
    </div>
  );
}
