import React from 'react';
import { motion } from 'motion/react';
import { Info, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface ScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showExplanation?: boolean;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  size = 'md',
  showLabel = true,
  showExplanation = false,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let statusText = 'Excellent';
  let colorClass = 'text-emerald-400';
  let strokeColor = '#10B981';
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let IconComponent = ShieldCheck;

  if (clampedScore < 40) {
    statusText = 'High Risk';
    colorClass = 'text-rose-400';
    strokeColor = '#F43F5E';
    glowColor = 'rgba(244, 63, 94, 0.4)';
    IconComponent = ShieldX;
  } else if (clampedScore < 70) {
    statusText = 'Needs Attention';
    colorClass = 'text-amber-400';
    strokeColor = '#F59E0B';
    glowColor = 'rgba(245, 158, 11, 0.4)';
    IconComponent = ShieldAlert;
  } else if (clampedScore < 90) {
    statusText = 'Good';
    colorClass = 'text-blue-400';
    strokeColor = '#38BDF8';
    glowColor = 'rgba(56, 189, 248, 0.4)';
    IconComponent = ShieldCheck;
  }

  // Radius & circumference for svg arc
  const radius = size === 'lg' ? 44 : size === 'md' ? 34 : 22;
  const strokeWidth = size === 'lg' ? 6.5 : size === 'md' ? 5 : 4;
  const dimension = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3.5">
        {/* SVG Circular Ring */}
        <div className="relative inline-flex items-center justify-center">
          <svg
            width={dimension}
            height={dimension}
            className="transform -rotate-90"
          >
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              className="stroke-slate-300/80 dark:stroke-slate-700/60"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <motion.circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${glowColor})`,
              }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span
              className={`font-extrabold font-mono tracking-tight ${
                size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-xs'
              } ${colorClass}`}
            >
              {clampedScore}
            </span>
            {size !== 'sm' && (
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono -mt-0.5">/100</span>
            )}
          </div>
        </div>

        {/* Labels */}
        {showLabel && (
          <div className="text-left space-y-0.5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Privacy Score
            </div>
            <div className={`text-sm sm:text-base font-extrabold flex items-center gap-1.5 ${colorClass}`}>
              <IconComponent className="w-4 h-4" />
              <span>{statusText}</span>
            </div>
          </div>
        )}
      </div>

      {showExplanation && (
        <div className="mt-3 text-center max-w-xs text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 clay-inset-card p-2.5">
          <Info className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
          <span>
            Privacy Score represents the amount and sensitivity of detected information.
          </span>
        </div>
      )}
    </div>
  );
};
