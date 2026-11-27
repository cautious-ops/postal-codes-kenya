import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildSeoHtmlPage, resolveRequestBaseUrl } from '../shared/seoRenderer.ts';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
}

function extractSlug(req: VercelRequest): string {
  const slugParam = req.query?.slug;
  if (slugParam !== undefined) {
    return Array.isArray(slugParam) ? slugParam[0] : slugParam;
  }
  if (req.url) {
    const parsed = new URL(req.url, 'http://localhost');
    const qSlug = parsed.searchParams.get('slug');
    if (qSlug) return qSlug;
    return parsed.pathname.split('/').filter(Boolean).pop() ?? '';
  }
  return '';
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const slug = extractSlug(req);
  const baseUrl = resolveRequestBaseUrl(req.headers);

  const { status, html } = buildSeoHtmlPage(slug, baseUrl);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.status(status).send(html);
}
