"use client";

import { useEffect, useState } from "react";

/* Brand splash shown while the site loads — stays up on slow connections
   until the window "load" event, with a minimum dwell so it never flashes. */
export function Preloader() {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>;
    const finish = () => {
      const wait = Math.max(0, 1500 - (performance.now() - start));
      t1 = setTimeout(() => setFading(true), wait);
      t2 = setTimeout(() => setGone(true), wait + 750);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    /* hard ceiling so a stalled asset never traps the user */
    const t3 = setTimeout(finish, 3500);
    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (gone) return null;
  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-dark transition-opacity duration-700 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* mark */}
      <div className="flex h-16 w-16 rotate-45 items-center justify-center border border-terracotta/70">
        <span className="font-display -rotate-45 text-3xl font-medium text-paper">V</span>
      </div>
      <p className="font-display mt-7 text-3xl font-medium tracking-tight text-paper md:text-4xl">
        Vaishnav
      </p>
      <p className="label-mono mt-2 text-paper/50">Infrastructure · Erode</p>
      <div className="mt-8 h-px w-44 overflow-hidden bg-paper/15">
        <div className="animate-loadbar h-full w-1/3 bg-terracotta" />
      </div>
    </div>
  );
}
