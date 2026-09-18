'use client';

import { useState } from 'react';
import { Check, ShieldCheck, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../types/store';

interface AcquisitionSectionProps {
  product?: Product;
  onSuccessfulAllocation?: (email: string, serial: string) => void;
}

export default function AcquisitionSection({
  product,
  onSuccessfulAllocation,
}: AcquisitionSectionProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [allocatedSerial, setAllocatedSerial] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    // Generate simulated serial reservation between 001 and 250
    const randomNum = Math.floor(Math.random() * 240) + 10;
    const serialStr = `MG-01-${String(randomNum).padStart(3, '0')}`;
    setAllocatedSerial(serialStr);
    setSubmitted(true);
    if (onSuccessfulAllocation) {
      onSuccessfulAllocation(email, serialStr);
    }
  };

  const copySerial = () => {
    if (!allocatedSerial) return;
    navigator.clipboard.writeText(allocatedSerial);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      id="acquisition-section"
      className="w-full border-b border-[#e5e5e3] py-14 sm:py-20 md:py-28 bg-[#f4f4f2] transition-colors overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease: luxuryEase }}
        className="max-w-3xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* Eyebrow */}
        <div className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-3 sm:mb-4">
          Limited Batch Allocation
        </div>

        {/* Display Title */}
        <h2 className="font-[family-name:var(--font-cormorant)] text-[34px] sm:text-[46px] md:text-[58px] font-light leading-tight text-[#111111] mb-4 sm:mb-6">
          Acquire {product?.name || 'the current edition'}
        </h2>

        {/* Description */}
        <p className="text-[13px] sm:text-[15px] text-[#444748] font-light leading-[1.7] max-w-xl mx-auto mb-8 sm:mb-10">
          {product?.description || 'This edition is offered through a limited serialized allocation.'}
        </p>

        {!submitted ? (
          /* Input Form matching design */
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center max-w-md mx-auto gap-2 sm:gap-0 shadow-xs"
          >
            <input
              id="collector-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="COLLECTOR@DOMAIN.COM"
              required
              className="w-full sm:flex-1 bg-[#f9f9f7] text-[#111111] placeholder:text-[#8c8c8c] placeholder:tracking-[0.16em] sm:placeholder:tracking-[0.18em] text-[10px] sm:text-[11px] uppercase tracking-[0.16em] px-4 sm:px-5 py-3.5 sm:py-4 border border-[#e5e5e3] sm:border-r-0 focus:outline-none focus:border-[#111111] transition-colors"
            />
            <button
              id="join-list-btn"
              type="submit"
              className="w-full sm:w-auto bg-[#111111] text-[#f9f9f7] px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer whitespace-nowrap border border-[#111111]"
            >
              Join List
            </button>
          </form>
        ) : (
          /* Confirmed Reservation Ticket / Serial Certificate Card */
          <div className="bg-[#f9f9f7] border border-[#e5e5e3] p-5 sm:p-8 max-w-md mx-auto text-left shadow-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#e5e5e3] pb-3 sm:pb-4 mb-3 sm:mb-4">
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#111111] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                Priority Allocation Secured
              </span>
              <span className="text-[9px] uppercase tracking-[0.15em] font-mono text-[#c5a059]">
                Verified
              </span>
            </div>

            <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              <div>
                <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#747878]">
                  Serial Reservation
                </div>
                <div className="text-[17px] sm:text-[18px] font-mono font-medium text-[#111111]">
                  {allocatedSerial} / 250
                </div>
              </div>

              <div>
                <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#747878]">
                  Registered Collector
                </div>
                <div className="text-[12px] sm:text-[13px] font-medium text-[#111111] truncate">
                  {email}
                </div>
              </div>

              <div className="text-[11px] sm:text-[12px] text-[#444748] font-light pt-1.5 sm:pt-2 leading-[1.6]">
                You are registered for early acquisition 48 hours prior to public
                drop. A signed digital certificate has been dispatched to your
                inbox.
              </div>
            </div>

            <div className="flex items-center justify-between pt-3.5 sm:pt-4 border-t border-[#e5e5e3]">
              <button
                onClick={copySerial}
                className="inline-flex items-center space-x-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em] font-medium text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Serial Copied' : 'Copy Serial Key'}</span>
              </button>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#8c8c8c]">
                Zurich Atelier
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
