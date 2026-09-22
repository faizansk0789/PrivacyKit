import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Archive,
  FileCheck,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  FileSpreadsheet,
  X,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Dropzone } from './Dropzone';
import {
  BatchItem,
  processSingleBatchFile,
  downloadBatchItem,
  downloadAllBatchZip,
  getFileTypeCategory
} from '../../utils/batchEngine';
import { logActivity } from '../../utils/storage';
import { playPop, playSuccess, playHover, playError } from '../../utils/soundEngine';
import confetti from 'canvas-confetti';

interface BatchFileCleanerProps {
  title?: string;
  subtitle?: string;
  acceptedFormats?: string[];
  acceptedMimeTypes?: string[];
  maxSizeBytes?: number;
  sampleType?: 'image' | 'pdf' | 'doc' | 'any' | 'none';
  accentColor?: 'indigo' | 'blue' | 'fuchsia';
  toolName?: string;
}

export const BatchFileCleaner: React.FC<BatchFileCleanerProps> = ({
  title = 'Batch Clean Multiple Files',
  subtitle = 'Drag & drop multiple files or click to queue them for simultaneous in-memory privacy stripping',
  acceptedFormats = ['JPG', 'JPEG', 'PNG', 'WEBP', 'PDF', 'DOCX', 'XLSX', 'PPTX'],
  acceptedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  maxSizeBytes = 50 * 1024 * 1024,
  sampleType = 'any',
  accentColor = 'indigo',
  toolName = 'Batch Cleaner',
}) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    playPop();
    const newItems: BatchItem[] = files.map((file) => ({
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'queued',
      progress: 0,
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleClearAll = () => {
    playPop();
    setItems([]);
  };

  const handleRemoveItem = (id: string) => {
    playPop();
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const cleanItem = async (item: BatchItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'processing', progress: 20 } : i))
    );

    try {
      const result = await processSingleBatchFile(item, (p) => {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, progress: p } : i))
        );
      });

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'done',
                progress: 100,
                cleanedBlob: result.cleanedBlob,
                cleanedFileName: result.cleanedFileName,
                cleanedDetails: result.details,
              }
            : i
        )
      );

      logActivity({
        toolId: 'exif-remover',
        toolName: `${toolName}: ${item.name}`,
        targetName: result.cleanedFileName,
        type: 'clean',
        scoreBefore: 40,
        scoreAfter: 100,
        itemsRemovedCount: result.details.length,
      });

      return true;
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'error',
                error: err.message || 'Failed to strip metadata',
              }
            : i
        )
      );
      return false;
    }
  };

  const handleCleanAll = async () => {
    if (items.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);
    playPop();

    let anySuccess = false;
    for (const item of items) {
      if (item.status !== 'done') {
        const ok = await cleanItem(item);
        if (ok) anySuccess = true;
      }
    }

    setIsProcessingAll(false);

    if (anySuccess) {
      playSuccess();
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore if not loaded
      }
    } else {
      playError();
    }
  };

  const handleDownloadZip = async () => {
    playPop();
    setIsDownloadingZip(true);
    try {
      await downloadAllBatchZip(items, `PrivacyKit_${toolName.replace(/\s+/g, '_')}_Clean.zip`);
      playSuccess();
    } catch (e) {
      console.error(e);
      playError();
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const totalFiles = items.length;
  const doneFiles = items.filter((i) => i.status === 'done').length;
  const queuedFiles = items.filter((i) => i.status === 'queued').length;
  const errorFiles = items.filter((i) => i.status === 'error').length;
  const overallProgress = totalFiles > 0 ? Math.round((doneFiles / totalFiles) * 100) : 0;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIconForFile = (file: File) => {
    const cat = getFileTypeCategory(file);
    switch (cat) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-indigo-500 shrink-0" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'doc':
        return <FileSpreadsheet className="w-5 h-5 text-blue-500 shrink-0" />;
      case 'audio':
        return <Music className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500 shrink-0" />;
      default:
        return <FileCheck className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <Dropzone
        multiple={true}
        onFilesSelected={handleFilesSelected}
        acceptedFormats={acceptedFormats}
        acceptedMimeTypes={acceptedMimeTypes}
        title={title}
        subtitle={subtitle}
        maxSizeBytes={maxSizeBytes}
        sampleType={sampleType}
        accentColor={accentColor}
      />

      {/* Batch Control Bar & Queue State */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-card p-5 sm:p-6 space-y-5"
        >
          {/* Header & Clear All Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Batch Queue ({totalFiles} {totalFiles === 1 ? 'file' : 'files'})
                </h3>
                {doneFiles > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                    {doneFiles} of {totalFiles} Sanitized
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Each file is processed independently directly in memory.
              </p>
            </div>

            {/* Actions: Clear All button + Clean All button */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="batch-clear-all-btn"
                type="button"
                onClick={handleClearAll}
                disabled={isProcessingAll}
                onMouseEnter={playHover}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>

              {doneFiles > 0 && (
                <button
                  id="batch-download-zip-btn"
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isDownloadingZip}
                  onMouseEnter={playHover}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isDownloadingZip ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Archive className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  <span>Download All (.ZIP)</span>
                </button>
              )}

              <button
                id="batch-clean-all-btn"
                type="button"
                onClick={handleCleanAll}
                disabled={isProcessingAll || queuedFiles === 0}
                onMouseEnter={playHover}
                className="px-5 py-2 rounded-full clay-button-pro text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isProcessingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cleaning Queue...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {queuedFiles === 0 ? 'All Files Cleaned' : `Clean All (${queuedFiles})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Overall Progress Bar */}
          {totalFiles > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Batch Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Queued Files List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  {/* File Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getIconForFile(item.file)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                          {formatSize(item.size)}
                        </span>
                      </div>

                      {/* Status / Details */}
                      <div className="text-[11px] mt-0.5 flex items-center gap-2 font-medium">
                        {item.status === 'queued' && (
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Ready in queue
                          </span>
                        )}
                        {item.status === 'processing' && (
                          <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                            <Loader2 className="w-3 h-3 animate-spin" /> Stripping metadata ({item.progress}%)...
                          </span>
                        )}
                        {item.status === 'done' && (
                          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Sanitized & ready to download
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3" /> {item.error || 'Error processing'}
                          </span>
                        )}
                      </div>

                      {/* Individual Progress bar when processing */}
                      {item.status === 'processing' && (
                        <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800 mt-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-indigo-500"
                            animate={{ width: `${item.progress}%` }}
                            transition={{ ease: 'easeOut' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {item.status === 'done' && (
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          downloadBatchItem(item);
                        }}
                        onMouseEnter={playHover}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Download sanitized file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    )}

                    {item.status === 'queued' && (
                      <button
                        type="button"
                        onClick={() => cleanItem(item)}
                        disabled={isProcessingAll}
                        onMouseEnter={playHover}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Clean</span>
                      </button>
                    )}

                    {item.status === 'error' && (
                      <button
                        type="button"
                        onClick={() => cleanItem(item)}
                        onMouseEnter={playHover}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={item.status === 'processing'}
                      onMouseEnter={playHover}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove file from queue"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};
