import type { IncomingMessage, ServerResponse } from 'node:http';
import { POSTAL_ENTRIES, entriesToCsv, queryPostalCodes } from '../shared/postalService.ts';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  send: (body: string) => void;
}

function getParam(
  query: Record<string, string | string[] | undefined> | undefined,
  key: string
): string | undefined {
  const val = query?.[key];
  return Array.isArray(val) ? val[0] : val;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  const q = getParam(req.query, 'q')?.slice(0, 100);
  const code = getParam(req.query, 'code')?.slice(0, 10);
  const region = getParam(req.query, 'region')?.slice(0, 10);
  const format = (getParam(req.query, 'format') ?? 'json').toLowerCase();
  const limitRaw = getParam(req.query, 'limit');
  const limit = limitRaw === 'all'
    ? POSTAL_ENTRIES.length
    : limitRaw
      ? Number.parseInt(limitRaw, 10)
      : 20;

  const result = queryPostalCodes({ q, code, region, limit, offset: 0 });

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.status(200).send(entriesToCsv(result.results));
    return;
  }

  res.status(200).json({
    query: q ?? code ?? null,
    total: result.total,
    results: result.results,
  });
}
