import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import appletConfig from '../firebase-applet-config.json';

// Standard error reporting required by Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Unified client configuration prioritizing environment variables with fallback to generated config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || appletConfig.apiKey || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || appletConfig.projectId || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || appletConfig.appId || '',
  firestoreDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || appletConfig.firestoreDatabaseId || '(default)',
};

// Check if Firebase configuration is active and valid
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'AIzaSyDINDCyZU0ev1HNUQyLXWnWP31q8lplQPQ_PLACEHOLDER'
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

try {
  if (isFirebaseConfigured || typeof window !== 'undefined') {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    // CRITICAL: Initialize Firestore using the specific database ID as required
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    storageInstance = getStorage(app);
  }
} catch (err) {
  console.warn('[Maison Glint Atelier] Firebase initialization deferred / running in safe mode:', err);
}

export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;
export const storage = storageInstance as FirebaseStorage;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid,
      email: currentAuth?.email,
      emailVerified: currentAuth?.emailVerified,
      isAnonymous: currentAuth?.isAnonymous,
      tenantId: currentAuth?.tenantId,
      providerInfo: currentAuth?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connectivity diagnostic check
export async function testConnection(): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Maison Glint] Firestore client offline; local storage fallback active.');
    }
    return false;
  }
}
