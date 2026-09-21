/**
 * lib/cashfree.ts
 *
 * Server-side Cashfree Payments API client.
 * All functions here MUST only run on the server (API routes / Server Components).
 * The CASHFREE_SECRET env var is never accessible on the client.
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Dynamic Environment & Configuration Helpers
// ---------------------------------------------------------------------------

/**
 * Detect whether Cashfree should operate in Sandbox (Staging) or Production mode.
 * Evaluates:
 * 1. NEXT_PUBLIC_CASHFREE_MODE ('sandbox' | 'production')
 * 2. CASHFREE_ENV / CASHFREE_MODE ('sandbox' | 'production' | 'test' | 'prod')
 * 3. Active Secret or App ID starting with 'cfsk_ma_test_' or 'TEST'
 * 4. Base URL containing 'sandbox'
 */
export function isCashfreeSandbox(): boolean {
  const mode = (
    process.env.NEXT_PUBLIC_CASHFREE_MODE ||
    process.env.CASHFREE_ENV ||
    process.env.CASHFREE_MODE ||
    ''
  ).toLowerCase();

  if (mode === 'sandbox' || mode === 'test' || mode === 'staging') return true;
  if (mode === 'production' || mode === 'prod' || mode === 'live') return false;

  // Fallback to inspecting active keys / URL
  const secret = process.env.CASHFREE_SECRET || '';
  const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '';
  if (secret.startsWith('cfsk_ma_test_') || appId.startsWith('TEST')) return true;
  if (process.env.CASHFREE_API_BASE_URL?.includes('sandbox')) return true;

  return false;
}

export function getCashfreeConfig() {
  const isSandbox = isCashfreeSandbox();

  // Resolve App ID: check dedicated staging/prod variables first, fallback to standard
  let appId = isSandbox
    ? (process.env.CASHFREE_TEST_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '')
    : (process.env.CASHFREE_PROD_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '');

  // Resolve Secret: check dedicated staging/prod variables first, fallback to standard
  let secret = isSandbox
    ? (process.env.CASHFREE_TEST_SECRET || process.env.CASHFREE_SECRET || '')
    : (process.env.CASHFREE_PROD_SECRET || process.env.CASHFREE_SECRET || '');

  // Auto-correct if dedicated variables exist and standard variable is mismatched
  if (isSandbox && !appId.startsWith('TEST') && process.env.CASHFREE_TEST_APP_ID) {
    appId = process.env.CASHFREE_TEST_APP_ID;
  }
  if (isSandbox && !secret.startsWith('cfsk_ma_test_') && process.env.CASHFREE_TEST_SECRET) {
    secret = process.env.CASHFREE_TEST_SECRET;
  }
  if (!isSandbox && appId.startsWith('TEST') && process.env.CASHFREE_PROD_APP_ID) {
    appId = process.env.CASHFREE_PROD_APP_ID;
  }
  if (!isSandbox && secret.startsWith('cfsk_ma_test_') && process.env.CASHFREE_PROD_SECRET) {
    secret = process.env.CASHFREE_PROD_SECRET;
  }

  // Base URL
  const apiBase = isSandbox
    ? 'https://sandbox.cashfree.com/pg'
    : (process.env.CASHFREE_API_BASE_URL && !process.env.CASHFREE_API_BASE_URL.includes('sandbox')
        ? process.env.CASHFREE_API_BASE_URL
        : 'https://api.cashfree.com/pg');

  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';

  return {
    isSandbox,
    mode: isSandbox ? ('sandbox' as const) : ('production' as const),
    appId,
    secret,
    apiBase,
    apiVersion,
  };
}

export function getCashfreeMode(): 'sandbox' | 'production' {
  return getCashfreeConfig().mode;
}

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
   * When true (sandbox/test mode), forces sandbox endpoint and test card parameters.
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
  // Dual-mode FX metadata
  isConverted?: boolean;
  originalCurrency?: string;
  originalAmount?: number;
  exchangeRate?: number;
  formattedAmount?: string;
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
  const { appId, secret, apiVersion } = getCashfreeConfig();
  if (!appId || !secret) {
    throw new Error('[Cashfree] Missing CASHFREE credentials in environment variables.');
  }
  return {
    'Content-Type': 'application/json',
    'x-api-version': apiVersion,
    'x-client-id': appId,
    'x-client-secret': secret,
  };
}

// ---------------------------------------------------------------------------
// Core API Functions
// ---------------------------------------------------------------------------

