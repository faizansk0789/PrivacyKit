import React, { useState } from 'react';
import {
  BookOpen,
  MapPin,
  Camera,
  Link2,
  FileText,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { playPop, playHover } from '../utils/soundEngine';

interface LearnViewProps {
  onNavigate: (path: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onNavigate }) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const articles = [
    {
      id: 'exif-metadata',
      title: 'What is EXIF Metadata and Why Does it Matter?',
      category: 'Images & Photos',
      readTime: '4 min read',
      icon: Camera,
      excerpt: 'Exchangeable Image File Format (EXIF) is the silent metadata standard embedded into digital photographs by cameras and smartphones.',
      content: `
        ### The Invisible Fingerprint in Your Photos

        Every time you capture a photo with your iPhone, Android, or DSLR, your device embeds a wealth of auxiliary data alongside the pixel colors. Known as **EXIF (Exchangeable Image File Format)**, this header contains:

        - **Precise GPS Coordinates**: Latitude, longitude, altitude, and heading angle accurate to within meters.
        - **Hardware Identifiers**: Camera model, lens serial number, and firmware version.
        - **Capture Timestamps**: Exact date, millisecond timestamp, and UTC timezone offset.
        - **Technical Parameters**: Aperture, shutter speed, ISO level, and focal depth.

        ### Why EXIF Leaks Pose Privacy Hazards

        When you post an uncleaned photo to a private chat, discussion forum, or marketplace listing, anyone who downloads the original file can extract your home address or daily routines.

        ### How PrivacyKit Protects You

        PrivacyKit reconstructs image bitmaps in ephemeral browser canvas buffers and re-encodes the clean pixels without metadata blocks. The result is a photo that looks 100% identical but contains zero location or device identifiers.
      `,
      actionTool: { label: 'Try EXIF Remover', path: '/tools/exif-remover' }
    },
    {
      id: 'url-tracking',
      title: 'How URL Click IDs and UTM Trackers Follow You Online',
      category: 'Web & Links',
      readTime: '5 min read',
      icon: Link2,
      excerpt: 'Parameters like fbclid, gclid, and utm_source link your social media account to every third-party site you visit.',
      content: `
        ### Cross-Site Tracking via URL Query Strings

        Have you ever noticed links turning into paragraphs of illegible gibberish after clicking a Facebook, Instagram, or Google ad?

        For example:
        \`https://store.com/item?fbclid=IwAR2...&utm_source=meta&utm_medium=paid\`

        ### What Click IDs Do
        - **\`fbclid\` (Facebook Click ID)**: A unique hexadecimal token generated specifically for your click, linking your Meta profile to the advertiser's analytics pixel.
        - **\`gclid\` (Google Click ID)**: Google Ads attribution identifier used to correlate ad clicks with checkout conversions.
        - **\`ttclid\` (TikTok Click ID)**: ByteDance attribution token for short-form video referrals.

        ### Why Strip Them Before Sharing
        When you forward a tracking link to friends in WhatsApp, Telegram, or Discord, that click identifier continues to associate their activity with your original identity hash.
      `,
      actionTool: { label: 'Clean Tracking URLs', path: '/tools/url-privacy-cleaner' }
    },
    {
      id: 'pdf-document-privacy',
      title: 'The Hidden Information in Corporate PDFs and Office Documents',
      category: 'Documents',
      readTime: '3 min read',
      icon: FileText,
      excerpt: 'PDFs and Word documents often retain company names, internal network paths, and previous contributor names.',
      content: `
        ### Document Properties You Forgot Were Embedded

        When sharing resumes, proposals, or research papers, Office files (.docx, .xlsx, .pptx) and PDFs preserve:
        - **Author and Contributor Usernames**: Often matching employee usernames or local machine login IDs.
        - **Enterprise Company Fields**: Registered company metadata and manager names.
        - **Total Editing Time & Revision Number**: Revealing how long was spent drafting the document.
        - **Printer & PDF Engine Signatures**: Identifying internal network tools.

        ### Browser-Safe Scrubbing
        PrivacyKit manipulates the XML properties tree directly in client-side memory to purge all author traces while maintaining formatting.
      `,
      actionTool: { label: 'Scrub Document Metadata', path: '/tools/doc-metadata-cleaner' }
    },
    {
      id: 'passphrase-entropy',
      title: 'Diceware Passphrases vs. Complex Random Passwords',
      category: 'Security',
      readTime: '4 min read',
      icon: KeyRound,
      excerpt: 'Why 4 random dictionary words are often more secure and far easier to type than "P@$$w0rd!#9".',
      content: `
        ### The Math of Password Entropy

        Entropy measures the unpredictability of a password in bits. A 4-word Diceware passphrase selected from a wordlist of 7,776 words provides approximately **52 bits of entropy** (over 450 trillion possibilities).

        ### Why Passphrases Win
        1. **Human Memory**: Sentences of distinct concepts (e.g. \`Velvet-Canyon-Timber-Falcon\`) are easy to visualize and remember.
        2. **Mobile Typing**: No frustrating switches between symbol and number keypads on touchscreens.
        3. **Brute Force Resistance**: Modern GPU hash crackers struggle heavily with word length combinations.
      `,
      actionTool: { label: 'Generate Passphrase', path: '/tools/password-generator' }
    }
  ];

  const activeArticle = articles.find((a) => a.id === selectedArticleId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Privacy Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Learn How Digital Privacy Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Short, practical guides to understanding metadata leakage, cross-site trackers, and local-first data protection.
        </p>
      </div>

      {/* Article Detail View or Grid */}
      {activeArticle ? (
        <div className="clay-card p-6 sm:p-10 space-y-8 animate-fadeIn">
          <button
            onClick={() => {
              playPop();
              setSelectedArticleId(null);
            }}
            onMouseEnter={playHover}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
          >
            ← Back to all guides
          </button>

          <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {activeArticle.category} • {activeArticle.readTime}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {activeArticle.title}
            </h2>
          </div>

          <div className="max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4">
            {activeArticle.content.split('\n\n').map((para, idx) => {
              if (para.trim().startsWith('###')) {
                return (
                  <h3 key={idx} className="text-lg font-bold text-slate-900 dark:text-white pt-4">
                    {para.replace('###', '').trim()}
                  </h3>
                );
              }
              if (para.trim().startsWith('-')) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    {para
                      .split('\n')
                      .filter((l) => l.trim().startsWith('-'))
                      .map((item, i) => (
                        <li key={i}>{item.replace('-', '').trim()}</li>
                      ))}
                  </ul>
                );
              }
              return <p key={idx}>{para.trim()}</p>;
            })}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                playPop();
                setSelectedArticleId(null);
              }}
              onMouseEnter={playHover}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              ← Back to articles
            </button>

            {activeArticle.actionTool && (
              <button
                onClick={() => {
                  playPop();
                  onNavigate(activeArticle.actionTool.path);
                }}
                onMouseEnter={playHover}
                className="px-5 py-2.5 rounded-full clay-button-pro font-bold text-xs flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>{activeArticle.actionTool.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => {
            const Icon = art.icon;
            return (
              <div
                key={art.id}
                onClick={() => {
                  playPop();
                  setSelectedArticleId(art.id);
                }}
                onMouseEnter={playHover}
                className="group clay-card p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:scale-[1.01]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-[16px] clay-icon-pod text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">{art.readTime}</span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {art.category}
                  </span>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Read Guide</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
