/**
 * lib/telnyx.ts
 *
 * Server-side Telnyx SMS dispatch and in-memory OTP verification service.
 * Powers client telephonic authorization at checkout.
 */

import crypto from 'crypto';

interface OtpSession {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  sendCount: number;
}

// In-memory OTP session cache (keyed by normalized E.164 phone number)
const otpStore = new Map<string, OtpSession>();

// Clean up expired sessions periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [phone, session] of otpStore.entries()) {
      if (now > session.expiresAt + 60000) {
        otpStore.delete(phone);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

function getTelnyxConfig() {
  const apiKey =
    process.env.TELNYX_API_KEY ||
    process.env.Telnyx_AUTH_TOKEN ||
    '';

  const fromNumber = process.env.TELNYX_FROM_NUMBER || '';
  const messagingProfileId = process.env.TELNYX_MESSAGING_PROFILE_ID || '';

  return { apiKey, fromNumber, messagingProfileId };
}

/**
 * Dispatches an outbound SMS message via the Telnyx Messaging API v2.
 */
export async function sendTelnyxSms(
  to: string,
  text: string
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
  canBypass?: boolean;
}> {
  const { apiKey, fromNumber, messagingProfileId } = getTelnyxConfig();

  if (!apiKey) {
    return { success: false, error: 'Telnyx API credentials missing on server.' };
  }

  try {
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        from: fromNumber,
        to,
        text,
        messaging_profile_id: messagingProfileId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorItem = data?.errors?.[0];
      const errorCode = String(errorItem?.code || '');
      const errorDetail = errorItem?.detail || errorItem?.title || `HTTP ${response.status}`;
      console.error('[Telnyx SMS] Dispatch failed:', errorCode, errorDetail, data);

      const isPreVerifiedError =
        errorCode === '10039' ||
        errorDetail.toLowerCase().includes('pre-verified') ||
        errorDetail.toLowerCase().includes('feature limited');

      let friendlyError = `Carrier transmission rejected: ${errorDetail}`;
      if (isPreVerifiedError) {
        friendlyError = 'Telnyx Trial Account: Outbound SMS is limited to pre-verified numbers. Refer to https://telnyx.com/upgrade';
      } else if (errorDetail.toLowerCase().includes('whitelisted')) {
        friendlyError = 'Destination country is not enabled on the carrier profile whitelist.';
      } else if (errorDetail.toLowerCase().includes('not a valid')) {
        friendlyError = 'Invalid telephone format. Please check your country code and digits.';
      }

      return {
        success: false,
        error: friendlyError,
        errorCode,
        canBypass: isPreVerifiedError,
      };
    }

    const messageId = data?.data?.id;
    console.log(`[Telnyx SMS] ✓ Dispatched SMS to ${to} [ID: ${messageId}]`);
    return { success: true, messageId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown dispatch exception';
    console.error('[Telnyx SMS] Connection exception:', msg);
    return { success: false, error: 'SMS carrier network exception. Please retry.' };
  }
}

/**
 * Creates and dispatches a cryptographically secure 6-digit OTP to the recipient.
 */
export async function createAndSendOtp(
  phone: string
): Promise<{
  success: boolean;
  message?: string;
  cooldownSeconds?: number;
  error?: string;
  errorCode?: string;
  canBypass?: boolean;
  bypassed?: boolean;
}> {
  const now = Date.now();
  const existing = otpStore.get(phone);

  // 1. Rate-limiting: 30-second cooldown between sends
  if (existing) {
    const elapsedSeconds = Math.floor((now - existing.lastSentAt) / 1000);
    if (elapsedSeconds < 30) {
      return {
        success: false,
        error: `Please wait ${30 - elapsedSeconds}s before requesting a new passkey.`,
        cooldownSeconds: 30 - elapsedSeconds,
      };
    }

    // 2. Maximum 3 dispatches per 10 minutes
    if (existing.sendCount >= 3 && now < existing.expiresAt) {
      const waitMins = Math.ceil((existing.expiresAt - now) / 60000);
      return {
        success: false,
        error: `Maximum passkey dispatches reached. Please retry in ${waitMins} minute${waitMins > 1 ? 's' : ''}.`,
      };
    }
  }

  // 3. Generate secure 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  // 4. Craft editorial luxury copy adhering strictly to voice.md (no exclamation marks)
  const messageText = `Maison Glint: Your telephonic verification passkey is ${code}. Valid for 10 minutes.`;

  // 5. Dispatch via Telnyx Messaging
  const result = await sendTelnyxSms(phone, messageText);

  if (!result.success) {
    // Check if error is 10039 / pre-verified constraint -> ACTIVATE BYPASS POLICY
    if (result.canBypass) {
      console.log(`[Telnyx SMS] Carrier pre-verification limitation detected (${result.errorCode}). Activating bypass policy for ${phone}.`);
      return {
        success: true,
        bypassed: true,
        canBypass: true,
        message: 'Carrier pre-verification limitation detected. Telephonic authorization bypass policy activated.',
      };
    }

    return {
      success: false,
      error: result.error,
      canBypass: false,
    };
  }

  // 6. Record session in memory
  otpStore.set(phone, {
    code,
    expiresAt,
    attempts: 0,
    lastSentAt: now,
    sendCount: (existing ? existing.sendCount : 0) + 1,
  });

  return {
    success: true,
    message: 'Passkey dispatched to your cellular handset.',
    cooldownSeconds: 45,
  };
}

/**
 * Validates a user-submitted passkey against the active in-memory session.
 */
export function verifyOtp(
  phone: string,
  inputCode: string
): { success: boolean; error?: string; message?: string } {
  const session = otpStore.get(phone);
  const trimmed = inputCode.trim();

  // Test bypass passkey for authorized development validation
  if (trimmed === '123456' && process.env.NODE_ENV !== 'production') {
    otpStore.delete(phone);
    return { success: true, message: 'Telephonic carrier authorization cleared.' };
  }

  if (!session) {
    return {
      success: false,
      error: 'No active passkey session found. Please transmit a new code.',
    };
  }

  if (Date.now() > session.expiresAt) {
    otpStore.delete(phone);
    return {
      success: false,
      error: 'The passkey has expired. Please transmit a new code.',
    };
  }

  session.attempts += 1;

  if (session.attempts > 5) {
    otpStore.delete(phone);
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please transmit a new passkey.',
    };
  }

  if (session.code !== trimmed) {
    const remaining = 5 - session.attempts;
    return {
      success: false,
      error: `Incorrect verification passkey. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
    };
  }

  // Correct code entered — remove session to ensure single-use
  otpStore.delete(phone);
  return {
    success: true,
    message: 'Telephonic carrier authorization cleared.',
  };
}
