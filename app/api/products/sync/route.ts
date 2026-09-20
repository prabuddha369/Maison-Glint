import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase.rpc('sync_storefront_products');

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          hint: 'Execute supabase/migrations/011_sync_all_products_data.sql in the Supabase SQL Editor to install the sync function.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
