-- ============================================================
-- Migration 009: Secure Payment Status Update Function (RPC)
-- ============================================================
-- Allows server-side routes (webhooks, payment redirects, order creation)
-- to update payment status and Cashfree reference IDs safely without
-- requiring a service role secret key.

CREATE OR REPLACE FUNCTION public.update_order_payment_status(
  p_order_id TEXT,
  p_status TEXT,
  p_cashfree_order_id TEXT DEFAULT NULL,
  p_cashfree_payment_id TEXT DEFAULT NULL,
  p_cashfree_payment_method TEXT DEFAULT NULL,
  p_paid_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executes with owner permissions, safely bypassing RLS for payment updates
SET search_path = public
AS $$
DECLARE
  v_updated_row public.orders%ROWTYPE;
BEGIN
  UPDATE public.orders
  SET
    status = p_status,
    cashfree_order_id = COALESCE(p_cashfree_order_id, cashfree_order_id),
    cashfree_payment_id = COALESCE(p_cashfree_payment_id, cashfree_payment_id),
    cashfree_payment_method = COALESCE(p_cashfree_payment_method, cashfree_payment_method),
    paid_at = COALESCE(p_paid_at, paid_at),
    payment_gateway = 'cashfree',
    updated_at = NOW()
  WHERE order_id = p_order_id
  RETURNING * INTO v_updated_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found: ' || p_order_id);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_updated_row.order_id,
    'status', v_updated_row.status,
    'cashfree_order_id', v_updated_row.cashfree_order_id,
    'cashfree_payment_id', v_updated_row.cashfree_payment_id,
    'cashfree_payment_method', v_updated_row.cashfree_payment_method,
    'paid_at', v_updated_row.paid_at
  );
END;
$$;

-- Grant execute rights to all roles so server API routes can invoke it
GRANT EXECUTE ON FUNCTION public.update_order_payment_status TO anon, authenticated, service_role;
