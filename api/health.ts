import type { IncomingMessage, ServerResponse } from 'node:http';
import { POSTAL_ENTRIES } from '../shared/postalService.ts';
import { resolveRequestBaseUrl } from '../shared/seoRenderer.ts';

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export default function handler(req: IncomingMessage, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    res.status(200).json({
      status: 'ok',
      baseUrl: resolveRequestBaseUrl(req.headers),
      records: POSTAL_ENTRIES.length,
      regions: 10,
      version: '1.0.0',
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
