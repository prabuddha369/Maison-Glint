export interface ProductSpecifications {
  gauge?: string;
  diameter?: string;
  finish?: string;
  weight?: string;
  origin?: string;
  [key: string]: string | undefined;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt: string;
  role: 'catalog' | 'hero' | 'showcase' | 'ritual' | 'detail' | string;
  sortOrder: number;
}

export interface ProductHeroSlide {
  id?: string;
  imageUrl: string;
  alt: string;
  category: string;
  title: string;
  figureLabel: string;
  tabLabel: string;
  badge: string;
  sortOrder: number;
}

export interface ProductFeature {
  id?: string;
  label: string;
  description: string;
  sortOrder: number;
}

export interface ProductPanel {
  id?: string;
  title: string;
  body: string;
  sortOrder: number;
}

export interface ProductFinishPreset {
  id?: string;
  key: string;
  label: string;
  angle: number;
  roughness: string;
  dispersion: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface ProductSpecificationRow {
  id?: string;
  label: string;
  metric: string;
  imperial: string;
  sortOrder: number;
}

export interface ProductRitualItem {
  id?: string;
  label: string;
  sortOrder: number;
}

export interface ProductRitual {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  items: ProductRitualItem[];
  sortOrder: number;
}

export interface ProductEditorialContent {
  hero: {
    eyebrow: string;
    editionLabel: string;
    description: string;
    discoverLabel: string;
    reserveLabel: string;
    materialLabel: string;
    materialValue: string;
    craftLabel: string;
    craftValue: string;
    editionLabelMeta: string;
    editionValue: string;
    slides: ProductHeroSlide[];
  };
  showcase: {
    sectionLabel: string;
    title: string;
    titleEmphasis: string;
    description: string;
    finishBadge: string;
    statusLabel: string;
    statusDescription: string;
    provenanceLabel: string;
    monographLabel: string;
    acquireLabel: string;
    priorityLabel: string;
    features: ProductFeature[];
    panels: ProductPanel[];
  };
  finish: {
    sectionLabel: string;
    title: string;
    titleEmphasis: string;
    paragraphs: string[];
    presetLabel: string;
    spectrumLabel: string;
    roughnessLabel: string;
    presets: ProductFinishPreset[];
  };
  specifications: {
    sectionLabel: string;
    title: string;
    titleEmphasis: string;
    description: string;
    metricToggleLabel: string;
    imperialToggleLabel: string;
    serialStamp: string;
    archiveLabel: string;
    rows: ProductSpecificationRow[];
  };
  table: {
    sectionLabel: string;
    title: string;
    titleEmphasis: string;
    description: string;
    rituals: ProductRitual[];
  };
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
  editionReserved?: number;
  createdAt?: string;
  editorial?: ProductEditorialContent;
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

export type OrderStatus = 'pending_payment' | 'paid' | 'payment_failed' | 'payment_pending' | 'processing' | 'shipped' | 'cancelled';

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
  // Cashfree-specific payment tracking
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  cashfreePaymentMethod?: string;
  paidAt?: string;
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
  savedAddresses?: ShippingAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export type ReservationStatus =
  | 'allocated'
  | 'pending_verification'
  | 'waitlist'
  | 'converted_to_order'
  | 'deallocated'
  | 'cancelled';

export interface Reservation {
  id: string;
  userId?: string | null;
  productId: string;
  productName?: string;
  serialNumber: string;
  serialIndex: number;
  collectorName: string;
  collectorEmail: string;
  destination: string;
  ritual: string;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isSubscribed: boolean;
  source: string;
  createdAt: string;
  unsubscribedAt?: string | null;
}


