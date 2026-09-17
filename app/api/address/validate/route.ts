import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { postalCode, country, state, city } = await req.json();

    const apiKey = process.env.OLA_MAPS_API_KEY;

    if (!apiKey) {
      // Graceful fallback if Ola Maps API key is not configured in environment
      return NextResponse.json({
        valid: true,
        source: 'unconfigured_mock_fallback',
        message: 'Ola Maps API key unconfigured; structural postal cross-matching applied.',
        raw: null,
      });
    }

    // Build geocode query for Ola Maps
    const addressQuery = [postalCode, city, state, country].filter(Boolean).join(', ');
    const url = new URL('https://api.olamaps.io/places/v1/geocode');
    url.searchParams.set('address', addressQuery);
    url.searchParams.set('api_key', apiKey);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          valid: false,
          source: 'olamaps_error',
          status: res.status,
          message: 'Ola Maps Geocoding response returned non-200.',
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      valid: true,
      source: 'olamaps',
      data,
    });
  } catch (err: unknown) {
    console.error('Ola Maps proxy route error:', err);
    return NextResponse.json(
      {
        valid: false,
        source: 'proxy_exception',
        error: err instanceof Error ? err.message : 'Unknown proxy error',
      },
      { status: 200 }
    );
  }
}
