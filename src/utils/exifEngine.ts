import ExifReader from 'exifreader';
import { ImageExifData, PrivacyRiskItem, RiskLevel } from '../types';

/**
 * Calculates a privacy score from 0 to 100 based on detected metadata sensitivity.
 */
export function calculateImagePrivacyScore(risks: PrivacyRiskItem[]): number {
  if (risks.length === 0) return 100;
  
  let deductions = 0;
  for (const risk of risks) {
    if (risk.risk === 'high') deductions += 35;
    else if (risk.risk === 'medium') deductions += 18;
    else if (risk.risk === 'low') deductions += 8;
  }
  
  return Math.max(10, Math.min(100, 100 - deductions));
}

/**
 * Parses image buffer / File locally in the browser using ExifReader.
 */
export async function parseImageMetadata(file: File): Promise<ImageExifData> {
  const arrayBuffer = await file.arrayBuffer();
  let tags: Record<string, any> = {};

  try {
    tags = ExifReader.load(arrayBuffer, { expanded: true });
  } catch (err) {
    console.warn('ExifReader failed or found no standard EXIF headers:', err);
  }

  const rawTags: Record<string, string | number | undefined> = {};
  const risks: PrivacyRiskItem[] = [];

  // 1. Check GPS Location
  let hasGps = false;
  let latitude: number | undefined;
  let longitude: number | undefined;
  let altitude: number | undefined;

  const gpsGroup = tags.gps || {};
  if (gpsGroup.Latitude !== undefined && gpsGroup.Longitude !== undefined) {
    latitude = Number(gpsGroup.Latitude);
    longitude = Number(gpsGroup.Longitude);
    hasGps = true;
    if (gpsGroup.Altitude) altitude = Number(gpsGroup.Altitude);
  } else if (tags.GPSLatitude && tags.GPSLongitude) {
    // Fallback for flat tags
    latitude = tags.GPSLatitude.description ? parseFloat(tags.GPSLatitude.description) : undefined;
    longitude = tags.GPSLongitude.description ? parseFloat(tags.GPSLongitude.description) : undefined;
    hasGps = latitude !== undefined && longitude !== undefined;
  }

  if (hasGps && latitude !== undefined && longitude !== undefined) {
    const latFixed = latitude.toFixed(5);
    const lngFixed = longitude.toFixed(5);
    risks.push({
      id: 'gps-location',
      category: 'GPS',
      title: 'GPS Location Coordinates Found',
      description: `Exact geographic coordinates (${latFixed}, ${lngFixed}) reveal where this photo was captured.`,
      value: `${latFixed}, ${lngFixed}${altitude ? ` (Alt: ${altitude.toFixed(1)}m)` : ''}`,
      risk: 'high',
      removable: true,
      actionLabel: 'Remove GPS Coordinates',
    });
  }

  // 2. Check Device Info
  const exifGroup = tags.exif || {};
  const ifd0Group = tags.file || tags.tiff || {};
  
  const make = exifGroup.Make?.description || tags.Make?.description;
  const model = exifGroup.Model?.description || tags.Model?.description;
  const lensModel = exifGroup.LensModel?.description || tags.LensModel?.description;
  const software = exifGroup.Software?.description || tags.Software?.description;
  const serialNumber = exifGroup.SerialNumber?.description || tags.SerialNumber?.description || exifGroup.BodySerialNumber?.description;
  const artist = exifGroup.Artist?.description || tags.Artist?.description || tags.Creator?.description;
  const copyright = exifGroup.Copyright?.description || tags.Copyright?.description;

  if (serialNumber) {
    risks.push({
      id: 'device-serial',
      category: 'Personal',
      title: 'Device Serial Number Found',
      description: 'Camera body or lens hardware serial number can uniquely identify your physical device.',
      value: String(serialNumber),
      risk: 'high',
      removable: true,
      actionLabel: 'Remove Serial Number',
    });
  }

  if (artist || copyright) {
    risks.push({
      id: 'author-info',
      category: 'Personal',
      title: 'Author / Copyright Identity',
      description: 'Embedded creator identity and legal owner tags were detected.',
      value: [artist, copyright].filter(Boolean).join(' | '),
      risk: 'medium',
      removable: true,
      actionLabel: 'Remove Author Info',
    });
  }

  if (make || model) {
    risks.push({
      id: 'camera-model',
      category: 'Device',
      title: 'Camera / Smartphone Hardware Model',
      description: 'Hardware brand, sensor model, and lens profile are embedded in the file headers.',
      value: [make, model, lensModel].filter(Boolean).join(' - ') || 'Detected Device Model',
      risk: 'medium',
      removable: true,
      actionLabel: 'Remove Camera Info',
    });
  }

  if (software) {
    risks.push({
      id: 'software-info',
      category: 'Software',
      title: 'Processing Software / OS Build',
      description: 'Operating system version, phone firmware, or photo editor identifier is visible.',
      value: String(software),
      risk: 'low',
      removable: true,
      actionLabel: 'Remove Software Tag',
    });
  }

  // 3. Timestamps
  const dateTimeOriginal = exifGroup.DateTimeOriginal?.description || tags.DateTimeOriginal?.description;
  const dateTimeDigitized = exifGroup.DateTimeDigitized?.description || tags.DateTimeDigitized?.description;
  const modifyDate = exifGroup.DateTime?.description || tags.ModifyDate?.description;
  const offsetTime = exifGroup.OffsetTime?.description || tags.OffsetTime?.description;

  if (dateTimeOriginal || dateTimeDigitized) {
    risks.push({
      id: 'timestamp-original',
      category: 'Timestamp',
      title: 'Exact Capture Timestamp & Timezone',
      description: 'Records the precise minute and second this photograph was taken.',
      value: String(dateTimeOriginal || dateTimeDigitized) + (offsetTime ? ` (UTC ${offsetTime})` : ''),
      risk: 'medium',
      removable: true,
      actionLabel: 'Remove Timestamps',
    });
  }

  // 4. Technical specifications
  const width = exifGroup.PixelXDimension?.value || tags['Image Width']?.value || tags.ImageWidth?.value;
  const height = exifGroup.PixelYDimension?.value || tags['Image Height']?.value || tags.ImageHeight?.value;
  const iso = exifGroup.ISOSpeedRatings?.description || tags.ISOSpeedRatings?.description || tags.ISO?.description;
  const exposureTime = exifGroup.ExposureTime?.description || tags.ExposureTime?.description;
  const fNumber = exifGroup.FNumber?.description || tags.FNumber?.description;
  const focalLength = exifGroup.FocalLength?.description || tags.FocalLength?.description;
  const flash = exifGroup.Flash?.description || tags.Flash?.description;
  const whiteBalance = exifGroup.WhiteBalance?.description || tags.WhiteBalance?.description;
  const colorSpace = exifGroup.ColorSpace?.description || tags.ColorSpace?.description;

  // Flatten raw tags for technical viewer
  if (tags.exif) {
    for (const [k, v] of Object.entries(tags.exif)) {
      if (v && typeof v === 'object' && 'description' in v) {
        rawTags[k] = (v as any).description;
      }
    }
  }
  if (tags.gps) {
    for (const [k, v] of Object.entries(tags.gps)) {
      if (v && typeof v === 'object' && 'description' in v) {
        rawTags[`GPS_${k}`] = (v as any).description;
      }
    }
  }

  // If no risks detected at all, add a Safe confirmation
  if (risks.length === 0) {
    risks.push({
      id: 'no-exif-safe',
      category: 'Technical',
      title: 'No Sensitive Metadata Found',
      description: 'This image does not contain GPS location, device serials, or identifiable author tags.',
      value: 'Clean Image Headers',
      risk: 'safe',
      removable: false,
    });
  }

  const privacyScore = calculateImagePrivacyScore(risks.filter(r => r.risk !== 'safe'));

  const previewUrl = URL.createObjectURL(file);

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'image/jpeg',
    location: hasGps && latitude !== undefined && longitude !== undefined ? {
      latitude,
      longitude,
      altitude,
      mapUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`,
    } : undefined,
    device: (make || model || lensModel || software) ? {
      make: make ? String(make) : undefined,
      model: model ? String(model) : undefined,
      lensModel: lensModel ? String(lensModel) : undefined,
      software: software ? String(software) : undefined,
      serialNumber: serialNumber ? String(serialNumber) : undefined,
    } : undefined,
    date: (dateTimeOriginal || dateTimeDigitized || modifyDate) ? {
      dateTimeOriginal: dateTimeOriginal ? String(dateTimeOriginal) : undefined,
      dateTimeDigitized: dateTimeDigitized ? String(dateTimeDigitized) : undefined,
      modifyDate: modifyDate ? String(modifyDate) : undefined,
      offsetTime: offsetTime ? String(offsetTime) : undefined,
    } : undefined,
    technical: {
      resolution: width && height ? `${width} × ${height}` : undefined,
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      iso,
      exposureTime: exposureTime ? String(exposureTime) : undefined,
      fNumber: fNumber ? String(fNumber) : undefined,
      focalLength: focalLength ? String(focalLength) : undefined,
      flash: flash ? String(flash) : undefined,
      whiteBalance: whiteBalance ? String(whiteBalance) : undefined,
      colorSpace: colorSpace ? String(colorSpace) : undefined,
    },
    rawTags,
    risks,
    privacyScore,
    hasGps,
    previewUrl,
  };
}

/**
 * Strips metadata completely or selectively from an image file entirely in the browser.
 * Uses HTML5 Canvas 2D image rasterization which renders pure pixel data without EXIF/IPTC/XMP blocks.
 */
export async function stripImageMetadata(
  file: File | Blob,
  options: {
    cleanGps?: boolean;
    cleanDevice?: boolean;
    cleanTimestamps?: boolean;
    cleanSoftware?: boolean;
    cleanAll?: boolean;
    quality?: number;
    outputType?: 'image/jpeg' | 'image/png' | 'image/webp';
  } = { cleanAll: true, quality: 0.95 }
): Promise<{ blob: Blob; fileName: string; strippedItems: string[] }> {
  const strippedItems: string[] = [];

  if (options.cleanAll || options.cleanGps) strippedItems.push('GPS Location & Coordinates');
  if (options.cleanAll || options.cleanDevice) strippedItems.push('Camera & Lens Hardware Profiles');
  if (options.cleanAll || options.cleanTimestamps) strippedItems.push('Original Capture Timestamps');
  if (options.cleanAll || options.cleanSoftware) strippedItems.push('Editing Software & OS Identifiers');
  if (options.cleanAll) strippedItems.push('Device Serial Numbers & Author Tags');

  // Pure browser pixel re-rasterization to strip 100% of auxiliary binary chunks
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context could not be initialized in browser'));
        return;
      }

      // Draw pure pixels onto clean canvas
      ctx.drawImage(img, 0, 0);

      const mimeType = options.outputType || (file.type.includes('png') ? 'image/png' : 'image/jpeg');
      const quality = options.quality ?? 0.95;

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate sanitized image'));
          return;
        }

        const originalName = 'name' in file ? file.name : 'image.jpg';
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
        const cleanFileName = `${baseName}_cleaned${ext}`;

        resolve({
          blob,
          fileName: cleanFileName,
          strippedItems,
        });
      }, mimeType, quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for sanitization'));
    };

    img.src = objectUrl;
  });
}
