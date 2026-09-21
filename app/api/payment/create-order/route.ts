/**
 * POST /api/payment/create-order
 *
 * Creates a Cashfree payment order and returns the payment_session_id.
 * Server-side only — uses CASHFREE_SECRET, never exposed to the browser.
 *
 * CURRENCY NOTE:
 * Cashfree SANDBOX test cards are Indian bank test cards (Visa/RuPay/Mastercard)
 * and only work with INR currency. We auto-detect sandbox via CASHFREE_API_BASE_URL
 * and switch to INR for test orders. In PRODUCTION, USD is used for international clients.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createCashfreeOrder } from '../../../../lib/cashfree';
import { syncOrderPaymentStatusServer } from '../../../../lib/orderPaymentSync';

const IS_SANDBOX = (process.env.CASHFREE_API_BASE_URL ?? '').includes('sandbox');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
    } = body as {
      orderId: string;
      amount: number;
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

    /**
     * Currency configuration:
     * - CASHFREE_CURRENCY env var allows explicitly setting currency (e.g. 'USD' once international is activated).
     * - By default in Cashfree sandbox, merchant accounts only have domestic INR cards enabled.
     *   Until International Payments are activated on the Cashfree Merchant Dashboard, Cashfree rejects
     *   USD cards with "This card is not supported for this payment" (code: payment_method_unsupported).
     * - In production, USD is used for international patrons.
     */
    const currency =
      process.env.CASHFREE_CURRENCY || (IS_SANDBOX ? 'INR' : 'USD');

    // Build return URL — Cashfree redirects here after payment attempt
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'https://www.maisonglint.com';
    const returnUrl = `${baseUrl}/api/payment/return?mg_order_id=${orderId}&order_id={order_id}`;
    const notifyUrl = `${baseUrl}/api/payment/webhook`;

    // Create Cashfree order (server-side, uses CASHFREE_SECRET)
    const cfOrder = await createCashfreeOrder({
      orderId,
      amount,
      currency,
      customerName: customerName || 'Maison Glint Collector',
      customerEmail,
      // Sandbox requires a valid-format Indian mobile number
      customerPhone: customerPhone || (IS_SANDBOX ? '+919000000000' : '+10000000000'),
      returnUrl,
      notifyUrl,
      isSandbox: IS_SANDBOX,
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
      currency,
      isSandbox: IS_SANDBOX,
    });
  } catch (err: unknown) {
    console.error('[/api/payment/create-order] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create payment session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
