/**
 * POST /api/payment/webhook
 *
 * Cashfree posts payment event notifications here asynchronously.
 * This is the canonical source of truth for payment status updates.
 *
 * Handles:
 * - PAYMENT_SUCCESS_WEBHOOK
 * - PAYMENT_FAILED_WEBHOOK
 * - PAYMENT_USER_DROPPED_WEBHOOK
 *
 * Security: Verifies Cashfree HMAC-SHA256 signature before processing.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeWebhook, formatPaymentMethod } from '../../../../lib/cashfree';
import { syncOrderPaymentStatusServer } from '../../../../lib/orderPaymentSync';
import { sendOrderConfirmationEmail } from '../../../../lib/orderEmail';

// Cashfree webhook event types
type CashfreeWebhookEvent =
  | 'PAYMENT_SUCCESS_WEBHOOK'
  | 'PAYMENT_FAILED_WEBHOOK'
  | 'PAYMENT_USER_DROPPED_WEBHOOK'
  | 'PAYMENT_PENDING_WEBHOOK'
  | 'REFUND_SUCCESS_WEBHOOK';

interface CashfreeWebhookPayload {
  type: CashfreeWebhookEvent;
  data: {
    order: {
      order_id: string; // This is OUR order ID (MG-ORD-XXXXX)
      cf_order_id: string;
      order_currency: string;
      order_amount: number;
    };
    payment: {
      cf_payment_id: string;
      payment_status: string;
      payment_amount: number;
      payment_currency: string;
      payment_time: string;
      payment_method: Record<string, unknown>;
    };
    customer_details?: {
      customer_id: string;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
    };
  };
}

export async function POST(req: NextRequest) {
  // Read raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('x-webhook-signature') || '';
  const timestamp = req.headers.get('x-webhook-timestamp') || '';

  // Verify webhook authenticity
  if (!verifyCashfreeWebhook(rawBody, signature, timestamp)) {
    console.error('[Cashfree Webhook] Invalid signature — request rejected');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: CashfreeWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { type, data } = payload;
  const mgOrderId = data.order.order_id; // MG-ORD-XXXXX
  const cfOrderId = data.order.cf_order_id;

  console.log(`[Cashfree Webhook] ${type} for order ${mgOrderId} (CF: ${cfOrderId})`);

  try {
    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const paymentMethod = formatPaymentMethod({
        cf_payment_id: data.payment.cf_payment_id,
        order_id: mgOrderId,
        entity: 'payment',
        payment_currency: data.payment.payment_currency,
        payment_amount: data.payment.payment_amount,
        payment_time: data.payment.payment_time,
        payment_status: 'SUCCESS',
        payment_message: '',
        payment_method: data.payment.payment_method as never,
      });

      // Update order to paid via resilient sync
      await syncOrderPaymentStatusServer({
        orderId: mgOrderId,
        status: 'paid',
        cashfreeOrderId: cfOrderId,
        cashfreePaymentId: data.payment.cf_payment_id,
        cashfreePaymentMethod: paymentMethod,
        paidAt: new Date(data.payment.payment_time).toISOString(),
      });

      // Dispatch order confirmation email to collector + BCC founder
      try {
        await sendOrderConfirmationEmail({
          orderId: mgOrderId,
          paymentMethod,
          cashfreePaymentId: data.payment.cf_payment_id,
        });
      } catch (emailErr) {
        console.error('[Cashfree Webhook] Warning: Email dispatch error:', emailErr);
      }
    } else if (type === 'PAYMENT_FAILED_WEBHOOK' || type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
      await syncOrderPaymentStatusServer({
        orderId: mgOrderId,
        status: 'payment_failed',
        cashfreeOrderId: cfOrderId,
      });
    } else if (type === 'PAYMENT_PENDING_WEBHOOK') {
      await syncOrderPaymentStatusServer({
        orderId: mgOrderId,
        status: 'payment_pending',
        cashfreeOrderId: cfOrderId,
      });
    }

    return NextResponse.json({ received: true, type });
  } catch (err) {
    console.error('[Cashfree Webhook] Processing error:', err);
    // Return 200 so Cashfree doesn't retry indefinitely for non-retriable errors
    return NextResponse.json({ received: true, warning: 'Processing error logged' });
  }
}
