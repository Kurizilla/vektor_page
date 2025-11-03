export const metadata = {
  title: 'Cómo trabajamos · LYR',
  description: 'Nuestro enfoque en 4 etapas: Descubrir → Prototipo → Piloto → Escala.'
};

export default function ComoTrabajamosPage() {
  const steps = [
    {
      title: 'Descubrir',
      desc:
        'Entendemos contexto, objetivos y restricciones. Identificamos fuentes de datos, stakeholders y criterios de éxito.'
    },
    {
      title: 'Prototipo',
      desc:
        'Validamos hipótesis de valor rápidamente con un prototipo funcional (IA/Multiagente, RAG, blockchain si aplica).'
    },
    {
      title: 'Piloto',
      desc:
        'Integramos con sistemas reales, definimos métricas, observabilidad y gobierno de datos. Evaluamos ROI y riesgos.'
    },
    {
      title: 'Escala',
      desc:
        'Endurecemos arquitectura, automatizamos despliegues y cumplimos estándares de seguridad y cumplimiento.'
    }
  ];

  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <a href="/" className="text-sm text-muted hover:text-foreground transition-colors">
            ← Volver
          </a>
          <span className="rounded-full border px-3 py-1 text-xs text-muted">Proceso</span>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Cómo trabajamos</h1>
          <p className="mt-3 text-lg md:text-xl text-muted">
            Un camino probado para pasar de la idea a producción con calidad y seguridad.
          </p>
        </header>

        <ol className="grid gap-6 md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <a
            href="/inteligencia"
            className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-medium hover:bg-foreground hover:text-background"
          >
            Ver inteligencia visible
          </a>
        </div>
      </div>
    </main>
  );
}


