import { ToolDefinition } from '../types';

export interface AudioMetadata {
  hasId3v1: boolean;
  hasId3v2: boolean;
  id3v2Size: number;
  fileSize: number;
  title?: string;
  artist?: string;
  album?: string;
}

export const analyzeAudio = async (file: File): Promise<AudioMetadata> => {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  
  let hasId3v1 = false;
  let hasId3v2 = false;
  let id3v2Size = 0;
  let title, artist, album;

  // Check ID3v2
  if (uint8.length > 10 && uint8[0] === 0x49 && uint8[1] === 0x44 && uint8[2] === 0x33) {
    hasId3v2 = true;
    const b1 = uint8[6];
    const b2 = uint8[7];
    const b3 = uint8[8];
    const b4 = uint8[9];
    id3v2Size = ((b1 & 0x7f) << 21) | ((b2 & 0x7f) << 14) | ((b3 & 0x7f) << 7) | (b4 & 0x7f);
    id3v2Size += 10;
  }

  // Check ID3v1
  if (uint8.length > 128) {
    const offset = uint8.length - 128;
    if (uint8[offset] === 0x54 && uint8[offset+1] === 0x41 && uint8[offset+2] === 0x47) { // 'TAG'
      hasId3v1 = true;
      const decoder = new TextDecoder('iso-8859-1');
      title = decoder.decode(uint8.slice(offset + 3, offset + 33)).replace(/\0.*$/g, '').trim();
      artist = decoder.decode(uint8.slice(offset + 33, offset + 63)).replace(/\0.*$/g, '').trim();
      album = decoder.decode(uint8.slice(offset + 63, offset + 93)).replace(/\0.*$/g, '').trim();
    }
  }

  // Fallback to basic ID3v2 reading if no ID3v1
  if (hasId3v2 && (!title || !artist || !album)) {
    // Very basic ID3v2 parser for title (TIT2), artist (TPE1), album (TALB)
    try {
      let offset = 10;
      while (offset < id3v2Size && offset < uint8.length) {
        const frameId = String.fromCharCode(uint8[offset], uint8[offset+1], uint8[offset+2], uint8[offset+3]);
        if (!/[A-Z0-9]{4}/.test(frameId)) break;
        
        const size = (uint8[offset+4] << 24) | (uint8[offset+5] << 16) | (uint8[offset+6] << 8) | uint8[offset+7];
        const encoding = uint8[offset+10];
        
        if (size > 0 && offset + 10 + size <= id3v2Size) {
          const content = uint8.slice(offset + 11, offset + 10 + size);
          let text = '';
          if (encoding === 0 || encoding === 3) {
            text = new TextDecoder('iso-8859-1').decode(content).replace(/\0/g, '').trim();
          } else if (encoding === 1) {
            text = new TextDecoder('utf-16').decode(content).replace(/\0/g, '').trim();
          } else if (encoding === 2) {
            text = new TextDecoder('utf-16be').decode(content).replace(/\0/g, '').trim();
          }

          if (frameId === 'TIT2') title = text || title;
          if (frameId === 'TPE1') artist = text || artist;
          if (frameId === 'TALB') album = text || album;
        }
        
        offset += 10 + size;
      }
    } catch (e) {
      // Ignore parsing errors for robust fallback
    }
  }

  return {
    hasId3v1,
    hasId3v2,
    id3v2Size,
    fileSize: file.size,
    title: title || undefined,
    artist: artist || undefined,
    album: album || undefined
  };
};

export const cleanAudio = async (
  file: File,
  options: { removeId3v1: boolean; removeId3v2: boolean }
): Promise<Blob> => {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const metadata = await analyzeAudio(file);

  let startOffset = 0;
  let endOffset = uint8.length;

  if (options.removeId3v2 && metadata.hasId3v2) {
    startOffset = metadata.id3v2Size;
  }

  if (options.removeId3v1 && metadata.hasId3v1) {
    endOffset = uint8.length - 128;
  }

  // Ensure valid slicing
  if (startOffset >= endOffset) {
    return new Blob([], { type: file.type });
  }

  const cleanBuffer = uint8.slice(startOffset, endOffset);
  return new Blob([cleanBuffer], { type: file.type });
};
