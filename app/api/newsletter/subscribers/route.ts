import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ subscribers: [] });
    }

    const { data, error } = await supabase
      .from('newsletter')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Newsletter] Failed to fetch subscribers from Supabase:', error.message);
      return NextResponse.json({ subscribers: [], error: error.message });
    }

    const subscribers = (data || []).map((row) => ({
      id: row.id,
      email: row.email,
      isSubscribed: Boolean(row.is_subscribed),
      source: row.source || 'storefront_newsletter',
      createdAt: row.created_at,
      unsubscribedAt: row.unsubscribed_at || null,
    }));

    return NextResponse.json({ subscribers });
  } catch (err: unknown) {
    console.error('[Newsletter] Fetch subscribers error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error', subscribers: [] },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, isSubscribed } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unconfigured' }, { status: 500 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase
      .from('newsletter')
      .update({
        is_subscribed: isSubscribed,
        unsubscribed_at: isSubscribed ? null : new Date().toISOString(),
      })
      .eq('email', normalizedEmail);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, isSubscribed });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unconfigured' }, { status: 500 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase
      .from('newsletter')
      .delete()
      .eq('email', normalizedEmail);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Removed subscriber ${email}` });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
