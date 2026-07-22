// Requests a resized, auto-compressed rendition from Cloudinary for thumbnail use
// (grid cards, cart lines, admin tables) instead of downloading the full original
// upload. Non-Cloudinary URLs (pasted from elsewhere) pass through unchanged.
// Full-resolution zoom views (ProductPage) intentionally do NOT use this.
export function cldThumb(url, width = 700) {
  if (!url || typeof url !== 'string') return url;
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const insertAt = idx + marker.length;
  return `${url.slice(0, insertAt)}w_${width},q_auto,f_auto,c_limit/${url.slice(insertAt)}`;
}
