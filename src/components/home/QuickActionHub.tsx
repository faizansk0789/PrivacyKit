import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link2Off,
  KeyRound,
  FileCheck,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Upload
} from 'lucide-react';
import { analyzeAndCleanUrl } from '../../utils/urlEngine';
import { generateSecurePassword, generatePassphrase } from '../../utils/cryptoEngine';
import { playPop, playSuccess, playHover } from '../../utils/soundEngine';

interface QuickActionHubProps {
  onNavigate: (path: string) => void;
}

type TabType = 'url' | 'password' | 'file';

export const QuickActionHub: React.FC<QuickActionHubProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('url');

  // URL Cleaner state
  const [inputUrl, setInputUrl] = useState('');
  const [cleanedUrl, setCleanedUrl] = useState('');
  const [removedCount, setRemovedCount] = useState<number | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  // Password Generator state
  const [password, setPassword] = useState(() =>
    generateSecurePassword({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: true })
  );
  const [passCopied, setPassCopied] = useState(false);
  const [passType, setPassType] = useState<'password' | 'passphrase'>('password');

  const handleCleanUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) return;
    try {
      const result = analyzeAndCleanUrl(inputUrl);
      setCleanedUrl(result.cleanUrl);
      setRemovedCount(result.trackingParams.length);
      playSuccess();
    } catch {
      setCleanedUrl(inputUrl);
      setRemovedCount(0);
    }
  };

  const handleCopyUrl = () => {
    if (!cleanedUrl) return;
    navigator.clipboard.writeText(cleanedUrl);
    setUrlCopied(true);
    playSuccess();
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleRegenPassword = () => {
    playPop();
    if (passType === 'password') {
      setPassword(generateSecurePassword({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: true }));
    } else {
      setPassword(generatePassphrase({ wordCount: 4, separator: '-', capitalize: true, includeNumber: true }));
    }
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setPassCopied(true);
    playSuccess();
    setTimeout(() => setPassCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#0C1020] border border-slate-800 p-6 sm:p-8 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Quick Privacy Tools</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant actions executed entirely in your browser.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              playPop();
              setActiveTab('url');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2Off className="w-3.5 h-3.5" />
            <span>Clean URL</span>
          </button>
          <button
            onClick={() => {
              playPop();
              setActiveTab('password');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'password'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
          <button
            onClick={() => {
              playPop();
              setActiveTab('file');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'file'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Clean File</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="pt-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: URL CLEANER */}
          {activeTab === 'url' && (
            <motion.div
              key="tab-url"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-4"
            >
              <form onSubmit={handleCleanUrl} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Paste a link with tracking tokens (e.g. https://site.com/item?utm_source=...&fbclid=...)"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (cleanedUrl) setCleanedUrl('');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inputUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Clean Link
                </button>
              </form>

              {cleanedUrl && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {removedCount !== null && removedCount > 0
                          ? `Stripped ${removedCount} tracking parameter${removedCount > 1 ? 's' : ''}`
                          : 'No trackers found (Already clean)'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-200 truncate">{cleanedUrl}</p>
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    {urlCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Clean URL</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: PASSWORD GENERATOR */}
          {activeTab === 'password' && (
            <motion.div
              key="tab-pass"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm sm:text-base text-white tracking-wider flex items-center justify-between select-all">
                  <span className="truncate">{password}</span>
                  <span className="text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-2 shrink-0">
                    Strong
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleRegenPassword}
                    title="Generate new password"
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopyPassword}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {passCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick type toggles */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPassType('password');
                      setPassword(generateSecurePassword({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: true }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                      passType === 'password' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    18-Char Random
                  </button>
                  <button
                    onClick={() => {
                      setPassType('passphrase');
                      setPassword(generatePassphrase({ wordCount: 4, separator: '-', capitalize: true, includeNumber: true }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                      passType === 'passphrase' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    4-Word Passphrase
                  </button>
                </div>
                <button
                  onClick={() => onNavigate('/tools/password-generator')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Advanced options</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: FILE DROP */}
          {activeTab === 'file' && (
            <motion.div
              key="tab-file"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => onNavigate('/tools/exif-remover')}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-white group-hover:text-indigo-400 flex items-center justify-between">
                    <span>Photo EXIF Cleaner</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Strip GPS & device info from JPG, PNG, WEBP.</p>
                </button>

                <button
                  onClick={() => onNavigate('/tools/pdf-metadata-cleaner')}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-white group-hover:text-indigo-400 flex items-center justify-between">
                    <span>PDF Metadata Cleaner</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Remove author, organization & history.</p>
                </button>

                <button
                  onClick={() => onNavigate('/privacy-checkup')}
                  className="p-4 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-indigo-300 group-hover:text-white flex items-center justify-between">
                    <span>Full Privacy Checkup</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Multi-file scanner & privacy report.</p>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
