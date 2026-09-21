import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';

interface TrustBadgeProps {
  type?: 'local' | 'server';
  className?: string;
  showExplanation?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  type = 'local',
  className = '',
  showExplanation = false,
}) => {
  if (type === 'local') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Processed locally on your device</span>
        </span>
        {showExplanation && (
          <span className="text-emerald-800/80 dark:text-emerald-400/80 border-l border-emerald-500/30 pl-1.5 ml-0.5" title="No file data is uploaded to remote servers. All parsing and metadata sanitization runs inside your browser sandbox.">
            100% In-Browser
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-400 ${className}`}>
      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
      <span className="flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Server processing required</span>
      </span>
    </div>
  );
};
