"use client";
import { motion } from "framer-motion";
import type { ServiceItem } from "../lib/cms";

type Props = {
  items: Array<{ title: string; summary?: string }>;
};

const defaultIcons = [
  (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v18M3 12h18"/>
    </svg>
  ),
  (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 7h10v10H7z"/>
      <path d="M7 7l5-4 5 4M7 17l5 4 5-4"/>
    </svg>
  ),
  (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a8 8 0 10-2.9 2.9L22 22"/>
    </svg>
  )
];

export function Services({ items }: Props) {
  return (
    <section id="servicios" className="mx-auto max-w-6xl py-16 px-6">
      <h2 className="text-2xl md:text-3xl font-semibold">Áreas de especialización</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((s, idx) => (
          <motion.div
            key={s.title}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-shadow hover:shadow-[0_0_40px_-10px_rgba(93,95,239,0.6)]"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {defaultIcons[idx % defaultIcons.length]}
            </div>
            <h3 className="text-lg font-medium">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.summary}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


