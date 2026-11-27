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

function getParam(req: VercelRequest, key: string): string | undefined {
  const val = req.query?.[key];
  if (val !== undefined) {
    return Array.isArray(val) ? val[0] : val;
  }
  if (req.url) {
    const parsed = new URL(req.url, 'http://localhost');
    return parsed.searchParams.get(key) ?? undefined;
  }
  return undefined;
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

  try {
    const q = getParam(req, 'q')?.slice(0, 100);
    const code = getParam(req, 'code')?.slice(0, 10);
    const region = getParam(req, 'region')?.slice(0, 10);
    const format = (getParam(req, 'format') ?? 'json').toLowerCase();

    if (region && region !== 'all' && !/^[0-9]$/.test(region)) {
      res.status(400).json({
        error: 'Invalid region parameter. Expected a single digit 0-9 or "all".',
      });
      return;
    }

    const rawLimit = getParam(req, 'limit');
    const limit =
      rawLimit === 'all'
        ? POSTAL_ENTRIES.length
        : rawLimit
          ? Number.parseInt(rawLimit, 10)
          : 50;
    const rawOffset = getParam(req, 'offset');
    const offset = rawOffset ? Number.parseInt(rawOffset, 10) : 0;

    const payload = queryPostalCodes({ q, code, region, limit, offset });

    if (format === 'csv') {
      const csv = entriesToCsv(payload.results);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      if (getParam(req, 'download') === '1') {
        res.setHeader('Content-Disposition', 'attachment; filename="kenya-postal-codes.csv"');
      }
      res.status(200).send(csv);
      return;
    }

    res.status(200).json(payload);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
