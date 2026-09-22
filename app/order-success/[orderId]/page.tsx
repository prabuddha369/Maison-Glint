'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  MapPin,
  Mail,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
} from 'lucide-react';
import { getOrderById, updateLocalOrder } from '../../../lib/payment';
import { resolveImageUrl } from '../../../lib/products';
import type { Order } from '../../../types/store';

export default function OrderSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.orderId as string;

  const paymentConfirmed = searchParams?.get('payment') === 'confirmed';
  const paymentMethod = searchParams?.get('method')
    ? decodeURIComponent(searchParams.get('method')!)
    : null;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        if (paymentConfirmed) {
          updateLocalOrder(orderId, {
            status: 'paid',
            cashfreePaymentMethod: paymentMethod || undefined,
            paidAt: new Date().toISOString(),
          });
        }
        const found = await getOrderById(orderId);
        setOrder(found);
      } catch (e) {
        console.error('Failed to load order', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, paymentConfirmed, paymentMethod]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center p-6 text-center">
        <div className="font-[family-name:var(--font-cormorant)] text-2xl text-[#111111] animate-pulse">
          Retrieving Atelier Vault Order Manifest...
        </div>
      </div>
    );
  }

  const isPaid = paymentConfirmed || order?.status === 'paid';

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#111111]">
      {/* Navigation Bar */}
      <header className="border-b border-[#e5e5e3] bg-[#ffffff]">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.18em] uppercase text-[#111111] font-light">
            Maison Glint
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/account"
              className="text-xs uppercase tracking-[0.16em] text-[#595D5D] hover:text-[#111111] transition-colors"
            >
              Collector Account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Order Confirmation Block */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {/* Banner */}
        <div className="bg-[#ffffff] border border-[#e5e5e3] p-8 sm:p-12 mb-8 shadow-sm">
          <div className="flex items-start space-x-4 sm:space-x-6">
            <div className={`w-12 h-12 border flex items-center justify-center shrink-0 ${isPaid ? 'bg-[#111111] border-[#d4af37]' : 'bg-[#111111] border-[#111111]'}`}>
              {isPaid ? (
                <BadgeCheck className="w-6 h-6 text-[#d4af37]" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#c5a059]" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs uppercase tracking-[0.24em] font-semibold text-[#595D5D]">
                  {isPaid ? 'Payment Confirmed' : 'Order Registered'}
                </span>
                {isPaid ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#f0fff4] border border-[#a3e4b0] text-[#1a6b2e] text-xs uppercase tracking-[0.15em] font-medium">
                    <CheckCircle2 className="w-3 h-3 text-[#2e7d32]" />
                    <span>Acquisition Secured</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#fff8e7] border border-[#e8d5aa] text-[#8a681c] text-xs uppercase tracking-[0.15em] font-medium">
                    <Clock className="w-3 h-3 text-[#c5a059]" />
                    <span>Pending Gateway Settlement</span>
                  </span>
                )}
              </div>

              <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl font-light text-[#111111]">
                Acquisition Confirmed: {order?.orderId || orderId}
              </h1>

              <p className="text-[13px] text-[#595D5D] font-light mt-3 leading-relaxed">
                {isPaid
                  ? 'Your payment has been confirmed. Your bespoke allocation is formally registered in the Maison Glint atelier ledger and enters the production queue.'
                  : 'Your bespoke allocation has been registered in the Maison Glint ledger. All units are currently allocated to your reservation docket.'}
              </p>
            </div>
          </div>

          {/* Payment Gateway Info */}
          <div className="mt-8 pt-8 border-t border-[#e5e5e3] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="uppercase tracking-[0.16em] text-[#595D5D] block mb-1">
                Order Reference
              </span>
              <span className="font-mono text-base font-semibold text-[#111111]">
                {order?.orderId || orderId}
              </span>
            </div>

            <div>
              <span className="uppercase tracking-[0.16em] text-[#595D5D] block mb-1">
                Settlement Status
              </span>
              <span className="font-medium text-[#111111] flex items-center space-x-1.5">
                {isPaid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                    <span>Payment Confirmed</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Pending Gateway Callback</span>
                  </>
                )}
              </span>
              {paymentMethod && isPaid && (
                <span className="block text-xs text-[#595D5D] mt-1">via {paymentMethod}</span>
              )}
            </div>

            <div>
              <span className="uppercase tracking-[0.16em] text-[#595D5D] block mb-1">
                Dispatch Target
              </span>
              <span className="font-medium text-[#111111]">
                {order?.shippingMethod?.estimatedDelivery || '8–12 Business Days'}
              </span>
            </div>
          </div>

          {/* Cashfree Payment ID (if available) */}
          {order?.cashfreePaymentId && (
            <div className="mt-4 pt-4 border-t border-[#f0f0ee]">
              <p className="text-xs font-mono text-[#595D5D] tracking-wider">
                Payment Ref: {order.cashfreePaymentId}
              </p>
            </div>
          )}
        </div>

        {/* Order Details & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Items */}
          <div className="md:col-span-7 bg-[#ffffff] border border-[#e5e5e3] p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#111111] mb-6 flex items-center justify-between border-b border-[#f0f0ee] pb-3">
              <span>Secured Items</span>
              <span className="text-xs uppercase tracking-[0.15em] text-[#595D5D] font-sans">
                {order?.items?.length || 0} Object(s)
              </span>
            </h2>

            <div className="divide-y divide-[#f0f0ee]">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 bg-[#ecece9] border border-[#e5e5e3] shrink-0">
                    <Image
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-[family-name:var(--font-cormorant)] text-lg font-medium text-[#111111] truncate">
                      {item.name}
                    </h3>
                    {item.specifications?.gauge && (
                      <p className="text-xs uppercase tracking-[0.12em] text-[#595D5D]">
                        {item.specifications.gauge}
                      </p>
                    )}
                    <span className="text-xs text-[#595D5D]">Qty: {item.quantity}</span>
                  </div>

                  <span className="font-[family-name:var(--font-cormorant)] text-base font-semibold text-[#111111]">
                    ${(item.price * item.quantity).toLocaleString()} USD
                  </span>
                </div>
              ))}
            </div>

            {/* Financials */}
            <div className="border-t border-[#e5e5e3] pt-4 mt-4 space-y-2 text-xs uppercase tracking-[0.14em]">
              <div className="flex justify-between text-[#595D5D]">
                <span>Subtotal</span>
                <span className="text-[#111111]">${order?.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#595D5D]">
                <span>Delivery</span>
                <span className="text-[#111111]">
                  {order?.shippingCost === 0 ? 'Complimentary' : `$${order?.shippingCost} USD`}
                </span>
              </div>
              {Boolean(order?.taxEstimate && order.taxEstimate > 0) && (
                <div className="flex justify-between text-[#595D5D]">
                  <span>Tax</span>
                  <span className="text-[#111111]">${order?.taxEstimate?.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#e5e5e3] flex justify-between items-baseline text-[#111111] font-semibold">
                <span className="text-xs">Total Balance</span>
                <span className="font-[family-name:var(--font-cormorant)] text-xl font-bold">
                  ${order?.total?.toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Coordinates */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-[#ffffff] border border-[#e5e5e3] p-6 sm:p-8">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#595D5D] mb-4 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Delivery Address</span>
              </h3>

              <div className="text-xs text-[#111111] space-y-1">
                <div className="font-semibold text-sm">
                  {order?.shippingAddress?.fullName || order?.customer?.fullName}
                </div>
                <div>{order?.shippingAddress?.line1}</div>
                {order?.shippingAddress?.line2 && <div>{order?.shippingAddress.line2}</div>}
                <div>
                  {order?.shippingAddress?.city}, {order?.shippingAddress?.state}{' '}
                  {order?.shippingAddress?.postalCode}
                </div>
                <div>{order?.shippingAddress?.country}</div>
                <div className="pt-2 text-[#595D5D]">{order?.shippingAddress?.phone}</div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#f0f0ee]">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#595D5D] mb-2 flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Telemetry Updates</span>
                </h4>
                <p className="text-xs text-[#111111]">{order?.customer?.email}</p>
                {isPaid && (
                  <p className="text-xs text-[#555555] mt-1">
                    A confirmation email has been dispatched to your inbox.
                  </p>
                )}
              </div>

              {/* Trust Seals */}
              <div className="mt-6 pt-6 border-t border-[#f0f0ee] space-y-2">
                <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.15em] text-[#595D5D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secured by Cashfree Payments</span>
                </div>
                <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.15em] text-[#595D5D]">
                  <Package className="w-3.5 h-3.5" />
                  <span>Insured Direct Courier Hand-Delivery</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-[#ffffff] border border-[#e5e5e3] p-6 text-center space-y-4">
              <Link
                href="/account"
                className="w-full py-3.5 bg-[#111111] text-[#f9f9f7] hover:bg-[#2b2b2b] text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center space-x-2 transition-all border border-[#111111]"
              >
                <span>View in Customer Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
              </Link>

              <Link
                href="/"
                className="block text-xs uppercase tracking-[0.16em] text-[#595D5D] hover:text-[#111111] transition-colors"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
