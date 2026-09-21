import { PDFDocument } from 'pdf-lib';
import { PdfMetadataInfo, PrivacyRiskItem } from '../types';

/**
 * Inspects PDF document metadata locally in browser.
 */
export async function parsePdfMetadata(file: File): Promise<PdfMetadataInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const title = pdfDoc.getTitle();
  const author = pdfDoc.getAuthor();
  const subject = pdfDoc.getSubject();
  const keywords = pdfDoc.getKeywords();
  const creator = pdfDoc.getCreator();
  const producer = pdfDoc.getProducer();
  const creationDateObj = pdfDoc.getCreationDate();
  const modificationDateObj = pdfDoc.getModificationDate();
  const pageCount = pdfDoc.getPageCount();

  const creationDate = creationDateObj ? creationDateObj.toISOString() : undefined;
  const modificationDate = modificationDateObj ? modificationDateObj.toISOString() : undefined;

  const risks: PrivacyRiskItem[] = [];

  if (author && author.trim().length > 0) {
    risks.push({
      id: 'pdf-author',
      category: 'Personal',
      title: 'Author Identity Embedded',
      description: 'The real name or computer login username of the document author is saved in PDF properties.',
      value: author,
      risk: 'high',
      removable: true,
      actionLabel: 'Remove Author Name',
    });
  }

  if (creator && creator.trim().length > 0) {
    risks.push({
      id: 'pdf-creator',
      category: 'Software',
      title: 'Original Application Creator',
      description: 'The application and operating system used to write this document is visible.',
      value: creator,
      risk: 'medium',
      removable: true,
      actionLabel: 'Remove Creator Tag',
    });
  }

  if (producer && producer.trim().length > 0) {
    risks.push({
      id: 'pdf-producer',
      category: 'Software',
      title: 'PDF Conversion Engine / Producer',
      description: 'PDF rendering library or print driver identifier.',
      value: producer,
      risk: 'low',
      removable: true,
      actionLabel: 'Remove Producer Info',
    });
  }

  if (title && title.trim().length > 0) {
    risks.push({
      id: 'pdf-title',
      category: 'Personal',
      title: 'Internal Document Title / File Path',
      description: 'Original file naming or internal project title stored in metadata.',
      value: title,
      risk: 'low',
      removable: true,
      actionLabel: 'Clear Title Tag',
    });
  }

  if (creationDate || modificationDate) {
    risks.push({
      id: 'pdf-timestamp',
      category: 'Timestamp',
      title: 'Creation and Modification Timestamps',
      description: 'Timestamp history reveals exact editing timeline.',
      value: [creationDate ? `Created: ${creationDate.split('T')[0]}` : '', modificationDate ? `Modified: ${modificationDate.split('T')[0]}` : ''].filter(Boolean).join(' | '),
      risk: 'medium',
      removable: true,
      actionLabel: 'Remove Timestamps',
    });
  }

  if (keywords && keywords.trim().length > 0) {
    risks.push({
      id: 'pdf-keywords',
      category: 'Personal',
      title: 'Embedded Keywords & Indexing Tags',
      description: 'Search indexing and organization keywords embedded in document.',
      value: keywords,
      risk: 'low',
      removable: true,
    });
  }

  if (risks.length === 0) {
    risks.push({
      id: 'pdf-clean-safe',
      category: 'Technical',
      title: 'No Sensitive Metadata Found',
      description: 'No author names, software identifiers, or revision histories were found in PDF info dictionary.',
      value: 'Sanitized PDF Dictionary',
      risk: 'safe',
      removable: false,
    });
  }

  let deductions = 0;
  for (const risk of risks) {
    if (risk.risk === 'high') deductions += 35;
    else if (risk.risk === 'medium') deductions += 20;
    else if (risk.risk === 'low') deductions += 10;
  }
  const privacyScore = Math.max(15, Math.min(100, 100 - deductions));

  return {
    fileName: file.name,
    fileSize: file.size,
    title,
    author,
    subject,
    keywords,
    creator,
    producer,
    creationDate,
    modificationDate,
    pageCount,
    risks,
    privacyScore,
  };
}

/**
 * Cleans PDF metadata completely in the browser using pdf-lib.
 */
export async function stripPdfMetadata(file: File | Blob): Promise<{ blob: Blob; fileName: string; strippedItems: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Reset metadata properties
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator('PrivacyKit Sanitized');
  pdfDoc.setProducer('PrivacyKit Local Engine');
  
  // Set arbitrary epoch date or neutral date
  const neutralDate = new Date(0);
  pdfDoc.setCreationDate(neutralDate);
  pdfDoc.setModificationDate(neutralDate);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  const originalName = 'name' in file ? file.name : 'document.pdf';
  const baseName = originalName.replace(/\.[^/.]+$/, '') || 'document';
  const cleanFileName = `${baseName}_cleaned.pdf`;

  return {
    blob,
    fileName: cleanFileName,
    strippedItems: [
      'Author Identity & Username',
      'Original Application Creator',
      'Internal Document Title & Keywords',
      'Producer & Print Engine Tag',
      'Editing Timestamps'
    ]
  };
}
