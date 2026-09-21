import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
   KeyRound,
   Copy,
   Check,
   RefreshCw,
   ShieldCheck,
   Sparkles,
   Lock,
   ArrowRight,
   Zap,
   Eye,
   EyeOff
 } from 'lucide-react';
import {
  generateSecurePassword,
  generatePassphrase,
  generatePin,
  evaluatePasswordStrength,
} from '../../utils/cryptoEngine';
import { playPop, playHover, playSuccess } from '../../utils/soundEngine';
import { logActivity } from '../../utils/storage';
import { MagneticCard } from '../common/MagneticCard';

interface QuickPasswordCardProps {
  onNavigate: (path: string) => void;
}

type PresetType = 'strong' | 'ultra' | 'passphrase' | 'pin';

export const QuickPasswordCard: React.FC<QuickPasswordCardProps> = ({ onNavigate }) => {
  const [preset, setPreset] = useState<PresetType>('strong');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = (type: PresetType = preset) => {
    setIsGenerating(true);
    let result = '';
    if (type === 'strong') {
      result = generateSecurePassword({
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      });
    } else if (type === 'ultra') {
      result = generateSecurePassword({
        length: 32,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
      });
    } else if (type === 'passphrase') {
      result = generatePassphrase({
        wordCount: 4,
        separator: '-',
        capitalize: true,
        includeNumber: true,
      });
    } else if (type === 'pin') {
      result = generatePin(6);
    }

    setPassword(result);
    setTimeout(() => setIsGenerating(false), 200);
  };

  useEffect(() => {
    generate(preset);
  }, [preset]);

  const strength = evaluatePasswordStrength(password);

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!password) return;
    navigator.clipboard.writeText(password);
    playSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    logActivity({
      toolId: 'password-generator',
      toolName: 'Password Generator',
      targetName: `Quick ${preset.toUpperCase()}`,
      type: 'clean',
      scoreBefore: 100,
      scoreAfter: 100,
    });
  };

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPop();
    generate(preset);
  };

  const handleSelectPreset = (newPreset: PresetType) => {
    playPop();
    setPreset(newPreset);
  };

  return (
    <MagneticCard
      maxTilt={12}
      magneticPull={8}
      scaleOnHover={1.02}
      className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#121832]/95 via-[#0D1226]/95 to-[#080C1B]/95 border border-emerald-500/30 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.15)] backdrop-blur-xl text-left h-full flex flex-col justify-between"
    >
      {/* Top Accent Pill */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Instant Password Generator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-normal">
                  CSPRNG Local
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                100% cryptographic in-browser generation. Never touches servers.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/[0.06]">
          {[
            { id: 'strong', label: 'Strong 20ch' },
            { id: 'ultra', label: 'Ultra 32ch' },
            { id: 'passphrase', label: '4-Word Diceware' },
            { id: 'pin', label: '6-Digit PIN' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id as PresetType)}
              onMouseEnter={playHover}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                preset === p.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Generated Output Box */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/20 shadow-inner flex items-center justify-between gap-3 group">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {preset === 'passphrase' ? 'Diceware Passphrase' : preset === 'pin' ? 'Numeric PIN' : 'Random Key'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                {password.length} chars
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                ~{strength.entropyBits} bits entropy
              </span>
            </div>

            <div className="font-mono text-base sm:text-lg font-bold text-white tracking-wider break-all select-all pr-2">
              {showPassword ? (
                password
              ) : (
                <span className="tracking-widest text-slate-500">
                  {'•'.repeat(Math.min(password.length, 24))}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              onMouseEnter={playHover}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title={showPassword ? 'Hide characters' : 'Show characters'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              onMouseEnter={playHover}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors active:scale-95"
              title="Generate new password"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              onMouseEnter={playHover}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </motion.button>
          </div>
        </div>

        {/* Strength meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Entropy Rating: <strong className={strength.textColor}>{strength.label}</strong>
            </span>
            <span className="text-slate-400">
              Crack Time: <strong className="text-slate-200 font-mono">{strength.crackTime}</strong>
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${strength.percent}%` }}
              transition={{ duration: 0.4 }}
              className={`h-full ${strength.color}`}
            />
          </div>
        </div>
      </div>

      {/* Bottom link to full studio */}
      <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Need custom rules, bulk export, or passphrases?
        </span>
        <button
          onClick={() => {
            playPop();
            onNavigate('/tools/password-generator');
          }}
          onMouseEnter={playHover}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group cursor-pointer"
        >
          <span>Open Password Studio</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </MagneticCard>
  );
};
