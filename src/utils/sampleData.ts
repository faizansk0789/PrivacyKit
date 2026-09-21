import { ToolDefinition } from '../types';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

export const TOOLS_CATALOG: ToolDefinition[] = [
  {
    id: 'privacy-checkup',
    name: 'Privacy Checkup',
    shortDesc: 'Analyze a file or link and identify potential privacy risks.',
    description: 'Flagship unified privacy scanner. Detects embedded location coordinates, hardware serials, contributor identities, and ad trackers with instant 1-click remediation.',
    category: 'Privacy Checkup',
    iconName: 'ShieldAlert',
    path: '/privacy-checkup',
    badge: 'Flagship',
    processingType: 'local',
    featured: true,
    supportedFormats: ['JPG', 'PNG', 'WEBP', 'PDF', 'DOCX', 'XLSX', 'PPTX', 'URL'],
    tags: ['scan', 'audit', 'check', 'risk', 'score', 'report', 'gps', 'trackers', 'cleaner']
  },
  {
    id: 'exif-remover',
    name: 'Photo Privacy Inspector & Cleaner',
    shortDesc: 'Inspect and remove hidden EXIF metadata from images before sharing them.',
    description: 'Inspect exact GPS coordinates, camera models, and timestamps, then strip them completely or selectively while preserving pure image quality.',
    category: 'Images',
    iconName: 'ImageMinus',
    path: '/tools/exif-remover',
    badge: 'Popular',
    processingType: 'local',
    featured: true,
    supportedFormats: ['JPG', 'JPEG', 'PNG', 'WEBP'],
    tags: ['remove', 'strip', 'clean', 'sanitize', 'photo', 'exif', 'gps', 'inspect', 'location', 'camera']
  },
  {
    id: 'audio-metadata-cleaner',
    name: 'Audio Metadata Cleaner',
    shortDesc: 'Remove ID3 tags and hidden metadata from MP3 files.',
    description: 'Strip hidden ID3v1 and ID3v2 metadata, album art, comments, and tracking tags from audio files instantly inside your browser.',
    category: 'Media',
    iconName: 'Music',
    path: '/tools/audio-metadata-cleaner',
    processingType: 'local',
    featured: true,
    supportedFormats: ['MP3'],
    tags: ['audio', 'mp3', 'id3', 'metadata', 'music', 'clean']
  },
  {
    id: 'video-metadata-cleaner',
    name: 'Video Metadata Inspector',
    shortDesc: 'Inspect and remove tracking data from MP4 and MOV videos.',
    description: 'Find and strip user data (UDTA), tracking keys (META), and creation timestamps embedded deeply inside video headers before sharing them online.',
    category: 'Media',
    iconName: 'Video',
    path: '/tools/video-metadata-cleaner',
    processingType: 'local',
    featured: true,
    supportedFormats: ['MP4', 'MOV'],
    tags: ['video', 'mp4', 'mov', 'metadata', 'udta', 'clean']
  },
  {
    id: 'pdf-metadata-cleaner',
    name: 'PDF Metadata Cleaner',
    shortDesc: 'Remove unnecessary metadata and author tags from PDF files.',
    description: 'Erase document author names, computer usernames, PDF creation engines, modification timestamps, and internal keywords before publishing.',
    category: 'Documents',
    iconName: 'FileText',
    path: '/tools/pdf-metadata-cleaner',
    processingType: 'local',
    featured: true,
    supportedFormats: ['PDF'],
    tags: ['pdf', 'document', 'author', 'sanitize', 'strip', 'clean', 'producer', 'dates']
  },
  {
    id: 'doc-metadata-cleaner',
    name: 'Document Metadata Cleaner',
    shortDesc: 'Clean metadata from supported office documents (DOCX, XLSX, PPTX).',
    description: 'Inspect and purge revision histories, company tags, collaborator names, and editing durations from Word, Excel, and PowerPoint documents.',
    category: 'Documents',
    iconName: 'FileSpreadsheet',
    path: '/tools/doc-metadata-cleaner',
    processingType: 'local',
    featured: true,
    supportedFormats: ['DOCX', 'XLSX', 'PPTX'],
    tags: ['word', 'excel', 'powerpoint', 'office', 'docx', 'xlsx', 'pptx', 'clean']
  },
  {
    id: 'url-privacy-cleaner',
    name: 'URL Privacy Cleaner',
    shortDesc: 'Remove common tracking parameters and click IDs from URLs.',
    description: 'Strip 60+ invasive ad attribution tokens (gclid, fbclid, ttclid), UTM marketing campaigns, and user fingerprinting tokens from any web link.',
    category: 'Links',
    iconName: 'Link2Off',
    path: '/tools/url-privacy-cleaner',
    badge: 'Fast',
    processingType: 'local',
    featured: true,
    supportedFormats: ['HTTP', 'HTTPS Links'],
    tags: ['url', 'link', 'utm', 'fbclid', 'gclid', 'trackers', 'marketing', 'strip', 'privacy']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    shortDesc: 'Generate cryptographically secure, high-entropy random passwords.',
    description: 'Generate uncrackable passwords using hardware-backed cryptographic randomness with instant entropy calculations and character rules.',
    category: 'Security',
    iconName: 'KeyRound',
    path: '/tools/password-generator',
    processingType: 'local',
    featured: false,
    tags: ['password', 'generator', 'security', 'entropy', 'keys', 'random', 'crypto']
  },
  {
    id: 'passphrase-generator',
    name: 'Passphrase Generator',
    shortDesc: 'Generate memorable, high-security multi-word passphrases.',
    description: 'Create memorable Diceware-style multi-word passphrases that resist brute force attacks while remaining easy for humans to type.',
    category: 'Security',
    iconName: 'Lock',
    path: '/tools/password-generator?tab=passphrase',
    processingType: 'local',
    featured: false,
    tags: ['passphrase', 'diceware', 'words', 'security', 'memorable']
  },
  {
    id: 'username-generator',
    name: 'Random Username Generator',
    shortDesc: 'Generate anonymous, non-identifying aliases for online services.',
    description: 'Create privacy-preserving pseudonym handles to prevent cross-site identity linkage when registering on forums and platforms.',
    category: 'Security',
    iconName: 'UserCheck',
    path: '/tools/password-generator?tab=username',
    processingType: 'local',
    featured: false,
    tags: ['username', 'pseudonym', 'alias', 'anon', 'identity']
  }
];

