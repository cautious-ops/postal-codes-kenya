import { useMemo, useState } from 'react';
import { Check, Code2, Copy, Download, Search, X } from 'lucide-react';
import { queryPostalCodes } from '../../shared/postalService.ts';
import {
  buildEmbedSnippet,
  buildStandaloneEmbedHtml,
  type EmbedFormat,
  type EmbedLayout,
  type EmbedTheme,
} from '../../shared/embedBuilder.ts';

interface EmbedWidgetGeneratorProps {
  onSelectSlug?: (slug: string) => void;
}

const FORMAT_OPTIONS: Array<{
  id: EmbedFormat;
  label: string;
  filename: string;
  hint: string;
}> = [
  {
    id: 'wordpress',
    label: 'WP / HTML',
    filename: 'wordpress-custom-html-block.html',
    hint: 'Paste into a WordPress Custom HTML block, Elementor HTML widget, or any webpage.',
  },
  {
    id: 'iframe',
    label: 'iFrame',
    filename: 'kenya-postal-iframe.html',
    hint: 'Works on Wix, Squarespace, Webflow, Shopify, Ghost, and Notion with zero CSS conflicts.',
  },
  {
    id: 'script',
    label: 'JS Script',
    filename: 'kenya-postal-embed.html',
    hint: 'Drop this 2-line async script snippet anywhere in your HTML or tag manager.',
  },
  {
    id: 'shortcode',
    label: 'WP Shortcode',
    filename: 'kenya-postal-shortcode.php',
    hint: 'Add to functions.php or Code Snippets, then use [kenya_postal_lookup] in any post.',
  },
  {
    id: 'react',
    label: 'React / TSX',
    filename: 'KenyaPostalWidget.tsx',
    hint: 'Drop-in zero-dependency React / Next.js component wired to your live REST API.',
  },
  {
    id: 'standalone',
    label: 'Full .html',
    filename: 'kenya-postal-checker.html',
    hint: 'Complete standalone HTML5 document ready to host or upload to any web folder.',
  },
];

const LAYOUT_OPTIONS: Array<{ id: EmbedLayout; label: string }> = [
  { id: 'card', label: 'Lookup Card' },
  { id: 'compact', label: 'Compact Bar' },
  { id: 'address', label: 'Address Builder' },
];

