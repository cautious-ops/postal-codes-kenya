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

  if (region && region !== 'all' && !/^[0-9]$/.test(region)) {
    res.status(400).json({
      error: 'Invalid region parameter. Expected a single digit 0-9 or "all".',
    });
    return;
  }

  const rawLimit = getParam(req.query, 'limit');
  const limit = rawLimit === 'all'
    ? POSTAL_ENTRIES.length
    : rawLimit
      ? Number.parseInt(rawLimit, 10)
      : 50;
  const rawOffset = getParam(req.query, 'offset');
  const offset = rawOffset ? Number.parseInt(rawOffset, 10) : 0;

  const payload = queryPostalCodes({ q, code, region, limit, offset });

  if (format === 'csv') {
    const csv = entriesToCsv(payload.results);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kenya-postal-codes.csv"');
    res.status(200).send(csv);
    return;
  }

  res.status(200).json(payload);
}
