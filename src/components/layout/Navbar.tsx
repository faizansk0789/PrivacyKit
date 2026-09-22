import React, { useState } from 'react';
import {
  Shield,
  Home,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Menu,
  X,
  Keyboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  playPop,
  playHover,
  isSoundEnabled,
  toggleSound
} from '../../utils/soundEngine';
import { ThemeToggleSwitch } from '../common/ThemeToggleSwitch';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  isDark,
  onToggleTheme,
  onOpenShortcuts,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleNav = (path: string) => {
    playPop();
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'All Tools', path: '/tools' },
    { label: 'Checkup', path: '/privacy-checkup' },
    { label: 'Guides', path: '/learn' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full max-w-full px-3 sm:px-6 overflow-x-clip">
      {/* Floating Translucent Pill Dock */}
      <div className="rounded-full py-2.5 px-3.5 sm:px-6 clay-nav-dock mx-auto max-w-5xl flex items-center justify-between mt-3 sm:mt-4 transition-colors duration-300">
        {/* Left: Brand Logo */}
        <button
          onClick={() => handleNav('/')}
          onMouseEnter={playHover}
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[2px_4px_8px_rgba(99,102,241,0.35),inset_1px_1px_2px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            PrivacyKit
          </span>
        </button>

        {/* Center Links: Segmented navigation pills */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isAllTools = link.path === '/tools';
            const isActive = isAllTools
              ? currentPath === '/' || currentPath.startsWith('/tools')
              : currentPath.startsWith(link.path);

            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                onMouseEnter={playHover}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-200 border border-slate-200 dark:border-indigo-800/60 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          {/* Dashboard Link */}
          <button
            onClick={() => {
              playPop();
              handleNav('/dashboard');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentPath.startsWith('/dashboard')
                ? 'bg-slate-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-200 border border-slate-200 dark:border-indigo-800/60 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
            }`}
          >
            Dashboard
          </button>
        </nav>

        {/* Right: Quick action buttons & Toggles */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Single Round Shape Home Button */}
          <button
            id="nav-round-home-btn"
            onClick={() => handleNav('/')}
            onMouseEnter={playHover}
            title="Go to Home"
            aria-label="Go to Home"
            className={`w-8 h-8 rounded-full border shadow-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 ${
              currentPath === '/' || currentPath === ''
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)]'
                : 'bg-slate-100 dark:bg-[#1A2438] border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
          </button>

          {/* Floating Dark / Light Mode Toggle Switch */}
          <ThemeToggleSwitch
            isDark={isDark}
            onToggle={onToggleTheme}
            size="default"
          />

          {/* Keyboard Shortcuts Trigger Button */}
          {onOpenShortcuts && (
            <button
              id="shortcuts-toggle-btn"
              onClick={() => {
                playPop();
                onOpenShortcuts();
              }}
              onMouseEnter={playHover}
              title="Keyboard Shortcuts (?)"
              aria-label="View keyboard shortcuts"
              className="hidden sm:flex w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1A2438] border border-slate-200 dark:border-slate-700/60 shadow-xs items-center justify-center text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-slate-300 transition-all cursor-pointer shrink-0"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Audio toggle icon pod */}
          <button
            id="audio-toggle-btn"
            onClick={handleSoundToggle}
            onMouseEnter={playHover}
            title={soundOn ? 'Sound feedback ON' : 'Sound feedback MUTED'}
            aria-label={soundOn ? 'Sound feedback ON' : 'Sound feedback MUTED'}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1A2438] border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-slate-300 transition-all cursor-pointer shrink-0"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile Menu Toggle (Optimized Three Lines / Hamburger Button) */}
          <button
            id="mobile-menu-btn"
            onClick={() => {
              playPop();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            onMouseEnter={playHover}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className={`md:hidden w-8 h-8 rounded-full border shadow-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 ${
              mobileMenuOpen
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/70 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-[#1A2438] border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-slate-300'
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="md:hidden mt-2 mx-auto max-w-5xl rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 shadow-xl p-3 space-y-1 transition-colors duration-300"
          >
            <div className="flex flex-col space-y-1">
              <button
                key="home"
                onClick={() => handleNav('/')}
                className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentPath === '/' || currentPath === ''
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Home className="w-3 h-3" />
                  </span>
                  <span>Home</span>
                </div>
                {(currentPath === '/' || currentPath === '') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>

              {navLinks.map((link) => {
                const isAllTools = link.path === '/tools';
                const isActive = isAllTools
                  ? currentPath === '/' || currentPath.startsWith('/tools')
                  : currentPath.startsWith(link.path);

                return (
                  <button
                    key={link.path}
                    onClick={() => handleNav(link.path)}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  playPop();
                  handleNav('/dashboard');
                }}
                className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentPath.startsWith('/dashboard')
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>Dashboard</span>
              </button>

              {/* Mobile Theme Toggle Row */}
              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between px-3.5 py-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  {isDark ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  <span>Appearance</span>
                </span>
                <ThemeToggleSwitch
                  isDark={isDark}
                  onToggle={onToggleTheme}
                  size="sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

