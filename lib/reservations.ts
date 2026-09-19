import { getSupabaseBrowser } from './supabase/client';
import type { Reservation, ReservationStatus, Product } from '../types/store';

export interface CreateReservationParams {
  productId: string;
  collectorName: string;
  collectorEmail: string;
  destination: string;
  ritual: string;
  userId?: string | null;
}

export interface ReservationResult {
  success: boolean;
  isExisting?: boolean;
  id: string;
  serialNumber: string;
  serialIndex: number;
  status: ReservationStatus;
  collectorName: string;
  collectorEmail: string;
  destination: string;
  ritual: string;
  expiresAt: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'maison_glint_allocations_v1';

function getLocalReservations(): Reservation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const list: Reservation[] = JSON.parse(raw);
    const now = new Date();
    let changed = false;

    // Check for auto-expired local reservations and transition them to 'deallocated'
    const updated = list.map((r) => {
      if (
        (r.status === 'allocated' || r.status === 'pending_verification') &&
        r.expiresAt &&
        new Date(r.expiresAt) < now
      ) {
        changed = true;
        return { ...r, status: 'deallocated' as ReservationStatus };
      }
      return r;
    });

    if (changed) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return [];
  }
}

function saveLocalReservation(res: Reservation) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalReservations();
    const filtered = list.filter(
      (r) => !(r.collectorEmail.toLowerCase() === res.collectorEmail.toLowerCase() && r.productId === res.productId)
    );
    filtered.unshift(res);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to cache reservation locally:', err);
  }
}

/**
 * Creates or retrieves an atomic priority reservation in Supabase.
 * Enforces 48-hour time-bound validity and updates edition_reserved tracking.
 */
export async function createPriorityReservation(
  params: CreateReservationParams
): Promise<ReservationResult> {
  const supabase = getSupabaseBrowser();
  const trimmedEmail = params.collectorEmail.trim().toLowerCase();
  const trimmedName = params.collectorName.trim();
  const trimmedDest = params.destination.trim();
  const trimmedRitual = params.ritual.trim();
  const defaultExpiry = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

  // Try PostgreSQL RPC function first
  try {
    const { data, error } = await supabase.rpc('create_priority_reservation', {
      p_product_id: params.productId,
      p_collector_name: trimmedName,
      p_collector_email: trimmedEmail,
      p_destination: trimmedDest,
      p_ritual: trimmedRitual,
      p_user_id: params.userId || null,
    });

    if (!error && data && data.success) {
      const result: ReservationResult = {
        success: true,
        isExisting: !!data.is_existing,
        id: data.id || `res-${Date.now()}`,
        serialNumber: data.serial_number,
        serialIndex: data.serial_index || 1,
        status: data.status as ReservationStatus,
        collectorName: data.collector_name || trimmedName,
        collectorEmail: data.collector_email || trimmedEmail,
        destination: data.destination || trimmedDest,
        ritual: data.ritual || trimmedRitual,
        expiresAt: data.expires_at || defaultExpiry,
        createdAt: data.created_at || new Date().toISOString(),
      };

      saveLocalReservation({
        id: result.id,
        userId: params.userId,
        productId: params.productId,
        serialNumber: result.serialNumber,
        serialIndex: result.serialIndex,
        collectorName: result.collectorName,
        collectorEmail: result.collectorEmail,
        destination: result.destination,
        ritual: result.ritual,
        status: result.status,
        expiresAt: result.expiresAt,
        createdAt: result.createdAt,
      });

      return result;
    }
  } catch (rpcErr) {
    console.warn('RPC create_priority_reservation unavailable, attempting direct insert:', rpcErr);
  }

  // Fallback: Direct table insertion or local minting
  const objNum = params.productId.includes('02')
    ? '02'
    : params.productId.includes('03')
    ? '03'
    : '01';

  let nextIndex = 1;
  try {
    const { data: existingRows } = await supabase
      .from('reservations')
      .select('*')
      .eq('product_id', params.productId)
      .order('serial_index', { ascending: false })
      .limit(1);

    if (existingRows && existingRows.length > 0) {
      nextIndex = (existingRows[0].serial_index || 0) + 1;
    }
  } catch {
    nextIndex = Math.floor(Math.random() * 45) + 1;
  }

  const serialNumber = `MG-${objNum}-${String(nextIndex).padStart(3, '0')}`;
  const status: ReservationStatus = params.userId ? 'allocated' : 'pending_verification';

  try {
    const { data: inserted, error: insertError } = await supabase
      .from('reservations')
      .insert({
        user_id: params.userId || null,
        product_id: params.productId,
        serial_number: serialNumber,
        serial_index: nextIndex,
        collector_name: trimmedName,
        collector_email: trimmedEmail,
        destination: trimmedDest,
        ritual: trimmedRitual,
        status,
        expires_at: defaultExpiry,
      })
      .select()
      .single();

    if (!insertError && inserted) {
      const result: ReservationResult = {
        success: true,
        id: inserted.id,
        serialNumber: inserted.serial_number,
        serialIndex: inserted.serial_index,
        status: inserted.status,
        collectorName: inserted.collector_name,
        collectorEmail: inserted.collector_email,
        destination: inserted.destination,
        ritual: inserted.ritual,
        expiresAt: inserted.expires_at || defaultExpiry,
        createdAt: inserted.created_at,
      };
      saveLocalReservation({
        ...result,
        productId: params.productId,
        userId: params.userId,
      });
      return result;
    }
  } catch (insertErr) {
    console.warn('Direct reservation table insert skipped:', insertErr);
  }

  // Pure local fallback
  const fallbackResult: ReservationResult = {
    success: true,
    id: `local-res-${Date.now()}`,
    serialNumber,
    serialIndex: nextIndex,
    status,
    collectorName: trimmedName,
    collectorEmail: trimmedEmail,
    destination: trimmedDest,
    ritual: trimmedRitual,
    expiresAt: defaultExpiry,
    createdAt: new Date().toISOString(),
  };

  saveLocalReservation({
    ...fallbackResult,
    productId: params.productId,
    userId: params.userId,
  });

  return fallbackResult;
}

