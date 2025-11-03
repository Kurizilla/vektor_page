export default {
  async bootstrap({ strapi }: { strapi: any }) {
    const ensureCreated = async (
      uid: string,
      where: Record<string, unknown>,
      data: Record<string, unknown>
    ) => {
      const existing = await strapi.db.query(uid).findOne({ where });
      if (!existing) {
        return strapi.db.query(uid).create({ data });
      }
      return existing;
    };

    // Seed basic industries
    const health = await ensureCreated('api::industry.industry', { slug: 'salud-digital' }, {
      name: 'Salud Digital',
      slug: 'salud-digital'
    });
    const finance = await ensureCreated('api::industry.industry', { slug: 'activos-digitales' }, {
      name: 'Activos Digitales',
      slug: 'activos-digitales'
    });

    // Seed services
    await ensureCreated('api::service.service', { slug: 'inteligencia-artificial' }, {
      title: 'Inteligencia Artificial',
      slug: 'inteligencia-artificial',
      summary:
        'Modelado predictivo, clasificación, clustering, optimización; integración de LLMs, RAG y razonamiento.',
      body: 'Diseño y orquestación de flujos multiagente (A2A/MCP) con control de estados y telemetría.'
    });
    await ensureCreated('api::service.service', { slug: 'blockchain' }, {
      title: 'Blockchain',
      slug: 'blockchain',
      summary:
        'Arquitecturas híbridas on/off-chain, redes permissioned (Fabric, EVM, Solana), MPC y KYT.',
      body: 'Contratos inteligentes, tokenización y soluciones DeFi/NFT orientadas a modelos sostenibles.'
    });
    await ensureCreated('api::service.service', { slug: 'automatizacion-avanzada' }, {
      title: 'Automatización Avanzada',
      slug: 'automatizacion-avanzada',
      summary:
        'Pipelines de datos, agentes, telemetría y cumplimiento operativo con tableros de control.',
      body: 'Integración CI/CD, orquestación, y monitoreo con métricas y trazabilidad.'
    });

    // Seed case studies (link to industries via many-to-many)
    const case1 = await ensureCreated('api::case.case', { slug: 'gestion-datos-clinicos' }, {
      title: 'Sistema Inteligente de Gestión de Datos Clínicos',
      slug: 'gestion-datos-clinicos',
      description:
        'Infraestructura en nube para integrar y analizar información clínica (FHIR), con modelos de IA para indicadores críticos y confidencialidad.',
      technologies: ['FHIR', 'Vertex AI', 'BigQuery']
    });
    const case2 = await ensureCreated('api::case.case', { slug: 'plataforma-multiagente' }, {
      title: 'Plataforma Multiagente para Evaluación y Recomendación',
      slug: 'plataforma-multiagente',
      description:
        'Orquestación segura de agentes (A2A/MCP) con estados, sets/gets y tableros de telemetría.',
      technologies: ['LLMs', 'MCP', 'RAG']
    });

    // Attach industries to cases if relation exists
    try {
      await strapi.db.query('api::case.case').update({ where: { id: case1.id }, data: { industries: [health.id] } });
      await strapi.db.query('api::case.case').update({ where: { id: case2.id }, data: { industries: [finance.id] } });
    } catch {}

    // Site settings (single type)
    await ensureCreated('api::site-setting.site-setting', { id: 1 }, {
      siteName: 'LYR.io',
      primaryColor: '#5D5FEF',
      secondaryColor: '#00E0FF'
    });
  }
};


