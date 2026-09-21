import { UnifiedPrivacyReport, UserAccount, UserActivityLog } from '../types';

const STORAGE_KEY_ACCOUNT = 'privacykit_account_v1';
const STORAGE_KEY_ACTIVITY = 'privacykit_activity_v1';
const STORAGE_KEY_REPORTS = 'privacykit_saved_reports_v1';

export function getStoredAccount(): UserAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading account state', e);
  }

  const defaultAccount: UserAccount = {
    isLoggedIn: false,
    email: undefined,
    plan: 'free',
    usageCount: 3,
    usageLimit: 9999,
    savedReports: [],
    activityLogs: [
      {
        id: 'init-log-1',
        toolId: 'exif-remover',
        toolName: 'EXIF Metadata Remover',
        targetName: 'IMG_20260824_1402.jpg',
        timestamp: Date.now() - 3600 * 1000 * 4,
        type: 'clean',
        scoreBefore: 55,
        scoreAfter: 100,
        itemsRemovedCount: 4,
        bytesRemoved: 24500,
      },
      {
        id: 'init-log-2',
        toolId: 'url-privacy-cleaner',
        toolName: 'URL Privacy Cleaner',
        targetName: 'https://store.example.com/item?utm_source=fb&fbclid=...',
        timestamp: Date.now() - 3600 * 1000 * 18,
        type: 'clean',
        scoreBefore: 40,
        scoreAfter: 100,
        itemsRemovedCount: 3,
        bytesRemoved: 140,
      }
    ],
  };

  return defaultAccount;
}

export const getUserAccount = getStoredAccount;

export function saveStoredAccount(account: UserAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNT, JSON.stringify(account));
  } catch (e) {
    console.error('Failed saving account state', e);
  }
}

export const saveUserAccount = saveStoredAccount;

export function getActivityLogs(): UserActivityLog[] {
  const acc = getStoredAccount();
  return acc.activityLogs || [];
}

export function getSavedPrivacyReports(): UnifiedPrivacyReport[] {
  const acc = getStoredAccount();
  return acc.savedReports || [];
}

export function logActivity(log: Omit<UserActivityLog, 'id' | 'timestamp'>): void {
  const account = getStoredAccount();
  const newLog: UserActivityLog = {
    ...log,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  account.activityLogs = [newLog, ...(account.activityLogs || []).slice(0, 49)];
  account.usageCount = Math.min(account.usageLimit, account.usageCount + 1);
  saveStoredAccount(account);
}

export function savePrivacyReport(report: UnifiedPrivacyReport): void {
  const account = getStoredAccount();
  const storableReport: UnifiedPrivacyReport = {
    ...report,
    cleanFileBlob: undefined,
  };

  const saved = account.savedReports || [];
  const existingIndex = saved.findIndex(r => r.id === report.id);
  if (existingIndex >= 0) {
    saved[existingIndex] = storableReport;
  } else {
    account.savedReports = [storableReport, ...saved.slice(0, 19)];
  }

  saveStoredAccount(account);
}

export function deleteSavedReport(id: string): void {
  const account = getStoredAccount();
  account.savedReports = (account.savedReports || []).filter(r => r.id !== id);
  saveStoredAccount(account);
}

export const deletePrivacyReport = deleteSavedReport;

export function clearActivityLogs(): void {
  const account = getStoredAccount();
  account.activityLogs = [];
  saveStoredAccount(account);
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACCOUNT);
    localStorage.removeItem(STORAGE_KEY_ACTIVITY);
    localStorage.removeItem(STORAGE_KEY_REPORTS);
  } catch (e) {
    console.error('Failed clearing local privacy storage', e);
  }
}

export function getLocalStorageUsage(): { bytes: number; formatted: string } {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('privacykit_')) {
        const val = localStorage.getItem(key) || '';
        total += (key.length + val.length) * 2; // UTF-16 characters = 2 bytes
      }
    }
    const formatted = total > 1024 * 1024
      ? `${(total / (1024 * 1024)).toFixed(2)} MB`
      : total > 1024
      ? `${(total / 1024).toFixed(1)} KB`
      : `${total} B`;
    return { bytes: total, formatted };
  } catch (e) {
    return { bytes: 0, formatted: '0 B' };
  }
}
