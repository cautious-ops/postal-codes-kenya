import { BookOpen, Code2, Search, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

type MobileTab = 'lookup' | 'api' | 'embed' | 'directory';

const SECTION_TAB_MAP: Array<{ id: string; tab: MobileTab }> = [
  { id: 'lookup', tab: 'lookup' },
  { id: 'api-explorer', tab: 'api' },
  { id: 'embed-widget', tab: 'embed' },
  { id: 'migration', tab: 'directory' },
];

export function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState<MobileTab>('lookup');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const match = SECTION_TAB_MAP.find((item) => item.id === entry.target.id);
            if (match) {
              setActiveTab(match.tab);
            }
          }
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    for (const item of SECTION_TAB_MAP) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  function navigate(tab: MobileTab, targetId: string) {
    setActiveTab(tab);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4 h-14">
        <button
          type="button"
          onClick={() => navigate('lookup', 'lookup')}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'lookup'
              ? 'text-[#EA580C] dark:text-[#FB923C]'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[11px] font-semibold tracking-tight leading-none">Lookup</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('api', 'api-explorer')}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'api'
              ? 'text-[#EA580C] dark:text-[#FB923C]'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Terminal className="w-5 h-5" />
          <span className="text-[11px] font-semibold tracking-tight leading-none">Free API</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('embed', 'embed-widget')}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'embed'
              ? 'text-[#EA580C] dark:text-[#FB923C]'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Code2 className="w-5 h-5" />
          <span className="text-[11px] font-semibold tracking-tight leading-none">WP / HTML</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('directory', 'migration')}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'directory'
              ? 'text-[#EA580C] dark:text-[#FB923C]'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] font-semibold tracking-tight leading-none">Regions</span>
        </button>
      </div>
    </nav>
  );
}
