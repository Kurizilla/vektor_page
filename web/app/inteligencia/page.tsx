"use client";

import { useEffect, useMemo, useState } from "react";

type StepKey = "Retrieve" | "Analyze" | "Generate" | "Compat";

type Step = {
  key: StepKey;
  label: string;
  source: "CMS" | "LLM" | "Both";
  durationMs?: number;
  status: "idle" | "running" | "done";
};

function clsx(...args: Array<string | false | undefined>) {
  return args.filter(Boolean).join(" ");
}

// Metadata no se exporta en componentes cliente; usar layout/server si es necesario.

export default function InteligenciaVisiblePage() {
  const [steps, setSteps] = useState<Step[]>([
    { key: "Retrieve", label: "Retrieve", source: "CMS", status: "idle" },
    { key: "Analyze", label: "Analyze", source: "Both", status: "idle" },
    { key: "Generate", label: "Generate", source: "LLM", status: "idle" },
    { key: "Compat", label: "Compat", source: "Both", status: "idle" }
  ]);
  const [running, setRunning] = useState(false);
  const [showTraces, setShowTraces] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<"Recommended" | "Partial" | "Not" | null>(null);

  const totalMs = useMemo(
    () => steps.reduce((acc, s) => acc + (s.durationMs ?? 0), 0),
    [steps]
  );

  const decisionColor = useMemo(() => {
    if (!decision) return "border";
    if (decision === "Recommended") return "text-emerald-300 border-emerald-400/30";
    if (decision === "Partial") return "text-amber-300 border-amber-400/30";
    return "text-rose-300 border-rose-400/30";
  }, [decision]);

  function simulate() {
    setRunning(true);
    setShowTraces(false);
    setScore(null);
    setDecision(null);
    setSteps(s => s.map(st => ({ ...st, status: "idle", durationMs: undefined })));

    const planned: Record<StepKey, number> = {
      Retrieve: 120 + Math.floor(Math.random() * 80),
      Analyze: 260 + Math.floor(Math.random() * 120),
      Generate: 380 + Math.floor(Math.random() * 200),
      Compat: 90 + Math.floor(Math.random() * 60)
    };

    let acc = 0;
    (Object.keys(planned) as StepKey[]).forEach((key, idx) => {
      const wait = planned[key];
      setTimeout(() => {
        setSteps(prev =>
          prev.map(st =>
            st.key === key
              ? { ...st, status: "done", durationMs: wait }
              : st.key === (prev[idx - 1]?.key ?? "")
              ? st
              : st
          )
        );
        if (idx === 3) {
          const sc = Math.min(100, Math.max(0, 72 + Math.round(Math.random() * 24 - 6)));
          setScore(sc);
          setDecision(sc >= 75 ? "Recommended" : sc >= 55 ? "Partial" : "Not");
          setRunning(false);
        }
      }, (acc += wait));
      // Set running state for current step
      setTimeout(() => {
        setSteps(prev => prev.map(st => (st.key === key ? { ...st, status: "running" } : st)));
      }, acc - wait);
    });
  }

  useEffect(() => {
    // Auto-run once on mount for demo
    simulate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <a href="/" className="text-sm text-muted hover:text-foreground transition-colors">
            ← Volver
          </a>
          <span className="rounded-full border px-3 py-1 text-xs text-muted">Inteligencia visible</span>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Pipeline de razonamiento
          </h1>
          <p className="mt-3 text-lg md:text-xl text-muted">
            Retrieve → Analyze → Generate → Compat con tiempos, fuentes y trazas.
          </p>
        </header>

        {/* Stepper */}
        <div className="rounded-xl border p-6">
          <div className="grid grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.key} className="flex flex-col items-start">
                <div
                  className={clsx(
                    "w-full rounded-lg border px-3 py-2 text-sm",
                    s.status === "done" && "border-emerald-400/30 bg-emerald-400/10",
                    s.status === "running" && "border-primary/40 bg-primary/10",
                    s.status === "idle" && "border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-xs text-muted">{s.source}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {s.durationMs ? `${s.durationMs} ms` : s.status === 'running' ? '…' : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted">Total: {totalMs} ms</div>
            <button
              onClick={simulate}
              disabled={running}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              {running ? 'Ejecutando…' : 'Ejecutar de nuevo'}
            </button>
          </div>
        </div>

        {/* Compat meter */}
        <section className="mt-8 rounded-xl border p-6">
          <h2 className="text-lg font-medium">Compatibilidad</h2>
          <div className="mt-3">
            <div className="h-3 w-full overflow-hidden rounded bg-white/10">
              <div
                className={clsx(
                  "h-3 transition-all",
                  score !== null && score >= 75 && "bg-emerald-400",
                  score !== null && score >= 55 && score < 75 && "bg-amber-400",
                  score !== null && score < 55 && "bg-rose-400"
                )}
                style={{ width: `${score ?? 0}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-muted">
              <span>{score ?? 0}%</span>
              <span className={clsx("rounded border px-2 py-0.5 text-xs", decisionColor)}>
                {decision ?? '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Traces */}
        <section className="mt-8 rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Trazas</h2>
            <button
              onClick={() => setShowTraces(v => !v)}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background"
            >
              {showTraces ? 'Ocultar trazas' : 'Ver trazas'}
            </button>
          </div>
          {showTraces && (
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>
                <strong>Retrieve (CMS):</strong> se consultaron servicios/industrias en el CMS y se
                normalizaron campos.
              </p>
              <p>
                <strong>Analyze (CMS+LLM):</strong> se cruzaron pain points con casos y se puntuó relevancia.
              </p>
              <p>
                <strong>Generate (LLM):</strong> se redactaron títulos y descripciones con tono consultivo.
              </p>
              <p>
                <strong>Compat (CMS+LLM):</strong> se estimó compatibilidad y se emitió veredicto.
              </p>
              <p className="whitespace-pre-wrap">
                <strong>Reasoning (resumen):</strong> Automatización clínica reduce retrabajo y errores; la
                trazabilidad con blockchain mejora auditoría; métricas operativas permiten ROI en 6–8 semanas.
              </p>
            </div>
          )}
        </section>

        <div className="mt-12">
          <a
            href="/como-trabajamos"
            className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-medium hover:bg-foreground hover:text-background"
          >
            Ver proceso
          </a>
        </div>
      </div>
    </main>
  );
}


