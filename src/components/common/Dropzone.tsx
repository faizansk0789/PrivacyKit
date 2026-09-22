import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, Sparkles, ArrowDownCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createSampleDocxFile, createSampleImageFile, createSamplePdfFile } from '../../utils/sampleData';
import { playPop, playHover, playSuccess } from '../../utils/soundEngine';

export interface DropzoneProps {
  onFileSelected?: (file: File) => void;
  onFilesSelected?: (files: File[]) => void;
  multiple?: boolean;
  acceptedFormats?: string[];
  acceptedMimeTypes?: string[];
  title?: string;
  subtitle?: string;
  maxSizeBytes?: number; // default 50MB
  sampleType?: 'image' | 'pdf' | 'doc' | 'any' | 'none';
  isLoading?: boolean;
  accentColor?: 'indigo' | 'blue' | 'fuchsia';
  icon?: React.ReactNode;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelected,
  onFilesSelected,
  multiple = false,
  acceptedFormats = ['JPG', 'JPEG', 'PNG', 'WEBP', 'PDF', 'DOCX', 'XLSX', 'PPTX'],
  acceptedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/tiff',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  title = 'Drop your file here',
  subtitle = 'or choose a file from your computer',
  maxSizeBytes = 50 * 1024 * 1024,
  sampleType = 'any',
  isLoading = false,
  accentColor = 'indigo',
  icon,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Color mappings based on accentColor
  const colorStyles = {
    indigo: {
      glowClass: 'dropzone-glow-indigo',
      activeBorder: 'border-indigo-500 dark:border-indigo-400',
      activeRing: 'ring-4 ring-indigo-500/35 dark:ring-indigo-400/40',
      activeBg: 'bg-gradient-to-b from-indigo-50/95 via-purple-50/60 to-indigo-50/95 dark:from-[#1A2338] dark:via-[#141C30] dark:to-[#0F1728]',
      haloGradient: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.28) 0%, rgba(139, 92, 246, 0.14) 45%, transparent 75%)',
      iconPodText: 'text-indigo-600 dark:text-indigo-400',
      iconPodBgActive: 'bg-indigo-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.6)]',
      pingBg: 'bg-indigo-500',
      floatingBadgeBg: 'from-indigo-500 via-purple-600 to-indigo-600 shadow-[0_4px_14px_rgba(99,102,241,0.45)]',
      activeTitleText: 'text-indigo-600 dark:text-indigo-300',
    },
    blue: {
      glowClass: 'dropzone-glow-blue',
      activeBorder: 'border-blue-500 dark:border-blue-400',
      activeRing: 'ring-4 ring-blue-500/35 dark:ring-blue-400/40',
      activeBg: 'bg-gradient-to-b from-blue-50/95 via-cyan-50/60 to-blue-50/95 dark:from-[#13233D] dark:via-[#0F1B30] dark:to-[#0B1526]',
      haloGradient: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.30) 0%, rgba(6, 182, 212, 0.15) 45%, transparent 75%)',
      iconPodText: 'text-blue-600 dark:text-blue-400',
      iconPodBgActive: 'bg-blue-600 text-white shadow-[0_0_24px_rgba(59,130,246,0.6)]',
      pingBg: 'bg-blue-500',
      floatingBadgeBg: 'from-blue-600 via-cyan-600 to-blue-600 shadow-[0_4px_14px_rgba(59,130,246,0.45)]',
      activeTitleText: 'text-blue-600 dark:text-blue-300',
    },
    fuchsia: {
      glowClass: 'dropzone-glow-fuchsia',
      activeBorder: 'border-fuchsia-500 dark:border-fuchsia-400',
      activeRing: 'ring-4 ring-fuchsia-500/35 dark:ring-fuchsia-400/40',
      activeBg: 'bg-gradient-to-b from-fuchsia-50/95 via-purple-50/60 to-fuchsia-50/95 dark:from-[#2B1638] dark:via-[#1F102B] dark:to-[#150B1D]',
      haloGradient: 'radial-gradient(circle at center, rgba(217, 70, 239, 0.30) 0%, rgba(168, 85, 247, 0.15) 45%, transparent 75%)',
      iconPodText: 'text-fuchsia-600 dark:text-fuchsia-400',
      iconPodBgActive: 'bg-fuchsia-600 text-white shadow-[0_0_24px_rgba(217,70,239,0.6)]',
      pingBg: 'bg-fuchsia-500',
      floatingBadgeBg: 'from-fuchsia-600 via-purple-600 to-fuchsia-600 shadow-[0_4px_14px_rgba(217,70,239,0.45)]',
      activeTitleText: 'text-fuchsia-600 dark:text-fuchsia-300',
    },
  }[accentColor];

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Size limit check
    if (file.size > maxSizeBytes) {
      setErrorMessage(`This file exceeds the ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB browser processing limit.`);
      return;
    }

    // Format check
    const ext = file.name.split('.').pop()?.toUpperCase();
    const isExtensionMatch = ext && acceptedFormats.includes(ext);
    const isMimeMatch = acceptedMimeTypes.length === 0 || acceptedMimeTypes.includes(file.type);

    if (!isExtensionMatch && !isMimeMatch) {
      setErrorMessage(`This file type (${ext || file.type || 'unknown'}) isn't supported yet. Supported: ${acceptedFormats.join(', ')}`);
      return;
    }

    playSuccess();
    if (onFileSelected) onFileSelected(file);
    if (onFilesSelected) onFilesSelected([file]);
  };

  const processMultipleFiles = (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    if (!multiple || (!onFilesSelected && onFileSelected)) {
      validateAndProcessFile(rawFiles[0]);
      return;
    }

    setErrorMessage(null);
    const validFiles: File[] = [];
    const invalidNames: string[] = [];

    rawFiles.forEach((f) => {
      if (f.size > maxSizeBytes) {
        invalidNames.push(`${f.name} (exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB)`);
        return;
      }
      const ext = f.name.split('.').pop()?.toUpperCase();
      const isExtensionMatch = ext && acceptedFormats.includes(ext);
      const isMimeMatch = acceptedMimeTypes.length === 0 || acceptedMimeTypes.includes(f.type);
      if (isExtensionMatch || isMimeMatch) {
        validFiles.push(f);
      } else {
        invalidNames.push(`${f.name} (unsupported format)`);
      }
    });

    if (invalidNames.length > 0) {
      setErrorMessage(`Some files could not be added: ${invalidNames.slice(0, 3).join(', ')}${invalidNames.length > 3 ? ` and ${invalidNames.length - 3} more` : ''}`);
    }

    if (validFiles.length > 0) {
      playSuccess();
      if (onFilesSelected) {
        onFilesSelected(validFiles);
      } else if (onFileSelected) {
        onFileSelected(validFiles[0]);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      if (!isDragOver) {
        playHover();
        setIsDragOver(true);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple && (onFilesSelected || e.dataTransfer.files.length > 1)) {
        processMultipleFiles(e.dataTransfer.files);
      } else {
        validateAndProcessFile(e.dataTransfer.files[0]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple && onFilesSelected) {
        processMultipleFiles(e.target.files);
      } else {
        validateAndProcessFile(e.target.files[0]);
      }
    }
    // reset input value so re-selecting same file fires change
    e.target.value = '';
  };

  const loadSample = async (type: 'image' | 'pdf' | 'doc') => {
    playPop();
    try {
      if (type === 'image') {
        const file = createSampleImageFile(true);
        validateAndProcessFile(file);
      } else if (type === 'pdf') {
        const file = await createSamplePdfFile();
        validateAndProcessFile(file);
      } else if (type === 'doc') {
        const file = await createSampleDocxFile();
        validateAndProcessFile(file);
      }
    } catch (e) {
      setErrorMessage('Could not generate sample file in browser. Please select a local file.');
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Floating "Release to Drop" Status Badge */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap"
            >
              <div
                className={`px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colorStyles.floatingBadgeBg} flex items-center gap-1.5 border border-white/30`}
              >
                <ArrowDownCircle className="w-3.5 h-3.5 animate-bounce" />
                <span>Release file to drop & inspect</span>
                <Sparkles className="w-3 h-3 text-amber-200 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          id="file-dropzone"
          whileHover={{ scale: 1.006 }}
          whileTap={{ scale: 0.992 }}
          animate={{
            scale: isDragOver ? 1.018 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          onMouseEnter={playHover}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isLoading) {
              playPop();
              fileInputRef.current?.click();
            }
          }}
          className={`relative overflow-hidden clay-card p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 group ${
            isDragOver
              ? `${colorStyles.glowClass} ${colorStyles.activeBorder} ${colorStyles.activeRing} ${colorStyles.activeBg}`
              : 'border-2 border-dashed border-slate-300/90 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          {/* Ambient Radiant Glow Spotlight (Fades & expands in on dragover) */}
          <div
            className={`pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-300 ${
              isDragOver ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: colorStyles.haloGradient,
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleInputChange}
            accept={acceptedMimeTypes.join(',')}
            multiple={multiple}
            disabled={isLoading}
          />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-4 pointer-events-none">
            {/* Icon Pod with Beacon Ping Effect */}
            <div className="relative">
              {isDragOver && (
                <div
                  className={`absolute inset-0 rounded-[22px] animate-ping opacity-30 ${colorStyles.pingBg} pointer-events-none`}
                />
              )}
              <motion.div
                animate={{
                  scale: isDragOver ? 1.15 : 1,
                  y: isDragOver ? -4 : 0,
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                className={`w-16 h-16 rounded-[22px] clay-icon-pod flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                  isDragOver
                    ? colorStyles.iconPodBgActive
                    : colorStyles.iconPodText
                }`}
              >
                {icon ? icon : <UploadCloud className="w-8 h-8" />}
              </motion.div>
            </div>

            <div className="space-y-1.5">
              <p
                className={`text-xl sm:text-2xl font-extrabold transition-colors duration-200 ${
                  isDragOver
                    ? colorStyles.activeTitleText
                    : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                }`}
              >
                {isDragOver ? 'Drop file to start processing' : title}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {isDragOver ? 'File will be analyzed securely in browser memory' : subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-md">
              {acceptedFormats.map((fmt) => (
                <span
                  key={fmt}
                  className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg transition-colors shadow-inner ${
                    isDragOver
                      ? 'bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-300/60 dark:ring-slate-700'
                      : 'bg-[#E2E8F0] dark:bg-[#1A2438] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {fmt}
                </span>
              ))}
            </div>

            <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2 pt-1 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Your file is read directly in memory and never leaves your computer</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Quick Test Samples */}
      {sampleType !== 'none' && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>No file ready? Try a sample:</span>
          </span>
          {(sampleType === 'image' || sampleType === 'any') && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSample('image');
              }}
              onMouseEnter={playHover}
              className="clay-pill-inactive px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sample Photo (GPS + Camera)</span>
            </button>
          )}
          {(sampleType === 'pdf' || sampleType === 'any') && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSample('pdf');
              }}
              onMouseEnter={playHover}
              className="clay-pill-inactive px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Sample PDF (Author + Timestamps)</span>
            </button>
          )}
          {(sampleType === 'doc' || sampleType === 'any') && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSample('doc');
              }}
              onMouseEnter={playHover}
              className="clay-pill-inactive px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Sample Word DOCX</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
