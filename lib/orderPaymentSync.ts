/**
 * lib/orderPaymentSync.ts
 *
 * Centralized order payment status synchronization for server-side payment routes
 * (/api/payment/create-order, /api/payment/return, /api/payment/webhook).
 *
 * Employs a resilient dual-strategy:
 * 1. Primary: Calls the `update_order_payment_status` RPC function (SECURITY DEFINER),
 *    which safely bypasses Supabase RLS without needing a service role key.
 * 2. Fallback: If the RPC is not yet created in Supabase, attempts direct table update
 *    and logs diagnostic assistance.
 */

import { getSupabaseAdmin } from './supabase/server';
import type { OrderStatus } from '../types/store';

export interface SyncOrderPaymentParams {
  orderId: string;
  status: OrderStatus;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  cashfreePaymentMethod?: string;
  paidAt?: string;
}

export interface SyncOrderPaymentResult {
  success: boolean;
  strategy: 'rpc' | 'direct_table';
  data?: unknown;
  error?: string;
}

export async function syncOrderPaymentStatusServer(
  params: SyncOrderPaymentParams
): Promise<SyncOrderPaymentResult> {
  const supabase = await getSupabaseAdmin();

  // Strategy 1: Call SECURITY DEFINER RPC
  try {
    const { data, error } = await supabase.rpc('update_order_payment_status', {
      p_order_id: params.orderId,
      p_status: params.status,
      p_cashfree_order_id: params.cashfreeOrderId ?? null,
      p_cashfree_payment_id: params.cashfreePaymentId ?? null,
      p_cashfree_payment_method: params.cashfreePaymentMethod ?? null,
      p_paid_at: params.paidAt ?? null,
    });

    if (!error && data && data.success !== false) {
      console.log(`[OrderPaymentSync] ✓ Updated order ${params.orderId} status to "${params.status}" via RPC`);
      return { success: true, strategy: 'rpc', data };
    }

    if (error) {
      console.warn(`[OrderPaymentSync] RPC attempt failed (${error.code || error.message}). Falling back to direct update...`);
    }
  } catch (rpcErr) {
    console.warn('[OrderPaymentSync] RPC call exception, attempting fallback:', rpcErr);
  }

  // Strategy 2: Direct table update fallback
  try {
    const updatePayload: Record<string, unknown> = {
      status: params.status,
      payment_gateway: 'cashfree',
      updated_at: new Date().toISOString(),
    };

    if (params.cashfreeOrderId) updatePayload.cashfree_order_id = params.cashfreeOrderId;
    if (params.cashfreePaymentId) updatePayload.cashfree_payment_id = params.cashfreePaymentId;
    if (params.cashfreePaymentMethod) updatePayload.cashfree_payment_method = params.cashfreePaymentMethod;
    if (params.paidAt) updatePayload.paid_at = params.paidAt;

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('order_id', params.orderId)
      .select();

    if (error) {
      console.error(`[OrderPaymentSync] Direct update failed:`, error.message);
      return { success: false, strategy: 'direct_table', error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn(
        `[OrderPaymentSync] Notice: 0 rows updated for order ${params.orderId}. ` +
        `This typically happens when Supabase RLS is blocking anonymous updates. ` +
        `Please execute migration 009 in your Supabase SQL Editor: supabase/migrations/009_update_order_payment_status_rpc.sql`
      );
    } else {
      console.log(`[OrderPaymentSync] ✓ Direct updated order ${params.orderId}`);
    }

    return { success: (data?.length ?? 0) > 0, strategy: 'direct_table', data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown database error';
    console.error(`[OrderPaymentSync] Exception:`, msg);
    return { success: false, strategy: 'direct_table', error: msg };
  }
}
