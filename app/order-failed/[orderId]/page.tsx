'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Lock,
  CreditCard,
} from 'lucide-react';
import { getOrderById } from '../../../lib/payment';
import type { Order } from '../../../types/store';

export default function OrderFailedPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');

  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const found = await getOrderById(orderId);
        setOrder(found);
      } catch (e) {
        console.error('Failed to load order', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const handleRetryPayment = useCallback(async () => {
    if (!order) return;
    setRetrying(true);
    setRetryError('');

    try {
      const sessionRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          amount: order.total,
          currency: order.currency || 'USD',
          customerName: order.customer.fullName,
          customerEmail: order.customer.email,
          customerPhone: order.customer.phone || '+10000000000',
        }),
      });

      if (!sessionRes.ok) {
        const errData = await sessionRes.json();
        throw new Error(errData.error || 'Failed to initiate payment retry.');
      }

      const sessionData = await sessionRes.json();
      const { paymentSessionId, isSandbox } = sessionData;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cashfree = (window as any).Cashfree({
        mode: isSandbox ? 'sandbox' : (process.env.NEXT_PUBLIC_CASHFREE_MODE || 'production'),
      });

      const returnUrl = `${window.location.origin}/api/payment/return?mg_order_id=${order.orderId}&order_id={order_id}`;

      cashfree.checkout({
        paymentSessionId,
        returnUrl,
        redirectTarget: '_self',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to initiate payment retry.';
      setRetryError(msg);
      setRetrying(false);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center">
        <div className="font-[family-name:var(--font-cormorant)] text-2xl text-[#111111] animate-pulse">
          Retrieving Order Record...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#111111]">
      {/* Header */}
      <header className="border-b border-[#e5e5e3] bg-[#ffffff]">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.18em] uppercase text-[#111111] font-light"
          >
            Maison Glint
          </Link>
          <Link
            href="/account"
            className="text-xs uppercase tracking-[0.16em] text-[#595D5D] hover:text-[#111111] transition-colors"
          >
            Collector Account
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16 space-y-8">
        {/* Failure Banner */}
        <div className="bg-[#ffffff] border border-[#e5e5e3] p-8 sm:p-12">
          <div className="flex items-start space-x-4 sm:space-x-6">
            <div className="w-12 h-12 border border-[#e5e5e3] bg-[#fff8f8] text-[#d9534f] flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs uppercase tracking-[0.24em] font-semibold text-[#595D5D]">
                  Payment Declined
                </span>
                <span className="inline-flex items-center px-2.5 py-1 bg-[#fff8f8] border border-[#f5c6cb] text-[#721c24] text-xs uppercase tracking-[0.15em] font-medium">
                  Gateway Returned Failure
                </span>
              </div>

              <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl font-light text-[#111111] mb-3">
                Payment Could Not Be Processed
              </h1>

              <p className="text-[13px] text-[#595D5D] font-light leading-relaxed">
                Your order <span className="font-mono font-semibold text-[#111111]">{orderId}</span> has been preserved in our system. No charge was made. You may retry with the same or a different card.
              </p>
            </div>
          </div>
        </div>

        {/* Test Card Info (dev only) */}
        {isDev && (
          <div className="bg-[#f0f4ff] border border-[#c7d7ff] p-6">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#3b5bdb] mb-3">
              Development Mode — Cashfree Sandbox Test Cards
            </p>
            <div className="space-y-2 text-xs font-mono text-[#333]">
              <div className="flex justify-between">
                <span className="text-[#2e7d32] font-semibold">✓ Visa Debit</span>
                <span>4706 1312 1121 2123 · Exp 03/28 · CVV 123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2e7d32] font-semibold">✓ Mastercard</span>
                <span>5409 1626 6938 1034 · Exp 03/28 · CVV 123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2e7d32] font-semibold">✓ RuPay Card</span>
                <span>6074 8259 7208 3818 · Exp 03/28 · CVV 123</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#d8e2ff]">
                <span className="text-[#3b5bdb] font-semibold">USD Card (Intl)</span>
                <span>4266 9020 7958 3702 · Exp 09/28 · CVV 681</span>
              </div>
              <div className="mt-2 text-[#666] text-xs">
                Test OTP: <span className="font-bold text-[#111111]">111000</span> (Name: <span className="font-bold text-[#111111]">Test</span>)
              </div>
              <div className="text-xs text-[#595D5D] italic">
                Note: USD cards require &ldquo;International Payments&rdquo; activated in Cashfree Merchant Dashboard.
              </div>
            </div>
          </div>
        )}

        {/* Common Reasons */}
        <div className="bg-[#ffffff] border border-[#e5e5e3] p-6">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#595D5D] mb-4">
            Common Reasons for Decline
          </p>
          <ul className="space-y-2 text-xs text-[#555555]">
            <li className="flex items-start space-x-2">
              <span className="text-[#d4af37] mt-0.5">—</span>
              <span>Card declined by issuing bank (insufficient funds, security block, or international transactions disabled)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#d4af37] mt-0.5">—</span>
              <span>3D Secure authentication failed or timed out</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#d4af37] mt-0.5">—</span>
              <span>Card number, expiry, or CVV entered incorrectly</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#d4af37] mt-0.5">—</span>
              <span>Transaction flagged by your bank's fraud prevention system</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-[#595D5D]">
            We recommend trying a different card or contacting your bank before retrying.
          </p>
        </div>

        {/* Error display */}
        {retryError && (
          <div className="p-4 bg-[#fff8f8] border border-[#f5c6cb] text-xs text-[#721c24] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{retryError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleRetryPayment}
            disabled={retrying || !order}
            className="w-full py-4 bg-[#111111] hover:bg-[#2b2b2b] text-[#ffffff] text-xs uppercase tracking-[0.25em] font-semibold transition-all disabled:opacity-40 flex items-center justify-center space-x-3"
          >
            {retrying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Opening Payment Vault...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-[#d4af37]" />
                <span>Retry Payment</span>
              </>
            )}
          </button>

          <Link
            href="/checkout"
            className="w-full py-4 border border-[#111111] text-[#111111] hover:bg-[#f5f5f3] text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center space-x-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Checkout</span>
          </Link>
        </div>

        {/* Order Reference */}
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[#595D5D]">
            Order Reference: <span className="font-mono text-[#111111] font-semibold">{orderId}</span>
          </p>
          <p className="text-xs text-[#595D5D]">
            For support, contact{' '}
            <a
              href="mailto:founder@maisonglint.com"
              className="text-[#111111] underline underline-offset-2"
            >
              founder@maisonglint.com
            </a>{' '}
            with your order reference.
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs uppercase tracking-[0.15em] text-[#595D5D] pt-2">
            <Lock className="w-3 h-3" />
            <span>Secured by Cashfree Payments · PCI DSS Compliant</span>
          </div>
        </div>
      </main>
    </div>
  );
}
