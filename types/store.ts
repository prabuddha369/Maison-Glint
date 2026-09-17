export interface ProductSpecifications {
  gauge?: string;
  diameter?: string;
  finish?: string;
  weight?: string;
  origin?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD' | 'INR' | 'GBP' | string;
  images: string[];
  specifications: ProductSpecifications;
  inStock: boolean;
  editionTotal?: number;
  editionRemaining?: number;
  createdAt?: string;
}

export interface CartItem {
  id: string; // product id or line item id
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image: string;
  specifications?: ProductSpecifications;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CustomerInfo {
  email: string;
  fullName: string;
  phone?: string;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  specifications?: ProductSpecifications;
}

export interface OrderVerificationMetadata {
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  addressValidatedVia?: 'OlaMaps' | 'StandardPostalVerification' | 'ManualAcknowledgement';
  addressStatus?: 'validated' | 'acknowledged';
  normalizedPhone?: string;
  passkeyUsed?: string;
}

export interface Order {
  orderId: string;
  userId: string | null;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  shippingMethod: {
    id: string;
    title: string;
    cost: number;
    estimatedDelivery: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxEstimate: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentGateway: string;
  verificationMetadata?: OrderVerificationMetadata;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  savedAddresses?: ShippingAddress[];
  createdAt?: string;
  updatedAt?: string;
}
