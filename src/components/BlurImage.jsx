import React, { useState, useEffect } from 'react';

// Drop-in <img> replacement: starts blurred, sharpens the instant the full image has
// actually finished loading. On a fast/cached load this is barely visible; on a slow
// first load (new tab, new device, big product photo) it reads as an intentional,
// polished "buffering" state instead of a blank box or a jarring pop-in.
export default function BlurImage({ src, style = {}, ...rest }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(false); }, [src]);

  const blurTransition = 'filter .5s ease';
  const mergedTransition = style.transition ? `${style.transition}, ${blurTransition}` : blurTransition;

  return (
    <img
      src={src}
      onLoad={() => setLoaded(true)}
      style={{
        ...style,
        filter: loaded ? 'blur(0)' : 'blur(16px)',
        transition: mergedTransition,
      }}
      {...rest}
    />
  );
}
