"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/data/site";

gsap.registerPlugin(ScrollTrigger);

const BuildingScene = dynamic(() => import("./BuildingScene"), { ssr: false });

/* Blend two hex colors — drives the sky gradient as the build progresses. */
function mix(a: string, b: string, t: number) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const r = Math.round(((ah >> 16) & 255) + (((bh >> 16) & 255) - ((ah >> 16) & 255)) * t);
  const g = Math.round(((ah >> 8) & 255) + (((bh >> 8) & 255) - ((ah >> 8) & 255)) * t);
  const bl = Math.round((ah & 255) + ((bh & 255) - (ah & 255)) * t);
  return `rgb(${r},${g},${bl})`;
}

/* Four stages — each completes over ~25% of the pinned scroll,
   per the brief: every scroll step advances the build 25–35%. */
const STAGES = [
  {
    numeral: "01",
    title: "Foundation",
    caption: "The site speaks first. Soil, sun path, drainage — read before a single drawing is made.",
  },
  {
    numeral: "02",
    title: "Structure",
    caption: "Columns and slabs poured to the same protocol, whether it's a villa or a hospital.",
  },
  {
    numeral: "03",
    title: "Walls & Cladding",
    caption: "Stone, render, and timber — materials chosen to get better with time, not worse.",
  },
  {
    numeral: "04",
    title: "Handover",
    caption: "Keys, drawings, warranties, vendor list — and 24 months of aftercare as standard.",
  },
];

export function ConstructionHero() {
  const wrapRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        progress.current = p;

        if (introRef.current) {
          const o = Math.max(0, 1 - p / 0.1);
          introRef.current.style.opacity = String(o);
          introRef.current.style.transform = `translateY(${p * -160}px)`;
          introRef.current.style.pointerEvents = o > 0.1 ? "auto" : "none";
        }
        if (skyRef.current) {
          /* white → navy-tinted sky deepening as the house completes (brand colors only) */
          const top =
            p < 0.55
              ? mix("#ffffff", "#e4e7f2", Math.min(1, p * 1.8))
              : mix("#e4e7f2", "#d4d9ec", Math.min(1, (p - 0.55) * 2));
          const mid = mix("#ffffff", "#eef0f8", Math.max(0, (p - 0.45) / 0.55));
          skyRef.current.style.background = `linear-gradient(180deg, ${top} 0%, ${mid} 58%, #ffffff 100%)`;
        }
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
        if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`;
        if (ctaRef.current) {
          const o = Math.max(0, (p - 0.93) / 0.07);
          ctaRef.current.style.opacity = String(o);
          ctaRef.current.style.pointerEvents = o > 0.5 ? "auto" : "none";
        }

        const idx = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));
        setStage((prev) => (prev === idx ? prev : idx));
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={wrapRef} className="relative" style={{ height: "460vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* sky gradient — shifts from morning paper to golden hour with the build */}
        <div ref={skyRef} className="absolute inset-0" />
        {/* 3D scene */}
        <div className="absolute inset-0">
          <BuildingScene progress={progress} />
        </div>

        {/* Intro headline — fades as construction begins */}
        <div
          ref={introRef}
          className="absolute inset-x-0 top-0 flex h-full flex-col justify-center px-5 pt-24 pb-28 md:px-8 md:pt-28 md:pb-32"
        >
          <div className="mx-auto w-full max-w-7xl">
            <p className="label-mono text-terracotta">{SITE.location} · MMXXVI</p>
            <h1 className="font-display mt-5 max-w-3xl text-5xl font-medium leading-[1.02] tracking-tight md:text-8xl">
              We don't just pour concrete.
              <br />
              <em className="text-stone">We set standards.</em>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-2 md:text-base">
              A portfolio in concrete, stone, and time. Residential · Commercial · Healthcare ·
              Institutional · Government · Hospitality.
            </p>
            <p className="label-mono mt-10 flex items-center gap-3 text-stone">
              <span className="inline-block h-8 w-px animate-pulse bg-ink" />
              Scroll to build
            </p>
          </div>
        </div>

        {/* Stage rail — bottom left */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 md:px-8 md:pb-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
            <div className="flex items-end justify-between gap-6">
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {STAGES.map((s, i) => (
                  <div
                    key={s.numeral}
                    className={`transition-all duration-500 ${
                      i === stage ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <p className="label-mono text-terracotta">{s.numeral}</p>
                    <p className="font-display text-lg md:text-2xl">{s.title}</p>
                  </div>
                ))}
              </div>
              <p className="hidden max-w-xs text-right text-xs leading-relaxed text-ink-2 md:block md:text-sm">
                {STAGES[stage].caption}
              </p>
            </div>

            {/* progress bar */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-line">
                <div
                  ref={barRef}
                  className="h-full origin-left bg-terracotta"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
              <span ref={pctRef} className="label-mono w-10 text-right text-stone">
                0%
              </span>
            </div>
          </div>
        </div>

        {/* Handover CTA */}
        {/* <div
          ref={ctaRef}
          className="pointer-events-none absolute inset-x-0 top-[9%] flex justify-center px-5 opacity-0 md:top-[11%] md:px-8"
        >
          <div className="bg-paper/60 px-8 py-8 text-center backdrop-blur-sm md:px-14 md:py-10">
            <p className="label-mono text-terracotta">Handover complete</p>
            <p className="font-display mx-auto mt-4 max-w-2xl text-3xl leading-tight md:text-5xl">
              Fifty years from now, it will still be standing.
            </p>
            <Link
              href="/projects"
              className="label-mono mt-8 inline-block border border-ink bg-ink px-7 py-4 text-paper transition-colors hover:bg-terracotta hover:border-terracotta"
            >
              View the portfolio
            </Link>
          </div>
        </div> */}
      </div>
    </section>
  );
}
