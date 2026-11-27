import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildSeoHtmlPage, resolveRequestBaseUrl } from '../shared/seoRenderer.ts';

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
  const baseUrl = resolveRequestBaseUrl(req.headers);

  const { status, html } = buildSeoHtmlPage(slug, baseUrl);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.status(status).send(html);
}