export async function getCashfreeOrder(
  cfOrderId: string
): Promise<CashfreeOrderResponse | null> {
  try {
    const { apiBase } = getCashfreeConfig();
    const res = await fetch(`${apiBase}/orders/${cfOrderId}`, {
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
  const config = getCashfreeConfig();
  const apiBase = config.apiBase;

  // Strict Native Currency Processing:
  // Charges directly in the requested native currency (e.g. USD) without synthetic conversion.
  const targetCurrency = (params.currency || 'USD').toUpperCase();
  const targetAmount = Math.round(Number(params.amount) * 100) / 100;

  // Clean customer phone: prioritize valid international phone or format compliant E.164
  let phone = params.customerPhone ? params.customerPhone.trim() : '';
  if (!phone || phone.length < 8) {
    phone = '+12025550143';
  } else if (!phone.startsWith('+')) {
    phone = `+${phone}`;
  }

  // Clean customer ID (alphanumeric and underscore only, max 50 chars)
  const customerId =
    params.customerEmail.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'collector';

  const executeCreate = async (
    orderIdToUse: string,
    amountToUse: number,
    currencyToUse: string
  ) => {
    const body: Record<string, unknown> = {
      order_id: orderIdToUse,
      order_amount: amountToUse,
      order_currency: currencyToUse,
      customer_details: {
        customer_id: customerId,
        customer_name: params.customerName || 'Maison Glint Collector',
        customer_email: params.customerEmail,
        customer_phone: phone,
      },
      order_meta: {
        return_url: params.returnUrl,
        notify_url: params.notifyUrl,
      },
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    const res = await fetch(`${apiBase}/orders`, {
      method: 'POST',
      headers: getCashfreeHeaders(),
      body: JSON.stringify(body),
    });

    return { res, errText: !res.ok ? await res.text() : '' };
  };

  // 1. Initial attempt
  let currentOrderId = params.orderId;
  let attempt = await executeCreate(currentOrderId, targetAmount, targetCurrency);

  // If order already exists in Cashfree, check existing or generate unique retry suffix
  if (!attempt.res.ok && attempt.errText.includes('order_already_exists')) {
    const existing = await getCashfreeOrder(currentOrderId);
    if (
      existing &&
      existing.order_status === 'ACTIVE' &&
      existing.payment_session_id &&
      existing.order_currency === targetCurrency &&
      Math.abs(existing.order_amount - targetAmount) < 0.01
    ) {
      existing.isConverted = false;
      existing.originalCurrency = targetCurrency;
      existing.originalAmount = targetAmount;
      return existing;
    }
    currentOrderId = `${params.orderId.slice(0, 30)}_R${Date.now().toString().slice(-6)}`;
    attempt = await executeCreate(currentOrderId, targetAmount, targetCurrency);
  }

  // 2. Strict Currency Error Detection:
  const isCurrencyError =
    !attempt.res.ok &&
    (attempt.errText.includes('order Currency not enabled for this merchant account') ||
      attempt.errText.includes('currency_not_supported') ||
      attempt.errText.includes('CURRENCY_NOT_SUPPORTED'));

  if (isCurrencyError) {
    throw new Error(
      `[Cashfree] Currency "${targetCurrency}" is not yet enabled on your Cashfree merchant account. ` +
      `Please request International Cards activation in your Cashfree Dashboard ` +
      `(Settings > Payment Methods > International Cards) to process native ${targetCurrency} transactions.`
    );
  }

  if (!attempt.res.ok) {
    throw new Error(`[Cashfree] createOrder failed (${attempt.res.status}): ${attempt.errText}`);
  }

  const result = (await attempt.res.json()) as CashfreeOrderResponse;
  result.isConverted = false;
  result.originalCurrency = targetCurrency;
  result.originalAmount = targetAmount;
  return result;
}

/**
 * Fetch all payments for a Cashfree order ID.
 * Returns the array of payment attempts (most recent first).
 */
export async function getCashfreePayments(
  cfOrderId: string
): Promise<CashfreePayment[]> {
  const { apiBase } = getCashfreeConfig();
  const res = await fetch(`${apiBase}/orders/${cfOrderId}/payments`, {
    method: 'GET',
    headers: getCashfreeHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`[Cashfree] getPayments failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
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
    const { secret } = getCashfreeConfig();
    if (!secret) return false;
    const data = timestamp + rawBody;
    const expectedSig = crypto
      .createHmac('sha256', secret)
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
