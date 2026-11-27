import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  LayoutGrid,
  List,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import {
  KENYA_REGIONS,
  POSTAL_ENTRIES,
  entriesToCsv,
  findEntryBySlugOrCode,
  getRegionsSummary,
  getRelatedEntries,
  queryPostalCodes,
  type PostalEntry,
} from '../../shared/postalService.ts';
import { AdSlot } from './AdSlot.tsx';

type ViewMode = 'cards' | 'table';
type ThemeMode = 'light' | 'dark';

interface LookupWorkspaceProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  activeSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  onSelectForApi?: (entry: PostalEntry) => void;
}

const QUICK_SEARCH_TERMS = ['Nairobi GPO', '00100', 'Nakuru', 'Eldoret GPO', 'Nyali', 'Westlands'];

export function LookupWorkspace({
  theme,
  onThemeChange,
  activeSlug,
  onSelectSlug,
  onSelectForApi,
}: LookupWorkspaceProps) {
  const [query, setQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(36);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const regionSummaries = useMemo(() => getRegionsSummary(), []);

  const activeEntry = useMemo(
    () => (activeSlug ? findEntryBySlugOrCode(activeSlug) ?? null : null),
    [activeSlug]
  );

  const relatedEntries = useMemo(
    () => (activeEntry ? getRelatedEntries(activeEntry, 6) : []),
    [activeEntry]
  );

  const searchResult = useMemo(() => {
    return queryPostalCodes({
      q: query,
      region: selectedRegion,
      limit: POSTAL_ENTRIES.length,
      offset: 0,
    });
  }, [query, selectedRegion]);

  const visibleEntries = useMemo(() => {
    return searchResult.results.slice(0, displayLimit);
  }, [searchResult.results, displayLimit]);

  const suggestions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return queryPostalCodes({ q: trimmed, limit: 8, offset: 0 }).results;
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  async function handleCopySingle(entry: PostalEntry) {
    try {
      await navigator.clipboard.writeText(entry.code);
      setCopiedCode(`${entry.location}:${entry.code}`);
      window.setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      // Clipboard unavailable
    }
  }

  async function handleCopyAll() {
    if (searchResult.results.length === 0) return;
    const text = searchResult.results
      .map((entry) => `${entry.location} : ${entry.code}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // Clipboard unavailable
    }
  }

  function handleDownloadCsv() {
    const csvContent = entriesToCsv(searchResult.results);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const suffix = selectedRegion === 'all' ? 'all' : `region-${selectedRegion}`;
    link.download = `kenya-postal-codes-${suffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleSuggestionPick(entry: PostalEntry) {
    setQuery(entry.location);
    setSelectedRegion('all');
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    onSelectSlug(entry.slug);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeSuggestionIdx >= 0) {
      e.preventDefault();
      handleSuggestionPick(suggestions[activeSuggestionIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIdx(-1);
    }
  }

  function handleClear() {
    setQuery('');
    setSelectedRegion('all');
    setDisplayLimit(36);
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    if (activeSlug) onSelectSlug(null);
    inputRef.current?.focus();
  }

  const searchBarCard = (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs transition-colors">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowSuggestions(false);
        }}
        className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center"
      >
        <div ref={searchContainerRef} className="relative flex-1">
          <Search
            aria-hidden="true"
            className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDisplayLimit(36);
              setShowSuggestions(true);
              setActiveSuggestionIdx(-1);
            }}
            onFocus={() => {
              if (query.trim().length > 0) setShowSuggestions(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search town, region, or code (e.g. 00100)"
            aria-label="Search Kenyan location or postal code"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && suggestions.length > 0}
            className="w-full h-12 pl-11 pr-10 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700/80 rounded-xl text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#090D16] focus:border-[#F38020] focus:outline-none focus:ring-2 focus:ring-[#F38020]/25 transition-colors"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search query"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
            >
              {suggestions.map((item, idx) => {
                const isActive = idx === activeSuggestionIdx;
                return (
                  <li key={`${item.location}-${item.code}`} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionPick(item)}
                      className={`w-full min-h-[44px] px-4 py-2.5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-orange-50 dark:bg-orange-500/15'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.location}{' '}
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          · {item.regionName}
                        </span>
                      </span>
                      <span className="font-mono font-semibold text-sm text-[#EA580C] dark:text-[#FB923C] shrink-0">
                        {item.code}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            className="flex-1 sm:flex-initial h-12 px-5 bg-[#F38020] hover:bg-[#D96B0F] text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F38020]"
          >
            Search Codes
          </button>
          {(query || selectedRegion !== 'all') && (
            <button
              type="button"
              onClick={handleClear}
              className="h-12 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      <div className="mt-2.5 flex flex-nowrap overflow-x-auto sm:flex-wrap items-center gap-2 text-xs no-scrollbar pb-0.5">
        <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Quick try:</span>
        {QUICK_SEARCH_TERMS.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => {
              setQuery(term);
              setSelectedRegion('all');
              setDisplayLimit(36);
              setShowSuggestions(false);
            }}
            className="min-h-[38px] sm:min-h-0 px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section id="lookup" className="pt-4 pb-12 sm:pt-5 sm:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 sm:mb-4">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Kenya Posta Directory · <span className="tabular-nums">{POSTAL_ENTRIES.length}</span> Offices · Free API
          </p>

          <div
            role="group"
            aria-label="Color theme"
            className="inline-flex items-center p-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            <button
              type="button"
              onClick={() => onThemeChange('light')}
              aria-pressed={theme === 'light'}
              className={`inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light
            </button>
            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              aria-pressed={theme === 'dark'}
              className={`inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#F38020] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark
            </button>
          </div>
        </div>

        {activeEntry ? (
          <>
            <div
              id="postal-detail"
              className="scroll-mt-4 md:scroll-mt-20 mb-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => onSelectSlug(null)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All {POSTAL_ENTRIES.length} Kenya Postal Codes
                </button>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {activeEntry.regionName} · Prefix {activeEntry.prefix}xxx
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
                    {activeEntry.location} Postal Code
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                    The official Kenyan postal code for <strong className="text-slate-900 dark:text-white">{activeEntry.location}</strong> in the {activeEntry.regionName} zone is{' '}
                    <strong className="font-mono text-[#EA580C] dark:text-[#FB923C]">{activeEntry.code}</strong>. Use this 5-digit code for courier deliveries, shipping forms, and mail addressing in Kenya.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="px-5 py-3 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Postal Code</span>
                    <span className="font-mono text-3xl font-extrabold text-[#EA580C] dark:text-[#FB923C]">
                      {activeEntry.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySingle(activeEntry)}
                    className="h-12 px-4 rounded-xl bg-[#F38020] hover:bg-[#D96B0F] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copiedCode === `${activeEntry.location}:${activeEntry.code}` ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectForApi?.(activeEntry)}
                    className="h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Test in API
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {relatedEntries.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Nearby in {activeEntry.regionName}:
                  </span>
                  {relatedEntries.map((rel) => (
                    <a
                      key={rel.slug}
                      href={`/postal-code/${rel.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectSlug(rel.slug);
                      }}
                      className="min-h-[38px] sm:min-h-0 px-2.5 py-1.5 sm:py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors whitespace-nowrap inline-flex items-center"
                    >
                      {rel.location} ({rel.code})
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4 sm:mb-5">
              <AdSlot placement="detail-banner" variant="compact" className="!px-0 !py-0 mb-4 sm:mb-5" />
              {searchBarCard}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch mb-4 sm:mb-5">
            <div className="lg:col-span-8 flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3.5 lg:block">
                <img
                  src="/assets/aistudio/be00bca6-2afe-493f-8f84-c956f0d49533_16fefaa7.png"
                  alt="Kenya Postal Codes logo"
                  referrerPolicy="no-referrer"
                  className="lg:hidden w-16 h-16 rounded-xl object-contain bg-white p-1 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 text-balance leading-[1.12] mb-1.5 sm:mb-2">
                    Find any Kenyan postal code in milliseconds.
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    Search by town, institution, or 5-digit code. Filter 10 regions, copy codes, or call the free JSON/CSV API.
                  </p>
                </div>
              </div>

              {searchBarCard}
            </div>

            <div className="hidden lg:flex lg:col-span-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex-col justify-between">
              <div className="flex-1 bg-white px-5 py-3 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                <img
                  src="/assets/aistudio/be00bca6-2afe-493f-8f84-c956f0d49533_16fefaa7.png"
                  alt="Kenya Postal Codes official directory logo"
                  referrerPolicy="no-referrer"
                  className="w-36 xl:w-40 h-auto object-contain"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-3.5">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Offices</p>
                  <p className="mt-0.5 font-mono text-base font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                    {POSTAL_ENTRIES.length}
                  </p>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Regions</p>
                  <p className="mt-0.5 font-mono text-base font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                    10
                  </p>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Formats</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-[#EA580C] dark:text-[#FB923C] leading-6">
                    JSON/CSV
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
          <div id="regions">
            <div
              className="flex flex-nowrap overflow-x-auto sm:flex-wrap items-center gap-2 sm:gap-1.5 no-scrollbar pb-1"
              role="tablist"
              aria-label="Filter by postal region"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedRegion === 'all'}
                onClick={() => {
                  setSelectedRegion('all');
                  setDisplayLimit(36);
                }}
                className={`min-h-[42px] sm:min-h-0 px-3.5 py-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedRegion === 'all'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800'
                }`}
              >
                All Regions ({POSTAL_ENTRIES.length})
              </button>
              {regionSummaries.map((region) => {
                const active = selectedRegion === region.id;
                return (
                  <button
                    key={region.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setSelectedRegion(region.id);
                      setDisplayLimit(60);
                    }}
                    className={`min-h-[42px] sm:min-h-0 px-3.5 py-2 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#F38020] text-white font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-mono opacity-80 mr-1">{region.id}xxxx</span>
                    {region.name} ({region.count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
              Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{visibleEntries.length}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{searchResult.total}</span> matching{' '}
              {searchResult.total === 1 ? 'office' : 'offices'}
              {selectedRegion !== 'all' && (
                <span>
                  {' '}
                  · {KENYA_REGIONS.find((r) => r.id === selectedRegion)?.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  aria-label="Card grid view"
                  className={`inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-0 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="Compact table view"
                  className={`inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-0 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Table
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyAll}
                disabled={searchResult.total === 0}
                className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedAll ? 'Copied All' : 'Copy All'}
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={searchResult.total === 0}
                className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
            </div>
          </div>

          {searchResult.total === 0 ? (
            <div className="mt-6 py-12 px-4 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#0B0F17]">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                No postal offices match "{query}"
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Try searching by office name (e.g. Nakuru, Eldoret GPO, Nyali, Coast) or a 5-digit code (e.g. 00100).
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-[#F38020] hover:bg-[#D96B0F] rounded-lg transition-colors cursor-pointer"
              >
                Show All {POSTAL_ENTRIES.length} Offices
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleEntries.map((entry, idx) => {
                const key = `${entry.location}:${entry.code}`;
                const isCopied = copiedCode === key;
                return (
                  <div key={key} className="contents">
                    {idx === 6 && <AdSlot placement="directory-in-feed" variant="in-feed" />}
                    <div
                      className="group p-4 bg-slate-50/70 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-[#151D2E] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl transition-colors flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <a
                            href={`/postal-code/${entry.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onSelectSlug(entry.slug);
                            }}
                            className="block text-base font-bold text-slate-900 dark:text-slate-100 hover:text-[#EA580C] dark:hover:text-[#FB923C] truncate transition-colors"
                          >
                            {entry.location}
                          </a>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {entry.regionName} · Prefix {entry.prefix}xxx
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectForApi?.(entry)}
                          title="Test this code in the API Explorer"
                          className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#EA580C] dark:hover:text-[#FB923C] transition-colors shrink-0 cursor-pointer"
                        >
                          API
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between gap-3 pt-1">
                        <a
                          href={`/postal-code/${entry.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectSlug(entry.slug);
                          }}
                          className="font-mono text-2xl font-bold tracking-tight text-[#EA580C] dark:text-[#FB923C] hover:text-[#C2410C] dark:hover:text-[#FDBA74] transition-colors cursor-pointer text-left"
                          title={`View details for ${entry.location} (${entry.code})`}
                        >
                          {entry.code}
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopySingle(entry)}
                          aria-label={`Copy postal code ${entry.code} for ${entry.location}`}
                          className={`min-h-[44px] sm:min-h-0 sm:h-8 px-4 sm:px-3 rounded-lg text-xs font-semibold border transition-colors shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#F38020] dark:hover:border-[#FB923C] hover:text-[#EA580C] dark:hover:text-[#FB923C]'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="mt-5 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full min-w-[520px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0B0F17] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-2.5 px-4">Location / Post Office</th>
                    <th className="py-2.5 px-4">Region</th>
                    <th className="py-2.5 px-4 text-right whitespace-nowrap">Postal Code</th>
                    <th className="py-2.5 px-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {visibleEntries.map((entry) => {
                    const key = `${entry.location}:${entry.code}`;
                    const isCopied = copiedCode === key;
                    return (
                      <tr
                        key={key}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          <a
                            href={`/postal-code/${entry.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onSelectSlug(entry.slug);
                            }}
                            className="hover:text-[#EA580C] dark:hover:text-[#FB923C] transition-colors"
                          >
                            {entry.location}
                          </a>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {entry.regionName}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#EA580C] dark:text-[#FB923C] whitespace-nowrap">
                          <a
                            href={`/postal-code/${entry.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onSelectSlug(entry.slug);
                            }}
                            className="hover:text-[#C2410C] dark:hover:text-[#FDBA74] hover:underline transition-colors"
                            title={`View details for ${entry.location} (${entry.code})`}
                          >
                            {entry.code}
                          </a>
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleCopySingle(entry)}
                            className={`inline-flex items-center justify-center gap-1 min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {isCopied ? 'Copied' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {visibleEntries.length > 6 && (
              <AdSlot placement="directory-in-feed" variant="compact" className="!px-0 !py-0 mt-5" />
            )}
          </>
          )}

          {searchResult.total > visibleEntries.length && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDisplayLimit((prev) => prev + 60)}
                className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Load More ({searchResult.total - visibleEntries.length} remaining)
              </button>
              <button
                type="button"
                onClick={() => setDisplayLimit(searchResult.total)}
                className="min-h-[44px] px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
              >
                Show All
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
