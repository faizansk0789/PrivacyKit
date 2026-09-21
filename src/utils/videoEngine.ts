export interface VideoMetadata {
  hasMetadata: boolean;
  fileSize: number;
  creationTime?: Date;
  hasUdta: boolean;
  hasMeta: boolean;
  duration?: number;
}

function readString(view: DataView, offset: number, length: number) {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(view.getUint8(offset + i));
  }
  return str;
}

export async function analyzeVideo(file: File): Promise<VideoMetadata> {
  let offset = 0;
  let moovOffset = -1;
  let moovSize = 0;
  let hasUdta = false;
  let hasMeta = false;
  let creationTime: Date | undefined;

  // Scan root level boxes (limit to 500MB scanning for safety)
  while (offset < file.size && offset < 500 * 1024 * 1024) {
    const headerBlob = file.slice(offset, offset + 8);
    const headerBuf = await headerBlob.arrayBuffer();
    if (headerBuf.byteLength < 8) break;

    const view = new DataView(headerBuf);
    let size = view.getUint32(0);
    let type = readString(view, 4, 4);
    let headerSize = 8;

    if (size === 1) {
      const extBlob = file.slice(offset + 8, offset + 16);
      const extBuf = await extBlob.arrayBuffer();
      size = Number(new DataView(extBuf).getBigUint64(0));
      headerSize = 16;
    }

    if (size === 0) break; // extends to EOF

    if (type === 'udta') hasUdta = true;
    if (type === 'meta') hasMeta = true;

    if (type === 'moov') {
      moovOffset = offset;
      moovSize = size;
      
      // Parse inside moov
      const moovBlob = file.slice(offset, offset + size);
      const moovBuf = await moovBlob.arrayBuffer();
      const moovView = new DataView(moovBuf);

      let moovCurrent = headerSize;
      while (moovCurrent < size) {
        if (moovCurrent + 8 > size) break;
        let innerSize = moovView.getUint32(moovCurrent);
        let innerType = readString(moovView, moovCurrent + 4, 4);

        if (innerType === 'udta') hasUdta = true;
        if (innerType === 'meta') hasMeta = true;
        
        if (innerType === 'mvhd') {
          const version = moovView.getUint8(moovCurrent + 8);
          if (version === 0) {
            const ctime = moovView.getUint32(moovCurrent + 12);
            if (ctime > 0) creationTime = new Date((ctime - 2082844800) * 1000);
          } else if (version === 1) {
            const ctime = Number(moovView.getBigUint64(moovCurrent + 12));
            if (ctime > 0) creationTime = new Date((ctime - 2082844800) * 1000);
          }
        }

        if (innerSize === 0) break;
        moovCurrent += innerSize;
      }
      break; // We found moov, which usually contains what we need
    }

    offset += size;
  }

  return {
    hasMetadata: hasUdta || hasMeta || !!creationTime,
    fileSize: file.size,
    creationTime,
    hasUdta,
    hasMeta
  };
}

export async function cleanVideo(
  file: File,
  options: { removeUdta: boolean; removeMeta: boolean; scrubDates: boolean }
): Promise<Blob> {
  let offset = 0;
  let blobs: Blob[] = [];
  let moovFound = false;

  while (offset < file.size && offset < 500 * 1024 * 1024) {
    const headerBlob = file.slice(offset, offset + 8);
    const headerBuf = await headerBlob.arrayBuffer();
    if (headerBuf.byteLength < 8) {
      blobs.push(file.slice(offset));
      break;
    }

    const view = new DataView(headerBuf);
    let size = view.getUint32(0);
    let type = readString(view, 4, 4);
    let headerSize = 8;

    if (size === 1) {
      const extBlob = file.slice(offset + 8, offset + 16);
      const extBuf = await extBlob.arrayBuffer();
      size = Number(new DataView(extBuf).getBigUint64(0));
      headerSize = 16;
    }

    if (size === 0) {
      blobs.push(file.slice(offset));
      break;
    }

    if (type === 'moov') {
      moovFound = true;
      const moovBlob = file.slice(offset, offset + size);
      const moovBuf = await moovBlob.arrayBuffer();
      const moovView = new DataView(moovBuf);

      let moovCurrent = headerSize;
      while (moovCurrent < size) {
        if (moovCurrent + 8 > size) break;
        let innerSize = moovView.getUint32(moovCurrent);
        let innerType = readString(moovView, moovCurrent + 4, 4);

        if (options.removeUdta && innerType === 'udta') {
          // Replace 'udta' with 'free'
          moovView.setUint8(moovCurrent + 4, 102); // f
          moovView.setUint8(moovCurrent + 5, 114); // r
          moovView.setUint8(moovCurrent + 6, 101); // e
          moovView.setUint8(moovCurrent + 7, 101); // e
          for (let i = 8; i < innerSize; i++) moovView.setUint8(moovCurrent + i, 0);
        }
        if (options.removeMeta && innerType === 'meta') {
          // Replace 'meta' with 'free'
          moovView.setUint8(moovCurrent + 4, 102); // f
          moovView.setUint8(moovCurrent + 5, 114); // r
          moovView.setUint8(moovCurrent + 6, 101); // e
          moovView.setUint8(moovCurrent + 7, 101); // e
          for (let i = 8; i < innerSize; i++) moovView.setUint8(moovCurrent + i, 0);
        }
        if (options.scrubDates && innerType === 'mvhd') {
          const version = moovView.getUint8(moovCurrent + 8);
          if (version === 0) {
            moovView.setUint32(moovCurrent + 12, 0);
            moovView.setUint32(moovCurrent + 16, 0);
          } else if (version === 1) {
            moovView.setBigUint64(moovCurrent + 12, 0n);
            moovView.setBigUint64(moovCurrent + 20, 0n);
          }
        }

        if (innerSize === 0) break;
        moovCurrent += innerSize;
      }
      blobs.push(new Blob([moovBuf]));
    } else if ((options.removeUdta && type === 'udta') || (options.removeMeta && type === 'meta')) {
      // If found at root level, free it completely
      const freeBuf = new ArrayBuffer(size);
      const freeView = new DataView(freeBuf);
      freeView.setUint32(0, size);
      freeView.setUint8(4, 102);
      freeView.setUint8(5, 114);
      freeView.setUint8(6, 101);
      freeView.setUint8(7, 101);
      blobs.push(new Blob([freeBuf]));
    } else {
      blobs.push(file.slice(offset, offset + size));
    }

    offset += size;
  }

  if (!moovFound) {
    throw new Error('Could not parse ISOBMFF structure or no moov box found.');
  }

  if (offset < file.size) {
    blobs.push(file.slice(offset));
  }

  return new Blob(blobs, { type: file.type });
}
