/**
 * GET /api/payment/return
 *
 * Cashfree redirects the user here after a payment attempt.
 * Query params:
 *   - mg_order_id: Our Maison Glint order ID (MG-ORD-XXXXX)
 *   - order_id: Cashfree's CF order ID (passed back in the return_url template)
 *
 * This route:
 * 1. Fetches actual payment status from Cashfree API (server-to-server)
 * 2. Updates the Supabase order record
 * 3. Redirects to the appropriate page
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  resolveCashfreeOrderStatus,
  getSuccessfulPayment,
  formatPaymentMethod,
} from '../../../../lib/cashfree';
import { syncOrderPaymentStatusServer } from '../../../../lib/orderPaymentSync';
import { sendOrderConfirmationEmail } from '../../../../lib/orderEmail';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mgOrderId = searchParams.get('mg_order_id');
  const cfOrderId = searchParams.get('order_id');

  const baseUrl = req.headers.get('origin') ?? 'http://localhost:3000';

  if (!mgOrderId || !cfOrderId) {
    return NextResponse.redirect(`${baseUrl}/?payment_error=missing_params`);
  }

  try {
    // Verify payment status server-to-server (cannot be spoofed by client)
    const resolvedStatus = await resolveCashfreeOrderStatus(cfOrderId);

    if (resolvedStatus === 'paid') {
      // Get payment details to record method and payment ID
      const successPayment = await getSuccessfulPayment(cfOrderId);
      const paymentMethod = successPayment ? formatPaymentMethod(successPayment) : undefined;

      const syncResult = await syncOrderPaymentStatusServer({
        orderId: mgOrderId,
        status: 'paid',
        cashfreeOrderId: cfOrderId,
        cashfreePaymentId: successPayment?.cf_payment_id,
        cashfreePaymentMethod: paymentMethod,
        paidAt: new Date().toISOString(),
      });

      // Dispatch order confirmation email to customer (with BCC to founder)
      try {
        const orderDataFromSync = syncResult?.data as Record<string, unknown> | undefined;
        await sendOrderConfirmationEmail({
          orderId: mgOrderId,
          paymentMethod,
          cashfreePaymentId: successPayment?.cf_payment_id,
          orderData: orderDataFromSync && orderDataFromSync.customer ? {
            customerName: (orderDataFromSync.customer as Record<string, string>)?.fullName,
            customerEmail: (orderDataFromSync.customer as Record<string, string>)?.email,
            items: orderDataFromSync.items as never,
            subtotal: Number(orderDataFromSync.subtotal || 0),
            shippingCost: Number(orderDataFromSync.shipping_cost || 0),
            taxEstimate: Number(orderDataFromSync.tax_estimate || 0),
            total: Number(orderDataFromSync.total || 0),
            currency: String(orderDataFromSync.currency || 'USD'),
            shippingAddress: orderDataFromSync.shipping_address as never,
            shippingMethod: orderDataFromSync.shipping_method as never,
          } : undefined,
        });
      } catch (emailErr) {
        console.error('[/api/payment/return] Warning: Email dispatch error:', emailErr);
      }

      return NextResponse.redirect(
        `${baseUrl}/order-success/${mgOrderId}?payment=confirmed&method=${encodeURIComponent(paymentMethod || 'card')}`
      );
    } else if (resolvedStatus === 'payment_failed') {
      await syncOrderPaymentStatusServer({
        orderId: mgOrderId,
        status: 'payment_failed',
        cashfreeOrderId: cfOrderId,
      });

      return NextResponse.redirect(`${baseUrl}/order-failed/${mgOrderId}`);
    } else {
      // Payment still pending (user closed modal, 3DS in progress, etc.)
      await syncOrderPaymentStatusServer({
        orderId: mgOrderId,
        status: 'payment_pending',
        cashfreeOrderId: cfOrderId,
      });

      return NextResponse.redirect(`${baseUrl}/order-pending/${mgOrderId}`);
    }
  } catch (err) {
    console.error('[/api/payment/return] Error verifying payment:', err);
    // On error, redirect to pending page so user isn't lost
    return NextResponse.redirect(`${baseUrl}/order-pending/${mgOrderId}`);
  }
}
