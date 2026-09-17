/**
 * Maison Glint Identity & Input Sanitation Engine
 * Enforces strict alphabetic minimum 2-word names and RFC-compliant, non-throwaway email addresses.
 */

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'trashmail.com',
  'fakeinbox.com',
  'maildrop.cc',
  'inboxkitten.com',
  'temp-mail.org',
  'burnermail.io',
  'mytemp.email',
  'generator.email',
  'mohmal.com',
  'crazymailing.com',
  'nada.ltd',
]);

const FORBIDDEN_TEST_NAMES = new Set([
  'test',
  'dummy',
  'fake',
  'admin',
  'asdf',
  'sample',
  'user',
  'qwerty',
  'first last',
  'john doe',
  'jane doe',
  'test test',
  'foo bar',
]);

export interface NameValidationResult {
  valid: boolean;
  error?: string;
  firstName?: string;
  lastName?: string;
}

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validates Full Name:
 * - Minimum 2 words
 * - Strict alphabetic characters (with standard hyphens, apostrophes, accents)
 * - Rejects numeric strings, single words, and obvious placeholder/test strings
 */
export function validateFullName(rawName: string): NameValidationResult {
  if (!rawName || typeof rawName !== 'string') {
    return { valid: false, error: 'Full legal name is required for edition certification.' };
  }

  const cleaned = rawName.trim().replace(/\s+/g, ' ');

  if (cleaned.length < 3 || cleaned.length > 100) {
    return { valid: false, error: 'Full name must be between 3 and 100 characters.' };
  }

  // Reject digits or illegal punctuation symbols
  if (/\d/.test(cleaned)) {
    return { valid: false, error: 'Numerical characters are not permitted in legal customer names.' };
  }

  // Strict alphabetic check (allows letters from all languages, apostrophes, and hyphens)
  const alphabeticRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F]+(?:[' -][a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F]+)+$/;
  if (!alphabeticRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Please provide a valid first and last name (alphabetical characters only).',
    };
  }

  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length < 2) {
    return { valid: false, error: 'Both first and last names are mandatory for ownership registration.' };
  }

  const normalizedLower = cleaned.toLowerCase();
  for (const forbidden of FORBIDDEN_TEST_NAMES) {
    if (normalizedLower === forbidden || parts.every((p) => p.toLowerCase() === forbidden)) {
      return {
        valid: false,
        error: 'Demonstration and generic test names cannot be utilized for serialized registration.',
      };
    }
  }

  const firstName = toTitleCase(parts[0]);
  const lastName = toTitleCase(parts.slice(1).join(' '));

  return {
    valid: true,
    firstName,
    lastName,
  };
}

/**
 * Validates Email:
 * - RFC 5322 regex conformance
 * - Disallows disposable / throwaway email providers
 */
export function validateEmail(rawEmail: string): EmailValidationResult {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }

  const cleaned = rawEmail.trim().toLowerCase();

  // RFC standard compliant regex
  const rfcEmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!rfcEmailRegex.test(cleaned)) {
    return { valid: false, error: 'Enter a valid RFC-conforming email address format.' };
  }

  const domain = cleaned.split('@')[1];
  if (!domain || DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: 'Disposable and ephemeral email domains are restricted from atelier allocations.',
    };
  }

  return { valid: true };
}

/**
 * Cross-checks full name against the local-part of the email
 * e.g., if email is john.smith@gmail.com and full name is "John Smith",
 * aligns formatting cleanly.
 */
export function harmonizeIdentityData(
  fullName: string,
  email: string
): { firstName: string; lastName: string; formattedFullName: string } {
  const nameRes = validateFullName(fullName);
  let firstName = nameRes.firstName || '';
  let lastName = nameRes.lastName || '';

  if (!firstName || !lastName) {
    const parts = fullName.trim().split(' ').filter(Boolean);
    firstName = toTitleCase(parts[0] || 'Collector');
    lastName = toTitleCase(parts.slice(1).join(' ') || 'Client');
  }

  // Cross check if local-part has dot-separated name e.g. "alex.vance"
  const localPart = email.split('@')[0] || '';
  if (localPart.includes('.')) {
    const [localFirst, ...localRest] = localPart.split('.');
    const localLast = localRest.join(' ');
    if (
      firstName.toLowerCase() === localFirst.toLowerCase() &&
      lastName.toLowerCase() === localLast.toLowerCase()
    ) {
      firstName = toTitleCase(localFirst);
      lastName = toTitleCase(localLast);
    }
  }

  return {
    firstName,
    lastName,
    formattedFullName: `${firstName} ${lastName}`.trim(),
  };
}
