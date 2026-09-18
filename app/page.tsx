'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCatalog } from '@/lib/catalog';
import TopAnnouncement from '@/components/TopAnnouncement';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ObjectShowcase from '@/components/ObjectShowcase';
import FinishPhilosophy from '@/components/FinishPhilosophy';
import Specifications from '@/components/Specifications';
import CatalogGrid from '@/components/CatalogGrid';
import AtTheTable from '@/components/AtTheTable';
import AcquisitionSection from '@/components/AcquisitionSection';
import Footer from '@/components/Footer';
import PriorityAccessModal from '@/components/PriorityAccessModal';
import AcquisitionBagDrawer from '@/components/AcquisitionBagDrawer';
import RitualModal from '@/components/RitualModal';

export default function Home() {
  const { openCart, itemCount } = useCart();
  const { products, loading: productsLoading } = useCatalog();
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
        <div className="fixed top-20 right-6 z-50 bg-[#111111] text-[#f9f9f7] px-5 py-3 text-[11px] uppercase tracking-[0.18em] shadow-xl border border-[#c5a059] animate-fadeIn flex items-center space-x-2">
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
        productName={products[0]?.name}
      />

      {/* Hero Section */}
      <HeroSection
        products={products}
        loading={productsLoading}
        onReserveClick={() => setPriorityModalOpen(true)}
        onDiscoverClick={scrollToPlate}
      />

      {/* 01 / The Glint Plate Showcase */}
      <ObjectShowcase
        products={products}
        loading={productsLoading}
        onRequestPriorityAccess={() => setPriorityModalOpen(true)}
      />

      {/* 02 / The Finish & Philosophy */}
      <FinishPhilosophy products={products} loading={productsLoading} />

      {/* 03 / Specifications */}
      <Specifications products={products} loading={productsLoading} />

      {/* 04 / The Atelier Collection (Dynamic Multi-Object Catalog) */}
      <CatalogGrid products={products} loading={productsLoading} />

      {/* 05 / At The Table */}
      <AtTheTable
        products={products}
        loading={productsLoading}
        onSelectRitual={(ritual) => setSelectedRitual(ritual)}
      />

      {/* Acquisition & Allocation Waitlist */}
      <AcquisitionSection
        product={products[0]}
        onSuccessfulAllocation={handleSuccessfulAllocation}
      />

      {/* Atelier Footer */}
      <Footer />

      {/* Priority Access / Allocation Modal */}
      <PriorityAccessModal
        isOpen={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        onSuccess={handleSuccessfulAllocation}
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
        product={products[0]}
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
