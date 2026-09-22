'use client';

import { ArrowUpRight, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { motion } from 'motion/react';

function PinterestIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

export default function Footer() {

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
              <div className="text-xs uppercase tracking-[0.25em] font-medium text-[#595D5D] mb-1">
                Archive Note
              </div>
              <div className="font-[family-name:var(--font-cormorant)] text-[14px] sm:text-[15px] italic text-[#111111] font-light">
                Studio Atelier: Zurich — Series 01 Released in 250 Exemplars.
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.22em] font-semibold text-[#111111] mb-4 sm:mb-6">
              Navigation
            </div>
            <ul className="space-y-3 sm:space-y-4 text-xs uppercase tracking-[0.18em] font-medium text-[#444748]">
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
            </ul>
          </div>

          {/* Column 3: Connect & Socials */}
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.22em] font-semibold text-[#111111] mb-2 sm:mb-4">
              Connect & Socials
            </div>
            <p className="text-[12px] sm:text-[13px] text-[#444748] font-light leading-[1.6] mb-5 sm:mb-6">
              Direct inquiries, visual archives, and atelier correspondence across our channels.
            </p>

            <ul className="space-y-3 text-xs uppercase tracking-[0.16em] font-medium text-[#444748]">
              <li>
                <a
                  href="mailto:founder@maisonglint.com"
                  className="flex items-center justify-between group hover:text-[#111111] transition-colors py-1 border-b border-[#e5e5e3]/60"
                >
                  <span className="flex items-center space-x-2.5">
                    <Mail className="w-3.5 h-3.5 text-[#595D5D] group-hover:text-[#111111] transition-colors" />
                    <span>Email · founder@maisonglint.com</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8c8c8c] group-hover:text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/maisonglint/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group hover:text-[#111111] transition-colors py-1 border-b border-[#e5e5e3]/60"
                >
                  <span className="flex items-center space-x-2.5">
                    <Instagram className="w-3.5 h-3.5 text-[#595D5D] group-hover:text-[#111111] transition-colors" />
                    <span>Instagram</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8c8c8c] group-hover:text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61594635562041"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Maison Glint on Facebook"
                  className="flex items-center justify-between group hover:text-[#111111] transition-colors py-1 border-b border-[#e5e5e3]/60"
                >
                  <span className="flex items-center space-x-2.5">
                    <Facebook className="w-3.5 h-3.5 text-[#595D5D] group-hover:text-[#111111] transition-colors" />
                    <span>Facebook</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8c8c8c] group-hover:text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.pinterest.com/founder1568/_profile/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Maison Glint on Pinterest"
                  className="flex items-center justify-between group hover:text-[#111111] transition-colors py-1 border-b border-[#e5e5e3]/60"
                >
                  <span className="flex items-center space-x-2.5">
                    <PinterestIcon className="w-3.5 h-3.5 text-[#595D5D] group-hover:text-[#111111] transition-colors" />
                    <span>Pinterest</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8c8c8c] group-hover:text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@maisonglint"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Maison Glint on YouTube"
                  className="flex items-center justify-between group hover:text-[#111111] transition-colors py-1 border-b border-[#e5e5e3]/60"
                >
                  <span className="flex items-center space-x-2.5">
                    <Youtube className="w-3.5 h-3.5 text-[#595D5D] group-hover:text-[#111111] transition-colors" />
                    <span>YouTube</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8c8c8c] group-hover:text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Bottom Legal & Craft Strip */}
      <div className="border-t border-[#e5e5e3] py-5 sm:py-6 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#595D5D] text-center md:text-left">
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
