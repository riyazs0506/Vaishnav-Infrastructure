import { SITE } from "@/data/site";

export function Marquee() {
  const items = [...SITE.sectors, ...SITE.registrations.map((r) => `${r} Registered`)];
  const row = items.map((t, i) => (
    <span key={i} className="label-mono flex items-center gap-6 whitespace-nowrap text-paper/70">
      {t}
      <span className="text-terracotta">◆</span>
    </span>
  ));
  return (
    <div className="overflow-hidden border-y border-dark-line bg-dark py-4">
      <div className="animate-marquee flex w-max gap-6">
        <div className="flex gap-6">{row}</div>
        <div className="flex gap-6" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}
