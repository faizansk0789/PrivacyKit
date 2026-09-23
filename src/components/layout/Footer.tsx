import React from 'react';
import {
  Shield,
  ShieldCheck,
  Video,
  Upload,
  Globe,
  Anchor,
  Sparkles,
  FileText,
  MessageSquarePlus
} from 'lucide-react';
import { playPop } from '../../utils/soundEngine';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenFeedback }) => {
  return (
    <footer className="w-full clay-footer-plate p-8 sm:p-12 mt-20 text-slate-700 dark:text-slate-300">
      <div className="max-w-6xl mx-auto">
        {/* Top bar: Brand, mission, and Sandboxing Status */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-3 max-w-lg">
            <button
              onClick={() => {
                playPop();
                onNavigate('/');
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-2xl clay-icon-pod flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                PrivacyKit<span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">.in</span>
              </span>
            </button>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Client-side utilities engineered to inspect, scrub, and protect your digital privacy. All operations execute strictly within local memory. Zero server uploads.
            </p>
          </div>

          {/* Prominent sandboxing pill */}
          <div className="clay-card rounded-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-2.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
            <span>100% In-Browser Concave Sandboxing</span>
          </div>
        </div>

        {/* Structured Links: Three columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-slate-300/60 dark:border-slate-800">
          {/* Col 1: Tools */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              TOOLS
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => { playPop(); onNavigate('/tools/exif-remover'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Photo Privacy Inspector & Cleaner
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/tools/video-metadata-cleaner'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Video Metadata Inspector
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/tools/audio-metadata-cleaner'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Audio Metadata Cleaner
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/tools/pdf-metadata-cleaner'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  PDF Metadata Cleaner
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/tools/doc-metadata-cleaner'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Document Metadata Cleaner
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/tools/url-privacy-cleaner'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  URL Privacy Cleaner
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/tools/password-generator'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Password Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Resources */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              RESOURCES
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => { playPop(); onNavigate('/privacy-checkup'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Privacy Checkup Audit
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/learn'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Privacy Guides & Documentation
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/learn?article=exif-metadata'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  What is EXIF Metadata?
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/learn?article=url-tracking'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  URL Tracking Token Guide
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/dashboard'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Local Privacy Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Legal */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              COMPANY & LEGAL
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => { playPop(); onNavigate('/about'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  About PrivacyKit
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/privacy'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/terms'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => { playPop(); onNavigate('/privacy#cookies'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  Cookie Policy
                </button>
              </li>
              {onOpenFeedback && (
                <li>
                  <button
                    onClick={() => {
                      playPop();
                      onOpenFeedback();
                    }}
                    className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors text-left cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Send Feedback</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Action Dock */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              ACTION DOCK
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Tactile toggles for quick file staging, media analysis, and network security inspection.
            </p>
            {/* Horizontal dock of circular embossed utility toggle buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { playPop(); onNavigate('/tools/video-metadata-cleaner'); }}
                title="Video Inspector"
                className="w-10 h-10 rounded-full clay-circle-btn flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => { playPop(); onNavigate('/tools/exif-remover'); }}
                title="Quick File Upload"
                className="w-10 h-10 rounded-full clay-circle-btn flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={() => { playPop(); onNavigate('/tools/url-privacy-cleaner'); }}
                title="Link Security"
                className="w-10 h-10 rounded-full clay-circle-btn flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => { playPop(); onNavigate('/privacy-checkup'); }}
                title="Security Anchor"
                className="w-10 h-10 rounded-full clay-circle-btn flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Anchor className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Metadata: Copyright, security architecture links, and quick utility links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <p>© 2026 PrivacyKit. Built with privacy in mind.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero logs of uploaded file content</span>
            </span>
            <button
              onClick={() => { playPop(); onNavigate('/about'); }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Security Architecture
            </button>
            {onOpenFeedback && (
              <button
                onClick={() => { playPop(); onOpenFeedback(); }}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-500" />
                <span>Send Feedback</span>
              </button>
            )}
            <button
              onClick={() => { playPop(); onNavigate('/learn?article=exif-metadata'); }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>summarise page</span>
            </button>
            <button
              onClick={() => { playPop(); onNavigate('/privacy-checkup'); }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>ask gemini</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

