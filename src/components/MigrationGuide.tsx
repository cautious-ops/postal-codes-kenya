import { getRegionsSummary } from '../../shared/postalService.ts';

export function MigrationGuide() {
  const regions = getRegionsSummary();

  return (
    <section
      id="migration"
      className="py-16 border-t border-slate-200 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div>
          <div className="max-w-2xl mb-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Postal Prefix Architecture
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Kenya’s 10 Regional Code Zones
            </h2>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B0F17] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4">Prefix</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Major Postal Hubs</th>
                  <th className="py-3 px-4 text-right">Range</th>
                  <th className="py-3 px-4 text-right">Offices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {regions.map((region) => (
                  <tr
                    key={region.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#EA580C] dark:text-[#FB923C]">
                      {region.prefixRange}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {region.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {region.majorHubs}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                      {region.minCode}–{region.maxCode}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {region.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              01. Lightweight React + Vite UI
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Replaces the single-file PHP and static HTML wrapper with an instant React lookup tool featuring keyboard-accessible suggestions, region tabs, and tabular CSV/table views.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              02. Serverless Vercel API
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Includes pre-wired{' '}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                /api/postal-codes
              </code>
              ,{' '}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                /api/postal-codes/[code]
              </code>
              , and{' '}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                /api/regions
              </code>{' '}
              endpoints with open CORS and edge caching.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              03. Zero-Database Maintenance
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Compiled directly from your canonical CSV dataset into typed TypeScript records plus a static{' '}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                /postal-codes.csv
              </code>{' '}
              download—deployable to Vercel in seconds with zero DB cost.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
