import type {
  Order,
  OrderStatus,
  CartItem,
  CustomerInfo,
  ShippingAddress,
  OrderVerificationMetadata,
} from '../types/store';
import { getSupabaseBrowser } from './supabase/client';

export interface CreateOrderPayload {
  userId: string | null;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  shippingMethod: {
    id: string;
    title: string;
    cost: number;
    estimatedDelivery: string;
  };
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  taxEstimate: number;
  total: number;
  currency?: string;
  notes?: string;
  verificationMetadata?: OrderVerificationMetadata;
}

export interface PaymentGatewayInput {
  orderId: string;
  orderReference: string;
  amount: number;
  currency: string;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  gatewayProvider?: 'stripe' | 'razorpay' | 'cashfree' | 'pending_selection';
}

export interface PaymentGatewayOutput {
  success: boolean;
  gatewayTransactionId?: string;
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed';
  redirectUrl?: string;
  message?: string;
}

const LOCAL_ORDERS_KEY = 'mg_local_orders_archive';

function saveLocalOrder(order: Order) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalOrders();
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([order, ...existing]));
  } catch (e) {
    console.warn('Local order storage notice:', e);
  }
}

export function updateLocalOrder(orderId: string, updates: Partial<Order>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalOrders();
    const updated = existing.map((o) => (o.orderId === orderId ? { ...o, ...updates } : o));
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local order update notice:', e);
  }
}

export function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Local order read notice:', e);
    return [];
  }
}

/**
 * Generate cryptographic-like luxury atelier order identifier (e.g. MG-ORD-92841)
 */
