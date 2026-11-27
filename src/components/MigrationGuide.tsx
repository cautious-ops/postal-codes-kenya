import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { getCountiesSummary } from '../../shared/postalService.ts';

interface MigrationGuideProps {
  onSelectSlug: (slug: string) => void;
  onSelectCounty?: (countySlug: string) => void;
}

const POPULAR_OFFICES = [
  { label: 'Nairobi GPO', code: '00100', slug: '00100-nairobi-gpo' },
  { label: 'City Square', code: '00200', slug: '00200-city-square' },
  { label: 'Westlands', code: '00800', slug: '00800-westlands' },
  { label: 'Karen', code: '00502', slug: '00502-karen' },
  { label: 'Eastleigh', code: '00610', slug: '00610-eastleigh' },
  { label: 'Yaya Towers', code: '00508', slug: '00508-yaya-towers' },
  { label: 'Embakasi', code: '00501', slug: '00501-embakasi' },
  { label: 'Ongata Rongai', code: '00511', slug: '00511-ongata-rongai' },
  { label: 'Kiambu', code: '00900', slug: '00900-kiambu' },
  { label: 'Nyali (Mombasa)', code: '80118', slug: '80118-nyali' },
  { label: 'Bamburi', code: '80101', slug: '80101-bamburi' },
  { label: 'Likoni', code: '80110', slug: '80110-likoni' },
  { label: 'Changamwe', code: '80102', slug: '80102-changamwe' },
  { label: 'Malindi', code: '80200', slug: '80200-malindi' },
  { label: 'Ukunda (Diani)', code: '80400', slug: '80400-ukunda' },
  { label: 'Nakuru', code: '20100', slug: '20100-nakuru' },
  { label: 'Naivasha', code: '20117', slug: '20117-naivasha' },
  { label: 'Kericho', code: '20200', slug: '20200-kericho' },
  { label: 'Eldoret GPO', code: '30100', slug: '30100-eldoret-gpo' },
  { label: 'Nyeri', code: '10100', slug: '10100-nyeri' },
  { label: 'Kakamega', code: '50100', slug: '50100-kakamega' },
  { label: 'Meru', code: '60200', slug: '60200-meru' },
  { label: 'Machakos', code: '90100', slug: '90100-machakos' },
  { label: 'Garissa', code: '70100', slug: '70100-garissa' },
];

const FAQS = [
  {
    q: 'What is the postal code for Nairobi, Kenya?',
    a: 'The main postal code for Nairobi GPO is 00100. Other Nairobi areas use 00100–00800 prefixes such as City Square (00200), Westlands (00800), Karen (00502), Eastleigh (00610), Embakasi (00501), and Yaya Towers (00508).',
  },
  {
    q: 'What is Kenya’s ZIP code for online forms?',
    a: 'Kenya uses 5-digit postal codes instead of US ZIP codes. On international checkouts asking for a ZIP code, enter your local 5-digit code such as 00100 (Nairobi GPO) or 80118 (Nyali, Mombasa)—never +254.',
  },
  {
    q: 'What is the postal code for Mombasa, Kenya?',
    a: 'Mombasa County uses 801xx postal codes including Bamburi (80101), Changamwe (80102), Likoni (80110), Makupa (80112), and Nyali (80118). Neighbouring coastal counties use Kilifi (80108/80200 Malindi) and Kwale (80400 Ukunda).',
  },
  {
    q: 'How do you write a Kenyan postal address?',
    a: 'Place the recipient name on line 1, the box and 5-digit code on line 2 (e.g., P.O. Box 12345 – 00100), and the post office town plus Kenya on line 3 (Nairobi GPO, Kenya).',
  },
  {
    q: 'How are postal codes organized across Kenya’s 47 counties?',
    a: 'Every official postal code in Kenya uses 5 digits from 00100 to 90408 mapped to post offices across all 47 counties—such as Nairobi (00100–00800), Nakuru (20100–20157), Kajiado (00205–01103), and Mombasa (80101–80118).',
  },
  {
    q: 'How do I embed this postal code lookup on WordPress?',
    a: 'Use the Embed Generator above, pick your format and style, copy the snippet, and paste it into a Custom HTML block or page template. It connects directly to the free public API.',
  },
];

