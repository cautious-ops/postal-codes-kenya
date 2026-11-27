import { useEffect, useMemo, useRef, useState } from 'react';
import {
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
  getRegionsSummary,
  queryPostalCodes,
  type PostalEntry,
} from '../../shared/postalService.ts';

type ViewMode = 'cards' | 'table';
type ThemeMode = 'light' | 'dark';

interface LookupWorkspaceProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onSelectForApi?: (entry: PostalEntry) => void;
}

const QUICK_SEARCH_TERMS = ['Nairobi GPO', '00100', 'Nakuru', 'Eldoret GPO', 'Nyali', 'Kisumu'];

export function LookupWorkspace({
  theme,
  onThemeChange,
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
    inputRef.current?.focus();
  }

  return (
    <section id="lookup" className="pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Kenya Posta Directory · <span className="tabular-nums">{POSTAL_ENTRIES.length}</span> Official Offices · Free Open API
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-8">
          <div className="lg:col-span-8">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 text-balance leading-[1.1] mb-3.5">
              Find any Kenyan postal code in milliseconds.
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Search by town, institution, estate, or 5-digit code. Filter across Kenya’s 10 postal regions, copy codes cleanly, or query the free public JSON and CSV API.
            </p>
          </div>

          <div className="lg:col-span-4 grid grid-cols-3 gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Offices</p>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                {POSTAL_ENTRIES.length}
              </p>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Regions</p>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                10
              </p>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Formats</p>
              <p className="mt-1 font-mono text-sm font-bold text-[#EA580C] dark:text-[#FB923C] leading-7">
                JSON/CSV
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs transition-colors">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowSuggestions(false);
            }}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            <div ref={searchContainerRef} className="relative flex-1">
              <Search
                aria-hidden="true"
                className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
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
                placeholder="Search location, region, or 5-digit code (e.g. Nairobi GPO, 00100)"
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                          className={`w-full px-4 py-2.5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer ${
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
                className="h-12 px-5 bg-[#F38020] hover:bg-[#D96B0F] text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F38020]"
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

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Quick try:</span>
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
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {term}
              </button>
            ))}
          </div>

          <div id="regions" className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by postal region">
              <button
                type="button"
                role="tab"
                aria-selected={selectedRegion === 'all'}
                onClick={() => {
                  setSelectedRegion('all');
                  setDisplayLimit(36);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
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
                className="px-4 py-2 text-sm font-medium text-white bg-[#F38020] hover:bg-[#D96B0F] rounded-lg transition-colors cursor-pointer"
              >
                Show All {POSTAL_ENTRIES.length} Offices
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleEntries.map((entry) => {
                const key = `${entry.location}:${entry.code}`;
                const isCopied = copiedCode === key;
                return (
                  <div
                    key={key}
                    className="group p-4 bg-slate-50/70 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-[#151D2E] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl transition-colors flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                          {entry.location}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {entry.regionName} · Prefix {entry.prefix}xxx
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectForApi?.(entry)}
                        title="Test this code in the API Explorer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#EA580C] dark:hover:text-[#FB923C] transition-colors shrink-0 cursor-pointer"
                      >
                        API
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectForApi?.(entry)}
                        className="font-mono text-2xl font-bold tracking-tight text-[#EA580C] dark:text-[#FB923C] hover:text-[#C2410C] dark:hover:text-[#FDBA74] transition-colors cursor-pointer text-left"
                        title="Test this code in the API Explorer"
                      >
                        {entry.code}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopySingle(entry)}
                        aria-label={`Copy postal code ${entry.code} for ${entry.location}`}
                        className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
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
                );
              })}
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0B0F17] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-2.5 px-4">Location / Post Office</th>
                    <th className="py-2.5 px-4">Region</th>
                    <th className="py-2.5 px-4 text-right">Postal Code</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
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
                          {entry.location}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                          {entry.regionName}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#EA580C] dark:text-[#FB923C]">
                          {entry.code}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopySingle(entry)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
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
          )}

          {searchResult.total > visibleEntries.length && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDisplayLimit((prev) => prev + 60)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Load More ({searchResult.total - visibleEntries.length} remaining)
              </button>
              <button
                type="button"
                onClick={() => setDisplayLimit(searchResult.total)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
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
