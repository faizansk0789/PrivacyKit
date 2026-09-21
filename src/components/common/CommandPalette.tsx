import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldAlert, Eye, ImageMinus, FileText, FileSpreadsheet, Link2Off, KeyRound, Sparkles, X, ArrowRight } from 'lucide-react';
import { TOOLS_CATALOG } from '../../utils/sampleData';
import { ToolDefinition } from '../../types';
import { useBouncyAnimation, useBouncyBackdropAnimation } from '../../hooks/useBouncyAnimation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const modalAnimation = useBouncyAnimation({ type: 'snappy', direction: 'down', distance: 16, enableHover: false });
  const backdropAnimation = useBouncyBackdropAnimation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredTools = TOOLS_CATALOG.filter((tool) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-indigo-400" />;
      case 'Eye': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'ImageMinus': return <ImageMinus className="w-4 h-4 text-emerald-400" />;
      case 'FileText': return <FileText className="w-4 h-4 text-rose-400" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
      case 'Link2Off': return <Link2Off className="w-4 h-4 text-cyan-400" />;
      case 'KeyRound': return <KeyRound className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const handleSelect = (tool: ToolDefinition) => {
    onNavigate(tool.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cmd-palette-backdrop"
          initial={backdropAnimation.initial}
          animate={backdropAnimation.animate}
          exit={backdropAnimation.exit}
          transition={backdropAnimation.transition}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            key="cmd-palette-dialog"
            initial={modalAnimation.initial}
            animate={modalAnimation.animate}
            exit={modalAnimation.exit}
            transition={modalAnimation.transition}
            className="w-full max-w-xl bg-[#EDF2F7] dark:bg-[#151D2E] border border-slate-300/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col clay-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-slate-300/80 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search privacy tools or actions (e.g. 'Remove GPS', 'Clean PDF')..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none font-medium"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredTools.length === 0 ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No matching tools found for "{query}".
                </div>
              ) : (
                filteredTools.map((tool, idx) => (
                  <div
                    key={tool.id}
                    onClick={() => handleSelect(tool)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      selectedIndex === idx
                        ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-900 dark:text-white'
                        : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg clay-icon-pod flex items-center justify-center shrink-0">
                        {getIcon(tool.iconName)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{tool.name}</span>
                          {tool.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.shortDesc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>

            {/* Quick shortcut bar */}
            <div className="px-4 py-2.5 bg-slate-200/50 dark:bg-slate-950/80 border-t border-slate-300/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Navigation:</span>
                <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 shadow-xs">↑↓</span>
                <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 shadow-xs">Enter</span>
                <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 shadow-xs">Esc</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                100% In-Browser Execution
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
