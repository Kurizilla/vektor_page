"use client";
import { useEffect, useRef, useState } from "react";

type Rec = { title: string; description?: string; technologies?: any };

export function SmartRecs() {
  const [industry, setIndustry] = useState("");
  const [pain, setPain] = useState("");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [explain, setExplain] = useState(true);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [verdict, setVerdict] = useState<{ type: 'fit' | 'no_fit'; title: string; bullets: string[] } | null>(null);

  // Refs y placeholders cíclicos
  const industryRef = useRef<HTMLInputElement>(null);
  const painRef = useRef<HTMLInputElement>(null);
  const industrySuggestions = ["salud", "finanzas", "gobierno", "educación"];
  const painSuggestions = ["cumplimiento", "trazabilidad", "automatización", "auditoría"];
  const [phIndustry, setPhIndustry] = useState(industrySuggestions[0]);
  const [phPain, setPhPain] = useState(painSuggestions[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setPhIndustry((prev) => industrySuggestions[(industrySuggestions.indexOf(prev) + 1) % industrySuggestions.length]);
      setPhPain((prev) => painSuggestions[(painSuggestions.indexOf(prev) + 1) % painSuggestions.length]);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Atajos: Cmd/Ctrl+K enfocar, Esc limpiar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); industryRef.current?.focus(); }
      if (e.key === 'Escape') { setIndustry(''); setPain(''); setRecs([]); setReasoning(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (explain) {
        // Streaming reasoning
        setReasoning("");
        setStreaming(true);
        const res = await fetch('/api/recommendations/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry, painPoints: pain, timeoutMs: 60000 })
        });
        if (!res.body) throw new Error('No stream');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';
          for (const evt of events) {
            const lines = evt.split('\n');
            const ev = (lines.find((l) => l.startsWith('event:')) || '').slice(6).trim();
            const dataLine = (lines.find((l) => l.startsWith('data:')) || '').slice(5).trim();
            if (!ev || !dataLine) continue;
            try {
              const data = JSON.parse(dataLine);
              if (ev === 'reason') {
                setReasoning((prev) => (prev || '') + data.chunk);
              } else if (ev === 'final') {
                setRecs(data.recommendations || []);
                setSource(data.source || null);
                if (data.reasoning && !reasoning) setReasoning(data.reasoning);
                if (data.verdict) setVerdict(data.verdict);
              } else if (ev === 'done') {
                setStreaming(false);
              }
            } catch {}
          }
        }
        setStreaming(false);
      } else {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry, painPoints: pain, timeoutMs: 60000, includeReasoning: false }),
          cache: 'no-store'
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error');
        setRecs(json.recommendations || []);
        setSource(json.source || null);
        setVerdict(json.verdict || null);
        setReasoning(null);
      }
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col items-center justify-center px-6 py-16" id="personalizacion">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-[22rem] w-[22rem] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--color-primary), transparent)" }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-[26rem] w-[26rem] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--color-secondary), transparent)" }} />
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-semibold">Diseñemos la solución que tu equipo necesita</h2>
        {source ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
            {source === 'openai' ? 'Generado (OpenAI)' : 'Baseline (CMS)'}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm text-muted">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={explain} onChange={(e) => setExplain(e.target.checked)} />
          Explicar cómo lo haríamos (reasoning)
        </label>
      </div>
      <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          ref={industryRef}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder={`Industria o sector (ej. ${phIndustry})`}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none backdrop-blur focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
        <input
          ref={painRef}
          value={pain}
          onChange={(e) => setPain(e.target.value)}
          placeholder={`¿Qué te duele hoy? (ej. ${phPain})`}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none backdrop-blur focus:border-secondary focus:ring-2 focus:ring-secondary/40"
        />
        <button
          disabled={loading}
          className="rounded-xl bg-primary px-5 py-3 font-medium text-black shadow-[0_0_30px_-10px_rgba(93,95,239,0.8)] hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Generando..." : "Ver cómo lo resolvemos"}
        </button>
      </form>
      {/* Banner de veredicto */}
      {verdict ? (
        <div className={`mt-6 w-full max-w-3xl rounded-2xl border px-4 py-3 ${verdict.type==='fit' ? 'border-primary/40 bg-white/5' : 'border-white/10 bg-white/5'}`}>
          <div className="text-sm font-medium">{verdict.title}</div>
          <ul className="mt-2 list-disc pl-5 text-xs text-muted space-y-1">
            {verdict.bullets.map((b, i)=> (<li key={i}>{b}</li>))}
          </ul>
        </div>
      ) : null}
      {/* Pills de sugerencias */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        {industrySuggestions.map((s) => (
          <button key={s} type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10" onClick={() => setIndustry(s)}>{s}</button>
        ))}
        <span className="mx-2 opacity-50">·</span>
        {painSuggestions.map((s) => (
          <button key={s} type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10" onClick={() => setPain((p) => (p ? `${p}, ${s}` : s))}>{s}</button>
        ))}
        <span className="ml-auto text-[10px] opacity-70">Atajos: ⌘K enfocar · Esc limpiar</span>
      </div>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {recs.length > 0 ? (
        <div className="mt-4 text-sm text-muted">
          <strong>Buscaste</strong>: {industry || '—'} · {pain || '—'} · <strong>Skills detectadas</strong>:{' '}
          {Array.from(
            new Set(
              recs.flatMap((r) =>
                Array.isArray(r.technologies)
                  ? r.technologies.map((t: any) => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
                  : []
              )
            )
          ).join(', ') || '—'}
        </div>
      ) : null}
      {/* Reasoning live text */}
      {explain ? (
        <div className="mt-6 w-full max-w-3xl">
          {reasoning ? (
            <pre className="whitespace-pre-wrap font-mono text-base md:text-lg leading-8 text-muted">
              {reasoning}
              {streaming ? <span className="ml-1 opacity-70 animate-pulse">▋</span> : null}
            </pre>
          ) : streaming ? (
            <div className="space-y-2">
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/10"/>
              <div className="h-4 w-4/6 animate-pulse rounded bg-white/10"/>
              <div className="h-4 w-3/6 animate-pulse rounded bg-white/10"/>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Minimal list of results (desplegables) */}
      <div className="mt-8 w-full max-w-3xl">
        {recs.slice(0, 3).map((r, i) => (
          <details key={i} className="group border-t border-white/10 py-5 open:pb-6">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-left">
              <div>
                <div className="text-base font-medium">{r.title}</div>
                {r.description ? (
                  <div className="mt-1 line-clamp-2 text-sm text-muted group-open:line-clamp-none">
                    {r.description}
                  </div>
                ) : null}
              </div>
              <span className="mt-1 select-none text-muted transition-transform group-open:rotate-90">▸</span>
            </summary>
            <div className="mt-4 space-y-3">
              {(r as any).reason ? (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Por qué encaja</div>
                  <p className="mt-1 text-sm text-muted">{(r as any).reason}</p>
                </div>
              ) : null}
              {Array.isArray(r.technologies) && r.technologies.length ? (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Tecnologías</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.technologies.map((t: any, idx: number) => (
                      <span key={idx} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
                        {typeof t === 'string' ? t : t?.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">Siguientes pasos</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                  <li>Reunión de 30 min para acotar alcance y métricas de éxito.</li>
                  <li>Propuesta rápida (1–2 páginas) con entregables y cronograma.</li>
                  <li>Piloto de 2–4 semanas enfocado en resultados medibles.</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      const txt = `${r.title}\n\nResumen: ${r.description || ''}\n\nPor qué encaja: ${(r as any).reason || ''}\n\nTecnologías: ${Array.isArray(r.technologies) ? r.technologies.map((t:any)=> typeof t==='string'?t:t?.name).join(', ') : ''}`;
                      navigator.clipboard.writeText(txt).catch(()=>{});
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
                  >
                    Copiar propuesta
                  </button>
                  <a
                    href={`mailto:contacto@lyr.io?subject=${encodeURIComponent('Interés: ' + r.title)}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
                  >
                    Agendar demo
                  </a>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* CTA al terminar */}
      {recs.length > 0 && !streaming ? (
        <div className="mt-8">
          <a href="mailto:contacto@lyr.io?subject=Consulta%20LYR" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm hover:bg-white/10">
            Agendar demo ➜
          </a>
        </div>
      ) : null}
    </section>
  );
}


