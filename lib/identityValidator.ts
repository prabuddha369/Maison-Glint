/**
 * Identity Validator Utility
 */

export interface IdentityValidationResult {
  valid: boolean;
  score?: number;
  reason?: string;
}

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
  validateIdentity,
};

export default identityValidator;

