export type EmbedTheme = 'light' | 'dark';
export type EmbedLayout = 'card' | 'compact' | 'address';
export type EmbedFormat =
  | 'wordpress'
  | 'iframe'
  | 'script'
  | 'shortcode'
  | 'react'
  | 'standalone';

interface EmbedOptions {
  apiBaseUrl: string;
  theme: EmbedTheme;
  layout: EmbedLayout;
}

function getPalette(theme: EmbedTheme) {
  const isDark = theme === 'dark';
  return {
    bg: isDark ? '#0f172a' : '#ffffff',
    surface: isDark ? '#1e293b' : '#f8fafc',
    border: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    pageBg: isDark ? '#090d16' : '#f1f5f9',
  };
}

export function buildHtmlWidgetSnippet({
  apiBaseUrl,
  theme,
  layout,
}: EmbedOptions): string {
  const cleanBase = apiBaseUrl.replace(/\/+$/, '');
  const p = getPalette(theme);

  if (layout === 'address') {
    return `<!-- Kenya Letter Address Formatter Widget (WordPress Custom HTML / Any Page) -->
<div id="kpc-addr-widget" class="kpca-wrap">
  <div class="kpca-head">
    <h3 class="kpca-title">Kenya Letter Address Generator</h3>
    <p class="kpca-sub">Enter name, P.O. Box, and town to format a complete mailing address</p>
  </div>
  <div class="kpca-fields">
    <input id="kpca-name" class="kpca-input" type="text" placeholder="Recipient or Organization Name" autocomplete="name" />
    <input id="kpca-box" class="kpca-input" type="text" placeholder="P.O. Box 12345 (or Private Bag / Street)" autocomplete="off" />
    <input id="kpca-town" class="kpca-input" type="text" placeholder="Town or 5-digit code (e.g. Nairobi GPO, 00100)" value="Nairobi GPO" autocomplete="off" />
  </div>
  <pre id="kpca-out" class="kpca-out">Wanjiku Kamau\nP.O. Box 12345 – 00100\nNairobi GPO, Kenya</pre>
  <button id="kpca-copy" class="kpca-btn" type="button">Copy Formatted Address</button>
</div>
<style>
  .kpca-wrap{font-family:system-ui,-apple-system,sans-serif;width:100%;max-width:560px;background:${p.bg};color:${p.text};border:1px solid ${p.border};border-radius:14px;padding:20px;box-sizing:border-box}
  .kpca-head{margin-bottom:14px}
  .kpca-title{margin:0 0 4px;font-size:18px;font-weight:700;color:${p.text}}
  .kpca-sub{margin:0;font-size:13px;color:${p.muted}}
  .kpca-fields{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
  .kpca-input{width:100%;box-sizing:border-box;padding:10px 14px;font-size:16px;border:1px solid ${p.border};border-radius:10px;background:${p.surface};color:${p.text};outline:none}
  .kpca-input:focus{border-color:#f38020}
  .kpca-out{margin:0 0 12px;padding:14px;border-radius:10px;border:1px solid ${p.border};background:${p.surface};color:${p.text};font-family:ui-monospace,monospace;font-size:14px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
  .kpca-btn{width:100%;padding:11px 16px;font-size:14px;font-weight:700;border:none;border-radius:10px;background:#f38020;color:#ffffff;cursor:pointer}
</style>
<script>
(function(){
  var API = "${cleanBase}/api/lookup";
  var nameEl = document.getElementById("kpca-name");
  var boxEl = document.getElementById("kpca-box");
  var townEl = document.getElementById("kpca-town");
  var outEl = document.getElementById("kpca-out");
  var copyBtn = document.getElementById("kpca-copy");
  var office = { location: "Nairobi GPO", code: "00100" };
  var timer = null;
  function formatBox(v){
    var s = (v || "").trim();
    if(!s) return "P.O. Box 12345";
    if(/^\\d{1,6}$/.test(s)) return "P.O. Box " + s;
    if(/^(?:p\\.?\\s*o\\.?\\s*)?box\\s+/i.test(s)) return s.replace(/^(?:p\\.?\\s*o\\.?\\s*)?box\\s+/i, "P.O. Box ");
    return s;
  }
  function render(){
    var n = (nameEl.value || "").trim() || "Wanjiku Kamau";
    var b = formatBox(boxEl.value);
    var isBox = /^(P\\.O\\. Box|Private Bag)/i.test(b);
    outEl.textContent = isBox
      ? n + "\\n" + b + " \\u2013 " + office.code + "\\n" + office.location + ", Kenya"
      : n + "\\n" + b + "\\n" + office.code + " " + office.location + ", Kenya";
  }
  async function resolveTown(){
    var q = (townEl.value || "").trim();
    if(!q) return;
    try{
      var res = await fetch(API + "?limit=1&q=" + encodeURIComponent(q));
      if(!res.ok) return;
      var data = await res.json();
      if(data.results && data.results[0]){ office = data.results[0]; render(); }
    }catch(e){}
  }
  nameEl.addEventListener("input", render);
  boxEl.addEventListener("input", render);
  townEl.addEventListener("input", function(){ clearTimeout(timer); timer = setTimeout(resolveTown, 220); });
  copyBtn.addEventListener("click", function(){
    if(navigator.clipboard){ navigator.clipboard.writeText(outEl.textContent || ""); }
    copyBtn.textContent = "Copied Mailing Address";
    setTimeout(function(){ copyBtn.textContent = "Copy Formatted Address"; }, 1400);
  });
  render();
})();
</script>`;
  }

  if (layout === 'compact') {
    return `<!-- Kenya Postal Code Compact Search Bar (WordPress Header / Sidebar / Checkout) -->
<div id="kpc-compact" class="kpcc-wrap">
  <div class="kpcc-row">
    <input id="kpcc-input" class="kpcc-input" type="text" placeholder="Kenya postal code or town (e.g. 00100, Nyali)..." autocomplete="off" />
    <button id="kpcc-clear" class="kpcc-clear" type="button" style="display:none">Clear</button>
  </div>
  <div id="kpcc-results" class="kpcc-results" style="display:none"></div>
</div>
<style>
  .kpcc-wrap{font-family:system-ui,-apple-system,sans-serif;width:100%;max-width:480px;background:${p.bg};color:${p.text};border:1px solid ${p.border};border-radius:12px;padding:10px;box-sizing:border-box}
  .kpcc-row{display:flex;gap:8px;align-items:center}
  .kpcc-input{flex:1;min-width:0;padding:9px 12px;font-size:16px;border:1px solid ${p.border};border-radius:8px;background:${p.surface};color:${p.text};outline:none}
  .kpcc-input:focus{border-color:#f38020}
  .kpcc-clear{padding:9px 12px;font-size:13px;font-weight:600;border:1px solid ${p.border};border-radius:8px;background:${p.surface};color:${p.text};cursor:pointer}
  .kpcc-results{margin-top:8px;display:flex;flex-direction:column;gap:6px}
  .kpcc-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:8px;background:${p.surface};border:1px solid ${p.border}}
  .kpcc-loc{font-size:13px;font-weight:700;color:${p.text}}
  .kpcc-code{font-family:ui-monospace,monospace;font-size:15px;font-weight:800;color:#f38020}
  .kpcc-copy{padding:5px 9px;font-size:12px;font-weight:600;border:1px solid ${p.border};border-radius:6px;background:${p.bg};color:${p.text};cursor:pointer}
</style>
<script>
(function(){
  var API = "${cleanBase}/api/lookup";
  var input = document.getElementById("kpcc-input");
  var clearBtn = document.getElementById("kpcc-clear");
  var box = document.getElementById("kpcc-results");
  var timer = null;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
  async function run(){
    var q = input.value.trim();
    clearBtn.style.display = q ? "inline-block" : "none";
    if(!q){box.style.display="none";box.innerHTML="";return;}
    box.style.display="flex";
    try{
      var res = await fetch(API + "?limit=4&q=" + encodeURIComponent(q));
      var data = await res.json();
      var rows = data.results || [];
      box.innerHTML = rows.length
        ? rows.map(function(r){return '<div class="kpcc-item"><span class="kpcc-loc">'+esc(r.location)+'</span><span style="display:flex;align-items:center;gap:8px"><span class="kpcc-code">'+esc(r.code)+'</span><button type="button" class="kpcc-copy" data-code="'+esc(r.code)+'">Copy</button></span></div>';}).join("")
        : '<div class="kpcc-item"><span class="kpcc-loc">No matching Kenyan post office</span></div>';
    }catch(e){}
  }
  input.addEventListener("input",function(){clearTimeout(timer);timer=setTimeout(run,180);});
  clearBtn.addEventListener("click",function(){input.value="";run();input.focus();});
  box.addEventListener("click",function(e){
    var btn = e.target.closest(".kpcc-copy");
    if(!btn) return;
    if(navigator.clipboard){navigator.clipboard.writeText(btn.getAttribute("data-code"));}
    btn.textContent = "Copied";
    setTimeout(function(){btn.textContent="Copy";},1200);
  });
})();
</script>`;
  }

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
  .kpc-wrap{font-family:system-ui,-apple-system,sans-serif;width:100%;max-width:560px;background:${p.bg};color:${p.text};border:1px solid ${p.border};border-radius:14px;padding:20px;box-sizing:border-box}
  .kpc-head{margin-bottom:14px}
  .kpc-title{margin:0 0 4px;font-size:18px;font-weight:700;color:${p.text}}
  .kpc-sub{margin:0;font-size:13px;color:${p.muted}}
  .kpc-form{display:flex;gap:8px;margin-bottom:12px}
  .kpc-input{flex:1;min-width:0;padding:10px 14px;font-size:16px;border:1px solid ${p.border};border-radius:10px;background:${p.surface};color:${p.text};outline:none}
  .kpc-input:focus{border-color:#f38020}
  .kpc-clear{padding:0 14px;font-size:13px;font-weight:600;border:1px solid ${p.border};border-radius:10px;background:${p.surface};color:${p.text};cursor:pointer}
  .kpc-results{display:flex;flex-direction:column;gap:8px}
  .kpc-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:${p.surface};border:1px solid ${p.border};border-radius:10px}
  .kpc-loc{font-size:14px;font-weight:700;color:${p.text}}
  .kpc-reg{font-size:12px;color:${p.muted};margin-top:2px}
  .kpc-right{display:flex;align-items:center;gap:10px}
  .kpc-code{font-family:ui-monospace,monospace;font-size:17px;font-weight:800;color:#f38020}
  .kpc-copy{padding:6px 10px;font-size:12px;font-weight:600;border:1px solid ${p.border};border-radius:8px;background:${p.bg};color:${p.text};cursor:pointer}
  .kpc-empty{margin:0;padding:14px;text-align:center;font-size:13px;color:${p.muted}}
</style>
<script>
(function(){
  var API = "${cleanBase}/api/lookup";
  var input = document.getElementById("kpc-input");
  var clearBtn = document.getElementById("kpc-clear");
  var box = document.getElementById("kpc-results");
  var timer = null;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
  function render(rows, q){
    if(!q){box.innerHTML='<p class="kpc-empty">Type a town or postal code to look it up.</p>';return;}
    if(!rows.length){box.innerHTML='<p class="kpc-empty">No postal code found for "'+esc(q)+'".</p>';return;}
    box.innerHTML = rows.map(function(r){
      return '<div class="kpc-item"><div><div class="kpc-loc">'+esc(r.location)+'</div><div class="kpc-reg">'+esc(r.countyName)+' County</div></div><div class="kpc-right"><span class="kpc-code">'+esc(r.code)+'</span><button type="button" class="kpc-copy" data-code="'+esc(r.code)+'">Copy</button></div></div>';
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
}

export function buildStandaloneEmbedHtml(
  opts: EmbedOptions & { compactFrame?: boolean }
): string {
  const p = getPalette(opts.theme);
  const widgetHtml = buildHtmlWidgetSnippet(opts);
  const bodyStyle = opts.compactFrame
    ? `margin:0;padding:8px;background:transparent;box-sizing:border-box;display:flex;justify-content:center;`
    : `margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:${p.pageBg};box-sizing:border-box`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Kenya Postal Code Checker</title>
  <style>
    body{${bodyStyle}}
  </style>
</head>
<body>
${widgetHtml}
</body>
</html>`;
}

export function buildIframeSnippet({ apiBaseUrl, theme, layout }: EmbedOptions): string {
  const cleanBase = apiBaseUrl.replace(/\/+$/, '');
  const height = layout === 'compact' ? 220 : layout === 'address' ? 420 : 380;
  const src = `${cleanBase}/embed?theme=${theme}&layout=${layout}`;

  return `<!-- Responsive Iframe Embed (Works on WordPress, Wix, Squarespace, Webflow, Shopify) -->
<iframe
  src="${src}"
  title="Kenya Postal Code Lookup Widget"
  width="100%"
  height="${height}"
  style="max-width:560px;border:0;border-radius:14px;overflow:hidden;display:block;"
  loading="lazy"
></iframe>`;
}

export function buildScriptTagSnippet({
  apiBaseUrl,
  theme,
  layout,
}: EmbedOptions): string {
  const cleanBase = apiBaseUrl.replace(/\/+$/, '');
  return `<!-- Drop-in 2-Line JavaScript Embed -->
<div id="kenya-postal-embed"></div>
<script src="${cleanBase}/embed.js?theme=${theme}&layout=${layout}" async></script>`;
}

export function buildEmbedJsPayload({ apiBaseUrl, theme, layout }: EmbedOptions): string {
  const html = buildHtmlWidgetSnippet({ apiBaseUrl, theme, layout });
  // Strip outer HTML comments and separate markup/style/script for safe injection
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  const markup = html.replace(/<script>[\s\S]*?<\/script>/, '').trim();
  const inlineJs = scriptMatch ? scriptMatch[1].trim() : '';

  return `(function(){
  var target = document.getElementById("kenya-postal-embed") || (document.currentScript && document.currentScript.parentNode);
  if (!target) return;
  target.innerHTML = ${JSON.stringify(markup)};
  ${inlineJs}
})();`;
}

export function buildWordpressShortcodeSnippet({
  apiBaseUrl,
  theme,
  layout,
}: EmbedOptions): string {
  const cleanBase = apiBaseUrl.replace(/\/+$/, '');
  return `<?php
/**
 * Add to your theme's functions.php (or Code Snippets plugin).
 * Usage anywhere in posts/pages: [kenya_postal_lookup]
 */
function kenya_postal_lookup_shortcode($atts) {
  $atts = shortcode_atts(array(
    'theme' => '${theme}',
    'layout' => '${layout}',
  ), $atts, 'kenya_postal_lookup');

  $id = 'kpc-' . wp_generate_uuid4();
  $theme = esc_attr($atts['theme']);
  $layout = esc_attr($atts['layout']);
  $src = esc_url('${cleanBase}/embed?theme=' . $theme . '&layout=' . $layout);

  return '<iframe id="' . $id . '" src="' . $src . '" title="Kenya Postal Code Checker" width="100%" height="${
    layout === 'compact' ? '220' : layout === 'address' ? '420' : '380'
  }" style="max-width:560px;border:0;border-radius:14px;display:block;" loading="lazy"></iframe>';
}
add_shortcode('kenya_postal_lookup', 'kenya_postal_lookup_shortcode');`;
}

export function buildReactSnippet({ apiBaseUrl, theme, layout }: EmbedOptions): string {
  const cleanBase = apiBaseUrl.replace(/\/+$/, '');
  const isDark = theme === 'dark';

  if (layout === 'address') {
    return `import { useEffect, useState } from 'react';

export function KenyaAddressWidget() {
  const [name, setName] = useState('');
  const [box, setBox] = useState('');
  const [townQuery, setTownQuery] = useState('Nairobi GPO');
  const [office, setOffice] = useState({ location: 'Nairobi GPO', code: '00100' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const q = townQuery.trim();
    if (!q) return;
    const t = setTimeout(async () => {
      const res = await fetch(\`${cleanBase}/api/lookup?limit=1&q=\${encodeURIComponent(q)}\`);
      const data = await res.json();
      if (data.results?.[0]) setOffice(data.results[0]);
    }, 220);
    return () => clearTimeout(t);
  }, [townQuery]);

  const cleanBox = /^\\d{1,6}$/.test(box.trim()) ? \`P.O. Box \${box.trim()}\` : box.trim() || 'P.O. Box 12345';
  const formatted = \`\${name.trim() || 'Wanjiku Kamau'}\\n\${cleanBox} – \${office.code}\\n\${office.location}, Kenya\`;

  return (
    <div style={{ maxWidth: 520, padding: 20, borderRadius: 14, border: '1px solid ${isDark ? '#334155' : '#e2e8f0'}', background: '${isDark ? '#0f172a' : '#fff'}', color: '${isDark ? '#f8fafc' : '#0f172a'}' }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Recipient Name" style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 8 }} />
      <input value={box} onChange={(e) => setBox(e.target.value)} placeholder="P.O. Box 12345" style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 8 }} />
      <input value={townQuery} onChange={(e) => setTownQuery(e.target.value)} placeholder="Town or 5-digit code" style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 12 }} />
      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', marginBottom: 12 }}>{formatted}</pre>
      <button onClick={() => { navigator.clipboard.writeText(formatted); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? 'Copied' : 'Copy Address'}
      </button>
    </div>
  );
}`;
  }

  return `import { useEffect, useState } from 'react';

interface PostalItem {
  location: string;
  code: string;
  countyName: string;
}

export function KenyaPostalWidget() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostalItem[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(\`${cleanBase}/api/lookup?limit=6&q=\${encodeURIComponent(q)}\`);
      const data = await res.json();
      setResults(data.results || []);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ maxWidth: 520, padding: 20, borderRadius: 14, border: '1px solid ${isDark ? '#334155' : '#e2e8f0'}', background: '${isDark ? '#0f172a' : '#fff'}', color: '${isDark ? '#f8fafc' : '#0f172a'}' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Kenyan town or 5-digit code..."
        style={{ width: '100%', padding: '10px 12px', fontSize: 16, borderRadius: 10, border: '1px solid #cbd5e1' }}
      />
      <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
        {results.map((item) => (
          <div key={\`\${item.location}-\${item.code}\`} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderRadius: 8, background: '${isDark ? '#1e293b' : '#f8fafc'}' }}>
            <span>{item.location}</span>
            <strong style={{ color: '#f38020', fontFamily: 'monospace' }}>{item.code}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

export function buildEmbedSnippet(
  format: EmbedFormat,
  opts: EmbedOptions
): string {
  switch (format) {
    case 'iframe':
      return buildIframeSnippet(opts);
    case 'script':
      return buildScriptTagSnippet(opts);
    case 'shortcode':
      return buildWordpressShortcodeSnippet(opts);
    case 'react':
      return buildReactSnippet(opts);
    case 'standalone':
      return buildStandaloneEmbedHtml(opts);
    case 'wordpress':
    default:
      return buildHtmlWidgetSnippet(opts);
  }
}
