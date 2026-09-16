'use client';

import { useState } from 'react';
import { ShoppingBag, User, ArrowUpRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenBag: () => void;
  onOpenAllocation: () => void;
  bagCount: number;
}

export default function Navbar({
  onOpenBag,
  onOpenAllocation,
  bagCount,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'THE PLATE', href: '#the-plate' },
    { label: 'THE FINISH', href: '#the-finish' },
    { label: 'AT THE TABLE', href: '#at-the-table' },
    { label: 'SPECIFICATIONS', href: '#specifications' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f9f9f7]/95 backdrop-blur-md border-b border-[#e5e5e3] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Brand Lockup */}
        <a
          id="brand-logo"
          href="#"
          className="group flex flex-col items-start focus:outline-none"
        >
          <span className="font-[family-name:var(--font-cormorant)] text-[22px] tracking-[0.2em] font-light uppercase text-[#111111] group-hover:text-[#c5a059] transition-colors leading-none">
            Maison Glint
          </span>
          <span className="font-[family-name:var(--font-inter)] text-[8px] tracking-[0.3em] font-normal uppercase text-[#8c8c8c] mt-1.5 leading-none">
            Modernist Chromeware
          </span>
        </a>

        {/* Center Desktop Navigation */}
        <nav
          id="desktop-nav"
          className="hidden md:flex items-center space-x-8 lg:space-x-10"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-[11px] uppercase tracking-[0.16em] font-medium text-[#444748] hover:text-[#111111] relative py-1 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#111111] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          <button
            id="nav-explore-btn"
            onClick={onOpenAllocation}
            className="hidden sm:inline-flex items-center space-x-2 bg-[#111111] text-[#f9f9f7] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer border border-[#111111]"
          >
            <span>Explore Object 01</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059]" />
          </button>

          {/* Bag Icon Button */}
          <button
            id="nav-bag-btn"
            onClick={onOpenBag}
            aria-label="View Acquisition Bag"
            className="relative p-2 text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
            {bagCount > 0 && (
              <span className="absolute top-1 right-0.5 w-3.5 h-3.5 bg-[#111111] text-[#f9f9f7] text-[8px] font-medium flex items-center justify-center border border-[#f9f9f7]">
                {bagCount}
              </span>
            )}
          </button>

          {/* Collector Profile / Status */}
          <button
            id="nav-collector-btn"
            onClick={onOpenAllocation}
            aria-label="Collector Registry"
            className="p-2 text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 stroke-[1.5]" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[1.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[1.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-dropdown"
          className="md:hidden border-t border-[#e5e5e3] bg-[#f9f9f7] px-6 py-8 animate-fadeIn"
        >
          <div className="flex flex-col space-y-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-[13px] uppercase tracking-[0.18em] font-medium text-[#111111] hover:text-[#c5a059] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-[#e5e5e3] flex flex-col space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAllocation();
                }}
                className="w-full py-3 bg-[#111111] text-[#f9f9f7] text-[11px] uppercase tracking-[0.16em] font-medium flex items-center justify-center space-x-2"
              >
                <span>Explore Object 01</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
