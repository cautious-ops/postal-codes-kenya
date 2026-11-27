import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildSeoHtmlPage } from '../shared/seoRenderer.ts';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const slugParam = req.query?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam ?? '';
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader ?? 'https';
  const hostHeader = req.headers['x-forwarded-host'] ?? req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader ?? 'localhost:3000';
  const baseUrl = process.env.APP_URL || `${proto}://${host}`;

  const { status, html } = buildSeoHtmlPage(slug, baseUrl);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.status(status).send(html);
}
