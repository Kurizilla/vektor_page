type Props = {
  items: Array<{ name: string; desc?: string; tags?: string[] }>;
};

export function Projects({ items }: Props) {
  return (
    <section id="proyectos" className="mx-auto max-w-6xl py-16 px-6">
      <h2 className="text-2xl md:text-3xl font-semibold">Proyectos representativos</h2>
      <div className="mt-6 grid gap-6">
        {items.map((p) => (
          <article key={p.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 md:flex md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-medium">{p.name}</h3>
              <p className="mt-2 text-sm text-muted">{p.desc}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
              {(p.tags || []).map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


