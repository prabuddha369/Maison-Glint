import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateReservationEmailHtml, generateReservationEmailText } from '../../../lib/emailTemplate';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      serialNumber,
      collectorName,
      collectorEmail,
      productName,
      ritual,
      destination,
      specification,
      status,
      expiresAt,
    } = body;

    if (!collectorEmail || !serialNumber) {
      return NextResponse.json(
        { error: 'Missing collectorEmail or serialNumber' },
        { status: 400 }
      );
    }

    const zohoEmail = process.env.ZOHO_EMAIL || 'founder@maisonglint.com';
    const zohoPassword = process.env.ZOHO_APP_PASSWORD;

    if (!zohoPassword) {
      console.warn('Zoho app password not configured in environment variables.');
      return NextResponse.json(
        { error: 'Email service unconfigured on server' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true, // SSL
      auth: {
        user: zohoEmail,
        pass: zohoPassword,
      },
    });

    const subject = `Maison Glint — Allocation Archive Record [${serialNumber}]`;
    const emailPayload = {
      serialNumber,
      collectorName: collectorName || 'Collector',
      collectorEmail,
      productName: productName || 'Object 01 — The Glint Plate',
      ritual: ritual || 'The Evening Table (Dinner & Hosting)',
      destination: destination || 'Global Archive',
      specification: specification || 'Double Buff 8K Mirror (280mm)',
      status: status || 'allocated',
      expiresAt,
    };

    const html = generateReservationEmailHtml(emailPayload);
    const text = generateReservationEmailText(emailPayload);

    const info = await transporter.sendMail({
      from: `"Maison Glint Atelier" <${zohoEmail}>`,
      to: collectorEmail,
      subject,
      text,
      html,
    });

    console.log(
      `[SMTP] Reservation email successfully dispatched to ${collectorEmail} (Message ID: ${info.messageId})`
    );

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown SMTP error';
    console.error('[SMTP ERROR] Failed to dispatch reservation email:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