export function MigrationGuide({ onSelectSlug, onSelectCounty }: MigrationGuideProps) {
  const [countySearch, setCountySearch] = useState('');
  const allCounties = useMemo(() => getCountiesSummary(), []);

  const filteredCounties = useMemo(() => {
    const q = countySearch.trim().toLowerCase();
    if (!q) return allCounties;
    return allCounties.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.headquarters.toLowerCase().includes(q) ||
        c.sampleOffices.toLowerCase().includes(q) ||
        c.aliases.toLowerCase().includes(q)
    );
  }, [allCounties, countySearch]);

  return (
    <section
      id="migration"
      className="py-12 sm:py-16 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
        <div>
          <div className="max-w-2xl mb-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Popular Kenyan Locations
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Frequently Searched Postal Codes in Kenya
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {POPULAR_OFFICES.map((item) => (
              <a
                key={item.slug}
                href={`/postal-code/${item.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSlug(item.slug);
                }}
                className="p-3.5 bg-slate-50 dark:bg-[#111827] hover:bg-white dark:hover:bg-[#151D2E] border border-slate-200 dark:border-slate-800 rounded-xl transition-colors block"
              >
                <span className="block font-mono text-base font-bold text-[#EA580C] dark:text-[#FB923C]">
                  {item.code}
                </span>
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Addressing Standard
            </p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2.5">
              How Kenya Postal Codes &amp; ZIP Codes Work
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Kenya uses a structured 5-digit postal code system from <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">00100</span> to <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">90408</span> covering post offices across all 47 counties. For example, Nairobi County uses <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">00100–00800</span>, Nakuru County uses <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">20100–20157</span>, and Mombasa County uses <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">80101–80118</span>. Whenever an online form asks for a <strong className="text-slate-900 dark:text-slate-100">Kenya ZIP code</strong>, enter your local post office&apos;s 5-digit code rather than +254.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Mail &amp; Courier Format
            </p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2.5">
              How to Format a Kenyan Mailing Address
            </h2>
            <pre className="p-3.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto">
{`Wanjiku Kamau
P.O. Box 12345 – 00100
Nairobi GPO, Kenya`}
            </pre>
            <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Always pair your P.O. Box number with the exact 5-digit postal code of that post office branch for Posta Kenya, DHL, FedEx, and e-commerce deliveries.
            </p>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                001 Mombasa to 047 Nairobi
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Kenya’s 47 Counties Postal Directory
              </h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                value={countySearch}
                onChange={(e) => setCountySearch(e.target.value)}
                placeholder="Filter 47 counties or town..."
                aria-label="Filter Kenyan counties directory"
                className="w-full h-11 pl-9 pr-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#F38020] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[540px] overflow-y-auto">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#111827]">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 whitespace-nowrap">Code</th>
                  <th className="py-3 px-4 whitespace-nowrap">County</th>
                  <th className="py-3 px-4">Sample Post Offices</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Postal Range</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Offices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-sm bg-white dark:bg-[#0B0F17]">
                {filteredCounties.map((county) => (
                  <tr
                    key={county.slug}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#EA580C] dark:text-[#FB923C] whitespace-nowrap">
                      {county.code}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {onSelectCounty ? (
                        <button
                          type="button"
                          onClick={() => onSelectCounty(county.slug)}
                          className="text-left hover:text-[#EA580C] dark:hover:text-[#FB923C] hover:underline cursor-pointer"
                        >
                          {county.name} County
                        </button>
                      ) : (
                        <span>{county.name} County</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {county.sampleOffices || county.aliases}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {county.minCode && county.maxCode
                        ? county.minCode === county.maxCode
                          ? county.minCode
                          : `${county.minCode}–${county.maxCode}`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {county.count}
                    </td>
                  </tr>
                ))}
                {filteredCounties.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                      No Kenyan county matches &ldquo;{countySearch}&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6">
            Kenya Postal Code FAQ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
              >
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {item.q}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
