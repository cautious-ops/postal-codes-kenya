import type { IncomingMessage, ServerResponse } from 'node:http';
import { POSTAL_ENTRIES, getRegionsSummary } from '../shared/postalService.ts';

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

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  res.status(200).json({
    totalRecords: POSTAL_ENTRIES.length,
    regions: getRegionsSummary(),
  });
}
