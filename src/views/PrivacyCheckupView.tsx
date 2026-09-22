import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  FileCheck2,
  Link2,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  Layers,
  Copy,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Info,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Trash2,
  Bookmark,
  Files
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Dropzone } from '../components/common/Dropzone';
import { BatchFileCleaner } from '../components/common/BatchFileCleaner';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { TrustBadge } from '../components/common/TrustBadge';
import { parseImageMetadata, stripImageMetadata } from '../utils/exifEngine';
import { parsePdfMetadata, stripPdfMetadata } from '../utils/pdfEngine';
import { parseDocMetadata, stripDocMetadata } from '../utils/docEngine';
import { analyzeAndCleanUrl } from '../utils/urlEngine';
import { SAMPLE_URLS } from '../utils/sampleData';
import { logActivity, savePrivacyReport } from '../utils/storage';
import { PrivacyRiskItem, UnifiedPrivacyReport } from '../types';
import { playPop, playHover, playSuccess, playError } from '../utils/soundEngine';

interface PrivacyCheckupViewProps {
  onNavigate: (path: string) => void;
}

export const PrivacyCheckupView: React.FC<PrivacyCheckupViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'batch' | 'url'>('file');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState<number>(0);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [copiedCleanUrl, setCopiedCleanUrl] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Active Report State
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [report, setReport] = useState<UnifiedPrivacyReport | null>(null);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedFileName, setCleanedFileName] = useState<string>('');
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedItemsList, setCleanedItemsList] = useState<string[]>([]);
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const needsCleaning = Boolean(
    report && !report.isCleaned && report.type !== 'url' && (
      report.originalScore < 100 ||
      report.risks.some(r => r.risk !== 'safe')
    )
  );

  const stages = [
    'Reading file stream in browser memory...',
    'Detecting embedded EXIF & XML metadata...',
    'Evaluating privacy risks and location telemetry...',
    'Compiling comprehensive privacy audit...'
  ];

  const handleFileSelected = async (file: File) => {
    setCurrentFile(file);
    setIsScanning(true);
    setReport(null);
    setCleanedBlob(null);
    setIsSaved(false);

    // Run animated scanning stages
    for (let i = 0; i < stages.length; i++) {
      setScanStage(i);
      await new Promise((resolve) => setTimeout(resolve, 380));
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let generatedReport: UnifiedPrivacyReport;

      if (['jpg', 'jpeg', 'png', 'webp', 'tiff'].includes(ext || '')) {
        const imgData = await parseImageMetadata(file);
        generatedReport = {
          id: `rep_${Date.now()}`,
          type: 'image',
          targetName: file.name,
          originalScore: imgData.privacyScore,
          createdAt: Date.now(),
          risks: imgData.risks,
          isCleaned: false,
          details: { image: imgData },
        };
      } else if (ext === 'pdf') {
        const pdfData = await parsePdfMetadata(file);
        generatedReport = {
          id: `rep_${Date.now()}`,
          type: 'pdf',
          targetName: file.name,
          originalScore: pdfData.privacyScore,
          createdAt: Date.now(),
          risks: pdfData.risks,
          isCleaned: false,
          details: { pdf: pdfData },
        };
      } else if (['docx', 'xlsx', 'pptx'].includes(ext || '')) {
        const docData = await parseDocMetadata(file);
        generatedReport = {
          id: `rep_${Date.now()}`,
          type: 'document',
          targetName: file.name,
          originalScore: docData.privacyScore,
          createdAt: Date.now(),
          risks: docData.risks,
          isCleaned: false,
          details: { doc: docData },
        };
      } else {
        throw new Error('Unsupported format for Privacy Checkup');
      }

      setReport(generatedReport);
      logActivity({
        toolId: 'privacy-checkup',
        toolName: 'Privacy Checkup',
        targetName: file.name,
        type: 'scan',
        scoreBefore: generatedReport.originalScore,
      });
    } catch (err: any) {
      console.error('Privacy Checkup scanning failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCleanCurrentFile = async () => {
    if (!currentFile || !report) return;
    setIsCleaning(true);

    try {
      let resultBlob: Blob;
      let finalName: string;
      let removedItems: string[] = [];

      const ext = currentFile.name.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp', 'tiff'].includes(ext || '')) {
        const res = await stripImageMetadata(currentFile, { cleanAll: true });
        resultBlob = res.blob;
        finalName = res.fileName;
        removedItems = res.strippedItems;
      } else if (ext === 'pdf') {
        const res = await stripPdfMetadata(currentFile);
        resultBlob = res.blob;
        finalName = res.fileName;
        removedItems = res.strippedItems;
      } else if (['docx', 'xlsx', 'pptx'].includes(ext || '')) {
        const res = await stripDocMetadata(currentFile);
        resultBlob = res.blob;
        finalName = res.fileName;
        removedItems = res.strippedItems;
      } else {
        throw new Error('Cannot clean this file format');
      }

      setCleanedBlob(resultBlob);
      setCleanedFileName(finalName);
      setCleanedItemsList(removedItems);

      const updatedReport: UnifiedPrivacyReport = {
        ...report,
        isCleaned: true,
        cleanedScore: 100,
        cleanedRisks: removedItems,
        cleanFileName: finalName,
      };

      setReport(updatedReport);
      playPop();
      setTimeout(() => playSuccess(), 120);

      // Auto scroll to download section
      setTimeout(() => {
        if (downloadSectionRef.current) {
          downloadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#6366F1', '#3B82F6'],
        });
      } catch (e) {
        // Safe fallback
      }

      logActivity({
        toolId: 'privacy-checkup',
        toolName: 'Privacy Checkup (Cleaned)',
        targetName: currentFile.name,
        type: 'clean',
        scoreBefore: report.originalScore,
        scoreAfter: 100,
        itemsRemovedCount: removedItems.length,
      });
    } catch (err) {
      console.error('Cleaning failed:', err);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDownloadCleanFile = () => {
    if (!cleanedBlob || !cleanedFileName) return;
    const url = URL.createObjectURL(cleanedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUrlScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError(null);

    if (!urlInput || !urlInput.trim()) {
      setUrlError('Please paste or enter a URL to check.');
      return;
    }

    try {
      const urlResult = analyzeAndCleanUrl(urlInput);
      const rep: UnifiedPrivacyReport = {
        id: `rep_url_${Date.now()}`,
        type: 'url',
        targetName: urlResult.domain,
        originalScore: urlResult.privacyScore,
        cleanedScore: 100,
        createdAt: Date.now(),
        risks: urlResult.risks,
        cleanUrl: urlResult.cleanUrl,
        isCleaned: urlResult.removedParamsCount > 0,
        cleanedRisks: urlResult.trackingParams.map((p) => `${p.key} (${p.category})`),
        details: { url: urlResult },
      };

      setReport(rep);
      logActivity({
        toolId: 'url-privacy-cleaner',
        toolName: 'URL Checkup',
        targetName: urlResult.domain,
        type: 'scan',
        scoreBefore: urlResult.privacyScore,
        scoreAfter: 100,
        itemsRemovedCount: urlResult.removedParamsCount,
      });
    } catch (err: any) {
      setUrlError(err.message || 'Invalid web URL format.');
    }
  };

  const handleCopyCleanUrl = () => {
    if (report?.cleanUrl || report?.details?.url?.cleanUrl) {
      const target = report.cleanUrl || report.details?.url?.cleanUrl || '';
      navigator.clipboard.writeText(target);
      setCopiedCleanUrl(true);
      setTimeout(() => setCopiedCleanUrl(false), 2000);
    }
  };

  const handleSaveReportLocally = () => {
    if (report) {
      savePrivacyReport(report);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const resetAll = () => {
    setReport(null);
    setCurrentFile(null);
    setCleanedBlob(null);
    setUrlInput('');
    setUrlError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Flagship Privacy Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Run a Privacy Checkup
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Upload a file or paste a URL and discover what information it may reveal.
        </p>
        <div className="pt-1 flex justify-center">
          <TrustBadge type="local" showExplanation />
        </div>
      </div>

      {/* Tabs */}
      {!report && !isScanning && (
        <div className="flex justify-center">
          <div className="p-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#0E1524] shadow-[inset_3px_3px_6px_rgba(166,175,195,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.04)] flex items-center gap-1">
            <button
              onClick={() => {
                playPop();
                setActiveTab('file');
                setUrlError(null);
              }}
              onMouseEnter={playHover}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'file'
                  ? 'clay-pill-active text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>File Audit</span>
            </button>
            <button
              onClick={() => {
                playPop();
                setActiveTab('batch');
                setUrlError(null);
              }}
              onMouseEnter={playHover}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'batch'
                  ? 'clay-pill-active text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Files className="w-4 h-4" />
              <span>Batch Clean</span>
            </button>
            <button
              onClick={() => {
                playPop();
                setActiveTab('url');
                setUrlError(null);
              }}
              onMouseEnter={playHover}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'clay-pill-active text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>URL Check</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. File Upload Area */}
      {!report && !isScanning && activeTab === 'file' && (
        <div className="space-y-6 animate-fadeIn">
          <Dropzone
            onFileSelected={handleFileSelected}
            title="Drop your file here"
            subtitle="or choose a JPG, PNG, WEBP, PDF, or DOCX/XLSX/PPTX file"
            sampleType="any"
          />
        </div>
      )}

      {/* 2. Batch Upload Area */}
      {!report && !isScanning && activeTab === 'batch' && (
        <div className="space-y-6 animate-fadeIn">
          <BatchFileCleaner
            title="Batch clean multiple files at once"
            subtitle="Queue photos, PDFs, or Office documents for simultaneous local in-browser sanitization"
            acceptedFormats={['JPG', 'JPEG', 'PNG', 'WEBP', 'PDF', 'DOCX', 'XLSX', 'PPTX']}
            sampleType="any"
            accentColor="indigo"
            toolName="Privacy Checkup Batch"
          />
        </div>
      )}

      {/* 2. URL Check Input Area */}
      {!report && !isScanning && activeTab === 'url' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          <form onSubmit={handleUrlScan} className="space-y-4">
            <div className="clay-card p-6 sm:p-8 space-y-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Paste a URL to inspect
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://example.com/product?utm_source=instagram&fbclid=..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full clay-inset-search px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-all"
                />
              </div>

              {urlError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{urlError}</span>
                </div>
              )}

              <button
                type="submit"
                onMouseEnter={playHover}
                className="w-full py-3.5 rounded-full clay-button-pro font-bold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Link2 className="w-4 h-4" />
                <span>Audit & Clean URL</span>
              </button>
            </div>
          </form>

          {/* Quick sample URLs */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
              Or test with sample tracking links:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_URLS.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => {
                    playPop();
                    setUrlInput(sample.url);
                    setUrlError(null);
                  }}
                  onMouseEnter={playHover}
                  className="text-left p-3.5 rounded-2xl clay-inset-card hover:bg-slate-200/90 dark:hover:bg-[#131B2D] transition-all space-y-1 group cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-between">
                    <span>{sample.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{sample.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Scanning Animation */}
      {isScanning && (
        <div className="max-w-md mx-auto p-8 rounded-3xl clay-card text-center space-y-6 animate-fadeIn">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scanning for privacy risks...</h3>
            <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 animate-pulse">{stages[scanStage]}</p>
          </div>

          {/* Stepper */}
          <div className="space-y-2.5 text-left pt-2">
            {stages.map((stageText, idx) => (
              <div key={stageText} className="flex items-center gap-2.5 text-xs">
                {idx < scanStage ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : idx === scanStage ? (
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0"></div>
                )}
                <span className={idx <= scanStage ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-600'}>
                  {idx + 1}. {stageText.replace('...', '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Privacy Report Display */}
      {report && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Score Bar */}
          <div className="clay-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <ScoreMeter
                score={report.isCleaned && report.cleanedScore ? report.cleanedScore : report.originalScore}
                size="lg"
                showLabel={true}
              />
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Audit Target
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white max-w-sm truncate">
                  {report.targetName}
                </h2>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-medium">
                    {report.type.toUpperCase()}
                  </span>
                  {report.isCleaned ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Cleaned & Sanitized
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold">
                      {report.risks.filter((r) => r.risk !== 'safe').length} Risk Factor(s)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {!report.isCleaned && report.type !== 'url' && (
                <button
                  type="button"
                  onClick={handleCleanCurrentFile}
                  disabled={isCleaning}
                  onMouseEnter={playHover}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 active:scale-[0.98] cursor-pointer transition-all ${
                    needsCleaning
                      ? 'clay-button-pro sanitize-attention-glow text-white'
                      : 'clay-button-pro'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isCleaning ? 'Sanitizing in Memory...' : 'Remove Privacy Risks'}</span>
                </button>
              )}

              {report.isCleaned && report.type !== 'url' && cleanedBlob && (
                <button
                  type="button"
                  onClick={handleDownloadCleanFile}
                  onMouseEnter={playHover}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-[0.98] cursor-pointer animate-pulse hover:animate-none"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Clean File</span>
                </button>
              )}

              {report.type === 'url' && (
                <button
                  type="button"
                  onClick={handleCopyCleanUrl}
                  onMouseEnter={playHover}
                  className="px-4 py-2 rounded-full clay-button-pro font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCleanUrl ? 'Copied Clean URL!' : 'Copy Clean URL'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveReportLocally}
                onMouseEnter={playHover}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                    : 'clay-pill-inactive text-slate-700 dark:text-slate-300'
                }`}
                title="Save this report to your local device dashboard"
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? 'Saved Locally' : 'Save Report'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  resetAll();
                }}
                onMouseEnter={playHover}
                className="clay-circle-btn w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Scan another file or URL"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Before & After Cleaning Comparison Card */}
          {report.isCleaned && (
            <div 
              ref={downloadSectionRef}
              id="download-checkup-sign"
              className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 space-y-4 animate-fadeIn shadow-lg shadow-emerald-500/10 scroll-mt-28"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Privacy Risks Successfully Purged</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Before: <strong className="text-rose-600 dark:text-rose-400">{report.originalScore}/100</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200">After: <strong className="text-emerald-600 dark:text-emerald-400">100/100</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {(report.cleanedRisks || cleanedItemsList).map((item, idx) => (
                  <div key={`${item}-${idx}`} className="flex items-center gap-2 p-2.5 rounded-xl clay-inset-card text-xs text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{item} removed</span>
                  </div>
                ))}
              </div>

              {cleanedBlob && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleDownloadCleanFile}
                    onMouseEnter={playHover}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/35 flex items-center gap-2 cursor-pointer animate-pulse hover:animate-none"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Clean File ({cleanedFileName})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* URL Clean Result Box */}
          {report.type === 'url' && report.details?.url && (
            <div className="clay-card p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                URL Privacy Sanitization Result
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Original URL with Trackers:</span>
                  <p className="mt-1 p-3 rounded-2xl clay-inset-card text-rose-700 dark:text-rose-300 font-mono text-xs break-all">
                    {report.details.url.originalUrl}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sanitized Privacy-Safe URL:</span>
                  <div className="mt-1 p-3 rounded-2xl clay-inset-card text-emerald-700 dark:text-emerald-300 font-mono text-xs break-all flex items-center justify-between gap-3">
                    <span>{report.details.url.cleanUrl}</span>
                    <button
                      onClick={handleCopyCleanUrl}
                      onMouseEnter={playHover}
                      className="px-3 py-1 rounded-full clay-button-pro font-sans text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      {copiedCleanUrl ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Breakdown Cards */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Detected Information & Risk Factors</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                {report.risks.length} item(s) checked
              </span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {report.risks.map((risk) => {
                let badgeColor = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
                let cardClass = 'clay-card';
                if (risk.risk === 'high') {
                  badgeColor = 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30';
                  cardClass = 'clay-card border border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20';
                } else if (risk.risk === 'medium') {
                  badgeColor = 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30';
                  cardClass = 'clay-card border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20';
                }

                return (
                  <div
                    key={risk.id}
                    className={`p-5 rounded-3xl ${cardClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}
                        >
                          {risk.risk.toUpperCase()} RISK
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          [{risk.category}]
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {risk.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{risk.description}</p>
                      <div className="pt-1">
                        <span className="inline-block text-xs font-mono text-indigo-700 dark:text-indigo-300 clay-inset-card px-2.5 py-1 rounded-lg break-all">
                          {risk.value}
                        </span>
                      </div>
                    </div>

                    {!report.isCleaned && risk.removable && report.type !== 'url' && (
                      <button
                        type="button"
                        onClick={handleCleanCurrentFile}
                        onMouseEnter={playHover}
                        className="self-start sm:self-center px-3.5 py-1.5 rounded-full clay-pill-inactive text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                      >
                        {risk.actionLabel || 'Remove Risk'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structured Metadata Details Table */}
          <div className="clay-card p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Complete Metadata Field Audit
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Field Value / Detected Info</th>
                    <th className="pb-3 font-semibold">Risk Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                  {report.risks.map((risk) => (
                    <tr key={`tbl-${risk.id}`} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3 font-sans font-semibold text-slate-600 dark:text-slate-400">{risk.category}</td>
                      <td className="py-3 text-slate-800 dark:text-slate-200 break-all">{risk.value}</td>
                      <td className="py-3">
                        <span
                          className={`font-sans font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                            risk.risk === 'high'
                              ? 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
                              : risk.risk === 'medium'
                              ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10'
                              : 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                          }`}
                        >
                          {risk.risk.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
