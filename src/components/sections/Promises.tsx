import { Reveal } from "@/components/Reveal";
import { PROMISES } from "@/data/site";

export function Promises() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <p className="label-mono text-terracotta">What you get</p>
          <h2 className="font-display mt-4 text-4xl leading-tight md:text-5xl">
            Five things we're strict about.
          </h2>
        </Reveal>

        <div className="md:col-span-7 md:col-start-6">
          {PROMISES.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div className="group border-b border-line py-7 first:border-t md:py-8">
                <div className="flex items-baseline gap-6">
                  <span className="label-mono text-terracotta">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-xl transition-colors group-hover:text-terracotta md:text-2xl">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