export const SAMPLE_URLS = [
  {
    title: 'Social Ad Tracking Link (Instagram & UTM)',
    url: 'https://store.example.com/products/noise-canceling-headphones?utm_source=instagram&utm_medium=paid_social&utm_campaign=summer_sale_2026&utm_content=carousel_v2&fbclid=IwAR2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0&ref=ig_feed',
    description: 'Contains 5 UTM campaign tags, a Meta click ID, and an app referral tag.'
  },
  {
    title: 'Google Ads Paid Search Click ID Link',
    url: 'https://software.example.com/checkout?plan=pro&gclid=CjwKCAjw1234567890abcdef_FakeGclidTokenForTestingOnly_xYz987&gbraid=0AAAAAD1234567&utm_term=privacy+software',
    description: 'Contains Google conversion attribution click tokens and keyword trackers.'
  },
  {
    title: 'Newsletter Email Subscriber Tracking Link',
    url: 'https://daily-digest.example.org/articles/privacy-trends?mc_cid=9876543210&mc_eid=abc123def456&_hsenc=p2ANqtz-FakeHubspotContactKey',
    description: 'Contains unique subscriber email identifier tags linked to individual user profiles.'
  },
  {
    title: 'E-Commerce Product Telemetry Link',
    url: 'https://shopping.example.com/item/dp/B000000000?ref_=pd_gw_unk&pf_rd_r=1A2B3C4D5E6F7G8H9I0J&tag=influencer-affiliate-21',
    description: 'Contains merchant telemetry session markers and affiliate commission codes.'
  }
];

/**
 * Creates a sample in-memory PNG/JPEG with simulated metadata for instant testing.
 */
