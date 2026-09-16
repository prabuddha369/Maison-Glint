'use client';

export default function TopAnnouncement({
  onOpenAllocation,
}: {
  onOpenAllocation?: () => void;
}) {
  return (
    <div
      id="announcement-banner"
      className="w-full bg-[#f4f4f2] border-b border-[#e5e5e3] py-2 px-4 text-center select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-[#444748]">
        <span className="inline-block w-1.5 h-1.5 bg-[#c5a059] rounded-none animate-pulse" />
        <span className="font-medium text-[#111111]">Introducing Maison Glint</span>
        <span className="text-[#8c8c8c]">—</span>
        <span className="text-[#555]">The First Chapter · Serial Allocations Open</span>
        <button
          onClick={onOpenAllocation}
          className="ml-2 underline underline-offset-4 decoration-[#c5a059] text-[#111111] hover:text-[#c5a059] transition-colors cursor-pointer"
        >
          Reserve #001–#250
        </button>
      </div>
    </div>
  );
}
