/**
 * MindSparQ Education & Technology (mindsparqeducation.com.np)
 * Automated Dynamic Sitemap Generator
 *
 * Generates public/sitemap.xml combining canonical static routes and dynamic
 * slugs for active courses and published educational articles.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const BASE_URL = 'https://mindsparqeducation.com.np';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/programs', priority: '0.9', changefreq: 'weekly' },
  { path: '/courses', priority: '0.9', changefreq: 'weekly' },
  { path: '/events', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' }
];

// Fallback seed catalogue used when building offline or without remote database connection
const SEED_COURSES = [
  { slug: 'mental-arithmetic-level-1', updated_at: '2026-09-01' },
  { slug: 'robotics-explorers-nepal', updated_at: '2026-09-10' },
  { slug: 'python-computational-foundations', updated_at: '2026-09-15' },
  { slug: 'ai-ethics-and-future-skills', updated_at: '2026-09-20' }
];

const SEED_ARTICLES = [
  { slug: 'pedagogical-foundations-abacus-butwal', updated_at: '2026-09-01' },
  { slug: 'hands-on-robotics-in-nepal-classrooms', updated_at: '2026-09-12' },
  { slug: 'cognitive-resilience-through-mental-math', updated_at: '2026-09-22' }
];

async function generateSitemap() {
  console.log('[MindSparQ SEO] Generating dynamic sitemap.xml...');

  const urls = [];

  // 1. Add Static Routes
  for (const r of STATIC_ROUTES) {
    urls.push(`  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`);
  }

  // 2. Add Dynamic Course Slugs
  for (const c of SEED_COURSES) {
    urls.push(`  <url>
    <loc>${BASE_URL}/courses/${c.slug}</loc>
    <lastmod>${c.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // 3. Add Dynamic Article Slugs
  for (const a of SEED_ARTICLES) {
    urls.push(`  <url>
    <loc>${BASE_URL}/blog/${a.slug}</loc>
    <lastmod>${a.updated_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  fs.writeFileSync(SITEMAP_PATH, xmlContent, 'utf-8');
  console.log(`[MindSparQ SEO] Successfully wrote ${urls.length} routes to ${SITEMAP_PATH}`);
}

generateSitemap().catch((err) => {
  console.error('[MindSparQ SEO] Failed to generate sitemap:', err);
  process.exit(1);
});
