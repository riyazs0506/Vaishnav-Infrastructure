import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Trust } from "@/components/sections/Trust";
import { Principles } from "@/components/sections/Principles";
import { CTA } from "@/components/sections/CTA";
import { FOUNDER_NOTE, SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "A note from founder Arun Keerthi, M.Tech (CEM), and the principles behind Vaishnav Infrastructure — an Erode-based construction practice building across Tamil Nadu since 2014.",
};

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-28 md:px-8 md:pt-40">
        <Reveal>
          <p className="label-mono text-terracotta">A note from the founder</p>
        </Reveal>

        <div className="mt-8 grid gap-12 pb-24 md:grid-cols-12 md:pb-32">
          <Reveal className="md:col-span-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-paper-2">
              <Image
                src={FOUNDER_NOTE.image}
                alt={FOUNDER_NOTE.name}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="font-display mt-5 text-2xl">{FOUNDER_NOTE.name}</p>
            <p className="label-mono mt-1 text-stone">{FOUNDER_NOTE.title}</p>
            <p className="label-mono mt-1 text-stone">{SITE.location}</p>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
            <p className="font-display text-2xl leading-snug md:text-4xl md:leading-snug">
              “{FOUNDER_NOTE.quote}”
            </p>
          </Reveal>
        </div>
      </div>

      <Principles />
      <Trust />
      <CTA />
    </>
  );
}
