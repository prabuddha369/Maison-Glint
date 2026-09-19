/**
 * lib/cashfree.ts
 *
 * Server-side Cashfree Payments API client.
 * All functions here MUST only run on the server (API routes / Server Components).
 * The CASHFREE_SECRET env var is never accessible on the client.
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------

const CASHFREE_API_BASE =
  process.env.CASHFREE_API_BASE_URL || 'https://sandbox.cashfree.com/pg';
const CASHFREE_API_VERSION =
  process.env.CASHFREE_API_VERSION || '2023-08-01';
const CASHFREE_APP_ID = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '';
const CASHFREE_SECRET = process.env.CASHFREE_SECRET || '';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CashfreeCreateOrderParams {
  /** Your internal Maison Glint order ID (e.g. MG-ORD-ABC12) */
  orderId: string;
  /** Amount in the order currency */
  amount: number;
  /** ISO 4217 currency code — 'INR' for sandbox, 'USD' for production */
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /**
   * URL Cashfree redirects to after payment attempt.
   * We route through /api/payment/return to verify status first.
   */
  returnUrl: string;
  notifyUrl?: string;
  /**
   * When true (sandbox/test mode), removes payment_methods restriction so all
   * Cashfree test cards (Visa, RuPay, Mastercard) work.
   * In production, restricts to cc,dc for international card payments.
   */
  isSandbox?: boolean;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: string;
  payment_session_id: string;
  order_expiry_time: string;
  created_at: string;
}

export interface CashfreePayment {
  cf_payment_id: string;
  order_id: string;
  entity: string;
  payment_currency: string;
  payment_amount: number;
  payment_time: string;
  payment_status: 'SUCCESS' | 'FAILED' | 'FLAGGED' | 'PENDING' | 'CANCELLED' | 'VOID' | 'USER_DROPPED';
  payment_message: string;
  payment_method: {
    card?: {
      card_number: string; // masked, e.g. "411111XXXXXX1111"
      card_network: string;
      card_type: string;
      card_country: string;
      card_bank: string;
    };
    upi?: { channel: string; upi_id: string };
    netbanking?: { netbanking_bank_code: string; netbanking_bank_name: string };
  };
  error_details?: {
    error_code: string;
    error_description: string;
    error_reason: string;
    error_source: string;
    error_code_raw: string;
    error_description_raw: string;
    error_reason_raw: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get Cashfree API request headers (server-side only)
 */
function getCashfreeHeaders(): Record<string, string> {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET) {
    throw new Error('[Cashfree] Missing CASHFREE credentials in environment variables.');
  }
  return {
    'Content-Type': 'application/json',
    'x-api-version': CASHFREE_API_VERSION,
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET,
  };
}

// ---------------------------------------------------------------------------
// Core API Functions
// ---------------------------------------------------------------------------

export async function getCashfreeOrder(
  cfOrderId: string
): Promise<CashfreeOrderResponse | null> {
  try {
    const res = await fetch(`${CASHFREE_API_BASE}/orders/${cfOrderId}`, {
      method: 'GET',
      headers: getCashfreeHeaders(),
    });
    if (!res.ok) return null;
    return (await res.json()) as CashfreeOrderResponse;
  } catch {
    return null;
  }
}

/**
 * Create a Cashfree payment order.
 * Returns the payment_session_id used by Cashfree.js on the client to open the hosted page.
 * If an order already exists in Cashfree, re-uses the active session or creates a unique retry attempt.
 */
export async function createCashfreeOrder(
  params: CashfreeCreateOrderParams
): Promise<CashfreeOrderResponse> {
  const createAttempt = async (targetOrderId: string) => {
    const body = {
      order_id: targetOrderId,
      order_amount: params.amount,
      order_currency: params.currency,
      customer_details: {
        customer_id: params.customerEmail.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50),
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone || (params.isSandbox ? '+919000000000' : '+10000000000'),
      },
      order_meta: {
        return_url: params.returnUrl,
        notify_url: params.notifyUrl,
        // In sandbox: no payment_methods restriction so ALL test cards work (Visa/RuPay/Mastercard)
        // In production: restrict to cc,dc only for international card payments
        ...(params.isSandbox ? {} : { payment_methods: 'cc,dc' }),
      },
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    };

    const res = await fetch(`${CASHFREE_API_BASE}/orders`, {
      method: 'POST',
      headers: getCashfreeHeaders(),
      body: JSON.stringify(body),
    });

    return { res, errText: !res.ok ? await res.text() : '' };
  };

