import React from 'react';
import { motion } from 'motion/react';

export const CinematicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#EDF2F8] dark:bg-[#0B0F19] transition-colors duration-200">
      {/* 
        Soft Multi-Layered Purple & Lavender Patch Gradients 
        Matches the ethereal clay/neomorphic glow from the reference image.
      */}

      {/* Top Left Organic Purple Glow (Visible under navbar brand & pill dock) */}
      <div 
        className="absolute -top-16 -left-20 w-[420px] sm:w-[540px] h-[420px] sm:h-[540px] rounded-full opacity-70 dark:opacity-25 blur-[90px] sm:blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.45) 0%, rgba(192, 132, 252, 0.28) 45%, rgba(224, 231, 255, 0.1) 75%, transparent 100%)',
        }}
      />

      {/* Top Right Ethereal Lavender Patch */}
      <div 
        className="absolute -top-24 -right-16 w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full opacity-65 dark:opacity-25 blur-[100px] sm:blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(192, 132, 252, 0.50) 0%, rgba(216, 180, 254, 0.32) 40%, rgba(243, 232, 255, 0.15) 70%, transparent 100%)',
        }}
      />

      {/* Subtle Floating Organic Rings & Soft Orb Highlights matching the screenshot */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 dark:opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="softRingGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#A855F7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="linearCurveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#C084FC" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E9D5FF" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Ambient decorative orbital curves like the screenshot's soft radial contours */}
        <circle cx="10%" cy="18%" r="220" fill="url(#softRingGlow)" filter="blur(40px)" />
        <circle cx="95%" cy="26%" r="280" fill="url(#softRingGlow)" filter="blur(55px)" />
        
        {/* Soft curving wave line contours in the background */}
        <path
          d="M -100 280 C 150 180, 320 380, 600 240 C 850 120, 1100 260, 1400 180"
          stroke="url(#linearCurveGlow)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M -50 480 C 200 420, 400 620, 750 490 C 1050 380, 1250 560, 1500 440"
          stroke="url(#linearCurveGlow)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
        />
      </svg>

      {/* Mid Left Soft Purple Ambient Cloud (Behind Search and Filter Buttons) */}
      <motion.div
        animate={{
          x: [0, 15, -10, 0],
          y: [0, -12, 16, 0],
          scale: [1, 1.05, 0.96, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[280px] sm:top-[220px] -left-28 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] rounded-full opacity-60 dark:opacity-20 blur-[85px] sm:blur-[115px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.38) 0%, rgba(192, 132, 252, 0.22) 50%, transparent 80%)',
        }}
      />

      {/* Mid Right Soft Lavender & Violet Cloud */}
      <motion.div
        animate={{
          x: [0, -18, 12, 0],
          y: [0, 18, -14, 0],
          scale: [1, 1.06, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-[340px] sm:top-[290px] -right-24 w-[420px] sm:w-[520px] h-[420px] sm:h-[520px] rounded-full opacity-65 dark:opacity-22 blur-[95px] sm:blur-[125px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(192, 132, 252, 0.42) 0%, rgba(216, 180, 254, 0.25) 55%, transparent 85%)',
        }}
      />

      {/* Lower Center Accent Lavender Bloom (illuminating bottom tool cards) */}
      <div 
        className="absolute top-[750px] left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[450px] sm:h-[600px] rounded-full opacity-45 dark:opacity-15 blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.25) 0%, rgba(216, 180, 254, 0.15) 50%, transparent 80%)',
        }}
      />

      {/* Ultra-faint tactile texture for clay physical feel */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#7C3AED 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};


