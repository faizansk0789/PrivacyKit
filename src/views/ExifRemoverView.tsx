import React, { useState, useRef } from 'react';
import {
  ImageMinus,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  MapPin,
  Camera,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Dropzone } from '../components/common/Dropzone';
import { TrustBadge } from '../components/common/TrustBadge';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { parseImageMetadata, stripImageMetadata } from '../utils/exifEngine';
import { ImageExifData } from '../types';
import { logActivity } from '../utils/storage';
import { playPop, playHover, playSuccess } from '../utils/soundEngine';

interface ExifRemoverViewProps {
  onNavigate: (path: string) => void;
}

export const ExifRemoverView: React.FC<ExifRemoverViewProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [exifData, setExifData] = useState<ImageExifData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const downloadSectionRef = useRef<HTMLDivElement | null>(null);

  // Inspector collapse states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    location: true,
    device: true,
    date: true,
    technical: true,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Selective removal options
  const [cleanAll, setCleanAll] = useState(true);
  const [cleanGps, setCleanGps] = useState(true);
  const [cleanDevice, setCleanDevice] = useState(true);
  const [cleanTimestamps, setCleanTimestamps] = useState(true);
  const [cleanSoftware, setCleanSoftware] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Result state
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedFileName, setCleanedFileName] = useState('');
  const [strippedItems, setStrippedItems] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'inspector' | 'cleaner'>('inspector');

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setIsDone(false);
    setCleanedBlob(null);

    try {
      const data = await parseImageMetadata(selectedFile);
      setExifData(data);
      setActiveTab('inspector');
      if (selectedFile.type === 'image/png') setOutputFormat('image/png');
      
      logActivity({
        toolId: 'exif-remover',
        toolName: 'EXIF Metadata Inspector & Cleaner',
        targetName: selectedFile.name,
        type: 'scan',
        scoreBefore: data.privacyScore,
      });
    } catch (e) {
      console.error('Failed reading EXIF:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const needsCleaning = Boolean(
    exifData && (
      (exifData.risks && exifData.risks.some((r) => r.risk !== 'safe')) ||
      exifData.hasGps ||
      exifData.privacyScore < 100 ||
      (exifData.rawTags && Object.keys(exifData.rawTags).length > 0)
    )
  );

  const handleProcessClean = async () => {
    if (!file) return;
    setIsCleaning(true);
    playPop();

    try {
      const res = await stripImageMetadata(file, {
        cleanAll,
        cleanGps,
        cleanDevice,
        cleanTimestamps,
        cleanSoftware,
        outputType: outputFormat,
      });

      setCleanedBlob(res.blob);
      setCleanedFileName(res.fileName);
      setStrippedItems(res.strippedItems);
      setIsDone(true);
      setActiveTab('cleaner');

      // Play pop and celebration sounds
      playPop();
      setTimeout(() => playSuccess(), 120);

      // Trigger confetti
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#10B981', '#6366F1', '#3B82F6'],
        });
      } catch (e) {}

      // Automatically redirect/scroll smoothly to the download media sign
      setTimeout(() => {
        if (downloadSectionRef.current) {
          downloadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      logActivity({
        toolId: 'exif-remover',
        toolName: 'EXIF Metadata Inspector & Cleaner',
        targetName: file.name,
        type: 'clean',
        scoreBefore: exifData?.privacyScore || 50,
        scoreAfter: 100,
        itemsRemovedCount: res.strippedItems.length,
        bytesRemoved: Math.max(0, file.size - res.blob.size),
      });
    } catch (e) {
      console.error('Failed stripping metadata:', e);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDownload = () => {
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

  const reset = () => {
    setFile(null);
    setExifData(null);
    setCleanedBlob(null);
    setIsDone(false);
    setActiveTab('inspector');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm">
          <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Local Image Forensics & Sanitizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Photo EXIF Inspector & Cleaner
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Inspect hidden GPS coordinates, device serials, and timestamps, then instantly strip them before sharing your photos online.
        </p>
        <div className="pt-1 flex justify-center">
          <TrustBadge type="local" showExplanation />
        </div>
      </div>

      {/* Upload Dropzone */}
      {!exifData && (
        <div className="space-y-6 animate-fadeIn">
          <Dropzone
            onFileSelected={handleFileSelected}
            acceptedFormats={['JPG', 'JPEG', 'PNG', 'WEBP']}
            acceptedMimeTypes={['image/jpeg', 'image/png', 'image/webp']}
            title="Drop your photo to inspect & clean"
            subtitle="or choose a JPG, PNG, or WEBP photo from your computer"
            sampleType="image"
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Workspace */}
      {exifData && (
        <div className="space-y-8 animate-fadeIn">
          {/* File Card */}
          <div className="clay-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {exifData.previewUrl && (
                <img
                  src={exifData.previewUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-300 dark:border-slate-700/80 shadow-md shrink-0"
                />
              )}
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Selected Photo</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white max-w-xs sm:max-w-md truncate">
                  {exifData.fileName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{(exifData.fileSize / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{exifData.technical?.resolution || 'Original Resolution'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ScoreMeter score={isDone ? 100 : exifData.privacyScore} size="md" />
              <button
                type="button"
                onClick={reset}
                className="clay-circle-btn w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Select another photo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          {!isDone && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playPop();
                    setActiveTab('inspector');
                  }}
                  onMouseEnter={playHover}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'inspector'
                      ? 'clay-pill-active text-white'
                      : 'clay-pill-inactive text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Metadata Inspector</span>
                </button>
                <button
                  onClick={() => {
                    playPop();
                    setActiveTab('cleaner');
                  }}
                  onMouseEnter={playHover}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'cleaner'
                      ? 'clay-pill-active text-white'
                      : needsCleaning
                        ? 'clay-pill-active text-white sanitize-attention-glow'
                        : 'clay-pill-inactive text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ImageMinus className="w-4 h-4" />
                  <span>Sanitize & Clean</span>
                  {needsCleaning && (
                    <span className="w-2 h-2 rounded-full bg-rose-300 dark:bg-rose-400 animate-ping ml-0.5" />
                  )}
                </button>
              </div>

              {/* Status pill showing if safe or requires metadata removal */}
              <div>
                {!needsCleaning ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Metadata Safe & Clean</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Action Required: Metadata Detected</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Inspector */}
          {!isDone && activeTab === 'inspector' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Prominent GPS Warning if GPS Exists */}
              {exifData.hasGps && exifData.location && (
                <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/25 text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-900 dark:text-white flex items-center gap-2">
                        <span>⚠️ This photo contains precise GPS location coordinates.</span>
                      </h3>
                      <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-0.5">
                        Anyone downloading this file can pinpoint the exact street location where it was taken ({exifData.location.latitude?.toFixed(5)}, {exifData.location.longitude?.toFixed(5)}).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {exifData.location.mapUrl && (
                      <a
                        href={exifData.location.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => setActiveTab('cleaner')}
                      className="px-3.5 py-2 rounded-full clay-pill-inactive text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <ImageMinus className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Location Section */}
              <div className="rounded-3xl clay-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('location')}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Geographic Location</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {exifData.hasGps ? 'GPS coordinates and elevation detected' : 'No GPS coordinates found'}
                      </p>
                    </div>
                  </div>
                  {openSections.location ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.location && (
                  <div className="p-6 pt-0 border-t border-slate-200 dark:border-slate-800/80">
                    {exifData.location ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
                        <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                          <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Latitude</span>
                          <p className="text-slate-900 dark:text-white font-bold text-sm">{exifData.location.latitude?.toFixed(6)}°</p>
                        </div>
                        <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                          <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Longitude</span>
                          <p className="text-slate-900 dark:text-white font-bold text-sm">{exifData.location.longitude?.toFixed(6)}°</p>
                        </div>
                        <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                          <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Altitude</span>
                          <p className="text-slate-900 dark:text-white font-bold text-sm">
                            {exifData.location.altitude ? `${exifData.location.altitude.toFixed(1)} meters` : 'Not recorded'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="pt-4 text-xs text-slate-500 dark:text-slate-400">No embedded GPS latitude or longitude tags were found in this image file.</p>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Device & Hardware */}
              <div className="rounded-3xl clay-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('device')}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Camera & Device Hardware</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {exifData.device?.model || exifData.device?.make || 'Hardware profiles'}
                      </p>
                    </div>
                  </div>
                  {openSections.device ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.device && (
                  <div className="p-6 pt-0 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs font-mono">
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Manufacturer</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.device?.make || 'None'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Camera Model</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.device?.model || 'None'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Lens Profile</span>
                        <p className="text-slate-900 dark:text-white font-semibold truncate">{exifData.device?.lensModel || 'None'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Software / Firmware</span>
                        <p className="text-slate-900 dark:text-white font-semibold truncate">{exifData.device?.software || 'None'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Hardware Serial</span>
                        <p className="text-rose-600 dark:text-rose-400 font-bold">{exifData.device?.serialNumber || 'Not embedded'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Timestamps */}
              <div className="rounded-3xl clay-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('date')}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Date & Timestamps</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Capture timelines and creation history</p>
                    </div>
                  </div>
                  {openSections.date ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.date && (
                  <div className="p-6 pt-0 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Date Taken</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.date?.dateTimeOriginal || 'Not recorded'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Date Digitized</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.date?.dateTimeDigitized || 'Not recorded'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Timezone Offset</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.date?.offsetTime || 'None'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Technical Settings */}
              <div className="rounded-3xl clay-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('technical')}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Technical Camera Settings</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Resolution, ISO, aperture, focal length, and exposure</p>
                    </div>
                  </div>
                  {openSections.technical ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.technical && (
                  <div className="p-6 pt-0 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono">
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Resolution</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.technical?.resolution || 'N/A'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">ISO Speed</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.technical?.iso ? `ISO ${exifData.technical.iso}` : 'N/A'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Aperture</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.technical?.fNumber ? `f/${exifData.technical.fNumber}` : 'N/A'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Exposure Time</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.technical?.exposureTime || 'N/A'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Focal Length</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.technical?.focalLength || 'N/A'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Flash Mode</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.technical?.flash || 'N/A'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">White Balance</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.technical?.whiteBalance || 'N/A'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl clay-inset-card space-y-1">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-sans">Color Space</span>
                        <p className="text-slate-900 dark:text-white font-semibold">{exifData.technical?.colorSpace || 'sRGB'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Cleaner */}
          {!isDone && activeTab === 'cleaner' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              {/* Left 2 Cols: Options */}
              <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl clay-card space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Sanitization Options</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose which metadata fields to eliminate</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCleanAll(true);
                      setCleanGps(true);
                      setCleanDevice(true);
                      setCleanTimestamps(true);
                      setCleanSoftware(true);
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    Select All (Recommended)
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:bg-slate-200/80 dark:hover:bg-[#131B2D] transition-colors">
                    <input
                      type="checkbox"
                      checked={cleanAll || cleanGps}
                      onChange={(e) => {
                        setCleanAll(false);
                        setCleanGps(e.target.checked);
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Remove GPS Location Coordinates</span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Removes latitude, longitude, altitude, and mapping tags.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:bg-slate-200/80 dark:hover:bg-[#131B2D] transition-colors">
                    <input
                      type="checkbox"
                      checked={cleanAll || cleanDevice}
                      onChange={(e) => {
                        setCleanAll(false);
                        setCleanDevice(e.target.checked);
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-500" />
                        <span>Remove Camera Hardware & Serial Numbers</span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Removes camera brand, model, lens ID, and unique serial hashes.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:bg-slate-200/80 dark:hover:bg-[#131B2D] transition-colors">
                    <input
                      type="checkbox"
                      checked={cleanAll || cleanTimestamps}
                      onChange={(e) => {
                        setCleanAll(false);
                        setCleanTimestamps(e.target.checked);
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Remove Exact Creation Timestamps</span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Removes original date taken, digitized times, and timezone tags.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl clay-inset-card cursor-pointer hover:bg-slate-200/80 dark:hover:bg-[#131B2D] transition-colors">
                    <input
                      type="checkbox"
                      checked={cleanAll || cleanSoftware}
                      onChange={(e) => {
                        setCleanAll(false);
                        setCleanSoftware(e.target.checked);
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Remove Editing Software & Author Details</span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Removes Photoshop/Lightroom footprints, author names, and copyrights.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Right Col: Action & Summary */}
              <div className="p-6 sm:p-8 rounded-3xl clay-card space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Execute Action</h3>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Output Format
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e: any) => setOutputFormat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl clay-inset-search text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    >
                      <option value="image/jpeg">JPEG (.jpg) — Standard</option>
                      <option value="image/png">PNG (.png) — Lossless</option>
                      <option value="image/webp">WEBP (.webp) — Modern</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-2xl clay-inset-card text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero Quality Degradation</span>
                    </div>
                    <p>Image pixels remain visually identical while all auxiliary binary metadata tags are stripped.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProcessClean}
                  disabled={isCleaning}
                  onMouseEnter={playHover}
                  className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer transition-all ${
                    needsCleaning
                      ? 'clay-button-pro sanitize-attention-glow text-white'
                      : 'clay-button-pro'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isCleaning ? 'Cleaning Image...' : 'Strip Selected Metadata'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Box after Cleaning with Download Media Sign */}
          {isDone && (
            <div 
              ref={downloadSectionRef}
              id="download-media-sign"
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
                      Sanitized Media Ready for Download
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      All selected metadata headers have been completely expunged. Visual quality is 100% preserved.
                    </p>
                  </div>
                </div>

                {/* Download image or media sign */}
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    handleDownload();
                  }}
                  onMouseEnter={playHover}
                  className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/35 flex items-center justify-center gap-2.5 active:scale-[0.98] shrink-0 cursor-pointer animate-pulse hover:animate-none"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Clean Image</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 border-t border-emerald-500/20">
                {strippedItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{item} removed</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEO / FAQ Section */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-600 dark:text-slate-400">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Does removing EXIF reduce photo resolution?</h4>
          <p className="leading-relaxed">
            No. PrivacyKit strips auxiliary data chunks while preserving 100% of pixel dimensions and full visual clarity.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Can social networks still see my GPS data?</h4>
          <p className="leading-relaxed">
            While some major platforms strip EXIF upon upload, many direct message apps, forums, and cloud storage providers do not. Cleaning your photos before sharing guarantees your location privacy regardless of where the file is sent.
          </p>
        </div>
      </div>
    </div>
  );
};

