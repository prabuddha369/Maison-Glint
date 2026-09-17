'use client';

import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  const [subEmail, setSubEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail || !subEmail.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubEmail('');
      setSubscribed(false);
    }, 4000);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const elem = document.querySelector(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  return (
    <footer id="main-footer" className="w-full bg-[#f4f4f2] text-[#111111] overflow-hidden">
      {/* Top 3-Column Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.85, ease: luxuryEase }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 md:py-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 lg:gap-16">
          {/* Column 1: Brand & Atelier Mission */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="font-[family-name:var(--font-cormorant)] text-[28px] sm:text-[36px] font-light text-[#111111] mb-3 sm:mb-4 leading-none">
                Maison Glint
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#444748] font-light leading-[1.7] max-w-sm mb-6 sm:mb-8">
                Forging liquid geometry into permanent domestic sculpture.
                Hand-finished mirror chrome editions produced in restricted
                serial batches.
              </p>
            </div>

            <div className="pt-4 border-t border-[#e5e5e3]">
              <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-medium text-[#747878] mb-1">
                Archive Note
              </div>
              <div className="font-[family-name:var(--font-cormorant)] text-[14px] sm:text-[15px] italic text-[#111111] font-light">
                Studio Atelier: Zurich — Series 01 Released in 250 Exemplars.
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] font-semibold text-[#111111] mb-4 sm:mb-6">
              Navigation
            </div>
            <ul className="space-y-3 sm:space-y-4 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-medium text-[#444748]">
              <li>
                <a
                  href="#the-plate"
                  onClick={(e) => scrollToSection(e, '#the-plate')}
                  className="hover:text-[#111111] transition-colors"
                >
                  The Plate
                </a>
              </li>
              <li>
                <a
                  href="#the-finish"
                  onClick={(e) => scrollToSection(e, '#the-finish')}
                  className="hover:text-[#111111] transition-colors"
                >
                  The Finish
                </a>
              </li>
              <li>
                <a
                  href="#at-the-table"
                  onClick={(e) => scrollToSection(e, '#at-the-table')}
                  className="hover:text-[#111111] transition-colors"
                >
                  At The Table
                </a>
              </li>
              <li>
                <a
                  href="#specifications"
                  onClick={(e) => scrollToSection(e, '#specifications')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Specifications
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-[#111111] transition-colors"
                >
                  Collector Account
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  className="hover:text-[#111111] transition-colors text-[#747878]"
                >
                  Atelier Admin
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Private Edition Release */}
          <div className="md:col-span-4">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] font-semibold text-[#111111] mb-2 sm:mb-4">
              Private Edition Release
            </div>
            <p className="text-[12px] sm:text-[13px] text-[#444748] font-light leading-[1.6] mb-4 sm:mb-6">
              Receive direct notifications prior to unreleased chromeware batch
              allocations.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="SUBSCRIBER@ATELIER.COM"
                  required
                  className="w-full bg-transparent text-[#111111] placeholder:text-[#8c8c8c] placeholder:tracking-[0.18em] sm:placeholder:tracking-[0.2em] text-[10px] sm:text-[11px] uppercase tracking-[0.16em] py-2.5 border-b border-[#8c8c8c] focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center space-x-2 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] font-semibold text-[#111111] hover:text-[#c5a059] transition-colors pt-1 sm:pt-2 cursor-pointer group"
              >
                <span>
                  {subscribed
                    ? 'Registration Dispatched'
                    : 'Request Acquisition Notice'}
                </span>
                {subscribed ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Bottom Legal & Craft Strip */}
      <div className="border-t border-[#e5e5e3] py-5 sm:py-6 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#747878] text-center md:text-left">
          <div>© 2026 Maison Glint. All Rights Reserved.</div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-6 text-center">
            <span>Grade 316 Stainless Steel</span>
            <span className="text-[#c5a059]">·</span>
            <span>Micro-Buff Mirror Polish</span>
            <span className="text-[#c5a059]">·</span>
            <span>Edition Authenticity Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
