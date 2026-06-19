import React, { useState, useRef } from 'react';

// ── CLOUDINARY IMAGE UPLOADER ─────────────────────────────
// Two modes:
// 1. Direct upload to Cloudinary (needs REACT_APP_CLOUDINARY_CLOUD_NAME + REACT_APP_CLOUDINARY_UPLOAD_PRESET)
// 2. Paste URL manually (works always, no config needed)

export default function ImageUploader({ images = [], onChange }) {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState('url'); // 'url' or 'upload'
  const fileRef = useRef();

  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const canUpload = cloudName && uploadPreset && cloudName !== 'your_cloud_name';

  // ── ADD URL MANUALLY ──
  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) {
      alert('Please enter a valid URL starting with http');
      return;
    }
    onChange([...images, url]);
    setUrlInput('');
  }

  // ── UPLOAD TO CLOUDINARY ──
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);

    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(Math.round((i / files.length) * 100));
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'tamarind-tales/products');

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          uploaded.push(data.secure_url);
        }
      } catch (err) {
        console.error('Upload failed for', file.name, err);
      }
    }

    onChange([...images, ...uploaded]);
    setUploading(false);
    setProgress(0);
    e.target.value = '';
  }

  function removeImage(idx) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function moveImage(idx, dir) {
    const imgs = [...images];
    const target = idx + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
    onChange(imgs);
  }

  const lbl = {
    fontFamily: "'Cinzel',serif", fontSize: 8,
    letterSpacing: '0.14em', color: 'rgba(245,237,216,0.4)',
    textTransform: 'uppercase', display: 'block', marginBottom: 7
  };

  return (
    <div>
      <label style={lbl}>Product Images</label>

      {/* IMAGE PREVIEW GRID */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative', width: 90, height: 90 }}>
              <img
                src={url}
                alt=""
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  border: i === 0 ? '2px solid var(--gd)' : '1px solid rgba(200,169,110,0.2)'
                }}
                onError={e => { e.target.src = ''; e.target.style.background = '#2a1f18'; }}
              />
              {i === 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--gd)', color: 'var(--iv)', fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: '0.1em', textAlign: 'center', padding: '2px 0', textTransform: 'uppercase' }}>
                  Main
                </div>
              )}
              <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 2 }}>
                {i > 0 && (
                  <button onClick={() => moveImage(i, -1)} title="Move left" style={{ width: 18, height: 18, background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                )}
                {i < images.length - 1 && (
                  <button onClick={() => moveImage(i, 1)} title="Move right" style={{ width: 18, height: 18, background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
                )}
                <button onClick={() => removeImage(i)} title="Remove" style={{ width: 18, height: 18, background: 'rgba(139,61,42,0.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODE TABS */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
        <button
          onClick={() => setMode('url')}
          style={{ padding: '7px 14px', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid rgba(200,169,110,0.2)', cursor: 'pointer', transition: 'all 0.2s', background: mode === 'url' ? 'var(--gd)' : 'rgba(255,255,255,0.04)', color: mode === 'url' ? 'var(--br)' : 'rgba(245,237,216,0.5)' }}
        >
          Paste URL
        </button>
        {canUpload && (
          <button
            onClick={() => setMode('upload')}
            style={{ padding: '7px 14px', fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid rgba(200,169,110,0.2)', borderLeft: 'none', cursor: 'pointer', transition: 'all 0.2s', background: mode === 'upload' ? 'var(--gd)' : 'rgba(255,255,255,0.04)', color: mode === 'upload' ? 'var(--br)' : 'rgba(245,237,216,0.5)' }}
          >
            Upload File
          </button>
        )}
      </div>

      {/* PASTE URL MODE */}
      {mode === 'url' && (
        <div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUrl()}
              placeholder="Paste Cloudinary or any image URL here..."
              style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,169,110,0.2)', color: 'var(--iv)', fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--gd)'}
              onBlur={e => e.target.style.borderColor = 'rgba(200,169,110,0.2)'}
            />
            <button
              onClick={addUrl}
              style={{ background: 'var(--gd)', border: 'none', color: 'var(--iv)', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Add
            </button>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(245,237,216,0.28)', fontStyle: 'italic', marginTop: 7, lineHeight: 1.6 }}>
            Upload image to cloudinary.com → right click image → Copy image address → paste above. Press Enter or click Add.
          </div>
        </div>
      )}

      {/* CLOUDINARY UPLOAD MODE */}
      {mode === 'upload' && canUpload && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ background: uploading ? 'rgba(200,169,110,0.4)' : 'rgba(255,255,255,0.08)', border: '1px dashed rgba(200,169,110,0.35)', color: uploading ? 'var(--gd)' : 'rgba(245,237,216,0.6)', fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 20px', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {uploading ? (
              <><span style={{ width: 14, height: 14, border: '2px solid rgba(200,169,110,0.3)', borderTopColor: 'var(--gd)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Uploading... {progress}%</>
            ) : 'Select Photos to Upload'}
          </button>
          {uploading && (
            <div style={{ marginTop: 8, height: 3, background: 'rgba(200,169,110,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--gd)', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
