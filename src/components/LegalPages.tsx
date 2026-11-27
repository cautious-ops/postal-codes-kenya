import { ArrowLeft } from 'lucide-react';

export type LegalPageMode = 'privacy' | 'terms';

interface LegalPagesProps {
  mode: LegalPageMode;
  onBackHome: () => void;
  onSwitchMode: (mode: LegalPageMode) => void;
}

export function LegalPages({ mode, onBackHome, onSwitchMode }: LegalPagesProps) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';
  const isPrivacy = mode === 'privacy';

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#EA580C] dark:hover:text-[#FB923C] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Postal Code Finder
          </button>

          <div
            role="tablist"
            aria-label="Legal documents"
            className="inline-flex items-center p-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isPrivacy}
              onClick={() => onSwitchMode('privacy')}
              className={`min-h-[38px] sm:min-h-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                isPrivacy
                  ? 'bg-slate-900 dark:bg-[#F38020] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isPrivacy}
              onClick={() => onSwitchMode('terms')}
              className={`min-h-[38px] sm:min-h-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                !isPrivacy
                  ? 'bg-slate-900 dark:bg-[#F38020] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Terms of Use
            </button>
          </div>
        </div>

        <article className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xs">
          <header className="pb-6 border-b border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Kenya Postal Directory · Legal Notice · {origin}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Use'}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Effective date: November 27, 2026
            </p>
          </header>

          {isPrivacy ? (
            <div className="space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  1. Overview &amp; Zero-Account Access
                </h2>
                <p>
                  Kenya Postal Directory (<span className="font-mono text-xs">{origin}</span>) provides a free Kenyan postal code lookup tool, regional directory, embeddable HTML widget, and public REST API. You do not need to create an account, sign in, or submit personal details such as your name, email address, or phone number to search Kenyan postal codes or call our API endpoints.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  2. Search Queries &amp; Local Preferences
                </h2>
                <p>
                  Location and postal code searches run directly in your browser against the bundled directory dataset. Your chosen display theme (Light or Dark mode) is saved locally inside your browser using <code className="font-mono text-xs">localStorage</code> under the key <code className="font-mono text-xs">kpd-theme</code> and is never transmitted to our servers.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  3. Google AdSense &amp; Advertising Cookies
                </h2>
                <p>
                  We use Google AdSense to display advertisements that keep this lookup tool and public API free for everyone. Third-party vendors, including Google, use cookies to serve ads based on a visitor&apos;s prior visits to this website or other websites on the Internet.
                </p>
                <p className="mt-3">
                  Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites. You may opt out of personalized advertising at any time by visiting{' '}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#EA580C] dark:text-[#FB923C] font-medium hover:underline"
                  >
                    Google Ads Settings
                  </a>{' '}
                  or by visiting{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#EA580C] dark:text-[#FB923C] font-medium hover:underline"
                  >
                    aboutads.info
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  4. Public API &amp; Embed Logs
                </h2>
                <p>
                  When external websites or applications call our public JSON/CSV API endpoints or load the embeddable WordPress checker widget, standard technical request metadata (such as HTTP route, timestamp, and user-agent) may be processed temporarily by hosting infrastructure for security, caching, and uptime reliability. We do not sell, rent, or build personal profiles from API traffic.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  5. Policy Updates
                </h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect improvements to the directory, API, or legal requirements. Continued use of this site after updates constitutes acceptance of the revised policy.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using Kenya Postal Directory (<span className="font-mono text-xs">{origin}</span>), including the interactive search tool, town directory pages, WordPress/HTML embed widget, CSV export, and public REST API endpoints, you agree to be bound by these Terms of Use.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  2. Independent Directory &amp; Accuracy Disclaimer
                </h2>
                <p>
                  This directory compiles 647 Kenyan postal office codes (00100–90408) for public address verification, e-commerce checkout forms, courier deliveries, and software integration. Kenya Postal Directory is an independent public reference and is not officially affiliated with, endorsed by, or operated by the Postal Corporation of Kenya (Posta Kenya). While we strive to keep records accurate, all information is provided &quot;as is&quot; without warranties of any kind.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  3. Free Public API &amp; Embed License
                </h2>
                <p>
                  You are granted a free, non-exclusive license to query the public REST API endpoints, download the CSV dataset, and embed the generated postal code checker HTML on personal, educational, WordPress, or commercial websites. When using the API in production applications, please cache responses reasonably where possible and avoid abusive automated load.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  4. Prohibited Conduct
                </h2>
                <p>
                  You agree not to attempt denial-of-service attacks, probe infrastructure vulnerabilities, bypass rate or security controls, or use automated tools in a manner that degrades service availability for other users.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  5. Limitation of Liability
                </h2>
                <p>
                  To the fullest extent permitted by law, Kenya Postal Directory and its maintainers shall not be liable for any direct, indirect, incidental, or consequential damages arising from misaddressed mail, shipping delays, API downtime, or reliance on any directory entry.
                </p>
              </section>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
