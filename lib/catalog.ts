import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { INITIAL_PRODUCTS, getProducts, getProductById } from './products';
import type { Product } from '../types/store';

/**
 * Fetch all active/in-stock products from Firestore catalog
 * Gracefully falls back to local cached catalog or INITIAL_PRODUCTS
 */
export async function fetchActiveProducts(): Promise<Product[]> {
  if (!db) {
    return INITIAL_PRODUCTS.filter((p) => p.inStock);
  }

  try {
    const productsRef = collection(db, 'products');
    // Attempt Firestore query for active inventory
    const q = query(productsRef, where('inStock', '==', true));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const activeList: Product[] = [];
      snap.forEach((docSnap) => {
        activeList.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
      });
      return activeList;
    }

    // If query returns empty (e.g. initial launch or unset flags), check all products
    const allProducts = await getProducts();
    const filtered = allProducts.filter((p) => p.inStock !== false);
    return filtered.length > 0 ? filtered : INITIAL_PRODUCTS;
  } catch (error) {
    console.warn('[Maison Glint Catalog] Firestore active products query fallback:', error);
    const all = await getProducts();
    return all.length > 0 ? all : INITIAL_PRODUCTS;
  }
}

/**
 * Fetch a single product by exact ID or prefix identifier (e.g. 'object-01')
 */
export async function fetchProductByIdOrPrefix(idOrPrefix: string): Promise<Product | null> {
  // First try direct lookup
  const direct = await getProductById(idOrPrefix);
  if (direct) return direct;

  // Next search catalog for prefix match (e.g. 'object-01' -> 'object-01-the-glint-plate')
  const all = await getProducts();
  const matched = all.find(
    (p) => p.id === idOrPrefix || p.id.startsWith(idOrPrefix) || p.name.toLowerCase().includes(idOrPrefix.toLowerCase())
  );

  if (matched) return matched;

  // Fallback to INITIAL_PRODUCTS
  const initialMatch = INITIAL_PRODUCTS.find(
    (p) => p.id === idOrPrefix || p.id.startsWith(idOrPrefix) || p.name.toLowerCase().includes(idOrPrefix.toLowerCase())
  );
  return initialMatch || INITIAL_PRODUCTS[0];
}

/**
 * React hook to access dynamic active products from Firestore with state and refetch
 */
export function useCatalog() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let active = true;
    fetchActiveProducts()
      .then((activeList) => {
        if (active) {
          setProducts(activeList);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load catalog');
          setProducts(INITIAL_PRODUCTS);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [version]);

  return { products, loading, error, refresh };
}

/**
 * React hook to access a single product from Firestore by ID or prefix
 */
export function useProduct(idOrPrefix: string = 'object-01') {
  const [product, setProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let active = true;
    fetchProductByIdOrPrefix(idOrPrefix)
      .then((found) => {
        if (active) {
          setProduct(found || INITIAL_PRODUCTS[0]);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Product load error');
          setProduct(INITIAL_PRODUCTS[0]);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [idOrPrefix, version]);

  return { product, loading, error, refresh };
}
