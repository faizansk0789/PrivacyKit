export type ToolId = 
  | 'privacy-checkup'
  | 'exif-remover'
  | 'pdf-metadata-cleaner'
  | 'doc-metadata-cleaner'
  | 'url-privacy-cleaner'
  | 'audio-metadata-cleaner'
  | 'video-metadata-cleaner'
  | 'password-generator'
  | 'passphrase-generator'
  | 'username-generator';

export type ToolCategory = 'All' | 'Images' | 'Documents' | 'Links' | 'Media' | 'Security' | 'Privacy Checkup';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  shortDesc: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  path: string;
  badge?: string;
  processingType: 'local' | 'server';
  featured?: boolean;
  supportedFormats?: string[];
  tags: string[];
}

export type RiskLevel = 'high' | 'medium' | 'low' | 'safe';

export interface PrivacyRiskItem {
  id: string;
  category: 'GPS' | 'Device' | 'Personal' | 'Software' | 'Timestamp' | 'Tracking' | 'Technical';
  title: string;
  description: string;
  value: string;
  risk: RiskLevel;
  removable: boolean;
  actionLabel?: string;
}

export interface ExifLocation {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  latitudeRef?: string;
  longitudeRef?: string;
  mapUrl?: string;
}

export interface ExifDeviceInfo {
  make?: string;
  model?: string;
  lensModel?: string;
  software?: string;
  serialNumber?: string;
}

export interface ExifDateTimeInfo {
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  modifyDate?: string;
  offsetTime?: string;
}

export interface ExifTechnicalInfo {
  resolution?: string;
  width?: number;
  height?: number;
  iso?: number | string;
  exposureTime?: string;
  fNumber?: string;
  focalLength?: string;
  flash?: string;
  whiteBalance?: string;
  colorSpace?: string;
  meteringMode?: string;
}

export interface ImageExifData {
  fileName: string;
  fileSize: number;
  fileType: string;
  location?: ExifLocation;
  device?: ExifDeviceInfo;
  date?: ExifDateTimeInfo;
  technical?: ExifTechnicalInfo;
  rawTags: Record<string, string | number | undefined>;
  risks: PrivacyRiskItem[];
  privacyScore: number;
  hasGps: boolean;
  previewUrl?: string;
}

export interface PdfMetadataInfo {
  fileName: string;
  fileSize: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount?: number;
  pdfVersion?: string;
  risks: PrivacyRiskItem[];
  privacyScore: number;
}

export interface DocMetadataInfo {
  fileName: string;
  fileSize: number;
  fileType: 'docx' | 'xlsx' | 'pptx';
  title?: string;
  subject?: string;
  creator?: string;
  lastModifiedBy?: string;
  created?: string;
  modified?: string;
  company?: string;
  manager?: string;
  application?: string;
  totalTime?: string;
  template?: string;
  risks: PrivacyRiskItem[];
  privacyScore: number;
}

export interface UrlTrackingParam {
  key: string;
  value: string;
  category: 'Advertising' | 'Analytics' | 'Social' | 'Referral' | 'Click ID' | 'Unknown Tracker';
  description: string;
}

export interface UrlAnalysisResult {
  originalUrl: string;
  cleanUrl: string;
  domain: string;
  protocol: string;
  pathname: string;
  trackingParams: UrlTrackingParam[];
  cleanParams: Record<string, string>;
  totalParams: number;
  removedParamsCount: number;
  privacyScore: number;
  risks: PrivacyRiskItem[];
  redirectNotice?: string;
}

export interface UnifiedPrivacyReport {
  id: string;
  type: 'image' | 'pdf' | 'document' | 'url';
  targetName: string;
  originalScore: number;
  cleanedScore?: number;
  createdAt: number;
  risks: PrivacyRiskItem[];
  cleanedRisks?: string[];
  cleanFileBlob?: Blob;
  cleanFileName?: string;
  cleanUrl?: string;
  isCleaned: boolean;
  details?: {
    image?: ImageExifData;
    pdf?: PdfMetadataInfo;
    doc?: DocMetadataInfo;
    url?: UrlAnalysisResult;
  };
}

export interface UserActivityLog {
  id: string;
  toolId: ToolId;
  toolName: string;
  targetName: string;
  timestamp: number;
  type: 'scan' | 'clean' | 'generate';
  scoreBefore?: number;
  scoreAfter?: number;
  itemsRemovedCount?: number;
  bytesRemoved?: number;
}

export interface UserAccount {
  isLoggedIn: boolean;
  email?: string;
  plan: 'free' | 'pro' | 'business';
  usageCount: number;
  usageLimit: number;
  savedReports: UnifiedPrivacyReport[];
  activityLogs: UserActivityLog[];
}
