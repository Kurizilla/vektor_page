# LYR — Página corporativa (Web + CMS)

Stack:
- Web: Next.js (App Router, TypeScript, Tailwind)
- CMS: Strapi
- DB: Postgres
- Docker: docker-compose (dev y prod)

## Requisitos
- Node.js 20+
- Docker & Docker Compose v2

## Primeros pasos (desarrollo)
1. Copia `.env.example` a `.env` y ajusta valores.
2. Levanta servicios:

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

3. Web: http://localhost:3000
4. CMS Strapi (setup inicial): http://localhost:1337

## Producción (local)
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Estructura
- `web/` — app Next.js
- `cms/` — código/estado de Strapi (montado en contenedor)
- `docker-compose.*.yml` — definiciones de orquestación

## Notas
- Los tokens de diseño viven en `web/tokens/default.json` y se inyectan como CSS variables.
- Más adelante conectaremos el tema y contenido desde el CMS.
