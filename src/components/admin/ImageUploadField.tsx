import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, Link2, HardDrive } from 'lucide-react';
import { uploadMedia } from '../../services/mediaService';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  altTextDefault?: string;
  id?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'https://images.unsplash.com/... or direct image URL',
  helperText,
  altTextDefault = 'Uploaded Asset'
}) => {
  // Mode: 'device' (default) or 'url'
  const [mode, setMode] = useState<'device' | 'url'>('device');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WebP, GIF).' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'File size exceeds maximum 10MB limit.' });
      return;
    }

    setUploading(true);
    setStatusMsg(null);

    try {
      // 1. Try uploading to cloud storage via uploadMedia
      const cleanAlt = altTextDefault || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const { data, error } = await uploadMedia(file, cleanAlt, undefined, 'public');

      if (!error && data?.storage_path) {
        onChange(data.storage_path);
        setStatusMsg({ type: 'success', text: `Image uploaded from device: ${file.name}` });
      } else {
        // 2. Resilient fallback: Convert to local Base64 Data URL so device upload ALWAYS succeeds!
        console.warn('[MindSparQ Upload] Cloud storage returned:', error?.message, '- applying local data URL fallback');
        const dataUrl = await readFileAsDataUrl(file);
        onChange(dataUrl);
        setStatusMsg({
          type: 'success',
          text: `Image attached from device (${(file.size / 1024).toFixed(0)} KB)`
        });
      }
    } catch {
      // 3. Fallback on any unexpected exception
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onChange(dataUrl);
        setStatusMsg({
          type: 'success',
          text: `Image attached from device (${(file.size / 1024).toFixed(0)} KB)`
        });
      } catch (readErr) {
        setStatusMsg({ type: 'error', text: `Failed to read file: ${(readErr as Error)?.message || 'Unknown error'}` });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ marginBottom: '18px' }}>
      {/* Field Label & Source Selection Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '2px',
            gap: '2px'
          }}
        >
          <button
            type="button"
            onClick={() => setMode('device')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: mode === 'device' ? '#2563eb' : 'transparent',
              color: mode === 'device' ? '#ffffff' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <HardDrive size={13} />
            <span>Device Storage</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('url')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: mode === 'url' ? '#2563eb' : 'transparent',
              color: mode === 'url' ? '#ffffff' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Link2 size={13} />
            <span>Web Link / URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input for Native File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />

      {/* 1. Preview Card if an image is currently set */}
      {value ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            marginBottom: '8px'
          }}
        >
          {/* Thumbnail */}
          <div
            style={{
              width: '90px',
              height: '60px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              flexShrink: 0,
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <CheckCircle2 size={13} />
              <span>Image Attached</span>
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={value}
            >
              {value.startsWith('data:') ? 'Local device storage file (Ready to save)' : value}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#0284c7',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Select a different photo from device"
            >
              <Upload size={13} />
              <span>Change</span>
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Remove this photo"
            >
              <X size={13} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. Upload Box when no image is yet selected */
        mode === 'device' ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragging ? '2px dashed #2563eb' : '2px dashed rgba(56, 189, 248, 0.4)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 16px',
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(37, 99, 235, 0.08)' : 'var(--color-surface-elevated)',
              cursor: uploading ? 'wait' : 'pointer',
              marginBottom: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={28} className="spin" style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Attaching image from device...
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Upload size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    Click here to choose from Device Storage
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    or drag & drop your image file here (PNG, JPG, WebP, GIF up to 10MB)
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    marginTop: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    pointerEvents: 'none'
                  }}
                >
                  <HardDrive size={13} />
                  <span>Browse Computer / Phone</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* URL Input Mode */
          <div style={{ marginBottom: '6px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required && !value}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px 0 34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem'
                }}
              />
              <Link2
                size={15}
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
            </div>
          </div>
        )
      )}

      {/* Helper text */}
      {helperText && (
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
          {helperText}
        </span>
      )}

      {/* Feedback Messages */}
      {statusMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            marginTop: '6px',
            color: statusMsg.type === 'error' ? '#ef4444' : '#10b981'
          }}
        >
          {statusMsg.type === 'error' ? <ImageIcon size={14} /> : <CheckCircle2 size={14} />}
          <span>{statusMsg.text}</span>
        </div>
      )}
    </div>
  );
};