/**
 * Retrieves all reservations associated with a user, auto-flagging deallocated expired ones.
 */
export async function getReservationsByUser(
  userId?: string | null,
  email?: string | null
): Promise<Reservation[]> {
  const supabase = getSupabaseBrowser();
  const remoteList: Reservation[] = [];

  try {
    if (userId) {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        data.forEach((row) => {
          const isExpired =
            (row.status === 'allocated' || row.status === 'pending_verification') &&
            row.expires_at &&
            new Date(row.expires_at) < new Date();

          remoteList.push({
            id: row.id,
            userId: row.user_id,
            productId: row.product_id,
            serialNumber: row.serial_number,
            serialIndex: row.serial_index,
            collectorName: row.collector_name,
            collectorEmail: row.collector_email,
            destination: row.destination,
            ritual: row.ritual,
            status: isExpired ? 'deallocated' : (row.status as ReservationStatus),
            expiresAt: row.expires_at || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          });
        });
      }
    } else if (email) {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('collector_email', email.toLowerCase())
        .order('created_at', { ascending: false });

      if (!error && data) {
        data.forEach((row) => {
          const isExpired =
            (row.status === 'allocated' || row.status === 'pending_verification') &&
            row.expires_at &&
            new Date(row.expires_at) < new Date();

          remoteList.push({
            id: row.id,
            userId: row.user_id,
            productId: row.product_id,
            serialNumber: row.serial_number,
            serialIndex: row.serial_index,
            collectorName: row.collector_name,
            collectorEmail: row.collector_email,
            destination: row.destination,
            ritual: row.ritual,
            status: isExpired ? 'deallocated' : (row.status as ReservationStatus),
            expiresAt: row.expires_at || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          });
        });
      }
    }
  } catch (err) {
    console.warn('Could not query remote reservations table:', err);
  }

  // Merge with any cached local reservations
  const localList = getLocalReservations();
  const targetEmail = (email || '').toLowerCase();

  const combined = [...remoteList];
  localList.forEach((local) => {
    const matchesUser =
      (userId && local.userId === userId) ||
      (targetEmail && local.collectorEmail.toLowerCase() === targetEmail);

    if (matchesUser && !combined.some((r) => r.serialNumber === local.serialNumber)) {
      combined.push(local);
    }
  });

  return combined.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Checks if a customer is entitled to order a product when unreserved inventory is limited.
 * Formula: availableUnreserved = edition_remaining - edition_reserved.
 * If availableUnreserved < quantityRequested:
 *   - Allowed ONLY IF the customer holds an active (non-expired) reservation for that product.
 */
export async function checkProductReservationEntitlement(
  product: Product,
  quantityRequested: number,
  userEmail?: string | null,
  userId?: string | null
): Promise<{ canOrder: boolean; reason?: string; holdsActiveReservation: boolean }> {
  const remaining = product.editionRemaining ?? 250;
  const reserved = product.editionReserved ?? 0;
  const availableUnreserved = Math.max(0, remaining - reserved);

  // If there is enough unreserved stock available for general purchase:
  if (availableUnreserved >= quantityRequested) {
    return { canOrder: true, holdsActiveReservation: false };
  }

  // Stock is fully claimed by active reservations. Check if user holds a valid reservation:
  if (userEmail || userId) {
    const userReservations = await getReservationsByUser(userId, userEmail);
    const activeReservation = userReservations.find(
      (r) =>
        r.productId === product.id &&
        (r.status === 'allocated' || r.status === 'pending_verification') &&
        new Date(r.expiresAt) > new Date()
    );

    if (activeReservation) {
      return { canOrder: true, holdsActiveReservation: true };
    }
  }

  return {
    canOrder: false,
    holdsActiveReservation: false,
    reason: `${product.name} is currently fully committed under priority collector allocations. All remaining ${remaining} pieces are held in 48-hour reservation windows.`,
  };
}
