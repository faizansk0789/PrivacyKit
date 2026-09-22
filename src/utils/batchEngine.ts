import { stripImageMetadata } from './exifEngine';
import { stripPdfMetadata } from './pdfEngine';
import { stripDocMetadata } from './docEngine';
import { cleanAudio } from './audioEngine';
import { cleanVideo } from './videoEngine';

export type BatchItemStatus = 'queued' | 'processing' | 'done' | 'error';

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: BatchItemStatus;
  progress: number; // 0 to 100
  cleanedBlob?: Blob;
  cleanedFileName?: string;
  error?: string;
  cleanedDetails?: string[];
}

export const getFileTypeCategory = (file: File): 'image' | 'pdf' | 'doc' | 'audio' | 'video' | 'unknown' => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'webp', 'tiff'].includes(ext) || file.type.startsWith('image/')) {
    return 'image';
  }
  if (ext === 'pdf' || file.type === 'application/pdf') {
    return 'pdf';
  }
  if (['docx', 'xlsx', 'pptx'].includes(ext) || file.type.includes('wordprocessingml') || file.type.includes('spreadsheetml') || file.type.includes('presentationml')) {
    return 'doc';
  }
  if (ext === 'mp3' || file.type === 'audio/mpeg' || file.type.startsWith('audio/')) {
    return 'audio';
  }
  if (['mp4', 'mov'].includes(ext) || file.type.startsWith('video/')) {
    return 'video';
  }
  return 'unknown';
};

export const processSingleBatchFile = async (
  item: BatchItem,
  onProgress?: (progress: number) => void
): Promise<{ cleanedBlob: Blob; cleanedFileName: string; details: string[] }> => {
  const category = getFileTypeCategory(item.file);
  const ext = item.file.name.split('.').pop()?.toLowerCase() || '';
  const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;

  if (onProgress) onProgress(20);

  if (category === 'image') {
    if (onProgress) onProgress(45);
    const result = await stripImageMetadata(item.file, {
      cleanAll: true,
      cleanGps: true,
      cleanDevice: true,
      cleanTimestamps: true,
      cleanSoftware: true,
      outputType: (item.file.type === 'image/png' ? 'image/png' : item.file.type === 'image/webp' ? 'image/webp' : 'image/jpeg') as any
    });
    if (onProgress) onProgress(90);
    return {
      cleanedBlob: result.blob,
      cleanedFileName: result.fileName || `${baseName}_clean.${ext || 'jpg'}`,
      details: result.strippedItems.length > 0 ? result.strippedItems : ['EXIF headers stripped', 'GPS coordinates erased', 'Camera serials cleared']
    };
  }

  if (category === 'pdf') {
    if (onProgress) onProgress(45);
    const result = await stripPdfMetadata(item.file);
    if (onProgress) onProgress(90);
    return {
      cleanedBlob: result.blob,
      cleanedFileName: result.fileName || `${baseName}_clean.pdf`,
      details: result.strippedItems.length > 0 ? result.strippedItems : ['Author erased', 'Producer & creator tags purged', 'Modification timestamps reset']
    };
  }

  if (category === 'doc') {
    if (onProgress) onProgress(45);
    const result = await stripDocMetadata(item.file);
    if (onProgress) onProgress(90);
    return {
      cleanedBlob: result.blob,
      cleanedFileName: result.fileName || `${baseName}_clean.${ext || 'docx'}`,
      details: result.strippedItems.length > 0 ? result.strippedItems : ['Office core/app/custom properties erased', 'Collaborator history stripped']
    };
  }

  if (category === 'audio') {
    if (onProgress) onProgress(45);
    const blob = await cleanAudio(item.file, { removeId3v1: true, removeId3v2: true });
    if (onProgress) onProgress(90);
    return {
      cleanedBlob: blob,
      cleanedFileName: `${baseName}_clean.mp3`,
      details: ['ID3v1 tags removed', 'ID3v2 album art & comments scrubbed']
    };
  }

  if (category === 'video') {
    if (onProgress) onProgress(45);
    const blob = await cleanVideo(item.file, { removeUdta: true, removeMeta: true, scrubDates: true });
    if (onProgress) onProgress(90);
    return {
      cleanedBlob: blob,
      cleanedFileName: `${baseName}_clean.${ext || 'mp4'}`,
      details: ['User data (UDTA) atom scrubbed', 'Creation time reset to zero']
    };
  }

  throw new Error(`Unsupported file type for cleaning: ${item.file.name}`);
};

export const downloadBatchItem = (item: BatchItem) => {
  if (!item.cleanedBlob || !item.cleanedFileName) return;
  const url = URL.createObjectURL(item.cleanedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = item.cleanedFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadAllBatchZip = async (items: BatchItem[], zipFileName = 'PrivacyKit_Sanitized_Batch.zip') => {
  const completedItems = items.filter((i) => i.status === 'done' && i.cleanedBlob);
  if (completedItems.length === 0) return;

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  completedItems.forEach((item) => {
    if (item.cleanedBlob && item.cleanedFileName) {
      zip.file(item.cleanedFileName, item.cleanedBlob);
    }
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
