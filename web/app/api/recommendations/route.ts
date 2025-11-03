import { NextRequest, NextResponse } from 'next/server';
import { getCases } from '../../../lib/cms';

export const dynamic = 'force-dynamic';

type Rec = { title: string; description?: string; reason?: string; technologies?: any; score?: number; decision?: 'recommended'|'partial'|'not'; bullets?: string[] };

function computeVerdict(industry: string | undefined, painPoints: unknown, recs: Rec[]) {
  const recommended = recs.filter(r => r.decision === 'recommended').length;
  const partial = recs.filter(r => r.decision === 'partial').length;
  const pains = Array.isArray(painPoints) ? painPoints.join(', ') : (painPoints || '');
  if (recommended >= 1 || (recommended + partial) >= 2) {
    return {
      type: 'fit' as const,
      title: `Podemos ayudarte en ${industry || 'tu industria'}`,
      bullets: [
        `${recommended} recomendación directa · ${partial} parcial`,
        `Ajuste a pain points: ${pains || '—'}`,
        'Propuesta: piloto 2–4 semanas con métricas claras'
      ]
    };
  }
  return {
    type: 'no_fit' as const,
    title: 'Por ahora no somos la mejor opción',
    bullets: [
      `Coincidencias insuficientes con “${pains || '—'}”`,
      'Si compartes más contexto podemos reevaluar',
      'También podemos referirte a un partner específico'
    ]
  };
}

