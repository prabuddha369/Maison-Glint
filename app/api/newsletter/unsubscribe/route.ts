import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function updateUnsubscribe(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return false;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const normalizedEmail = email.trim().toLowerCase();

  const { error } = await supabase
    .from('newsletter')
    .update({
      is_subscribed: false,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('email', normalizedEmail);

  if (error) {
    console.warn('[Newsletter] Unsubscribe update notice:', error.message);
    return false;
  }
  return true;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (email && email.includes('@')) {
    await updateUnsubscribe(email);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maison Glint — Unsubscribe Confirmed</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F7F4EE;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111111;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E5E5E3;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }
    .eyebrow {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.24em;
      color: #C5A059;
      margin-bottom: 12px;
      font-weight: 600;
    }
    h1 {
      font-family: Georgia, serif;
      font-weight: 300;
      font-size: 28px;
      margin: 0 0 16px 0;
    }
    p {
      font-size: 13px;
      color: #444748;
      line-height: 1.7;
      margin-bottom: 28px;
    }
    a {
      display: inline-block;
      background: #111111;
      color: #F7F4EE;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      padding: 14px 28px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="eyebrow">MAISON GLINT ATELIER</div>
    <h1>Preference Updated</h1>
    <p>
      ${email ? `<strong>${email}</strong> has been removed from` : 'You have been unsubscribed from'} our correspondence circle. You will no longer receive our seasonal journals or release announcements.
    </p>
    <a href="https://maisonglint.com">Return to Storefront</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

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

    const success = await updateUnsubscribe(email);

    return NextResponse.json({
      success,
      message: 'Unsubscribed successfully.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unsubscribe failed.' },
      { status: 500 }
    );
  }
}
