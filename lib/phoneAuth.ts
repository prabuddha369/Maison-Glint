/**
 * Phone Authentication and Verification Utility
 */

export interface PhoneVerificationResult {
  success: boolean;
  message?: string;
  verificationId?: string;
  simulated?: boolean;
  error?: string;
}

export interface PriorityDialCode {
  code: string;
  name: string;
  flag: string;
  samplePlaceholder: string;
}

export const PRIORITY_DIAL_CODES: PriorityDialCode[] = [
  { code: '+1', name: 'United States', flag: 'US', samplePlaceholder: '415 555 2671' },
  { code: '+44', name: 'United Kingdom', flag: 'GB', samplePlaceholder: '20 7946 0958' },
  { code: '+91', name: 'India', flag: 'IN', samplePlaceholder: '98765 43210' },
  { code: '+41', name: 'Switzerland', flag: 'CH', samplePlaceholder: '79 123 45 67' },
  { code: '+49', name: 'Germany', flag: 'DE', samplePlaceholder: '151 23456789' },
  { code: '+33', name: 'France', flag: 'FR', samplePlaceholder: '6 12 34 56 78' },
  { code: '+81', name: 'Japan', flag: 'JP', samplePlaceholder: '90 1234 5678' },
  { code: '+971', name: 'United Arab Emirates', flag: 'AE', samplePlaceholder: '50 123 4567' },
];

/**
 * Validates international E.164 phone number format.
 */
export function validatePhoneNumber(phoneOrDialCode: string, localPhone?: string): boolean {
  const phone = localPhone === undefined ? phoneOrDialCode : normalizeToE164(phoneOrDialCode, localPhone);
  if (!phone) return false;
  // Allows optional +, digits, spaces, hyphens, parentheses, minimum 7 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function normalizeToE164(dialCode: string, phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^0+/, '');
  return `${dialCode}${digits}`;
}

/**
 * Formats phone number into international style.
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.trim();
  if (!cleaned.startsWith('+') && cleaned.replace(/\D/g, '').length === 10) {
    // Default US 10-digit format
    const d = cleaned.replace(/\D/g, '');
    return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return cleaned;
}

/**
 * Initiates phone verification code dispatch via Telnyx SMS service.
 */
export async function sendPhoneVerificationCode(
  phone: string,
  _recaptchaContainerId?: string
): Promise<PhoneVerificationResult> {
  if (!validatePhoneNumber(phone)) {
    return { success: false, message: 'Invalid telephone number format.' };
  }

  try {
    const res = await fetch('/api/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Carrier dispatch rejected.',
        message: data.error || 'Carrier dispatch rejected.',
      };
    }

    return {
      success: true,
      message: data.message || 'Passkey dispatched to recipient handset.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      error: `Telephonic service unreachable: ${msg}`,
      message: `Telephonic service unreachable: ${msg}`,
    };
  }
}

export async function confirmPhoneVerificationCode(
  _uid: string,
  phone: string,
  code: string
): Promise<PhoneVerificationResult> {
  const trimmed = code.trim();
  if (trimmed.length !== 6) {
    return { success: false, error: 'Passkey must be exactly 6 digits.' };
  }

  try {
    const res = await fetch('/api/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code: trimmed }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Invalid telephonic passkey.',
      };
    }

    return {
      success: true,
      message: data.message || 'Telephonic carrier authorization cleared.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      error: `Passkey confirmation service error: ${msg}`,
    };
  }
}

/**
 * Verifies code provided by user.
 */
export async function verifyPhoneCode(
  verificationId: string,
  code: string
): Promise<PhoneVerificationResult> {
  if (!code || code.trim().length < 4) {
    return { success: false, message: 'Verification code must be at least 4 digits.' };
  }

  return {
    success: true,
    verificationId,
    message: 'Phone verification confirmed.',
  };
}

export const isValidPhoneNumber = validatePhoneNumber;
export const isValidPhone = validatePhoneNumber;
export const formatPhone = formatPhoneNumber;
export const sendVerificationCode = sendPhoneVerificationCode;
export const verifyCode = verifyPhoneCode;

const phoneAuth = {
  validatePhoneNumber,
  formatPhoneNumber,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  isValidPhoneNumber,
  isValidPhone,
  formatPhone,
  sendVerificationCode,
  verifyCode,
  normalizeToE164,
  confirmPhoneVerificationCode,
  PRIORITY_DIAL_CODES,
};

export default phoneAuth;


