/**
 * lib/currency.ts
 *
 * Real-time Foreign Exchange (FX) service for Maison Glint.
 * Resolves live mid-market USD to INR rates for cross-border transactional clearing.
 */

interface CacheEntry {
  rate: number;
  expiresAt: number;
}

// In-memory cache with 1-hour TTL
let cachedRate: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch the real-time USD to INR mid-market exchange rate.
 * Primary source: open.er-api.com
 * Secondary fallback: api.frankfurter.app
 * Static fallback: process.env.USD_TO_INR_FALLBACK_RATE || 86.5
 */
export async function getUsdToInrRate(): Promise<number> {
  const now = Date.now();
  if (cachedRate && cachedRate.expiresAt > now) {
    return cachedRate.rate;
  }

  const fallback = Number(process.env.USD_TO_INR_FALLBACK_RATE || 86.5);

  // 1. Primary FX Provider
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const inr = data?.rates?.INR;
      if (typeof inr === 'number' && inr > 50 && inr < 150) {
        cachedRate = { rate: inr, expiresAt: now + CACHE_TTL_MS };
        return inr;
      }
    }
  } catch (err) {
    console.warn('[Currency] Primary FX provider error, attempting backup:', err);
  }

  // 2. Secondary FX Provider (Frankfurter / ECB)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR', {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const inr = data?.rates?.INR;
      if (typeof inr === 'number' && inr > 50 && inr < 150) {
        cachedRate = { rate: inr, expiresAt: now + CACHE_TTL_MS };
        return inr;
      }
    }
  } catch (err) {
    console.warn('[Currency] Secondary FX provider error:', err);
  }

  // 3. Fallback Parity Rate
  console.info(`[Currency] Using configured fallback rate: 1 USD = ${fallback} INR`);
  return fallback;
}

/**
 * Convert a USD amount to INR using either a provided rate or the live rate.
 */
export async function convertUsdToInr(
  usdAmount: number,
  customRate?: number
): Promise<{
  usdAmount: number;
  inrAmount: number;
  exchangeRate: number;
  formattedInr: string;
}> {
  const rate = customRate || (await getUsdToInrRate());
  // Round to nearest whole rupee or 2 decimal places as preferred by Indian payment processors
  const inrAmount = Math.round(usdAmount * rate * 100) / 100;
  const formattedInr = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inrAmount);

  return {
    usdAmount,
    inrAmount,
    exchangeRate: Number(rate.toFixed(4)),
    formattedInr,
  };
}
