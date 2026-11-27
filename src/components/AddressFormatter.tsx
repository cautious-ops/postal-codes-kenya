import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Mail, RotateCcw, Search } from 'lucide-react';
import {
  POSTAL_ENTRIES,
  findEntryBySlugOrCode,
  queryPostalCodes,
  type PostalEntry,
} from '../../shared/postalService.ts';

interface AddressFormatterProps {
  activeEntry: PostalEntry | null;
}

type FormatStyle = 'letter' | 'single-line';

const DEFAULT_OFFICE =
  findEntryBySlugOrCode('00100-nairobi-gpo') ?? POSTAL_ENTRIES[0];

function normalizePostalAddressInput(
  rawInput: string,
  fallbackEntry: PostalEntry
): {
  resolvedEntry: PostalEntry;
  boxOrStreetLine: string;
  isBoxFormat: boolean;
  detectedFromInput: boolean;
} {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      resolvedEntry: fallbackEntry,
      boxOrStreetLine: '',
      isBoxFormat: true,
      detectedFromInput: false,
    };
  }

  // Detect any 5-digit Kenyan postal code embedded in the user's postal address input
  const codeMatch = trimmed.match(/\b(\d{5})\b/);
  let resolvedEntry = fallbackEntry;
  let detectedFromInput = false;

  if (codeMatch) {
    const matched = findEntryBySlugOrCode(codeMatch[1]);
    if (matched) {
      resolvedEntry = matched;
      detectedFromInput = true;
    }
  }

  // Pure numeric box number e.g. "12345" or "420"
  if (/^\d{1,6}$/.test(trimmed)) {
    return {
      resolvedEntry,
      boxOrStreetLine: `P.O. Box ${trimmed}`,
      isBoxFormat: true,
      detectedFromInput,
    };
  }

  // Remove duplicate trailing postal code or office name if user pasted "P.O. Box 12345 - 00100 Nairobi"
  let cleaned = trimmed;
  if (detectedFromInput && codeMatch) {
    const codePattern = new RegExp(`(?:\\s*[-–,]\\s*|\\s+)${codeMatch[1]}(?:\\s*,?\\s*${resolvedEntry.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})?(?:\\s*,?\\s*Kenya)?\\s*$`, 'i');
    cleaned = cleaned.replace(codePattern, '').trim();
    if (!cleaned) {
      cleaned = trimmed;
    }
  }

  // Normalize P.O. Box variations ("po box 123", "p.o box 123", "box 123")
  const boxRegex = /^(?:p\.?\s*o\.?\s*)?box\s+([a-z0-9/-]+)/i;
  const boxMatch = cleaned.match(boxRegex);
  if (boxMatch) {
    const rest = cleaned.slice(boxMatch[0].length).trim();
    const boxPart = `P.O. Box ${boxMatch[1]}`;
    return {
      resolvedEntry,
      boxOrStreetLine: rest ? `${boxPart}, ${rest.replace(/^,\s*/, '')}` : boxPart,
      isBoxFormat: true,
      detectedFromInput,
    };
  }

  // Normalize Private Bag variations ("p/bag", "private bag", "p. bag")
  const privateBagRegex = /^(?:private\s*bag|p\s*\/?\s*bag|p\.\s*bag)\b/i;
  if (privateBagRegex.test(cleaned)) {
    const normalizedBag = cleaned.replace(privateBagRegex, 'Private Bag');
    return {
      resolvedEntry,
      boxOrStreetLine: normalizedBag,
      isBoxFormat: true,
      detectedFromInput,
    };
  }

  return {
    resolvedEntry,
    boxOrStreetLine: cleaned,
    isBoxFormat: false,
    detectedFromInput,
  };
}

