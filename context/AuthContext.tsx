'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ShippingAddress, UserProfile } from '../types/store';
import { getSupabaseBrowser } from '../lib/supabase/client';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  role?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOutAccount: () => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  saveAddress: (address: ShippingAddress) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(user: User, role?: string, permissions?: string[]): AppUser {
  return {
    uid: user.id,
    email: user.email || '',
    displayName: String(user.user_metadata?.display_name || user.email?.split('@')[0] || ''),
    emailVerified: Boolean(user.email_confirmed_at),
    role,
    permissions: permissions || [],
  };
}

function toUserProfile(data: Record<string, unknown>): UserProfile {
  return {
    uid: String(data.uid),
    email: String(data.email || ''),
    displayName: typeof data.display_name === 'string' ? data.display_name : undefined,
    firstName: typeof data.first_name === 'string' ? data.first_name : undefined,
    lastName: typeof data.last_name === 'string' ? data.last_name : undefined,
    phoneNumber: typeof data.phone_number === 'string' ? data.phone_number : undefined,
    phoneVerified: data.phone_verified === true,
    savedAddresses: Array.isArray(data.saved_addresses) ? data.saved_addresses as ShippingAddress[] : [],
    createdAt: typeof data.created_at === 'string' ? data.created_at : undefined,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => {
    try {
      return getSupabaseBrowser();
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (authUser: User | null) => {
    if (!supabase) {
      setUser(null);
      setProfile(null);
      return;
    }
    if (!authUser) {
      setUser(null);
      setProfile(null);
      return;
    }
    const [{ data: admin }, { data: profileData }] = await Promise.all([
      supabase.from('admins').select('role,permissions').eq('uid', authUser.id).eq('active', true).maybeSingle(),
      supabase.from('profiles').select('*').eq('uid', authUser.id).maybeSingle(),
    ]);
    setUser(toAppUser(authUser, admin?.role, admin?.permissions || []));
    setProfile(profileData ? toUserProfile(profileData) : null);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        void loadUser(session?.user || null).finally(() => setLoading(false));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) void loadUser(session?.user || null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase public configuration is missing.');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  };

  const getAuthRedirectUrl = (path: string = '/account'): string => {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maisonglint.com').replace(/\/$/, '');
    return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!supabase) throw new Error('Supabase public configuration is missing.');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name.trim() },
        emailRedirectTo: getAuthRedirectUrl('/account'),
      },
    });
    if (error) throw error;
    if (!data.session || !data.user) throw new Error('Check your email to confirm your account before signing in.');
    const { error: profileError } = await supabase.from('profiles').upsert({
      uid: data.user.id,
      email: data.user.email,
      display_name: name.trim(),
    });
    if (profileError) throw profileError;
  };

  const signOutAccount = async () => {
    if (!supabase) throw new Error('Supabase public configuration is missing.');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const sendResetEmail = async (email: string) => {
    if (!supabase) throw new Error('Supabase public configuration is missing.');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthRedirectUrl('/account'),
    });
    if (error) throw error;
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!supabase) throw new Error('Supabase public configuration is missing.');
    if (!user) return;
    const updates = {
      display_name: data.displayName,
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phoneNumber,
      saved_addresses: data.savedAddresses,
    };
    const { error } = await supabase.from('profiles').update(updates).eq('uid', user.uid);
    if (error) throw error;
    setProfile((previous) => previous ? { ...previous, ...data } : previous);
  };

  const saveAddress = async (address: ShippingAddress) => {
    const existing = profile?.savedAddresses || [];
    const savedAddresses = [address, ...existing.filter((item) => item.line1 !== address.line1)];
    await updateUserProfile({ savedAddresses });
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signInWithEmail, signUpWithEmail, signOutAccount, sendResetEmail, saveAddress, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
