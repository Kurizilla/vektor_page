import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { industry, painPoints, timeoutMs = 60000 } = await req.json();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const write = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // 1) Stream reasoning tokens from Chat Completions (widely available)
        const apiKey = process.env.OPENAI_API_KEY;
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const prompt = `Explica en 2-4 frases por qué, para INDUSTRIA="${industry || ''}" y PAIN_POINTS="${Array.isArray(painPoints) ? painPoints.join(', ') : painPoints || ''}", nuestras capacidades son relevantes. No uses lenguaje comercial excesivo.`;
        const controllerAbort = new AbortController();
        const to = setTimeout(() => controllerAbort.abort(), Math.max(5000, Math.min(timeoutMs, 120000)));
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            stream: true,
            messages: [
              { role: 'system', content: 'Eres arquitecto de soluciones en LYR.io.' },
              { role: 'user', content: prompt }
            ]
          }),
          signal: controllerAbort.signal
        });
        clearTimeout(to);

        if (resp.ok && resp.body) {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const json = trimmed.slice(5).trim();
              if (json === '[DONE]') continue;
              try {
                const chunk = JSON.parse(json);
                const delta = chunk.choices?.[0]?.delta?.content;
                if (delta) write('reason', { chunk: delta });
              } catch {}
            }
          }
        }

        // 2) Fetch final recommendations (non-stream) from our existing endpoint
        const rec = await fetch('http://localhost:3000/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry, painPoints, includeReasoning: true, timeoutMs })
        });
        const json = await rec.json();
        write('final', json);
        write('done', {});
        controller.close();
      } catch (err) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`event: error\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String((err as any)?.message || err) })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}


