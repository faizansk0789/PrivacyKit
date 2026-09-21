import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  User,
  Calendar,
  Layers,
  Check,
  ShieldCheck,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Dropzone } from '../components/common/Dropzone';
import { TrustBadge } from '../components/common/TrustBadge';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { parsePdfMetadata, stripPdfMetadata } from '../utils/pdfEngine';
import { PdfMetadataInfo } from '../types';
import { logActivity } from '../utils/storage';
import { playPop, playHover, playSuccess } from '../utils/soundEngine';

interface PdfCleanerViewProps {
  onNavigate: (path: string) => void;
}

export const PdfCleanerView: React.FC<PdfCleanerViewProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<PdfMetadataInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedFileName, setCleanedFileName] = useState('');
  const [strippedItems, setStrippedItems] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const needsCleaning = Boolean(
    pdfData && (
      Boolean(pdfData.author) ||
      Boolean(pdfData.title) ||
      Boolean(pdfData.creator) ||
      Boolean(pdfData.producer) ||
      Boolean(pdfData.creationDate) ||
      Boolean(pdfData.modificationDate) ||
      pdfData.privacyScore < 100
    )
  );

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setIsDone(false);
    setCleanedBlob(null);

    try {
      const data = await parsePdfMetadata(selectedFile);
      setPdfData(data);
      logActivity({
        toolId: 'pdf-metadata-cleaner',
        toolName: 'PDF Metadata Cleaner',
        targetName: selectedFile.name,
        type: 'scan',
        scoreBefore: data.privacyScore,
      });
    } catch (e) {
      console.error('Failed reading PDF metadata:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanPdf = async () => {
    if (!file) return;
    setIsCleaning(true);
    playPop();

    try {
      const res = await stripPdfMetadata(file);
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
        toolId: 'pdf-metadata-cleaner',
        toolName: 'PDF Metadata Cleaner (Cleaned)',
        targetName: file.name,
        type: 'clean',
        scoreBefore: pdfData?.privacyScore || 60,
        scoreAfter: 100,
        itemsRemovedCount: res.strippedItems.length,
        bytesRemoved: Math.max(0, file.size - res.blob.size),
      });
    } catch (e) {
      console.error('Failed cleaning PDF:', e);
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
    setPdfData(null);
    setCleanedBlob(null);
    setIsDone(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-sm">
          <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>Document Privacy Sanitizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          PDF Metadata Cleaner
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Remove unnecessary metadata, author names, creation software, and timestamps from PDF documents before distributing them.
        </p>
        <div className="pt-1 flex justify-center">
          <TrustBadge type="local" showExplanation />
        </div>
      </div>

      {/* Upload Dropzone */}
      {!pdfData && (
        <div className="space-y-6 animate-fadeIn">
          <Dropzone
            onFileSelected={handleFileSelected}
            acceptedFormats={['PDF']}
            acceptedMimeTypes={['application/pdf']}
            title="Drop your PDF here"
            subtitle="or choose a PDF document from your computer"
            sampleType="pdf"
            isLoading={isLoading}
          />
        </div>
      )}

      {/* PDF Analysis and Clean Workspace */}
      {pdfData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="clay-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl clay-icon-pod text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Target PDF</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white max-w-xs sm:max-w-md truncate">
                  {pdfData.fileName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{(pdfData.fileSize / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{pdfData.pageCount || 1} page(s)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ScoreMeter score={isDone ? 100 : pdfData.privacyScore} size="md" />
              <button
                type="button"
                onClick={reset}
                onMouseEnter={playHover}
                className="clay-circle-btn w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Inspect another PDF"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Success Banner / Download Sign */}
          {isDone && (
            <div 
              ref={downloadSectionRef}
              id="download-pdf-sign"
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
                      Cleaned PDF Ready for Download
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Author tags, internal software keys, and timestamps have been sanitized.
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
                  <span>Download Clean PDF</span>
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
                <span>Author & Title Metadata</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Author:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{pdfData.author || 'None found'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Title:</span>
                  <span className="text-slate-800 dark:text-slate-200">{pdfData.title || 'None found'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Subject:</span>
                  <span className="text-slate-800 dark:text-slate-200">{pdfData.subject || 'None found'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Keywords:</span>
                  <span className="text-slate-800 dark:text-slate-200">{pdfData.keywords || 'None found'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl clay-card space-y-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>Application & Timestamps</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Creator Software:</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{pdfData.creator || 'None'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">PDF Producer:</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{pdfData.producer || 'None'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Creation Date:</span>
                  <span className="text-slate-800 dark:text-slate-200">{pdfData.creationDate ? pdfData.creationDate.split('T')[0] : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Modified Date:</span>
                  <span className="text-slate-800 dark:text-slate-200">{pdfData.modificationDate ? pdfData.modificationDate.split('T')[0] : 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button if not cleaned */}
          {!isDone && (
            <div className="p-6 sm:p-8 rounded-3xl clay-card flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Clean this PDF</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Resets document properties, clears author tags, and eliminates creation timestamps.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCleanPdf}
                disabled={isCleaning}
                onMouseEnter={playHover}
                className={`w-full sm:w-auto px-7 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer transition-all ${
                  needsCleaning
                    ? 'clay-button-pro sanitize-attention-glow text-white'
                    : 'clay-button-pro'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isCleaning ? 'Sanitizing PDF...' : 'Sanitize & Download Clean PDF'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAQ & Technical Transparency */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-600 dark:text-slate-400">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">What metadata is removed from PDFs?</h4>
          <p className="leading-relaxed">
            PrivacyKit zeroes out the author name, creator application, producer engine, internal keywords, and revision timestamps embedded within the PDF standard Info dictionary.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Are encrypted or signed PDFs supported?</h4>
          <p className="leading-relaxed">
            Standard unprotected PDFs are 100% sanitized in-browser. Digitally signed PDFs that enforce cryptographic tamper-resistance will invalidate their cryptographic signature if metadata is stripped.
          </p>
        </div>
      </div>
    </div>
  );
};