export function AddressFormatter({ activeEntry }: AddressFormatterProps) {
  const [recipientName, setRecipientName] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<PostalEntry>(
    activeEntry ?? DEFAULT_OFFICE
  );
  const [officeQuery, setOfficeQuery] = useState('');
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);
  const [formatStyle, setFormatStyle] = useState<FormatStyle>('letter');
  const [includeCountry, setIncludeCountry] = useState(true);
  const [copied, setCopied] = useState(false);

  const officePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeEntry) {
      setSelectedOffice(activeEntry);
      setOfficeQuery('');
      setShowOfficeDropdown(false);
    }
  }, [activeEntry]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        officePickerRef.current &&
        !officePickerRef.current.contains(e.target as Node)
      ) {
        setShowOfficeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const officeMatches = useMemo(() => {
    const trimmed = officeQuery.trim();
    if (!trimmed) {
      return POSTAL_ENTRIES.slice(0, 8);
    }
    return queryPostalCodes({ q: trimmed, limit: 8, offset: 0 }).results;
  }, [officeQuery]);

  const parsed = useMemo(
    () => normalizePostalAddressInput(postalAddress, selectedOffice),
    [postalAddress, selectedOffice]
  );

  const hasUserInput =
    recipientName.trim().length > 0 || postalAddress.trim().length > 0;

  const effectiveName = recipientName.trim() || 'Wanjiku Kamau';
  const effectiveAddressLine = parsed.boxOrStreetLine || 'P.O. Box 12345';
  const effectiveIsBox = parsed.boxOrStreetLine ? parsed.isBoxFormat : true;
  const effectiveOffice = parsed.resolvedEntry;

  const formattedAddress = useMemo(() => {
    const townLine = includeCountry
      ? `${effectiveOffice.location}, Kenya`
      : effectiveOffice.location;

    if (effectiveIsBox) {
      const boxWithCode = `${effectiveAddressLine} – ${effectiveOffice.code}`;
      if (formatStyle === 'single-line') {
        return `${effectiveName}, ${boxWithCode}, ${townLine}`;
      }
      return `${effectiveName}\n${boxWithCode}\n${townLine}`;
    }

    const postalLine = includeCountry
      ? `${effectiveOffice.code} ${effectiveOffice.location}, Kenya`
      : `${effectiveOffice.code} ${effectiveOffice.location}`;

    if (formatStyle === 'single-line') {
      return `${effectiveName}, ${effectiveAddressLine}, ${postalLine}`;
    }
    return `${effectiveName}\n${effectiveAddressLine}\n${postalLine}`;
  }, [
    effectiveName,
    effectiveAddressLine,
    effectiveIsBox,
    effectiveOffice,
    formatStyle,
    includeCountry,
  ]);

  async function handleCopyFormatted() {
    try {
      await navigator.clipboard.writeText(formattedAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable
    }
  }

  function handleLoadSample() {
    setRecipientName('Wanjiku Kamau');
    setPostalAddress('P.O. Box 12345');
  }

  function handleReset() {
    setRecipientName('');
    setPostalAddress('');
    setOfficeQuery('');
    setSelectedOffice(activeEntry ?? DEFAULT_OFFICE);
  }

  return (
    <section
      id="letter-address"
      className="py-12 sm:py-16 border-t border-slate-200 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors scroll-mt-4 md:scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-6 sm:mb-8">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Preformatted Kenyan Mailing Address
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
            Letter &amp; Envelope Address Generator
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Enter a recipient name and P.O. Box or street address to generate a complete, Posta Kenya-ready mailing address with the correct 5-digit postal code.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Simple Inputs */}
            <div className="lg:col-span-6 p-5 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
              <div>
                <label
                  htmlFor="letter-recipient-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Recipient or Organization Name
                </label>
                <input
                  id="letter-recipient-name"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Wanjiku Kamau or Rift Valley Logistics Ltd"
                  className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#090D16] focus:border-[#F38020] focus:outline-none focus:ring-2 focus:ring-[#F38020]/25 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="letter-postal-address"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Postal Address (P.O. Box, Private Bag, or Street)
                </label>
                <input
                  id="letter-postal-address"
                  type="text"
                  value={postalAddress}
                  onChange={(e) => setPostalAddress(e.target.value)}
                  placeholder="e.g. P.O. Box 12345, 12345, or P.O. Box 420 - 80100"
                  className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#090D16] focus:border-[#F38020] focus:outline-none focus:ring-2 focus:ring-[#F38020]/25 transition-colors"
                />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {parsed.detectedFromInput ? (
                    <>
                      Auto-detected postal code{' '}
                      <span className="font-mono font-semibold text-[#EA580C] dark:text-[#FB923C]">
                        {parsed.resolvedEntry.code}
                      </span>{' '}
                      ({parsed.resolvedEntry.location}).
                    </>
                  ) : (
                    'Type just a box number like 12345 or include a 5-digit code to auto-match the town.'
                  )}
                </p>
              </div>

              <div ref={officePickerRef} className="relative">
                <label
                  htmlFor="letter-office-picker"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Post Office Town &amp; Code
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <input
                    id="letter-office-picker"
                    type="text"
                    value={
                      showOfficeDropdown
                        ? officeQuery
                        : `${effectiveOffice.location} (${effectiveOffice.code})`
                    }
                    onFocus={() => {
                      setShowOfficeDropdown(true);
                      setOfficeQuery('');
                    }}
                    onChange={(e) => {
                      setOfficeQuery(e.target.value);
                      setShowOfficeDropdown(true);
                    }}
                    placeholder="Search post office town or 5-digit code..."
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#090D16] focus:border-[#F38020] focus:outline-none focus:ring-2 focus:ring-[#F38020]/25 transition-colors"
                  />
                </div>

                {showOfficeDropdown && officeMatches.length > 0 && (
                  <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-56 overflow-y-auto bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    {officeMatches.map((item) => (
                      <li key={item.slug}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOffice(item);
                            setOfficeQuery('');
                            setShowOfficeDropdown(false);
                          }}
                          className="w-full min-h-[44px] px-3.5 py-2 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {item.location}{' '}
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                              · {item.regionName}
                            </span>
                          </span>
                          <span className="font-mono text-sm font-semibold text-[#EA580C] dark:text-[#FB923C] shrink-0">
                            {item.code}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                <div
                  role="group"
                  aria-label="Address format"
                  className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => setFormatStyle('letter')}
                    className={`min-h-[36px] sm:min-h-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      formatStyle === 'letter'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    Letter / Envelope
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormatStyle('single-line')}
                    className={`min-h-[36px] sm:min-h-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      formatStyle === 'single-line'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    Single Line
                  </button>
                </div>

                <label className="inline-flex items-center gap-2 min-h-[36px] text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeCountry}
                    onChange={(e) => setIncludeCountry(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-[#F38020] cursor-pointer"
                  />
                  Include &quot;Kenya&quot;
                </label>
              </div>
            </div>

            {/* Right Column: Live Preformatted Output */}
            <div className="lg:col-span-6 p-5 sm:p-6 bg-slate-50/60 dark:bg-[#0B0F17] flex flex-col justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Mail className="w-4 h-4 text-[#EA580C] dark:text-[#FB923C]" />
                    <span>
                      {hasUserInput ? 'Formatted Mailing Address' : 'Sample Preview'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {effectiveOffice.regionName} · Code {effectiveOffice.code}
                  </span>
                </div>

                <div
                  aria-live="polite"
                  className="p-5 sm:p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl min-h-[144px] flex items-center"
                >
                  <pre
                    className={`w-full whitespace-pre-wrap break-words font-mono text-sm sm:text-base leading-relaxed ${
                      hasUserInput
                        ? 'text-slate-900 dark:text-slate-100 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {formattedAddress}
                  </pre>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {!hasUserInput ? (
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="min-h-[44px] sm:min-h-[38px] px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Try Sample
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="min-h-[44px] sm:min-h-[38px] px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCopyFormatted}
                  className={`min-h-[44px] sm:min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#F38020] hover:bg-[#D96B0F] text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied Mailing Address
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Formatted Address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
