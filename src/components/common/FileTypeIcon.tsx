import React from 'react';

interface FileTypeIconProps {
  type: 'pdf' | 'jpg' | 'docx' | 'mp4' | 'mp3' | 'url' | 'key' | 'shield';
  className?: string;
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ type, className = 'w-6 h-6' }) => {
  switch (type) {
    case 'pdf':
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="PDF Document Icon"
        >
          {/* Document Sheet */}
          <path
            d="M5 5C5 3.89543 5.89543 3 7 3H16L23 10V23C23 24.1046 22.1046 25 21 25H7C5.89543 25 5 24.1046 5 23V5Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Folded Corner */}
          <path
            d="M16 3V10H23"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Badge */}
          <rect
            x="4"
            y="13"
            width="17"
            height="8"
            rx="2.5"
            className="fill-rose-500 dark:fill-rose-600"
          />
          <text
            x="12.5"
            y="18.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="5.2"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            letterSpacing="0.4px"
          >
            PDF
          </text>
        </svg>
      );

    case 'jpg':
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="JPG Image File Icon"
        >
          {/* Outer Frame with Rounded Corners */}
          <rect
            x="3.5"
            y="4.5"
            width="21"
            height="19"
            rx="3.5"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          {/* Sun / Lens Aperture */}
          <circle
            cx="9.5"
            cy="10"
            r="2"
            className="fill-amber-500 dark:fill-amber-400"
          />
          {/* Mountain Peaks */}
          <path
            d="M4.5 19.5L10 14L15.5 19.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 18L17 14.5L23.5 20.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* File Extension Tag */}
          <rect
            x="13.5"
            y="16.5"
            width="12"
            height="7.5"
            rx="2"
            className="fill-indigo-500 dark:fill-indigo-600"
          />
          <text
            x="19.5"
            y="21.8"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="4.8"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            letterSpacing="0.3px"
          >
            JPG
          </text>
        </svg>
      );

    case 'docx':
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="DOCX Document Icon"
        >
          {/* Document Sheet */}
          <path
            d="M5 5C5 3.89543 5.89543 3 7 3H16L23 10V23C23 24.1046 22.1046 25 21 25H7C5.89543 25 5 24.1046 5 23V5Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Corner Fold */}
          <path
            d="M16 3V10H23"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Text Line Mockups */}
          <line x1="8.5" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="8.5" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          {/* Badge */}
          <rect
            x="3.5"
            y="13.5"
            width="18"
            height="8"
            rx="2.5"
            className="fill-blue-500 dark:fill-blue-600"
          />
          <text
            x="12.5"
            y="19.2"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="4.6"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            letterSpacing="0.2px"
          >
            DOCX
          </text>
        </svg>
      );

    case 'mp4':
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="MP4 Video File Icon"
        >
          {/* Video Clapper / Slate Body */}
          <rect
            x="3.5"
            y="5"
            width="21"
            height="18"
            rx="3.5"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          {/* Film Perforations at top */}
          <rect x="6" y="7.5" width="2.2" height="2" rx="0.5" fill="currentColor" opacity="0.6" />
          <rect x="10.5" y="7.5" width="2.2" height="2" rx="0.5" fill="currentColor" opacity="0.6" />
          <rect x="15" y="7.5" width="2.2" height="2" rx="0.5" fill="currentColor" opacity="0.6" />
          <rect x="19.5" y="7.5" width="2.2" height="2" rx="0.5" fill="currentColor" opacity="0.6" />
          {/* Play Triangle Symbol */}
          <path
            d="M10 13L15 16L10 19V13Z"
            className="fill-purple-500 dark:fill-purple-400"
          />
          {/* Badge */}
          <rect
            x="13.5"
            y="15.5"
            width="12"
            height="7.5"
            rx="2"
            className="fill-purple-600 dark:fill-purple-500"
          />
          <text
            x="19.5"
            y="20.8"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="4.8"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            letterSpacing="0.3px"
          >
            MP4
          </text>
        </svg>
      );

    case 'mp3':
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="MP3 Audio File Icon"
        >
          {/* Circular Vinyl / CD backing */}
          <rect
            x="3.5"
            y="4.5"
            width="21"
            height="19"
            rx="3.5"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          {/* Musical Beamed Notes */}
          <path
            d="M9.5 13.5V8.5L16.5 7V12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="9.5" y1="9.8" x2="16.5" y2="8.3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="14" r="2" className="fill-emerald-500 dark:fill-emerald-400" />
          <circle cx="15" cy="12.5" r="2" className="fill-emerald-500 dark:fill-emerald-400" />
          {/* Badge */}
          <rect
            x="13.5"
            y="15.5"
            width="12"
            height="7.5"
            rx="2"
            className="fill-emerald-600 dark:fill-emerald-500"
          />
          <text
            x="19.5"
            y="20.8"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="4.8"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            letterSpacing="0.3px"
          >
            MP3
          </text>
        </svg>
      );

    case 'url':
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="URL Link Icon"
        >
          <rect
            x="3.5"
            y="4.5"
            width="21"
            height="19"
            rx="3.5"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          {/* Chain links */}
          <path
            d="M10 15L8.5 16.5C7.11929 17.8807 7.11929 20.1193 8.5 21.5C9.88071 22.8807 12.1193 22.8807 13.5 21.5L15 20"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M18 13L19.5 11.5C20.8807 10.1193 20.8807 7.88071 19.5 6.5C18.1193 5.11929 15.8807 5.11929 14.5 6.5L13 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Badge */}
          <rect
            x="4"
            y="13"
            width="16"
            height="7.5"
            rx="2"
            className="fill-cyan-600 dark:fill-cyan-500"
          />
          <text
            x="12"
            y="18.3"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="4.8"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            letterSpacing="0.3px"
          >
            URL
          </text>
        </svg>
      );

    case 'key':
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="Key & Password Security Icon"
        >
          <rect
            x="3.5"
            y="4.5"
            width="21"
            height="19"
            rx="3.5"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          {/* Key head and shaft */}
          <circle cx="11" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13.5 13.5L20 20M17.5 17.5L19 16M19.5 19.5L21 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="11" cy="11" r="1" className="fill-amber-500 dark:fill-amber-400" />
          {/* Badge */}
          <rect
            x="4"
            y="14"
            width="15"
            height="7.5"
            rx="2"
            className="fill-amber-600 dark:fill-amber-500"
          />
          <text
            x="11.5"
            y="19.3"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="4.6"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            letterSpacing="0.3px"
          >
            KEY
          </text>
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="File Icon"
        >
          <path
            d="M5 5C5 3.89543 5.89543 3 7 3H16L23 10V23C23 24.1046 22.1046 25 21 25H7C5.89543 25 5 24.1046 5 23V5Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M16 3V10H23" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
  }
};
