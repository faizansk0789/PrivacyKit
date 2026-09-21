import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileAudio,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Music,
  Trash2,
  X,
  FileBadge2,
  Save,
  Tag
} from 'lucide-react';
import { Dropzone } from '../components/common/Dropzone';
import { analyzeAudio, cleanAudio, AudioMetadata } from '../utils/audioEngine';
import { playPop, playHover, playSuccess, playError } from '../utils/soundEngine';

interface AudioCleanerViewProps {
  onNavigate: (path: string) => void;
}

export const AudioCleanerView: React.FC<AudioCleanerViewProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  
  // Options
  const [removeId3v2, setRemoveId3v2] = useState(true);
  const [removeId3v1, setRemoveId3v1] = useState(true);

  // Results
  const [cleanFile, setCleanFile] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setCleanFile(null);
    setErrorMsg(null);
    setIsProcessing(true);
    playPop();

    try {
      const data = await analyzeAudio(selectedFile);
      setMetadata(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse audio file.');
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
      const cleanedBlob = await cleanAudio(file, {
        removeId3v2,
        removeId3v1
      });
      setCleanFile(cleanedBlob);
      playSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sanitize audio metadata.');
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
    
    // Add _clean before extension
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-sm">
          <Music className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Audio Metadata Cleaner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          MP3 ID3 Tag Remover
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          Strip hidden ID3 metadata, album art, comments, and tracking tags from audio files instantly inside your browser. No server uploads.
        </p>
      </div>

      {!file ? (
        <Dropzone
          title="Drop your MP3 here"
          subtitle="Supports .mp3 audio files. ID3 metadata stripped locally in your browser."
          acceptedFormats={['MP3']}
          acceptedMimeTypes={['audio/mpeg', 'audio/mp3']}
          onFileSelected={(selectedFile) => processFile(selectedFile)}
          accentColor="blue"
          sampleType="none"
          icon={<Music className="w-8 h-8" />}
          isLoading={isProcessing}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Overview */}
          <div className="space-y-4">
            <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl clay-icon-pod text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                      {file.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • MP3 Audio
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

              {metadata && (
                <div className="mt-4 space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Detected Metadata
                  </h4>

                  {(!metadata.hasId3v2 && !metadata.hasId3v1) ? (
                    <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        No ID3 tags detected. File is already clean.
                      </span>
                    </div>
                  ) : (
                    <>
                      {metadata.hasId3v2 && (
                        <div className="p-3.5 rounded-2xl clay-inset-card space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">ID3v2 Header</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">{(metadata.id3v2Size / 1024).toFixed(1)} KB</span>
                          </div>
                          {(metadata.title || metadata.artist || metadata.album) && (
                            <div className="space-y-1 mt-2 text-slate-600 dark:text-slate-400">
                              {metadata.title && <div><span className="font-medium text-slate-500">Title:</span> {metadata.title}</div>}
                              {metadata.artist && <div><span className="font-medium text-slate-500">Artist:</span> {metadata.artist}</div>}
                              {metadata.album && <div><span className="font-medium text-slate-500">Album:</span> {metadata.album}</div>}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {metadata.hasId3v1 && (
                        <div className="p-3.5 rounded-2xl clay-inset-card space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">ID3v1 Footer</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">128 Bytes</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-4">
            {!cleanFile ? (
              <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sanitization Options</h3>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={removeId3v2}
                      onChange={(e) => {
                        playPop();
                        setRemoveId3v2(e.target.checked);
                      }}
                      disabled={!metadata?.hasId3v2}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className={`space-y-0.5 ${!metadata?.hasId3v2 ? 'opacity-50' : ''}`}>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Remove ID3v2 Tags</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Strips rich metadata including album art, lyrics, comprehensive text tags, and comments.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={removeId3v1}
                      onChange={(e) => {
                        playPop();
                        setRemoveId3v1(e.target.checked);
                      }}
                      disabled={!metadata?.hasId3v1}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className={`space-y-0.5 ${!metadata?.hasId3v1 ? 'opacity-50' : ''}`}>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Remove ID3v1 Tags</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Strips legacy 128-byte footer tags containing basic title, artist, and genre data.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleClean}
                    disabled={isProcessing || (!metadata?.hasId3v2 && !metadata?.hasId3v1) || (!removeId3v1 && !removeId3v2)}
                    onMouseEnter={playHover}
                    className="w-full py-3.5 rounded-full clay-button-pro disabled:opacity-50 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">Cleaning...</span>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Clean Audio File</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 sm:p-7 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Successfully Cleaned</h3>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Metadata removed. Ready to download.</p>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  onMouseEnter={playHover}
                  className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Download Clean MP3</span>
                </button>
              </motion.div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 dark:text-rose-300">{errorMsg}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
