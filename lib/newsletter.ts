import type { NewsletterSubscriber } from '../types/store';

export async function fetchAllSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const res = await fetch('/api/newsletter/subscribers', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('[Newsletter] Failed to fetch subscribers:', res.statusText);
      return [];
    }

    const data = await res.json();
    return data.subscribers || [];
  } catch (err) {
    console.error('[Newsletter] Fetch error:', err);
    return [];
  }
}

export async function toggleSubscriberStatus(
  email: string,
  isSubscribed: boolean
): Promise<boolean> {
  try {
    const res = await fetch('/api/newsletter/subscribers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, isSubscribed }),
    });

    return res.ok;
  } catch (err) {
    console.error('[Newsletter] Toggle error:', err);
    return false;
  }
}

export async function deleteSubscriberRecord(email: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/newsletter/subscribers?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });

    return res.ok;
  } catch (err) {
    console.error('[Newsletter] Delete error:', err);
    return false;
  }
}
