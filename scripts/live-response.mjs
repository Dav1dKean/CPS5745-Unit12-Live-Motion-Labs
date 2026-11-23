import { createHash } from 'node:crypto';
import { providers } from './providers.mjs';

export async function serveLiveData(req, res, key, mode) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  function send(status, body) {
    res.writeHead(status);
    res.end(JSON.stringify(body));
  }

  const source = Object.hasOwn(providers, key) ? providers[key] : null;
  if (!source) return send(404, { error: 'Unknown live dataset' });
  if (req.method !== 'GET') return send(405, { error: 'GET only' });
  if (mode === 'snapshot') {
    return send(410, {
      error: 'Saved-data mode has been removed. This lab is live-only.',
    });
  }

  try {
    const response = await fetch(source.url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(25000),
      headers: {
        'User-Agent': 'CPS5745-Live-D3-Labs/2.0',
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) throw Error(`${source.name} returned HTTP ${response.status}`);
    const rawText = await response.text();
    send(200, {
      raw: JSON.parse(rawText),
      rawText,
      meta: {
        ...source,
        key,
        mode: 'live',
        fetchedAt: new Date().toISOString(),
        providerDate: response.headers.get('date'),
        providerAge: response.headers.get('age'),
        sha256: createHash('sha256').update(rawText).digest('hex'),
      },
    });
  } catch (error) {
    send(502, {
      error: `Live request failed: ${error.message}. No saved response is substituted.`,
    });
  }
}
