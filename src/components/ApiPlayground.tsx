import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import {
  POSTAL_ENTRIES,
  entriesToCsv,
  getRegionsSummary,
  lookupByExactCode,
  queryPostalCodes,
} from '../../shared/postalService.ts';

type EndpointKey = 'lookup' | 'exact' | 'regions' | 'csv' | 'health';
type SnippetLang = 'curl' | 'javascript' | 'php';

interface ApiPlaygroundProps {
  externalCodeQuery?: string | null;
}

const API_PRESETS = [
  { label: 'Find Nairobi', key: 'lookup' as const, q: 'Nairobi', region: 'all', limit: '5' },
  { label: 'Code 00100', key: 'exact' as const, code: '00100' },
  { label: 'Coast Offices', key: 'lookup' as const, q: '', region: '8', limit: '10' },
  { label: 'All 647 JSON', key: 'lookup' as const, q: '', region: 'all', limit: 'all' },
];

const ENDPOINT_DOCS: ReadonlyArray<{
  key: EndpointKey;
  label: string;
  path: string;
  summary: string;
}> = [
  {
    key: 'lookup',
    label: 'Simple Lookup',
    path: '/api/lookup?q=Nairobi',
    summary: 'Search by town, region, or code',
  },
  {
    key: 'exact',
    label: 'Exact Code',
    path: '/api/postal-codes/00100',
    summary: 'Look up a single 5-digit code',
  },
  {
    key: 'regions',
    label: 'List Regions',
    path: '/api/regions',
    summary: 'All 10 Kenya postal zones',
  },
  {
    key: 'csv',
    label: 'CSV Export',
    path: '/api/postal-codes?format=csv',
    summary: 'Download or stream CSV rows',
  },
  {
    key: 'health',
    label: 'Health Check',
    path: '/api/health',
    summary: 'Dataset counts & active domain',
  },
];

function resolveLocally(
  pathToFetch: string,
  origin: string
): { status: number; body: string } {
  const url = new URL(pathToFetch, origin);
  const pathname = url.pathname.replace(/\/+$/, '');

  if (pathname === '/api/health') {
    return {
      status: 200,
      body: JSON.stringify(
        {
          status: 'ok',
          baseUrl: origin,
          records: POSTAL_ENTRIES.length,
          regions: 10,
          version: '1.0.0',
        },
        null,
        2
      ),
    };
  }

  if (pathname === '/api/regions') {
    return {
      status: 200,
      body: JSON.stringify(
        {
          totalRecords: POSTAL_ENTRIES.length,
          regions: getRegionsSummary(),
        },
        null,
        2
      ),
    };
  }

  if (pathname.startsWith('/api/postal-codes/')) {
    const rawCode = decodeURIComponent(pathname.slice('/api/postal-codes/'.length)).trim();
    if (!/^\d{3,5}$/.test(rawCode)) {
      return {
        status: 400,
        body: JSON.stringify(
          {
            error: 'Invalid postal code format. Provide a 5-digit Kenyan postal code (e.g. 00100).',
          },
          null,
          2
        ),
      };
    }
    const matches = lookupByExactCode(rawCode);
    if (matches.length === 0) {
      return {
        status: 404,
        body: JSON.stringify(
          {
            error: `No postal office found for code ${rawCode.padStart(5, '0')}.`,
            code: rawCode.padStart(5, '0'),
            matches: [],
          },
          null,
          2
        ),
      };
    }
    return {
      status: 200,
      body: JSON.stringify(
        {
          code: matches[0].code,
          regionId: matches[0].regionId,
          regionName: matches[0].regionName,
          location: matches[0].location,
          matches,
        },
        null,
        2
      ),
    };
  }

  const q = url.searchParams.get('q')?.slice(0, 100) ?? undefined;
  const code = url.searchParams.get('code')?.slice(0, 10) ?? undefined;
  const region = url.searchParams.get('region')?.slice(0, 10) ?? undefined;
  const format = (url.searchParams.get('format') ?? 'json').toLowerCase();
  const rawLimit = url.searchParams.get('limit') ?? undefined;
  const rawOffset = url.searchParams.get('offset') ?? undefined;

  if (region && region !== 'all' && !/^[0-9]$/.test(region)) {
    return {
      status: 400,
      body: JSON.stringify(
        { error: 'Invalid region parameter. Expected a single digit 0-9 or "all".' },
        null,
        2
      ),
    };
  }

  const isLookup = pathname === '/api/lookup';
  const limit =
    rawLimit === 'all'
      ? POSTAL_ENTRIES.length
      : rawLimit
        ? Number.parseInt(rawLimit, 10)
        : isLookup
          ? 20
          : 50;
  const offset = !isLookup && rawOffset ? Number.parseInt(rawOffset, 10) : 0;

  const payload = queryPostalCodes({ q, code, region, limit, offset });

  if (format === 'csv') {
    return { status: 200, body: entriesToCsv(payload.results) };
  }

  if (isLookup) {
    return {
      status: 200,
      body: JSON.stringify(
        {
          query: q ?? code ?? null,
          total: payload.total,
          results: payload.results,
        },
        null,
        2
      ),
    };
  }

  return { status: 200, body: JSON.stringify(payload, null, 2) };
}

