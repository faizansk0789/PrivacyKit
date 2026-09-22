import React, { useState } from 'react';
import {
  Link2Off,
  Copy,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Check,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrustBadge } from '../components/common/TrustBadge';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { analyzeAndCleanUrl } from '../utils/urlEngine';
import { SAMPLE_URLS } from '../utils/sampleData';
import { UrlAnalysisResult } from '../types';
import { logActivity } from '../utils/storage';
import { playPop, playHover } from '../utils/soundEngine';

interface UrlCleanerViewProps {
  onNavigate: (path: string) => void;
}

export const UrlCleanerView: React.FC<UrlCleanerViewProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [urlInput, setUrlInput] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const [batchResults, setBatchResults] = useState<UrlAnalysisResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [batchCopied, setBatchCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSingleClean = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!urlInput.trim()) {
      setError('Please provide a URL to clean.');
      return;
    }

    try {
      playPop();
      const res = analyzeAndCleanUrl(urlInput);
      setResult(res);

      if (res.removedParamsCount > 0) {
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#8B5CF6', '#6366F1', '#10B981'],
          });
        } catch (e) {}
      }

      logActivity({
        toolId: 'url-privacy-cleaner',
        toolName: 'URL Privacy Cleaner',
        targetName: res.domain,
        type: 'clean',
        scoreBefore: res.privacyScore,
        scoreAfter: 100,
        itemsRemovedCount: res.removedParamsCount,
        bytesRemoved: res.originalUrl.length - res.cleanUrl.length,
      });
    } catch (err: any) {
      setError(err.message || 'Invalid URL provided.');
    }
  };

  const handleBatchClean = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const lines = batchInput.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setError('Please paste at least one URL.');
      return;
    }

    try {
      playPop();
      const results = lines.map((line) => analyzeAndCleanUrl(line));
      setBatchResults(results);

      logActivity({
        toolId: 'url-privacy-cleaner',
        toolName: 'Batch URL Cleaner',
        targetName: `${results.length} URLs`,
        type: 'clean',
        scoreBefore: 50,
        scoreAfter: 100,
        itemsRemovedCount: results.reduce((acc, r) => acc + r.removedParamsCount, 0),
        bytesRemoved: results.reduce((acc, r) => acc + (r.originalUrl.length - r.cleanUrl.length), 0),
      });
    } catch (err: any) {
      setError(err.message || 'Error processing batch URLs.');
    }
  };

  const handleCopyClean = () => {
    if (!result) return;
    playPop();
    navigator.clipboard.writeText(result.cleanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllBatch = () => {
    if (batchResults.length === 0) return;
    playPop();
    const text = batchResults.map((r) => r.cleanUrl).join('\n');
    navigator.clipboard.writeText(text);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2000);
  };

  const reset = () => {
    playPop();
    setUrlInput('');
    setBatchInput('');
    setResult(null);
    setBatchResults([]);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm">
          <Link2Off className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Tracking Token & Click ID Stripper</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          URL Privacy Cleaner
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Strip surveillance tokens (like fbclid, gclid, utm_*, and TikTok click IDs) from links before sending or bookmarking them.
        </p>
        <div className="pt-2 flex justify-center">
          <TrustBadge type="local" showExplanation />
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-full clay-card flex items-center gap-1 shadow-sm">
          <button
            id="url-mode-single"
            onClick={() => {
              playPop();
              setMode('single');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'single'
                ? 'clay-pill-active'
                : 'clay-pill-inactive'
            }`}
          >
            Single URL Audit
          </button>
          <button
            id="url-mode-batch"
            onClick={() => {
              playPop();
              setMode('batch');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'batch'
                ? 'clay-pill-active'
                : 'clay-pill-inactive'
            }`}
          >
            Batch Cleaner (Multiple Links)
          </button>
        </div>
      </div>

      {/* Single Mode Form */}
      {mode === 'single' && (
        <div className="max-w-3xl mx-auto space-y-8">
          <form onSubmit={handleSingleClean} className="space-y-4">
            <div className="clay-card p-6 sm:p-8 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Paste link to inspect & sanitize
              </label>

              <div className="relative">
                <input
                  id="url-input-single"
                  type="text"
                  placeholder="https://example.com/item?utm_source=twitter&utm_medium=social&gclid=Cj0KCQi..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-4 pr-4 py-3.5 rounded-2xl clay-inset-search text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all font-medium"
                />
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="url-submit-btn"
                type="submit"
                onMouseEnter={playHover}
                className="w-full py-3.5 rounded-full clay-button-pro text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sanitize URL</span>
              </button>
            </div>
          </form>

          {/* Sample URL Suggestions */}
          {!result && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                Or test with sample tracking links:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_URLS.map((sample) => (
                  <button
                    key={sample.title}
                    type="button"
                    onClick={() => {
                      playPop();
                      setUrlInput(sample.url);
                      setError(null);
                    }}
                    onMouseEnter={playHover}
                    className="text-left p-4 rounded-2xl clay-card hover:translate-y-[-2px] transition-all group space-y-1 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center justify-between">
                      <span>{sample.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">{sample.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single Result View */}
          {result && (
            <div className="space-y-6">
              {/* Score & Summary */}
              <div className="clay-card p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <ScoreMeter score={result.privacyScore} size="md" />
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Target Domain</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white max-w-xs sm:max-w-md truncate">
                      {result.domain}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {result.removedParamsCount > 0
                        ? `${result.removedParamsCount} tracking parameter(s) removed`
                        : 'No tracking parameters detected (Clean URL)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    id="copy-clean-link-btn"
                    onClick={handleCopyClean}
                    onMouseEnter={playHover}
                    className="px-4 py-2.5 rounded-full clay-button-pro text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Clean Link'}</span>
                  </button>

                  <a
                    href={result.cleanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full clay-circle-btn flex items-center justify-center cursor-pointer"
                    title="Open sanitized link in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={reset}
                    className="p-2.5 rounded-full clay-circle-btn flex items-center justify-center cursor-pointer"
                    title="Clean another URL"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Clean Output Box */}
              <div className="clay-card p-6 space-y-3 ring-2 ring-emerald-400/50 dark:ring-emerald-600/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Sanitized URL (Safe to share)</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {result.cleanUrl.length} chars (saved {result.originalUrl.length - result.cleanUrl.length} chars)
                  </span>
                </div>

                <div className="p-4 rounded-2xl clay-inset-card font-mono text-xs text-emerald-800 dark:text-emerald-300 break-all select-all font-semibold">
                  {result.cleanUrl}
                </div>
              </div>

              {/* Detected Trackers Table */}
              {result.trackingParams.length > 0 && (
                <div className="clay-card p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Detected Tracking Tokens ({result.trackingParams.length})
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                          <th className="pb-3 font-semibold font-sans">Parameter Key</th>
                          <th className="pb-3 font-semibold font-sans">Token Value</th>
                          <th className="pb-3 font-semibold font-sans">Category / Vendor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {result.trackingParams.map((tp, idx) => (
                          <tr key={`${tp.key}-${idx}`} className="text-slate-800 dark:text-slate-200">
                            <td className="py-2.5 font-bold text-rose-600 dark:text-rose-400">{tp.key}</td>
                            <td className="py-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{tp.value}</td>
                            <td className="py-2.5 font-sans">
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                                {tp.category}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Batch Mode Form */}
      {mode === 'batch' && (
        <div className="max-w-3xl mx-auto space-y-8">
          <form onSubmit={handleBatchClean} className="space-y-4">
            <div className="clay-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Paste multiple URLs (one per line)
                </label>
                {(batchInput.length > 0 || batchResults.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setBatchInput('');
                      setBatchResults([]);
                      setError(null);
                    }}
                    onMouseEnter={playHover}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              <textarea
                rows={5}
                placeholder={`https://example.com/one?utm_source=google&gclid=123\nhttps://example.com/two?fbclid=xyz`}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                className="w-full p-4 rounded-2xl clay-inset-search text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all font-medium"
              ></textarea>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                onMouseEnter={playHover}
                className="w-full py-3.5 rounded-full clay-button-pro text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Clean All URLs</span>
              </button>
            </div>
          </form>

          {/* Batch Results Table */}
          {batchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Processed {batchResults.length} Links
                </h3>
                <button
                  onClick={handleCopyAllBatch}
                  onMouseEnter={playHover}
                  className="px-4 py-2 rounded-full clay-button-pro text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{batchCopied ? 'All Copied!' : 'Copy All Clean Links'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {batchResults.map((b, idx) => (
                  <div
                    key={idx}
                    className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 font-sans">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">{b.domain}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {b.removedParamsCount} removed
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 truncate">{b.cleanUrl}</p>
                    </div>

                    <button
                      onClick={() => {
                        playPop();
                        navigator.clipboard.writeText(b.cleanUrl);
                      }}
                      className="px-3 py-1.5 rounded-full clay-circle-btn text-xs font-sans font-bold shrink-0 cursor-pointer active:scale-98"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEO / FAQ Section */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-600 dark:text-slate-400">
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Why strip URL parameters?</h4>
          <p className="leading-relaxed">
            Click identifiers (like `fbclid`, `gclid`, `ttclid`) link your personal social media identity with the web pages you browse. Removing these query tags breaks cross-site correlation before you share or bookmark a URL.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Does URL cleaning break webpage destinations?</h4>
          <p className="leading-relaxed">
            No. Essential routing parameters and hash fragments (e.g. `?id=123` or `#section`) are preserved, while known surveillance tags are filtered out.
          </p>
        </div>
      </div>
    </div>
  );
};
