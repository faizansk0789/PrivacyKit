import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Bookmark,
  Trash2,
  Download,
  CheckCircle2,
  FileCheck,
  HardDriveDownload,
  AlertTriangle,
  Scan,
  Search,
  Lock,
  HardDrive,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
  Image,
  Link2,
  Video,
  Music,
  RefreshCw,
  X
} from 'lucide-react';
import {
  getActivityLogs,
  getSavedPrivacyReports,
  deletePrivacyReport,
  clearActivityLogs,
  getUserAccount,
  getLocalStorageUsage
} from '../utils/storage';
import { UserActivityLog, UnifiedPrivacyReport, UserAccount } from '../types';
import { playPop, playHover, playSuccess } from '../utils/soundEngine';

interface DashboardViewProps {
  onNavigate: (path: string) => void;
  onOpenAuth?: (mode?: 'signin') => void;
  account?: UserAccount;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, account: propAccount }) => {
  const [account, setAccount] = useState<UserAccount>(propAccount || getUserAccount());
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [savedReports, setSavedReports] = useState<UnifiedPrivacyReport[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'reports'>('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'clean' | 'scan'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showClearModal, setShowClearModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState<{ bytes: number; formatted: string }>({ bytes: 0, formatted: '0 B' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const reloadData = () => {
    setAccount(propAccount || getUserAccount());
    setLogs(getActivityLogs());
    setSavedReports(getSavedPrivacyReports());
    setStorageUsage(getLocalStorageUsage());
  };

  useEffect(() => {
    reloadData();
  }, [propAccount]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleConfirmClear = () => {
    clearActivityLogs();
    reloadData();
    setShowClearModal(false);
    playPop();
    showToast('Activity history cleared successfully.');
  };

  const handleDeleteReport = (id: string) => {
    playPop();
    deletePrivacyReport(id);
    reloadData();
    showToast('Saved report removed.');
  };

  const handleCopyTarget = (text: string, id: string) => {
    playPop();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    playSuccess();
    const exportData = {
      app: 'PrivacyKit',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      storageStats: storageUsage,
      accountSummary: {
        plan: account.plan,
        usageCount: account.usageCount,
      },
      activityLogs: logs,
      savedReports,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacykit-audit-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported audit report as JSON');
  };

  const totalScans = logs.length;
  const totalFilesCleaned = logs.filter(l => l.type === 'clean').length;
  const totalItemsRemoved = logs.reduce((acc, l) => acc + (l.itemsRemovedCount || 0), 0);
  const totalBytesRemoved = logs.reduce((acc, l) => acc + (l.bytesRemoved || 0), 0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getToolIcon = (toolId?: string, toolName?: string) => {
    const text = `${toolId || ''} ${toolName || ''}`.toLowerCase();
    if (text.includes('exif') || text.includes('image') || text.includes('photo')) {
      return <Image className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
    }
    if (text.includes('pdf') || text.includes('doc')) {
      return <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />;
    }
    if (text.includes('url') || text.includes('link')) {
      return <Link2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    }
    if (text.includes('video')) {
      return <Video className="w-4 h-4 text-fuchsia-500 dark:text-fuchsia-400" />;
    }
    if (text.includes('audio')) {
      return <Music className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    }
    return <Shield className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
  };

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (filterType !== 'all' && log.type !== filterType) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (log.targetName && log.targetName.toLowerCase().includes(q)) ||
          (log.toolName && log.toolName.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return b.timestamp - a.timestamp;
        return a.timestamp - b.timestamp;
      });
  }, [logs, filterType, searchQuery, sortOrder]);

  // Filter saved reports
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return savedReports;
    const q = searchQuery.toLowerCase();
    return savedReports.filter((r) =>
      r.targetName.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
    );
  }, [savedReports, searchQuery]);

  return (
    <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-8 overflow-hidden sm:overflow-visible">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-4 py-2 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
              Personal Privacy Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% Client-Side
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 break-words max-w-2xl">
            Audit history, sanitized file metrics, and local browser storage logs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 shrink-0">
          <button
            id="dashboard-refresh-btn"
            onClick={() => {
              playPop();
              reloadData();
              showToast('Dashboard refreshed');
            }}
            onMouseEnter={playHover}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-[#1A2438] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer active:scale-95"
            title="Refresh logs"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            id="dashboard-export-json-btn"
            onClick={handleExportJson}
            onMouseEnter={playHover}
            className="px-3.5 sm:px-4 py-2 rounded-full clay-button-pro text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            title="Export local records as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Visual Metric Cards (4 Volumetric Stat Pods) */}
      <section aria-label="Visual Summary Section">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Files Sanitized */}
          <div 
            id="stat-files-cleaned"
            className="clay-card p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                Files Cleaned
              </span>
              <div className="w-8 h-8 rounded-xl clay-icon-pod flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {totalFilesCleaned}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">Scrubbed locally</p>
              </div>
            </div>
          </div>

          {/* 2. Sensitive Metadata Stripped */}
          <div 
            id="stat-bytes-removed"
            className="clay-card p-4 sm:p-5 flex flex-col justify-between ring-1 ring-purple-300/40 dark:ring-purple-700/40 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-purple-700 dark:text-purple-300 text-[11px] uppercase font-bold tracking-wider">
                Stripped
              </span>
              <div className="w-8 h-8 rounded-xl clay-icon-pod flex items-center justify-center">
                <HardDriveDownload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-900 dark:text-purple-200 font-mono tracking-tight truncate">
                {formatBytes(totalBytesRemoved)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold truncate">Sensitive data purged</p>
              </div>
            </div>
          </div>

          {/* 3. Risk Items Purged */}
          <div 
            id="stat-risks-purged"
            className="clay-card p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                Risk Items
              </span>
              <div className="w-8 h-8 rounded-xl clay-icon-pod flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {totalItemsRemoved}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold truncate">GPS, EXIF & Trackers</p>
              </div>
            </div>
          </div>

          {/* 4. Total Audits Run */}
          <div 
            id="stat-total-audits"
            className="clay-card p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                Total Audits
              </span>
              <div className="w-8 h-8 rounded-xl clay-icon-pod flex items-center justify-center">
                <Scan className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {totalScans}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">In-browser sessions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Storage Health & Browser Storage Gauge */}
      <section 
        id="storage-health-banner"
        className="clay-card p-4 sm:p-5 border border-indigo-200/60 dark:border-indigo-900/40"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Browser Storage Health
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                {storageUsage.formatted} used
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-xl">
              All records exist exclusively in your browser's private local memory. Zero logs or files are ever sent to remote servers.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <Lock className="w-3.5 h-3.5" />
              <span>Air-Gapped & Offline</span>
            </div>
          </div>
        </div>

        {/* Tactile progress bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1">
            <span>Storage Allocated: {storageUsage.formatted}</span>
            <span>Estimated Browser Quota: ~5.0 MB (&lt; 1% used)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(2, (storageUsage.bytes / (5 * 1024 * 1024)) * 100))}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Tabs Container */}
      <div className="space-y-4">
        {/* Tab switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          {/* Tactile Inset Tabs */}
          <div className="inline-flex p-1 rounded-full clay-card gap-1 shadow-sm shrink-0">
            <button
              id="dashboard-tab-activity"
              onClick={() => {
                playPop();
                setActiveTab('activity');
              }}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'clay-pill-active'
                  : 'clay-pill-inactive'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Activity History ({logs.length})</span>
            </button>
            <button
              id="dashboard-tab-reports"
              onClick={() => {
                playPop();
                setActiveTab('reports');
              }}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'clay-pill-active'
                  : 'clay-pill-inactive'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Reports ({savedReports.length})</span>
            </button>
          </div>

          {/* Search and Clear action */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="w-full pl-8 pr-7 py-1.5 rounded-full bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {activeTab === 'activity' && logs.length > 0 && (
              <button
                id="dashboard-clear-logs-btn"
                onClick={() => {
                  playPop();
                  setShowClearModal(true);
                }}
                className="px-3 py-1.5 rounded-full text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Activity Log Tab Content */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {/* Filter pills if logs exist */}
            {logs.length > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                      filterType === 'all'
                        ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    All ({logs.length})
                  </button>
                  <button
                    onClick={() => setFilterType('clean')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                      filterType === 'clean'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Cleaned ({logs.filter(l => l.type === 'clean').length})
                  </button>
                  <button
                    onClick={() => setFilterType('scan')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                      filterType === 'scan'
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Scans ({logs.filter(l => l.type === 'scan').length})
                  </button>
                </div>

                <button
                  onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                  className="text-[11px] hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer"
                >
                  Sorted: {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                </button>
              </div>
            )}

            {/* List or Empty State */}
            {filteredLogs.length === 0 ? (
              <div className="p-8 sm:p-10 text-center rounded-3xl clay-card text-xs text-slate-600 dark:text-slate-400 space-y-4">
                <div className="w-12 h-12 rounded-2xl clay-icon-pod mx-auto flex items-center justify-center text-slate-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {searchQuery ? 'No matching activity records found.' : 'No local activity recorded yet.'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {searchQuery
                      ? 'Try adjusting your search query or reset filters.'
                      : 'Run any privacy tool or checkup to view real-time sanitization records.'}
                  </p>
                </div>

                {!searchQuery && (
                  <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
                    <button
                      onClick={() => onNavigate('/tools/exif-remover')}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 text-center transition-all cursor-pointer group"
                    >
                      <Image className="w-4 h-4 mx-auto mb-1 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Clean Photos</span>
                    </button>
                    <button
                      onClick={() => onNavigate('/tools/pdf-metadata-cleaner')}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-800 text-center transition-all cursor-pointer group"
                    >
                      <FileText className="w-4 h-4 mx-auto mb-1 text-sky-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Clean PDFs</span>
                    </button>
                    <button
                      onClick={() => onNavigate('/tools/url-privacy-cleaner')}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 text-center transition-all cursor-pointer group"
                    >
                      <Link2 className="w-4 h-4 mx-auto mb-1 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Clean URLs</span>
                    </button>
                    <button
                      onClick={() => onNavigate('/privacy-checkup')}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-800 text-center transition-all cursor-pointer group"
                    >
                      <Shield className="w-4 h-4 mx-auto mb-1 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Run Checkup</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="clay-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl clay-icon-pod flex items-center justify-center shrink-0 mt-0.5">
                        {getToolIcon(log.toolId, log.toolName)}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md block"
                            title={log.targetName}
                          >
                            {log.targetName}
                          </span>
                          <button
                            onClick={() => handleCopyTarget(log.targetName, log.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Copy file name / target"
                          >
                            {copiedId === log.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                            {log.toolName}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {new Date(log.timestamp).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 flex-wrap">
                      {log.scoreBefore !== undefined && (
                        <div className="text-right font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
                          <span>Score: </span>
                          <strong className={log.scoreAfter && log.scoreAfter >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                            {log.scoreAfter || log.scoreBefore}/100
                          </strong>
                        </div>
                      )}
                      {log.itemsRemovedCount ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                          {log.itemsRemovedCount} cleaned
                        </span>
                      ) : null}
                      {log.bytesRemoved ? (
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                          -{formatBytes(log.bytesRemoved)}
                        </span>
                      ) : null}

                      {/* Tool quick launch link */}
                      {log.toolId && (
                        <button
                          onClick={() => onNavigate(`/tools/${log.toolId}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Open tool again"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Saved Reports Tab Content */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="p-8 sm:p-10 text-center rounded-3xl clay-card text-xs text-slate-600 dark:text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl clay-icon-pod mx-auto flex items-center justify-center text-slate-400">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {searchQuery ? 'No matching saved reports found.' : 'No saved reports bookmarked yet.'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    When you run a Unified Privacy Checkup, click "Save Report" to bookmark your audit history for future review.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/privacy-checkup')}
                  className="px-4 py-2 rounded-full clay-button-pro text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Privacy Checkup</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredReports.map((r) => (
                  <div
                    key={r.id}
                    className="clay-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl clay-icon-pod flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md block">
                            {r.targetName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-mono uppercase font-bold">
                            {r.type}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Saved on {new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} • {r.risks.length} risk items identified
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onNavigate('/privacy-checkup')}
                        className="px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      >
                        Inspect in Checkup
                      </button>
                      <button
                        onClick={() => handleDeleteReport(r.id)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete saved report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clearing Logs (In-App Dialog avoiding window.confirm) */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="clay-card p-6 max-w-sm w-full space-y-4 shadow-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Clear All Activity History?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  This will wipe all local audit logs and file scrubbing history from your browser's private storage. Files already downloaded to your machine are unaffected.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    playPop();
                    setShowClearModal(false);
                  }}
                  className="flex-1 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClear}
                  className="flex-1 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Yes, Clear History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

