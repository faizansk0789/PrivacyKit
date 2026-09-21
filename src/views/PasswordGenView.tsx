import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  Copy,
  RefreshCw,
  Sliders,
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Download,
  ShieldAlert,
  HelpCircle,
  Hash,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrustBadge } from '../components/common/TrustBadge';
import {
  generateSecurePassword,
  generatePassphrase,
  generateAnonymousUsername,
  generatePin,
  evaluatePasswordStrength,
  PasswordOptions,
  PassphraseOptions
} from '../utils/cryptoEngine';
import { logActivity } from '../utils/storage';
import { playPop, playHover, playSuccess } from '../utils/soundEngine';

interface PasswordGenViewProps {
  onNavigate: (path: string) => void;
}

type TabType = 'password' | 'passphrase' | 'username' | 'checker';

export const PasswordGenView: React.FC<PasswordGenViewProps> = ({ onNavigate }) => {
  // Read query params if present
  const getInitialTab = (): TabType => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'passphrase' || tabParam === 'username' || tabParam === 'checker') {
        return tabParam;
      }
    }
    return 'password';
  };

  const [tab, setTab] = useState<TabType>(getInitialTab);

  // Password state
  const [pwdOptions, setPwdOptions] = useState<PasswordOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);

  // Passphrase state
  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>({
    wordCount: 4,
    separator: '-',
    capitalize: true,
    includeNumber: true,
  });
  const [currentPassphrase, setCurrentPassphrase] = useState('');

  // Username state
  const [currentUsername, setCurrentUsername] = useState('');
  const [usernameStyle, setUsernameStyle] = useState<'pseudonym' | 'numeric' | 'short'>('pseudonym');

  // Strength Checker state
  const [testPassword, setTestPassword] = useState('');
  const [showTestPassword, setShowTestPassword] = useState(true);

  // Copy feedback
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate functions
  const refreshPassword = () => {
    const pwd = generateSecurePassword(pwdOptions);
    setCurrentPassword(pwd);

    if (showBulk) {
      const bulk = Array.from({ length: bulkCount }, () => generateSecurePassword(pwdOptions));
      setBulkPasswords(bulk);
    }
  };

  const refreshPassphrase = () => {
    const phrase = generatePassphrase(passphraseOptions);
    setCurrentPassphrase(phrase);
  };

  const refreshUsername = () => {
    const user = generateAnonymousUsername(usernameStyle);
    setCurrentUsername(user);
  };

  useEffect(() => {
    refreshPassword();
  }, [pwdOptions, showBulk, bulkCount]);

  useEffect(() => {
    refreshPassphrase();
  }, [passphraseOptions]);

  useEffect(() => {
    refreshUsername();
  }, [usernameStyle]);

  const activeValue =
    tab === 'password'
      ? currentPassword
      : tab === 'passphrase'
      ? currentPassphrase
      : tab === 'username'
      ? currentUsername
      : testPassword;

  const strength = evaluatePasswordStrength(activeValue);

  const handleCopy = (text?: string, index?: number) => {
    const val = text !== undefined ? text : activeValue;
    if (!val) return;
    navigator.clipboard.writeText(val);
    playSuccess();

    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }

    if (strength.entropyBits >= 70) {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#6366F1', '#38BDF8'],
      });
    }

    logActivity({
      toolId: 'password-generator',
      toolName: 'Password Generator',
      targetName: `${tab.toUpperCase()} Generated`,
      type: 'clean',
      scoreBefore: 100,
      scoreAfter: 100,
    });
  };

  // Presets
  const applyPreset = (presetName: 'ultra' | 'standard' | 'readable' | 'alpha' | 'pin') => {
    playPop();
    setTab('password');
    if (presetName === 'ultra') {
      setPwdOptions({
        length: 32,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
      });
    } else if (presetName === 'standard') {
      setPwdOptions({
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      });
    } else if (presetName === 'readable') {
      setPwdOptions({
        length: 18,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      });
    } else if (presetName === 'alpha') {
      setPwdOptions({
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
        excludeAmbiguous: true,
      });
    } else if (presetName === 'pin') {
      const pin = generatePin(6);
      setCurrentPassword(pin);
    }
  };

  const handleExportBatch = () => {
    playPop();
    const content = `# PrivacyKit Generated Passwords\n# Generated 100% locally via CSPRNG at ${new Date().toISOString()}\n\n` +
      [currentPassword, ...bulkPasswords].filter(Boolean).map((p, i) => `Password ${i + 1}: ${p}`).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `privacykit-passwords-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    playSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wider uppercase shadow-sm">
          <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>CRYPTOGRAPHIC KEY SYNTHESIS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Secure Password & Passphrase Generator
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Generate cryptographically uncrackable passwords, Diceware multi-word passphrases, and pseudonymous aliases in your browser with hardware-level entropy.
        </p>
        <div className="pt-2 flex justify-center">
          <TrustBadge type="local" showExplanation />
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1">Quick Presets:</span>
        <button
          onClick={() => applyPreset('ultra')}
          onMouseEnter={playHover}
          className="px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          🛡️ Maximum (32 chars)
        </button>
        <button
          onClick={() => applyPreset('standard')}
          onMouseEnter={playHover}
          className="px-3 py-1.5 rounded-full bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          ⚡ Standard (20 chars)
        </button>
        <button
          onClick={() => {
            playPop();
            setTab('passphrase');
          }}
          onMouseEnter={playHover}
          className="px-3 py-1.5 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          🧠 4-Word Diceware
        </button>
        <button
          onClick={() => applyPreset('alpha')}
          onMouseEnter={playHover}
          className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          🔤 Alphanumeric (No Symbols)
        </button>
        <button
          onClick={() => applyPreset('pin')}
          onMouseEnter={playHover}
          className="px-3 py-1.5 rounded-full bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          🔢 6-Digit PIN
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-full clay-card flex flex-wrap items-center justify-center gap-1.5 shadow-md">
          <button
            onClick={() => {
              playPop();
              setTab('password');
            }}
            onMouseEnter={playHover}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              tab === 'password'
                ? 'clay-pill-active'
                : 'clay-pill-inactive'
            }`}
          >
            Random Password
          </button>
          <button
            onClick={() => {
              playPop();
              setTab('passphrase');
            }}
            onMouseEnter={playHover}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              tab === 'passphrase'
                ? 'clay-pill-active'
                : 'clay-pill-inactive'
            }`}
          >
            Memorable Passphrase
          </button>
          <button
            onClick={() => {
              playPop();
              setTab('username');
            }}
            onMouseEnter={playHover}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              tab === 'username'
                ? 'clay-pill-active'
                : 'clay-pill-inactive'
            }`}
          >
            Pseudonym Alias
          </button>
          <button
            onClick={() => {
              playPop();
              setTab('checker');
            }}
            onMouseEnter={playHover}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              tab === 'checker'
                ? 'clay-pill-active'
                : 'clay-pill-inactive'
            }`}
          >
            Strength Tester
          </button>
        </div>
      </div>

      {/* Main Generator Card */}
      <div className="clay-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
        {/* Output Display for Generator Tabs */}
        {tab !== 'checker' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Generated {tab === 'password' ? 'Password' : tab === 'passphrase' ? 'Diceware Passphrase' : 'Alias'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {activeValue.length} characters
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  ~{strength.entropyBits} bits entropy
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl clay-inset-card flex items-center justify-between gap-4 group">
              <span className="font-mono text-lg sm:text-2xl text-slate-900 dark:text-white font-bold tracking-wider break-all select-all">
                {showPassword ? (
                  activeValue
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 tracking-widest">
                    {'•'.repeat(Math.min(activeValue.length, 28))}
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={playHover}
                  className="clay-circle-btn w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  title={showPassword ? 'Hide value' : 'Show value'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    if (tab === 'password') refreshPassword();
                    if (tab === 'passphrase') refreshPassphrase();
                    if (tab === 'username') refreshUsername();
                  }}
                  onMouseEnter={playHover}
                  className="clay-circle-btn w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  title="Generate another"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCopy()}
                  onMouseEnter={playHover}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </motion.button>
              </div>
            </div>

            {/* Strength Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Strength: <strong className={strength.textColor}>{strength.label}</strong>
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Crack Estimate: <strong className="text-slate-900 dark:text-slate-200 font-mono">{strength.crackTime}</strong>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.percent}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-full ${strength.color}`}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Offline Strength Checker Tab */
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Test Any Existing Password (100% Offline Analysis)
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Never leaves memory</span>
              </div>
              <div className="relative">
                <input
                  type={showTestPassword ? 'text' : 'password'}
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Type or paste a password to check its entropy..."
                  className="w-full px-4 py-3.5 pr-24 rounded-2xl clay-inset-card text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowTestPassword(!showTestPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  {showTestPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {testPassword && (
              <div className="p-5 sm:p-6 rounded-2xl clay-inset-card space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl clay-card">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Score</span>
                    <strong className={`text-sm ${strength.textColor}`}>{strength.label}</strong>
                  </div>
                  <div className="p-3 rounded-xl clay-card">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Entropy</span>
                    <strong className="text-sm text-slate-900 dark:text-white font-mono">{strength.entropyBits} bits</strong>
                  </div>
                  <div className="p-3 rounded-xl clay-card">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Brute Force Crack</span>
                    <strong className="text-sm text-slate-800 dark:text-slate-200 font-mono truncate block">{strength.crackTime}</strong>
                  </div>
                  <div className="p-3 rounded-xl clay-card">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Length</span>
                    <strong className="text-sm text-slate-900 dark:text-white font-mono">{testPassword.length} chars</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Security Analysis Feedback:</span>
                  <div className="space-y-1.5">
                    {strength.feedback.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration Controls based on tab */}
        {tab === 'password' && (
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password Length: <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold">{pwdOptions.length} characters</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[12, 16, 20, 24, 32, 48].map((l) => (
                    <button
                      key={l}
                      onClick={() => setPwdOptions({ ...pwdOptions, length: l })}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                        pwdOptions.length === l
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min="6"
                max="64"
                value={pwdOptions.length}
                onChange={(e) =>
                  setPwdOptions({ ...pwdOptions, length: parseInt(e.target.value, 10) })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={pwdOptions.uppercase}
                  onChange={(e) => setPwdOptions({ ...pwdOptions, uppercase: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Uppercase Letters (A-Z)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">ABCDEFGHJKLMNPQRSTUVWXYZ</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={pwdOptions.lowercase}
                  onChange={(e) => setPwdOptions({ ...pwdOptions, lowercase: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Lowercase Letters (a-z)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">abcdefghijkmnopqrstuvwxyz</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={pwdOptions.numbers}
                  onChange={(e) => setPwdOptions({ ...pwdOptions, numbers: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Numbers (0-9)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">0123456789</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={pwdOptions.symbols}
                  onChange={(e) => setPwdOptions({ ...pwdOptions, symbols: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Special Symbols (!@#$%^&*)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{"!@#$%^&*()_+-=[]{}|;:,.<>?"}</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={pwdOptions.excludeAmbiguous}
                  onChange={(e) => setPwdOptions({ ...pwdOptions, excludeAmbiguous: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Exclude Ambiguous Characters</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Prevents confusion (e.g., 1 vs l, 0 vs O)</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={showBulk}
                  onChange={(e) => setShowBulk(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Bulk Generation Mode</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Generate multiple alternatives simultaneously</span>
                </div>
              </label>
            </div>

            {/* Bulk Password Output */}
            {showBulk && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Bulk Alternatives ({bulkPasswords.length}):
                  </span>
                  <button
                    onClick={handleExportBatch}
                    onMouseEnter={playHover}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full clay-button-pro text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .txt</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {bulkPasswords.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl clay-inset-card flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300 group"
                    >
                      <span className="truncate pr-3 select-all">{p}</span>
                      <button
                        onClick={() => handleCopy(p, idx)}
                        onMouseEnter={playHover}
                        className="px-3 py-1 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-sans font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Passphrase Options */}
        {tab === 'passphrase' && (
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Number of Words: <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold">{passphraseOptions.wordCount} words</span>
                </label>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                value={passphraseOptions.wordCount}
                onChange={(e) =>
                  setPassphraseOptions({ ...passphraseOptions, wordCount: parseInt(e.target.value, 10) })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl clay-inset-card space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Separator</label>
                <select
                  value={passphraseOptions.separator}
                  onChange={(e) => setPassphraseOptions({ ...passphraseOptions, separator: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=".">Period (.)</option>
                  <option value=" ">Space ( )</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl clay-inset-card cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={passphraseOptions.capitalize}
                  onChange={(e) => setPassphraseOptions({ ...passphraseOptions, capitalize: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Capitalize Words</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl clay-inset-card cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={passphraseOptions.includeNumber}
                  onChange={(e) => setPassphraseOptions({ ...passphraseOptions, includeNumber: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Append Number</span>
              </label>
            </div>
          </div>
        )}

        {/* Pseudonym Tab */}
        {tab === 'username' && (
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Alias Format:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'pseudonym', label: 'Adjective + Noun + Number', desc: 'e.g. quantum_phoenix_492' },
                  { id: 'short', label: 'Short Handle', desc: 'e.g. sentry_812' },
                  { id: 'numeric', label: 'Standard Alias', desc: 'e.g. cipher_wanderer_301' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      playPop();
                      setUsernameStyle(s.id as any);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      usernameStyle === s.id
                        ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-900 dark:text-white shadow-sm'
                        : 'clay-inset-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block text-slate-900 dark:text-white">{s.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explanatory Educational Notes */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="space-y-2 p-5 rounded-3xl clay-card">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h4>CSPRNG Randomness</h4>
          </div>
          <p className="leading-relaxed">
            Uses `window.crypto.getRandomValues()` with hardware entropy pools for unpredictable key generation.
          </p>
        </div>

        <div className="space-y-2 p-5 rounded-3xl clay-card">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Lock className="w-4 h-4 text-indigo-500" />
            <h4>Diceware Passphrases</h4>
          </div>
          <p className="leading-relaxed">
            Multi-word passphrases resist dictionary attacks while remaining easily memorable for humans without writing down.
          </p>
        </div>

        <div className="space-y-2 p-5 rounded-3xl clay-card">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <h4>Zero Data Transmission</h4>
          </div>
          <p className="leading-relaxed">
            All algorithms execute locally in browser memory. Nothing is ever sent to servers, databases, or analytics.
          </p>
        </div>
      </div>
    </div>
  );
};
