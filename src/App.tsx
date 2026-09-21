import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CommandPalette } from './components/common/CommandPalette';
import { AuthModal } from './components/common/AuthModal';
import { CinematicBackground } from './components/common/CinematicBackground';
import { PageProgressBar } from './components/common/PageProgressBar';

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

import { getUserAccount } from './utils/storage';
import { UserAccount } from './types';
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [account, setAccount] = useState<UserAccount>(getUserAccount());

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
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

  const handleOpenAuth = (mode?: 'signin' | 'signup') => {
    setAuthMode(mode || 'signin');
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (newAcc: UserAccount) => {
    setAccount(newAcc);
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
      return <DashboardView onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} account={account} />;
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
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[#EBF0F5] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-950 dark:selection:text-indigo-200 relative transition-colors duration-150">
      {/* Dynamic Route Progress Indicator */}
      <PageProgressBar currentPath={currentPath} />

      {/* Cinematic Ambient Nebula Lights */}
      <CinematicBackground />

      {/* Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={handleOpenAuth}
        account={account}
        isDark={isDark}
        onToggleTheme={toggleTheme}
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
      <Footer onNavigate={handleNavigate} />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Auth / Pro Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        onAccountUpdated={handleAuthSuccess}
      />
    </div>
  );
}
