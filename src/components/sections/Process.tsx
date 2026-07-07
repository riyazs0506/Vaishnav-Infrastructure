"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/Reveal";
import { PROCESS } from "@/data/site";

gsap.registerPlugin(ScrollTrigger);

/* Horizontal timeline: CSS sticky + transform driven by scroll progress.
   No GSAP pinning — pin-spacers fight React unmounts on route change. */
export function Process() {
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const track = trackRef.current;
          if (!track) return;
          const max = track.scrollWidth - window.innerWidth;
          track.style.transform = `translateX(${-self.progress * max}px)`;
        },
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={wrapRef} className="bg-dark text-paper md:h-[400vh]">
      <div className="md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center md:overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-5 pt-24 md:px-8 md:pt-0">
          <Reveal>
            <p className="label-mono text-terracotta">How we work</p>
            <h2 className="font-display mt-4 text-4xl leading-tight md:text-6xl">
              Seven stages, one team.
            </h2>
          </Reveal>
        </div>

        <div
          ref={trackRef}
          className="mt-12 flex flex-col gap-6 px-5 pb-24 will-change-transform md:mt-16 md:w-max md:flex-row md:gap-0 md:pb-0 md:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] md:pr-[40vw]"
        >
          {PROCESS.map((p) => (
            <div
              key={p.step}
              className="border-t border-dark-line py-6 md:w-[26rem] md:shrink-0 md:border-l md:border-t-0 md:px-10 md:py-4"
            >
              <p className="font-display text-6xl text-terracotta/60 md:text-8xl">{p.step}</p>
              <h3 className="font-display mt-4 text-2xl md:mt-8 md:text-3xl">{p.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/60">{p.body}</p>
            </div>
          ))}
          <div className="border-t border-dark-line py-6 md:w-[30rem] md:shrink-0 md:border-l md:border-t-0 md:px-10 md:py-4">
            <p className="font-display text-6xl text-terracotta md:text-8xl">+</p>
            <h3 className="font-display mt-4 text-2xl md:mt-8 md:text-3xl">24 months of aftercare.</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/60">
              Every project ships with two years of post-handover support — structural defects,
              finish issues, leaks, electrical faults. One phone call to the same team that built
              it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
