import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildLegalHtmlPage, resolveRequestBaseUrl } from '../shared/seoRenderer.ts';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const pageParam = req.query?.page;
  const rawPage = (Array.isArray(pageParam) ? pageParam[0] : pageParam ?? '').toLowerCase();
  const page: 'privacy' | 'terms' = rawPage === 'terms' ? 'terms' : 'privacy';
  const baseUrl = resolveRequestBaseUrl(req.headers);

  const { status, html } = buildLegalHtmlPage(page, baseUrl);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.status(status).send(html);
}
