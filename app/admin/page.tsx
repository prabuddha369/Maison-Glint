'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Mail,
  KeyRound,
  Package,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Truck,
  DollarSign,
  Layers,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_PRODUCTS, getProducts, saveProduct, deleteProduct, seedDefaultProducts } from '../../lib/products';
import { getAllOrders, updateOrderStatus } from '../../lib/payment';
import type { Product, Order, OrderStatus } from '../../types/store';

export default function AdminPage() {
  const { user, isAdmin, signInWithEmail, signOutAccount } = useAuth();
  const [authError, setAuthError] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>('');

  // Editing product modal / state
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 450,
    currency: 'USD',
    images: ['/images/fig-01-table.png'],
    specifications: {
      gauge: '18-Gauge Surgical 316L Core',
      diameter: '280 mm',
      finish: 'Mirror Chrome',
    },
    inStock: true,
    editionTotal: 200,
    editionRemaining: 50,
    editorial: INITIAL_PRODUCTS[0].editorial,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodList, orderList] = await Promise.all([getProducts(), getAllOrders()]);
      setProducts(prodList);
      setOrders(orderList);
    } catch (e) {
      console.error('Admin data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (isAdmin) {
      Promise.all([getProducts(), getAllOrders()])
        .then(([prodList, orderList]) => {
          if (active) {
            setProducts(prodList);
            setOrders(orderList);
            setLoading(false);
          }
        })
        .catch((e) => {
          if (active) {
            console.error('Admin data load error:', e);
            setLoading(false);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    const idToUse = productForm.id || `object-${Date.now().toString().slice(-4)}`;
    const productToSave: Product = {
      ...productForm,
      id: idToUse,
    };

    await saveProduct(productToSave);
    setIsEditingProduct(false);
    setFeedback(`Product "${productToSave.name}" successfully registered in catalog.`);
    await loadData();
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleAdminSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSigningIn(true);
    setAuthError('');
    try {
      await signInWithEmail(adminEmail.trim(), adminPassword);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to retire this edition from the storefront catalog?')) return;
    await deleteProduct(productId);
    setFeedback(`Product "${productId}" removed.`);
    await loadData();
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    setFeedback(`Order ${orderId} updated to status "${status}".`);
    await loadData();
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleSeedCatalog = async () => {
    setLoading(true);
    await seedDefaultProducts();
    await loadData();
    setFeedback('Initial atelier catalog re-seeded to Supabase.');
    setTimeout(() => setFeedback(''), 4000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center p-6 text-[#111111]">
        <div className="w-full max-w-md bg-[#ffffff] border border-[#e5e5e3] p-8 shadow-sm text-center">
          <div className="w-12 h-12 border border-[#111111] mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#111111]" />
          </div>

          <span className="text-[9px] uppercase tracking-[0.26em] text-[#c5a059] font-medium block">
            Atelier Security Gate
          </span>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mt-1 mb-2 text-[#111111]">
            Management Console
          </h1>
          <p className="text-[12px] text-[#747878] font-light leading-relaxed mb-6">
            Strict role-based access. Access is restricted exclusively to verified administrator accounts
            registered in the Atelier ledger.
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-[#fff0f0] border border-[#ffcccc] text-[#b91c1c] text-[11px] text-left">
              {authError}
            </div>
          )}

          {user ? (
            <div className="space-y-4 text-left border border-[#e5e5e3] p-4 bg-[#f9f9f7] mb-6">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#747878] font-medium">
                Active Session
              </div>
              <div className="font-mono text-[12px] text-[#111111] break-all">
                {user.email}
              </div>
              <div className="text-[11px] text-[#b91c1c] flex items-center space-x-1.5 pt-1">
                <span>✕ Account not verified for administrative elevation</span>
              </div>
              <p className="text-[11px] text-[#747878] leading-relaxed pt-1">
                Authorized administrator emails: <br />
                <span className="font-mono text-[10px] text-[#111111]">chatterjee.prabuddha.work@gmail.com</span>,{' '}
                <span className="font-mono text-[10px] text-[#111111]">founder@maisonglint.com</span>
              </p>

              <button
                type="button"
                onClick={() => signOutAccount()}
                className="w-full py-2.5 mt-2 border border-[#111111] text-[10px] uppercase tracking-[0.18em] text-[#111111] hover:bg-[#111111] hover:text-[#f9f9f7] transition-colors"
              >
                Sign Out & Switch Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminSignIn} className="space-y-4 mb-6 text-left">
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] font-medium">
                Administrator Email
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8c8c8c]" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    required
                    autoComplete="username"
                    className="w-full py-2.5 pl-10 pr-3 border border-[#d6d6d4] bg-[#ffffff] text-[12px] text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>
              </label>

              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] font-medium">
                Administrator Password
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-[#8c8c8c]" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    className="w-full py-2.5 pl-10 pr-3 border border-[#d6d6d4] bg-[#ffffff] text-[12px] text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full py-3.5 bg-[#111111] text-[#f9f9f7] hover:bg-[#2b2b2b] text-[10px] uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isSigningIn ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#c5a059]" />
                )}
                <span>{isSigningIn ? 'Verifying...' : 'Sign In as Administrator'}</span>
              </button>
              <p className="text-[10px] text-[#747878] leading-relaxed">
                Uses secure server email/password authentication with an HttpOnly session.
              </p>
            </form>
          )}

          <div className="pt-2 border-t border-[#e5e5e3]">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.16em] text-[#747878] hover:text-[#111111] transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Return to Maison Glint Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#111111]">
      {/* Top Header */}
      <header className="border-b border-[#e5e5e3] bg-[#ffffff] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-[#8c8c8c] hover:text-[#111111]">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.16em] uppercase text-[#111111] font-light">
                Maison Glint
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#c5a059] ml-3 font-mono font-medium">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSeedCatalog}
              title="Re-seed initial catalog items to Supabase"
              className="px-3 py-1.5 border border-[#d6d6d4] hover:border-[#111111] text-[10px] uppercase tracking-[0.14em] text-[#747878] hover:text-[#111111] flex items-center space-x-1.5"
            >
              <Database className="w-3 h-3 text-[#c5a059]" />
              <span>Seed Catalog</span>
            </button>
            <button
              onClick={loadData}
              title="Refresh records"
              className="p-2 border border-[#d6d6d4] hover:border-[#111111] text-[#111111]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {feedback && (
          <div className="mb-6 p-4 bg-[#f0f9f0] border border-[#cceccc] text-[#15803d] text-[12px] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#ffffff] border border-[#e5e5e3] p-5">
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#747878] block">
              Total Orders Captured
            </span>
            <span className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#111111]">
              {orders.length}
            </span>
          </div>

          <div className="bg-[#ffffff] border border-[#e5e5e3] p-5">
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#747878] block">
              Pending Gateway Handoff
            </span>
            <span className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#c5a059]">
              {orders.filter((o) => o.status === 'pending_payment').length}
            </span>
          </div>

          <div className="bg-[#ffffff] border border-[#e5e5e3] p-5">
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#747878] block">
              Catalog Editions
            </span>
            <span className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#111111]">
              {products.length}
            </span>
          </div>

          <div className="bg-[#ffffff] border border-[#e5e5e3] p-5">
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#747878] block">
              Gross Order Value
            </span>
            <span className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#111111]">
              ${orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#e5e5e3] mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-6 text-[11px] uppercase tracking-[0.18em] font-medium border-b-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#747878] hover:text-[#111111]'
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-6 text-[11px] uppercase tracking-[0.18em] font-medium border-b-2 cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#747878] hover:text-[#111111]'
            }`}
          >
            Product Catalog ({products.length})
          </button>
        </div>

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#ffffff] border border-[#e5e5e3] p-12 text-center text-[#747878] text-[12px]">
                No orders captured yet. Test placing an order through the storefront checkout!
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-[#ffffff] border border-[#e5e5e3] p-6 sm:p-8"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#f0f0ee] pb-4 mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-base font-bold text-[#111111]">
                          {order.orderId}
                        </span>
                        <span className="text-[11px] text-[#747878]">
                          {order.customer.email} · {order.customer.fullName}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8c8c8c] mt-1 block">
                        Captured: {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#111111]">
                        ${order.total.toLocaleString()} USD
                      </span>

                      {/* Status Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.orderId, e.target.value as OrderStatus)
                        }
                        className="text-[11px] uppercase tracking-[0.1em] font-medium px-3 py-1.5 border border-[#d6d6d4] bg-[#f9f9f7]"
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[12px]">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#747878] block mb-2 font-medium">
                        Items Purchased ({order.items.length})
                      </span>
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[#444748]">
                            <span>
                              [{item.quantity}x] {item.name}
                            </span>
                            <span className="font-mono font-medium text-[#111111]">
                              ${(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#747878] block mb-2 font-medium">
                        Shipping Destination
                      </span>
                      <div className="text-[#444748] space-y-0.5">
                        <div className="font-medium text-[#111111]">
                          {order.shippingAddress.fullName}
                        </div>
                        <div>
                          {order.shippingAddress.line1}
                          {order.shippingAddress.line2 && ` · ${order.shippingAddress.line2}`}
                        </div>
                        <div>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                          {order.shippingAddress.postalCode}
                        </div>
                        <div>{order.shippingAddress.country}</div>
                        <div className="text-[#8c8c8c] pt-1">{order.shippingAddress.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Products Catalog */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#111111]">
                Catalog Objects
              </h2>
              <button
                onClick={() => {
                  setProductForm({
                    id: '',
                    name: '',
                    description: '',
                    price: 550,
                    currency: 'USD',
                    images: ['/images/fig-01-table.png'],
                    specifications: { gauge: '18-Gauge Surgical 316L Core' },
                    inStock: true,
                    editionTotal: 100,
                    editionRemaining: 25,
                    editorial: INITIAL_PRODUCTS[0].editorial,
                  });
                  setIsEditingProduct(true);
                }}
                className="px-4 py-2.5 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.18em] font-medium flex items-center space-x-2 hover:bg-[#2b2b2b]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Object</span>
              </button>
            </div>

            {/* Product Edit / Create Modal Form */}
            {isEditingProduct && (
              <form
                onSubmit={handleSaveProduct}
                className="bg-[#ffffff] border border-[#111111] p-6 sm:p-8 mb-8 space-y-4 shadow-lg"
              >
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[#111111] mb-2">
                  {productForm.id ? 'Edit Object Details' : 'Register New Atelier Object'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Object Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g., Object 05 — The Torsion Bowl"
                      className="w-full bg-[#f9f9f7] px-3 py-2 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#f9f9f7] px-3 py-2 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Architectural Description
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({ ...productForm, description: e.target.value })
                      }
                      placeholder="Design philosophy and material properties..."
                      className="w-full bg-[#f9f9f7] px-3 py-2 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Image URLs (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.images.join('\n')}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          images: e.target.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
                        })
                      }
                      placeholder="https://cdn.example.com/object-01-main.jpg"
                      className="w-full bg-[#f9f9f7] px-3 py-2 text-[12px] border border-[#d6d6d4] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Section Content JSON
                    </label>
                    <textarea
                      rows={8}
                      value={JSON.stringify(productForm.editorial || INITIAL_PRODUCTS[0].editorial, null, 2)}
                      onChange={(e) => {
                        try {
                          const editorial = JSON.parse(e.target.value);
                          setProductForm({ ...productForm, editorial });
                        } catch {
                          // Keep the last valid structured value while the JSON is being edited.
                        }
                      }}
                      className="w-full bg-[#f9f9f7] px-3 py-2 text-[11px] border border-[#d6d6d4] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Material Specification
                    </label>
                    <input
                      type="text"
                      value={productForm.specifications?.gauge || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          specifications: {
                            ...productForm.specifications,
                            gauge: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., 18-Gauge Surgical 316L Core"
                      className="w-full bg-[#f9f9f7] px-3 py-2 text-[12px] border border-[#d6d6d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#747878] mb-1">
                      Stock Status
                    </label>
                    <div className="flex items-center space-x-4 pt-2">
                      <label className="flex items-center space-x-2 text-[12px]">
                        <input
                          type="checkbox"
                          checked={productForm.inStock}
                          onChange={(e) =>
                            setProductForm({ ...productForm, inStock: e.target.checked })
                          }
                          className="accent-[#111111]"
                        />
                        <span>In Stock / Available for Acquisition</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#111111] text-[#f9f9f7] text-[10px] uppercase tracking-[0.18em] font-medium hover:bg-[#2b2b2b]"
                  >
                    Save to Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="px-6 py-2.5 border border-[#d6d6d4] text-[10px] uppercase tracking-[0.18em] font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#ffffff] border border-[#e5e5e3] p-6 flex gap-4 items-start"
                >
                  <div className="relative w-24 h-24 bg-[#ecece9] border border-[#e5e5e3] shrink-0">
                    <Image
                      src={p.images[0] || '/images/fig-01-table.png'}
                      alt={p.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#111111] leading-tight truncate">
                        {p.name}
                      </h3>
                      <span className="font-[family-name:var(--font-cormorant)] text-lg font-bold text-[#111111]">
                        ${p.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#747878] line-clamp-2 mt-1 font-light">
                      {p.description}
                    </p>

                    <div className="flex items-center space-x-2 mt-3 text-[10px] uppercase tracking-[0.14em]">
                      <span
                        className={`px-2 py-0.5 border ${
                          p.inStock
                            ? 'bg-[#eef8ee] border-[#bfe4bf] text-[#1c731c]'
                            : 'bg-[#fff0f0] border-[#ffcccc] text-[#b91c1c]'
                        }`}
                      >
                        {p.inStock ? 'In Stock' : 'Archived'}
                      </span>
                    </div>

                    <div className="flex space-x-3 mt-4 pt-3 border-t border-[#f0f0ee]">
                      <button
                        onClick={() => {
                          setProductForm(p);
                          setIsEditingProduct(true);
                        }}
                        className="text-[10px] uppercase tracking-[0.14em] text-[#111111] hover:text-[#c5a059] flex items-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-[10px] uppercase tracking-[0.14em] text-[#8c8c8c] hover:text-[#b91c1c] flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Retire</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
