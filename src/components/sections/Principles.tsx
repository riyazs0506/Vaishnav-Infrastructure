import { Reveal } from "@/components/Reveal";
import { PRINCIPLES } from "@/data/site";

export function Principles() {
  return (
    <section className="bg-dark text-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <p className="label-mono text-terracotta">How we think</p>
          <h2 className="font-display mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">
            Four principles that decide everything.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px bg-dark-line md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.numeral} delay={i * 0.08} className="bg-dark p-8 md:p-12">
              <p className="font-display text-5xl text-terracotta/80 md:text-6xl">{p.numeral}.</p>
              <h3 className="font-display mt-6 text-2xl md:text-3xl">{p.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-paper/60 md:text-base">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
