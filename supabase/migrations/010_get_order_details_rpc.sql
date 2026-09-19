-- ============================================================
-- Migration 010: Order Retrieval & Rich Payment Sync RPC
-- ============================================================
-- 1. Provides public.get_order_for_email(p_order_id) to safely fetch order details
--    for transactional confirmation emails under RLS without exposing sensitive data.
-- 2. Enhances public.update_order_payment_status to return full order metadata
--    (customer, items, shipping, amounts) directly upon status change.

CREATE OR REPLACE FUNCTION public.get_order_for_email(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.orders%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.orders WHERE order_id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found: ' || p_order_id);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_row.order_id,
    'status', v_row.status,
    'customer', v_row.customer,
    'shipping_address', v_row.shipping_address,
    'shipping_method', v_row.shipping_method,
    'items', v_row.items,
    'subtotal', v_row.subtotal,
    'shipping_cost', v_row.shipping_cost,
    'tax_estimate', v_row.tax_estimate,
    'total', v_row.total,
    'currency', v_row.currency,
    'cashfree_payment_method', v_row.cashfree_payment_method,
    'cashfree_payment_id', v_row.cashfree_payment_id,
    'cashfree_order_id', v_row.cashfree_order_id,
    'paid_at', v_row.paid_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_for_email TO anon, authenticated, service_role;

-- Also update update_order_payment_status to return full order fields
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
SECURITY DEFINER
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
    'paid_at', v_updated_row.paid_at,
    'customer', v_updated_row.customer,
    'shipping_address', v_updated_row.shipping_address,
    'shipping_method', v_updated_row.shipping_method,
    'items', v_updated_row.items,
    'subtotal', v_updated_row.subtotal,
    'shipping_cost', v_updated_row.shipping_cost,
    'tax_estimate', v_updated_row.tax_estimate,
    'total', v_updated_row.total,
    'currency', v_updated_row.currency
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_order_payment_status TO anon, authenticated, service_role;
