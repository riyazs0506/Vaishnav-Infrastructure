import Link from "next/link";
import { SITE } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-dark text-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl leading-tight md:text-4xl">
              If you can imagine it standing for fifty years, we should talk.
            </p>
            <Link
              href="/contact"
              className="label-mono mt-8 inline-block border border-paper/40 px-6 py-3.5 transition-colors hover:border-terracotta hover:bg-terracotta"
            >
              Begin a conversation
            </Link>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="label-mono text-paper/50">Call</p>
            <a href={SITE.phoneHref} className="mt-2 block font-display text-xl hover:text-terracotta">
              {SITE.phone}
            </a>
            <p className="mt-1 text-sm text-paper/50">{SITE.hours}</p>

            <p className="label-mono mt-8 text-paper/50">Write</p>
            <a href={`mailto:${SITE.email}`} className="mt-2 block text-sm hover:text-terracotta">
              {SITE.email}
            </a>
          </div>

          <div className="md:col-span-3">
            <p className="label-mono text-paper/50">Visit</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/80">
              Erode, Tamil Nadu
              <br />
              Projects across Tamil Nadu · India
            </p>

            <p className="label-mono mt-8 text-paper/50">Registered &amp; approved</p>
            <p className="mt-2 text-sm text-paper/80">{SITE.registrations.join(" · ")}</p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-dark-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="label-mono text-paper/40">
            {SITE.founder} · Selected works 2021 — 2026
          </p>
          <p className="label-mono text-paper/40">
            © MMXXVI {SITE.name} · Erode · Tamil Nadu
          </p>
        </div>
      </div>
    </footer>
  );
}
