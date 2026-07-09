"use client";

import { useEffect, useRef } from "react";

/* Editorial cursor: a terracotta dot with a trailing ring that
   expands over interactive elements. Pointer-fine devices only. */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    document.documentElement.classList.add("custom-cursor");

    let x = -100, y = -100, rx = -100, ry = -100;
    let hover = false, down = false, raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as Element | null;
      hover = !!t?.closest?.("a, button, [role='button'], input, select, textarea, label");
    };
    const onDown = () => (down = true);
    const onUp = () => (down = false);

    const tick = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      const ringScale = (hover ? 1.7 : 1) * (down ? 0.82 : 1);
      const dotScale = (hover ? 0.45 : 1) * (down ? 1.6 : 1);
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${dotScale})`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${ringScale})`;
      ring.style.borderColor = hover ? "var(--ink)" : "rgba(35,44,87,0.35)";
      ring.style.backgroundColor = hover ? "rgba(35,44,87,0.08)" : "transparent";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[150] hidden h-9 w-9 rounded-full border transition-[border-color,background-color] duration-200 md:block"
        style={{ transform: "translate(-100px, -100px)" }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[150] hidden h-1.5 w-1.5 rounded-full bg-terracotta md:block"
        style={{ transform: "translate(-100px, -100px)" }}
      />
    </>
  );
}
