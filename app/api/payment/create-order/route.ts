/**
 * POST /api/payment/create-order
 *
 * Creates a Cashfree payment order and returns the payment_session_id.
 * Server-side only — uses CASHFREE_SECRET, never exposed to the browser.
 *
 * CURRENCY PROCESSING:
 * Charges natively in USD (or customer's specified cart currency).
 * No artificial conversions to INR are performed, eliminating bill shock and fraud blocks.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createCashfreeOrder, getCashfreeConfig } from '../../../../lib/cashfree';
import { syncOrderPaymentStatusServer } from '../../../../lib/orderPaymentSync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      amount,
      currency,
      customerName,
      customerEmail,
      customerPhone,
    } = body as {
      orderId: string;
      amount: number;
      currency?: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
    };

    if (!orderId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerEmail' },
        { status: 400 }
      );
    }

    const config = getCashfreeConfig();
    const isSandbox = config.isSandbox;

    // Incoming currency of the order amount (Maison Glint storefront catalog prices are in USD)
    const incomingCurrency = (currency || 'USD').toUpperCase();

    // Build return URL — Cashfree redirects here after payment attempt
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'https://www.maisonglint.com';
    const returnUrl = `${baseUrl}/api/payment/return?mg_order_id=${orderId}&order_id={order_id}`;
    const notifyUrl = `${baseUrl}/api/payment/webhook`;

    // Create Cashfree order (server-side, uses CASHFREE_SECRET)
    // Sends clean native currency (e.g. USD) directly to Cashfree multi-currency gateway
    const cfOrder = await createCashfreeOrder({
      orderId,
      amount,
      currency: incomingCurrency,
      customerName: customerName || 'Maison Glint Collector',
      customerEmail,
      customerPhone: customerPhone || '+12025550143',
      returnUrl,
      notifyUrl,
      isSandbox,
    });

    // Store the Cashfree order ID in Supabase for webhook correlation
    await syncOrderPaymentStatusServer({
      orderId,
      status: 'payment_pending',
      cashfreeOrderId: cfOrder.cf_order_id,
    });

    return NextResponse.json({
      paymentSessionId: cfOrder.payment_session_id,
      cfOrderId: cfOrder.cf_order_id,
      expiresAt: cfOrder.order_expiry_time,
      currency: cfOrder.order_currency,
      orderAmount: cfOrder.order_amount,
      originalAmount: cfOrder.originalAmount ?? amount,
      originalCurrency: cfOrder.originalCurrency ?? incomingCurrency,
      isConverted: false,
      isSandbox,
      mode: config.mode,
    });
  } catch (err: unknown) {
    console.error('[/api/payment/create-order] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create payment session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
