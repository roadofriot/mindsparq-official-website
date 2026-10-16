import React, { useState } from 'react';
import {
  getActiveSocialLinks,
  saveActiveSocialLinks,
  SocialLinksConfig
} from '../../components/ui/SocialLinksBar';
import { Check, Save, ExternalLink, Globe } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [links, setLinks] = useState<SocialLinksConfig>(getActiveSocialLinks());
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleChange = (platform: keyof SocialLinksConfig, value: string) => {
    setLinks((prev) => ({
      ...prev,
      [platform]: value.trim()
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveActiveSocialLinks(links);
    setSaveMsg('All social media links updated and saved successfully.');
    setTimeout(() => setSaveMsg(null), 3500);
  };

  const platformFields: Array<{ key: keyof SocialLinksConfig; label: string; placeholder: string; helper: string }> = [
    {
      key: 'facebook',
      label: 'Facebook Page URL',
      placeholder: 'https://facebook.com/mindsparqeducation',
      helper: 'Official MindSparQ Facebook community and news page'
    },
    {
      key: 'instagram',
      label: 'Instagram Profile URL',
      placeholder: 'https://instagram.com/mindsparqeducation',
      helper: 'Visual student showcase, robotics reels, and student awards'
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Direct Chat URL',
      placeholder: 'https://wa.me/9779857058666',
      helper: 'Direct admission inquiry hotline for parents and students'
    },
    {
      key: 'tiktok',
      label: 'TikTok Channel URL',
      placeholder: 'https://www.tiktok.com/@mindsparqeducation',
      helper: 'Short-form abacus demonstrations and robotics project videos'
    },
    {
      key: 'youtube',
      label: 'YouTube Channel URL',
      placeholder: 'https://youtube.com/@mindsparqeducation',
      helper: 'Curriculum tutorials, competition highlights, and webinar recordings'
    },
    {
      key: 'linkedin',
      label: 'LinkedIn Institutional URL',
      placeholder: 'https://linkedin.com/company/mindsparqeducation',
      helper: 'Institutional partnerships, school MOUs, and educator hiring'
    }
  ];

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
          Social Media Channels & Institutional Links
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
          Configure the official profile URLs that power the interactive circular social media badges across the website header and footer.
        </p>
      </div>

      {saveMsg && (
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10b981',
            color: '#10b981',
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Check size={18} />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Developer Guidance Tip */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface-hover)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-8)'
        }}
      >
        <Globe size={22} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          <strong>Where links are stored:</strong> Saving here updates the links immediately in your browser. To make these permanent defaults across fresh devices and code deployments, you can also paste your links into <code>src/content/site.ts</code> under <code>siteConfig.contact.socials</code>.
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="card" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-6)' }}>
          Official Channel URLs
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {platformFields.map((field) => (
            <div key={field.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text)' }}>
                  {field.label}
                </label>
                {links[field.key] && (
                  <a
                    href={links[field.key]}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.6875rem', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                  >
                    Test Link <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={links[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="input-field"
                style={{ width: '100%', fontSize: 'var(--font-sm)' }}
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'block' }}>
                {field.helper}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
          >
            <Save size={16} /> Save Social Channels
          </button>
        </div>
      </form>
    </div>
  );
};
