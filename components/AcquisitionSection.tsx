'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../types/store';

interface AcquisitionSectionProps {
  product?: Product;
  onSuccessfulAllocation?: (email: string, serial: string) => void;
  onSubscribe?: (email: string) => void;
}

export default function AcquisitionSection({
  onSuccessfulAllocation,
  onSubscribe,
}: AcquisitionSectionProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed');
      }

      setSubmitted(true);
      if (onSubscribe) {
        onSubscribe(email);
      }
      if (onSuccessfulAllocation) {
        onSuccessfulAllocation(email, 'NEWSLETTER');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to register subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="acquisition-section"
      className="w-full border-b border-[#e5e5e3] py-16 sm:py-24 md:py-32 bg-[#f4f4f2] transition-colors overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease: luxuryEase }}
        className="max-w-3xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* Prominent Brand Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Image
            src="/primary_logo_sm.svg"
            alt="Maison Glint"
            width={340}
            height={90}
            priority
            referrerPolicy="no-referrer"
            className="h-12 sm:h-16 md:h-20 w-auto object-contain"
          />
        </div>

        {/* Tagline Eyebrow */}
        <div className="text-[10px] md:text-[11px] uppercase tracking-[0.28em] font-medium text-[#c5a059] mb-3 sm:mb-4">
          Modernist Chromeware
        </div>

        {/* Display Title */}
        <h2 className="font-[family-name:var(--font-cormorant)] text-[34px] sm:text-[46px] md:text-[56px] font-light leading-tight text-[#111111] mb-4 sm:mb-5">
          Subscribe to Our Newsletter
        </h2>

        {/* Editorial Description */}
        <p className="text-[13px] sm:text-[15px] text-[#444748] font-light leading-[1.7] max-w-xl mx-auto mb-8 sm:mb-10">
          Notes on material craft, architectural table settings, and private release notifications from the atelier.
        </p>

        {!submitted ? (
          /* Input Form */
          <div className="max-w-md mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-0 shadow-xs"
            >
              <input
                id="collector-email-input"
                type="email"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR.EMAIL@DOMAIN.COM"
                required
                className="w-full sm:flex-1 bg-[#f9f9f7] text-[#111111] placeholder:text-[#8c8c8c] placeholder:tracking-[0.16em] sm:placeholder:tracking-[0.18em] text-[10px] sm:text-[11px] uppercase tracking-[0.16em] px-4 sm:px-5 py-3.5 sm:py-4 border border-[#e5e5e3] sm:border-r-0 focus:outline-none focus:border-[#111111] transition-colors disabled:opacity-60"
              />
              <button
                id="newsletter-subscribe-btn"
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#111111] text-[#f9f9f7] px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer whitespace-nowrap border border-[#111111] disabled:opacity-60 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Registering...' : 'Subscribe'}</span>
              </button>
            </form>
            {error && (
              <p className="text-[11px] text-[#b91c1c] text-center mt-2.5">
                {error}
              </p>
            )}
          </div>
        ) : (
          /* Confirmed Subscription Card */
          <div className="bg-[#f9f9f7] border border-[#e5e5e3] p-6 sm:p-8 max-w-md mx-auto text-center shadow-xs animate-fadeIn">
            <div className="w-10 h-10 border border-[#c5a059] mx-auto mb-4 flex items-center justify-center">
              <Check className="w-5 h-5 text-[#c5a059]" />
            </div>

            <span className="text-[9px] uppercase tracking-[0.22em] text-[#c5a059] font-medium block mb-1">
              Subscription Registered
            </span>

            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#111111] mb-2">
              Welcome to the Atelier
            </h3>

            <p className="text-[12px] text-[#444748] font-light leading-relaxed mb-5">
              We have noted <span className="font-mono text-[#111111] font-medium">{email}</span>. You will receive our seasonal monographs and unreleased chromeware allocations directly.
            </p>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              className="text-[9px] uppercase tracking-[0.18em] text-[#747878] hover:text-[#111111] transition-colors underline underline-offset-4 cursor-pointer"
            >
              Register Another Address
            </button>
          </div>
        )}
      </motion.div>
    </section>
  );
}
