'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import type { UserProfile, ShippingAddress } from '../types/store';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  signOutAccount: () => Promise<void>;
  sendResetEmail: (e: string) => Promise<void>;
  saveAddress: (address: ShippingAddress) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Known atelier admin emails for fast privileged verification
const ADMIN_EMAILS = [
  'chatterjee.prabuddha.work@gmail.com',
  'founder@maisonglint.com',
  'admin@maisonglint.com',
  'atelier@maisonglint.com',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('mg_mock_user');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('mg_mock_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          uid: parsed.uid,
          email: parsed.email || '',
          displayName: parsed.displayName || '',
        };
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    return Boolean(auth && isFirebaseConfigured);
  });

  // Sync user profile in Firestore
  const syncUserProfile = async (firebaseUser: User) => {
    if (!db) {
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
      });
      return;
    }

    const path = `users/${firebaseUser.uid}`;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          savedAddresses: [],
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, {
          ...newProfile,
          updatedAt: serverTimestamp(),
        });
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('[Maison Glint] User profile sync fallback:', err);
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
      });
    }
  };

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await syncUserProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      // Mock login for offline environments
      const mockUser = {
        uid: 'usr_guest_collector_' + Date.now().toString().slice(-4),
        email: 'collector@maisonglint.com',
        displayName: 'Atelier Collector',
      } as unknown as User;
      setUser(mockUser);
      setProfile({
        uid: mockUser.uid,
        email: mockUser.email || '',
        displayName: mockUser.displayName || '',
      });
      localStorage.setItem('mg_mock_user', JSON.stringify(mockUser));
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      const mockUser = {
        uid: 'usr_' + btoa(email).slice(0, 10),
        email,
        displayName: email.split('@')[0],
      } as unknown as User;
      setUser(mockUser);
      setProfile({
        uid: mockUser.uid,
        email: mockUser.email || '',
        displayName: mockUser.displayName || '',
      });
      localStorage.setItem('mg_mock_user', JSON.stringify(mockUser));
      return;
    }

    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await syncUserProfile(result.user);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) {
      const mockUser = {
        uid: 'usr_' + btoa(email).slice(0, 10),
        email,
        displayName: name,
      } as unknown as User;
      setUser(mockUser);
      setProfile({
        uid: mockUser.uid,
        email: mockUser.email || '',
        displayName: name,
      });
      localStorage.setItem('mg_mock_user', JSON.stringify(mockUser));
      return;
    }

    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
      await syncUserProfile(result.user);
    }
  };

  const signOutAccount = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mg_mock_user');
    }
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setProfile(null);
  };

  const sendResetEmail = async (email: string) => {
    if (auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const saveAddress = async (address: ShippingAddress) => {
    if (!profile) return;
    const existing = profile.savedAddresses || [];
    const updated = [address, ...existing.filter((a) => a.line1 !== address.line1)];

    setProfile((prev) => (prev ? { ...prev, savedAddresses: updated } : null));

    if (!db || !user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          savedAddresses: updated,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    if (data.displayName && auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      } catch (err) {
        console.warn('[Maison Glint Auth] updateProfile warning:', err);
      }
    }
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    if (db) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            ...data,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const isAdmin = Boolean(
    user?.email &&
    Boolean(user.emailVerified || user.providerData?.some((p) => p.providerId === 'google.com')) &&
    ADMIN_EMAILS.includes(user.email.toLowerCase())
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutAccount,
        sendResetEmail,
        saveAddress,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
