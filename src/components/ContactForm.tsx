"use client";

import { useState } from "react";
import { SITE } from "@/data/site";

/* Frontend-only form: composes a WhatsApp message / mailto draft. */
export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", type: "Residence", brief: "" });

  const message = `Hello Vaishnav Infrastructure,%0A%0AI'd like to discuss a project.%0A%0AName: ${encodeURIComponent(
    form.name
  )}%0APhone: ${encodeURIComponent(form.phone)}%0AProject type: ${encodeURIComponent(
    form.type
  )}%0ABrief: ${encodeURIComponent(form.brief)}`;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls =
    "w-full border border-line bg-transparent px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-terracotta";

  return (
    <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label-mono mb-2 block text-stone">Your name</label>
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Full name" />
        </div>
        <div>
          <label className="label-mono mb-2 block text-stone">Phone</label>
          <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+91" />
        </div>
      </div>

      <div>
        <label className="label-mono mb-2 block text-stone">Project type</label>
        <select className={inputCls} value={form.type} onChange={set("type")}>
          {["Residence", "Farmhouse", "Commercial", "Healthcare", "Institutional", "Government", "Hospitality", "Other"].map(
            (t) => (
              <option key={t}>{t}</option>
            )
          )}
        </select>
      </div>

      <div>
        <label className="label-mono mb-2 block text-stone">The brief</label>
        <textarea
          className={`${inputCls} min-h-32 resize-y`}
          value={form.brief}
          onChange={set("brief")}
          placeholder="Plot location, size, what you're imagining, timeline…"
        />
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <a
          href={`${SITE.whatsapp}?text=${message}`}
          target="_blank"
          rel="noreferrer"
          className="label-mono border border-ink bg-ink px-7 py-4 text-paper transition-colors hover:border-terracotta hover:bg-terracotta"
        >
          Send via WhatsApp
        </a>
        <a
          href={`mailto:${SITE.email}?subject=Project enquiry — ${encodeURIComponent(form.name || "New client")}&body=${message.replaceAll("%0A", "%0D%0A")}`}
          className="label-mono border border-ink px-7 py-4 transition-colors hover:bg-ink hover:text-paper"
        >
          Send via email
        </a>
      </div>
    </form>
  );
}
