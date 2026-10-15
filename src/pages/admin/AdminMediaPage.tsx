import React, { useState, useEffect } from 'react';
import { getMediaAssets, uploadMedia, deleteMediaAsset } from '../../services/mediaService';
import { MediaAsset } from '../../types/database';
import { Upload, Copy, Check, Trash2, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const fetchAssets = () => {
    setLoading(true);
    getMediaAssets()
      .then((data) => setAssets(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-populate alt text with clean filename if empty
      if (!altText) {
        setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!altText.trim()) {
      setUploadError('Accessibility alt text is required.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const { data, error } = await uploadMedia(selectedFile, altText, caption, visibility);
    if (error) {
      setUploadError(error.message);
    } else if (data) {
      setSelectedFile(null);
      setAltText('');
      setCaption('');
      fetchAssets();
    }
    setUploading(false);
  };

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.storage_path);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!window.confirm(`Are you sure you want to delete asset "${asset.original_filename}"? This action cannot be reversed.`)) {
      return;
    }

    const { error } = await deleteMediaAsset(asset);
    if (!error) {
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } else {
      alert('Delete failed: ' + error.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
          Media Library & Asset Manager
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
          Upload and organize verified high-resolution images, illustrations, and documents for blog articles and courses.
        </p>
      </div>

      {/* Upload Box */}
      <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
          Upload New Asset
        </h2>

        {uploadError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-xs)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <AlertCircle size={16} /> {uploadError}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                Select File (JPG, PNG, WebP, GIF, PDF • Max 10MB) *
              </label>
              <input
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleFileChange}
                style={{ width: '100%', fontSize: 'var(--font-xs)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                Accessibility Alt Text *
              </label>
              <input
                type="text"
                required
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Meaningful description of the media"
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                Visibility Bucket
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="public">Public Media (Website images, blogs, hero)</option>
                <option value="private">Private (Restricted learner downloads only)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Upload size={16} />
            <span>{uploading ? 'Uploading to Storage...' : 'Upload Media Asset'}</span>
          </button>
        </form>
      </div>

      {/* Assets Grid */}
      <div>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
          Asset Library ({assets.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>Loading assets...</div>
        ) : assets.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
            <ImageIcon size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No media assets uploaded yet. Use the upload box above to add photos and files.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <div style={{ height: '160px', backgroundColor: 'var(--color-surface-hover)', position: 'relative' }}>
                  {asset.media_type === 'image' ? (
                    <img
                      src={asset.storage_path}
                      alt={asset.alt_text}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={48} color="var(--color-text-secondary)" />
                    </div>
                  )}

                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}
                  >
                    {asset.visibility}
                  </span>
                </div>

                <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-xs)', color: 'var(--color-text)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', marginBottom: '2px' }}>
                    {asset.original_filename}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                    {(asset.size_bytes / 1024).toFixed(0)} KB • {asset.mime_type}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '4px 8px', fontSize: 'var(--font-xs)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      {copiedId === asset.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      <span>{copiedId === asset.id ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(asset)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'none',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
