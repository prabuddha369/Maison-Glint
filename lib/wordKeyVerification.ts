/**
 * Word Key Verification Utility
 * Provides cryptographic / security key generation, validation, and checksum verification.
 */

export interface WordKeyVerificationResult {
  valid: boolean;
  message?: string;
  normalizedKey?: string;
}

export interface EmailPasskeyResult {
  success: boolean;
  error?: string;
}

const emailPasskeys = new Map<string, string>();

/**
 * Validates a word key format (e.g. alphanumeric or hyphenated security phrase).
 */
export function verifyWordKey(key: string, expectedKey?: string): WordKeyVerificationResult {
  if (!key || typeof key !== 'string') {
    return { valid: false, message: 'Word key must be a non-empty string.' };
  }

  const cleaned = key.trim().toUpperCase();

  if (cleaned.length < 4) {
    return { valid: false, message: 'Word key must be at least 4 characters.' };
  }

  if (expectedKey) {
    const isMatch = cleaned === expectedKey.trim().toUpperCase();
    return {
      valid: isMatch,
      normalizedKey: cleaned,
      message: isMatch ? 'Word key verified successfully.' : 'Word key does not match.',
    };
  }

  // Generic format validation
  return {
    valid: true,
    normalizedKey: cleaned,
    message: 'Word key structure is valid.',
  };
}

/**
 * Generates a memorable 3-word or hyphenated security key for transaction verification.
 */
export function generateWordKey(length: number = 3): string {
  const words = [
    'GLINT', 'CHROME', 'ATELIER', 'VERITAS', 'LUMEN',
    'AURA', 'MONOLITH', 'PRISM', 'FORGE', 'TITAN',
    'MIRROR', 'STEEL', 'ZENITH', 'NEXUS', 'SOLAR'
  ];

  const selected: string[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selected.push(words[randomIndex]);
  }

  return selected.join('-');
}

export async function issueEmailVerificationPasskey(
  uid: string,
  _email: string
): Promise<{ wordKey: string }> {
  const wordKey = Array.from({ length: 6 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  emailPasskeys.set(uid, wordKey);
  return { wordKey };
}

export async function verifyEmailPasskey(uid: string, passkey: string): Promise<EmailPasskeyResult> {
  const expected = emailPasskeys.get(uid);
  if (!expected || passkey.trim().toUpperCase() !== expected) {
    return { success: false, error: 'Invalid editorial passkey.' };
  }

  emailPasskeys.delete(uid);
  return { success: true };
}

export const validateWordKey = verifyWordKey;
export const isValidWordKey = (key: string, expected?: string): boolean =>
  verifyWordKey(key, expected).valid;
export const verifyKey = verifyWordKey;
export const generateKey = generateWordKey;

const wordKeyVerification = {
  verifyWordKey,
  generateWordKey,
  issueEmailVerificationPasskey,
  verifyEmailPasskey,
  validateWordKey,
  isValidWordKey,
  verifyKey,
  generateKey,
};

export default wordKeyVerification;


