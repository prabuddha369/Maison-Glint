/**
 * POST /api/phone/send-otp
 *
 * Dispatches a telephonic verification SMS via Telnyx Messaging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAndSendOtp } from '../../../../lib/telnyx';
import { validatePhoneNumber } from '../../../../lib/phoneAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Telephone number is required.' },
        { status: 400 }
      );
    }

    const normalized = phone.trim();

    if (!validatePhoneNumber(normalized)) {
      return NextResponse.json(
        { success: false, error: 'Invalid international cellular number format.' },
        { status: 400 }
      );
    }

    const result = await createAndSendOtp(normalized);

    if (result.bypassed) {
      return NextResponse.json({
        success: true,
        bypassed: true,
        canBypass: true,
        message: result.message || 'Carrier constraint detected. Verification bypass policy activated.',
      });
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          canBypass: result.canBypass || false,
          cooldownSeconds: result.cooldownSeconds,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      cooldownSeconds: result.cooldownSeconds,
    });
  } catch (err: unknown) {
    console.error('[/api/phone/send-otp] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error while transmitting passkey.' },
      { status: 500 }
    );
  }
}