export function generateOrderReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MG-ORD-${randomPart}`;
}

/**
 * Isolated modular payment gateway handler.
 * For Cashfree: This is now superseded by /api/payment/create-order route.
 * Kept as a typed stub for admin/manual order override workflows.
 */
export async function processPaymentGateway(
  input: PaymentGatewayInput
): Promise<PaymentGatewayOutput> {
  console.log(
    `[Maison Glint Gateway] Order ${input.orderReference} staged for Cashfree handoff:`,
    { orderId: input.orderId, amount: input.amount, currency: input.currency }
  );

  return {
    success: true,
    gatewayTransactionId: undefined,
    paymentStatus: 'pending',
    message: 'Order created. Cashfree payment session will be initiated on client.',
  };
}

/**
 * Orchestrate complete order capture through the secure order API and trigger payment abstraction
 */
export async function createStorefrontOrder(payload: CreateOrderPayload): Promise<Order> {
  const orderId = generateOrderReference();
  const timestamp = new Date().toISOString();
  const newOrder: Order = {
    orderId, userId: payload.userId, customer: payload.customer, shippingAddress: payload.shippingAddress,
    shippingMethod: payload.shippingMethod, items: payload.items.map((item) => ({
      productId: item.productId, name: item.name, price: item.price, quantity: item.quantity, image: item.image, specifications: item.specifications,
    })), subtotal: payload.subtotal, shippingCost: payload.shippingCost, taxEstimate: payload.taxEstimate,
    total: payload.total, currency: payload.currency || 'USD', status: 'pending_payment', paymentGateway: 'pending_selection',
    verificationMetadata: payload.verificationMetadata, notes: payload.notes || '', createdAt: timestamp, updatedAt: timestamp,
  };
  const { error } = await getSupabaseBrowser().from('orders').insert({
    order_id: newOrder.orderId, user_id: newOrder.userId, customer: newOrder.customer,
    shipping_address: newOrder.shippingAddress, shipping_method: newOrder.shippingMethod, items: newOrder.items,
    subtotal: newOrder.subtotal, shipping_cost: newOrder.shippingCost, tax_estimate: newOrder.taxEstimate,
    total: newOrder.total, currency: newOrder.currency, status: newOrder.status, payment_gateway: newOrder.paymentGateway,
    verification_metadata: newOrder.verificationMetadata, notes: newOrder.notes,
  });
  if (error) throw error;
  saveLocalOrder(newOrder);

  // Trigger payment gateway orchestrator
  await processPaymentGateway({
    orderId: newOrder.orderId,
    orderReference: newOrder.orderId,
    amount: newOrder.total,
    currency: newOrder.currency,
    customer: newOrder.customer,
    shippingAddress: newOrder.shippingAddress,
    gatewayProvider: 'pending_selection',
  });

  return newOrder;
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  // First check local orders
  const localMatch = getLocalOrders().find((o) => o.orderId === orderId);

  try {
    const { data, error } = await getSupabaseBrowser().from('orders').select('*').eq('order_id', orderId).maybeSingle();
    if (error || !data) return localMatch || null;
    return fromOrderRow(data);
  } catch (error) {
    console.warn('[Maison Glint] getOrderById error, local fallback used:', error);
    return localMatch || null;
  }
}

/**
 * Customer Portal: Fetch user order history
 */
export async function getOrdersByUser(userId: string, email?: string): Promise<Order[]> {
  const localOrders = getLocalOrders().filter(
    (o) => (userId && o.userId === userId) || (email && o.customer.email.toLowerCase() === email.toLowerCase())
  );

  try {
    const { data, error } = await getSupabaseBrowser().from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return localOrders;
    const list = (data || []).map(fromOrderRow);

    // Merge with any local orders not yet synced
    const ids = new Set(list.map((o) => o.orderId));
    for (const local of localOrders) {
      if (!ids.has(local.orderId)) {
        list.push(local);
      }
    }
    return list;
  } catch (error) {
    console.warn('[Maison Glint] getOrdersByUser error, fallback to local:', error);
    return localOrders;
  }
}

/**
 * Admin: Fetch all captured atelier orders
 */
export async function getAllOrders(): Promise<Order[]> {
  const localOrders = getLocalOrders();
  try {
    const { data, error } = await getSupabaseBrowser().from('orders').select('*').order('created_at', { ascending: false });
    if (error) return localOrders;
    const list = (data || []).map(fromOrderRow);

    // Merge with local orders
    const ids = new Set(list.map((o) => o.orderId));
    for (const local of localOrders) {
      if (!ids.has(local.orderId)) {
        list.push(local);
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('[Maison Glint] getAllOrders error, fallback to local:', error);
    return localOrders;
  }
}

/**
 * Admin: Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  // Update local cache
  if (typeof window !== 'undefined') {
    const current = getLocalOrders();
    const updated = current.map((o) => (o.orderId === orderId ? { ...o, status } : o));
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  }

  try {
    const { error } = await getSupabaseBrowser().from('orders').update({ status }).eq('order_id', orderId);
    if (error) throw error;
  } catch (error) {
    throw error;
  }
}

function fromOrderRow(item: Record<string, unknown>): Order {
  return {
    orderId: String(item.order_id), userId: String(item.user_id), customer: item.customer as Order['customer'],
    shippingAddress: item.shipping_address as Order['shippingAddress'], shippingMethod: item.shipping_method as Order['shippingMethod'],
    items: item.items as Order['items'], subtotal: Number(item.subtotal), shippingCost: Number(item.shipping_cost),
    taxEstimate: Number(item.tax_estimate), total: Number(item.total), currency: String(item.currency), status: item.status as OrderStatus,
    paymentGateway: String(item.payment_gateway),
    cashfreeOrderId: item.cashfree_order_id ? String(item.cashfree_order_id) : undefined,
    cashfreePaymentId: item.cashfree_payment_id ? String(item.cashfree_payment_id) : undefined,
    cashfreePaymentMethod: item.cashfree_payment_method ? String(item.cashfree_payment_method) : undefined,
    paidAt: item.paid_at ? String(item.paid_at) : undefined,
    verificationMetadata: item.verification_metadata as Order['verificationMetadata'],
    notes: String(item.notes || ''), createdAt: String(item.created_at), updatedAt: item.updated_at ? String(item.updated_at) : undefined,
  };
}
