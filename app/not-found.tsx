import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#111111] flex items-center justify-center px-6">
      <div className="text-center max-w-md border border-[#e5e5e3] p-10 bg-[#ffffff]">
        <span className="font-mono text-xs text-[#8c8c8c] uppercase tracking-widest block mb-3">
          Error 404 · Uncataloged Specimen
        </span>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-medium mb-4">
          Allocation Not Found
        </h1>
        <p className="text-xs text-[#8c8c8c] mb-8 leading-relaxed">
          The requested archive index does not correspond to an authorized allocation within the Maison Glint registry.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#111111] text-[#ffffff] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#2b2b2b] transition-colors"
        >
          Return to Atelier
        </Link>
      </div>
    </div>
  );
}
