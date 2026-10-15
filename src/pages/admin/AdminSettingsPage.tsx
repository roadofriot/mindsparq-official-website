import React, { useState, useEffect } from 'react';
import { getAllSocialLinks, saveSocialLink } from '../../services/socialService';
import { SocialLink } from '../../types/database';
import { Shield } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const fetchSocials = () => {
    setLoading(true);
    getAllSocialLinks()
      .then((data) => setSocials(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSocials();
  }, []);

  const handleUpdate = async (link: SocialLink, profile_url: string, is_enabled: boolean) => {
    const { error } = await saveSocialLink({
      ...link,
      profile_url,
      is_enabled
    });

    if (!error) {
      setSaveMsg(`Updated ${link.platform} profile URL.`);
      fetchSocials();
      setTimeout(() => setSaveMsg(null), 3000);
    } else {
      alert('Save failed: ' + error.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
          Verified Social Links & Site Settings
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
          Configure verified official social media profile URLs displayed across the website header and footer.
        </p>
      </div>

      {saveMsg && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            fontSize: 'var(--font-xs)',
            marginBottom: 'var(--space-4)'
          }}
        >
          {saveMsg}
        </div>
      )}

      {/* Security notice regarding tokens */}
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
        <Shield size={22} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          <strong>Platform Architecture Standard:</strong> This module stores public canonical profile links only. In compliance with security requirements, provider OAuth client secrets and publish tokens are never saved in browser-exposed databases. Automated API cross-publishing requires separate server-side token encryption and approval.
        </div>
      </div>

      {/* Social Links List */}
      <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
          Official Profile Links
        </h2>

        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading links...</p>
        ) : socials.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No social links configured in database.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {socials.map((link) => (
              <div
                key={link.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ width: '120px', fontWeight: 700, textTransform: 'capitalize', color: 'var(--color-text)' }}>
                  {link.platform}
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <input
                    type="url"
                    defaultValue={link.profile_url}
                    onBlur={(e) => {
                      if (e.target.value !== link.profile_url) {
                        handleUpdate(link, e.target.value, link.is_enabled);
                      }
                    }}
                    placeholder={`https://${link.platform}.com/...`}
                    className="input-field"
                    style={{ width: '100%', fontSize: 'var(--font-xs)' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-xs)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={link.is_enabled}
                      onChange={(e) => handleUpdate(link, link.profile_url, e.target.checked)}
                    />
                    <span>Enabled</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
