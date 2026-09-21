import React from 'react';
import { ShieldCheck, Lock, Check } from 'lucide-react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
}

export const LegalView: React.FC<LegalViewProps> = ({ type }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-bold shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Legal & Privacy Disclosure</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last updated: January 2026 • Version 2.4
        </p>
      </div>

      <div className="clay-card rounded-3xl p-6 sm:p-10 space-y-8 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xl">
        {type === 'privacy' ? (
          <>
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Our Fundamental Commitment</h2>
              <p>
                PrivacyKit is built around client-side data sovereignty. We do not transmit, store, or log the contents of your uploaded photos, PDF documents, or Office files on any remote servers during standard tool operation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. In-Browser Memory Processing</h2>
              <p>
                All file decoding, EXIF inspection, metadata stripping, and URL parsing occur within your web browser's temporary heap memory. When you close or refresh your browser tab, all ephemeral file representations are instantly cleared by the browser's garbage collector.
              </p>
            </section>

            <section className="space-y-3" id="cookies">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. LocalStorage & Cookies</h2>
              <p>
                We use browser LocalStorage strictly to preserve your user preferences (such as Dark/Light theme and optional locally saved privacy reports). We do not employ third-party advertising cookies or cross-site tracking pixels.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Telemetry & Analytics</h2>
              <p>
                We collect zero behavioral tracking telemetry. We do not track keystrokes, generated passwords, or sanitized URLs.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Terms of Use</h2>
              <p>
                By using PrivacyKit, you agree to utilize our utilities solely for lawful security, privacy verification, and data sanitization purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Disclaimer of Warranties</h2>
              <p>
                PrivacyKit is provided "as is" without warranty of any kind. While our parsing engines strive to eliminate all identifiable metadata tags according to standard specifications, users are encouraged to verify critical documents when handling sensitive or classified materials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Free & Open Access</h2>
              <p>
                PrivacyKit is completely free with zero subscriptions, recurring fees, or paywalls. All sanitization, metadata removal, and privacy verification tools run 100% client-side in your web browser.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
