import JSZip from 'jszip';
import { DocMetadataInfo, PrivacyRiskItem } from '../types';

/**
 * Parses Office Open XML document (DOCX, XLSX, PPTX) in the browser.
 */
export async function parseDocMetadata(file: File): Promise<DocMetadataInfo> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const fileType: 'docx' | 'xlsx' | 'pptx' = ext === 'xlsx' ? 'xlsx' : ext === 'pptx' ? 'pptx' : 'docx';

  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  let title: string | undefined;
  let subject: string | undefined;
  let creator: string | undefined;
  let lastModifiedBy: string | undefined;
  let created: string | undefined;
  let modified: string | undefined;
  let company: string | undefined;
  let manager: string | undefined;
  let application: string | undefined;
  let totalTime: string | undefined;
  let template: string | undefined;

  const risks: PrivacyRiskItem[] = [];

  // Parse docProps/core.xml
  const coreFile = loadedZip.file('docProps/core.xml');
  if (coreFile) {
    const coreXml = await coreFile.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(coreXml, 'application/xml');

    creator = xmlDoc.getElementsByTagName('dc:creator')[0]?.textContent || undefined;
    lastModifiedBy = xmlDoc.getElementsByTagName('cp:lastModifiedBy')[0]?.textContent || undefined;
    title = xmlDoc.getElementsByTagName('dc:title')[0]?.textContent || undefined;
    subject = xmlDoc.getElementsByTagName('dc:subject')[0]?.textContent || undefined;
    created = xmlDoc.getElementsByTagName('dcterms:created')[0]?.textContent || undefined;
    modified = xmlDoc.getElementsByTagName('dcterms:modified')[0]?.textContent || undefined;
  }

  // Parse docProps/app.xml
  const appFile = loadedZip.file('docProps/app.xml');
  if (appFile) {
    const appXml = await appFile.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(appXml, 'application/xml');

    company = xmlDoc.getElementsByTagName('Company')[0]?.textContent || undefined;
    manager = xmlDoc.getElementsByTagName('Manager')[0]?.textContent || undefined;
    application = xmlDoc.getElementsByTagName('Application')[0]?.textContent || undefined;
    totalTime = xmlDoc.getElementsByTagName('TotalTime')[0]?.textContent || undefined;
    template = xmlDoc.getElementsByTagName('Template')[0]?.textContent || undefined;
  }

  if (creator && creator.trim().length > 0) {
    risks.push({
      id: 'doc-creator',
      category: 'Personal',
      title: 'Original Author Name',
      description: 'System login name or author account name stored in document properties.',
      value: creator,
      risk: 'high',
      removable: true,
      actionLabel: 'Remove Author',
    });
  }

  if (lastModifiedBy && lastModifiedBy.trim().length > 0 && lastModifiedBy !== creator) {
    risks.push({
      id: 'doc-last-modified-by',
      category: 'Personal',
      title: 'Last Modified By Contributor',
      description: 'The collaborator account that last saved changes to this file.',
      value: lastModifiedBy,
      risk: 'medium',
      removable: true,
      actionLabel: 'Remove Contributor Name',
    });
  }

  if (company && company.trim().length > 0) {
    risks.push({
      id: 'doc-company',
      category: 'Personal',
      title: 'Organization / Company Name',
      description: 'Corporate enterprise license metadata embedded in document package.',
      value: company,
      risk: 'medium',
      removable: true,
      actionLabel: 'Remove Company Name',
    });
  }

  if (manager && manager.trim().length > 0) {
    risks.push({
      id: 'doc-manager',
      category: 'Personal',
      title: 'Manager / Supervisor Field',
      description: 'Departmental management hierarchy tag.',
      value: manager,
      risk: 'medium',
      removable: true,
    });
  }

  if (created || modified) {
    risks.push({
      id: 'doc-timestamps',
      category: 'Timestamp',
      title: 'Creation and Revision Timeline',
      description: 'Reveals exact dates and duration of editing sessions.',
      value: [created ? `Created: ${created.split('T')[0]}` : '', modified ? `Modified: ${modified.split('T')[0]}` : ''].filter(Boolean).join(' | '),
      risk: 'low',
      removable: true,
      actionLabel: 'Clear Timestamps',
    });
  }

  if (application && application.trim().length > 0) {
    risks.push({
      id: 'doc-application',
      category: 'Software',
      title: 'Office Suite & Build Version',
      description: 'Software suite and exact release build.',
      value: application,
      risk: 'low',
      removable: true,
    });
  }

  if (risks.length === 0) {
    risks.push({
      id: 'doc-clean-safe',
      category: 'Technical',
      title: 'No Sensitive Metadata Found',
      description: 'No author names, corporate organization tags, or revision records found.',
      value: 'Sanitized Office Package',
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
    fileType,
    title,
    subject,
    creator,
    lastModifiedBy,
    created,
    modified,
    company,
    manager,
    application,
    totalTime,
    template,
    risks,
    privacyScore,
  };
}

/**
 * Strips metadata from DOCX/XLSX/PPTX by modifying XML property trees and repacking.
 */
export async function stripDocMetadata(file: File | Blob): Promise<{ blob: Blob; fileName: string; strippedItems: string[] }> {
  const originalName = 'name' in file ? file.name : 'document.docx';
  const ext = originalName.split('.').pop()?.toLowerCase() || 'docx';

  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const strippedItems: string[] = [];

  // 1. Sanitize core.xml
  const coreFile = loadedZip.file('docProps/core.xml');
  if (coreFile) {
    const cleanCoreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/coreProperties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title></dc:title>
  <dc:subject></dc:subject>
  <dc:creator>PrivacyKit Sanitized</dc:creator>
  <cp:keywords></cp:keywords>
  <dc:description></dc:description>
  <cp:lastModifiedBy>PrivacyKit Sanitized</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">1970-01-01T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">1970-01-01T00:00:00Z</dcterms:modified>
</cp:coreProperties>`;
    loadedZip.file('docProps/core.xml', cleanCoreXml);
    strippedItems.push('Author & Contributor Names');
    strippedItems.push('Revision Timestamps');
  }

  // 2. Sanitize app.xml
  const appFile = loadedZip.file('docProps/app.xml');
  if (appFile) {
    const cleanAppXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Template>Normal</Template>
  <TotalTime>0</TotalTime>
  <Application>PrivacyKit Local</Application>
  <Company></Company>
  <Manager></Manager>
</Properties>`;
    loadedZip.file('docProps/app.xml', cleanAppXml);
    strippedItems.push('Company & Management Organization Data');
    strippedItems.push('Editing Total Time & Software Version');
  }

  // 3. Remove custom.xml if present
  if (loadedZip.file('docProps/custom.xml')) {
    loadedZip.remove('docProps/custom.xml');
    strippedItems.push('Custom Enterprise Metadata Tags');
  }

  const cleanBlob = await loadedZip.generateAsync({
    type: 'blob',
    mimeType: ext === 'xlsx' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      : ext === 'pptx' 
      ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const baseName = originalName.replace(/\.[^/.]+$/, '') || 'document';
  const cleanFileName = `${baseName}_cleaned.${ext}`;

  return {
    blob: cleanBlob,
    fileName: cleanFileName,
    strippedItems,
  };
}
