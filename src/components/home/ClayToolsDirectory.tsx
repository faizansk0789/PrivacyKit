import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Eye,
  Film,
  Music,
  FileText,
  Layers,
  Link2Off,
  KeyRound,
  Lock,
  UserCheck,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import { playPop, playHover, playClayCardHover } from '../../utils/soundEngine';
import { FileTypeIcon } from '../common/FileTypeIcon';

interface ClayToolsDirectoryProps {
  onNavigate: (path: string) => void;
}

export interface ClayToolItem {
  id: string;
  name: string;
  summary: string;
  desc: string;
  format: string;
  path: string;
  categories: Array<'Privacy Checkup' | 'Media' | 'Links' | 'Security'>;
  icon: React.ComponentType<{ className?: string }>;
  fileType: 'pdf' | 'jpg' | 'docx' | 'mp4' | 'mp3' | 'url' | 'key' | 'shield';
}

export const CLAY_TOOLS: ClayToolItem[] = [
  {
    id: 'exif-remover',
    name: 'Photo Privacy Inspector & Cleaner',
    summary: 'EXIF, GPS, camera specs scrubber',
    desc: 'Inspect and strip GPS coordinates, camera specs, device serials, and timestamps from photos before sharing.',
    format: 'JPG, JPEG, PNG',
    path: '/tools/exif-remover',
    categories: ['Privacy Checkup', 'Media'],
    icon: Eye,
    fileType: 'jpg',
  },
  {
    id: 'video-metadata-cleaner',
    name: 'Video Metadata Inspector',
    summary: 'MP4, MOV tracking data inspector',
    desc: 'Inspect and scrub user data (UDTA), GPS coordinates, creation timestamps, and device tracking tokens from videos.',
    format: 'MP4, MOV',
    path: '/tools/video-metadata-cleaner',
    categories: ['Privacy Checkup', 'Media'],
    icon: Film,
    fileType: 'mp4',
  },
  {
    id: 'audio-metadata-cleaner',
    name: 'Audio Metadata Cleaner',
    summary: 'ID3 tags and hidden metadata remover',
    desc: 'Purge ID3v1 and ID3v2 tags, embedded album artwork, comments, and artist hardware markers from MP3 audio.',
    format: 'MP3',
    path: '/tools/audio-metadata-cleaner',
    categories: ['Media'],
    icon: Music,
    fileType: 'mp3',
  },
  {
    id: 'pdf-metadata-cleaner',
    name: 'PDF Metadata Cleaner',
    summary: 'author, software, creation timestamp scrubber',
    desc: 'Scrub author names, software producers, creation timestamps, and revision tracking from PDF documents.',
    format: 'PDF',
    path: '/tools/pdf-metadata-cleaner',
    categories: ['Privacy Checkup'],
    icon: FileText,
    fileType: 'pdf',
  },
  {
    id: 'doc-metadata-cleaner',
    name: 'Document Metadata Cleaner',
    summary: 'DOCX, XLSX, PPTX scrubber',
    desc: 'Strip author identities, last modified timestamps, template paths, and revision histories from Office documents.',
    format: 'DOCX, XLSX, PPTX',
    path: '/tools/doc-metadata-cleaner',
    categories: ['Privacy Checkup'],
    icon: Layers,
    fileType: 'docx',
  },
  {
    id: 'url-privacy-cleaner',
    name: 'URL Privacy Cleaner',
    summary: 'UTM, fbclid, gclid tracking token stripper',
    desc: 'Sanitize URLs by stripping UTM marketing tags, Facebook click IDs, Google click IDs, and referral tracking tokens.',
    format: 'HTTP, HTTPS, Links',
    path: '/tools/url-privacy-cleaner',
    categories: ['Links'],
    icon: Link2Off,
    fileType: 'url',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    summary: 'Cryptographically secure high-entropy generator',
    desc: 'Generate high-entropy, cryptographically secure passwords using client-side CSPRNG with entropy metrics.',
    format: 'Keys & Strings',
    path: '/tools/password-generator',
    categories: ['Security'],
    icon: KeyRound,
    fileType: 'key',
  },
  {
    id: 'passphrase-generator',
    name: 'Passphrase Generator',
    summary: 'Memorable multi-word passphrase generator',
    desc: 'Create high-entropy multi-word passphrases using Diceware wordlists that are easy to remember and secure.',
    format: 'Passphrases',
    path: '/tools/password-generator?tab=passphrase',
    categories: ['Security'],
    icon: Lock,
    fileType: 'key',
  },
  {
    id: 'random-username-generator',
    name: 'Random Username Generator',
    summary: 'Anonymous non-identifying alias creator',
    desc: 'Generate non-identifying, privacy-preserving usernames and pseudonyms to protect your online identity.',
    format: 'Pseudonyms',
    path: '/tools/password-generator?tab=username',
    categories: ['Security'],
    icon: UserCheck,
    fileType: 'shield',
  },
];

type CategoryFilter = 'All' | 'Privacy Checkup' | 'Media' | 'Links' | 'Security';

export const ClayToolsDirectory: React.FC<ClayToolsDirectoryProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: CategoryFilter[] = ['All', 'Privacy Checkup', 'Media', 'Links', 'Security'];

  const filteredTools = useMemo(() => {
    return CLAY_TOOLS.filter((tool) => {
      const matchesCat =
        activeCategory === 'All' ||
        tool.categories.includes(activeCategory as any);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.summary.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.format.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleToolClick = (path: string) => {
    playPop();
    onNavigate(path);
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
      {/* Centered Utility Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 
          id="tools-directory-title"
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Tools Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Client-side utilities designed to inspect, scrub, and protect your digital privacy.
        </p>
      </div>

      {/* Integrated Utility Bar */}
      <div className="mt-8 max-w-2xl mx-auto space-y-5">
        {/* Concave Inset-Carved Search Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <input
            id="clay-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name, format, or keyword..."
            className="w-full clay-inset-search py-3.5 pl-11 sm:pl-13 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Horizontal Category Filter Chips */}
        <div 
          id="category-filters-container"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-1"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button
                key={cat}
                id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  playHover();
                  setActiveCategory(cat);
                }}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'clay-pill-active'
                    : 'clay-pill-inactive'
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid: Exhaustive 2-Column Responsive Layout */}
      <motion.div 
        id="tools-clay-grid"
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mt-10"
      >
        <AnimatePresence>
          {filteredTools.map((tool, idx) => {
            const IconComp = tool.icon;
            return (
              <motion.div
                key={tool.id}
                id={`tool-card-${tool.id}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22, delay: idx * 0.03 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleToolClick(tool.path)}
                onMouseEnter={playClayCardHover}
                className="clay-card p-6 sm:p-7 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top Row: Embossed squircle pod on left with distinct file type SVG, emerald status badge on right */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative">
                      <div className="w-13 h-13 rounded-[20px] clay-icon-pod flex items-center justify-center shrink-0 p-2.5">
                        <FileTypeIcon type={tool.fileType} className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      {/* Secondary micro indicator icon */}
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#1A2438] border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300">
                        <IconComp className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <span className="clay-status-pill text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      100% In-Browser
                    </span>
                  </div>

                  {/* Title & Summaries */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wide">
                    {tool.summary}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 line-clamp-2 font-normal">
                    {tool.desc}
                  </p>
                </div>

                {/* Bottom Row: File format label on left, Launch link on right */}
                <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    {tool.format}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex items-center gap-1 transition-colors">
                    <span>Launch Tool</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 clay-inset-card max-w-md mx-auto mt-8">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No privacy tools match your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
            className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
};
