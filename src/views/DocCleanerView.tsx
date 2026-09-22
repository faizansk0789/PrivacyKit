import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  User,
  Building,
  Calendar,
  Check,
  ShieldCheck,
  Files
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Dropzone } from '../components/common/Dropzone';
import { BatchFileCleaner } from '../components/common/BatchFileCleaner';
import { TrustBadge } from '../components/common/TrustBadge';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { parseDocMetadata, stripDocMetadata } from '../utils/docEngine';
import { DocMetadataInfo } from '../types';
import { logActivity } from '../utils/storage';
import { playPop, playHover, playSuccess } from '../utils/soundEngine';

interface DocCleanerViewProps {
  onNavigate: (path: string) => void;
}

export const DocCleanerView: React.FC<DocCleanerViewProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docData, setDocData] = useState<DocMetadataInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedFileName, setCleanedFileName] = useState('');
  const [strippedItems, setStrippedItems] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const needsCleaning = Boolean(
    docData && (
      Boolean(docData.creator) ||
      Boolean(docData.lastModifiedBy) ||
      Boolean(docData.company) ||
      Boolean(docData.manager) ||
      Boolean(docData.created) ||
      Boolean(docData.modified) ||
      docData.privacyScore < 100
    )
  );

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setIsDone(false);
    setCleanedBlob(null);

    try {
      const data = await parseDocMetadata(selectedFile);
      setDocData(data);
      logActivity({
        toolId: 'doc-metadata-cleaner',
        toolName: 'Document Metadata Cleaner',
        targetName: selectedFile.name,
        type: 'scan',
        scoreBefore: data.privacyScore,
      });
    } catch (e) {
      console.error('Failed reading Document metadata:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanDoc = async () => {
    if (!file) return;
    setIsCleaning(true);
    playPop();

    try {
      const res = await stripDocMetadata(file);
      setCleanedBlob(res.blob);
      setCleanedFileName(res.fileName);
      setStrippedItems(res.strippedItems);
      setIsDone(true);
      playPop();
      setTimeout(() => playSuccess(), 120);

      // Auto scroll to download sign
      setTimeout(() => {
        if (downloadSectionRef.current) {
          downloadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#10B981', '#6366F1'],
        });
      } catch (e) {}

      logActivity({
        toolId: 'doc-metadata-cleaner',
        toolName: 'Document Metadata Cleaner (Cleaned)',
        targetName: file.name,
        type: 'clean',
        scoreBefore: docData?.privacyScore || 60,
        scoreAfter: 100,
        itemsRemovedCount: res.strippedItems.length,
        bytesRemoved: Math.max(0, file.size - res.blob.size),
      });
    } catch (e) {
      console.error('Failed cleaning document:', e);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedBlob || !cleanedFileName) return;
    playPop();
    const url = URL.createObjectURL(cleanedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    playPop();
    setFile(null);
    setDocData(null);
    setCleanedBlob(null);
    setIsDone(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-sm">
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Office Open XML Sanitizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Document Metadata Cleaner
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Clean revision histories, author usernames, corporate tags, and supervisor names from Word (DOCX), Excel (XLSX), and PowerPoint (PPTX) files.
        </p>
        <div className="pt-1 flex justify-center">
          <TrustBadge type="local" showExplanation />
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-full clay-card flex items-center gap-1 shadow-sm">
          <button
            id="doc-mode-single"
            type="button"
            onClick={() => {
              playPop();
              setMode('single');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'single'
                ? 'clay-pill-active'
                : 'clay-pill-inactive'
            }`}
          >
            Single Document Audit
          </button>
          <button
            id="doc-mode-batch"
            type="button"
            onClick={() => {
              playPop();
              setMode('batch');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'batch'
                ? 'clay-pill-active'
                : 'clay-pill-inactive'
            }`}
          >
            <Files className="w-3.5 h-3.5" />
            <span>Batch Documents (Multiple)</span>
          </button>
        </div>
      </div>

      {/* Batch Processing Mode */}
      {mode === 'batch' && (
        <div className="space-y-6 animate-fadeIn">
          <BatchFileCleaner
            title="Drop multiple Office documents to clean at once"
            subtitle="Queue DOCX, XLSX, or PPTX documents for simultaneous in-browser privacy stripping"
            acceptedFormats={['DOCX', 'XLSX', 'PPTX']}
            acceptedMimeTypes={[
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ]}
            sampleType="doc"
            accentColor="blue"
            toolName="Office Doc Batch Cleaner"
          />
        </div>
      )}

      {/* Single Mode Upload Dropzone */}
      {mode === 'single' && !docData && (
        <div className="space-y-6 animate-fadeIn">
          <Dropzone
            onFileSelected={handleFileSelected}
            acceptedFormats={['DOCX', 'XLSX', 'PPTX']}
            acceptedMimeTypes={[
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ]}
            title="Drop your Office document here"
            subtitle="or choose a DOCX, XLSX, or PPTX file"
            sampleType="doc"
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Single Mode Analysis and Clean Workspace */}
      {mode === 'single' && docData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="clay-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl clay-icon-pod text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Target Document</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white max-w-xs sm:max-w-md truncate">
                  {docData.fileName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{(docData.fileSize / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span className="font-mono uppercase">{docData.fileType}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ScoreMeter score={isDone ? 100 : docData.privacyScore} size="md" />
              <button
                type="button"
                onClick={reset}
                onMouseEnter={playHover}
                className="clay-circle-btn w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Inspect another document"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Success Banner / Download Sign */}
          {isDone && (
            <div 
              ref={downloadSectionRef}
              id="download-doc-sign"
              className="p-6 sm:p-8 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 space-y-5 animate-fadeIn shadow-lg shadow-emerald-500/10 scroll-mt-28"
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
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      Sanitized Office Document Ready for Download
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Author profiles, company identifiers, and editing times have been reset.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  onMouseEnter={playHover}
                  className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/35 flex items-center justify-center gap-2 active:scale-[0.98] shrink-0 cursor-pointer animate-pulse hover:animate-none"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Clean Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 border-t border-emerald-500/20">
                {strippedItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{item} purged</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspection Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <User className="w-4 h-4" />
                <span>Author & Revision Details</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Author:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{docData.creator || 'None found'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Last Modified By:</span>
                  <span className="text-amber-600 dark:text-amber-400">{docData.lastModifiedBy || 'None found'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Title:</span>
                  <span className="text-slate-800 dark:text-slate-200">{docData.title || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Editing Time:</span>
                  <span className="text-slate-800 dark:text-slate-200">{docData.totalTime ? `${docData.totalTime} mins` : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <Building className="w-4 h-4" />
                <span>Enterprise & System Fields</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Company:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{docData.company || 'None'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Manager:</span>
                  <span className="text-slate-800 dark:text-slate-200">{docData.manager || 'None'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Application:</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{docData.application || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Created Date:</span>
                  <span className="text-slate-800 dark:text-slate-200">{docData.created ? docData.created.split('T')[0] : 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!isDone && (
            <div className="p-6 sm:p-8 rounded-3xl clay-card flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Clean this Office Document</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Modifies internal XML packages, removes contributor profiles, and repacks into a clean file.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCleanDoc}
                disabled={isCleaning}
                onMouseEnter={playHover}
                className={`w-full sm:w-auto px-7 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer transition-all ${
                  needsCleaning
                    ? 'clay-button-pro sanitize-attention-glow text-white'
                    : 'clay-button-pro'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isCleaning ? 'Sanitizing Document...' : 'Clean All & Download'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SEO / FAQ */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-600 dark:text-slate-400">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">How are Office files processed?</h4>
          <p className="leading-relaxed">
            Modern .docx, .xlsx, and .pptx files are ZIP packages containing structured XML documents. PrivacyKit unpacks these archives in browser RAM, edits the core and extended property trees, and repacks the sanitized document.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Will document content or formatting change?</h4>
          <p className="leading-relaxed">
            No. Your document body, typography, spreadsheet calculations, and slide styling remain 100% untouched. Only metadata in the `docProps` directory is sanitized.
          </p>
        </div>
      </div>
    </div>
  );
};
