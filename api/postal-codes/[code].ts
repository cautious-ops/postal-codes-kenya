import type { IncomingMessage, ServerResponse } from 'node:http';
import { lookupByExactCode } from '../../shared/postalService.ts';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

function extractCode(req: VercelRequest): string {
  const rawParam = req.query?.code;
  if (rawParam !== undefined) {
    return (Array.isArray(rawParam) ? rawParam[0] : rawParam).trim();
  }
  if (req.url) {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const segment = pathname.split('/').filter(Boolean).pop() ?? '';
    return decodeURIComponent(segment).trim();
  }
  return '';
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
    const rawCode = extractCode(req);

    if (!/^\d{3,5}$/.test(rawCode)) {
      res.status(400).json({
        error: 'Invalid postal code format. Provide a 5-digit Kenyan postal code (e.g. 00100).',
      });
      return;
    }

    const matches = lookupByExactCode(rawCode);
    if (matches.length === 0) {
      res.status(404).json({
        error: `No postal office found for code ${rawCode.padStart(5, '0')}.`,
        code: rawCode.padStart(5, '0'),
        matches: [],
      });
      return;
    }

    res.status(200).json({
      code: matches[0].code,
      countyCode: matches[0].countyCode,
      countySlug: matches[0].countySlug,
      countyName: matches[0].countyName,
      location: matches[0].location,
      matches,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
