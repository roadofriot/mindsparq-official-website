import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('App Icon, Manifest, and Production Asset Integration', () => {
  const publicDir = path.resolve(__dirname, '../../public');
  const indexHtmlPath = path.resolve(__dirname, '../../index.html');
  const headersPath = path.resolve(publicDir, '_headers');
  const manifestPath = path.resolve(publicDir, 'manifest.webmanifest');

  it('verifies all enterprise icon and branding assets exist and have valid sizes', () => {
    const requiredAssets = [
      { name: 'favicon.ico', minSize: 1000 },
      { name: 'favicon.svg', minSize: 200 },
      { name: 'favicon-16x16.png', minSize: 500 },
      { name: 'favicon-32x32.png', minSize: 1000 },
      { name: 'apple-touch-icon.png', minSize: 10000 },
      { name: 'icon-192.png', minSize: 10000 },
      { name: 'icon-512.png', minSize: 50000 },
      { name: 'icon-maskable.png', minSize: 50000 },
      { name: 'images/og-mindsparq.png', minSize: 50000 }
    ];

    for (const asset of requiredAssets) {
      const assetPath = path.join(publicDir, asset.name);
      expect(fs.existsSync(assetPath), `Asset ${asset.name} should exist`).toBe(true);
      const stat = fs.statSync(assetPath);
      expect(stat.size, `Asset ${asset.name} size should be >= ${asset.minSize} bytes`).toBeGreaterThanOrEqual(asset.minSize);
    }
  });

  it('validates W3C compliance of manifest.webmanifest', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe('MindSparQ Education & Technology');
    expect(manifest.short_name).toBe('MindSparQ');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.theme_color).toBe('#070E1A');
    expect(manifest.background_color).toBe('#070E1A');

    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    const sizes = manifest.icons.map((icon: any) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    const maskableIcon = manifest.icons.find((icon: any) => icon.purpose === 'maskable');
    expect(maskableIcon).toBeDefined();
  });

  it('verifies index.html has complete favicon, apple-touch-icon, and manifest references', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf-8');

    expect(html).toContain('rel="icon" type="image/svg+xml" href="/favicon.svg"');
    expect(html).toContain('rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"');
    expect(html).toContain('rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"');
    expect(html).toContain('rel="shortcut icon" href="/favicon.ico"');
    expect(html).toContain('rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('content="https://mindsparqeducation.com.np/images/og-mindsparq.png"');
  });

  it('verifies Cloudflare Pages headers configure microphone access and CSP', () => {
    const headers = fs.readFileSync(headersPath, 'utf-8');

    expect(headers).toContain('microphone=(self)');
    expect(headers).toContain('Content-Security-Policy:');
    expect(headers).toContain('/manifest.webmanifest');
    expect(headers).toContain('/favicon.ico');
  });
});
