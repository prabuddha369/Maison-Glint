'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, ArrowUpRight, Menu, X, Shield } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface NavbarProps {
  onOpenBag?: () => void;
  onOpenAllocation?: () => void;
  bagCount?: number;
}

export default function Navbar({
  onOpenBag,
  onOpenAllocation,
  bagCount: propBagCount,
}: NavbarProps) {
  const router = useRouter();
  const { openCart, itemCount } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const displayBagCount = propBagCount !== undefined ? propBagCount : itemCount;

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

  const navLinks = [
    { label: 'THE PLATE', href: '#the-plate' },
    { label: 'COLLECTION', href: '#collection' },
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
    <>
      <header className="sticky top-0 z-40 w-full bg-[#f9f9f7]/95 backdrop-blur-md border-b border-[#e5e5e3] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Lockup */}
          <Link
            id="brand-logo"
            href="/"
            className="group flex items-center focus:outline-none py-1"
            aria-label="Maison Glint"
          >
            <Image
              src="/primary_logo_sm.svg"
              alt="Maison Glint"
              width={180}
              height={56}
              priority
              referrerPolicy="no-referrer"
              className="h-8 sm:h-9.5 md:h-10 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>

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
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            <button
              id="nav-explore-btn"
              onClick={onOpenAllocation || openCart}
              className="hidden sm:inline-flex items-center space-x-2 bg-[#111111] text-[#f9f9f7] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer border border-[#111111]"
            >
              <span>Acquire Object 01</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059]" />
            </button>

            {/* Bag Icon Button with Live Badge */}
            <button
              id="nav-bag-btn"
              onClick={handleBagClick}
              aria-label="View Acquisition Bag"
              className="relative p-2 text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              {displayBagCount > 0 && (
                <span className="absolute top-1 right-0.5 w-4 h-4 bg-[#111111] text-[#f9f9f7] text-[9px] font-medium flex items-center justify-center border border-[#f9f9f7]">
                  {displayBagCount}
                </span>
              )}
            </button>

            {/* Collector Profile / Status */}
            <button
              id="nav-collector-btn"
              onClick={handleUserClick}
              aria-label={user ? 'Collector Portal' : 'Collector Sign In'}
              title={user ? `Signed in as ${user.email}` : 'Collector Sign In'}
              className="p-2 text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer relative"
            >
              <User className="w-4 h-4 stroke-[1.5]" />
              {user && (
                <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-[#c5a059] rounded-none" />
              )}
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
            className="md:hidden border-t border-[#e5e5e3] bg-[#f9f9f7] px-6 py-6 animate-fadeIn shadow-lg"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
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

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-[12px] uppercase tracking-[0.2em] font-medium text-[#747878] hover:text-[#111111] transition-colors border-b border-[#e5e5e3]/60 flex items-center justify-between"
              >
                <span>Atelier Admin</span>
                <Shield className="w-3.5 h-3.5 text-[#c5a059]" />
              </Link>

              <div className="pt-5 flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAllocation) onOpenAllocation();
                    else openCart();
                  }}
                  className="w-full py-3.5 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.18em] font-medium flex items-center justify-center space-x-2 border border-[#111111]"
                >
                  <span>Acquire Object 01</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
