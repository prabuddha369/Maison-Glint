'use client';

import { useState } from 'react';
import { X, Check, ShieldCheck, Sparkles, Copy, ArrowUpRight } from 'lucide-react';

interface PriorityAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, serial: string) => void;
}

export default function PriorityAccessModal({
  isOpen,
  onClose,
  onSuccess,
}: PriorityAccessModalProps) {
  const [collectorName, setCollectorName] = useState('');
  const [collectorEmail, setCollectorEmail] = useState('');
  const [serialRange, setSerialRange] = useState('#001–#050 (Founders)');
  const [discipline, setDiscipline] = useState('Private Residence');
  const [completedSerial, setCompletedSerial] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectorEmail) return;

    let prefixNum = 18;
    if (serialRange.includes('Founders')) prefixNum = Math.floor(Math.random() * 49) + 1;
    else if (serialRange.includes('#051')) prefixNum = Math.floor(Math.random() * 99) + 51;
    else prefixNum = Math.floor(Math.random() * 99) + 151;

    const generatedCode = `MG-01-${String(prefixNum).padStart(3, '0')}`;
    setCompletedSerial(generatedCode);
    onSuccess(collectorEmail, generatedCode);
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
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-[#747878] hover:text-[#111111] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {!completedSerial ? (
          <div>
            {/* Header */}
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-medium text-[#c5a059] mb-1.5 sm:mb-2">
              Edition 01 Allocation
            </div>
            <h3 className="font-[family-name:var(--font-cormorant)] text-[26px] sm:text-[34px] md:text-[38px] font-light text-[#111111] leading-tight mb-2 sm:mb-3">
              Request Priority Access
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[#444748] font-light leading-[1.6] mb-6 sm:mb-8">
              Register for exclusive reservation access to Batch 01 (250 serialized
              pieces). Allocations granted in chronological order of submission.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                  Collector Full Name
                </label>
                <input
                  type="text"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  placeholder="E.G. CLAUDIA WEBER"
                  required
                  className="w-full bg-[#f4f4f2] text-[#111111] text-[11px] sm:text-[12px] uppercase tracking-[0.14em] px-3.5 sm:px-4 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={collectorEmail}
                  onChange={(e) => setCollectorEmail(e.target.value)}
                  placeholder="COLLECTOR@ATELIER.COM"
                  required
                  className="w-full bg-[#f4f4f2] text-[#111111] text-[11px] sm:text-[12px] uppercase tracking-[0.14em] px-3.5 sm:px-4 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                    Preferred Batch Range
                  </label>
                  <select
                    value={serialRange}
                    onChange={(e) => setSerialRange(e.target.value)}
                    className="w-full bg-[#f4f4f2] text-[#111111] text-[10px] sm:text-[11px] uppercase tracking-[0.14em] px-3 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors"
                  >
                    <option>#001–#050 (Founders)</option>
                    <option>#051–#150 (Patrons)</option>
                    <option>#151–#250 (General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold text-[#111111] mb-1.5 sm:mb-2">
                    Application Ritual
                  </label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full bg-[#f4f4f2] text-[#111111] text-[10px] sm:text-[11px] uppercase tracking-[0.14em] px-3 py-2.5 sm:py-3 border border-[#e5e5e3] focus:outline-none focus:border-[#111111] transition-colors"
                  >
                    <option>Private Residence</option>
                    <option>Hospitality & Fine Dining</option>
                    <option>Design & Sculpture Curation</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#111111] text-[#f9f9f7] py-3.5 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer border border-[#111111]"
                >
                  Confirm Priority Request
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Certificate View */
          <div className="text-left animate-fadeIn">
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.22em] font-semibold text-[#c5a059] mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Allocation Reserved</span>
            </div>

            <h3 className="font-[family-name:var(--font-cormorant)] text-[34px] font-light text-[#111111] mb-3">
              Serial {completedSerial}
            </h3>

            <p className="text-[13px] text-[#444748] font-light leading-[1.6] mb-6">
              Thank you, {collectorName || 'Collector'}. Your provisional serial
              slot in Edition 01 has been registered in our Zurich archive.
            </p>

            <div className="bg-[#f4f4f2] border border-[#e5e5e3] p-5 mb-6 space-y-2.5 text-[11px]">
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#747878] uppercase tracking-[0.18em]">
                  Collector
                </span>
                <span className="font-medium text-[#111111]">{collectorEmail}</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e5e3] pb-2">
                <span className="text-[#747878] uppercase tracking-[0.18em]">
                  Batch Specification
                </span>
                <span className="font-medium text-[#111111]">
                  AISI 316 / Mirror Buff (280mm)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#747878] uppercase tracking-[0.18em]">
                  Release Window
                </span>
                <span className="font-medium text-[#c5a059]">
                  48H Advance Window
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyCode}
                className="flex-1 bg-[#111111] text-[#f9f9f7] py-3.5 text-[10px] uppercase tracking-[0.18em] font-medium hover:bg-[#2b2b2b] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Serial Reference'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3.5 border border-[#111111] text-[#111111] text-[10px] uppercase tracking-[0.18em] font-medium hover:bg-[#111111] hover:text-[#f9f9f7] transition-all cursor-pointer"
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
