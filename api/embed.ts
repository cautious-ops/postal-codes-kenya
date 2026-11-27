import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  buildStandaloneEmbedHtml,
  type EmbedLayout,
  type EmbedTheme,
} from '../shared/embedBuilder.ts';
import { resolveRequestBaseUrl } from '../shared/seoRenderer.ts';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
}

function getParam(
  req: VercelRequest,
  key: string
): string | undefined {
  const queryVal = req.query?.[key];
  if (typeof queryVal === 'string') return queryVal;
  if (Array.isArray(queryVal) && typeof queryVal[0] === 'string') return queryVal[0];
  if (req.url && req.url.includes('?')) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      return parsed.searchParams.get(key) ?? undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const rawTheme = (getParam(req, 'theme') ?? '').toLowerCase();
  const rawLayout = (getParam(req, 'layout') ?? '').toLowerCase();

  const theme: EmbedTheme = rawTheme === 'dark' ? 'dark' : 'light';
  const layout: EmbedLayout =
    rawLayout === 'compact' || rawLayout === 'address' ? rawLayout : 'card';

  const baseUrl = resolveRequestBaseUrl(req.headers);
  const html = buildStandaloneEmbedHtml({
    apiBaseUrl: baseUrl,
    theme,
    layout,
    compactFrame: true,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
