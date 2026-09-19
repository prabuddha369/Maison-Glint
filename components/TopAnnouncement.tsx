'use client';

export default function TopAnnouncement({
  onOpenAllocation,
}: {
  onOpenAllocation?: () => void;
}) {
  return (
    <div
      id="announcement-banner"
      className="w-full bg-[#d4af37] border-b border-[#bfa030] py-2 px-3 sm:px-4 text-center select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#111111] overflow-hidden">
        <span className="inline-block w-1.5 h-1.5 bg-[#111111] rounded-none animate-pulse shrink-0" />
        <span className="font-semibold text-[#111111] whitespace-nowrap">Maison Glint</span>
        <span className="hidden sm:inline text-[#111111]/40">—</span>
        <span className="hidden sm:inline text-[#111111]/90 font-medium">The First Chapter · Batch 01</span>
        <span className="text-[#111111]/40 sm:hidden">•</span>
        <button
          onClick={onOpenAllocation}
          className="underline underline-offset-4 decoration-[#111111]/40 hover:decoration-[#111111] text-[#111111] hover:text-black transition-all cursor-pointer whitespace-nowrap font-semibold"
        >
          Reserve #001–#250
        </button>
      </div>
    </div>
  );
}
