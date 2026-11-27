interface TopBarProps {
  onTryApiClick: () => void;
  onNavigateHome?: () => void;
}

export function TopBar({ onTryApiClick, onNavigateHome }: TopBarProps) {
  return (
    <header className="md:sticky md:top-0 z-30 bg-[#F8FAFC]/95 dark:bg-[#090D16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
        <a
          href="/"
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
          className="inline-flex items-center gap-2.5 font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F38020] rounded-sm"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <img
            src="/assets/aistudio/be00bca6-2afe-493f-8f84-c956f0d49533_16fefaa7.png"
            alt="Kenya Postal Codes logo"
            referrerPolicy="no-referrer"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg object-contain bg-white p-0.5 border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <span className="truncate">Kenya Postal Directory</span>
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
            href="#api-explorer"
            className="hover:text-slate-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Free API
          </a>
          <a
            href="#embed-widget"
            className="hover:text-slate-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            WP / HTML
          </a>
          <a
            href="#migration"
            className="hover:text-slate-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Directory
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTryApiClick}
            className="min-h-[40px] sm:min-h-0 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#F38020] hover:bg-[#D96B0F] active:translate-y-px rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F38020]"
          >
            Explore API
          </button>
        </div>
      </div>
    </header>
  );
}
