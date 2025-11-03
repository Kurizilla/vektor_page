"use client";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden text-center">
      {/* Animated background gradients */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(closest-side, var(--color-primary), transparent)" }}
        animate={{ x: [0, 40, -20, 0], y: [0, -20, 30, 0], opacity: [0.5, 0.8, 0.6, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, var(--color-secondary), transparent)" }}
        animate={{ x: [0, -30, 20, 0], y: [0, 30, -10, 0], opacity: [0.4, 0.7, 0.5, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-4xl px-6">
        <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-muted backdrop-blur">
          LYR.io
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
          Sistemas Inteligentes para un Mundo Conectado
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted">
          IA, Blockchain y Automatización convergen en soluciones escalables y seguras.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="#servicios"
            className="rounded-xl bg-primary px-5 py-3 font-medium text-black hover:opacity-90"
          >
            Explorar soluciones
          </a>
          <a
            href="#contacto"
            className="rounded-xl border px-5 py-3 font-medium hover:bg-foreground hover:text-background"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </section>
  );
}


