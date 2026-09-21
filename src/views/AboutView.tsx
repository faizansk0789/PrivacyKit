import React from 'react';
import {
  Shield,
  Lock,
  Zap,
  Globe,
  CheckCircle2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { TrustBadge } from '../components/common/TrustBadge';
import { playPop, playHover } from '../utils/soundEngine';

interface AboutViewProps {
  onNavigate: (path: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-bold shadow-sm">
          <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Our Mission & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy is not a setting. <br className="hidden sm:inline" />
          It is an architecture.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          PrivacyKit was engineered around a single fundamental conviction: your private documents, photographs, and web links should never leave your physical computer just to be inspected or cleaned.
        </p>
      </div>

      {/* Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-3.5">
          <div className="w-12 h-12 rounded-2xl clay-icon-pod text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero Server Ingestion</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Unlike traditional online file converters that upload your PDFs and photos to cloud storage buckets, PrivacyKit runs entirely in browser memory.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-3.5">
          <div className="w-12 h-12 rounded-2xl clay-icon-pod text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Client-Side Engines</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We utilize native Web APIs (Canvas, ArrayBuffers, JSZip, and WebAssembly) to parse binary file headers and sanitize data locally on your CPU.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-3.5">
          <div className="w-12 h-12 rounded-2xl clay-icon-pod text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Radical Transparency</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We explicitly label any technical limitations and never make unsubstantiated claims. If a tool processes data locally, you can verify it in your browser's Network tab.
          </p>
        </div>
      </div>

      {/* Technical Architecture Deep Dive */}
      <div className="clay-card rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          How Browser-Side Sanitization Operates
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            When you drag a file into PrivacyKit, the browser's <code className="text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg font-bold">FileReader API</code> creates an isolated in-memory ArrayBuffer.
          </p>
          <p>
            For photos, EXIF tags are parsed byte-by-byte. When stripping is requested, pixels are rendered to an off-screen HTML5 Canvas surface and exported directly to a sanitized Blob, completely discarding all proprietary vendor and GPS blocks.
          </p>
          <p>
            For documents, the ZIP archive is uncompressed in RAM, the <code className="text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg font-bold">docProps/core.xml</code> tree is cleansed of author tags, and the container is immediately reassembled for download.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              playPop();
              onNavigate('/privacy-checkup');
            }}
            onMouseEnter={playHover}
            className="px-6 py-3 rounded-full clay-button-pro font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Try Privacy Checkup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              playPop();
              onNavigate('/learn');
            }}
            onMouseEnter={playHover}
            className="px-5 py-3 rounded-full clay-pill-inactive text-xs font-bold cursor-pointer"
          >
            Read Privacy Guides
          </button>
        </div>
      </div>
    </div>
  );
};
