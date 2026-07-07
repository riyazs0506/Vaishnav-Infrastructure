import { Reveal } from "@/components/Reveal";
import { SITE, TRUST } from "@/data/site";

export function Trust() {
  return (
    <section className="border-y border-line bg-paper-2">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <p className="label-mono text-terracotta">Trust &amp; track record</p>
          <h2 className="font-display mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">
            When the work has to be right, we're the call.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {TRUST.map((t, i) => (
            <Reveal key={t.numeral} delay={i * 0.08}>
              <p className="font-display text-4xl text-terracotta/70">{t.numeral}.</p>
              <h3 className="font-display mt-4 text-2xl leading-snug">{t.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">{t.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 border-t border-line pt-6">
          <p className="label-mono text-stone">
            Registered &amp; approved: {SITE.registrations.join(" · ")} — {SITE.location} · 2026
          </p>
        </Reveal>
      </div>
    </section>
  );
}
