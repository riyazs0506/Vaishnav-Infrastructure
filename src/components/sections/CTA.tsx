import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/data/site";

export function CTA() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/p20_00.jpg"
        alt="Vaishnav Infrastructure site"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-ink/70" />
      <div className="relative mx-auto max-w-7xl px-5 py-28 text-paper md:px-8 md:py-40">
        <Reveal>
          <p className="label-mono text-terracotta">Begin a conversation</p>
          <h2 className="font-display mt-5 max-w-3xl text-4xl leading-tight md:text-7xl">
            If you can imagine it standing for fifty years, we should talk.
          </h2>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="label-mono border border-paper bg-paper px-7 py-4 text-ink transition-colors hover:bg-terracotta hover:border-terracotta hover:text-paper"
            >
              Start your project
            </Link>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="label-mono border border-paper/50 px-7 py-4 transition-colors hover:border-terracotta hover:bg-terracotta"
            >
              WhatsApp us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
