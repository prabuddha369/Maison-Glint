'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Package,
  MapPin,
  LogOut,
  ArrowRight,
  Clock,
  CheckCircle,
  Plus,
  ShieldCheck,
  Bookmark,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getOrdersByUser } from '../../lib/payment';
import { getReservationsByUser } from '../../lib/reservations';
import { INITIAL_PRODUCTS } from '../../lib/products';
import AuthModal from '../../components/AuthModal';
import type { Order, ShippingAddress, Reservation } from '../../types/store';

export default function AccountPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { user, profile, loading, signOutAccount, saveAddress } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [reservationsLoading, setReservationsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orders' | 'allocations' | 'addresses'>('orders');
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  const handleAcquireReserved = (productId: string) => {
    const matchedProduct = INITIAL_PRODUCTS.find((p) => p.id === productId) || INITIAL_PRODUCTS[0];
    addItem(matchedProduct, 1);
    router.push('/checkout');
  };

  const handleCopySerial = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSerial(code);
    setTimeout(() => setCopiedSerial(null), 2000);
  };

  // Address form modal/state
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
  });

  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setOrders([]);
        setReservations([]);
        setOrdersLoading(false);
        setReservationsLoading(false);
        return;
      }

      setOrdersLoading(true);
      setReservationsLoading(true);
      try {
        const [orderList, resList] = await Promise.all([
          getOrdersByUser(user.uid, user.email || undefined),
          getReservationsByUser(user.uid, user.email || undefined),
        ]);
        setOrders(orderList);
        setReservations(resList);
      } catch (err) {
        console.error('Failed to load user records:', err);
      } finally {
        setOrdersLoading(false);
        setReservationsLoading(false);
      }
    }

    if (!loading) {
      loadUserData();
    }
  }, [user, loading]);

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city) return;
    await saveAddress(newAddress);
    setIsAddingAddress(false);
    setNewAddress({
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
    });
  };

  const handleConfirmationPending = (email: string) => {
    setConfirmationNotice(`Confirmation email sent to ${email}. Check your inbox, click Verify Client Profile, then sign in.`);
    window.setTimeout(() => setConfirmationNotice(''), 10000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center p-6 text-center">
        <div className="font-[family-name:var(--font-cormorant)] text-2xl text-[#111111] animate-pulse">
          Accessing Maison Glint Collector Records...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] text-[#111111] flex flex-col justify-between">
        <header className="border-b border-[#e5e5e3] bg-[#ffffff]">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.18em] uppercase text-[#111111] font-light">
              Maison Glint
            </Link>
          </div>
        </header>

        <main className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="bg-[#ffffff] border border-[#e5e5e3] p-10 shadow-sm">
            <div className="w-12 h-12 border border-[#111111] mx-auto mb-4 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-[#111111]" />
            </div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#111111] mb-2">
              Collector Portal
            </h1>
            <p className="text-[12px] text-[#747878] font-light leading-relaxed mb-6">
              Authenticate your identity to inspect active serial reservations, previous acquisition invoices, and designated transit coordinates.
            </p>
            {confirmationNotice && (
              <div className="mb-4 p-3 bg-[#f0f9f0] border border-[#cceccc] text-[#166534] text-[11px] leading-relaxed text-left">
                {confirmationNotice}
              </div>
            )}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-3.5 bg-[#111111] text-[#f9f9f7] hover:bg-[#2b2b2b] text-[10px] uppercase tracking-[0.2em] font-medium transition-colors"
            >
              Sign In / Register
            </button>
          </div>
        </main>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onConfirmationPending={handleConfirmationPending}
        />
        <footer className="border-t border-[#e5e5e3] py-6 text-center text-[10px] uppercase tracking-[0.16em] text-[#8c8c8c]">
          Maison Glint Atelier · Private Collector Vault
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#111111]">
      {/* Header */}
      <header className="border-b border-[#e5e5e3] bg-[#ffffff] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.18em] uppercase text-[#111111] font-light">
            Maison Glint
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-[10px] uppercase tracking-[0.16em] text-[#747878] hover:text-[#111111] transition-colors"
            >
              Storefront
            </Link>
            <button
              onClick={signOutAccount}
              className="text-[10px] uppercase tracking-[0.16em] text-[#8c8c8c] hover:text-[#b91c1c] transition-colors flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Card */}
        <div className="bg-[#ffffff] border border-[#e5e5e3] p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#747878]">
              Authenticated Collector
            </span>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl font-light text-[#111111] mt-1">
              {profile?.displayName || user.displayName || 'Atelier Patron'}
            </h1>
            <p className="text-[12px] text-[#747878] mt-1 font-mono">
              {user.email} · ID: {user.uid.slice(0, 12)}...
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#e5e5e3] mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-6 text-[11px] uppercase tracking-[0.18em] font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#747878] hover:text-[#111111]'
            }`}
          >
            Acquisition History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`pb-4 px-6 text-[11px] uppercase tracking-[0.18em] font-medium border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'allocations'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#747878] hover:text-[#111111]'
            }`}
          >
            <span>Priority Allocations ({reservations.length})</span>
            {reservations.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-4 px-6 text-[11px] uppercase tracking-[0.18em] font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#747878] hover:text-[#111111]'
            }`}
          >
            Saved Coordinates ({profile?.savedAddresses?.length || 0})
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div className="p-12 text-center text-[#747878] text-[12px]">
                Querying secure order records...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-[#ffffff] border border-[#e5e5e3] p-12 text-center">
                <Package className="w-8 h-8 text-[#8c8c8c] mx-auto mb-3" />
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[#111111] mb-2">
                  No Acquisitions Recorded Yet
                </h3>
                <p className="text-[12px] text-[#747878] font-light max-w-sm mx-auto mb-6">
                  Objects acquired through the storefront will display here with live telemetry and invoice data.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b]"
                >
                  Explore Current Editions
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="bg-[#ffffff] border border-[#e5e5e3] p-6 sm:p-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f0ee] pb-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm font-semibold text-[#111111]">
                            {order.orderId}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] font-semibold border ${
                              order.status === 'pending_payment'
                                ? 'bg-[#fff8e7] border-[#e8d5aa] text-[#8a681c]'
                                : order.status === 'paid' || order.status === 'processing'
                                ? 'bg-[#eef8ee] border-[#bfe4bf] text-[#1c731c]'
                                : 'bg-[#f0f0ee] border-[#d6d6d4] text-[#747878]'
                            }`}
                          >
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#747878] mt-1 block font-light">
                          Created {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#111111]">
                          ${order.total.toLocaleString()} USD
                        </span>
                        <Link
                          href={`/order-success/${order.orderId}`}
                          className="px-3.5 py-1.5 border border-[#d6d6d4] hover:border-[#111111] text-[10px] uppercase tracking-[0.15em] font-medium text-[#111111] transition-colors"
                        >
                          Inspect Receipt
                        </Link>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-[12px] py-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#747878]">[{item.quantity}x]</span>
                            <span className="font-medium text-[#111111]">{item.name}</span>
                          </div>
                          <span className="font-mono text-[#747878]">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#f0f0ee] text-[11px] text-[#747878] flex flex-wrap justify-between gap-2">
                      <span>Delivery: {order.shippingAddress.line1}, {order.shippingAddress.city}</span>
                      <span>Transit Tier: {order.shippingMethod?.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Priority Allocations */}
        {activeTab === 'allocations' && (
          <div>
            {reservationsLoading ? (
              <div className="p-12 text-center text-[#747878] text-[12px]">
                Querying priority allocation records...
              </div>
            ) : reservations.length === 0 ? (
              <div className="bg-[#ffffff] border border-[#e5e5e3] p-12 text-center">
                <Bookmark className="w-8 h-8 text-[#8c8c8c] mx-auto mb-3" />
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[#111111] mb-2">
                  No Priority Allocations Registered
                </h3>
                <p className="text-[12px] text-[#747878] font-light max-w-sm mx-auto mb-6">
                  Serialized priority reservations requested through the collection catalogue will display here with their archive credentials.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b]"
                >
                  Explore Current Editions
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {reservations.map((res) => {
                  const isExpired =
                    res.status === 'deallocated' ||
                    (res.expiresAt ? new Date(res.expiresAt).getTime() < Date.now() : false);
                  const isConverted = res.status === 'converted_to_order';

                  return (
                    <div
                      key={res.id}
                      className={`bg-[#ffffff] border p-6 sm:p-8 relative overflow-hidden transition-all ${
                        isExpired
                          ? 'border-[#e5e5e3] opacity-80'
                          : isConverted
                          ? 'border-[#cbe3d3]'
                          : 'border-[#e2d5bc] shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f0ee] pb-4 mb-4">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-sm font-semibold tracking-wider text-[#111111]">
                              {res.serialNumber}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 text-[9px] uppercase tracking-[0.16em] font-semibold border ${
                                isConverted
                                  ? 'bg-[#f0f7f2] border-[#cbe3d3] text-[#1b6e3b]'
                                  : isExpired
                                  ? 'bg-[#f4f4f2] border-[#d6d6d4] text-[#8c8c8c]'
                                  : res.status === 'allocated'
                                  ? 'bg-[#f7f5ef] border-[#e2d5bc] text-[#8a681c]'
                                  : res.status === 'waitlist'
                                  ? 'bg-[#f4f4f2] border-[#d6d6d4] text-[#747878]'
                                  : 'bg-[#fff8e7] border-[#e8d5aa] text-[#8a681c]'
                              }`}
                            >
                              {isConverted
                                ? 'Acquired Edition'
                                : isExpired
                                ? 'Deallocated'
                                : res.status === 'allocated'
                                ? 'Allocated Slot'
                                : res.status === 'waitlist'
                                ? 'Priority Waitlist'
                                : res.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#747878] mt-1 block font-light">
                            Registered in Zurich Archive ·{' '}
                            {new Date(res.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleCopySerial(res.serialNumber)}
                            className="px-3 py-1.5 border border-[#d6d6d4] hover:border-[#111111] text-[10px] uppercase tracking-[0.15em] font-medium text-[#111111] transition-colors flex items-center space-x-1.5 cursor-pointer"
                          >
                            {copiedSerial === res.serialNumber ? (
                              <>
                                <Check className="w-3 h-3 text-green-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#747878]" />
                                <span>Copy Ref</span>
                              </>
                            )}
                          </button>

                          {res.status === 'allocated' && !isExpired && (
                            <button
                              onClick={() => handleAcquireReserved(res.productId)}
                              className="px-3.5 py-1.5 bg-[#111111] hover:bg-[#2b2b2b] text-[10px] uppercase tracking-[0.15em] font-medium text-[#f9f9f7] transition-colors flex items-center space-x-1.5 cursor-pointer"
                            >
                              <span>Acquire Reserved Piece</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <Link
                            href="/"
                            className="px-3 py-1.5 border border-[#e5e5e3] hover:border-[#111111] text-[10px] uppercase tracking-[0.15em] font-medium text-[#747878] hover:text-[#111111] transition-colors"
                          >
                            View Object
                          </Link>
                        </div>
                      </div>

                      {/* Reservation Specs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px] py-2">
                        <div>
                          <span className="block text-[9px] uppercase tracking-[0.18em] text-[#747878] mb-1">
                            Reserved Object
                          </span>
                          <span className="font-medium text-[#111111]">
                            {res.productId.includes('02')
                              ? 'Object 02 — Fluid Coupe Pair'
                              : res.productId.includes('03')
                              ? 'Object 03 — Monolith Serving Knife'
                              : 'Object 01 — The Glint Plate'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-[0.18em] text-[#747878] mb-1">
                            Application Ritual
                          </span>
                          <span className="text-[#444748]">{res.ritual}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-[0.18em] text-[#747878] mb-1">
                            Destination
                          </span>
                          <span className="text-[#444748]">{res.destination}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#f0f0ee] text-[11px] text-[#747878] flex flex-wrap justify-between items-center gap-2">
                        <span>Concierge Reference: MG-ALLOC-{res.serialIndex}</span>
                        {isConverted ? (
                          <span className="text-[#1b6e3b] font-medium flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-[#1b6e3b]" />
                            <span>Acquisition Completed · Exemplar Archived</span>
                          </span>
                        ) : isExpired ? (
                          <span className="text-[#8c8c8c] font-medium flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#8c8c8c]" />
                            <span>48H Window Expired · Allocation Deallocated to Open Catalog</span>
                          </span>
                        ) : (
                          <span className="text-[#8a681c] font-medium flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#8a681c]" />
                            <span>
                              Active Hold · Valid until{' '}
                              {new Date(res.expiresAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Addresses */}
        {activeTab === 'addresses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#111111]">
                Designated Coordinates
              </h2>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="px-4 py-2 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.18em] font-medium flex items-center space-x-2 hover:bg-[#2b2b2b]"
              >
                <Plus className="w-3 h-3" />
                <span>Add Coordinate</span>
              </button>
            </div>

            {isAddingAddress && (
              <form
                onSubmit={handleSaveNewAddress}
                className="bg-[#ffffff] border border-[#e5e5e3] p-6 sm:p-8 mb-8 space-y-4"
              >
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#111111] mb-2">
                  New Delivery Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full bg-[#f9f9f7] px-3.5 py-2.5 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      className="w-full bg-[#f9f9f7] px-3.5 py-2.5 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full bg-[#f9f9f7] px-3.5 py-2.5 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Postal Code / ZIP
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full bg-[#f9f9f7] px-3.5 py-2.5 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="w-full bg-[#f9f9f7] px-3.5 py-2.5 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full bg-[#f9f9f7] px-3.5 py-2.5 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.18em] font-medium"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-6 py-2.5 border border-[#d6d6d4] text-[10px] uppercase tracking-[0.18em] font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile?.savedAddresses && profile.savedAddresses.length > 0 ? (
                profile.savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="bg-[#ffffff] border border-[#e5e5e3] p-6 space-y-2 text-[12px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#111111]">{addr.fullName}</span>
                      <span className="text-[9px] uppercase tracking-[0.14em] text-[#c5a059] font-medium">
                        Saved
                      </span>
                    </div>
                    <div className="text-[#444748]">{addr.line1}</div>
                    {addr.line2 && <div className="text-[#444748]">{addr.line2}</div>}
                    <div className="text-[#444748]">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </div>
                    <div className="text-[#444748] font-medium">{addr.country}</div>
                    <div className="pt-2 text-[#747878] font-mono">{addr.phone}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-[#ffffff] border border-[#e5e5e3] p-8 text-center text-[#747878] text-[12px]">
                  No saved destinations yet. Addresses saved during checkout or above will appear here.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
