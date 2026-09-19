/**
 * GET /api/payment/poll-status
 *
 * Client-side polling endpoint for the /order-pending page.
 * Returns the current status of a Maison Glint order from Supabase.
 *
 * Query params:
 *   - orderId: Our MG-ORD-XXXXX order ID
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../../lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId parameter' }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, status, cashfree_payment_id, cashfree_payment_method, paid_at')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      orderId: data.order_id,
      status: data.status,
      cashfreePaymentId: data.cashfree_payment_id,
      paymentMethod: data.cashfree_payment_method,
      paidAt: data.paid_at,
    });
  } catch (err) {
    console.error('[/api/payment/poll-status] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
