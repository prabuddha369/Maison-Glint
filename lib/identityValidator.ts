/**
 * Identity Validator Utility
 */

export interface IdentityValidationResult {
  valid: boolean;
  score?: number;
  reason?: string;
}

export interface FieldValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates recipient full name (minimum 2 characters).
 */
export function validateFullName(name?: string | null): FieldValidationResult {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, error: 'Full legal name is required.' };
  }
  return { valid: true };
}

/**
 * Validates email address syntax.
 */
export function validateEmail(email?: string | null): FieldValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim())
    ? { valid: true }
    : { valid: false, error: 'Invalid email format.' };
}

/**
 * Validates phone number syntax.
 */
export function validatePhone(phone?: string | null): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export const isValidFullName = (name?: string | null): boolean => validateFullName(name).valid;
export const isValidEmail = (email?: string | null): boolean => validateEmail(email).valid;
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


