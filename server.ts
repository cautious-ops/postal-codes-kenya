import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  POSTAL_ENTRIES,
  entriesToCsv,
  getRegionsSummary,
  lookupByExactCode,
  queryPostalCodes,
} from './shared/postalService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

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

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      records: POSTAL_ENTRIES.length,
      regions: 10,
      version: '1.0.0',
    });
  });

  app.get('/api/regions', (_req, res) => {
    const regions = getRegionsSummary();
    res.json({
      totalRecords: POSTAL_ENTRIES.length,
      regions,
    });
  });

  app.get('/api/postal-codes', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : undefined;
    const code = typeof req.query.code === 'string' ? req.query.code.slice(0, 10) : undefined;
    const region = typeof req.query.region === 'string' ? req.query.region.slice(0, 10) : undefined;
    const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'json';

    const rawLimit = typeof req.query.limit === 'string' ? req.query.limit : undefined;
    const limit = rawLimit === 'all'
      ? POSTAL_ENTRIES.length
      : rawLimit
        ? Number.parseInt(rawLimit, 10)
        : 50;

    const rawOffset = typeof req.query.offset === 'string' ? req.query.offset : undefined;
    const offset = rawOffset ? Number.parseInt(rawOffset, 10) : 0;

    if (region && region !== 'all' && !/^[0-9]$/.test(region)) {
      res.status(400).json({
        error: 'Invalid region parameter. Expected a single digit 0-9 or "all".',
      });
      return;
    }

    const payload = queryPostalCodes({ q, code, region, limit, offset });

    if (format === 'csv') {
      const csv = entriesToCsv(payload.results);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="kenya-postal-codes.csv"');
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
      regionId: matches[0].regionId,
      regionName: matches[0].regionName,
      location: matches[0].location,
      matches,
    });
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
