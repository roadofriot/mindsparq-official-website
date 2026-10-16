import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  placeholder = 'Or paste external image URL (https://...)...',
  helperText,
  altTextDefault = 'Uploaded Asset',
  id
}) => {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const cleanAlt = altTextDefault || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const { data, error } = await uploadMedia(file, cleanAlt, undefined, 'public');

      if (error) {
        setErrorMsg(`Upload failed: ${error.message}`);
      } else if (data?.storage_path) {
        onChange(data.storage_path);
        setSuccessMsg('Image uploaded successfully from your device!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      setErrorMsg(`Upload failed: ${(err as Error)?.message || 'Unknown network error'}`);
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
    <div style={{ marginBottom: '16px' }}>
      {/* Label and Upload Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label
          htmlFor={id}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>

        {/* Upload from Device / Desktop Button */}
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: uploading ? 'var(--color-surface-elevated)' : '#2563eb',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'opacity var(--transition-fast)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          title="Upload image directly from your local computer or phone"
        >
          {uploading ? (
            <>
              <Loader2 size={13} className="spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={13} />
              <span>Upload from Device</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Drag & Drop / Preview Box */}
      {value ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            marginBottom: '8px'
          }}
        >
          <div
            style={{
              width: '76px',
              height: '52px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              backgroundColor: '#000',
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

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <CheckCircle2 size={13} /> Active Image Attached
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
              {value}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Remove attached image"
          >
            <X size={13} />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging ? '2px dashed #38bdf8' : '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            textAlign: 'center',
            backgroundColor: isDragging ? 'rgba(56, 189, 248, 0.05)' : 'var(--color-surface-elevated)',
            marginBottom: '8px',
            transition: 'border-color var(--transition-fast), background-color var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
            <ImageIcon size={14} />
            <span>Drag & drop an image file here, or click <strong>Upload from Device</strong> above</span>
          </div>
        </div>
      )}

      {/* Manual / External URL Fallback Input */}
      <input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required && !value}
        style={{
          width: '100%',
          height: '38px',
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          fontSize: '0.8125rem'
        }}
      />

      {helperText && (
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
          {helperText}
        </span>
      )}

      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.75rem', marginTop: '6px' }}>
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.75rem', marginTop: '6px' }}>
          <CheckCircle2 size={14} />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
