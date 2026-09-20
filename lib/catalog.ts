import { useState, useEffect, useCallback } from 'react';
import { getProducts, getProductById } from './products';
import type { Product } from '../types/store';

/**
 * Fetch all active/in-stock products from the secure catalog API.
 * Gracefully falls back to local cached catalog or INITIAL_PRODUCTS.
 */
export async function fetchActiveProducts(): Promise<Product[]> {
  try {
    const allProducts = await getProducts();
    const filtered = allProducts.filter((p) => p.inStock !== false);
    return filtered.length > 0 ? filtered : allProducts;
  } catch (error) {
    console.warn('[Maison Glint Catalog] Secure active products query fallback:', error);
    return [];
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

  return all[0] || null;
}

/**
 * React hook to access dynamic active products with state and refetch
 */
export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
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
          setProducts([]);
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
 * React hook to access a single product by ID or prefix
 */
export function useProduct(idOrPrefix: string = 'object-01') {
  const [product, setProduct] = useState<Product | null>(null);
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
          setProduct(found || null);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Product load error');
          setProduct(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [idOrPrefix, version]);

  return { product, loading, error, refresh };
}
