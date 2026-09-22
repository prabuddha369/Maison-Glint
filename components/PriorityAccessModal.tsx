'use client';

import { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Copy, Mail, Lock, Globe, Loader2, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createPriorityReservation } from '../lib/reservations';
import type { Product } from '../types/store';

interface PriorityAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, serialCode: string) => void;
  products?: Product[];
  selectedProductId?: string;
}

export default function PriorityAccessModal({
  isOpen,
  onClose,
  onSuccess,
  products = [],
  selectedProductId,
}: PriorityAccessModalProps) {
  const { user, signUpWithEmail } = useAuth();
  const [collectorName, setCollectorName] = useState('');
  const [collectorEmail, setCollectorEmail] = useState('');
  const [password, setPassword] = useState('');
  const [destination, setDestination] = useState('New York, NY / United States');
  const [chosenProductId, setChosenProductId] = useState(
    selectedProductId || products[0]?.id || 'object-01-the-glint-plate'
  );
  const [discipline, setDiscipline] = useState('The Evening Table (Dinner & Hosting)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [completedSerial, setCompletedSerial] = useState<string | null>(null);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [assignedStatus, setAssignedStatus] = useState<string>('allocated');
  const [reservedProduct, setReservedProduct] = useState<Product | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.displayName) setCollectorName(user.displayName);
      if (user.email) setCollectorEmail(user.email);
    }
  }, [user]);

  // Only initialize chosenProductId when modal transitions to open (prevents background carousel cycling from overwriting user choice)
  useEffect(() => {
    if (isOpen) {
      if (selectedProductId) {
        setChosenProductId(selectedProductId);
      } else if (products.length > 0 && !chosenProductId) {
        setChosenProductId(products[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const selectedProduct = products.find((p) => p.id === chosenProductId) || products[0];
  const displayProduct = reservedProduct || selectedProduct;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!collectorEmail) return;

    setIsSubmitting(true);
    try {
      let currentUserId = user?.uid || null;

      if (!user) {
        if (!password || password.length < 6) {
          setErrorMsg('Please specify a secure collector passphrase of at least 6 characters.');
          setIsSubmitting(false);
          return;
        }

        try {
          await signUpWithEmail(
            collectorEmail,
            password,
            collectorName.trim() || 'Collector'
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Registration error.';
          const lowerMsg = msg.toLowerCase();
          // If already registered or needs email verification, proceed with reservation creation
          if (
            !lowerMsg.includes('already registered') &&
            !lowerMsg.includes('check your email') &&
            !lowerMsg.includes('confirm')
          ) {
            setErrorMsg(msg);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Freeze product snapshot to prevent carousel race conditions
      const productToReserve = products.find((p) => p.id === chosenProductId) || products[0];
      setReservedProduct(productToReserve);

      // Execute atomic reservation in Supabase
      const reservation = await createPriorityReservation({
        productId: chosenProductId,
        collectorName: collectorName.trim() || user?.displayName || 'Collector',
        collectorEmail: user?.email || collectorEmail.trim(),
        destination: destination.trim(),
        ritual: discipline,
        userId: currentUserId,
      });

      setCompletedSerial(reservation.serialNumber);
      setIsExistingRecord(!!reservation.isExisting);
      setAssignedStatus(reservation.status);
      setReservationExpiresAt(reservation.expiresAt);

      if (!user) {
        setConfirmationPending(true);
      }
      onSuccess(collectorEmail, reservation.serialNumber);

      // Non-blocking background email dispatch via Zoho SMTP
      fetch('/api/send-reservation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: reservation.serialNumber,
          collectorName: collectorName.trim() || user?.displayName || 'Collector',
          collectorEmail: user?.email || collectorEmail.trim(),
          productName: productToReserve?.name || 'Object 01 — The Glint Plate',
          ritual: discipline,
          destination: destination.trim(),
          specification:
            productToReserve?.specifications?.finish ||
            productToReserve?.specifications?.gauge ||
            'Double Buff 8K Mirror (280mm)',
          status: reservation.status,
          expiresAt: reservation.expiresAt,
        }),
      }).catch((emailErr) => {
        console.warn('Background reservation email notice:', emailErr);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record reservation.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (!completedSerial) return;
    navigator.clipboard.writeText(completedSerial);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      {/* Modal Container */}
      <div
        id="priority-access-modal"
        className="relative w-full max-w-lg bg-[#f9f9f7] border border-[#e5e5e3] p-5 sm:p-8 md:p-10 shadow-2xl transition-all max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close allocation modal"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-[#595D5D] hover:text-[#111111] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {!completedSerial ? (
          <div>
            {/* Header */}
            <div className="text-xs uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-1.5 sm:mb-2">
              Edition 01 Allocation
            </div>
            <h3 className="font-[family-name:var(--font-cormorant)] text-[26px] sm:text-[34px] md:text-[38px] font-light text-[#111111] leading-tight mb-2 sm:mb-3">
              Request Priority Access
            </h3>
            <p className="text-xs sm:text-[13px] text-[#444748] font-light leading-[1.6] mb-6 sm:mb-8">
              Register for exclusive reservation access to Batch 01 (250 serialized
              pieces). Allocations granted in chronological order of verified submission.
            </p>

            {errorMsg && (
              <div className="mb-4 bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] px-3.5 py-2.5 text-xs font-medium leading-relaxed">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                  Collector Full Name
                </label>
                <input
                  type="text"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  placeholder="E.G. CLAUDIA WEBER"
                  required
                  className="w-full bg-[#f4f4f2] text-[#111111] text-xs uppercase tracking-[0.14em] px-3.5 sm:px-4 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={collectorEmail}
                  onChange={(e) => setCollectorEmail(e.target.value)}
                  placeholder="COLLECTOR@ATELIER.COM"
                  required
                  className="w-full bg-[#f4f4f2] text-[#111111] text-xs uppercase tracking-[0.14em] px-3.5 sm:px-4 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>

              {!user && (
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                    Collector Passphrase
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="MINIMUM 6 CHARACTERS"
                    required
                    minLength={6}
                    className="w-full bg-[#f4f4f2] text-[#111111] text-xs tracking-[0.14em] px-3.5 sm:px-4 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors"
                  />
                  <span className="text-xs text-[#595D5D] font-light mt-1 block">
                    Secures your client dossier and allocation records on the Atelier portal.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                  Destination (City & Country)
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="E.G. NEW YORK, NY / UNITED STATES"
                  required
                  className="w-full bg-[#f4f4f2] text-[#111111] text-xs uppercase tracking-[0.14em] px-3.5 sm:px-4 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                    Reserved Object
                  </label>
                  <select
                    value={chosenProductId}
                    onChange={(e) => setChosenProductId(e.target.value)}
                    className="w-full bg-[#f4f4f2] text-[#111111] text-xs uppercase tracking-[0.14em] px-3 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors truncate"
                  >
                    {products && products.length > 0 ? (
                      products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name}
                        </option>
                      ))
                    ) : (
                      <option value="object-01-the-glint-plate">Object 01 — The Glint Plate</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                    Application Ritual
                  </label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full bg-[#f4f4f2] text-[#111111] text-xs uppercase tracking-[0.14em] px-3 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors truncate"
                  >
                    <option>The Evening Table (Dinner & Hosting)</option>
                    <option>Living Space & Quiet Centrepiece</option>
                    <option>Boutique Hospitality & Private Dining</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#111111] text-[#f9f9f7] py-3.5 sm:py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer border border-[#111111] disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />}
                  <span>{isSubmitting ? 'Registering Slot…' : 'Confirm Priority Request'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : confirmationPending ? (
          /* Confirmation Dossier Dispatched View (Supabase email gate) */
          <div className="text-left animate-fadeIn">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.22em] font-semibold text-[#c5a059] mb-2">
              <Mail className="w-4 h-4" />
              <span>Verification Dossier Dispatched</span>
            </div>

            <h3 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[36px] font-light text-[#111111] mb-3 leading-tight">
              Provisional Slot {completedSerial}
            </h3>

            <p className="text-[13px] text-[#444748] font-light leading-[1.6] mb-6">
              Thank you, {collectorName || 'Collector'}. Your provisional serial slot in Edition 01 has been recorded in our Zurich archive.
              A verification dossier has been dispatched to{' '}
              <strong className="font-semibold text-[#111111]">{collectorEmail}</strong>.
            </p>

            <div className="bg-[#f4f4f2] border border-[#e5e5e3] p-5 mb-6 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Reserved Object</span>
                <span className="font-medium text-[#111111] text-right truncate max-w-[220px]">
                  {displayProduct?.name || 'Object 01 — The Glint Plate'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Application Ritual</span>
                <span className="font-medium text-[#111111] text-right truncate max-w-[220px]">{discipline}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Collector</span>
                <span className="font-medium text-[#111111]">{collectorEmail}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Destination</span>
                <span className="font-medium text-[#111111]">{destination}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Batch Specification</span>
                <span className="font-medium text-[#111111] text-right">
                  {displayProduct?.specifications?.finish || displayProduct?.specifications?.gauge || 'AISI 316 / Mirror Buff (280mm)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Status</span>
                <span className="font-medium text-[#c5a059]">Email Verification Pending</span>
              </div>
            </div>

            <p className="text-xs text-[#595D5D] leading-relaxed mb-6 font-light">
              Please open the verification link in your inbox to confirm your Collector Profile and finalize the provisional allocation.
            </p>

            <div className="flex gap-3">
              <button
                onClick={copyCode}
                className="flex-1 bg-[#111111] text-[#f9f9f7] py-3.5 text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Serial Reference'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3.5 border border-[#111111] text-[#111111] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#111111] hover:text-[#f9f9f7] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Instant Authenticated Allocation Reserved Certificate View */
          <div className="text-left animate-fadeIn">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.22em] font-semibold text-[#c5a059] mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isExistingRecord
                  ? 'Existing Allocation Retrieved'
                  : assignedStatus === 'waitlist'
                  ? 'Priority Waitlist Slot Registered'
                  : 'Allocation Reserved in Zurich Archive'}
              </span>
            </div>

            <h3 className="font-[family-name:var(--font-cormorant)] text-[34px] font-light text-[#111111] mb-3">
              Serial {completedSerial}
            </h3>

            <p className="text-[13px] text-[#444748] font-light leading-[1.6] mb-6">
              Thank you, {collectorName || 'Collector'}. {isExistingRecord ? 'Your active priority serial reservation is recorded in our Zurich archive.' : 'Your provisional serial slot in Edition 01 has been registered in our Zurich archive.'}
            </p>

            <div className="bg-[#f4f4f2] border border-[#e5e5e3] p-5 mb-6 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Reserved Object</span>
                <span className="font-medium text-[#111111] text-right truncate max-w-[220px]">
                  {displayProduct?.name || 'Object 01 — The Glint Plate'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Application Ritual</span>
                <span className="font-medium text-[#111111] text-right truncate max-w-[220px]">{discipline}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Collector</span>
                <span className="font-medium text-[#111111]">{collectorEmail}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Destination</span>
                <span className="font-medium text-[#111111]">{destination}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Batch Specification</span>
                <span className="font-medium text-[#111111] text-right">
                  {displayProduct?.specifications?.finish || displayProduct?.specifications?.gauge || 'AISI 316 / Mirror Buff (280mm)'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Validity Window</span>
                <span className="font-medium text-[#c5a059] text-right">
                  48 Hours {reservationExpiresAt ? `(until ${new Date(reservationExpiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#595D5D] uppercase tracking-[0.18em]">Status</span>
                <span className="font-medium text-[#c5a059] uppercase">
                  {assignedStatus === 'waitlist' ? 'Waitlist (Next In Line)' : 'Allocated Serial Slot'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#595D5D] leading-relaxed mb-6 font-light">
              This provisional allocation is reserved for 48 hours. To secure your serial piece before it is deallocated and returned to the atelier archive pool, please log into your Collector Account during this window to complete your setting order.
            </p>

            <div className="flex gap-3">
              <button
                onClick={copyCode}
                className="flex-1 bg-[#111111] text-[#f9f9f7] py-3.5 text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Serial Reference'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3.5 border border-[#111111] text-[#111111] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#111111] hover:text-[#f9f9f7] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
