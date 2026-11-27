import { useMemo, useState } from 'react';
import { Check, Code2, Copy, Download, Search, X } from 'lucide-react';
import { queryPostalCodes } from '../../shared/postalService.ts';

type SnippetMode = 'wordpress' | 'standalone';
type WidgetTheme = 'light' | 'dark';

interface EmbedWidgetGeneratorProps {
  onSelectSlug?: (slug: string) => void;
}

export function EmbedWidgetGenerator({ onSelectSlug }: EmbedWidgetGeneratorProps) {
  const defaultOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

  const [apiBaseUrl, setApiBaseUrl] = useState(defaultOrigin);
  const [snippetMode, setSnippetMode] = useState<SnippetMode>('wordpress');
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme>('light');
  const [previewQuery, setPreviewQuery] = useState('Nairobi');
  const [previewCopiedCode, setPreviewCopiedCode] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const cleanBaseUrl = apiBaseUrl.trim().replace(/\/+$/, '') || defaultOrigin;

  const previewResults = useMemo(() => {
    const trimmed = previewQuery.trim();
    if (!trimmed) return [];
    return queryPostalCodes({ q: trimmed, limit: 4 }).results;
  }, [previewQuery]);

  const wordpressSnippet = useMemo(() => {
    const isDark = widgetTheme === 'dark';
    const bg = isDark ? '#0f172a' : '#ffffff';
    const surface = isDark ? '#1e293b' : '#f8fafc';
    const border = isDark ? '#334155' : '#e2e8f0';
    const text = isDark ? '#f8fafc' : '#0f172a';
    const muted = isDark ? '#94a3b8' : '#64748b';

    return `<!-- Kenya Postal Code Checker Widget (Paste into WordPress Custom HTML or any HTML page) -->
<div id="kpc-widget" class="kpc-wrap">
  <div class="kpc-head">
    <h3 class="kpc-title">Kenya Postal Code Checker</h3>
    <p class="kpc-sub">Search any town, post office, or 5-digit code</p>
  </div>
  <div class="kpc-form">
    <input id="kpc-input" class="kpc-input" type="text" placeholder="e.g. Nairobi GPO, 00100, Nakuru..." autocomplete="off" />
    <button id="kpc-clear" class="kpc-clear" type="button" style="display:none">Clear</button>
  </div>
  <div id="kpc-results" class="kpc-results">
    <p class="kpc-empty">Type a town or postal code to look it up.</p>
  </div>
</div>
<style>
  .kpc-wrap{font-family:system-ui,-apple-system,sans-serif;max-width:560px;background:${bg};color:${text};border:1px solid ${border};border-radius:14px;padding:20px;box-sizing:border-box}
  .kpc-head{margin-bottom:14px}
  .kpc-title{margin:0 0 4px;font-size:18px;font-weight:700;color:${text}}
  .kpc-sub{margin:0;font-size:13px;color:${muted}}
  .kpc-form{display:flex;gap:8px;margin-bottom:12px}
  .kpc-input{flex:1;padding:10px 14px;font-size:14px;border:1px solid ${border};border-radius:10px;background:${surface};color:${text};outline:none}
  .kpc-input:focus{border-color:#f38020}
  .kpc-clear{padding:0 14px;font-size:13px;font-weight:600;border:1px solid ${border};border-radius:10px;background:${surface};color:${text};cursor:pointer}
  .kpc-results{display:flex;flex-direction:column;gap:8px}
  .kpc-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:${surface};border:1px solid ${border};border-radius:10px}
  .kpc-loc{font-size:14px;font-weight:700;color:${text}}
  .kpc-reg{font-size:12px;color:${muted};margin-top:2px}
  .kpc-right{display:flex;align-items:center;gap:10px}
  .kpc-code{font-family:ui-monospace,monospace;font-size:17px;font-weight:800;color:#f38020}
  .kpc-copy{padding:6px 10px;font-size:12px;font-weight:600;border:1px solid ${border};border-radius:8px;background:${bg};color:${text};cursor:pointer}
  .kpc-empty{margin:0;padding:14px;text-align:center;font-size:13px;color:${muted}}
</style>
<script>
(function(){
  var API = "${cleanBaseUrl}/api/lookup";
  var input = document.getElementById("kpc-input");
  var clearBtn = document.getElementById("kpc-clear");
  var box = document.getElementById("kpc-results");
  var timer = null;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
  function render(rows, q){
    if(!q){box.innerHTML='<p class="kpc-empty">Type a town or postal code to look it up.</p>';return;}
    if(!rows.length){box.innerHTML='<p class="kpc-empty">No postal code found for "'+esc(q)+'".</p>';return;}
    box.innerHTML = rows.map(function(r){
      return '<div class="kpc-item"><div><div class="kpc-loc">'+esc(r.location)+'</div><div class="kpc-reg">'+esc(r.regionName)+'</div></div><div class="kpc-right"><span class="kpc-code">'+esc(r.code)+'</span><button type="button" class="kpc-copy" data-code="'+esc(r.code)+'">Copy</button></div></div>';
    }).join("");
  }
  async function runSearch(){
    var q = input.value.trim();
    clearBtn.style.display = q ? "inline-block" : "none";
    if(!q){render([],"");return;}
    box.innerHTML='<p class="kpc-empty">Searching...</p>';
    try{
      var res = await fetch(API + "?limit=6&q=" + encodeURIComponent(q));
      if(!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      render(data.results || [], q);
    }catch(e){
      box.innerHTML='<p class="kpc-empty">Could not reach postal API.</p>';
    }
  }
  input.addEventListener("input",function(){clearTimeout(timer);timer=setTimeout(runSearch,180);});
  clearBtn.addEventListener("click",function(){input.value="";runSearch();input.focus();});
  box.addEventListener("click",function(e){
    var btn = e.target.closest(".kpc-copy");
    if(!btn) return;
    var code = btn.getAttribute("data-code");
    if(navigator.clipboard){navigator.clipboard.writeText(code);}
    btn.textContent = "Copied";
    setTimeout(function(){btn.textContent="Copy";},1200);
  });
})();
</script>`;
  }, [cleanBaseUrl, widgetTheme]);

  const standaloneHtml = useMemo(() => {
    const pageBg = widgetTheme === 'dark' ? '#090d16' : '#f1f5f9';
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kenya Postal Code Checker</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:${pageBg};box-sizing:border-box}
  </style>
</head>
<body>
${wordpressSnippet}
</body>
</html>`;
  }, [widgetTheme, wordpressSnippet]);

  const activeCode = snippetMode === 'wordpress' ? wordpressSnippet : standaloneHtml;

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopiedHtml(true);
      window.setTimeout(() => setCopiedHtml(false), 1800);
    } catch {
      // Clipboard unavailable
    }
  }

  function handleDownloadHtml() {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kenya-postal-checker.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handlePreviewCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setPreviewCopiedCode(code);
      window.setTimeout(() => setPreviewCopiedCode(null), 1200);
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <section
      id="embed-widget"
      className="py-12 sm:py-16 border-t border-slate-200 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Zero-Dependency Embed · WordPress &amp; Static HTML Ready
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Pastable Postal Code Checker HTML
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md">
            Copy a self-contained HTML widget directly into a WordPress Custom HTML block, Elementor widget, or any static HTML site.
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
                    API Base URL (Auto-detected)
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
                  className="w-full h-11 sm:h-10 px-3 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-lg text-base sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-[#F38020] focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Automatically uses this installation’s live domain so pasted WordPress and HTML snippets work immediately.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Widget Theme
                  </span>
                  <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {(['light', 'dark'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setWidgetTheme(mode)}
                        className={`min-h-[36px] sm:min-h-0 px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
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

                <div>
                  <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Format
                  </span>
                  <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSnippetMode('wordpress')}
                      className={`min-h-[36px] sm:min-h-0 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        snippetMode === 'wordpress'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      WP / Block
                    </button>
                    <button
                      type="button"
                      onClick={() => setSnippetMode('standalone')}
                      className={`min-h-[36px] sm:min-h-0 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        snippetMode === 'standalone'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Full .html
                    </button>
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
                    Interactive preview of what your visitors see
                  </p>
                </div>
              </div>

              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={previewQuery}
                  onChange={(e) => setPreviewQuery(e.target.value)}
                  placeholder="Try Nairobi, 00100, Nakuru..."
                  aria-label="Preview widget search"
                  className={`w-full h-11 sm:h-10 pl-9 pr-10 rounded-lg text-base sm:text-sm border focus:border-[#F38020] focus:outline-none ${
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
                        <p
                          className={`text-xs truncate ${
                            widgetTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {row.regionName}
                        </p>
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
                          onClick={() => void handlePreviewCopy(row.code)}
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
            </div>
          </div>

          <div className="lg:col-span-7 min-w-0 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-[#090D16] text-slate-100">
            <div className="px-4 py-3 bg-[#111827] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 min-w-0">
                <Code2 className="w-4 h-4 text-[#FB923C] shrink-0" />
                <span className="truncate">
                  {snippetMode === 'wordpress'
                    ? 'wordpress-custom-html-block.html'
                    : 'kenya-postal-checker.html'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .html
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopyCode()}
                  className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-[#F38020] hover:bg-[#D96B0F] text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHtml ? 'Copied HTML' : 'Copy HTML'}
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[380px] sm:max-h-[420px] overflow-auto">
              <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre">
                <code>{activeCode}</code>
              </pre>
            </div>

            <div className="px-4 py-3 bg-[#111827] border-t border-slate-800 text-xs text-slate-400">
              In WordPress: edit any page or post, add a <strong className="text-slate-200">Custom HTML</strong> block, paste the snippet above, and click Publish.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
