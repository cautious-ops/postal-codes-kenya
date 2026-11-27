interface AdSlotProps {
  placement: 'directory-in-feed' | 'detail-banner' | 'lookup-api-break' | 'embed-directory-break' | 'footer-multiplex';
  variant?: 'in-feed' | 'leaderboard' | 'compact' | 'multiplex';
  className?: string;
}

export function AdSlot({ placement, variant = 'leaderboard', className = '' }: AdSlotProps) {
  if (variant === 'in-feed') {
    return (
      <aside
        aria-label="Advertisement"
        data-adsense-zone={placement}
        data-adsense-format="fluid"
        className={`col-span-full my-1 p-4 rounded-xl bg-slate-50/70 dark:bg-[#0B0F17] border border-dashed border-slate-200 dark:border-slate-800/90 flex flex-col items-center justify-center min-h-[96px] sm:min-h-[108px] text-center ${className}`}
      >
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
          Advertisement
        </span>
      </aside>
    );
  }

  if (variant === 'multiplex') {
    return (
      <aside
        aria-label="Advertisement"
        data-adsense-zone={placement}
        data-adsense-format="autorelaxed"
        className={`max-w-6xl mx-auto px-4 sm:px-6 py-6 ${className}`}
      >
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide mb-3 text-center">
            Advertisement
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((slotIndex) => (
              <div
                key={slotIndex}
                data-adsense-cell={slotIndex}
                className="min-h-[84px] rounded-xl bg-slate-50/80 dark:bg-[#0B0F17] border border-slate-200/70 dark:border-slate-800/70"
              />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (variant === 'compact') {
    return (
      <aside
        aria-label="Advertisement"
        data-adsense-zone={placement}
        data-adsense-format="horizontal"
        className={`max-w-6xl mx-auto px-4 sm:px-6 py-5 ${className}`}
      >
        <div className="w-full min-h-[76px] sm:min-h-[90px] px-4 py-3 rounded-xl bg-white dark:bg-[#111827] border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
            Advertisement
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Advertisement"
      data-adsense-zone={placement}
      data-adsense-format="auto"
      className={`max-w-6xl mx-auto px-4 sm:px-6 py-5 ${className}`}
    >
      <div className="w-full min-h-[96px] sm:min-h-[112px] px-4 py-4 rounded-2xl bg-white dark:bg-[#111827] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
          Advertisement
        </span>
      </div>
    </aside>
  );
}