export function createSampleImageFile(hasMetadata: boolean = true): File {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Draw background gradient
  const grad = ctx.createLinearGradient(0, 0, 600, 400);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.5, '#312e81');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 400);

  // Draw subtle grid & decorative elements
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 20; x < 600; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 400);
    ctx.stroke();
  }
  for (let y = 20; y < 400; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }

  // Draw circle badge
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(300, 160, 50, 0, Math.PI * 2);
  ctx.fill();

  // Draw camera icon symbol
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(275, 145, 50, 35, 6);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(288, 137, 24, 8, 3);
  ctx.fill();
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(300, 162, 11, 0, Math.PI * 2);
  ctx.fill();

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sample Test Photo', 300, 245);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText('Simulated EXIF & GPS Metadata for PrivacyKit Demo', 300, 275);

  // Convert canvas to Blob / File
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const byteString = atob(dataUrl.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: 'image/jpeg' });
  return new File([blob], 'sample_vacation_photo_with_gps.jpg', { type: 'image/jpeg' });
}

/**
 * Creates a sample PDF document with embedded metadata tags for instant testing.
 */
export async function createSamplePdfFile(): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Embed sensitive metadata
  pdfDoc.setTitle('Confidential Financial Q3 Strategy Memo');
  pdfDoc.setAuthor('Faizan Shaikh (faizan.work@enterprise-corp.internal)');
  pdfDoc.setSubject('Executive Board Strategic Review');
  pdfDoc.setKeywords(['internal-use-only', 'acquisitions', 'budget-2026', 'salary-bands']);
  pdfDoc.setCreator('Microsoft Word 365 ProPlus v2401 (Build 17231.20182)');
  pdfDoc.setProducer('Adobe PDF Library 15.0 / macOS 14.3.1');
  pdfDoc.setCreationDate(new Date('2026-08-15T14:32:00Z'));
  pdfDoc.setModificationDate(new Date('2026-08-26T09:15:00Z'));

  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();
  const fontSize = 16;

  page.drawText('Confidential Q3 Strategic Review Memo', {
    x: 50,
    y: height - 80,
    size: 20,
    font: timesRomanFont,
    color: rgb(0.1, 0.1, 0.3),
  });

  page.drawText('This sample document demonstrates embedded PDF metadata detection in PrivacyKit.', {
    x: 50,
    y: height - 120,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.4),
  });

  page.drawText('Metadata fields like author username, creation software, and timestamps are readable', {
    x: 50,
    y: height - 145,
    size: 11,
    font: timesRomanFont,
    color: rgb(0.4, 0.4, 0.5),
  });

  page.drawText('by anyone who downloads this file unless sanitized.', {
    x: 50,
    y: height - 165,
    size: 11,
    font: timesRomanFont,
    color: rgb(0.4, 0.4, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return new File([blob], 'sample_quarterly_strategy_memo.pdf', { type: 'application/pdf' });
}

/**
 * Creates a sample DOCX file with embedded metadata tags for instant testing.
 */
export async function createSampleDocxFile(): Promise<File> {
  const zip = new JSZip();

  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/coreProperties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Project Horizon Technical Architecture</dc:title>
  <dc:subject>Confidential System Specification</dc:subject>
  <dc:creator>Faizan Shaikh (fshaikh@apex-systems.io)</dc:creator>
  <cp:keywords>cloud-sql, microservices, internal</cp:keywords>
  <cp:lastModifiedBy>Sarah Jenkins (CTO)</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-06-10T11:22:33Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-08-25T17:44:00Z</dcterms:modified>
</cp:coreProperties>`;

  const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Template>EnterpriseReportTemplate.dotm</Template>
  <TotalTime>482</TotalTime>
  <Application>Microsoft Office Word 16.0.17029.20068</Application>
  <Company>Apex Global Technologies Inc.</Company>
  <Manager>David Chen (VP Engineering)</Manager>
</Properties>`;

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>PrivacyKit Sample Document Demo</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  zip.file('[Content_Types].xml', contentTypesXml);
  zip.file('docProps/core.xml', coreXml);
  zip.file('docProps/app.xml', appXml);
  zip.file('word/document.xml', docXml);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return new File([blob], 'sample_internal_architecture_spec.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}
