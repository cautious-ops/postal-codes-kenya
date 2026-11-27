import { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar.tsx';
import { LookupWorkspace } from './components/LookupWorkspace.tsx';
import { ApiPlayground } from './components/ApiPlayground.tsx';
import { EmbedWidgetGenerator } from './components/EmbedWidgetGenerator.tsx';
import { MigrationGuide } from './components/MigrationGuide.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { AdSlot } from './components/AdSlot.tsx';
import { LegalPages, type LegalPageMode } from './components/LegalPages.tsx';
import { findEntryBySlugOrCode, type PostalEntry } from '../shared/postalService.ts';

type ThemeMode = 'light' | 'dark';

type AppRoute =
  | { kind: 'home' }
  | { kind: 'postal'; slug: string }
  | { kind: 'legal'; page: LegalPageMode };

function getInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
}

function getRouteFromPathname(): AppRoute {
  if (typeof window === 'undefined') return { kind: 'home' };
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/privacy' || path === '/privacy-policy') {
    return { kind: 'legal', page: 'privacy' };
  }
  if (path === '/terms' || path === '/terms-of-use') {
    return { kind: 'legal', page: 'terms' };
  }
  const match = path.match(/^\/postal-code\/([^/]+)$/);
  if (match) {
    return { kind: 'postal', slug: decodeURIComponent(match[1]) };
  }
  return { kind: 'home' };
}

export default function App() {
  const [apiSelectedCode, setApiSelectedCode] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [route, setRoute] = useState<AppRoute>(getRouteFromPathname);

  const activeSlug = route.kind === 'postal' ? route.slug : null;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('kpd-theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    function handlePopState() {
      setRoute(getRouteFromPathname());
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const origin = window.location.origin;
    const absoluteLogoUrl = `${origin}/assets/aistudio/be00bca6-2afe-493f-8f84-c956f0d49533_16fefaa7.png`;

    let title = 'Kenya Postal Codes Finder (All 647 Codes) – Tool & API';
    let description =
      'Find any Kenyan postal code fast—Nairobi 00100, Mombasa, Kisumu, Nakuru & all 647 offices. Faster than static lists, with one-click copy and free API.';
    let canonicalUrl = `${origin}/`;

    if (route.kind === 'legal') {
      if (route.page === 'privacy') {
        title = 'Privacy Policy – Kenya Postal Directory';
        description =
          'Privacy Policy explaining how Kenya Postal Directory handles lookup queries, API access, local preferences, and Google AdSense cookies.';
        canonicalUrl = `${origin}/privacy`;
      } else {
        title = 'Terms of Use – Kenya Postal Directory';
        description =
          'Terms of Use governing access to the Kenya Postal Directory lookup tool, free JSON/CSV REST API, and embeddable WordPress widget.';
        canonicalUrl = `${origin}/terms`;
      }
    } else if (route.kind === 'postal') {
      const entry = findEntryBySlugOrCode(route.slug);
      if (entry) {
        title = `${entry.location} Postal Code (${entry.code}) – Kenya Posta Directory`;
        description = `Official Kenya postal code for ${entry.location} (${entry.regionName}) is ${entry.code}. Instant lookup, nearby post offices, and free JSON/CSV API.`;
        canonicalUrl = `${origin}/postal-code/${entry.slug}`;
      }
    }

    document.title = title;

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      meta.setAttribute('content', canonicalUrl);
      document.head.appendChild(meta);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', absoluteLogoUrl);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', absoluteLogoUrl);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [route]);

  function pushPath(nextPath: string, nextRoute: AppRoute) {
    setRoute(nextRoute);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  }

  function handleSelectSlug(slug: string | null) {
    if (slug) {
      pushPath(`/postal-code/${slug}`, { kind: 'postal', slug });
    } else {
      pushPath('/', { kind: 'home' });
    }
  }

  function handleNavigateLegal(page: LegalPageMode) {
    pushPath(`/${page}`, { kind: 'legal', page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToApi() {
    if (route.kind === 'legal') {
      pushPath('/', { kind: 'home' });
      window.setTimeout(() => {
        document.getElementById('api-explorer')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    document.getElementById('api-explorer')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSelectForApi(entry: PostalEntry) {
    setApiSelectedCode(entry.code);
    scrollToApi();
  }

  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-50 transition-colors"
    >
      <TopBar
        onTryApiClick={scrollToApi}
        onNavigateHome={() => {
          pushPath('/', { kind: 'home' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {route.kind === 'legal' ? (
          <LegalPages
            mode={route.page}
            onBackHome={() => {
              pushPath('/', { kind: 'home' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSwitchMode={handleNavigateLegal}
          />
        ) : (
          <>
            <LookupWorkspace
              theme={theme}
              onThemeChange={setTheme}
              activeSlug={activeSlug}
              onSelectSlug={handleSelectSlug}
              onSelectForApi={handleSelectForApi}
            />
            <AdSlot placement="lookup-api-break" variant="leaderboard" />
            <ApiPlayground externalCodeQuery={apiSelectedCode} />
            <EmbedWidgetGenerator />
            <AdSlot placement="embed-directory-break" variant="compact" />
            <MigrationGuide onSelectSlug={handleSelectSlug} />
            <AdSlot placement="footer-multiplex" variant="multiplex" />
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#090D16] pt-8 pb-24 md:pb-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/be00bca6-2afe-493f-8f84-c956f0d49533_16fefaa7.png"
              alt="Kenya Postal Codes logo"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Kenya Postal Directory
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Open Lookup &amp; Free REST API
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="/postal-codes.csv"
              download
              className="py-2 sm:py-0 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Raw CSV Dataset
            </a>
            <a
              href="/api/lookup?limit=all"
              target="_blank"
              rel="noreferrer"
              className="py-2 sm:py-0 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Full JSON Feed
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="py-2 sm:py-0 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              XML Sitemap
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateLegal('privacy');
              }}
              className="py-2 sm:py-0 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateLegal('terms');
              }}
              className="py-2 sm:py-0 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Terms of Use
            </a>
          </div>
        </div>
      </footer>

      {route.kind !== 'legal' && <MobileBottomNav />}
    </div>
  );
}
