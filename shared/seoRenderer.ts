import {
  POSTAL_ENTRIES,
  findEntryBySlugOrCode,
  getRelatedEntries,
  type PostalEntry,
} from './postalService.ts';

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  return raw.split(',')[0]?.trim() || undefined;
}

export function resolveRequestBaseUrl(
  headers: Record<string, string | string[] | undefined>,
  fallbackProtocol = 'https'
): string {
  const host = firstHeaderValue(headers['x-forwarded-host']) ?? firstHeaderValue(headers.host);
  if (host) {
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host);
    const proto =
      firstHeaderValue(headers['x-forwarded-proto']) ?? (isLocal ? 'http' : fallbackProtocol);
    return `${proto}://${host}`.replace(/\/+$/, '');
  }

  const envUrl =
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return (envUrl ?? 'http://localhost:3000').replace(/\/+$/, '');
}

export function buildRobotsTxt(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `User-agent: *\nAllow: /\n\nSitemap: ${cleanBase}/sitemap.xml\n`;
}

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
    `  <url>\n    <loc>${escapeXml(cleanBase)}/privacy</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.4</priority>\n  </url>`,
    `  <url>\n    <loc>${escapeXml(cleanBase)}/terms</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.4</priority>\n  </url>`,
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
  <link rel="icon" type="image/png" href="/assets/aistudio/be00bca6-2afe-493f-8f84-c956f0d49533_16fefaa7.png" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(baseUrl)}/assets/aistudio/be00bca6-2afe-493f-8f84-c956f0d49533_16fefaa7.png" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <script type="application/ld+json">${jsonLd}</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4696915371021515" crossorigin="anonymous"></script>
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
    <p><strong>${escapeHtml(entry.location)}</strong> is a Kenyan post office in the <strong>${escapeHtml(entry.regionName)}</strong> region (code prefix ${escapeHtml(entry.prefix)}xxx). Use postal code <strong>${escapeHtml(entry.code)}</strong> for mail, shipping, courier deliveries, and address forms in ${escapeHtml(entry.location)}, Kenya.</p>
    <p><strong>Address format:</strong> P.O. Box [Number] – ${escapeHtml(entry.code)}, ${escapeHtml(entry.location)}, Kenya</p>
    <p>API lookup: <code>${escapeHtml(`${baseUrl}/api/postal-codes/${entry.code}`)}</code></p>
    <h2>Other Post Offices in ${escapeHtml(entry.regionName)}</h2>
    <ul>
      ${relatedLinks}
    </ul>`
        : `<h1>Postal Code Not Found</h1><p>Search all 647 Kenyan postal codes on the <a href="${escapeHtml(`${baseUrl}/`)}">homepage</a>.</p>`
    }
    <hr />
    <p><a href="${escapeHtml(`${baseUrl}/`)}">Home</a> · <a href="${escapeHtml(`${baseUrl}/privacy`)}">Privacy Policy</a> · <a href="${escapeHtml(`${baseUrl}/terms`)}">Terms of Use</a></p>
  </main>
</body>
</html>`;
}

export function buildLegalHtmlPage(
  page: 'privacy' | 'terms',
  baseUrl: string
): { status: number; html: string } {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const isPrivacy = page === 'privacy';
  const title = isPrivacy
    ? 'Privacy Policy – Kenya Postal Directory'
    : 'Terms of Use – Kenya Postal Directory';
  const description = isPrivacy
    ? 'Privacy Policy explaining how Kenya Postal Directory handles lookup queries, API access, local preferences, and Google AdSense cookies.'
    : 'Terms of Use governing access to the Kenya Postal Directory lookup tool, free JSON/CSV REST API, and embeddable WordPress widget.';
  const canonicalUrl = `${cleanBase}/${page}`;

  const bodyHtml = isPrivacy
    ? `<h1>Privacy Policy</h1>
    <p>Kenya Postal Directory (${escapeHtml(cleanBase)}) provides instant lookup for Kenya's 647 official postal codes without requiring user accounts or sign-in.</p>
    <h2>Information &amp; Lookup Queries</h2>
    <p>Searches entered into the lookup bar execute directly in your browser. Optional theme preferences (light or dark mode) are stored locally in your browser via localStorage. Public REST API requests are processed ephemerally without user profiling.</p>
    <h2>Google AdSense &amp; Advertising Cookies</h2>
    <p>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" rel="noreferrer">Google Ads Settings</a> or <a href="https://www.aboutads.info" rel="noreferrer">aboutads.info</a>.</p>
    <h2>Policy Updates</h2>
    <p>We may update this Privacy Policy periodically as the directory or applicable laws evolve.</p>`
    : `<h1>Terms of Use</h1>
    <p>By using Kenya Postal Directory (${escapeHtml(cleanBase)}), including the web lookup tool, public JSON/CSV API, and WordPress/HTML embed widget, you agree to these Terms of Use.</p>
    <h2>Informational Accuracy &amp; Non-Affiliation</h2>
    <p>Postal codes and office names (00100–90408) are provided on an "as-is" basis for addressing, shipping, and software integration convenience. This is an independent public directory and is not officially affiliated with the Postal Corporation of Kenya (Posta Kenya).</p>
    <h2>Free API &amp; Embed Acceptable Use</h2>
    <p>You may freely use the lookup tool, REST API endpoints, and generated HTML/WordPress snippets on personal, educational, and commercial websites provided you do not attempt denial-of-service attacks or abusive automated scraping.</p>
    <h2>Limitation of Liability</h2>
    <p>We are not liable for mail delays, misrouted deliveries, or service interruptions resulting from reliance on directory entries.</p>`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="icon" type="image/png" href="/assets/aistudio/be00bca6-2afe-493f-8f84-c956f0d49533_16fefaa7.png" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4696915371021515" crossorigin="anonymous"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; color: #0f172a; background: #f8fafc; line-height: 1.65; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 28px; }
    a { color: #ea580c; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <main class="card">
    <p><a href="${escapeHtml(`${cleanBase}/`)}">Kenya Postal Directory</a> / ${isPrivacy ? 'Privacy Policy' : 'Terms of Use'}</p>
    ${bodyHtml}
    <hr />
    <p><a href="${escapeHtml(`${cleanBase}/`)}">Back to Lookup Tool</a> · <a href="${escapeHtml(`${cleanBase}/privacy`)}">Privacy Policy</a> · <a href="${escapeHtml(`${cleanBase}/terms`)}">Terms of Use</a></p>
  </main>
</body>
</html>`;

  return { status: 200, html };
}
