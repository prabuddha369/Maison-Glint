import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import {
  generateNewsletterWelcomeEmailHtml,
  generateNewsletterWelcomeEmailText,
} from '../../../../lib/emailTemplate';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Persist subscription in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    let dbSuccess = false;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error: dbError } = await supabase
          .from('newsletter')
          .upsert(
            {
              email: normalizedEmail,
              is_subscribed: true,
              unsubscribed_at: null,
              source: 'storefront_newsletter',
            },
            { onConflict: 'email' }
          );

        if (dbError) {
          console.warn('[Newsletter] Supabase record error (check migration 007):', dbError.message);
        } else {
          dbSuccess = true;
          console.log(`[Newsletter] Subscriber recorded in Supabase: ${normalizedEmail}`);
        }
      } catch (err) {
        console.warn('[Newsletter] Supabase connection notice:', err);
      }
    }

    // 2. Dispatch luxury welcome email via Zoho SMTP
    const zohoEmail = process.env.ZOHO_EMAIL || 'founder@maisonglint.com';
    const zohoPassword = process.env.ZOHO_APP_PASSWORD;

    if (zohoPassword) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.zoho.in',
          port: 465,
          secure: true,
          auth: {
            user: zohoEmail,
            pass: zohoPassword,
          },
        });

        const subject = 'Welcome to the Atelier — Maison Glint';
        const html = generateNewsletterWelcomeEmailHtml(normalizedEmail);
        const text = generateNewsletterWelcomeEmailText(normalizedEmail);

        await transporter.sendMail({
          from: `"Maison Glint Atelier" <${zohoEmail}>`,
          to: normalizedEmail,
          subject,
          text,
          html,
        });

        console.log(`[SMTP] Welcome email successfully dispatched to ${normalizedEmail}`);
      } catch (emailErr) {
        console.warn('[SMTP] Welcome email dispatch failed (non-blocking):', emailErr);
      }
    } else {
      console.warn('[SMTP] Zoho app password unconfigured, skipping welcome email.');
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription registered successfully.',
      dbSaved: dbSuccess,
    });
  } catch (error: unknown) {
    console.error('[Newsletter] Subscribe handler error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Subscription processing failed.' },
      { status: 500 }
    );
  }
}
