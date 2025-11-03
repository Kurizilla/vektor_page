export const metadata = {
  title: 'Capacidades · LYR',
  description:
    'Declaración de capacidades técnicas: IA, Blockchain y Automatización Avanzada. Proyectos, especialización y propuesta de valor.'
};

export default function CapacidadesPage() {
  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <a
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Volver
          </a>
          <span className="rounded-full border px-3 py-1 text-xs text-muted">Presentación</span>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Declaración de Capacidades Técnicas
          </h1>
          <p className="mt-3 text-lg md:text-xl text-muted">
            Soluciones Inteligentes en Inteligencia Artificial, Blockchain y Automatización Avanzada
          </p>
        </header>

        <section className="prose prose-invert max-w-none">
          <p>
            Somos un grupo especializado en el diseño y desarrollo de infraestructuras tecnológicas
            seguras y escalables, basadas en <strong>Inteligencia Artificial</strong>,
            <strong> Blockchain</strong> y <strong>automatización avanzada</strong>. Hemos liderado y
            ejecutado proyectos de alcance nacional que integran múltiples sistemas y niveles de
            servicio, capaces de soportar alta carga, garantizar continuidad operativa y cumplir con
            estándares de ciberseguridad. Nuestra experiencia abarca sectores como salud digital,
            activos financieros, gobierno electrónico y educación, combinando ingeniería aplicada,
            arquitectura de software y visión estratégica.
          </p>
          <p>
            A través de una arquitectura modular y metodologías ágiles, diseñamos soluciones que
            conectan datos, modelos y agentes inteligentes bajo entornos controlados, garantizando
            <strong> interoperabilidad</strong>, <strong>cumplimiento normativo</strong> y
            <strong> resultados medibles</strong>.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold">Áreas de Especialización</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-6">
              <h3 className="text-lg font-medium">Inteligencia Artificial y Sistemas Multiagente</h3>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-muted">
                <li>
                  Diseño y orquestación de flujos <strong>multiagente</strong> (A2A/MCP) con control de
                  estados, sets/gets y telemetría.
                </li>
                <li>
                  Modelos predictivos, clasificación, clustering y optimización (supervisado y no
                  supervisado).
                </li>
                <li>
                  Integración de <strong>LLMs</strong>, <strong>pipelines RAG</strong> y motores de
                  razonamiento en arquitecturas corporativas.
                </li>
                <li>
                  Plataformas de apoyo a la decisión con análisis contextual, métricas y trazabilidad de
                  decisiones.
                </li>
              </ul>
            </div>
            <div className="rounded-xl border p-6">
              <h3 className="text-lg font-medium">Blockchain y Activos Digitales</h3>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-muted">
                <li>
                  Arquitecturas híbridas <strong>on/off-chain</strong> con mecanismos de trazabilidad y
                  auditoría automatizada.
                </li>
                <li>
                  Redes permissioned (Hyperledger Fabric, EVM, Solana) para ecosistemas regulados.
                </li>
                <li>
                  <strong>MPC</strong> y <strong>KYT compliance</strong> para seguridad y cumplimiento.
                </li>
                <li>
                  Contratos inteligentes, tokenización y soluciones DeFi/NFT orientadas a modelos
                  sostenibles.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold">Proyectos Representativos</h2>
          <div className="mt-6 grid gap-6">
            <article className="rounded-xl border p-6">
              <h3 className="font-medium">Sistema Inteligente de Gestión de Datos Clínicos (confidencial)</h3>
              <p className="mt-2 text-sm text-muted">
                Infraestructura en la nube para integrar y analizar información clínica estructurada.
                Modelos de IA para identificar variables críticas e indicadores, interoperabilidad FHIR y
                confidencialidad de datos.
              </p>
            </article>
            <article className="rounded-xl border p-6">
              <h3 className="font-medium">Plataforma Multiagente para Evaluación y Recomendación</h3>
              <p className="mt-2 text-sm text-muted">
                Sistema basado en agentes especializados (A2A/MCP) para análisis, clasificación y
                recomendación, con orquestación segura de sets/gets y tableros de telemetría en tiempo real.
              </p>
            </article>
            <article className="rounded-xl border p-6">
              <h3 className="font-medium">Marco Regulatorio para la Trazabilidad de Activos Digitales</h3>
              <p className="mt-2 text-sm text-muted">
                Arquitectura blockchain permissioned orientada a validación regulatoria y transparencia,
                integrando criptografía multiparte (MPC) y controles KYT.
              </p>
            </article>
            <article className="rounded-xl border p-6">
              <h3 className="font-medium">Ecosistema Descentralizado de Participación Digital</h3>
              <p className="mt-2 text-sm text-muted">
                Plataforma gamificada basada en NFTs y contratos inteligentes, con métricas on-chain y
                economía participativa verificable.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold">Capacidades Técnicas</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-6">
              <h3 className="text-lg font-medium">Inteligencia Artificial</h3>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-muted">
                <li>Modelado predictivo, clasificación, clustering y optimización.</li>
                <li>Integración de LLMs, análisis contextual y razonamiento.</li>
                <li>
                  Frameworks: Vertex AI, LangChain, TensorFlow, PyTorch, Scikit-learn, OpenAI API.
                </li>
              </ul>
            </div>
            <div className="rounded-xl border p-6">
              <h3 className="text-lg font-medium">Infraestructura y Datos</h3>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-muted">
                <li>GCP, AWS, Cloud Run, BigQuery, Firestore, Docker, CI/CD.</li>
                <li>Estándares FHIR, APIs RESTful, JSON-LD, ETL pipelines, Data Governance.</li>
              </ul>
            </div>
            <div className="rounded-xl border p-6">
              <h3 className="text-lg font-medium">Blockchain</h3>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-muted">
                <li>Hyperledger Fabric, EVM, Solidity, Solana, Web3.js.</li>
                <li>MPC, KYT, trazabilidad y auditoría automatizada.</li>
                <li>Contratos inteligentes, tokenización, DeFi/NFT.</li>
              </ul>
            </div>
            <div className="rounded-xl border p-6">
              <h3 className="text-lg font-medium">Metodologías y Gestión</h3>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-muted">
                <li>Ágil (Scrum, Kanban) y diseño centrado en el usuario.</li>
                <li>Integración continua, versionado y despliegue automatizado.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold">Propuesta de Valor</h2>
          <p className="mt-4 text-base md:text-lg text-muted">
            Diseñamos e implementamos soluciones integrales que combinan la potencia de la IA, la
            transparencia del Blockchain y la eficiencia de la automatización inteligente. Transformamos
            información compleja en procesos controlables, auditables y escalables, con capacidades
            probadas en producción y despliegues a nivel país. Nuestras soluciones fortalecen la toma de
            decisiones, mejoran la eficiencia operativa y generan impacto real en las organizaciones.
          </p>
        </section>

        <div className="mt-12">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-medium text-black hover:opacity-90"
          >
            Hablar con LYR
          </a>
        </div>
      </div>
    </main>
  );
}


