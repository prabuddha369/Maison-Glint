import { useState, useEffect, useCallback } from 'react';
import { getProducts, getProductById, INITIAL_PRODUCTS } from './products';
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
    return INITIAL_PRODUCTS;
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

  return all[0] || INITIAL_PRODUCTS[0] || null;
}

/**
 * React hook to access dynamic active products with state and refetch
 */
export function useCatalog() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(false);
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
          if (activeList.length > 0) {
            setProducts(activeList);
          }
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load catalog');
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
  const initial = INITIAL_PRODUCTS.find(
    (p) => p.id === idOrPrefix || p.id.startsWith(idOrPrefix) || p.name.toLowerCase().includes(idOrPrefix.toLowerCase())
  ) || INITIAL_PRODUCTS[0] || null;

  const [product, setProduct] = useState<Product | null>(initial);
  const [loading, setLoading] = useState<boolean>(false);
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
          if (found) {
            setProduct(found);
          }
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Product load error');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [idOrPrefix, version]);

  return { product, loading, error, refresh };
}
