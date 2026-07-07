import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import { STATS } from "@/data/site";

export function Numbers() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <Reveal>
        <p className="label-mono text-terracotta">By the numbers</p>
        <h2 className="font-display mt-4 max-w-2xl text-4xl leading-tight md:text-6xl">
          At a glance.
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-2 md:text-base">
          A working portfolio across residential, commercial, healthcare, and government projects —
          with the documentation to match.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-2 border-l border-t border-line md:grid-cols-3 lg:grid-cols-6">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="border-b border-r border-line p-6 md:p-8">
            <p className="font-display text-4xl font-medium md:text-5xl">
              <Counter value={s.value} suffix={s.suffix} />
            </p>
            <p className="label-mono mt-3 text-stone">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
