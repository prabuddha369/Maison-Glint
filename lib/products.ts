import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type { Product } from '../types/store';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'object-01-the-glint-plate',
    name: 'Object 01 — The Glint Plate',
    description:
      'Forged from surgical Grade 316L stainless steel, featuring undulating liquid perimeter geometry and high-refraction micro-buffed mirror chrome finish. Restricted atelier edition of 250 exemplars.',
    price: 680,
    currency: 'USD',
    images: [
      '/images/fig-01-table.png',
      '/images/fig-02-profile.png',
      '/images/scallops-macro.png',
    ],
    specifications: {
      gauge: '18-Gauge Surgical 316L Core',
      diameter: '280 mm (11.02 inches)',
      finish: 'Micro-Buff Mirror Chrome (>98% Refraction)',
      weight: '1,420 grams (Substantial Heavy Core)',
      origin: 'Atelier Zurich / Milan',
    },
    inStock: true,
    editionTotal: 250,
    editionRemaining: 34,
    createdAt: new Date().toISOString(),
  },
  // {
  //   id: 'object-02-fluid-coupe-pair',
  //   name: 'Object 02 — Fluid Coupe (Pair)',
  //   description:
  //     'A matched pair of monolithic steel stem coupes. Precision lathed with a mirror-polished interior bowl designed to accelerate chilled culinary vapor and wine bouquet.',
  //   price: 490,
  //   currency: 'USD',
  //   images: [
  //     '/images/dining-ritual.png',
  //     '/images/fig-01-table.png',
  //   ],
  //   specifications: {
  //     gauge: 'Seamless Solid Cold Lathe',
  //     diameter: '110 mm bowl / 165 mm height',
  //     finish: 'Dual Finish: Satin Stem / Mirror Bowl',
  //     weight: '480 grams each',
  //     origin: 'Atelier Zurich',
  //   },
  //   inStock: true,
  //   editionTotal: 150,
  //   editionRemaining: 18,
  //   createdAt: new Date().toISOString(),
  // },
  // {
  //   id: 'object-03-monolith-serving-knife',
  //   name: 'Object 03 — Monolith Serving Knife',
  //   description:
  //     'Unibody steel blade with micro-serrated beveled edge for ceremonial slicing. Balanced center of mass crafted to rest horizontally on table surfaces without touching blade to linen.',
  //   price: 340,
  //   currency: 'USD',
  //   images: [
  //     '/images/scallops-macro.png',
  //     '/images/fig-02-profile.png',
  //   ],
  //   specifications: {
  //     gauge: 'Forged 440C High-Carbon Stainless',
  //     diameter: '320 mm total length',
  //     finish: 'Vapour-Deposited Mirror Chrome',
  //     weight: '310 grams',
  //     origin: 'Solingen / Zurich Atelier',
  //   },
  //   inStock: true,
  //   editionTotal: 300,
  //   editionRemaining: 52,
  //   createdAt: new Date().toISOString(),
  // },
  // {
  //   id: 'object-04-sculpted-centro-vessel',
  //   name: 'Object 04 — Sculpted Centro Vessel',
  //   description:
  //     'Centerpiece parabolic steel vessel holding seasonal botanical or floral arrangements. Dynamic ambient curvature reflects changing gallery light throughout the day.',
  //   price: 820,
  //   currency: 'USD',
  //   images: [
  //     '/images/raw-elements.png',
  //     '/images/nocturne-setting.png',
  //   ],
  //   specifications: {
  //     gauge: 'Hand-Hammered Liquid Form Steel',
  //     diameter: '380 mm width / 140 mm depth',
  //     finish: 'Liquid Mirror Chrome',
  //     weight: '2,640 grams',
  //     origin: 'Zurich Atelier',
  //   },
  //   inStock: true,
  //   editionTotal: 100,
  //   editionRemaining: 12,
  //   createdAt: new Date().toISOString(),
  // },
];

const LOCAL_PRODUCTS_KEY = 'mg_local_products_cache';

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Local products read error', e);
  }
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Local products write error', e);
  }
}

/**
 * Fetch all products from Firestore with fallback to default seeded catalog
 */
export async function getProducts(): Promise<Product[]> {
  if (!db) {
    return getLocalProducts();
  }

  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Auto-seed if collection is pristine
      await seedDefaultProducts();
      return INITIAL_PRODUCTS;
    }
    const list: Product[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
    });
    saveLocalProducts(list);
    return list;
  } catch (error) {
    console.warn('[Maison Glint] Firestore fetch products failed, utilizing local fallback:', error);
    return getLocalProducts();
  }
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  if (!db) {
    return getLocalProducts().find((p) => p.id === id) || null;
  }

  const path = `products/${id}`;
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
    }
    return getLocalProducts().find((p) => p.id === id) || null;
  } catch (error) {
    console.warn('[Maison Glint] getProductById error, fallback:', error);
    return getLocalProducts().find((p) => p.id === id) || null;
  }
}

/**
 * Client-side seeder that initializes default items if collection is empty
 */
export async function seedDefaultProducts(): Promise<void> {
  if (!db) return;
  const path = 'products';
  try {
    for (const item of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', item.id), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log('[Maison Glint] Seeded default atelier products to Firestore.');
  } catch (error) {
    console.warn('[Maison Glint] Product seeder notice (safe fallback):', error);
  }
}

/**
 * Admin: Add or update a product
 */
export async function saveProduct(product: Product): Promise<void> {
  // Update local cache first
  const current = getLocalProducts();
  const index = current.findIndex((p) => p.id === product.id);
  let updated: Product[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = product;
  } else {
    updated = [product, ...current];
  }
  saveLocalProducts(updated);

  if (!db) return;
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), {
      ...product,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Admin: Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  const current = getLocalProducts().filter((p) => p.id !== productId);
  saveLocalProducts(current);

  if (!db) return;
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
