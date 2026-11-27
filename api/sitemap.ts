import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildSitemapXml } from '../shared/seoRenderer.ts';

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
}

export default function handler(req: IncomingMessage, res: VercelResponse) {
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader ?? 'https';
  const hostHeader = req.headers['x-forwarded-host'] ?? req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader ?? 'localhost:3000';
  const baseUrl = process.env.APP_URL || `${proto}://${host}`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.status(200).send(buildSitemapXml(baseUrl));
}
