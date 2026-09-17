/**
 * Identity Validator Utility
 */

export interface IdentityValidationResult {
  valid: boolean;
  score?: number;
  reason?: string;
}

/**
 * Validates recipient full name (minimum 2 characters).
 */
export function validateFullName(name?: string | null): boolean {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2;
}

/**
 * Validates email address syntax.
 */
export function validateEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates phone number syntax.
 */
export function validatePhone(phone?: string | null): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export const isValidFullName = validateFullName;
export const isValidEmail = validateEmail;
export const isValidPhone = validatePhone;

/**
 * Validates identity profile information.
 */
export function validateIdentity(profile: {
  fullName?: string;
  email?: string;
  phone?: string;
}): IdentityValidationResult {
  if (!profile.email || !profile.email.includes('@')) {
    return { valid: false, reason: 'Valid email required for identity tier.' };
  }

  if (!profile.fullName || profile.fullName.trim().length < 2) {
    return { valid: false, reason: 'Full legal name required.' };
  }

  return {
    valid: true,
    score: 1.0,
    reason: 'Identity credentials verified.',
  };
}

const identityValidator = {
  validateFullName,
  validateEmail,
  validatePhone,
  isValidFullName,
  isValidEmail,
  isValidPhone,
  validateIdentity,
};

export default identityValidator;


