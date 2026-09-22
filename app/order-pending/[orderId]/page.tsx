'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const POLL_INTERVAL_MS = 5000; // 5 seconds
const MAX_POLL_DURATION_MS = 60000; // 60 seconds

interface PollResponse {
  orderId: string;
  status: string;
  cashfreePaymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
}

export default function OrderPendingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [status, setStatus] = useState<string>('payment_pending');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [pollError, setPollError] = useState(false);

  const pollCountRef = useRef(0);
  const maxPolls = Math.floor(MAX_POLL_DURATION_MS / POLL_INTERVAL_MS);

  useEffect(() => {
    if (!orderId) return;

    // Elapsed timer
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    // Polling interval
    const poller = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current >= maxPolls) {
        clearInterval(poller);
        setTimedOut(true);
        return;
      }

      try {
        const res = await fetch(`/api/payment/poll-status?orderId=${orderId}`);
        if (!res.ok) {
          setPollError(true);
          return;
        }

        const data: PollResponse = await res.json();
        setStatus(data.status);

        if (data.status === 'paid') {
          clearInterval(poller);
          clearInterval(timer);
          // Auto-redirect to success
          router.push(`/order-success/${orderId}?payment=confirmed&method=${encodeURIComponent(data.paymentMethod || 'card')}`);
        } else if (data.status === 'payment_failed') {
          clearInterval(poller);
          clearInterval(timer);
          router.push(`/order-failed/${orderId}`);
        }
      } catch {
        setPollError(true);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      clearInterval(poller);
    };
  }, [orderId, router, maxPolls]);

  const dots = '.'.repeat((elapsedSeconds % 3) + 1);
  const progressPercent = Math.min(100, (elapsedSeconds / 60) * 100);

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
          <span className="text-xs uppercase tracking-[0.16em] text-[#595D5D]">
            Payment Verification
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 sm:py-24 text-center space-y-10">
        {/* Animated Icon */}
        <div className="flex justify-center">
          {timedOut ? (
            <div className="w-20 h-20 border border-[#e5e5e3] bg-[#ffffff] flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-[#d4af37]" />
            </div>
          ) : status === 'paid' ? (
            <div className="w-20 h-20 border border-[#d4af37] bg-[#111111] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#d4af37]" />
            </div>
          ) : (
            <div className="w-20 h-20 border border-[#e5e5e3] bg-[#ffffff] flex items-center justify-center relative">
              <Clock className="w-10 h-10 text-[#d4af37]" />
              <div className="absolute inset-0 border-2 border-transparent border-t-[#d4af37] rounded-none animate-spin" />
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#595D5D]">
            {timedOut ? 'Verification Taking Longer Than Expected' : 'Awaiting Payment Confirmation'}
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl font-light text-[#111111]">
            {timedOut
              ? 'Payment Status Unclear'
              : status === 'paid'
                ? 'Payment Confirmed'
                : `Your Payment Is Being Verified${dots}`}
          </h1>
          <p className="text-[13px] text-[#595D5D] font-light leading-relaxed max-w-md mx-auto">
            {timedOut
              ? 'The payment gateway has not returned a final status within the expected window. Your order has been preserved. Check your order status in your account.'
              : pollError
                ? 'We are having difficulty connecting to verify your payment status. Your order is safe.'
                : 'Your payment is being processed and verified by the payment network. This typically takes under 30 seconds. Please do not close this window.'}
          </p>
        </div>

        {/* Progress Bar */}
        {!timedOut && (
          <div className="w-full max-w-sm mx-auto">
            <div className="h-0.5 bg-[#e5e5e3] w-full">
              <div
                className="h-0.5 bg-[#d4af37] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-[#595D5D] mt-2 tracking-wider">
              Verifying{' '}
              {elapsedSeconds < 60
                ? `${elapsedSeconds}s / 60s`
                : 'extended verification'}{' '}
              — polling every 5 seconds
            </p>
          </div>
        )}

        {/* Order Reference */}
        <div className="bg-[#ffffff] border border-[#e5e5e3] p-6 text-left space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#595D5D]">Order Reference</p>
          <p className="font-mono text-base font-semibold text-[#111111]">{orderId}</p>
          <p className="text-xs text-[#595D5D]">
            Your acquisition is recorded in our ledger. If payment is confirmed by your bank, it will be reflected here automatically.
          </p>
        </div>

        {/* CTA Buttons */}
        {timedOut && (
          <div className="space-y-4">
            <Link
              href={`/account`}
              className="w-full py-4 bg-[#111111] hover:bg-[#2b2b2b] text-[#ffffff] text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <span>Check Order Status in Account</span>
            </Link>
            <p className="text-xs text-[#595D5D]">
              If payment was charged but not confirmed, contact{' '}
              <a
                href="mailto:founder@maisonglint.com"
                className="text-[#111111] underline underline-offset-2"
              >
                founder@maisonglint.com
              </a>{' '}
              with your order reference.
            </p>
          </div>
        )}

        {!timedOut && (
          <p className="text-xs text-[#595D5D]">
            Do not close this window or press Back. You will be redirected automatically.
          </p>
        )}
      </main>
    </div>
  );
}
