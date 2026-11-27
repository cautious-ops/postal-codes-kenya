import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  POSTAL_ENTRIES,
  entriesToCsv,
  getCountiesSummary,
  lookupByExactCode,
  queryPostalCodes,
  resolveCountyFilter,
} from './shared/postalService.ts';
import {
  buildLegalHtmlPage,
  buildRobotsTxt,
  buildSeoHtmlPage,
  buildSitemapXml,
  resolveRequestBaseUrl,
} from './shared/seoRenderer.ts';
import {
  buildEmbedJsPayload,
  buildStandaloneEmbedHtml,
  type EmbedLayout,
  type EmbedTheme,
} from './shared/embedBuilder.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const BOT_USER_AGENT_RE =
  /(googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|discordbot)/i;

function getRequestBaseUrl(req: express.Request): string {
  return resolveRequestBaseUrl(req.headers, req.protocol || 'http');
}

async function createServer() {
  const app = express();

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(buildRobotsTxt(getRequestBaseUrl(req)));
  });

  app.get('/sitemap.xml', (req, res) => {
    const xml = buildSitemapXml(getRequestBaseUrl(req));
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  app.get('/embed', (req, res) => {
    const rawTheme = (typeof req.query.theme === 'string' ? req.query.theme : '').toLowerCase();
    const rawLayout = (typeof req.query.layout === 'string' ? req.query.layout : '').toLowerCase();
    const theme: EmbedTheme = rawTheme === 'dark' ? 'dark' : 'light';
    const layout: EmbedLayout =
      rawLayout === 'compact' || rawLayout === 'address' ? rawLayout : 'card';

    const html = buildStandaloneEmbedHtml({
      apiBaseUrl: getRequestBaseUrl(req),
      theme,
      layout,
      compactFrame: true,
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  app.get('/embed.js', (req, res) => {
    const rawTheme = (typeof req.query.theme === 'string' ? req.query.theme : '').toLowerCase();
    const rawLayout = (typeof req.query.layout === 'string' ? req.query.layout : '').toLowerCase();
    const theme: EmbedTheme = rawTheme === 'dark' ? 'dark' : 'light';
    const layout: EmbedLayout =
      rawLayout === 'compact' || rawLayout === 'address' ? rawLayout : 'card';

    const js = buildEmbedJsPayload({
      apiBaseUrl: getRequestBaseUrl(req),
      theme,
      layout,
    });
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.send(js);
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      baseUrl: getRequestBaseUrl(req),
      records: POSTAL_ENTRIES.length,
      counties: 47,
      version: '1.0.0',
    });
  });

  app.get(['/api/counties', '/api/regions'], (_req, res) => {
    const counties = getCountiesSummary();
    res.json({
      totalRecords: POSTAL_ENTRIES.length,
      totalCounties: counties.length,
      counties,
    });
  });

  app.get('/api/lookup', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : undefined;
    const code = typeof req.query.code === 'string' ? req.query.code.slice(0, 10) : undefined;
    const county = typeof req.query.county === 'string' ? req.query.county.slice(0, 60) : undefined;
    const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'json';
    const rawLimit = typeof req.query.limit === 'string' ? req.query.limit : undefined;

    const resolvedCounty =
      county && county.toLowerCase() !== 'all' ? resolveCountyFilter(county) : undefined;

    if (county && county.toLowerCase() !== 'all' && !resolvedCounty) {
      res.status(400).json({
        error: 'Unknown Kenyan county. Pass a county slug (e.g. "nairobi", "mombasa"), county code ("047"), or "all".',
      });
      return;
    }

    const limit = rawLimit === 'all'
      ? POSTAL_ENTRIES.length
      : rawLimit
        ? Number.parseInt(rawLimit, 10)
        : 20;

    const payload = queryPostalCodes({ q, code, county, limit, offset: 0 });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      if (req.query.download === '1') {
        res.setHeader('Content-Disposition', 'attachment; filename="kenya-postal-codes.csv"');
      }
      res.send(entriesToCsv(payload.results));
      return;
    }

    res.json({
      query: q ?? code ?? null,
      county: resolvedCounty?.slug ?? null,
      total: payload.total,
      results: payload.results,
    });
  });

  app.get('/api/postal-codes', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : undefined;
    const code = typeof req.query.code === 'string' ? req.query.code.slice(0, 10) : undefined;
    const county = typeof req.query.county === 'string' ? req.query.county.slice(0, 60) : undefined;
    const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'json';

    const rawLimit = typeof req.query.limit === 'string' ? req.query.limit : undefined;
    const limit = rawLimit === 'all'
      ? POSTAL_ENTRIES.length
      : rawLimit
        ? Number.parseInt(rawLimit, 10)
        : 50;

    const rawOffset = typeof req.query.offset === 'string' ? req.query.offset : undefined;
    const offset = rawOffset ? Number.parseInt(rawOffset, 10) : 0;

    if (county && county.toLowerCase() !== 'all' && !resolveCountyFilter(county)) {
      res.status(400).json({
        error: 'Unknown Kenyan county. Pass a county slug (e.g. "nairobi", "mombasa"), county code ("047"), or "all".',
      });
      return;
    }

    const payload = queryPostalCodes({ q, code, county, limit, offset });

    if (format === 'csv') {
      const csv = entriesToCsv(payload.results);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      if (req.query.download === '1') {
        res.setHeader('Content-Disposition', 'attachment; filename="kenya-postal-codes.csv"');
      }
      res.send(csv);
      return;
    }

    res.json(payload);
  });

  app.get('/api/postal-codes/:code', (req, res) => {
    const rawCode = (req.params.code ?? '').trim();
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

    res.json({
      code: matches[0].code,
      countyCode: matches[0].countyCode,
      countySlug: matches[0].countySlug,
      countyName: matches[0].countyName,
      location: matches[0].location,
      matches,
    });
  });

  app.get('/postal-code/:slug', (req, res, next) => {
    const ua = req.headers['user-agent'] ?? '';
    if (BOT_USER_AGENT_RE.test(ua) || req.query.ssr === '1') {
      const { status, html } = buildSeoHtmlPage(req.params.slug ?? '', getRequestBaseUrl(req));
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(status).send(html);
      return;
    }
    next();
  });

  app.get(['/privacy', '/privacy-policy'], (req, res, next) => {
    const ua = req.headers['user-agent'] ?? '';
    if (BOT_USER_AGENT_RE.test(ua) || req.query.ssr === '1') {
      const { status, html } = buildLegalHtmlPage('privacy', getRequestBaseUrl(req));
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(status).send(html);
      return;
    }
    next();
  });

  app.get(['/terms', '/terms-of-use'], (req, res, next) => {
    const ua = req.headers['user-agent'] ?? '';
    if (BOT_USER_AGENT_RE.test(ua) || req.query.ssr === '1') {
      const { status, html } = buildLegalHtmlPage('terms', getRequestBaseUrl(req));
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(status).send(html);
      return;
    }
    next();
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kenya Postal Directory server running on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
