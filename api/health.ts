import type { IncomingMessage, ServerResponse } from 'node:http';
import { POSTAL_ENTRIES } from '../shared/postalService.ts';

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

  res.status(200).json({
    status: 'ok',
    records: POSTAL_ENTRIES.length,
    regions: 10,
    version: '1.0.0',
  });
}
