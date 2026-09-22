'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Shield,
  Compass,
  Layers,
  Sparkles,
  ArrowUpRight,
  Share2,
} from 'lucide-react';
import { useProduct, useCatalog } from '@/lib/catalog';
import { useCart } from '@/hooks/useCart';
import { resolveImageUrl } from '@/lib/products';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || 'object-01';

  const { product, loading } = useProduct(productId);
  const { products: allProducts } = useCatalog();
  const { addItem, openCart, itemCount, items, maxPerProduct } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [prevProductId, setPrevProductId] = useState<string>(productId);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const inCartQty = items.find((i) => i.productId === product?.id)?.quantity || 0;
  const maxCap = maxPerProduct || 4;
  const maxAllowedToAdd = Math.max(0, maxCap - inCartQty);
  const isCapped = inCartQty >= maxCap;

  if (prevProductId !== productId) {
    setPrevProductId(productId);
    setActiveImageIndex(0);
    setQuantity(1);
  }

  const handleAddToCart = () => {
    if (!product || isCapped) return;
    const qtyToAdd = Math.min(quantity, maxAllowedToAdd);
    if (qtyToAdd <= 0) return;
    addItem(product, qtyToAdd, product.specifications);
    setAddedToast(true);
    setQuantity(1);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center text-[#111111]">
        <div className="text-xs uppercase tracking-[0.2em] text-[#595D5D] font-mono animate-pulse">
          Loading Technical Monograph...
        </div>
      </div>
    );
  }

  const rawImages = product.images || [];
  const images = rawImages.map((img) => resolveImageUrl(img, img)).filter(Boolean);
  if (images.length === 0) images.push('/images/fig-01-table.webp');

  const otherObjects = allProducts.filter((p) => p.id !== product.id);

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#111111] flex flex-col selection:bg-[#111111] selection:text-[#f9f9f7]">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#111111] text-[#f9f9f7] px-5 py-3 text-xs uppercase tracking-[0.18em] shadow-xl border border-[#c5a059] flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-[#c5a059]" />
          <span>Edition added to Acquisition Bag</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-[#e5e5e3] bg-[#ffffff] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.16em] text-[#595D5D] hover:text-[#111111] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>
            <div className="h-4 w-[1px] bg-[#e5e5e3]" />
            <Link href="/" className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.16em] uppercase font-light text-[#111111]">
              Maison Glint
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleShare}
              title="Share Monograph"
              aria-label="Share Monograph"
              className="p-2 border border-[#e5e5e3] hover:border-[#111111] text-[#595D5D] hover:text-[#111111] transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#c5a059]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={openCart}
              aria-label="View Acquisition Bag"
              className="py-2 px-4 border border-[#111111] bg-[#111111] text-[#f9f9f7] text-xs uppercase tracking-[0.2em] font-medium flex items-center space-x-2 hover:bg-[#2b2b2b] transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Bag ({itemCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Visual */}
            <div className="relative w-full aspect-[4/3] bg-[#eeeeec] border border-[#e5e5e3] overflow-hidden group">
              <Image
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                referrerPolicy="no-referrer"
                className="object-cover object-center transition-all duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#f9f9f7]/95 backdrop-blur-sm border border-[#e5e5e3] px-3 py-1.5 text-xs uppercase tracking-[0.2em] font-medium text-[#111111]">
                {product.editorial?.hero.slides[activeImageIndex]?.figureLabel || `Figure 0${activeImageIndex + 1}`}
              </div>
            </div>

            {/* Thumbnail Track */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View product image ${idx + 1}`}
                    className={`relative aspect-[4/3] border overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#111111] ring-1 ring-[#111111]'
                        : 'border-[#e5e5e3] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="20vw"
                      referrerPolicy="no-referrer"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Editorial Philosophy Note */}
            <div className="border border-[#e5e5e3] p-6 bg-[#f4f4f2]">
              <div className="text-xs uppercase tracking-[0.22em] text-[#595D5D] font-medium mb-2">
                Atelier Architectural Context
              </div>
              <p className="text-[13px] text-[#444748] font-light leading-relaxed">
                {product.editorial?.showcase.description || product.description}
              </p>
            </div>
          </div>

          {/* Right Column: Information, Pricing, Specs, Actions */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-2 flex items-center space-x-2">
                <span>Atelier Serial Monograph</span>
                {loading && <span className="w-1.5 h-1.5 bg-[#c5a059] animate-ping" />}
              </div>
              <h1 className="font-[family-name:var(--font-cormorant)] text-[36px] sm:text-[44px] font-light text-[#111111] leading-[1.1] mb-3">
                {product.name}
              </h1>
              <div className="font-mono text-[20px] text-[#111111] mb-4">
                ${product.price} {product.currency || 'USD'}
              </div>
              <p className="text-[14px] text-[#444748] font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Edition Allocation Card */}
            <div className="border border-[#e5e5e3] bg-[#ffffff] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em]">
                <span className="text-[#595D5D] font-medium">Edition Allocation</span>
                <span className="text-[#111111] font-mono font-medium">
                  {product.editionRemaining ?? 34} / {product.editionTotal ?? 250} Remaining
                </span>
              </div>
              <div className="w-full bg-[#eeeeec] h-1.5 overflow-hidden">
                <div
                  className="bg-[#c5a059] h-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(10, ((product.editionRemaining ?? 34) / (product.editionTotal ?? 250)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <div className="text-xs text-[#595D5D] font-light flex items-center justify-between pt-1">
                <span>{product.editorial?.showcase.statusLabel || 'Edition Status'}</span>
                <span className="text-[#111111]">{product.specifications?.origin || product.name}</span>
              </div>
            </div>

            {/* Acquisition Controls */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-[#d6d6d4] bg-[#ffffff]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isCapped || quantity <= 1}
                    aria-label="Decrease quantity"
                    className={`px-3 py-3 transition-colors ${
                      isCapped || quantity <= 1
                        ? 'opacity-30 cursor-not-allowed text-[#8c8c8c]'
                        : 'text-[#595D5D] hover:text-[#111111] cursor-pointer'
                    }`}
                  >
                    -
                  </button>
                  <span className="px-4 py-3 font-mono text-[13px]">
                    {isCapped ? inCartQty : Math.min(quantity, maxAllowedToAdd)}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxAllowedToAdd, quantity + 1))}
                    disabled={isCapped || quantity >= maxAllowedToAdd}
                    aria-label="Increase quantity"
                    className={`px-3 py-3 transition-colors ${
                      isCapped || quantity >= maxAllowedToAdd
                        ? 'opacity-30 cursor-not-allowed text-[#8c8c8c]'
                        : 'text-[#595D5D] hover:text-[#111111] cursor-pointer'
                    }`}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isCapped}
                  className={`flex-1 py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center space-x-2 ${
                    isCapped
                      ? 'bg-[#ecece9] border border-[#d6d6d4] text-[#8c8c8c] cursor-not-allowed'
                      : 'bg-[#111111] text-[#f9f9f7] hover:bg-[#2b2b2b] cursor-pointer'
                  }`}
                >
                  <ShoppingBag className={`w-4 h-4 ${isCapped ? 'text-[#8c8c8c]' : 'text-[#c5a059]'}`} />
                  <span>
                    {isCapped
                      ? `Allocation Limit Reached (${maxCap} In Bag)`
                      : `Acquire Edition · $${(product.price * Math.min(quantity, maxAllowedToAdd)).toLocaleString()}`}
                  </span>
                </button>
              </div>

              {isCapped ? (
                <p className="text-xs text-[#595D5D] italic font-light">
                  Atelier allocation policy: Maximum {maxCap} exemplars allowed per edition per patron.
                </p>
              ) : inCartQty > 0 ? (
                <p className="text-xs text-[#595D5D] font-light">
                  Currently {inCartQty} exemplar{inCartQty > 1 ? 's' : ''} in your acquisition drawer (maximum {maxCap}).
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.16em] text-[#595D5D] pt-2">
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Complimentary Courier</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Insured Global Transit</span>
                </div>
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div className="border-t border-[#e5e5e3] pt-6 space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111]">
                Technical Specifications
              </div>
              <div className="border border-[#e5e5e3] divide-y divide-[#e5e5e3] bg-[#ffffff] text-xs">
                {product.specifications?.gauge && (
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-[#595D5D] font-light">Core Alloy / Gauge</span>
                    <span className="col-span-2 text-[#111111] font-medium">{product.specifications.gauge}</span>
                  </div>
                )}
                {product.specifications?.diameter && (
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-[#595D5D] font-light">Dimensions</span>
                    <span className="col-span-2 text-[#111111] font-medium">{product.specifications.diameter}</span>
                  </div>
                )}
                {product.specifications?.finish && (
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-[#595D5D] font-light">Surface Treatment</span>
                    <span className="col-span-2 text-[#111111] font-medium">{product.specifications.finish}</span>
                  </div>
                )}
                {product.specifications?.weight && (
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-[#595D5D] font-light">Net Weight</span>
                    <span className="col-span-2 text-[#111111] font-medium">{product.specifications.weight}</span>
                  </div>
                )}
                {product.specifications?.origin && (
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-[#595D5D] font-light">Atelier Origin</span>
                    <span className="col-span-2 text-[#111111] font-medium">{product.specifications.origin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Other Atelier Objects in Catalog */}
        {otherObjects.length > 0 && (
          <section className="mt-20 pt-16 border-t border-[#e5e5e3]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#595D5D] font-medium mb-1">
                  Atelier Roster
                </div>
                <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl font-light text-[#111111]">
                  Parallel Objects in the Collection
                </h2>
              </div>
              <Link
                href="/"
                className="text-xs uppercase tracking-[0.18em] text-[#111111] hover:text-[#c5a059] flex items-center space-x-1"
              >
                <span>View All Objects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherObjects.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group bg-[#ffffff] border border-[#e5e5e3] hover:border-[#111111] p-5 transition-all flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-[4/3] bg-[#eeeeec] mb-4 overflow-hidden">
                    <Image
                      src={resolveImageUrl(item.images?.[0] || images[0])}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      referrerPolicy="no-referrer"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#c5a059] font-medium mb-1">
                      {item.id.replace(/-/g, ' ').toUpperCase()}
                    </div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#111111] mb-2 group-hover:text-[#c5a059] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#595D5D] font-light line-clamp-2 mb-4">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#f0f0ee] text-xs font-mono">
                    <span>${item.price} {item.currency}</span>
                    <span
                      aria-label={`View ${item.name} Monograph`}
                      className="text-xs uppercase tracking-[0.16em] text-[#595D5D] group-hover:text-[#111111] flex items-center space-x-1"
                    >
                      <span>Monograph</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Atelier Footer */}
      <footer className="border-t border-[#e5e5e3] bg-[#ffffff] py-8 text-center text-xs uppercase tracking-[0.2em] text-[#595D5D]">
        Maison Glint · {product.specifications?.origin || product.name}
      </footer>
    </div>
  );
}