export function EmbedWidgetGenerator({ onSelectSlug }: EmbedWidgetGeneratorProps) {
  const defaultOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

  const [apiBaseUrl, setApiBaseUrl] = useState(defaultOrigin);
  const [embedFormat, setEmbedFormat] = useState<EmbedFormat>('wordpress');
  const [widgetLayout, setWidgetLayout] = useState<EmbedLayout>('card');
  const [widgetTheme, setWidgetTheme] = useState<EmbedTheme>('light');
  const [previewQuery, setPreviewQuery] = useState('Nairobi');
  const [previewAddrName, setPreviewAddrName] = useState('Wanjiku Kamau');
  const [previewAddrBox, setPreviewAddrBox] = useState('P.O. Box 12345');
  const [previewCopiedCode, setPreviewCopiedCode] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const cleanBaseUrl = apiBaseUrl.trim().replace(/\/+$/, '') || defaultOrigin;

  const previewResults = useMemo(() => {
    const trimmed = previewQuery.trim();
    if (!trimmed) return [];
    return queryPostalCodes({ q: trimmed, limit: widgetLayout === 'compact' ? 3 : 4 }).results;
  }, [previewQuery, widgetLayout]);

  const activeFormatMeta =
    FORMAT_OPTIONS.find((item) => item.id === embedFormat) ?? FORMAT_OPTIONS[0];

  const activeCode = useMemo(() => {
    return buildEmbedSnippet(embedFormat, {
      apiBaseUrl: cleanBaseUrl,
      theme: widgetTheme,
      layout: widgetLayout,
    });
  }, [embedFormat, cleanBaseUrl, widgetTheme, widgetLayout]);

  const standaloneHtml = useMemo(() => {
    return buildStandaloneEmbedHtml({
      apiBaseUrl: cleanBaseUrl,
      theme: widgetTheme,
      layout: widgetLayout,
    });
  }, [cleanBaseUrl, widgetTheme, widgetLayout]);

  const previewAddressOutput = useMemo(() => {
    const matched = previewResults[0] ?? { location: 'Nairobi GPO', code: '00100' };
    const cleanName = previewAddrName.trim() || 'Wanjiku Kamau';
    const rawBox = previewAddrBox.trim();
    const cleanBox = /^\d{1,6}$/.test(rawBox)
      ? `P.O. Box ${rawBox}`
      : rawBox || 'P.O. Box 12345';
    return `${cleanName}\n${cleanBox} – ${matched.code}\n${matched.location}, Kenya`;
  }, [previewResults, previewAddrName, previewAddrBox]);

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopiedHtml(true);
      window.setTimeout(() => setCopiedHtml(false), 1800);
    } catch {
      // Clipboard unavailable
    }
  }

  function handleDownloadFile() {
    const content = embedFormat === 'standalone' ? standaloneHtml : activeCode;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFormatMeta.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handlePreviewCopy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setPreviewCopiedCode(key);
      window.setTimeout(() => setPreviewCopiedCode(null), 1200);
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <section
      id="embed-widget"
      className="py-12 sm:py-16 border-t border-slate-200 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors scroll-mt-4 md:scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              6 Embed Formats · 3 Widget Styles · Zero Dependencies
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Embeddable Postal Code Widgets
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md">
            Embed as WordPress Custom HTML, iFrame, 2-line JS script, PHP shortcode, React component, or a standalone HTML page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 min-w-0 space-y-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="embed-base-url"
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    API &amp; Embed Base URL (Auto-detected)
                  </label>
                  {apiBaseUrl !== defaultOrigin && (
                    <button
                      type="button"
                      onClick={() => setApiBaseUrl(defaultOrigin)}
                      className="text-xs font-semibold text-[#EA580C] dark:text-[#FB923C] hover:underline cursor-pointer"
                    >
                      Use current domain
                    </button>
                  )}
                </div>
                <input
                  id="embed-base-url"
                  type="url"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  placeholder={defaultOrigin}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-base font-mono text-slate-900 dark:text-slate-100 focus:border-[#F38020] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div>
                  <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Embed Format
                  </span>
                  <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl no-scrollbar">
                    {FORMAT_OPTIONS.map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setEmbedFormat(fmt.id)}
                        className={`min-h-[38px] sm:min-h-0 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          embedFormat === fmt.id
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Widget Style
                    </span>
                    <div className="inline-flex flex-wrap p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                      {LAYOUT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setWidgetLayout(opt.id)}
                          className={`min-h-[36px] sm:min-h-0 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                            widgetLayout === opt.id
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Theme
                    </span>
                    <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                      {(['light', 'dark'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setWidgetTheme(mode)}
                          className={`min-h-[36px] sm:min-h-0 px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                            widgetTheme === mode
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`border rounded-2xl p-4 sm:p-5 transition-colors ${
                widgetTheme === 'dark'
                  ? 'bg-[#0F172A] border-slate-800 text-slate-50'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-base font-bold">Live Widget Preview</h3>
                  <p
                    className={`text-xs ${
                      widgetTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {LAYOUT_OPTIONS.find((o) => o.id === widgetLayout)?.label} · {widgetTheme} theme
                  </p>
                </div>
              </div>

              {widgetLayout === 'address' ? (
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={previewAddrName}
                    onChange={(e) => setPreviewAddrName(e.target.value)}
                    placeholder="Recipient Name"
                    aria-label="Preview recipient name"
                    className={`w-full h-11 px-3 rounded-lg text-base border focus:border-[#F38020] focus:outline-none ${
                      widgetTheme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <input
                    type="text"
                    value={previewAddrBox}
                    onChange={(e) => setPreviewAddrBox(e.target.value)}
                    placeholder="P.O. Box 12345"
                    aria-label="Preview P.O. Box"
                    className={`w-full h-11 px-3 rounded-lg text-base border focus:border-[#F38020] focus:outline-none ${
                      widgetTheme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <input
                    type="text"
                    value={previewQuery}
                    onChange={(e) => setPreviewQuery(e.target.value)}
                    placeholder="Town or 5-digit code (e.g. Nairobi GPO, 00100)"
                    aria-label="Preview town or code"
                    className={`w-full h-11 px-3 rounded-lg text-base border focus:border-[#F38020] focus:outline-none ${
                      widgetTheme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <pre
                    className={`p-3.5 rounded-lg border font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                      widgetTheme === 'dark'
                        ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {previewAddressOutput}
                  </pre>
                  <button
                    type="button"
                    onClick={() => void handlePreviewCopy(previewAddressOutput, 'address')}
                    className="w-full h-11 rounded-lg bg-[#F38020] hover:bg-[#D96B0F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {previewCopiedCode === 'address'
                      ? 'Copied Mailing Address'
                      : 'Copy Formatted Address'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={previewQuery}
                      onChange={(e) => setPreviewQuery(e.target.value)}
                      placeholder="Try Nairobi, 00100, Nakuru..."
                      aria-label="Preview widget search"
                      className={`w-full h-11 pl-9 pr-10 rounded-lg text-base border focus:border-[#F38020] focus:outline-none ${
                        widgetTheme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                    {previewQuery && (
                      <button
                        type="button"
                        onClick={() => setPreviewQuery('')}
                        aria-label="Clear preview search"
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {previewResults.length === 0 ? (
                      <p
                        className={`text-xs text-center py-4 ${
                          widgetTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Type a Kenyan town or postal code above.
                      </p>
                    ) : (
                      previewResults.map((row) => (
                        <div
                          key={`${row.location}-${row.code}`}
                          className={`px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-3 ${
                            widgetTheme === 'dark'
                              ? 'bg-slate-800/80 border-slate-700'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <a
                              href={`/postal-code/${row.slug}`}
                              onClick={(e) => {
                                if (onSelectSlug) {
                                  e.preventDefault();
                                  onSelectSlug(row.slug);
                                }
                              }}
                              className="block text-sm font-bold truncate hover:text-[#EA580C] dark:hover:text-[#FB923C] transition-colors"
                            >
                              {row.location}
                            </a>
                            {widgetLayout === 'card' && (
                              <p
                                className={`text-xs truncate ${
                                  widgetTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                }`}
                              >
                                {row.countyName} County
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <a
                              href={`/postal-code/${row.slug}`}
                              onClick={(e) => {
                                if (onSelectSlug) {
                                  e.preventDefault();
                                  onSelectSlug(row.slug);
                                }
                              }}
                              className="font-mono text-base font-bold text-[#F38020] hover:underline"
                              title={`View details for ${row.location} (${row.code})`}
                            >
                              {row.code}
                            </a>
                            <button
                              type="button"
                              onClick={() => void handlePreviewCopy(row.code, row.code)}
                              className={`min-h-[40px] sm:min-h-0 px-3 sm:px-2.5 py-1 text-xs font-semibold rounded-md border cursor-pointer ${
                                widgetTheme === 'dark'
                                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              {previewCopiedCode === row.code ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 min-w-0 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-[#090D16] text-slate-100">
            <div className="px-4 py-3 bg-[#111827] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 min-w-0">
                <Code2 className="w-4 h-4 text-[#FB923C] shrink-0" />
                <span className="truncate">{activeFormatMeta.filename}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopyCode()}
                  className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-[#F38020] hover:bg-[#D96B0F] text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHtml ? 'Copied' : `Copy ${activeFormatMeta.label}`}
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[380px] sm:max-h-[420px] overflow-auto">
              <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre">
                <code>{activeCode}</code>
              </pre>
            </div>

            <div className="px-4 py-3 bg-[#111827] border-t border-slate-800 text-xs text-slate-400">
              {activeFormatMeta.hint}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
