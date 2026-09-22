import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  X,
  Sparkles,
  Command,
  Image,
  KeyRound,
  FileText,
  FileSpreadsheet,
  Link2,
  ShieldAlert,
  Home,
  Sun,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playPop, playHover } from '../../utils/soundEngine';

interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    description: string;
    path?: string;
    actionLabel?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onToggleTheme?: () => void;
  onOpenSearch?: () => void;
}

export const KEYBOARD_SHORTCUTS: ShortcutGroup[] = [
  {
    category: 'Common Privacy Tools',
    items: [
      {
        keys: ['G', 'P'],
        description: 'Password Generator (Strong & Passphrase)',
        path: '/tools/password-generator',
        icon: KeyRound,
      },
      {
        keys: ['G', 'E'],
        description: 'EXIF Metadata Remover (Photos & Images)',
        path: '/tools/exif-remover',
        icon: Image,
      },
      {
        keys: ['G', 'D'],
        description: 'PDF Metadata Cleaner',
        path: '/tools/pdf-metadata-cleaner',
        icon: FileText,
      },
      {
        keys: ['G', 'O'],
        description: 'Office Document Cleaner (DOCX, XLSX)',
        path: '/tools/doc-metadata-cleaner',
        icon: FileSpreadsheet,
      },
      {
        keys: ['G', 'U'],
        description: 'URL Privacy & Tracking Parameter Cleaner',
        path: '/tools/url-privacy-cleaner',
        icon: Link2,
      },
      {
        keys: ['G', 'C'],
        description: 'Privacy Checkup Flagship Scanner',
        path: '/privacy-checkup',
        icon: ShieldAlert,
      },
    ],
  },
  {
    category: 'Quick Navigation & Global Actions',
    items: [
      {
        keys: ['G', 'H'],
        description: 'Go to Home / Overview Page',
        path: '/',
        icon: Home,
      },
      {
        keys: ['G', 'T'],
        description: 'Browse All Privacy Tools Directory',
        path: '/tools',
        icon: Sparkles,
      },
      {
        keys: ['⌘/Ctrl', 'K'],
        description: 'Open Command Palette & Tool Search',
        actionLabel: 'Search',
        icon: Search,
      },
      {
        keys: ['?'],
        description: 'Show / Hide this Keyboard Shortcuts guide',
        actionLabel: 'Help',
        icon: Keyboard,
      },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectShortcut = (path?: string) => {
    if (path) {
      playPop();
      onNavigate(path);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              playPop();
              onClose();
            }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#F0F4F8] dark:bg-[#121A2A] rounded-3xl p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.8)_inset] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)_inset] border border-slate-200/80 dark:border-slate-800 z-10 space-y-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Press these keys anywhere to navigate instantly across PrivacyKit
                  </p>
                </div>
              </div>

              <button
                id="close-keyboard-shortcuts-modal"
                type="button"
                onClick={() => {
                  playPop();
                  onClose();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close shortcuts modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hint banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                Tip: Sequential shortcuts work by pressing <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono font-bold text-[11px] shadow-sm border border-indigo-200 dark:border-indigo-800">G</kbd> followed quickly by the second key (e.g. <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono font-bold text-[11px] shadow-sm border border-indigo-200 dark:border-indigo-800">P</kbd>).
              </span>
            </div>

            {/* Shortcut Groups */}
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {KEYBOARD_SHORTCUTS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                    {group.category}
                  </span>
                  <div className="space-y-1.5">
                    {group.items.map((item, iIdx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={iIdx}
                          onClick={() => handleSelectShortcut(item.path)}
                          onMouseEnter={playHover}
                          className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                            item.path
                              ? 'hover:bg-white/90 dark:hover:bg-[#1A2438] cursor-pointer group shadow-xs hover:shadow-sm'
                              : 'bg-white/40 dark:bg-slate-900/30'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {item.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.keys.map((k, kIdx) => (
                              <React.Fragment key={kIdx}>
                                <kbd className="min-w-[26px] h-7 px-2 flex items-center justify-center rounded-lg bg-white dark:bg-[#1C263A] text-slate-800 dark:text-slate-200 font-mono font-bold text-xs border border-slate-300/80 dark:border-slate-700/80 shadow-[0_2px_0_rgba(148,163,184,0.3)] dark:shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                                  {k}
                                </kbd>
                                {kIdx < item.keys.length - 1 && (
                                  <span className="text-[10px] text-slate-400 font-mono">then</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono font-bold border border-slate-300 dark:border-slate-700">ESC</kbd> to close</span>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  onClose();
                }}
                className="px-4 py-1.5 rounded-full clay-button-secondary text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
