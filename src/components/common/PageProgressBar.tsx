import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PageProgressBarProps {
  currentPath: string;
}

/**
 * High-performance, glowing micro progress bar that zips across
 * the top of the viewport during route transitions, delivering
 * instant tactile feedback and seamless navigation flow.
 */
export const PageProgressBar: React.FC<PageProgressBarProps> = ({ currentPath }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    setProgress(20);

    const step1 = window.setTimeout(() => {
      setProgress(70);
    }, 50);

    const step2 = window.setTimeout(() => {
      setProgress(100);
    }, 180);

    const step3 = window.setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 360);

    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(step3);
    };
  }, [currentPath]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="page-transition-progress-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 h-[2.5px] z-[99999] pointer-events-none overflow-hidden"
        >
          {/* Radiant Neon Gradient Stream */}
          <motion.div
            id="page-transition-progress-bar"
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.9),0_0_4px_rgba(168,85,247,0.7)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: progress === 100 ? 0.16 : 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
