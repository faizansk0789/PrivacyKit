import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Camera,
  User,
  ShieldCheck,
  Check,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { playPop, playSuccess } from '../../utils/soundEngine';

interface InteractiveHeroCardProps {
  onExploreCheckup?: () => void;
}

export const InteractiveHeroCard: React.FC<InteractiveHeroCardProps> = ({ onExploreCheckup }) => {
  const [isCleaned, setIsCleaned] = useState(false);

  const handleClean = () => {
    setIsCleaned(true);
    playSuccess();
  };

  const handleReset = () => {
    setIsCleaned(false);
    playPop();
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-[#0D1224] border border-slate-800 p-6 shadow-2xl space-y-5">
      {/* File Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
            JPG
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">vacation_photo.jpg</h4>
            <p className="text-[11px] text-slate-400">2.4 MB • 4032 × 3024</p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isCleaned
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isCleaned ? '100% Clean' : '3 Risks Found'}
          </span>
        </div>
      </div>

      {/* Metadata Items */}
      <div className="space-y-2 text-xs">
        {/* GPS */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className={`w-4 h-4 ${isCleaned ? 'text-slate-500' : 'text-rose-400'}`} />
            <span className="text-slate-300 font-medium">GPS Coordinates</span>
          </div>
          <span className={`font-mono text-[11px] ${isCleaned ? 'text-slate-500 line-through' : 'text-rose-300'}`}>
            {isCleaned ? 'Stripped' : '37.7749° N, 122.4194° W'}
          </span>
        </div>

        {/* Camera Device */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className={`w-4 h-4 ${isCleaned ? 'text-slate-500' : 'text-amber-400'}`} />
            <span className="text-slate-300 font-medium">Device Info</span>
          </div>
          <span className={`font-mono text-[11px] ${isCleaned ? 'text-slate-500 line-through' : 'text-amber-300'}`}>
            {isCleaned ? 'Stripped' : 'iPhone 15 Pro • iOS 17.4'}
          </span>
        </div>

        {/* User / Timestamp */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className={`w-4 h-4 ${isCleaned ? 'text-slate-500' : 'text-indigo-400'}`} />
            <span className="text-slate-300 font-medium">Original Author</span>
          </div>
          <span className={`font-mono text-[11px] ${isCleaned ? 'text-slate-500 line-through' : 'text-indigo-300'}`}>
            {isCleaned ? 'Stripped' : 'Faizan (Owner)'}
          </span>
        </div>
      </div>

      {/* Action button */}
      <div className="pt-1">
        {!isCleaned ? (
          <button
            onClick={handleClean}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clean All Metadata (Demo)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Sanitized & Ready</span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
