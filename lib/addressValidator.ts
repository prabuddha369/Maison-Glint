/**
 * Address Validation Utility
 * Supports client-side structural validation and optional backend API geocoding verification.
 */

import type { ShippingAddress } from '../types/store';

export interface AddressValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  formattedAddress?: string;
  source?: string;
}

/**
 * Validates shipping address fields.
 */
export function validateAddress(address: Partial<ShippingAddress>): AddressValidationResult {
  const errors: Record<string, string> = {};

  if (!address.fullName || address.fullName.trim().length < 2) {
    errors.fullName = 'Recipient name is required.';
  }

  if (!address.line1 || address.line1.trim().length < 4) {
    errors.line1 = 'Street address is required.';
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.city = 'City is required.';
  }

  if (!address.postalCode || address.postalCode.trim().length < 3) {
    errors.postalCode = 'Valid postal / ZIP code is required.';
  }

  if (!address.country || address.country.trim().length < 2) {
    errors.country = 'Country selection is required.';
  }

  const isValid = Object.keys(errors).length === 0;

  const formattedAddress = isValid
    ? [
        address.line1,
        address.line2,
        `${address.city}, ${address.state || ''} ${address.postalCode}`.trim(),
        address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : undefined;

  return {
    isValid,
    errors,
    formattedAddress,
    source: 'client_validation',
  };
}

/**
 * Asynchronously verifies postal code with backend validation route.
 */
export async function verifyAddressWithApi(
  address: Partial<ShippingAddress>
): Promise<{ valid: boolean; message?: string }> {
  try {
    const res = await fetch('/api/address/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postalCode: address.postalCode,
        country: address.country,
        state: address.state,
        city: address.city,
      }),
    });

    if (!res.ok) {
      return { valid: true, message: 'Fallback validation accepted.' };
    }

    const data = await res.json();
    return { valid: Boolean(data.valid), message: data.message };
  } catch {
    return { valid: true, message: 'Offline validation accepted.' };
  }
}

const addressValidator = {
  validateAddress,
  verifyAddressWithApi,
};

export default addressValidator;

