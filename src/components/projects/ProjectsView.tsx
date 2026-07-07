"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { PROJECTS, type Project } from "@/data/site";

const FILTERS = ["All", "Recent", "Delivered"] as const;
type Filter = (typeof FILTERS)[number];

function matches(p: Project, f: Filter) {
  if (f === "All") return true;
  if (f === "Recent") return p.status === "IN BUILD" || p.status === "IN DESIGN";
  return p.status === "DELIVERED";
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const tone =
    status === "DELIVERED"
      ? "border-stone/40 text-stone"
      : status === "IN BUILD"
        ? "border-terracotta text-terracotta"
        : "border-ink/40 text-ink-2";
  return <span className={`label-mono border px-2.5 py-1 ${tone}`}>{status}</span>;
}

function ProjectCard({ p, index }: { p: Project; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        <Image
          src={p.cover}
          alt={p.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={p.status} />
        </div>
      </div>
      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <h3 className="font-display text-xl md:text-2xl">{p.name}.</h3>
          <p className="label-mono mt-2 text-stone">
            {p.type} · {p.location} · {p.timeline}
            {p.area ? ` · ${p.area}` : ""}
          </p>
        </div>
      </div>
      {p.summary && <p className="mt-3 text-sm leading-relaxed text-ink-2">{p.summary}</p>}
    </motion.article>
  );
}

export function ProjectsView() {
  const [filter, setFilter] = useState<Filter>("All");
  const recent = PROJECTS.filter((p) => matches(p, "Recent"));
  const delivered = PROJECTS.filter((p) => matches(p, "Delivered"));
  const shown = PROJECTS.filter((p) => matches(p, filter));

  return (
    <div className="pt-24 md:pt-32">
      {/* Intro */}
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="label-mono text-terracotta">The full portfolio · 2021 — today</p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl leading-tight md:text-7xl">
            Every project we've put our name on.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-2 md:text-base">
            A complete record of completed and in-progress builds — residential, commercial,
            healthcare, hospitality, and institutional. References for any of these are available
            on request.
          </p>
        </Reveal>

        {/* Filters */}
        <Reveal className="mt-10 flex flex-wrap gap-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`label-mono border px-5 py-3 transition-colors ${
                filter === f
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-2 hover:border-ink"
              }`}
            >
              {f}
              <span className="ml-2 text-terracotta">
                {f === "All" ? PROJECTS.length : f === "Recent" ? recent.length : delivered.length}
              </span>
            </button>
          ))}
        </Reveal>

        {/* Grid */}
        <motion.div layout className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <ProjectCard key={p.slug} p={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Record table */}
      <div className="mt-24 bg-dark text-paper md:mt-32">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <p className="label-mono text-terracotta">The record</p>
            <h2 className="font-display mt-4 text-3xl md:text-5xl">In black and white.</h2>
          </Reveal>
          <Reveal className="scroll-x mt-10">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-dark-line">
                  {["Project", "Type", "Location", "Timeline", "Status"].map((h) => (
                    <th key={h} className="label-mono py-4 pr-6 font-normal text-paper/50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map((p) => (
                  <tr key={p.slug} className="border-b border-dark-line transition-colors hover:bg-dark-2">
                    <td className="font-display py-4 pr-6 text-lg">{p.name}</td>
                    <td className="py-4 pr-6 text-sm text-paper/70">{p.type}</td>
                    <td className="py-4 pr-6 text-sm text-paper/70">{p.location}</td>
                    <td className="label-mono py-4 pr-6 text-paper/70">{p.timeline}</td>
                    <td className="py-4">
                      <span
                        className={`label-mono ${
                          p.status === "DELIVERED"
                            ? "text-paper/50"
                            : p.status === "IN BUILD"
                              ? "text-terracotta"
                              : "text-paper/80"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
