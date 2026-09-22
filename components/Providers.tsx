'use client';

import dynamic from 'next/dynamic';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { AudioProvider } from '../context/AudioContext';
import EntranceCurtain from './EntranceCurtain';

const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });
const AudioControl = dynamic(() => import('./AudioControl'), { ssr: false });

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
