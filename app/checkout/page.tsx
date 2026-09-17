'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  MapPin,
  UserCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import { createStorefrontOrder } from '../../lib/payment';
import {
  validateFullName,
  validateEmail,
} from '../../lib/identityValidator';
import {
  issueEmailVerificationPasskey,
  verifyEmailPasskey,
} from '../../lib/wordKeyVerification';
import {
  validateAddress,
  type AddressValidationStatus,
  type AddressValidationResult,
} from '../../lib/addressValidator';
import {
  PRIORITY_DIAL_CODES,
  normalizeToE164,
  validatePhoneNumber,
  sendPhoneVerificationCode,
  confirmPhoneVerificationCode,
} from '../../lib/phoneAuth';
import type { ShippingAddress, CustomerInfo, OrderVerificationMetadata } from '../../types/store';

const SHIPPING_METHODS = [
  {
    id: 'standard-insured',
    title: 'Standard Insured Cross-Border Cargo',
    cost: 45,
    estimatedDelivery: '8–12 Business Days (Customs Cleared)',
    description: 'Specialized tamper-evident reinforced crate with end-to-end telemetry tracking.',
  },
  {
    id: 'white-glove-express',
    title: 'Atelier White-Glove Direct Courier',
    cost: 120,
    estimatedDelivery: '3–5 Business Days (Priority Dispatch)',
    description: 'Direct courier hand-delivery with white-glove inspection on arrival.',
  },
];

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'India',
  'Switzerland',
  'Germany',
  'France',
  'Canada',
  'Japan',
  'United Arab Emirates',
  'Singapore',
  'Australia',
  'Italy',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, taxEstimate, total, clearCart } = useCart();
  const {
    user,
    profile,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    updateUserProfile,
  } = useAuth();

  // Navigation / stage tracking
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>('');

  // ---------------------------------------------------------------------------
  // STAGE 1: Authentication & Identity Validation (Strictly Non-Guest)
  // ---------------------------------------------------------------------------
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // STAGE 2: Luxury Word-Key Email Passkey Verification
  // ---------------------------------------------------------------------------
  const [passkeyBoxes, setPasskeyBoxes] = useState<string[]>(['', '', '', '', '', '']);
  const passkeyInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [passkeyDispatched, setPasskeyDispatched] = useState<boolean>(false);
  const [discreetToastWord, setDiscreetToastWord] = useState<string | null>(null);
  const [passkeyLoading, setPasskeyLoading] = useState<boolean>(false);
  const [passkeyError, setPasskeyError] = useState<string>('');
  const [passkeyVerifiedDirectly, setPasskeyVerifiedDirectly] = useState<boolean>(false);
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string>('');

  const isEmailVerified = Boolean(passkeyVerifiedDirectly || profile?.emailVerified);

  // ---------------------------------------------------------------------------
  // STAGE 3: Address Validation Engine (Ola Maps)
  // ---------------------------------------------------------------------------
  const [address, setAddress] = useState<ShippingAddress>(() => {
    if (profile?.savedAddresses && profile.savedAddresses.length > 0) {
      return profile.savedAddresses[0];
    }
    return {
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
    };
  });
  const [addressStatus, setAddressStatus] = useState<AddressValidationStatus>('invalid');
  const [addressValidationMsg, setAddressValidationMsg] = useState<string>('');
  const [addressValidating, setAddressValidating] = useState<boolean>(false);
  const [addressValidatedVia, setAddressValidatedVia] = useState<
    'OlaMaps' | 'StandardPostalVerification' | 'ManualAcknowledgement'
  >('OlaMaps');

  // ---------------------------------------------------------------------------
  // STAGE 4: Phone Number Verification (Firebase SMS Auth)
  // ---------------------------------------------------------------------------
  const [selectedDialCode, setSelectedDialCode] = useState<string>('+1');
  const [rawPhoneInput, setRawPhoneInput] = useState<string>('');
  const [phoneSmsSent, setPhoneSmsSent] = useState<boolean>(false);
  const [smsOtpBoxes, setSmsOtpBoxes] = useState<string[]>(['', '', '', '', '', '']);
  const smsOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [phoneLoading, setPhoneLoading] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [phoneVerifiedDirectly, setPhoneVerifiedDirectly] = useState<boolean>(false);
  const [normalizedPhone, setNormalizedPhone] = useState<string>('');
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const isPhoneVerified = Boolean(phoneVerifiedDirectly || profile?.phoneVerified);

  // ---------------------------------------------------------------------------
  // STAGE 5: Logistics Tier & Final Clearing
  // ---------------------------------------------------------------------------
  const [selectedMethodId, setSelectedMethodId] = useState<string>('standard-insured');
  const selectedShippingMethod =
    SHIPPING_METHODS.find((m) => m.id === selectedMethodId) || SHIPPING_METHODS[0];
  const calculatedShipping = subtotal >= 1000 ? 0 : selectedShippingMethod.cost;
  const calculatedTotal = subtotal + calculatedShipping + taxEstimate;

  // ---------------------------------------------------------------------------
  // Resend SMS timer countdown
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // ---------------------------------------------------------------------------
  // Handlers for Stage 1: Auth & Identity
  // ---------------------------------------------------------------------------
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithGoogle();
      setActiveStage(2);
    } catch (err: unknown) {
      console.error('Google Auth error:', err);
      setAuthError('Google identity authentication could not be completed. Please try again or use direct login.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Email validation
    const emailRes = validateEmail(authEmail);
    if (!emailRes.valid) {
      setAuthError(emailRes.error || 'Invalid email format.');
      return;
    }

    if (authMode === 'register') {
      // Name validation
      const nameRes = validateFullName(authFullName);
      if (!nameRes.valid) {
        setAuthError(nameRes.error || 'Please provide a valid legal name (minimum two words).');
        return;
      }

      if (authPassword.length < 6) {
        setAuthError('Password must be at least 6 characters for vault access.');
        return;
      }

      setAuthLoading(true);
      try {
        await signUpWithEmail(authEmail, authPassword, authFullName.trim());
        setActiveStage(2);
      } catch (err: unknown) {
        console.error('Registration error:', err);
        setAuthError('Registration failed. The email may already be registered or password is too weak.');
      } finally {
        setAuthLoading(false);
      }
    } else {
      // Sign in
      if (!authPassword) {
        setAuthError('Please enter your client account password.');
        return;
      }
      setAuthLoading(true);
      try {
        await signInWithEmail(authEmail, authPassword);
        setActiveStage(2);
      } catch (err: unknown) {
        console.error('Sign-in error:', err);
        setAuthError('Invalid credentials. Please verify your email and password.');
      } finally {
        setAuthLoading(false);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers for Stage 2: Luxury Word-Key Passkey
  // ---------------------------------------------------------------------------
  const handleDispatchWordKey = useCallback(async () => {
    const targetUid = user?.uid || 'temp_collector';
    const targetEmail = user?.email || authEmail || 'collector@maisonglint.com';

    setPasskeyLoading(true);
    setPasskeyError('');
    try {
      const { wordKey } = await issueEmailVerificationPasskey(targetUid, targetEmail);
      setPasskeyDispatched(true);
      // In development / preview mode, show discreet toast so the user can easily test
      setDiscreetToastWord(wordKey);
      setTimeout(() => setDiscreetToastWord(null), 12000);
    } catch (e) {
      console.warn('Passkey dispatch warning:', e);
      setPasskeyError('Unable to transmit editorial passkey. Please retry.');
    } finally {
      setPasskeyLoading(false);
    }
  }, [user, authEmail]);

  const handlePasskeyBoxChange = (index: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    const updated = [...passkeyBoxes];
    updated[index] = char;
    setPasskeyBoxes(updated);

    if (char && index < 5) {
      passkeyInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasskeyKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !passkeyBoxes[index] && index > 0) {
      passkeyInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasskeyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (pasted.length >= 6) {
      const chars = pasted.slice(0, 6).split('');
      setPasskeyBoxes(chars);
      passkeyInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyPasskey = async () => {
    const fullWord = passkeyBoxes.join('').toUpperCase();
    if (fullWord.length !== 6) {
      setPasskeyError('Editorial passkey must contain all 6 letters.');
      return;
    }

    setPasskeyLoading(true);
    setPasskeyError('');
    try {
      const targetUid = user?.uid || 'temp_collector';
      const result = await verifyEmailPasskey(targetUid, fullWord);

      if (result.success) {
        setPasskeyVerifiedDirectly(true);
        const timestamp = new Date().toISOString();
        setEmailVerifiedAt(timestamp);
        if (updateUserProfile) {
          await updateUserProfile({ emailVerified: true });
        }
        setActiveStage(3);
      } else {
        setPasskeyError(result.error || 'Invalid editorial passkey.');
      }
    } catch {
      setPasskeyError('Verification communication error. Please try again.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers for Stage 3: Address Validation (Ola Maps)
  // ---------------------------------------------------------------------------
  const handleValidateAddress = async () => {
    setAddressValidating(true);
    setAddressValidationMsg('');

    try {
      const result: AddressValidationResult = await validateAddress(address);
      setAddressStatus(result.status);
      setAddressValidationMsg(result.message);
      setAddressValidatedVia(result.provider);

      if (result.valid) {
        if (updateUserProfile) {
          await updateUserProfile({
            savedAddresses: [address],
          });
        }
      }
    } catch (e) {
      console.warn('Address validation exception:', e);
      setAddressStatus('invalid');
      setAddressValidationMsg('Coordinates validation failed to reach map server. Please re-check fields.');
    } finally {
      setAddressValidating(false);
    }
  };

  const handleAcknowledgeAddress = () => {
    setAddressStatus('acknowledged');
    setAddressValidatedVia('ManualAcknowledgement');
    setAddressValidationMsg('Coordinates acknowledged by client. Cross-border customs declaration accepted.');
    setActiveStage(4);
  };

  // ---------------------------------------------------------------------------
  // Handlers for Stage 4: Phone Auth (Firebase SMS)
  // ---------------------------------------------------------------------------
  const handleSendPhoneSms = async () => {
    setPhoneError('');
    const isValid = validatePhoneNumber(selectedDialCode, rawPhoneInput);
    if (!isValid) {
      setPhoneError('Please enter a valid cellular number formatted for the selected dialing code.');
      return;
    }

    const e164 = normalizeToE164(selectedDialCode, rawPhoneInput);
    setNormalizedPhone(e164);
    setPhoneLoading(true);

    try {
      const result = await sendPhoneVerificationCode(e164, 'recaptcha-invisible-container');
      if (result.success) {
        setPhoneSmsSent(true);
        setResendCooldown(45);
        if (result.simulated) {
          setDiscreetToastWord('SMS: 123456');
          setTimeout(() => setDiscreetToastWord(null), 10000);
        }
      } else {
        setPhoneError(result.message || 'SMS transmission failed. Please retry.');
      }
    } catch (e) {
      console.warn('SMS dispatch error:', e);
      setPhoneError('SMS gateway communication exception. Please retry.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSmsOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1).replace(/\D/g, '');
    const updated = [...smsOtpBoxes];
    updated[index] = digit;
    setSmsOtpBoxes(updated);

    if (digit && index < 5) {
      smsOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleSmsOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !smsOtpBoxes[index] && index > 0) {
      smsOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPhoneSms = async () => {
    const fullCode = smsOtpBoxes.join('');
    if (fullCode.length !== 6) {
      setPhoneError('Please enter all 6 digits of the SMS verification code.');
      return;
    }

    setPhoneLoading(true);
    setPhoneError('');

    try {
      const targetUid = user?.uid || 'temp_collector';
      const result = await confirmPhoneVerificationCode(targetUid, normalizedPhone, fullCode);

      if (result.success) {
        setPhoneVerifiedDirectly(true);
        const timestamp = new Date().toISOString();
        setPhoneVerifiedAt(timestamp);
        if (updateUserProfile) {
          await updateUserProfile({
            phoneVerified: true,
            phoneNumber: normalizedPhone,
          });
        }
        setActiveStage(5);
      } else {
        setPhoneError(result.error || 'The entered SMS code is invalid.');
      }
    } catch {
      setPhoneError('Failed to confirm SMS verification code. Please retry.');
    } finally {
      setPhoneLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers for Stage 5: Final Order Assembly & Payment Gateway Handoff
  // ---------------------------------------------------------------------------
  const isAllGatesPassed =
    Boolean(user?.uid) &&
    isEmailVerified &&
    isPhoneVerified &&
    (addressStatus === 'validated' || addressStatus === 'acknowledged');

  const handleProceedToTransactionalClearing = async () => {
    if (!isAllGatesPassed) {
      setOrderError('All 4 identity, editorial passkey, postal, and telephonic gates must be authenticated.');
      return;
    }

    if (items.length === 0) {
      setOrderError('Your acquisition cart is currently empty.');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    try {
      const customerInfo: CustomerInfo = {
        fullName: address.fullName || profile?.displayName || user?.displayName || 'Verified Collector',
        email: user?.email || profile?.email || authEmail,
        phone: normalizedPhone || profile?.phoneNumber || '',
      };

      const verificationMetadata: OrderVerificationMetadata = {
        emailVerifiedAt: emailVerifiedAt || new Date().toISOString(),
        phoneVerifiedAt: phoneVerifiedAt || new Date().toISOString(),
        addressValidatedVia,
        addressStatus: addressStatus as 'validated' | 'acknowledged',
        normalizedPhone: normalizedPhone || profile?.phoneNumber || '',
        passkeyUsed: 'VERIFIED_EDITORIAL_WORDKEY',
      };

      const newOrder = await createStorefrontOrder({
        userId: user!.uid,
        customer: customerInfo,
        shippingAddress: {
          ...address,
          phone: normalizedPhone || profile?.phoneNumber || '',
        },
        shippingMethod: {
          id: selectedShippingMethod.id,
          title: selectedShippingMethod.title,
          cost: calculatedShipping,
          estimatedDelivery: selectedShippingMethod.estimatedDelivery,
        },
        items,
        subtotal,
        shippingCost: calculatedShipping,
        taxEstimate,
        total: calculatedTotal,
        currency: 'USD',
        notes: `Authenticated Atelier Order with Ola Maps & SMS verification.`,
        verificationMetadata,
      });

      // Clear cart
      clearCart();

      // Transition to Order Confirmation
      router.push(`/order-success/${newOrder.orderId}`);
    } catch (err: unknown) {
      console.error('Order creation error:', err);
      setOrderError('Unable to stage order with transactional clearing. Please review your connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#111111] font-[family-name:var(--font-inter)] antialiased pt-24 pb-20 px-4 sm:px-6 lg:px-12">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-invisible-container" className="hidden" />

      {/* Discreet Developer Passkey Toast */}
      {discreetToastWord && (
        <div
          id="dev-passkey-toast"
          className="fixed bottom-6 right-6 z-50 bg-[#111111] text-[#f5f5f3] border border-[#d4af37] px-5 py-3 shadow-2xl flex items-center space-x-3 text-xs tracking-wider"
        >
          <div className="w-2 h-2 rounded-none bg-[#d4af37] animate-ping" />
          <div>
            <span className="text-[#8c8c8c] uppercase text-[9px] block">Atelier Dispatch Simulation</span>
            <span className="font-mono text-[#d4af37] font-semibold text-sm tracking-[0.2em]">
              {discreetToastWord}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#e5e5e3]">
          <Link
            href="/"
            className="group flex items-center space-x-2 text-[11px] uppercase tracking-[0.2em] text-[#8c8c8c] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Gallery</span>
          </Link>

          <div className="text-right">
            <span className="font-[family-name:var(--font-cormorant)] text-xl tracking-[0.1em] font-medium block">
              Maison Glint
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#8c8c8c]">
              Authorized Allocation Terminal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: 5-Stage Verification Pipeline */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header / Security Advisory */}
            <div className="bg-[#ffffff] border border-[#e5e5e3] p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-[#d4af37] mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
                      Gated Sovereign Custody Protocol
                    </span>
                  </div>
                  <h1 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
                    Verified Acquisition Dossier
                  </h1>
                  <p className="text-[13px] text-[#8c8c8c] font-light leading-relaxed mt-1 max-w-xl">
                    To eliminate unverified allocations and preserve serial authenticity, Maison Glint requires a 4-point verified customer clearance prior to transactional clearing.
                  </p>
                </div>
              </div>

              {/* Progress Stepper Bar */}
              <div className="grid grid-cols-5 gap-1 mt-6 pt-6 border-t border-[#e5e5e3]">
                {[
                  { step: 1, label: 'Identity' },
                  { step: 2, label: 'Passkey' },
                  { step: 3, label: 'Coordinates' },
                  { step: 4, label: 'Telephony' },
                  { step: 5, label: 'Clearing' },
                ].map((s) => {
                  const isDone =
                    (s.step === 1 && Boolean(user)) ||
                    (s.step === 2 && isEmailVerified) ||
                    (s.step === 3 && (addressStatus === 'validated' || addressStatus === 'acknowledged')) ||
                    (s.step === 4 && isPhoneVerified) ||
                    (s.step === 5 && isAllGatesPassed);

                  const isCurrent = activeStage === s.step;

                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        if (s.step === 1 || isDone || activeStage > s.step) {
                          setActiveStage(s.step);
                        }
                      }}
                      className={`text-left p-2 transition-all border-b-2 ${
                        isCurrent
                          ? 'border-[#111111] bg-[#f9f9f7]'
                          : isDone
                          ? 'border-[#d4af37] bg-[#ffffff]'
                          : 'border-[#e5e5e3] bg-[#ffffff] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-widest text-[#8c8c8c]">0{s.step}</span>
                        {isDone && <CheckCircle2 className="w-3 h-3 text-[#d4af37]" />}
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#111111] block mt-1">
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* STAGE 1: Client Authentication & Identity Sanitation */}
            {/* --------------------------------------------------------------------- */}
            <div
              id="stage-1-auth"
              className={`bg-[#ffffff] border transition-all ${
                activeStage === 1 ? 'border-[#111111] shadow-sm' : 'border-[#e5e5e3]'
              }`}
            >
              <div
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={() => setActiveStage(1)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 flex items-center justify-center text-xs font-mono border ${
                      user
                        ? 'bg-[#111111] text-[#ffffff] border-[#111111]'
                        : 'border-[#111111] text-[#111111]'
                    }`}
                  >
                    {user ? '✓' : '1'}
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#111111]">
                      Client Identity & Account Verification
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#8c8c8c]">
                      {user
                        ? `Authenticated: ${user.email} (UID: ${user.uid.slice(0, 8)}...)`
                        : 'Guest checkout removed · Permanent dossier authentication required'}
                    </p>
                  </div>
                </div>

                {user && (
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#d4af37] px-2.5 py-1 border border-[#d4af37]">
                    Verified Profile
                  </span>
                )}
              </div>

              {activeStage === 1 && (
                <div className="p-6 pt-0 border-t border-[#f0f0ee] space-y-6">
                  {user ? (
                    <div className="bg-[#f9f9f7] border border-[#e5e5e3] p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#111111]">
                            {profile?.displayName || user.displayName || 'Authorized Client'}
                          </span>
                        </div>
                        <p className="text-xs text-[#8c8c8c]">{user.email}</p>
                        <p className="text-[10px] font-mono text-[#8c8c8c]">
                          Atelier UID: {user.uid} · Status: Active Dossier
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStage(2);
                          if (!isEmailVerified && !passkeyDispatched) {
                            handleDispatchWordKey();
                          }
                        }}
                        className="px-5 py-2.5 bg-[#111111] text-[#ffffff] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-colors"
                      >
                        Proceed to Stage 2
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-[#f9f9f7] border-l-2 border-[#111111] text-xs text-[#111111] leading-relaxed">
                        To maintain allocation integrity and prevent fraudulent reservation botting, guest checkout is disabled. Every order must link to an authenticated collector dossier.
                      </div>

                      {/* Google Primary Auth */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={authLoading}
                        className="w-full py-3.5 px-4 bg-[#ffffff] hover:bg-[#f9f9f7] text-[#111111] border border-[#111111] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center space-x-3 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span>Continue with Google Identity</span>
                      </button>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-[#e5e5e3]" />
                        <span className="flex-shrink mx-4 text-[10px] uppercase tracking-[0.25em] text-[#8c8c8c]">
                          or Direct Atelier Credentials
                        </span>
                        <div className="flex-grow border-t border-[#e5e5e3]" />
                      </div>

                      {/* Direct Mode Tabs */}
                      <div className="flex border border-[#e5e5e3]">
                        <button
                          type="button"
                          onClick={() => setAuthMode('register')}
                          className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors ${
                            authMode === 'register' ? 'bg-[#111111] text-[#ffffff]' : 'text-[#8c8c8c] hover:text-[#111111]'
                          }`}
                        >
                          New Client Registration
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('signin')}
                          className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors ${
                            authMode === 'signin' ? 'bg-[#111111] text-[#ffffff]' : 'text-[#8c8c8c] hover:text-[#111111]'
                          }`}
                        >
                          Existing Client Sign-In
                        </button>
                      </div>

                      <form onSubmit={handleEmailAuth} className="space-y-4">
                        {authMode === 'register' && (
                          <div>
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1.5 font-medium">
                              Legal Full Name (Min. 2 Words) *
                            </label>
                            <input
                              type="text"
                              value={authFullName}
                              onChange={(e) => setAuthFullName(e.target.value)}
                              placeholder="e.g. Eleanor Vance"
                              required
                              className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider transition-colors rounded-none"
                            />
                            <span className="text-[9px] text-[#8c8c8c] mt-1 block">
                              Must contain alphabetical first and last name. Used on Certificate of Provenance.
                            </span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1.5 font-medium">
                            Client Email Address *
                          </label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="client@domain.com"
                            required
                            className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider transition-colors rounded-none"
                          />
                          <span className="text-[9px] text-[#8c8c8c] mt-1 block">
                            Ephemeral or throwaway email domains are disallowed.
                          </span>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1.5 font-medium">
                            Account Vault Password *
                          </label>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••••••"
                            required
                            className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider transition-colors rounded-none"
                          />
                        </div>

                        {authError && (
                          <div className="p-3 bg-[#fff8f8] border border-[#f5c6cb] text-xs text-[#721c24] flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-[#d9534f]" />
                            <span>{authError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full py-3.5 bg-[#111111] hover:bg-[#2b2b2b] text-[#ffffff] text-xs uppercase tracking-[0.25em] font-semibold transition-colors disabled:opacity-50"
                        >
                          {authLoading
                            ? 'Verifying Dossier...'
                            : authMode === 'register'
                            ? 'Register Atelier Client Dossier'
                            : 'Sign In to Client Vault'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* STAGE 2: Luxury Word-Key Email Verification */}
            {/* --------------------------------------------------------------------- */}
            <div
              id="stage-2-passkey"
              className={`bg-[#ffffff] border transition-all ${
                activeStage === 2 ? 'border-[#111111] shadow-sm' : 'border-[#e5e5e3]'
              }`}
            >
              <div
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={() => user && setActiveStage(2)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 flex items-center justify-center text-xs font-mono border ${
                      isEmailVerified
                        ? 'bg-[#111111] text-[#ffffff] border-[#111111]'
                        : 'border-[#111111] text-[#111111]'
                    }`}
                  >
                    {isEmailVerified ? '✓' : '2'}
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#111111]">
                      Editorial Passkey Authentication
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#8c8c8c]">
                      {isEmailVerified
                        ? 'Authenticated via Luxury Architectural Word-Key'
                        : '6-letter curatorial passkey verification'}
                    </p>
                  </div>
                </div>

                {isEmailVerified && (
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#d4af37] px-2.5 py-1 border border-[#d4af37]">
                    Email Authenticated
                  </span>
                )}
              </div>

              {activeStage === 2 && (
                <div className="p-6 pt-0 border-t border-[#f0f0ee] space-y-6">
                  {isEmailVerified ? (
                    <div className="bg-[#f9f9f7] border border-[#d4af37] p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#111111]">
                            Editorial Passkey Verified
                          </span>
                        </div>
                        <p className="text-xs text-[#8c8c8c]">
                          Destination Inbox: <span className="font-mono text-[#111111]">{user?.email}</span>
                        </p>
                        <p className="text-[10px] font-mono text-[#8c8c8c]">
                          Timestamp: {emailVerifiedAt || 'Session Verified'} · Security Level: Curatorial Passkey
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStage(3)}
                        className="px-5 py-2.5 bg-[#111111] text-[#ffffff] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-colors"
                      >
                        Proceed to Coordinates
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="border-l-2 border-[#d4af37] pl-4 py-1">
                        <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#111111] italic leading-snug">
                          &ldquo;Enter the editorial passkey transmitted to your inbox to authenticate your atelier client profile.&rdquo;
                        </p>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] block mt-1">
                          Curated architectural phrase · 10-minute dispatch expiration
                        </span>
                      </div>

                      {/* 6-box input */}
                      <div className="flex justify-between max-w-sm mx-auto gap-2">
                        {passkeyBoxes.map((char, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              passkeyInputRefs.current[idx] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={char}
                            onChange={(e) => handlePasskeyBoxChange(idx, e.target.value)}
                            onKeyDown={(e) => handlePasskeyKeyDown(idx, e)}
                            onPaste={handlePasskeyPaste}
                            className="w-12 h-14 text-center font-mono text-xl font-bold bg-[#ffffff] border border-[#d6d6d4] focus:border-[#d4af37] focus:border-b-2 outline-none uppercase text-[#111111] transition-all rounded-none"
                          />
                        ))}
                      </div>

                      {passkeyError && (
                        <div className="p-3 bg-[#fff8f8] border border-[#f5c6cb] text-xs text-[#721c24] flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-[#d9534f]" />
                          <span>{passkeyError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={handleDispatchWordKey}
                          disabled={passkeyLoading}
                          className="flex items-center space-x-1.5 text-[11px] uppercase tracking-[0.2em] text-[#8c8c8c] hover:text-[#111111] transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${passkeyLoading ? 'animate-spin' : ''}`} />
                          <span>Re-transmit Passkey</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleVerifyPasskey}
                          disabled={passkeyLoading}
                          className="px-6 py-3 bg-[#111111] hover:bg-[#2b2b2b] text-[#ffffff] text-xs uppercase tracking-[0.2em] font-semibold transition-colors disabled:opacity-50"
                        >
                          {passkeyLoading ? 'Authenticating...' : 'Authenticate Passkey'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* STAGE 3: Address Validation Engine (Ola Maps) */}
            {/* --------------------------------------------------------------------- */}
            <div
              id="stage-3-address"
              className={`bg-[#ffffff] border transition-all ${
                activeStage === 3 ? 'border-[#111111] shadow-sm' : 'border-[#e5e5e3]'
              }`}
            >
              <div
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={() => isEmailVerified && setActiveStage(3)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 flex items-center justify-center text-xs font-mono border ${
                      addressStatus === 'validated' || addressStatus === 'acknowledged'
                        ? 'bg-[#111111] text-[#ffffff] border-[#111111]'
                        : 'border-[#111111] text-[#111111]'
                    }`}
                  >
                    {addressStatus === 'validated' || addressStatus === 'acknowledged' ? '✓' : '3'}
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#111111]">
                      Sovereign Address Coordinates & Ola Maps Cross-Check
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#8c8c8c]">
                      {addressStatus === 'validated'
                        ? 'Coordinates and Postal Alignment Verified via Ola Maps'
                        : addressStatus === 'acknowledged'
                        ? 'Coordinates Acknowledged by Client'
                        : 'Cross-matching Postal Code vs. State vs. Country'}
                    </p>
                  </div>
                </div>

                {(addressStatus === 'validated' || addressStatus === 'acknowledged') && (
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#d4af37] px-2.5 py-1 border border-[#d4af37]">
                    {addressStatus === 'validated' ? 'Ola Maps Verified' : 'Acknowledged'}
                  </span>
                )}
              </div>

              {activeStage === 3 && (
                <div className="p-6 pt-0 border-t border-[#f0f0ee] space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                        Recipient Collector Name *
                      </label>
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        placeholder={profile?.displayName || user?.displayName || 'Collector Full Name'}
                        required
                        className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider rounded-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                        Street Address (Premises / Building / Street) *
                      </label>
                      <input
                        type="text"
                        value={address.line1}
                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                        placeholder="e.g. 742 Evergreen Terrace"
                        required
                        className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider rounded-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                        Apartment / Suite / Curatorial Wing (Optional)
                      </label>
                      <input
                        type="text"
                        value={address.line2 || ''}
                        onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                        placeholder="Suite 4B"
                        className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider rounded-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                        City / Settlement *
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="e.g. Bengaluru, New York, London"
                        required
                        className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider rounded-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                        State / Province / Region *
                      </label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="e.g. Karnataka / California / London"
                        required
                        className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider rounded-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                        Postal Code (PIN / ZIP) *
                      </label>
                      <input
                        type="text"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        placeholder="e.g. 560001 or 90210"
                        required
                        className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider rounded-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                        Sovereign Country *
                      </label>
                      <select
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider rounded-none"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address Validation Feedback */}
                  {addressValidationMsg && (
                    <div
                      className={`p-4 border text-xs leading-relaxed flex items-start space-x-3 ${
                        addressStatus === 'validated'
                          ? 'bg-[#f7f9f7] border-[#2e7d32] text-[#1b5e20]'
                          : addressStatus === 'mismatch'
                          ? 'bg-[#fffbf0] border-[#d4af37] text-[#8a6d3b]'
                          : addressStatus === 'acknowledged'
                          ? 'bg-[#f9f9f7] border-[#8c8c8c] text-[#111111]'
                          : 'bg-[#fff8f8] border-[#f5c6cb] text-[#721c24]'
                      }`}
                    >
                      {addressStatus === 'validated' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2e7d32] mt-0.5" />
                      ) : addressStatus === 'mismatch' ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-[#d4af37] mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 shrink-0 text-[#8c8c8c] mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold block uppercase text-[10px] tracking-wider">
                          {addressStatus === 'validated'
                            ? 'Ola Maps Validation Passed'
                            : addressStatus === 'mismatch'
                            ? 'Geographical Boundary Discrepancy'
                            : 'Address Verification Status'}
                        </span>
                        <span>{addressValidationMsg}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleValidateAddress}
                      disabled={addressValidating || !address.line1 || !address.postalCode}
                      className="px-6 py-3 bg-[#111111] hover:bg-[#2b2b2b] text-[#ffffff] text-xs uppercase tracking-[0.2em] font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {addressValidating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Cross-Matching Coordinates...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>Validate Coordinates (Ola Maps)</span>
                        </>
                      )}
                    </button>

                    {/* If validated or if mismatch/un-pinpointed, provide acknowledge path so user is never hard blocked */}
                    {addressStatus === 'validated' && (
                      <button
                        type="button"
                        onClick={() => setActiveStage(4)}
                        className="px-6 py-3 bg-[#d4af37] hover:bg-[#c5a059] text-[#111111] text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
                      >
                        Confirm & Proceed to Phone Verification
                      </button>
                    )}

                    {addressStatus === 'mismatch' && (
                      <button
                        type="button"
                        onClick={handleAcknowledgeAddress}
                        className="px-4 py-3 bg-[#ffffff] border border-[#111111] text-[#111111] hover:bg-[#f9f9f7] text-[10px] uppercase tracking-[0.15em] font-medium transition-colors"
                      >
                        Acknowledge & Confirm Address Coordinates
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* STAGE 4: Phone Number Verification (Firebase SMS Auth) */}
            {/* --------------------------------------------------------------------- */}
            <div
              id="stage-4-phone"
              className={`bg-[#ffffff] border transition-all ${
                activeStage === 4 ? 'border-[#111111] shadow-sm' : 'border-[#e5e5e3]'
              }`}
            >
              <div
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={() =>
                  (addressStatus === 'validated' || addressStatus === 'acknowledged') && setActiveStage(4)
                }
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 flex items-center justify-center text-xs font-mono border ${
                      isPhoneVerified
                        ? 'bg-[#111111] text-[#ffffff] border-[#111111]'
                        : 'border-[#111111] text-[#111111]'
                    }`}
                  >
                    {isPhoneVerified ? '✓' : '4'}
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#111111]">
                      Telephonic Cellular Authorization
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#8c8c8c]">
                      {isPhoneVerified
                        ? `Authenticated: ${normalizedPhone || profile?.phoneNumber} (E.164 Cleared)`
                        : 'Firebase SMS OTP verification · Carrier authentication'}
                    </p>
                  </div>
                </div>

                {isPhoneVerified && (
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#d4af37] px-2.5 py-1 border border-[#d4af37]">
                    SMS Verified
                  </span>
                )}
              </div>

              {activeStage === 4 && (
                <div className="p-6 pt-0 border-t border-[#f0f0ee] space-y-6">
                  {isPhoneVerified ? (
                    <div className="bg-[#f9f9f7] border border-[#d4af37] p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#111111]">
                            Telephonic Authorization Cleared
                          </span>
                        </div>
                        <p className="text-xs text-[#8c8c8c]">
                          Normalized Cellular:{' '}
                          <span className="font-mono text-[#111111]">{normalizedPhone || profile?.phoneNumber}</span>
                        </p>
                        <p className="text-[10px] font-mono text-[#8c8c8c]">
                          Timestamp: {phoneVerifiedAt || 'Session Verified'} · Protocol: Firebase Phone Auth
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStage(5)}
                        className="px-5 py-2.5 bg-[#111111] text-[#ffffff] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-colors"
                      >
                        Proceed to Clearing
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-xs text-[#8c8c8c] leading-relaxed">
                        To guarantee secure courier dispatch hand-off and customs contact, every order requires direct carrier confirmation through an SMS one-time passkey.
                      </p>

                      {/* Phone Entry */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                            Priority Region Dialing Code *
                          </label>
                          <select
                            value={selectedDialCode}
                            onChange={(e) => setSelectedDialCode(e.target.value)}
                            className="w-full px-3 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider rounded-none"
                          >
                            {PRIORITY_DIAL_CODES.map((d) => (
                              <option key={d.code + d.name} value={d.code}>
                                {d.flag} {d.name} ({d.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1 font-medium">
                            Cellular Number *
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 bg-[#f9f9f7] border border-r-0 border-[#d6d6d4] text-xs font-mono text-[#111111]">
                              {selectedDialCode}
                            </span>
                            <input
                              type="tel"
                              value={rawPhoneInput}
                              onChange={(e) => setRawPhoneInput(e.target.value)}
                              placeholder={
                                PRIORITY_DIAL_CODES.find((d) => d.code === selectedDialCode)?.samplePlaceholder ||
                                '415 555 2671'
                              }
                              className="w-full px-4 py-3 bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-xs text-[#111111] tracking-wider font-mono rounded-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Transmit Button */}
                      {!phoneSmsSent && (
                        <button
                          type="button"
                          onClick={handleSendPhoneSms}
                          disabled={phoneLoading || !rawPhoneInput}
                          className="w-full py-3.5 bg-[#111111] hover:bg-[#2b2b2b] text-[#ffffff] text-xs uppercase tracking-[0.2em] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{phoneLoading ? 'Transmitting Carrier SMS...' : 'Transmit SMS Verification Code'}</span>
                        </button>
                      )}

                      {/* OTP Section once sent */}
                      {phoneSmsSent && (
                        <div className="space-y-4 pt-4 border-t border-[#f0f0ee]">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-[0.15em] text-[#111111] font-medium">
                              Enter 6-Digit SMS Verification Code:
                            </span>
                            <span className="text-[11px] text-[#8c8c8c] font-mono">
                              {resendCooldown > 0 ? (
                                `Resend passkey in ${resendCooldown}s`
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendPhoneSms}
                                  className="text-[#111111] hover:underline uppercase text-[10px] tracking-wider"
                                >
                                  Resend Code
                                </button>
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between max-w-xs mx-auto gap-2">
                            {smsOtpBoxes.map((char, idx) => (
                              <input
                                key={idx}
                                ref={(el) => {
                                  smsOtpRefs.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={char}
                                onChange={(e) => handleSmsOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleSmsOtpKeyDown(idx, e)}
                                className="w-11 h-13 text-center font-mono text-lg font-bold bg-[#ffffff] border border-[#d6d6d4] focus:border-[#111111] outline-none text-[#111111] transition-all rounded-none"
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleVerifyPhoneSms}
                            disabled={phoneLoading}
                            className="w-full py-3.5 bg-[#111111] hover:bg-[#2b2b2b] text-[#ffffff] text-xs uppercase tracking-[0.25em] font-semibold transition-colors disabled:opacity-50"
                          >
                            {phoneLoading ? 'Verifying Code...' : 'Authenticate Telephone'}
                          </button>
                        </div>
                      )}

                      {phoneError && (
                        <div className="p-3 bg-[#fff8f8] border border-[#f5c6cb] text-xs text-[#721c24] flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-[#d9534f]" />
                          <span>{phoneError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* STAGE 5: Logistics Tier & Final Clearing */}
            {/* --------------------------------------------------------------------- */}
            <div
              id="stage-5-clearing"
              className={`bg-[#ffffff] border transition-all ${
                activeStage === 5 ? 'border-[#111111] shadow-sm' : 'border-[#e5e5e3]'
              }`}
            >
              <div
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={() => isPhoneVerified && setActiveStage(5)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center text-xs font-mono border border-[#111111] text-[#111111]">
                    5
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#111111]">
                      Logistics Tier & Transactional Clearing
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#8c8c8c]">
                      Armored freight courier & gateway staging
                    </p>
                  </div>
                </div>
              </div>

              {activeStage === 5 && (
                <div className="p-6 pt-0 border-t border-[#f0f0ee] space-y-6">
                  {/* Shipping Tier Options */}
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] font-medium">
                      Select Insured Transit Class:
                    </label>
                    {SHIPPING_METHODS.map((method) => {
                      const costDisplay =
                        subtotal >= 1000 && method.id === 'standard-insured'
                          ? 'Complimentary'
                          : `$${method.cost} USD`;

                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedMethodId(method.id)}
                          className={`p-4 border cursor-pointer transition-all ${
                            selectedMethodId === method.id
                              ? 'border-[#111111] bg-[#f9f9f7]'
                              : 'border-[#e5e5e3] hover:border-[#8c8c8c] bg-[#ffffff]'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="shippingMethod"
                                checked={selectedMethodId === method.id}
                                onChange={() => setSelectedMethodId(method.id)}
                                className="accent-[#111111]"
                              />
                              <div>
                                <h4 className="font-medium text-xs text-[#111111] tracking-wider uppercase">
                                  {method.title}
                                </h4>
                                <p className="text-[11px] text-[#8c8c8c] mt-0.5">{method.description}</p>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-semibold text-[#111111]">{costDisplay}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4 Verification Seals Display */}
                  <div className="p-4 bg-[#f9f9f7] border border-[#e5e5e3] space-y-2.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111] block">
                      Clearance Authentication Checklist:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        {user ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-[#d9534f]" />
                        )}
                        <span className="text-[#111111]">
                          Dossier Identity: {user ? 'Verified (UID Cleared)' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isEmailVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-[#d9534f]" />
                        )}
                        <span className="text-[#111111]">
                          Editorial Passkey: {isEmailVerified ? 'Authenticated' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {addressStatus === 'validated' || addressStatus === 'acknowledged' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-[#d9534f]" />
                        )}
                        <span className="text-[#111111]">
                          Postal Coordinates: {addressStatus === 'validated' ? 'Ola Maps Verified' : addressStatus === 'acknowledged' ? 'Acknowledged' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isPhoneVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-[#d9534f]" />
                        )}
                        <span className="text-[#111111]">
                          Telephonic SMS: {isPhoneVerified ? 'E.164 Authenticated' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {orderError && (
                    <div className="p-3 bg-[#fff8f8] border border-[#f5c6cb] text-xs text-[#721c24] flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#d9534f]" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  {/* FINAL CTA BUTTON */}
                  <button
                    type="button"
                    onClick={handleProceedToTransactionalClearing}
                    disabled={isSubmitting || !isAllGatesPassed}
                    className="w-full py-4 bg-[#111111] hover:bg-[#2b2b2b] text-[#ffffff] text-xs uppercase tracking-[0.25em] font-semibold transition-all disabled:opacity-40 flex items-center justify-center space-x-3 border border-[#111111]"
                  >
                    <Lock className="w-4 h-4 text-[#d4af37]" />
                    <span>
                      {isSubmitting
                        ? 'Staging Order with Vault Gateway...'
                        : isAllGatesPassed
                        ? 'PROCEED TO TRANSACTIONAL CLEARING'
                        : 'COMPLETE 4-STAGE CLIENT VERIFICATION ABOVE'}
                    </span>
                  </button>

                  <p className="text-[10px] text-center text-[#8c8c8c] tracking-wider uppercase">
                    Order is securely recorded with status pending_payment in Firestore prior to gateway clearing.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Order Summary & Security Certifications */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="bg-[#ffffff] border border-[#e5e5e3] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e3]">
                <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-medium text-[#111111]">
                  Acquisition Summary
                </h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c]">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} Sculpted Works
                </span>
              </div>

              {/* Line Items */}
              <div className="divide-y divide-[#f0f0ee] max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex gap-3 first:pt-0 last:pb-0">
                    <div className="relative w-14 h-14 bg-[#ecece9] border border-[#e5e5e3] shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="font-[family-name:var(--font-cormorant)] text-base font-medium text-[#111111] leading-tight">
                          {item.name}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#111111]">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#8c8c8c]">
                        <span>Qty: {item.quantity}</span>
                        {item.specifications?.gauge && <span>{item.specifications.gauge}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="pt-4 border-t border-[#e5e5e3] space-y-2.5 text-xs">
                <div className="flex justify-between text-[#8c8c8c]">
                  <span>Sculptural Subtotal</span>
                  <span className="font-mono text-[#111111]">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#8c8c8c]">
                  <span>Insured Courier Freight</span>
                  <span className="font-mono text-[#111111]">
                    {calculatedShipping === 0 ? 'Complimentary' : `$${calculatedShipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#8c8c8c]">
                  <span>Estimated Atelier Duty / Tax</span>
                  <span className="font-mono text-[#111111]">${taxEstimate.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-[#e5e5e3] flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-[0.15em] font-semibold text-[#111111]">
                    Total Investment
                  </span>
                  <span className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-[#111111]">
                    ${calculatedTotal.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Trust Assurances */}
              <div className="pt-4 border-t border-[#f0f0ee] space-y-3">
                <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.15em] text-[#8c8c8c]">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>Sovereign Customs Clearance Documentation</span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.15em] text-[#8c8c8c]">
                  <Truck className="w-4 h-4 text-[#d4af37]" />
                  <span>Insured Direct Courier Hand-Delivery</span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.15em] text-[#8c8c8c]">
                  <Lock className="w-4 h-4 text-[#d4af37]" />
                  <span>256-Bit Cryptographic Vault Order Ledger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
