'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import type { Product } from '../types/store';

interface NavbarProps {
  onOpenBag?: () => void;
  onOpenAllocation?: () => void;
  onAcquire?: (product?: Product) => void;
  bagCount?: number;
  productName?: string;
  activeProduct?: Product;
}

export default function Navbar({
  onOpenBag,
  onOpenAllocation,
  onAcquire,
  bagCount: propBagCount,
  productName = 'the current edition',
  activeProduct,
}: NavbarProps) {
  const router = useRouter();
  const { addItem, openCart, itemCount } = useCart();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayBagCount = propBagCount !== undefined ? propBagCount : itemCount;
  const resolvedProductName = activeProduct?.name || productName || 'the current edition';

  const handleAcquire = () => {
    if (onAcquire) {
      onAcquire(activeProduct);
    } else {
      if (activeProduct) {
        addItem(activeProduct, 1, activeProduct.specifications);
      }
      openCart();
    }
  };

  const handleConfirmationPending = (email: string) => {
    setConfirmationNotice(`Confirmation email sent to ${email}. Check your inbox, click Verify Client Profile, then sign in.`);
    window.setTimeout(() => setConfirmationNotice(''), 10000);
  };

  const handleBagClick = () => {
    if (onOpenBag) {
      onOpenBag();
    } else {
      openCart();
    }
  };

  const handleUserClick = () => {
    if (user) {
      router.push('/account');
    } else {
      setAuthModalOpen(true);
    }
  };

  const desktopNavLinks = [
    { label: 'THE PLATE', href: '#the-plate' },
    { label: 'COLLECTION', href: '#collection' },
    { label: 'THE FINISH', href: '#the-finish' },
    { label: 'AT THE TABLE', href: '#at-the-table' },
  ];

  const mobileNavLinks = [
    ...desktopNavLinks,
    { label: 'SPECIFICATIONS', href: '#specifications' },
  ];

  const objectLabel =
    resolvedProductName.match(/Object\s+\d+/i)?.[0] ||
    (resolvedProductName.includes('—')
      ? resolvedProductName.split('—')[0].trim()
      : resolvedProductName);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {confirmationNotice && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm bg-[#f0f9f0] border border-[#cceccc] text-[#166534] px-4 py-3 shadow-lg text-[11px] leading-relaxed">
          {confirmationNotice}
        </div>
      )}
      <header className="sticky top-0 z-40 w-full bg-[#f9f9f7]/95 backdrop-blur-md border-b border-[#e5e5e3] transition-all duration-300">
        {/* Parent Containing Div */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col">
          {/* Seperate Div: Brand Logo Image */}
          <div className="w-full flex items-center justify-center">
            <Link
              id="brand-logo"
              href="/"
              className="group flex items-center focus:outline-none"
              aria-label="Maison Glint"
            >
              <Image
                src="/primary_logo_sm.svg"
                alt="Maison Glint"
                width={200}
                height={60}
                priority
                referrerPolicy="no-referrer"
                className="h-24 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </div>

          {/* Seperate Div: The Rest (Navigation & Actions) */}
          <div className="w-full border-t border-[#e5e5e3] py-2.5 sm:py-3 flex items-center justify-between relative">
            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden flex items-center space-x-2 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-medium text-[#111111] p-1.5 hover:text-[#c5a059] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <Menu className="w-4 h-4 stroke-[1.5]" />
              )}
              <span>Menu</span>
            </button>

            {/* Left Spacer to balance desktop center navigation */}
            <div className="hidden md:flex min-w-0 flex-1" />

            {/* Center Desktop Navigation - 4 primary links ending at AT THE TABLE */}
            <nav
              id="desktop-nav"
              className="hidden md:flex items-center justify-center space-x-6 lg:space-x-8 xl:space-x-10 shrink-0 px-2"
            >
              {desktopNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="text-[11px] uppercase tracking-[0.18em] font-medium text-[#444748] hover:text-[#111111] relative py-1 transition-colors whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#111111] hover:after:w-full after:transition-all after:duration-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right Actions with guaranteed clearance from AT THE TABLE */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-4 lg:space-x-6 min-w-0 flex-1 pl-6 lg:pl-10">
              <button
                id="nav-explore-btn"
                onClick={handleAcquire}
                title={resolvedProductName}
                className="hidden lg:inline-flex items-center space-x-2 bg-[#111111] text-[#f9f9f7] px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer border border-[#111111] shrink-0"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={objectLabel}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block whitespace-nowrap"
                  >
                    Acquire {objectLabel}
                  </motion.span>
                </AnimatePresence>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059]" />
              </button>

              {/* Bag Icon Button with Live Badge */}
              <button
                id="nav-bag-btn"
                onClick={handleBagClick}
                aria-label="View Acquisition Bag"
                className="relative p-2 text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                {mounted && displayBagCount > 0 && (
                  <span className="absolute top-1 right-0.5 w-4 h-4 bg-[#111111] text-[#f9f9f7] text-[9px] font-medium flex items-center justify-center border border-[#f9f9f7]">
                    {displayBagCount}
                  </span>
                )}
              </button>

              {/* Collector Profile / Status */}
              <button
                id="nav-collector-btn"
                onClick={handleUserClick}
                aria-label={mounted && user ? 'Collector Portal' : 'Collector Sign In'}
                title={mounted && user ? `Signed in as ${user.email}` : 'Collector Sign In'}
                className="p-2 text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer relative shrink-0"
              >
                <User className="w-4 h-4 stroke-[1.5]" />
                {mounted && user && (
                  <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-[#c5a059] rounded-none" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu-dropdown"
            className="md:hidden border-t border-[#e5e5e3] bg-[#f9f9f7] px-6 py-6 animate-fadeIn shadow-lg"
          >
            <div className="flex flex-col space-y-1">
              {mobileNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="py-3 text-[12px] uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#c5a059] transition-colors border-b border-[#e5e5e3]/60 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </a>
              ))}

              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-[12px] uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#c5a059] transition-colors border-b border-[#e5e5e3]/60 flex items-center justify-between"
              >
                <span>Collector Portal</span>
                <User className="w-3.5 h-3.5 text-[#8c8c8c]" />
              </Link>

              <div className="pt-5 flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAcquire();
                  }}
                  className="w-full py-3.5 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.18em] font-medium flex items-center justify-center space-x-2 border border-[#111111]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={resolvedProductName}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-block"
                    >
                      Acquire {resolvedProductName}
                    </motion.span>
                  </AnimatePresence>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onConfirmationPending={handleConfirmationPending}
      />
    </>
  );
}
