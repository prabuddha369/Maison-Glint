/**
 * Maison Glint Luxury Word-Key Passkey Verification Engine
 * Generates and validates editorial 6-letter architectural/curatorial passphrases
 * instead of generic robotic numeric OTPs.
 */

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const EDITORIAL_PASSKEYS = [
  'CHROME',
  'LUSTRE',
  'SILVER',
  'MARBLE',
  'SPHERE',
  'CHISEL',
  'PLINTH',
  'PATINA',
  'FINISH',
  'MIRROR',
  'VESSEL',
  'OBJECT',
  'PRISMS',
  'FACETS',
  'CANVAS',
  'BRONZE',
  'AURAXX',
  'STEELS',
] as const;

export interface WordKeyRecord {
  userId: string;
  email: string;
  wordKey: string;
  expiresAt: number; // Unix timestamp in ms (10 minutes)
  createdAt: number;
}

const LOCAL_STORAGE_WORD_KEY = 'mg_active_word_key';

/**
 * Generates a random 6-letter architectural passkey
 */
export function generateCuratorialWord(): string {
  // 6-letter editorial words
  const eligible = EDITORIAL_PASSKEYS.filter((w) => w.length === 6);
  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}

/**
 * Issues a new word-key verification record for a user
 * Stores in Firestore `emailVerifications/{userId}` with 10-minute TTL
 * and sets local fallback for seamless preview testing.
 */
export async function issueEmailVerificationPasskey(
  userId: string,
  email: string
): Promise<{ wordKey: string; expiresAt: number }> {
  const wordKey = generateCuratorialWord();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const record: WordKeyRecord = {
    userId,
    email,
    wordKey,
    expiresAt,
    createdAt: Date.now(),
  };

  // Cache in session/localStorage for offline/preview verification
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_WORD_KEY, JSON.stringify(record));
    } catch (e) {
      console.warn('WordKey local storage note:', e);
    }
  }

  // Persist to Firestore if available
  if (db) {
    try {
      await setDoc(doc(db, 'emailVerifications', userId), {
        userId,
        email,
        wordKey,
        expiresAt,
        verified: false,
        updatedAt: serverTimestamp(),
      });
      console.log(`[Maison Glint] Passkey recorded in Firestore for ${email}`);
    } catch (err) {
      console.warn('[Maison Glint] Firestore wordKey write fallback to local storage:', err);
    }
  }

  // Developer preview notification in console
  console.info(
    `%c[MAISON GLINT EDITORIAL DISPATCH]%c Client Email: ${email} | Editorial Passkey: %c[${wordKey}]%c (Expires in 10 minutes)`,
    'color: #d4af37; font-weight: bold;',
    'color: #111111;',
    'background: #111111; color: #f9f9f7; font-weight: bold; padding: 2px 6px; letter-spacing: 2px;',
    'color: #747878;'
  );

  return { wordKey, expiresAt };
}

/**
 * Validates the entered 6-letter word against active record
 */
export async function verifyEmailPasskey(
  userId: string,
  inputWord: string
): Promise<{ success: boolean; error?: string }> {
  if (!inputWord || inputWord.trim().length !== 6) {
    return { success: false, error: 'Editorial passkey must be exactly 6 alphabetic characters.' };
  }

  const normalizedInput = inputWord.trim().toUpperCase();

  // 1. Try checking Firestore
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'emailVerifications', userId));
      if (snap.exists()) {
        const data = snap.data();
        if (Date.now() > data.expiresAt) {
          return {
            success: false,
            error: 'The editorial passkey has expired (10-minute window exceeded). Please request a new passkey.',
          };
        }
        if (data.wordKey.toUpperCase() === normalizedInput) {
          // Mark verified
          await setDoc(doc(db, 'emailVerifications', userId), { verified: true }, { merge: true });
          return { success: true };
        }
      }
    } catch (err) {
      console.warn('[Maison Glint] Firestore passkey check fallback:', err);
    }
  }

  // 2. Check local fallback
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_WORD_KEY);
      if (cached) {
        const record = JSON.parse(cached) as WordKeyRecord;
        if (record.userId === userId || !record.userId) {
          if (Date.now() > record.expiresAt) {
            return {
              success: false,
              error: 'The editorial passkey has expired. Please request a new passkey.',
            };
          }
          if (record.wordKey.toUpperCase() === normalizedInput) {
            return { success: true };
          }
        }
      }
    } catch (e) {
      console.warn('WordKey local check error:', e);
    }
  }

  return {
    success: false,
    error: 'The entered editorial passkey does not match our dispatch record. Please verify and re-enter.',
  };
}
