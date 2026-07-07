"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { FEATURED_SLUGS, PROJECTS, TESTIMONIAL } from "@/data/site";

function ParallaxImage({ src, alt, priorityCrop }: { src: string; alt: string; priorityCrop?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={ref} className="relative aspect-[4/3] overflow-hidden md:aspect-[16/10]">
      <motion.div style={{ y }} className="absolute inset-[-10%_0]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 60vw, 100vw"
          className={`object-cover ${priorityCrop ?? ""}`}
        />
      </motion.div>
    </div>
  );
}

export function FeaturedWorks() {
  const featured = FEATURED_SLUGS.map((slug) => PROJECTS.find((p) => p.slug === slug)!).filter(Boolean);

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <Reveal>
        <p className="label-mono text-terracotta">Featured works</p>
        <h2 className="font-display mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">
          Different briefs. <em className="text-stone">Same discipline.</em>
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-2 md:text-base">
          A family farmhouse in a coconut grove, a residence carved in stone and brick, a hospital
          on a working street. The brief changes on every site — how we plan, build, and finish
          doesn't.
        </p>
      </Reveal>

      <div className="mt-16 space-y-20 md:space-y-28">
        {featured.map((p, i) => (
          <Reveal key={p.slug}>
            <article className={`grid items-end gap-8 md:grid-cols-12`}>
              <div className={`md:col-span-7 ${i % 2 === 1 ? "md:order-2 md:col-start-6" : ""}`}>
                <ParallaxImage src={p.cover} alt={p.name} />
              </div>
              <div className={`md:col-span-4 ${i % 2 === 1 ? "md:order-1 md:col-start-1" : "md:col-start-9"}`}>
                <p className="label-mono text-stone">
                  {String(i + 1).padStart(2, "0")} / {p.type} · {p.location}
                </p>
                <h3 className="font-display mt-3 text-3xl md:text-4xl">{p.name}.</h3>
                <p className="label-mono mt-3 text-terracotta">
                  {p.area ? `${p.area} · ` : ""}
                  {p.timeline} · {p.status}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-ink-2">{p.summary}</p>
                <Link
                  href="/projects"
                  className="label-mono mt-6 inline-block border-b border-ink pb-1 transition-colors hover:border-terracotta hover:text-terracotta"
                >
                  Explore the portfolio
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-24 border-l-2 border-terracotta pl-6 md:mt-32 md:pl-10">
        <p className="font-display max-w-3xl text-2xl leading-snug md:text-4xl">
          “{TESTIMONIAL.quote}”
        </p>
        <p className="label-mono mt-5 text-stone">{TESTIMONIAL.source}</p>
      </Reveal>
    </section>
  );
}
