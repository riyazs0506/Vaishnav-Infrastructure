import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Begin a conversation with Vaishnav Infrastructure — call, write, or visit us in Erode, Tamil Nadu. Projects across Tamil Nadu, India.",
};

const CARDS = [
  { label: "Call", value: SITE.phone, sub: SITE.hours, href: SITE.phoneHref },
  { label: "Write", value: SITE.email, sub: "We reply within one working day", href: `mailto:${SITE.email}` },
  { label: "Visit", value: "Erode, Tamil Nadu", sub: "Projects across Tamil Nadu · India" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-40">
      <Reveal>
        <p className="label-mono text-terracotta">Begin a conversation</p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl leading-tight md:text-7xl">
          If you can imagine it standing for fifty years, we should talk.
        </h1>
      </Reveal>

      <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
        {CARDS.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.07} className="bg-paper p-8 md:p-10">
            <p className="label-mono text-stone">{c.label}</p>
            {c.href ? (
              <a
                href={c.href}
                className="font-display mt-3 block break-words text-xl transition-colors hover:text-terracotta md:text-2xl"
              >
                {c.value}
              </a>
            ) : (
              <p className="font-display mt-3 text-xl md:text-2xl">{c.value}</p>
            )}
            <p className="mt-2 text-sm text-ink-2">{c.sub}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 grid gap-12 md:mt-28 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <p className="label-mono text-terracotta">Project enquiry</p>
          <h2 className="font-display mt-4 text-3xl leading-tight md:text-4xl">
            Tell us about the plot, the brief, and the timeline.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            Residential, commercial, healthcare, institutional, government, or hospitality — we
            listen before we propose. Every enquiry is answered by the same team that builds.
          </p>
          <p className="label-mono mt-6 text-stone">{SITE.founder}</p>
        </Reveal>

        <div className="md:col-span-7 md:col-start-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
