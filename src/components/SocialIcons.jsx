import React from 'react';

// Clean, minimal single-path brand glyphs — sized via the wrapping <svg>'s width/height.
export function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

export function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PinterestIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.35 9.31-.09-.79-.17-2.01.03-2.87.19-.79 1.22-5.03 1.22-5.03s-.31-.62-.31-1.53c0-1.44.83-2.51 1.87-2.51.88 0 1.31.66 1.31 1.45 0 .88-.56 2.21-.85 3.44-.24 1.02.51 1.86 1.52 1.86 1.82 0 3.05-2.34 3.05-5.11 0-2.11-1.42-3.68-4-3.68-2.91 0-4.73 2.17-4.73 4.6 0 .84.25 1.43.63 1.89.18.21.2.3.14.54-.05.18-.16.65-.21.83-.07.27-.28.36-.52.26-1.44-.59-2.11-2.17-2.11-3.94 0-2.93 2.47-6.44 7.36-6.44 3.93 0 6.52 2.85 6.52 5.9 0 4.04-2.24 7.06-5.53 7.06-1.11 0-2.15-.6-2.51-1.28 0 0-.6 2.37-.73 2.83-.22.79-.66 1.58-1.06 2.2.95.28 1.94.43 2.98.43 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export function TwitterXIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.24 2.75h3.09l-6.75 7.72 7.94 10.78h-6.22l-4.87-6.37-5.57 6.37H2.77l7.22-8.25L2.37 2.75h6.38l4.4 5.82zm-1.08 16.6h1.71L7.03 4.53H5.19z" />
    </svg>
  );
}

export function EmailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3.5 6l8.5 7 8.5-7" />
    </svg>
  );
}