async function rewriteRecommendations(
  apiKey: string | undefined,
  model: string,
  industry: string | undefined,
  painPoints: unknown,
  recs: Array<{ title: string; description?: string; reason?: string; technologies?: any }>,
  debug = false
) {
  if (!apiKey) return recs;
  try {
    const payload = {
      model,
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'Eres redactor técnico. Mejora títulos y descripciones de propuestas para que sean claras, profesionales y orientadas a negocio. Devuelve JSON {"recommendations":[{"title":"...","description":"...","reason":"..."}]} manteniendo el sentido. Evita palabras como "prueba".'
        },
        {
          role: 'user',
          content: `Industria: ${industry || ''}\nPain points: ${Array.isArray(painPoints) ? painPoints.join(', ') : painPoints || ''}\nEntradas: ${JSON.stringify(
            recs.map((r) => ({ title: r.title, description: r.description, reason: r.reason }))
          )}`
        }
      ]
    } as any;
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) return recs;
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return recs;
    const parsed = JSON.parse(content);
    const improved = parsed?.recommendations as Array<{ title: string; description?: string; reason?: string }>;
    if (!Array.isArray(improved)) return recs;
    return recs.map((r, i) => ({
      ...r,
      title: improved[i]?.title || r.title,
      description: improved[i]?.description || r.description,
      reason: improved[i]?.reason || r.reason
    }));
  } catch (e) {
    if (debug) console.error('[recs] rewrite error', (e as any)?.message);
    return recs;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { industry, painPoints, maxResults = 3, timeoutMs: timeoutFromBody, model: modelFromBody, includeReasoning = false } = await req.json();
    const text = `${industry || ''} ${Array.isArray(painPoints) ? painPoints.join(' ') : painPoints || ''}`.toLowerCase();
    const debug = process.env.DEBUG_RECS === '1';
    if (debug) console.log('[recs] payload', { industry, painPoints, maxResults });
    const timeoutMs = Math.max(5000, Math.min(Number(timeoutFromBody) || 30000, 120000));

    // 1) Baseline: ranking local con datos del CMS (garantiza respuesta)
    const tRetrieve = Date.now();
    const cases = await getCases();
    const retrieveMs = Date.now() - tRetrieve;
    const scored = cases.map((c) => {
      const haystack = `${c.title} ${c.description} ${(c.technologies || [])
        .map((t: any) => (typeof t === 'string' ? t : t.name))
        .join(' ')}`.toLowerCase();
      const score = text
        .split(/[^a-z0-9áéíóúüñ]+/i)
        .filter(Boolean)
        .reduce((acc, token) => acc + (haystack.includes(token) ? 1 : 0), 0);
      return { item: c, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const baseline = scored.slice(0, maxResults).map((s) => ({
      title: s.item.title,
      description: s.item.description,
      technologies: s.item.technologies
    }));

    // Helper de compatibilidad
    const pains = (Array.isArray(painPoints) ? painPoints.join(' ') : (painPoints || '')).toLowerCase();
    const toTokens = (str: string) => str.split(/[^a-z0-9áéíóúüñ]+/i).filter(Boolean);
    function evaluate(item: { title: string; description?: string | null; technologies?: any[] | null }) {
      const techTokens = (item.technologies || []).map((t: any) => (typeof t === 'string' ? t : t?.name || '')).join(' ').toLowerCase();
      const pool = `${item.title} ${item.description || ''} ${techTokens}`.toLowerCase();
      const ptoks = toTokens(pains);
      const matches = ptoks.reduce((acc, t) => acc + (pool.includes(t) ? 1 : 0), 0);
      const score = Math.max(0, Math.min(100, Math.round((matches / Math.max(3, ptoks.length)) * 100)));
      const decision = score >= 70 ? 'recommended' : score >= 40 ? 'partial' : 'not';
      const bullets = [
        `Compatibilidad: ${score}% (${decision})`,
        item.technologies && item.technologies.length ? `Stack: ${(item.technologies || []).map((t:any)=> typeof t==='string'?t:t?.name).slice(0,3).join(', ')}` : 'Stack: —',
        item.description ? `Enfoque: ${item.description.slice(0,80)}${(item.description||'').length>80?'…':''}` : 'Enfoque: —'
      ];
      return { score, decision, bullets } as const;
    }

    // 2) Si hay clave de OpenAI, generar recomendaciones estructuradas
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const requestedModel = (modelFromBody as string) || process.env.OPENAI_MODEL || 'gpt-5-nano';
        const available = cases.map((c) => ({ title: c.title, description: c.description, technologies: c.technologies }));

        // Branch 1: reasoning via Responses API (o4-mini suggested)
        if (includeReasoning) {
          const model = requestedModel || 'o4-mini';
          if (debug) console.log('[recs] using Responses API', { model, timeoutMs });
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), timeoutMs);
          const completion = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              reasoning: { effort: 'medium' },
              input: [
                { role: 'user', content: [{ type: 'text', text: `Industria: ${industry || ''}\nPain points: ${Array.isArray(painPoints) ? painPoints.join(', ') : painPoints || ''}\nCapacidades de LYR (resumen): orquestación multiagente (A2A/MCP), integración de datos (FHIR/ETL), IA aplicada (LLMs/RAG), blockchain/traZabilidad, despliegue cloud (GCP/AWS), monitoreo y métricas.\nCasos del CMS (JSON): ${JSON.stringify(available)}\nInstrucciones: Devuelve estrictamente JSON {"recommendations":[{"title":"...","description":"...","technologies":["..."]}]} con propuestas de alto valor. Redacta en tono operativo, evitando frases genéricas. Explica beneficios concretos (qué hacemos, cómo lo implementamos, resultados medibles). No uses placeholders como "prueba".` }] }
              ],
              temperature: 0.3,
              max_output_tokens: 512
            }),
            signal: controller.signal
          });
          clearTimeout(timeout);
          if (debug) console.log('[recs] responses status', completion.status);
          if (completion.ok) {
            const data = await completion.json();
            const contentText = data.output_text || '';
            const reasoningBlock = data.output?.[0]?.content?.find?.((x: any) => x.type === 'reasoning');
            if (contentText) {
              try {
                const parsed = JSON.parse(contentText);
                if (parsed?.recommendations) {
                  let enriched = (parsed.recommendations as any[]).map((r)=> ({...r, ...evaluate(r)}));
                  enriched = await rewriteRecommendations(apiKey, model, industry, painPoints, enriched, debug);
                  const llmMs = Date.now() - tRetrieve - retrieveMs;
                  return NextResponse.json({ source: 'openai', timings: { retrieveMs, llmMs }, hits: { cases: cases.length }, reasoning: reasoningBlock?.text || null, recommendations: enriched });
                }
              } catch {}
            }
          }
          // Fallback: generar explicación sin traces vía Chat Completions (gpt-4o-mini)
          try {
            const fbModel = 'gpt-4o-mini';
            if (debug) console.log('[recs] fallback to chat completions', fbModel);
            const controller2 = new AbortController();
            const timeout2 = setTimeout(() => controller2.abort(), timeoutMs);
            const cc = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: fbModel,
                response_format: { type: 'json_object' },
                temperature: 0.3,
                messages: [
                  { role: 'system', content: 'Eres arquitecto de soluciones en LYR.io. Devuelve estrictamente JSON {"recommendations":[{"title":"...","description":"...","technologies":["..."],"reason":"por qué y cómo lo implementamos (con métricas)"}]}. Tono profesional, accionable; evita generalidades y placeholders.' },
                  { role: 'user', content: `Industria: ${industry || ''}\nPain points: ${Array.isArray(painPoints) ? painPoints.join(', ') : painPoints || ''}\nCapacidades de LYR: multiagente (A2A/MCP), integración/ETL, IA aplicada (LLMs/RAG), blockchain/traZabilidad, cloud (GCP/AWS).\nCasos del CMS (JSON): ${JSON.stringify(available)}\nMax resultados: ${maxResults}` }
                ]
              }),
              signal: controller2.signal
            });
            clearTimeout(timeout2);
            if (cc.ok) {
              const data2 = await cc.json();
              const content2 = data2.choices?.[0]?.message?.content;
              if (content2) {
                try {
                  const parsed2 = JSON.parse(content2);
                  if (parsed2?.recommendations) {
                    // Compact reasoning text for UI convenience
                    const reasons = parsed2.recommendations
                      .map((r: any) => r?.reason)
                      .filter(Boolean)
                      .join('\n\n');
                    let enriched2 = (parsed2.recommendations as any[]).map((r:any)=> ({...r, ...evaluate(r)}));
                    enriched2 = await rewriteRecommendations(apiKey, fbModel, industry, painPoints, enriched2, debug);
                    const llmMs2 = Date.now() - tRetrieve - retrieveMs;
                    const verdict = computeVerdict(industry, painPoints, enriched2);
                    return NextResponse.json({ source: 'openai', timings: { retrieveMs, llmMs: llmMs2 }, hits: { cases: cases.length }, reasoning: reasons || null, verdict, recommendations: enriched2 });
                  }
                } catch {}
              }
            } else if (debug) {
              console.error('[recs] chat fallback status', cc.status, (await cc.text()).slice(0, 300));
            }
          } catch (e) {
            if (debug) console.error('[recs] chat fallback error', (e as any)?.message);
          }
          if (debug) console.error('[recs] responses+chat fallback → baseline');
          const enrichedFb = baseline.map((r)=> ({...r, ...evaluate(r)}));
          return NextResponse.json({ source: 'baseline', timings: { retrieveMs }, hits: { cases: cases.length }, recommendations: enrichedFb });
        }

        // Branch 2: standard chat completions (no reasoning visible)
        const model = requestedModel;
        if (debug) console.log('[recs] using Chat Completions', { model, timeoutMs });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        let completion = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            temperature: 0.3,
            messages: [
              { role: 'system', content: 'Eres arquitecto de LYR.io. Devuelve estrictamente JSON {"recommendations":[{"title":"...","description":"...","technologies":["..."]}]} con foco en ejecución (qué hacemos, cómo lo integramos, qué medimos). Evita frases genéricas y placeholders.' },
              { role: 'user', content: `Industria: ${industry || ''}\nPain points: ${Array.isArray(painPoints) ? painPoints.join(', ') : painPoints || ''}\nCapacidades de LYR: multiagente, IA aplicada, integración de datos, blockchain, cloud.\nCasos del CMS (JSON): ${JSON.stringify(available)}\nMax resultados: ${maxResults}` }
            ]
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (debug) console.log('[recs] openai status', completion.status);

        // Intento de fallback a un modelo más extendido
        if (!completion.ok) {
          const fbModel = 'gpt-4o-mini';
          if (debug) console.log('[recs] retrying with', fbModel);
          const controller2 = new AbortController();
          const timeout2 = setTimeout(() => controller2.abort(), timeoutMs);
          completion = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: fbModel,
              response_format: { type: 'json_object' },
              temperature: 0.3,
              messages: [
                {
                  role: 'system',
                  content:
                    'Eres arquitecto de soluciones en LYR.io. Devuelve estrictamente JSON con la forma {"recommendations":[{"title":"...","description":"...","technologies":["..."]}]}.'
                },
                {
                  role: 'user',
                  content: `Industria: ${industry || ''}\nPain points: ${Array.isArray(painPoints) ? painPoints.join(', ') : painPoints || ''}\nCasos disponibles (JSON): ${JSON.stringify(available)}\nMax resultados: ${maxResults}`
                }
              ]
            }),
            signal: controller2.signal
          });
          clearTimeout(timeout2);
          if (debug) console.log('[recs] fallback status', completion.status);
        }

        if (completion.ok) {
          const data = await completion.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            if (parsed?.recommendations) {
              if (debug) console.log('[recs] openai parsed', parsed.recommendations.length);
              let enrichedStd = (parsed.recommendations as any[]).map((r:any)=> ({...r, ...evaluate(r)}));
              enrichedStd = await rewriteRecommendations(apiKey, model, industry, painPoints, enrichedStd, debug);
              return NextResponse.json({ source: 'openai', recommendations: enrichedStd });
            }
          }
        }
        // Si no se pudo parsear, devolvemos baseline
        const txt = debug ? await completion.text().catch(() => '') : '';
        if (debug) console.error('[recs] openai not ok, fallback', completion.status, txt?.slice(0, 400));
        const enrichedErr = baseline.map((r)=> ({...r, ...evaluate(r)}));
        const verdict = computeVerdict(industry, painPoints, enrichedErr);
        return NextResponse.json({ source: 'baseline', timings: { retrieveMs }, hits: { cases: cases.length }, verdict, recommendations: enrichedErr });
      } catch (err: any) {
        // En error, devolvemos baseline
        if (debug) console.error('[recs] openai error', err?.name, err?.message);
        const enrichedBase = baseline.map((r)=> ({...r, ...evaluate(r)}));
        const verdict = computeVerdict(industry, painPoints, enrichedBase);
        return NextResponse.json({ source: 'baseline', timings: { retrieveMs }, hits: { cases: cases.length }, verdict, recommendations: enrichedBase });
      }
    }

    // 3) Sin clave, devolvemos baseline
    const enrichedBase = baseline.map((r)=> ({...r, ...evaluate(r)}));
    return NextResponse.json({ source: 'baseline', timings: { retrieveMs }, hits: { cases: cases.length }, recommendations: enrichedBase });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 400 });
  }
}


