import { getRegionsSummary } from '../../shared/postalService.ts';

interface MigrationGuideProps {
  onSelectSlug: (slug: string) => void;
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
    a: 'Mombasa and Kenya’s Coast region use 80xxx postal codes, including Bamburi (80101), Changamwe (80102), Likoni (80110), Nyali (80118), Malindi (80200), and Ukunda (80400).',
  },
  {
    q: 'How do you write a Kenyan postal address?',
    a: 'Place the recipient name on line 1, the box and 5-digit code on line 2 (e.g., P.O. Box 12345 – 00100), and the post office town plus Kenya on line 3 (Nairobi GPO, Kenya).',
  },
  {
    q: 'How many digits is a Kenyan postal code?',
    a: 'Every official postal code in Kenya uses a 5-digit number ranging from 00100 to 90408, where the first digit designates one of Kenya’s 10 regional postal zones.',
  },
  {
    q: 'How do I embed this postal code lookup on WordPress?',
    a: 'Use the WordPress / HTML generator above, copy the snippet, add a Custom HTML block in WordPress, paste the code, and publish. It connects directly to the free public API.',
  },
];

export function MigrationGuide({ onSelectSlug }: MigrationGuideProps) {
  const regions = getRegionsSummary();

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
              Kenya uses a structured 5-digit postal code system from <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">00100</span> to <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">90408</span>. The first digit identifies one of 10 regional routing zones, while the last four digits route parcels to a specific post office. Whenever an international checkout form asks for a <strong className="text-slate-900 dark:text-slate-100">Kenya ZIP code</strong>, use your nearest town&apos;s 5-digit postal code rather than the +254 phone code.
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
          <div className="max-w-2xl mb-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Postal Prefix Architecture
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Kenya’s 10 Regional Code Zones
            </h2>
          </div>

          <div className="overflow-x-auto bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 whitespace-nowrap">Prefix</th>
                  <th className="py-3 px-4 whitespace-nowrap">Region</th>
                  <th className="py-3 px-4">Major Postal Hubs</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Range</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Offices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-sm bg-white dark:bg-[#0B0F17]">
                {regions.map((region) => (
                  <tr
                    key={region.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#EA580C] dark:text-[#FB923C] whitespace-nowrap">
                      {region.prefixRange}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {region.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {region.majorHubs}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {region.minCode}–{region.maxCode}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {region.count}
                    </td>
                  </tr>
                ))}
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
