'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { AudioProvider } from '../context/AudioContext';
import CartDrawer from './CartDrawer';
import EntranceCurtain from './EntranceCurtain';
import AudioControl from './AudioControl';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
      <EntranceCurtain />
      <AudioControl />
    </AudioProvider>
  );
}
