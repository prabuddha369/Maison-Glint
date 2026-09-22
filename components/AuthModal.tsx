'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Shield, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmationPending?: (email: string) => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onConfirmationPending, defaultMode = 'login' }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, sendResetEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          throw new Error('Please provide your full legal or collector name.');
        }
        await signUpWithEmail(email, password, displayName);
        onClose();
      } else if (mode === 'forgot') {
        await sendResetEmail(email);
        setStatusMsg('A secure password restoration cipher has been dispatched to your email.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication verification failed.';
      if (msg.toLowerCase().includes('check your email')) {
        const normalizedEmail = email.trim().toLowerCase();
        setConfirmationEmail(normalizedEmail);
        setConfirmationPending(true);
        onConfirmationPending?.(normalizedEmail);
        window.setTimeout(onClose, 1800);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#111111]/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#f9f9f7] border border-[#e5e5e3] p-8 sm:p-10 shadow-2xl z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close portal"
          className="absolute top-5 right-5 text-[#8c8c8c] hover:text-[#111111] transition-colors p-1"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-[0.28em] text-[#595D5D] font-medium block">
            Collector Registry
          </span>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#111111] mt-1.5 leading-none">
            {mode === 'login' && 'Atelier Sign In'}
            {mode === 'register' && 'Request Collector Portal'}
            {mode === 'forgot' && 'Account Recovery'}
          </h2>
          <div className="w-8 h-[1px] bg-[#846115] mx-auto mt-3" />
        </div>

        {confirmationPending ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#2e7d32]" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#111111]">
                Confirmation Email Sent
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#595D5D]">
                We sent a verification link to <span className="font-medium text-[#111111]">{maskEmail(confirmationEmail)}</span>.
              </p>
            </div>
            <div className="border border-[#e5e5e3] bg-[#ffffff] p-4 text-left space-y-2">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 shrink-0 text-[#846115] mt-0.5" />
                <p className="text-xs leading-relaxed text-[#444748]">
                  Open your inbox or spam folder, click <strong>Verify Client Profile</strong>, then return here and sign in.
                </p>
              </div>
              <p className="text-xs text-[#595D5D] pl-6">This window will close automatically. No additional email has been requested.</p>
            </div>
          </div>
        ) : <>
        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-[#fff0f0] border border-[#ffcccc] text-[#b91c1c] text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        {statusMsg && (
          <div className="mb-6 p-3 bg-[#f0f9f0] border border-[#cceccc] text-[#15803d] text-xs leading-relaxed">
            {statusMsg}
          </div>
        )}

        {mode !== 'forgot' && (
          <div className="mb-6">
            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5e5e3]" />
              </div>
              <span className="relative bg-[#f9f9f7] px-3 text-xs uppercase tracking-[0.2em] text-[#595D5D]">
                Authenticate via Email
              </span>
            </div>
          </div>
        )}

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#595D5D] mb-1.5 font-medium">
                Collector Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="E.g., Julian Vance"
                  required
                  className="w-full bg-[#ffffff] text-[#111111] px-3 py-2.5 text-xs border border-[#d6d6d4] focus:outline-none focus:border-[#111111]"
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-[#8c8c8c]" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-[#595D5D] mb-1.5 font-medium">
              Registered Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@atelier.com"
                required
                className="w-full bg-[#ffffff] text-[#111111] px-3 py-2.5 text-xs border border-[#d6d6d4] focus:outline-none focus:border-[#111111]"
              />
              <Mail className="absolute right-3 top-3 w-4 h-4 text-[#8c8c8c]" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs uppercase tracking-[0.18em] text-[#595D5D] font-medium">
                  Atelier Passkey / Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs uppercase tracking-[0.15em] text-[#846115] font-semibold hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#ffffff] text-[#111111] px-3 py-2.5 text-xs border border-[#d6d6d4] focus:outline-none focus:border-[#111111]"
                />
                <Lock className="absolute right-3 top-3 w-4 h-4 text-[#8c8c8c]" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#111111] text-[#f9f9f7] hover:bg-[#2b2b2b] text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center space-x-2 transition-all border border-[#111111] cursor-pointer"
          >
            <span>
              {loading
                ? 'Verifying...'
                : mode === 'login'
                ? 'Sign In to Portal'
                : mode === 'register'
                ? 'Complete Registration'
                : 'Send Recovery Link'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
          </button>
        </form>

        {/* Mode Switching */}
        <div className="mt-8 pt-6 border-t border-[#e5e5e3] text-center text-xs text-[#595D5D]">
          {mode === 'login' && (
            <p>
              New collector?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#111111] font-semibold underline underline-offset-2 hover:text-[#846115]"
              >
                Create an account
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#111111] font-semibold underline underline-offset-2 hover:text-[#846115]"
              >
                Sign in here
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remembered your credentials?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#111111] font-semibold underline underline-offset-2 hover:text-[#846115]"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center space-x-1.5 text-xs uppercase tracking-[0.16em] text-[#595D5D]">
          <Shield className="w-3 h-3 text-[#846115]" />
          <span>Supabase Identity · 256-Bit SSL Safeguarded</span>
        </div>
        </>}
      </div>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local.slice(0, 1)}${'*'.repeat(Math.max(2, local.length - 1))}@${domain}`;
}
