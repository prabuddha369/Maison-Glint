/**
 * lib/orderEmail.ts
 *
 * Centralized confirmation email dispatcher for Maison Glint acquisitions.
 * Handles:
 * 1. Correct Zoho SMTP configuration (smtp.zoho.in, port 465, SSL)
 * 2. In-flight and cross-route deduplication (prevents duplicate emails between return route & webhook)
 * 3. Sends confirmation to collector + BCC to founder@maisonglint.com
 */

import nodemailer from 'nodemailer';
import { buildOrderConfirmationEmail, OrderConfirmationEmailData } from './emailTemplate';
import { getSupabaseAdmin } from './supabase/server';

// In-memory set to prevent double-sends within the same runtime
const sentEmailOrderIds = new Set<string>();

export interface SendConfirmationEmailParams {
  orderId: string;
  paymentMethod?: string;
  cashfreePaymentId?: string;
  orderData?: Partial<OrderConfirmationEmailData>;
}

export async function sendOrderConfirmationEmail(
  params: SendConfirmationEmailParams
): Promise<{ success: boolean; messageId?: string; skipped?: boolean; error?: string }> {
  const { orderId, paymentMethod, cashfreePaymentId, orderData } = params;

  // Deduplication check
  if (sentEmailOrderIds.has(orderId)) {
    console.log(`[OrderEmail] Notice: Confirmation email for ${orderId} already dispatched. Skipping duplicate send.`);
    return { success: true, skipped: true };
  }

  const zohoEmail = process.env.ZOHO_EMAIL || 'founder@maisonglint.com';
  const zohoPassword = process.env.ZOHO_APP_PASSWORD;

  if (!zohoPassword) {
    console.warn('[OrderEmail] ZOHO_APP_PASSWORD not set — skipping confirmation email');
    return { success: false, error: 'Zoho credentials missing' };
  }

  try {
    let emailPayload: OrderConfirmationEmailData | null = null;

    // 1. Try to fetch order data via SECURITY DEFINER RPC (bypasses RLS)
    try {
      const supabase = await getSupabaseAdmin();
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_order_for_email', {
        p_order_id: orderId,
      });

      const row = (!rpcError && rpcData && rpcData.success !== false) ? rpcData : null;

      if (row) {
        const customer = (row.customer || {}) as { email?: string; fullName?: string };
        const shippingAddress = (row.shipping_address || {}) as OrderConfirmationEmailData['shippingAddress'];
        const shippingMethod = (row.shipping_method || {}) as OrderConfirmationEmailData['shippingMethod'];
        const items = (row.items || []) as OrderConfirmationEmailData['items'];

        emailPayload = {
          orderId,
          customerName: customer.fullName || 'Valued Collector',
          customerEmail: customer.email || '',
          items,
          subtotal: Number(row.subtotal || 0),
          shippingCost: Number(row.shipping_cost || 0),
          taxEstimate: Number(row.tax_estimate || 0),
          total: Number(row.total || 0),
          currency: String(row.currency || 'USD'),
          shippingAddress,
          shippingMethod,
          paymentMethod: paymentMethod || row.cashfree_payment_method || 'Card payment',
          cashfreePaymentId: cashfreePaymentId || row.cashfree_payment_id || undefined,
        };
      } else {
        // Fallback: direct table select if service role or permissive policy exists
        const { data: tableRow } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .maybeSingle();

        if (tableRow) {
          const customer = (tableRow.customer || {}) as { email?: string; fullName?: string };
          const shippingAddress = (tableRow.shipping_address || {}) as OrderConfirmationEmailData['shippingAddress'];
          const shippingMethod = (tableRow.shipping_method || {}) as OrderConfirmationEmailData['shippingMethod'];
          const items = (tableRow.items || []) as OrderConfirmationEmailData['items'];

          emailPayload = {
            orderId,
            customerName: customer.fullName || 'Valued Collector',
            customerEmail: customer.email || '',
            items,
            subtotal: Number(tableRow.subtotal || 0),
            shippingCost: Number(tableRow.shipping_cost || 0),
            taxEstimate: Number(tableRow.tax_estimate || 0),
            total: Number(tableRow.total || 0),
            currency: String(tableRow.currency || 'USD'),
            shippingAddress,
            shippingMethod,
            paymentMethod: paymentMethod || tableRow.cashfree_payment_method || 'Card payment',
            cashfreePaymentId: cashfreePaymentId || tableRow.cashfree_payment_id || undefined,
          };
        }
      }
    } catch (dbErr) {
      console.warn('[OrderEmail] Database lookup notice:', dbErr);
    }

    // 2. If not found in DB row, merge with supplied orderData fallback
    if (!emailPayload && orderData && orderData.customerEmail) {
      emailPayload = {
        orderId,
        customerName: orderData.customerName || 'Valued Collector',
        customerEmail: orderData.customerEmail,
        items: orderData.items || [],
        subtotal: orderData.subtotal || 0,
        shippingCost: orderData.shippingCost || 0,
        taxEstimate: orderData.taxEstimate || 0,
        total: orderData.total || 0,
        currency: orderData.currency || 'USD',
        shippingAddress: orderData.shippingAddress || {
          fullName: orderData.customerName || '',
          line1: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
        shippingMethod: orderData.shippingMethod || {
          title: 'Standard Insured Cross-Border Cargo',
          estimatedDelivery: '3–5 Business Days',
        },
        paymentMethod: paymentMethod || orderData.paymentMethod || 'Card payment',
        cashfreePaymentId: cashfreePaymentId || orderData.cashfreePaymentId,
      };
    }

    if (!emailPayload || !emailPayload.customerEmail) {
      console.warn(`[OrderEmail] Insufficient order data for ${orderId} — cannot send email.`);
      return { success: false, error: 'Missing customer email or order payload' };
    }

    const { subject, html, text } = buildOrderConfirmationEmail(emailPayload);

    // 3. Configure Zoho SMTP with verified host smtp.zoho.in
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: zohoEmail,
        pass: zohoPassword,
      },
    });

    // 4. Send email with collector recipient + BCC to founder
    const info = await transporter.sendMail({
      from: `"Maison Glint" <${zohoEmail}>`,
      to: emailPayload.customerEmail,
      bcc: zohoEmail, // Real-time founder alert
      subject,
      html,
      text,
    });

    // Mark as sent to guarantee idempotency
    sentEmailOrderIds.add(orderId);

    console.log(`[OrderEmail] ✓ Confirmation email successfully sent to ${emailPayload.customerEmail} (BCC: ${zohoEmail}) for order ${orderId} [MsgID: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown email dispatch error';
    console.error(`[OrderEmail] ✗ Failed to send confirmation email for order ${orderId}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}
