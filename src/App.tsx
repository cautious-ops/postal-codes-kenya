import { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar.tsx';
import { LookupWorkspace } from './components/LookupWorkspace.tsx';
import { ApiPlayground } from './components/ApiPlayground.tsx';
import { MigrationGuide } from './components/MigrationGuide.tsx';
import type { PostalEntry } from '../shared/postalService.ts';

type ThemeMode = 'light' | 'dark';

function getInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
}

export default function App() {
  const [apiSelectedCode, setApiSelectedCode] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

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

  function scrollToApi() {
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
      <TopBar onTryApiClick={scrollToApi} />

      <main className="flex-1">
        <LookupWorkspace
          theme={theme}
          onThemeChange={setTheme}
          onSelectForApi={handleSelectForApi}
        />
        <ApiPlayground externalCodeQuery={apiSelectedCode} />
        <MigrationGuide />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F] py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>Kenya Postal Code Directory · Open Lookup &amp; Free REST API</p>
          <div className="flex items-center gap-6">
            <a
              href="/postal-codes.csv"
              download
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Raw CSV Dataset
            </a>
            <a
              href="/api/postal-codes?limit=all"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Full JSON Feed
            </a>
            <a
              href="/api/regions"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Regions Endpoint
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
