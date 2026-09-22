import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CommandPalette } from './components/common/CommandPalette';
import { CinematicBackground } from './components/common/CinematicBackground';
import { PageProgressBar } from './components/common/PageProgressBar';
import { RoundHomeButton } from './components/common/RoundHomeButton';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { FeedbackModal } from './components/common/FeedbackModal';

import { HomeView } from './views/HomeView';
import { PrivacyCheckupView } from './views/PrivacyCheckupView';
import { ExifRemoverView } from './views/ExifRemoverView';
import { PdfCleanerView } from './views/PdfCleanerView';
import { DocCleanerView } from './views/DocCleanerView';
import { UrlCleanerView } from './views/UrlCleanerView';
import { PasswordGenView } from './views/PasswordGenView';
import { ToolsDirectoryView } from './views/ToolsDirectoryView';
import { AudioCleanerView } from './views/AudioCleanerView';
import { VideoCleanerView } from './views/VideoCleanerView';
import { DashboardView } from './views/DashboardView';
import { LearnView } from './views/LearnView';
import { AboutView } from './views/AboutView';
import { LegalView } from './views/LegalView';

import { playPop } from './utils/soundEngine';

// Ensures instant scroll reset to top at mount time before paint, preventing transition jumping
const ScrollToTopOnMount: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  return null;
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('privacykit_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Global key listener for search, shortcuts guide, and quick navigation to common tools
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when typing in inputs, textareas, or contentEditable elements
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox');

      // Command palette: ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // If user is currently typing in an input field, do not trigger single/chord hotkeys
      if (isInputFocused) {
        return;
      }

      // Open shortcuts modal with "?"
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        playPop();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Sequential 2-key navigation: 'g' then <key> (within 1200ms)
      const now = Date.now();
      const key = e.key.toLowerCase();

      if (lastKey === 'g' && now - lastKeyTime < 1200) {
        let destination: string | null = null;

        switch (key) {
          case 'p':
            destination = '/tools/password-generator';
            break;
          case 'e':
            destination = '/tools/exif-remover';
            break;
          case 'd':
            destination = '/tools/pdf-metadata-cleaner';
            break;
          case 'o':
            destination = '/tools/doc-metadata-cleaner';
            break;
          case 'u':
            destination = '/tools/url-privacy-cleaner';
            break;
          case 'c':
            destination = '/privacy-checkup';
            break;
          case 'h':
            destination = '/';
            break;
          case 't':
            destination = '/tools';
            break;
          default:
            destination = null;
        }

        if (destination) {
          e.preventDefault();
          playPop();
          handleNavigate(destination);
          lastKey = '';
          return;
        }
      }

      // Track 'g' key stroke start
      if (key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        lastKey = 'g';
        lastKeyTime = now;
        return;
      }

      // Reset sequence tracker if another key was pressed
      lastKey = '';
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('privacykit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('privacykit_theme', 'light');
    }
  }, [isDark]);

  const handleNavigate = (path: string) => {
    if (path.startsWith('/#')) {
      const id = path.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      path = '/';
    }

    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  const toggleTheme = () => {
    playPop();
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('privacykit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('privacykit_theme', 'light');
    }
    setIsDark(nextDark);
  };

  // Return view node based on route
  const getViewNode = (path: string) => {
    if (path === '/' || path === '') {
      return <HomeView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/privacy-checkup')) {
      return <PrivacyCheckupView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/tools/exif-remover')) {
      return <ExifRemoverView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/tools/pdf-metadata-cleaner')) {
      return <PdfCleanerView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/tools/doc-metadata-cleaner')) {
      return <DocCleanerView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/tools/url-privacy-cleaner')) {
      return <UrlCleanerView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/tools/audio-metadata-cleaner')) {
      return <AudioCleanerView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/tools/video-metadata-cleaner')) {
      return <VideoCleanerView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/tools/password-generator')) {
      return <PasswordGenView onNavigate={handleNavigate} />;
    } else if (path === '/tools' || path.startsWith('/tools?') || path.startsWith('/pricing')) {
      return <ToolsDirectoryView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/dashboard')) {
      return <DashboardView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/learn')) {
      return <LearnView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/about')) {
      return <AboutView onNavigate={handleNavigate} />;
    } else if (path.startsWith('/privacy')) {
      return <LegalView type="privacy" />;
    } else if (path.startsWith('/terms')) {
      return <LegalView type="terms" />;
    } else {
      return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EBF0F5] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-950 dark:selection:text-indigo-200 relative transition-colors duration-150">
      {/* Dynamic Route Progress Indicator */}
      <PageProgressBar currentPath={currentPath} />

      {/* Cinematic Ambient Nebula Lights */}
      <CinematicBackground />

      {/* Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Content View with Seamless Transitions */}
      <main className="flex-1 w-full relative z-10 flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1], // Smooth spring-like curve
            }}
            className="w-full flex-1 flex flex-col min-h-[calc(100vh-140px)]"
          >
            <ScrollToTopOnMount />
            {getViewNode(currentPath)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Single Round Shape Floating Home Button */}
      <RoundHomeButton
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />

      {/* Keyboard Shortcuts Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Feedback & Tool Suggestion Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
