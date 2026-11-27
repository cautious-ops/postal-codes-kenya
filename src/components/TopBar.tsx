interface TopBarProps {
  onTryApiClick: () => void;
}

export function TopBar({ onTryApiClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/90 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F38020] rounded-sm"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Kenya Postal Directory
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href="#lookup"
            className="hover:text-slate-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Lookup
          </a>
          <a
            href="#regions"
            className="hover:text-slate-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Regions
          </a>
          <a
            href="#api-explorer"
            className="hover:text-slate-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Free API
          </a>
          <a
            href="#migration"
            className="hover:text-slate-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Deploy Guide
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTryApiClick}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#F38020] hover:bg-[#D96B0F] active:translate-y-px rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F38020]"
          >
            Explore API
          </button>
        </div>
      </div>
    </header>
  );
}
