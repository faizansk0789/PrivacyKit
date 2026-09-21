import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Video,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  X,
  Save,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Eye,
  Film
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { analyzeVideo, cleanVideo, VideoMetadata } from '../utils/videoEngine';
import { playPop, playHover, playSuccess, playError } from '../utils/soundEngine';
import { logActivity } from '../utils/storage';

interface VideoCleanerViewProps {
  onNavigate: (path: string) => void;
}

export const VideoCleanerView: React.FC<VideoCleanerViewProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'inspector' | 'cleaner'>('inspector');

  // Options
  const [removeUdta, setRemoveUdta] = useState(true);
  const [removeMeta, setRemoveMeta] = useState(true);
  const [scrubDates, setScrubDates] = useState(true);

  // Results
  const [cleanFile, setCleanFile] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const needsCleaning = Boolean(
    metadata && (metadata.hasUdta || metadata.hasMeta || Boolean(metadata.creationTime))
  );

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setCleanFile(null);
    setErrorMsg(null);
    setIsProcessing(true);
    playPop();

    try {
      const data = await analyzeVideo(selectedFile);
      setMetadata(data);
      setActiveTab('inspector');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse video file.');
      playError();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClean = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    playPop();

    try {
      const cleanedBlob = await cleanVideo(file, {
        removeUdta,
        removeMeta,
        scrubDates
      });
      setCleanFile(cleanedBlob);
      playPop();
      setTimeout(() => playSuccess(), 120);

      // Auto redirect/scroll smoothly to the download sign
      setTimeout(() => {
        if (downloadSectionRef.current) {
          downloadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      const itemsRemoved = [removeUdta, removeMeta, scrubDates].filter(Boolean).length;
      
      logActivity({
        toolId: 'video-metadata-cleaner',
        toolName: 'Video Metadata Cleaner',
        targetName: file.name,
        type: 'clean',
        scoreBefore: 50,
        scoreAfter: 100,
        itemsRemovedCount: itemsRemoved,
        bytesRemoved: Math.max(0, file.size - cleanedBlob.size) || (itemsRemoved * 512),
      });

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sanitize video metadata.');
      playError();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!cleanFile || !file) return;
    playPop();
    const url = URL.createObjectURL(cleanFile);
    const a = document.createElement('a');
    a.href = url;
    
    const parts = file.name.split('.');
    const ext = parts.length > 1 ? `.${parts.pop()}` : '';
    const name = parts.join('.');
    a.download = `${name}_clean${ext}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSuccess();
  };

  const handleReset = () => {
    setFile(null);
    setMetadata(null);
    setCleanFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    playPop();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-bold shadow-sm">
          <Film className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
          <span>Video Forensics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Video Metadata Inspector & Cleaner
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          Inspect and strip hidden user data, location tags, and exact creation timestamps from MP4/MOV videos before sharing them online.
        </p>
      </div>

      {!file ? (
        <Dropzone
          title="Drop your Video here"
          subtitle="Supports .mp4 and .mov files. Processing happens instantly and locally."
          acceptedFormats={['MP4', 'MOV']}
          acceptedMimeTypes={['video/mp4', 'video/quicktime']}
          onFileSelected={(selectedFile) => processFile(selectedFile)}
          accentColor="fuchsia"
          sampleType="none"
          icon={<Film className="w-8 h-8" />}
          isLoading={isProcessing}
        />
      ) : (
        <div className="space-y-6">
          {/* File Overview */}
          <div className="p-6 sm:p-7 rounded-3xl clay-card flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl clay-icon-pod text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • MP4/MOV Video
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              onMouseEnter={playHover}
              className="clay-circle-btn w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!cleanFile ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-3xl clay-inset-card">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playPop();
                      setActiveTab('inspector');
                    }}
                    onMouseEnter={playHover}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'inspector'
                        ? 'clay-pill-active'
                        : 'clay-pill-inactive'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspector</span>
                  </button>
                  <button
                    onClick={() => {
                      playPop();
                      setActiveTab('cleaner');
                    }}
                    onMouseEnter={playHover}
                    className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'cleaner'
                        ? 'clay-pill-active'
                        : needsCleaning
                          ? 'clay-pill-active sanitize-attention-glow'
                          : 'clay-pill-inactive'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sanitize & Clean</span>
                    {needsCleaning && (
                      <span className="w-2 h-2 rounded-full bg-rose-300 dark:bg-rose-400 animate-ping ml-0.5" />
                    )}
                  </button>
                </div>

                <div className="px-2">
                  {!needsCleaning ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Video Safe: No Risky Metadata</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Action Required: Metadata Detected</span>
                    </div>
                  )}
                </div>
              </div>

              {activeTab === 'inspector' && metadata && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl clay-card space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">User Data (UDTA)</h4>
                    </div>
                    {metadata.hasUdta ? (
                      <p className="text-xs text-slate-700 dark:text-slate-300">Contains extended user data, often including GPS coordinates, location names, and camera software info.</p>
                    ) : (
                      <p className="text-xs text-slate-400">No udta box detected.</p>
                    )}
                  </div>

                  <div className="p-5 rounded-3xl clay-card space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                      <Layers className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Metadata (META)</h4>
                    </div>
                    {metadata.hasMeta ? (
                      <p className="text-xs text-slate-700 dark:text-slate-300">Contains item lists, tags, and handler-specific metadata often used by editors.</p>
                    ) : (
                      <p className="text-xs text-slate-400">No meta box detected.</p>
                    )}
                  </div>

                  <div className="p-5 rounded-3xl clay-card space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Creation Time</h4>
                    </div>
                    {metadata.creationTime ? (
                      <p className="text-xs font-mono text-slate-800 dark:text-slate-300">{metadata.creationTime.toLocaleString()}</p>
                    ) : (
                      <p className="text-xs text-slate-400">No timeline data detected.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'cleaner' && (
                <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sanitization Options</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={removeUdta}
                        onChange={(e) => {
                          playPop();
                          setRemoveUdta(e.target.checked);
                        }}
                        disabled={!metadata?.hasUdta}
                        className="mt-0.5 w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 disabled:opacity-50"
                      />
                      <div className={`space-y-0.5 ${!metadata?.hasUdta ? 'opacity-50' : ''}`}>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Scrub User Data (UDTA)</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Removes GPS tags and device-specific tracking information embedded during recording.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={removeMeta}
                        onChange={(e) => {
                          playPop();
                          setRemoveMeta(e.target.checked);
                        }}
                        disabled={!metadata?.hasMeta}
                        className="mt-0.5 w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 disabled:opacity-50"
                      />
                      <div className={`space-y-0.5 ${!metadata?.hasMeta ? 'opacity-50' : ''}`}>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Remove Metadata (META)</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Strips handler metadata, key-value lists, and editor footprints.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={scrubDates}
                        onChange={(e) => {
                          playPop();
                          setScrubDates(e.target.checked);
                        }}
                        disabled={!metadata?.creationTime}
                        className="mt-0.5 w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 disabled:opacity-50"
                      />
                      <div className={`space-y-0.5 ${!metadata?.creationTime ? 'opacity-50' : ''}`}>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Zero-out Timestamps</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Resets creation and modification timestamps inside the movie header to zero (1904 epoch).
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleClean}
                      disabled={isProcessing || (!removeUdta && !removeMeta && !scrubDates)}
                      onMouseEnter={playHover}
                      className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        needsCleaning
                          ? 'clay-button-pro sanitize-attention-glow text-white'
                          : 'clay-button-pro disabled:opacity-50'
                      }`}
                    >
                      {isProcessing ? (
                        <span className="animate-pulse">Cleaning Video...</span>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Sanitize & Clean Video</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              ref={downloadSectionRef}
              id="download-video-sign"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 space-y-5 shadow-lg shadow-emerald-500/10 scroll-mt-28"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        Sanitization Complete
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Video Successfully Sanitized</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">All chosen metadata tags safely overwritten. Video stream untouched.</p>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  onMouseEnter={playHover}
                  className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 animate-pulse hover:animate-none"
                >
                  <Save className="w-4 h-4" />
                  <span>Download Clean Video</span>
                </button>
              </div>
            </motion.div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 dark:text-rose-300">{errorMsg}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