  const firstAttempt = await createAttempt(params.orderId);

  if (!firstAttempt.res.ok) {
    if (firstAttempt.errText.includes('order_already_exists')) {
      // Check if existing order is still active, has a valid payment_session_id, and matches currency
      const existing = await getCashfreeOrder(params.orderId);
      if (
        existing &&
        existing.order_status === 'ACTIVE' &&
        existing.payment_session_id &&
        existing.order_currency === params.currency
      ) {
        return existing;
      }
      // If expired, not active, or different currency, create with a unique retry timestamp
      const retryId = `${params.orderId.slice(0, 32)}_R${Date.now().toString().slice(-6)}`;
      const retryAttempt = await createAttempt(retryId);
      if (retryAttempt.res.ok) {
        return retryAttempt.res.json() as Promise<CashfreeOrderResponse>;
      }
      throw new Error(`[Cashfree] createOrder retry failed (${retryAttempt.res.status}): ${retryAttempt.errText}`);
    }
    throw new Error(`[Cashfree] createOrder failed (${firstAttempt.res.status}): ${firstAttempt.errText}`);
  }

  return firstAttempt.res.json() as Promise<CashfreeOrderResponse>;
}

/**
 * Fetch all payments for a Cashfree order ID.
 * Returns the array of payment attempts (most recent first).
 */
export async function getCashfreePayments(
  cfOrderId: string
): Promise<CashfreePayment[]> {
  const res = await fetch(`${CASHFREE_API_BASE}/orders/${cfOrderId}/payments`, {
    method: 'GET',
    headers: getCashfreeHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`[Cashfree] getPayments failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  // API returns an array directly
  return Array.isArray(data) ? data : [];
}

/**
 * Get the most recent successful payment for a Cashfree order.
 * Returns null if no successful payment found.
 */
export async function getSuccessfulPayment(
  cfOrderId: string
): Promise<CashfreePayment | null> {
  try {
    const payments = await getCashfreePayments(cfOrderId);
    return payments.find((p) => p.payment_status === 'SUCCESS') ?? null;
  } catch {
    return null;
  }
}

/**
 * Determine the aggregate payment status for a Cashfree order.
 * Maps Cashfree payment statuses → our internal OrderStatus.
 */
export async function resolveCashfreeOrderStatus(
  cfOrderId: string
): Promise<'paid' | 'payment_failed' | 'payment_pending'> {
  try {
    const payments = await getCashfreePayments(cfOrderId);
    if (payments.some((p) => p.payment_status === 'SUCCESS')) return 'paid';
    if (payments.some((p) => p.payment_status === 'PENDING')) return 'payment_pending';
    if (payments.some((p) =>
      ['FAILED', 'CANCELLED', 'USER_DROPPED', 'VOID'].includes(p.payment_status)
    )) return 'payment_failed';
    return 'payment_pending'; // no payments yet
  } catch {
    return 'payment_pending';
  }
}

// ---------------------------------------------------------------------------
// Webhook Signature Verification
// ---------------------------------------------------------------------------

/**
 * Verify a Cashfree webhook request signature.
 *
 * Cashfree signs webhooks using HMAC-SHA256:
 * signature = base64(HMAC-SHA256(timestamp + rawBody, secret))
 * The signature is provided in the `x-webhook-signature` header.
 * The timestamp is in the `x-webhook-timestamp` header.
 */
export function verifyCashfreeWebhook(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    if (!CASHFREE_SECRET) return false;
    const data = timestamp + rawBody;
    const expectedSig = crypto
      .createHmac('sha256', CASHFREE_SECRET)
      .update(data)
      .digest('base64');
    return crypto.timingSafeEqual(
      Buffer.from(expectedSig, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Payment Method Display Helper
// ---------------------------------------------------------------------------

/**
 * Extract a human-readable payment method label from a Cashfree payment.
 * e.g. "Visa card ending in 1111"
 */
export function formatPaymentMethod(payment: CashfreePayment): string {
  const { payment_method } = payment;
  if (payment_method.card) {
    const { card_network, card_number } = payment_method.card;
    const last4 = card_number?.slice(-4) || '****';
    return `${card_network || 'Card'} ending in ${last4}`;
  }
  if (payment_method.upi) {
    return `UPI (${payment_method.upi.upi_id})`;
  }
  if (payment_method.netbanking) {
    return `Net Banking — ${payment_method.netbanking.netbanking_bank_name}`;
  }
  return 'Card payment';
}
