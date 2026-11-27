import {
  POSTAL_ENTRIES,
  findEntryBySlugOrCode,
  getRelatedEntries,
  type PostalEntry,
} from './postalService.ts';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildSitemapXml(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const urls: string[] = [
    `  <url>\n    <loc>${escapeXml(cleanBase)}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ];

  for (const entry of POSTAL_ENTRIES) {
    urls.push(
      `  <url>\n    <loc>${escapeXml(`${cleanBase}/postal-code/${entry.slug}`)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
}

export function buildSeoHtmlPage(slug: string, baseUrl: string): { status: number; html: string } {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const entry = findEntryBySlugOrCode(slug);

  if (!entry) {
    const fallbackTitle = 'Kenya Postal Code Finder – All 647 Official Codes';
    const fallbackDesc =
      'Search any Kenyan postal code by town, post office, or 5-digit code from 00100 to 90408.';
    return {
      status: 404,
      html: renderHtmlShell({
        title: fallbackTitle,
        description: fallbackDesc,
        canonicalUrl: `${cleanBase}/`,
        baseUrl: cleanBase,
        entry: null,
        related: [],
      }),
    };
  }

  const title = `${entry.location} Postal Code (${entry.code}) – Kenya Posta Directory`;
  const description = `The official Kenya postal code for ${entry.location} (${entry.regionName} region) is ${entry.code}. Instant lookup, nearby post offices, and free JSON/CSV API.`;

  return {
    status: 200,
    html: renderHtmlShell({
      title,
      description,
      canonicalUrl: `${cleanBase}/postal-code/${entry.slug}`,
      baseUrl: cleanBase,
      entry,
      related: getRelatedEntries(entry, 10),
    }),
  };
}

function renderHtmlShell(params: {
  title: string;
  description: string;
  canonicalUrl: string;
  baseUrl: string;
  entry: PostalEntry | null;
  related: PostalEntry[];
}): string {
  const { title, description, canonicalUrl, baseUrl, entry, related } = params;

  const jsonLd = entry
    ? JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Kenya Postal Codes', item: `${baseUrl}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: `${entry.location} (${entry.code})`,
              item: canonicalUrl,
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'PostalAddress',
          addressLocality: entry.location,
          addressRegion: entry.regionName,
          postalCode: entry.code,
          addressCountry: 'KE',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `What is the postal code for ${entry.location}, Kenya?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `The postal code for ${entry.location} in Kenya's ${entry.regionName} region is ${entry.code}.`,
              },
            },
            {
              '@type': 'Question',
              name: `Which postal region is ${entry.code} in?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Postal code ${entry.code} (${entry.location}) belongs to the ${entry.regionName} postal zone (prefix ${entry.prefix}xxx).`,
              },
            },
          ],
        },
      ])
    : '{}';

  const relatedLinks = related
    .map(
      (item) =>
        `<li><a href="${escapeHtml(`${baseUrl}/postal-code/${item.slug}`)}">${escapeHtml(item.location)} – ${escapeHtml(item.code)}</a></li>`
    )
    .join('\n          ');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <script type="application/ld+json">${jsonLd}</script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; color: #0f172a; background: #f8fafc; line-height: 1.6; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 28px; }
    .code { font-family: ui-monospace, monospace; font-size: 2.5rem; font-weight: 800; color: #ea580c; margin: 12px 0; }
    a { color: #ea580c; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <main class="card">
    <p><a href="${escapeHtml(`${baseUrl}/`)}">Kenya Postal Code Directory</a> / ${entry ? escapeHtml(entry.regionName) : 'Lookup'}</p>
    ${
      entry
        ? `<h1>${escapeHtml(entry.location)} Postal Code</h1>
    <div class="code">${escapeHtml(entry.code)}</div>
    <p><strong>${escapeHtml(entry.location)}</strong> is a Kenyan post office in the <strong>${escapeHtml(entry.regionName)}</strong> region (code prefix ${escapeHtml(entry.prefix)}xxx). Use postal code <strong>${escapeHtml(entry.code)}</strong> for mail, shipping, and address verification in ${escapeHtml(entry.location)}, Kenya.</p>
    <p>API lookup: <code>${escapeHtml(`${baseUrl}/api/postal-codes/${entry.code}`)}</code></p>
    <h2>Other Post Offices in ${escapeHtml(entry.regionName)}</h2>
    <ul>
      ${relatedLinks}
    </ul>`
        : `<h1>Postal Code Not Found</h1><p>Search all 647 Kenyan postal codes on the <a href="${escapeHtml(`${baseUrl}/`)}">homepage</a>.</p>`
    }
  </main>
</body>
</html>`;
}
