import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { playPop, playHover } from '../../utils/soundEngine';

interface ThemeToggleSwitchProps {
  isDark: boolean;
  onToggle: () => void;
  size?: 'default' | 'sm';
  className?: string;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  isDark,
  onToggle,
  size = 'default',
  className = '',
}) => {
  const isSm = size === 'sm';
  const trackWidth = isSm ? 48 : 56;
  const trackHeight = isSm ? 26 : 30;
  const knobSize = isSm ? 20 : 22;
  const travelDistance = isSm ? 22 : 26;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPop();
    onToggle();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      playPop();
      onToggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      id="theme-toggle-switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Currently Dark Mode (click for Light)' : 'Currently Light Mode (click for Dark)'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={playHover}
      style={{
        width: `${trackWidth}px`,
        height: `${trackHeight}px`,
      }}
      className={`relative inline-flex items-center rounded-full cursor-pointer select-none transition-all duration-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shrink-0 ${
        isDark
          ? 'bg-slate-900/90 border border-indigo-900/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.7),0_2px_6px_rgba(0,0,0,0.25)] hover:border-indigo-700/80 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7),0_0_12px_rgba(99,102,241,0.25)]'
          : 'bg-slate-200/90 border border-slate-300/90 shadow-[inset_0_2px_4px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)] hover:border-slate-400/90 hover:shadow-[inset_0_2px_4px_rgba(15,23,42,0.08),0_0_10px_rgba(245,158,11,0.2)]'
      } ${className}`}
    >
      {/* Background ambient symbols inside track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none overflow-hidden rounded-full">
        {/* Sun indicator on the left */}
        <span
          className={`flex items-center justify-center transition-all duration-300 ${
            isDark
              ? 'opacity-25 scale-75 text-slate-500'
              : 'opacity-90 scale-90 text-amber-500'
          }`}
        >
          <Sun className="w-3 h-3" />
        </span>

        {/* Moon indicator on the right */}
        <span
          className={`flex items-center justify-center transition-all duration-300 ${
            isDark
              ? 'opacity-90 scale-90 text-indigo-300'
              : 'opacity-25 scale-75 text-slate-400'
          }`}
        >
          <Moon className="w-3 h-3" />
        </span>
      </div>

      {/* Floating Animated Sliding Thumb / Knob */}
      <motion.div
        className={`relative z-10 flex items-center justify-center rounded-full transition-shadow duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.55),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-indigo-400/40'
            : 'bg-white text-amber-500 shadow-[0_2px_6px_rgba(15,23,42,0.18),0_1px_2px_rgba(15,23,42,0.08),inset_0_1px_1px_#ffffff] border border-slate-200/80'
        }`}
        style={{
          width: `${knobSize}px`,
          height: `${knobSize}px`,
        }}
        initial={false}
        animate={{
          x: isDark ? travelDistance : (isSm ? 3 : 4),
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.8,
        }}
        whileTap={{ scale: 0.92 }}
      >
        {/* Animated icon inside knob that spins and scales on toggle */}
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: isDark ? -90 : 90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: isDark ? 90 : -90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex items-center justify-center pointer-events-none"
        >
          {isDark ? (
            <Moon className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-200 fill-amber-200`} />
          ) : (
            <Sun className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-500 fill-amber-400`} />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
};
