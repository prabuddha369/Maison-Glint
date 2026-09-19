/**
 * POST /api/phone/verify-otp
 *
 * Verifies a submitted 6-digit telephonic passkey against the server session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '../../../../lib/telnyx';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Telephone number is required.' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Passkey is required.' },
        { status: 400 }
      );
    }

    const result = verifyOtp(phone.trim(), code.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: unknown) {
    console.error('[/api/phone/verify-otp] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error while confirming passkey.' },
      { status: 500 }
    );
  }
}
