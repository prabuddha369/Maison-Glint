'use client';

export default function TopAnnouncement({
  onOpenAllocation,
}: {
  onOpenAllocation?: () => void;
}) {
  return (
    <div
      id="announcement-banner"
      className="w-full bg-[#f4f4f2] border-b border-[#e5e5e3] py-2 px-3 sm:px-4 text-center select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#444748] overflow-hidden">
        <span className="inline-block w-1.5 h-1.5 bg-[#c5a059] rounded-none animate-pulse shrink-0" />
        <span className="font-medium text-[#111111] whitespace-nowrap">Maison Glint</span>
        <span className="hidden sm:inline text-[#8c8c8c]">—</span>
        <span className="hidden sm:inline text-[#555]">The First Chapter · Batch 01</span>
        <span className="text-[#8c8c8c] sm:hidden">•</span>
        <button
          onClick={onOpenAllocation}
          className="underline underline-offset-4 decoration-[#c5a059] text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer whitespace-nowrap font-medium"
        >
          Reserve #001–#250
        </button>
      </div>
    </div>
  );
}
