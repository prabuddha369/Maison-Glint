-- ============================================================
-- Migration 008: Add Cashfree payment tracking fields to orders
-- ============================================================

-- Add Cashfree-specific columns to the orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cashfree_order_id TEXT,
  ADD COLUMN IF NOT EXISTS cashfree_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS cashfree_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Update the status check constraint to include new payment states
-- First drop the old constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_status_check'
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
  END IF;
END $$;

-- Add updated constraint with all valid statuses including payment states
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending_payment',
    'payment_pending',
    'payment_failed',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ));

-- Add index on cashfree_order_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_cashfree_order_id
  ON public.orders (cashfree_order_id)
  WHERE cashfree_order_id IS NOT NULL;

-- Add index on status for admin order management
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders (status);

COMMENT ON COLUMN public.orders.cashfree_order_id IS 'Cashfree PG order ID (cf_order_id)';
COMMENT ON COLUMN public.orders.cashfree_payment_id IS 'Cashfree payment ID (cf_payment_id) from webhook callback';
COMMENT ON COLUMN public.orders.cashfree_payment_method IS 'Payment method used (e.g. card, upi, netbanking)';
COMMENT ON COLUMN public.orders.paid_at IS 'Timestamp when payment was confirmed by Cashfree webhook';
