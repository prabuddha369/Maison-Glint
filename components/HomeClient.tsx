'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useCart } from '@/hooks/useCart';
import { useCatalog } from '@/lib/catalog';
import type { Product } from '@/types/store';
import TopAnnouncement from '@/components/TopAnnouncement';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';

// Lazy-load below-the-fold components for reduced initial bundle
const ObjectShowcase = dynamic(() => import('@/components/ObjectShowcase'));
const FinishPhilosophy = dynamic(() => import('@/components/FinishPhilosophy'));
const Specifications = dynamic(() => import('@/components/Specifications'));
const CatalogGrid = dynamic(() => import('@/components/CatalogGrid'));
const AtTheTable = dynamic(() => import('@/components/AtTheTable'));
const AcquisitionSection = dynamic(() => import('@/components/AcquisitionSection'));
const Footer = dynamic(() => import('@/components/Footer'));

// Lazy-load modals/drawers — only loaded when triggered
const PriorityAccessModal = dynamic(() => import('@/components/PriorityAccessModal'), { ssr: false });
const AcquisitionBagDrawer = dynamic(() => import('@/components/AcquisitionBagDrawer'), { ssr: false });
const RitualModal = dynamic(() => import('@/components/RitualModal'), { ssr: false });

export default function HomeClient() {
  const { openCart, itemCount } = useCart();
  const { products, loading: productsLoading } = useCatalog();
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isManualPause, setIsManualPause] = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [bagDrawerOpen, setBagDrawerOpen] = useState(false);
  const [bagCount, setBagCount] = useState(1);
  const [selectedRitual, setSelectedRitual] = useState<{
    title: string;
    subtitle: string;
    image: string;
    description: string;
    curation: string[];
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeProduct = products[activeProductIndex] || products[0];

  const handleNextProduct = () => {
    setIsManualPause(true);
    setActiveProductIndex((prev) => (products.length ? (prev + 1) % products.length : 0));
  };

  const handlePreviousProduct = () => {
    setIsManualPause(true);
    setActiveProductIndex((prev) => (products.length ? (prev - 1 + products.length) % products.length : 0));
  };

  const handleSelectProduct = (index: number) => {
    setIsManualPause(true);
    setActiveProductIndex(index % (products.length || 1));
  };

  const handleHeroProductChange = (product: Product, index: number) => {
    if (!isManualPause) {
      setActiveProductIndex(index);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSuccessfulAllocation = (email: string, serial: string) => {
    showToast(`Serial reservation ${serial} registered for ${email}`);
  };

  const handleProceedCheckout = () => {
    setBagDrawerOpen(false);
    setPriorityModalOpen(true);
  };

  const scrollToPlate = () => {
    const target = document.querySelector('#the-plate');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f9f7] text-[#111111] flex flex-col selection:bg-[#111111] selection:text-[#f9f9f7]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#111111] text-[#f9f9f7] px-5 py-3 text-xs uppercase tracking-[0.18em] shadow-xl border border-[#c5a059] animate-fadeIn flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-[#c5a059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Notice */}
      <TopAnnouncement onOpenAllocation={() => setPriorityModalOpen(true)} />

      {/* Main Luxury Navigation */}
      <Navbar
        onOpenBag={openCart}
        onOpenAllocation={() => setPriorityModalOpen(true)}
        bagCount={itemCount}
        activeProduct={activeProduct}
        productName={activeProduct?.name}
      />

      {/* Hero Section */}
      <HeroSection
        products={products}
        loading={productsLoading}
        activeProductIndex={activeProductIndex}
        onReserveClick={() => setPriorityModalOpen(true)}
        onDiscoverClick={scrollToPlate}
        onActiveProductChange={handleHeroProductChange}
        onSelectProductIndex={(idx) => {
          if (!isManualPause) {
            setActiveProductIndex(idx);
          }
        }}
      />

      {/* 01 / The Glint Plate Showcase */}
      <ObjectShowcase
        products={products}
        loading={productsLoading}
        activeProduct={activeProduct}
        activeIndex={activeProductIndex}
        onNext={handleNextProduct}
        onPrevious={handlePreviousProduct}
        onRequestPriorityAccess={() => setPriorityModalOpen(true)}
      />

      {/* 02 / The Finish & Philosophy */}
      <FinishPhilosophy
        products={products}
        loading={productsLoading}
        activeProduct={activeProduct}
        activeIndex={activeProductIndex}
        onNext={handleNextProduct}
        onPrevious={handlePreviousProduct}
      />

      {/* 03 / Specifications */}
      <Specifications
        products={products}
        loading={productsLoading}
        activeProduct={activeProduct}
        activeIndex={activeProductIndex}
        onNext={handleNextProduct}
        onPrevious={handlePreviousProduct}
      />

      {/* 04 / The Atelier Collection (Dynamic Multi-Object Catalog) */}
      <CatalogGrid
        products={products}
        loading={productsLoading}
        onSelectProduct={(prod, idx) => {
          handleSelectProduct(idx);
          scrollToPlate();
        }}
      />

      {/* 05 / At The Table */}
      <AtTheTable
        products={products}
        loading={productsLoading}
        activeProduct={activeProduct}
        activeIndex={activeProductIndex}
        onNext={handleNextProduct}
        onPrevious={handlePreviousProduct}
        onSelectRitual={(ritual) => setSelectedRitual(ritual)}
      />

      {/* Newsletter Subscription */}
      <AcquisitionSection
        product={activeProduct || products[0]}
        onSubscribe={(email) => showToast(`Newsletter subscription registered for ${email}`)}
      />

      {/* Atelier Footer */}
      <Footer />

      {/* Priority Access / Allocation Modal */}
      <PriorityAccessModal
        isOpen={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        onSuccess={handleSuccessfulAllocation}
        products={products}
        selectedProductId={activeProduct?.id}
      />

      {/* Acquisition Bag Drawer */}
      <AcquisitionBagDrawer
        isOpen={bagDrawerOpen}
        onClose={() => setBagDrawerOpen(false)}
        quantity={bagCount}
        onUpdateQuantity={(q) => {
          setBagCount(q);
          if (q > 0) showToast(`Acquisition drawer updated: ${q} exemplar(s)`);
        }}
        onProceedCheckout={handleProceedCheckout}
        product={activeProduct || products[0]}
      />

      {/* Ritual Lightbox Inspector Modal */}
      <RitualModal
        ritual={selectedRitual}
        onClose={() => setSelectedRitual(null)}
        onRequestAccess={() => setPriorityModalOpen(true)}
      />
    </main>
  );
}
