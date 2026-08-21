// Requests a resized, auto-compressed rendition for thumbnail use (grid cards,
// cart lines, admin tables) instead of downloading the full original upload.
// Handles both Cloudinary URLs (pre-migration images) and Supabase Storage
// URLs (uploaded via supabaseStorage.js) via each host's own transform
// endpoint. Any other URL (pasted from elsewhere) passes through unchanged.
// Full-resolution zoom views (ProductPage) intentionally do NOT use this.
export function cldThumb(url, width = 700) {
  if (!url || typeof url !== 'string') return url;

  const cldMarker = '/image/upload/';
  const cldIdx = url.indexOf(cldMarker);
  if (cldIdx !== -1) {
    const insertAt = cldIdx + cldMarker.length;
    return `${url.slice(0, insertAt)}w_${width},q_auto,f_auto,c_limit/${url.slice(insertAt)}`;
  }

  const sbMarker = '/storage/v1/object/public/';
  const sbIdx = url.indexOf(sbMarker);
  if (sbIdx !== -1) {
    const base = url.slice(0, sbIdx);
    const rest = url.slice(sbIdx + sbMarker.length);
    return `${base}/storage/v1/render/image/public/${rest}?width=${width}&quality=80`;
  }

  return url;
}
