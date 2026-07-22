import React, { useState, useEffect, useRef } from 'react';

// Drop-in <img> replacement: starts blurred, sharpens the instant the full image has
// actually finished loading. On a fast/cached load this is barely visible; on a slow
// first load (new tab, new device, big product photo) it reads as an intentional,
// polished "buffering" state instead of a blank box or a jarring pop-in.
export default function BlurImage({ src, style = {}, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);

  // A cached image can finish loading before React attaches the onLoad listener,
  // which would leave it blurred forever — so after every mount/src change, also
  // check the element's own loaded state directly. complete with naturalWidth 0
  // means the browser already gave up on it (bad URL, network error).
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else if (img.src) setFailed(true);
    }
  }, [src]);

  const blurTransition = 'filter .5s ease';
  const mergedTransition = style.transition ? `${style.transition}, ${blurTransition}` : blurTransition;

  if (failed) {
    return (
      <div aria-hidden="true" style={{
        ...style,
        filter: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-hover)',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      style={{
        ...style,
        filter: loaded ? 'blur(0)' : 'blur(16px)',
        transition: mergedTransition,
      }}
      {...rest}
    />
  );
}
