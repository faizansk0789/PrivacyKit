import React from 'react';
import { motion } from 'motion/react';

export const CinematicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]/70 dark:from-[#0B0F19] dark:via-[#0F1626] dark:to-[#0B0F19] transition-colors duration-150">
      {/* Top Ambient Bloom */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40 transition-opacity duration-150"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.10), transparent 70%)',
        }}
      />

      {/* Gentle ambient light floats */}
      <motion.div
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -15, 20, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-200/25 dark:bg-indigo-600/10 blur-[120px] transition-colors duration-150"
      />

      <motion.div
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 25, -20, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full bg-violet-200/25 dark:bg-violet-600/10 blur-[130px] transition-colors duration-150"
      />

      {/* Subtle tactile grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] transition-opacity duration-150"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  );
};

