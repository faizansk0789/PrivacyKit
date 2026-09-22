import React from 'react';
import { Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playPop, playHover } from '../../utils/soundEngine';

interface RoundHomeButtonProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export const RoundHomeButton: React.FC<RoundHomeButtonProps> = ({
  currentPath,
  onNavigate,
  className = '',
}) => {
  const isHome = currentPath === '/' || currentPath === '';

  const handleClick = () => {
    playPop();
    onNavigate('/');
  };

  return (
    <AnimatePresence>
      {!isHome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed bottom-6 right-6 z-40 ${className}`}
        >
          <button
            id="floating-round-home-btn"
            type="button"
            onClick={handleClick}
            onMouseEnter={playHover}
            title="Go to Home"
            aria-label="Redirect to Home page"
            className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-white dark:bg-[#1A2438] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-indigo-900/60 shadow-[0_10px_25px_-4px_rgba(15,23,42,0.18),0_4px_10px_-2px_rgba(15,23,42,0.1),inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-[0_14px_30px_-4px_rgba(0,0,0,0.7),0_4px_12px_rgba(99,102,241,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:scale-108 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            {/* Ambient subtle glow ring on hover */}
            <span className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Home Icon */}
            <Home className="w-5.5 h-5.5 transition-transform duration-200 group-hover:-translate-y-0.5" />

            {/* Tooltip on hover */}
            <span className="absolute bottom-full mb-2.5 right-0 px-2.5 py-1 rounded-lg bg-slate-900/95 dark:bg-slate-800 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 transform translate-y-1 group-hover:translate-y-0">
              Go to Home
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