export function ApiPlayground({ externalCodeQuery }: ApiPlaygroundProps) {
  const [endpointKey, setEndpointKey] = useState<EndpointKey>('lookup');
  const [qParam, setQParam] = useState('Nairobi');
  const [regionParam, setRegionParam] = useState('all');
  const [limitParam, setLimitParam] = useState('5');
  const [codeParam, setCodeParam] = useState('00100');
  const [snippetLang, setSnippetLang] = useState<SnippetLang>('javascript');

  const [responseText, setResponseText] = useState<string>('');
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

  function buildPath(
    key: EndpointKey,
    overrides?: { q?: string; region?: string; limit?: string; code?: string }
  ): string {
    const q = overrides?.q ?? qParam;
    const region = overrides?.region ?? regionParam;
    const limit = overrides?.limit ?? limitParam;
    const code = overrides?.code ?? codeParam;

    if (key === 'exact') {
      const safeCode = code.trim() || '00100';
      return `/api/postal-codes/${encodeURIComponent(safeCode)}`;
    }
    if (key === 'regions') {
      return '/api/regions';
    }
    if (key === 'health') {
      return '/api/health';
    }
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (region && region !== 'all') params.set('region', region);
    if (limit.trim()) params.set('limit', limit.trim());
    if (key === 'csv') params.set('format', 'csv');
    const qs = params.toString();
    const base = key === 'csv' ? '/api/postal-codes' : '/api/lookup';
    return qs ? `${base}?${qs}` : base;
  }

  const activePath = buildPath(endpointKey);
  const fullUrl = `${origin}${activePath}`;

  async function executeRequest(pathToFetch = activePath) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setErrorText(null);
    const startedAt = performance.now();

    try {
      const expectsCsv = pathToFetch.includes('format=csv');
      const res = await fetch(pathToFetch, {
        signal: controller.signal,
        credentials: 'same-origin',
        headers: {
          Accept: expectsCsv ? 'text/csv, text/plain, */*' : 'application/json',
        },
      });
      const elapsed = Math.round(performance.now() - startedAt);
      const contentType = res.headers.get('content-type') ?? '';

      if (contentType.includes('text/html')) {
        const fallback = resolveLocally(pathToFetch, origin);
        setHttpStatus(fallback.status);
        setLatencyMs(elapsed);
        setResponseText(fallback.body);
        return;
      }

      setHttpStatus(res.status);
      setLatencyMs(elapsed);

      if (contentType.includes('application/json')) {
        const json = await res.json();
        setResponseText(JSON.stringify(json, null, 2));
      } else {
        const raw = await res.text();
        setResponseText(raw);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const elapsed = Math.round(performance.now() - startedAt);
      try {
        const fallback = resolveLocally(pathToFetch, origin);
        setHttpStatus(fallback.status);
        setLatencyMs(elapsed);
        setResponseText(fallback.body);
        setErrorText(null);
      } catch (fallbackErr) {
        setErrorText(fallbackErr instanceof Error ? fallbackErr.message : 'Request failed');
        setHttpStatus(null);
      }
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void executeRequest('/api/lookup?q=Nairobi&limit=5');
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (externalCodeQuery) {
      setEndpointKey('exact');
      setCodeParam(externalCodeQuery);
      void executeRequest(`/api/postal-codes/${encodeURIComponent(externalCodeQuery)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalCodeQuery]);

  function getSnippet(): string {
    if (snippetLang === 'curl') {
      return `curl -s "${fullUrl}"`;
    }
    if (snippetLang === 'javascript') {
      return `const res = await fetch("${fullUrl}");\nconst data = await res.json();\nconsole.log(data.results ?? data);`;
    }
    return `<?php\n$json = file_get_contents("${fullUrl}");\n$data = json_decode($json, true);\nprint_r($data);`;
  }

  async function copyText(value: string, target: 'url' | 'snippet') {
    try {
      await navigator.clipboard.writeText(value);
      if (target === 'url') {
        setCopiedUrl(true);
        window.setTimeout(() => setCopiedUrl(false), 1500);
      } else {
        setCopiedSnippet(true);
        window.setTimeout(() => setCopiedSnippet(false), 1500);
      }
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <section
      id="api-explorer"
      className="py-12 sm:py-16 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Public REST API · Zero API Keys · CORS Enabled
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Free Kenya Postal Codes API
            </h2>
            <p className="mt-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
              Base URL: <span className="text-[#EA580C] dark:text-[#FB923C]">{origin}</span>
            </p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md shrink-0">
            Call one simple GET URL from JavaScript, PHP, WordPress, or cURL—auto-configured for your installed domain with zero auth headers needed.
          </p>
        </div>

        <div className="mb-6 flex flex-nowrap overflow-x-auto sm:flex-wrap items-center gap-2 text-xs no-scrollbar pb-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium mr-1 shrink-0">
            Quick examples:
          </span>
          {API_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setEndpointKey(preset.key);
                if (preset.key === 'exact' && 'code' in preset) {
                  setCodeParam(preset.code);
                  void executeRequest(buildPath('exact', { code: preset.code }));
                } else {
                  const q = 'q' in preset ? preset.q : '';
                  const region = 'region' in preset ? preset.region : 'all';
                  const limit = 'limit' in preset ? preset.limit : '10';
                  setQParam(q);
                  setRegionParam(region);
                  setLimitParam(limit);
                  void executeRequest(buildPath('lookup', { q, region, limit }));
                }
              }}
              className="min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 min-w-0 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-5">
            <div>
              <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                01. Choose Endpoint
              </span>
              <div className="space-y-1.5">
                {ENDPOINT_DOCS.map((item) => {
                  const active = endpointKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setEndpointKey(item.key);
                        void executeRequest(buildPath(item.key));
                      }}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? 'bg-slate-900 dark:bg-[#F38020] border-slate-900 dark:border-[#F38020] text-white'
                          : 'bg-white dark:bg-[#0B0F17] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold truncate">{item.label}</span>
                        <span
                          className={`block text-[11px] font-mono truncate ${
                            active ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.path}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-medium shrink-0 hidden sm:inline ${
                          active ? 'text-white/90' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        GET
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                02. Query Parameters
              </span>

              {(endpointKey === 'lookup' || endpointKey === 'csv') && (
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="api-q"
                      className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                    >
                      q (search town, region, or partial code)
                    </label>
                    <input
                      id="api-q"
                      type="text"
                      value={qParam}
                      onChange={(e) => setQParam(e.target.value)}
                      placeholder="e.g. Nairobi, 40100"
                      className="w-full h-11 sm:h-10 px-3 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-base sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-[#F38020] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="api-region"
                        className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                      >
                        region (0–9 or all)
                      </label>
                      <select
                        id="api-region"
                        value={regionParam}
                        onChange={(e) => setRegionParam(e.target.value)}
                        className="w-full h-11 sm:h-10 px-3 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-[#F38020] focus:outline-none"
                      >
                        <option value="all">all</option>
                        <option value="0">0 · Nairobi &amp; Metro</option>
                        <option value="1">1 · Central</option>
                        <option value="2">2 · South/Central Rift</option>
                        <option value="3">3 · North Rift</option>
                        <option value="4">4 · Nyanza</option>
                        <option value="5">5 · Western</option>
                        <option value="6">6 · Upper Eastern</option>
                        <option value="7">7 · North Eastern</option>
                        <option value="8">8 · Coast</option>
                        <option value="9">9 · Lower Eastern</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="api-limit"
                        className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                      >
                        limit (1–1000 or all)
                      </label>
                      <input
                        id="api-limit"
                        type="text"
                        value={limitParam}
                        onChange={(e) => setLimitParam(e.target.value)}
                        className="w-full h-11 sm:h-10 px-3 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-base sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-[#F38020] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {endpointKey === 'exact' && (
                <div>
                  <label
                    htmlFor="api-code"
                    className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                  >
                    5-digit Kenyan postal code
                  </label>
                  <input
                    id="api-code"
                    type="text"
                    inputMode="numeric"
                    value={codeParam}
                    onChange={(e) => setCodeParam(e.target.value)}
                    placeholder="00100"
                    className="w-full h-11 sm:h-10 px-3 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-base sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-[#F38020] focus:outline-none"
                  />
                </div>
              )}

              {endpointKey === 'regions' && (
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  Returns all 10 Kenyan postal regions with office counts and min/max postal code ranges. No parameters required.
                </p>
              )}

              {endpointKey === 'health' && (
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  Returns service status, active auto-detected domain URL, total records ({POSTAL_ENTRIES.length}), and API version.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => void executeRequest(activePath)}
              disabled={isLoading}
              className="w-full h-12 sm:h-11 bg-[#F38020] hover:bg-[#D96B0F] text-white font-semibold text-sm rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Play className="w-4 h-4" />
              {isLoading ? 'Sending Request...' : 'Send Live Request'}
            </button>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {(['javascript', 'php', 'curl'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSnippetLang(lang)}
                      className={`min-h-[40px] sm:min-h-0 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        snippetLang === lang
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : 'PHP'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void copyText(getSnippet(), 'snippet')}
                  className="inline-flex items-center gap-1 min-h-[40px] sm:min-h-0 px-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  {copiedSnippet ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedSnippet ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3.5 bg-[#090D16] text-slate-100 border border-slate-800 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                <code>{getSnippet()}</code>
              </pre>
            </div>
          </div>

          <div className="lg:col-span-7 min-w-0 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-[#090D16] text-slate-100 shadow-xs">
            <div className="px-4 py-3 bg-[#111827] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-mono text-xs font-semibold text-[#FB923C] shrink-0">GET</span>
                <code className="font-mono text-xs text-slate-200 truncate">{activePath}</code>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono tabular-nums">
                {httpStatus !== null && (
                  <span className={httpStatus < 400 ? 'text-emerald-400' : 'text-rose-400'}>
                    {httpStatus} {httpStatus < 400 ? 'OK' : 'Error'}
                  </span>
                )}
                {latencyMs !== null && <span className="text-slate-400">{latencyMs} ms</span>}
                <button
                  type="button"
                  onClick={() => void copyText(fullUrl, 'url')}
                  className="inline-flex items-center gap-1 min-h-[40px] sm:min-h-0 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors cursor-pointer font-sans font-medium"
                >
                  {copiedUrl ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedUrl ? 'Copied URL' : 'Copy URL'}
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[460px] sm:max-h-[540px] overflow-auto">
              {errorText ? (
                <p className="text-sm text-rose-400 font-mono">{errorText}</p>
              ) : (
                <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre overflow-x-auto">
                  <code>{responseText || 'Click "Send Live Request" to inspect the API payload.'}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
