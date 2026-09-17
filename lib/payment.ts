import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type { Order, OrderStatus, CartItem, CustomerInfo, ShippingAddress } from '../types/store';

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
 * Isolated modular placeholder callback function for external payment gateways
 * Inputs & outputs strictly typed for seamless future drop-in
 */
export async function processPaymentGateway(
  input: PaymentGatewayInput
): Promise<PaymentGatewayOutput> {
  // =========================================================================
  // TODO: INTEGRATE SELECTED PAYMENT GATEWAY (Stripe / Razorpay / Cashfree)
  //
  // Example for Stripe:
  // const session = await fetch('/api/stripe/checkout-session', {
  //   method: 'POST',
  //   body: JSON.stringify({ orderId: input.orderId, amount: input.amount }),
  // }).then(res => res.json());
  // return { success: true, redirectUrl: session.url, paymentStatus: 'pending' };
  //
  // Example for Razorpay:
  // const rzpOrder = await createRazorpayOrder({ amount: input.amount, currency: input.currency });
  // =========================================================================

  // In Spark Free Tier client mode, we safely record the order as pending_payment
  console.log(
    `[Maison Glint Gateway] Order ${input.orderReference} staged for payment gateway handoff:`,
    input
  );

  return {
    success: true,
    gatewayTransactionId: `TXN-STUB-${Date.now()}`,
    paymentStatus: 'pending',
    message: 'Order recorded with status pending_payment. Ready for gateway connection.',
  };
}

/**
 * Orchestrate complete order capture in Firestore and trigger payment abstraction
 */
export async function createStorefrontOrder(payload: CreateOrderPayload): Promise<Order> {
  const orderId = generateOrderReference();
  const timestamp = new Date().toISOString();

  const newOrder: Order = {
    orderId,
    userId: payload.userId,
    customer: payload.customer,
    shippingAddress: payload.shippingAddress,
    shippingMethod: payload.shippingMethod,
    items: payload.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      specifications: item.specifications,
    })),
    subtotal: payload.subtotal,
    shippingCost: payload.shippingCost,
    taxEstimate: payload.taxEstimate,
    total: payload.total,
    currency: payload.currency || 'USD',
    status: 'pending_payment',
    paymentGateway: 'pending_selection',
    notes: payload.notes || '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // Always retain order in local cache for offline resiliency
  saveLocalOrder(newOrder);

  // Persist into Firestore collection 'orders'
  if (db) {
    const path = `orders/${orderId}`;
    try {
      await setDoc(doc(db, 'orders', orderId), {
        ...newOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`[Maison Glint] Order ${orderId} successfully captured in Firestore.`);
    } catch (error) {
      console.warn('[Maison Glint] Order Firestore write error, local fallback maintained:', error);
      // Non-blocking: local order cache preserves checkout continuity
    }
  }

  // Trigger payment gateway orchestrator
  await processPaymentGateway({
    orderId,
    orderReference: orderId,
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

  if (!db) {
    return localMatch || null;
  }

  const path = `orders/${orderId}`;
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (snap.exists()) {
      return snap.data() as Order;
    }
    return localMatch || null;
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

  if (!db) {
    return localOrders;
  }

  const path = 'orders';
  try {
    // ABAC query compliant with security rules
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const list: Order[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Order);
    });

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

  if (!db) {
    return localOrders;
  }

  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, path));
    const list: Order[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Order);
    });

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

  if (!db) return;
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
