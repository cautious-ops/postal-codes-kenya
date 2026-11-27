import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildRobotsTxt, resolveRequestBaseUrl } from '../shared/seoRenderer.ts';

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
}

export default function handler(req: IncomingMessage, res: VercelResponse) {
  const baseUrl = resolveRequestBaseUrl(req.headers);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.status(200).send(buildRobotsTxt(baseUrl));
}
